/**
 * One-time import of src/data/projects_index.json + public/projects_assets into Supabase.
 *
 * Requires:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (never expose in the browser; local/CI only)
 *
 * Run from repo root (reads `.env` automatically):
 *   node scripts/seed-projects.mjs
 *
 * Prerequisite: apply supabase/migrations/20250325120000_projects_schema_storage.sql in the Supabase SQL Editor (or `supabase db push`).
 *
 * Clears existing project_media, projects, project_categories (in that order) then re-seeds.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/** Load project root `.env` into process.env (Node does not read .env by default). */
function loadDotEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
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
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnv();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing env: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_SERVICE_ROLE_KEY).\n' +
      'Add them to .env in the project root (the script loads .env automatically), or export them in your shell.\n' +
      'Get the service role key from Supabase Dashboard → Project Settings → API (never commit it or expose it in the browser).'
  );
  process.exit(1);
}

/** Decode JWT payload (no verify) to ensure we use service_role — anon key hits RLS and fails with 42501. */
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

const jwt = jwtPayload(serviceKey);
if (!jwt || jwt.role !== 'service_role') {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY must be the long "service_role" secret from Supabase → Project Settings → API.\n' +
      'The anon / "publishable" / default key has role "anon" and cannot bypass RLS (inserts will fail with 42501).\n' +
      `Decoded JWT role from your key: ${jwt?.role ?? 'invalid token'}`
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CATEGORY_FROM_EN = {
  Commercial: { key: 'COMMERCIAL', sort: 1 },
  Residential: { key: 'RESIDENTIAL', sort: 0 },
  'Interior Design': { key: 'INTERIOR DESIGN', sort: 2 },
};

const projectsJson = JSON.parse(
  readFileSync(join(root, 'src', 'data', 'projects_index.json'), 'utf8')
);

// Seed can read assets from `public/` (preferred) or `dist/` (some repos keep
// generated assets there). We also do a small fuzzy fallback for mismatched
// filename variants (accents/emoji differences) based on trailing index.
const assetsRoots = [join(root, 'public', 'projects_assets'), join(root, 'dist', 'projects_assets')];
const SKIP_MISSING_ASSETS = process.env.SKIP_MISSING_ASSETS !== 'false';

function listWebpFiles(dirPath) {
  const entries = [];
  const dir = readdirSync(dirPath, { withFileTypes: true });
  for (const e of dir) {
    if (e.isFile() && e.name.toLowerCase().endsWith('.webp')) {
      entries.push(e.name);
    }
  }
  return entries;
}

function normalizeForCompare(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function resolveAssetPathFuzzyByTrailingIndex(rel) {
  const parts = rel.split('/');
  const requestedFilename = parts[parts.length - 1] || '';
  const requestedDirRel = parts.slice(0, -1).join('/');

  const m = requestedFilename.match(/(\d+)\D*\.webp$/i);
  const requestedNum = m?.[1];
  if (!requestedNum) return null;

  const requestedNorm = normalizeForCompare(requestedFilename);

  for (const base of assetsRoots) {
    const dirPath = join(base, requestedDirRel);
    if (!existsSync(dirPath)) continue;

    const files = listWebpFiles(dirPath);
    const candidates = files
      .map((name) => {
        const mm = name.match(/(\d+)\D*\.webp$/i);
        return mm?.[1] === String(requestedNum)
          ? { name, path: join(dirPath, name) }
          : null;
      })
      .filter(Boolean);

    if (candidates.length === 0) continue;
    if (candidates.length === 1) return candidates[0].path;

    // If multiple candidates share the same trailing index, prefer the one
    // whose normalized name most closely contains the requested normalized string.
    const ranked = candidates
      .map((c) => {
        const norm = normalizeForCompare(c.name);
        return { path: c.path, score: norm.includes(requestedNorm) ? 2 : 0 };
      })
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.path ?? candidates[0].path;
  }

  return null;
}

function readAssetBuffer(rel) {
  // Exact match first.
  let exact = null;
  for (const base of assetsRoots) {
    const p = join(base, rel);
    if (existsSync(p)) {
      exact = p;
      break;
    }
  }

  const p = exact || resolveAssetPathFuzzyByTrailingIndex(rel);
  if (!p) {
    if (!SKIP_MISSING_ASSETS) {
      throw new Error(`Missing asset for '${rel}' (no match in public or dist assets).`);
    }
    console.warn(`[seed] Missing asset '${rel}', skipping media upload.`);
    return null;
  }
  return readFileSync(p);
}

async function main() {
  const { error: delMedia } = await supabase.from('project_media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delMedia) throw delMedia;

  const { error: delProj } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delProj) throw delProj;

  const { error: delCat } = await supabase.from('project_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCat) throw delCat;

  const uniqueCats = new Map();
  for (const p of projectsJson) {
    const en = p.category?.en;
    if (!en || !CATEGORY_FROM_EN[en]) {
      throw new Error(`Unknown category.en: ${en}`);
    }
    const cfg = CATEGORY_FROM_EN[en];
    if (!uniqueCats.has(cfg.key)) {
      uniqueCats.set(cfg.key, {
        filter_key: cfg.key,
        label: { es: p.category.es, en: p.category.en },
        sort_order: cfg.sort,
      });
    }
  }

  const catRows = [...uniqueCats.values()].sort((a, b) => a.sort_order - b.sort_order);
  const { data: insertedCats, error: catErr } = await supabase.from('project_categories').insert(catRows).select('id, filter_key');
  if (catErr) throw catErr;

  const catIdByKey = Object.fromEntries(insertedCats.map((c) => [c.filter_key, c.id]));

  let order = 0;
  for (const p of projectsJson) {
    const en = p.category.en;
    const filterKey = CATEGORY_FROM_EN[en].key;
    const category_id = catIdByKey[filterKey];

    const { data: proj, error: insErr } = await supabase
      .from('projects')
      .insert({
        slug: p.id,
        category_id,
        name: p.name,
        description: p.description,
        location: p.location,
        area: p.area,
        year: p.year,
        published: true,
        sort_order: order++,
      })
      .select('id')
      .single();
    if (insErr) throw insErr;

    const projectId = proj.id;
    let mediaOrder = 0;

    for (const rel of p.files || []) {
      const isVideo = rel.toLowerCase().endsWith('.mp4');
      const bucket = isVideo ? 'files' : 'project-images';
      const destPath = `projects/${projectId}/${rel.replace(/\//g, '_')}`;
      const body = readAssetBuffer(rel);
      const ext = rel.split('.').pop().toLowerCase();
      const contentType =
        ext === 'mp4'
          ? 'video/mp4'
          : ext === 'webp'
            ? 'image/webp'
            : ext === 'png'
              ? 'image/png'
              : ext === 'jpg' || ext === 'jpeg'
                ? 'image/jpeg'
                : 'application/octet-stream';

      const { error: upErr } = await supabase.storage.from(bucket).upload(destPath, body, {
        contentType,
        upsert: true,
      });
      if (upErr) throw upErr;

      const { error: mErr } = await supabase.from('project_media').insert({
        project_id: projectId,
        kind: isVideo ? 'video' : 'image',
        object_path: destPath,
        sort_order: mediaOrder++,
      });
      if (mErr) throw mErr;
    }
  }

  console.log('Seed completed:', projectsJson.length, 'projects');
}

function explainSchemaError(err) {
  const code = err?.code;
  const msg = String(err?.message || err || '');
  if (
    code === 'PGRST205' ||
    msg.includes('schema cache') ||
    msg.includes('Could not find the table')
  ) {
    console.error(`
PostgREST cannot see your tables (e.g. project_media). Apply the migration first:

  1. Supabase Dashboard → SQL Editor → New query
  2. Paste the full file: supabase/migrations/20250325120000_projects_schema_storage.sql
  3. Run it. Fix any errors (e.g. if buckets/policies already exist, edit or run in parts).
  4. Wait ~10–30s for the API schema cache, then run this seed again.

Alternatively: supabase link && supabase db push (if you use the Supabase CLI).
`);
  }
  if (code === '42501' || msg.includes('row-level security')) {
    console.error(`
RLS blocked the operation. This script must use the service_role API key (Dashboard → Settings → API → service_role).
If PowerShell already has SUPABASE_SERVICE_ROLE_KEY set to the anon key, it overrides .env — run:
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
then try again.
`);
  }
}

main().catch((e) => {
  explainSchemaError(e);
  console.error(e);
  process.exit(1);
});
