/**
 * Create or promote a global admin (public.profiles.is_admin = true).
 *
 * Loads `.env` then `.env.development`.
 *
 * **Local** (`127.0.0.1` / `localhost` API URL): writes directly to Postgres (bypasses GoTrue
 * Admin JWT; newer local stacks often reject HS256 `service_role` tokens with `bad_jwt`).
 * Connection: `SUPABASE_DB_URL` / `DATABASE_URL` / `DB_URL`, or default
 * `postgresql://postgres:postgres@<host>:54322/postgres` derived from your API URL.
 *
 * **Remote**: Auth Admin API + JWT `service_role` (SUPABASE_AUTH_SERVICE_ROLE_JWT or
 * SUPABASE_SERVICE_ROLE_KEY as eyJ...).
 *
 *   SEED_ADMIN_PASSWORD=... npm run seed:admin
 *
 * Optional: SEED_ADMIN_EMAIL (default: sergio.peralta@omegatech.dev)
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DEFAULT_ADMIN_EMAIL = 'sergio.peralta@omegatech.dev';

function loadDotEnv() {
  const names = ['.env', '.env.development'];
  for (const name of names) {
    const envPath = join(root, name);
    if (!existsSync(envPath)) continue;
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

function isLocalSupabaseUrl(u) {
  if (!u) return false;
  try {
    const { hostname } = new URL(u);
    return hostname === '127.0.0.1' || hostname === 'localhost';
  } catch {
    return false;
  }
}

function looksLikeJwt(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function jwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  try {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function isDuplicateUserError(err) {
  const msg = String(err?.message || '').toLowerCase();
  return (
    msg.includes('already been registered') ||
    msg.includes('already registered') ||
    msg.includes('duplicate') ||
    err?.status === 422
  );
}

async function findUserIdByEmail(sb, email) {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

function envNonEmpty(name) {
  const v = process.env[name];
  if (v === undefined || v === null) return '';
  const t = String(v).trim();
  return t;
}

/** Local Postgres URL: explicit env, or default from API host (Supabase CLI default port 54322). */
function resolveLocalDbUrl(apiUrl) {
  const explicit =
    envNonEmpty('SUPABASE_DB_URL') || envNonEmpty('DATABASE_URL') || envNonEmpty('DB_URL');
  if (explicit) return explicit;
  try {
    const u = new URL(apiUrl);
    const port = envNonEmpty('SUPABASE_DB_PORT') || '54322';
    const user = envNonEmpty('SUPABASE_DB_USER') || 'postgres';
    const pass = envNonEmpty('SUPABASE_DB_PASSWORD') || 'postgres';
    const dbname = envNonEmpty('SUPABASE_DB_NAME') || 'postgres';
    const enc = encodeURIComponent;
    return `postgresql://${enc(user)}:${enc(pass)}@${u.hostname}:${port}/${dbname}`;
  } catch {
    return '';
  }
}

async function seedAdminPostgres({ email, password, dbUrl }) {
  const { Client } = pg;
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const emailNorm = email.trim().toLowerCase();

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1',
      [emailNorm]
    );

    let userId = existing.rows[0]?.id;

    if (!userId) {
      const ins = await client.query(
        `INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          "role",
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          recovery_token,
          email_change,
          email_change_token_new
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          timezone('utc', now()),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          timezone('utc', now()),
          timezone('utc', now()),
          '',
          '',
          '',
          ''
        )
        RETURNING id`,
        [emailNorm, password]
      );
      userId = ins.rows[0].id;
      console.log('[seed:admin] Created auth user (Postgres):', emailNorm);

      const idCheck = await client.query(
        `SELECT 1 FROM auth.identities WHERE user_id = $1 AND provider = 'email' LIMIT 1`,
        [userId]
      );
      if (idCheck.rowCount === 0) {
        const identityData = JSON.stringify({
          sub: String(userId),
          email: emailNorm,
          email_verified: true,
          phone_verified: false,
        });
        await client.query(
          `INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2::jsonb,
            'email',
            $3,
            timezone('utc', now()),
            timezone('utc', now()),
            timezone('utc', now())
          )`,
          [userId, identityData, emailNorm]
        );
      }
    } else {
      console.log('[seed:admin] User already exists, promoting to admin (Postgres):', emailNorm);
    }

    await client.query(
      `INSERT INTO public.profiles (id, is_admin)
       VALUES ($1, true)
       ON CONFLICT (id) DO UPDATE SET is_admin = true`,
      [userId]
    );

    await client.query('COMMIT');
    console.log('[seed:admin] profiles.is_admin = true for', emailNorm, '(' + userId + ')');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

loadDotEnv();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const email = (process.env.SEED_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
const password = process.env.SEED_ADMIN_PASSWORD;

if (!url) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL.');
  process.exit(1);
}

if (!password) {
  console.error(
    'Set SEED_ADMIN_PASSWORD in the environment (e.g. in .env.development).\n' +
      'Example: SEED_ADMIN_PASSWORD=your-secure-password npm run seed:admin'
  );
  process.exit(1);
}

async function main() {
  if (isLocalSupabaseUrl(url)) {
    const dbUrl = resolveLocalDbUrl(url);
    if (!dbUrl) {
      console.error('Could not build local Postgres URL. Set DB_URL or SUPABASE_DB_URL.');
      process.exit(1);
    }
    console.log('[seed:admin] Local API: using direct Postgres (GoTrue Admin JWT skipped).');
    await seedAdminPostgres({ email, password, dbUrl });
    return;
  }

  const rawServiceKey =
    envNonEmpty('SUPABASE_AUTH_SERVICE_ROLE_JWT') ||
    envNonEmpty('SUPABASE_SERVICE_ROLE_KEY') ||
    envNonEmpty('VITE_SUPABASE_SERVICE_ROLE_KEY');

  if (!rawServiceKey) {
    console.error(
      'Remote: set SUPABASE_AUTH_SERVICE_ROLE_JWT or SUPABASE_SERVICE_ROLE_KEY (service_role JWT, eyJ...).'
    );
    process.exit(1);
  }

  if (!looksLikeJwt(rawServiceKey)) {
    console.error(
      'Remote Auth Admin requires a JWT service_role key (three segments). sb_secret_... is not valid here.'
    );
    process.exit(1);
  }

  const jwt = jwtPayload(rawServiceKey);
  if (!jwt || jwt.role !== 'service_role') {
    console.error(
      'Remote: JWT must have role service_role.\n' + `Decoded role: ${jwt?.role ?? 'invalid token'}`
    );
    process.exit(1);
  }

  const supabase = createClient(url, rawServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userId;

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!createErr && created?.user?.id) {
    userId = created.user.id;
    console.log('[seed:admin] Created auth user:', email);
  } else if (createErr && isDuplicateUserError(createErr)) {
    userId = await findUserIdByEmail(supabase, email);
    if (!userId) throw createErr;
    console.log('[seed:admin] User already exists, promoting to admin:', email);
  } else {
    throw createErr || new Error('createUser returned no user');
  }

  const { error: profErr } = await supabase.from('profiles').upsert(
    { id: userId, is_admin: true },
    { onConflict: 'id' }
  );
  if (profErr) throw profErr;

  console.log('[seed:admin] profiles.is_admin = true for', email, '(' + userId + ')');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
