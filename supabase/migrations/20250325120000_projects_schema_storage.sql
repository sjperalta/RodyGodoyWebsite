-- Extensions (gen_random_uuid)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (admin flag; is_admin only promotable via service role / SQL)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- is_admin() for RLS and storage (SECURITY DEFINER bypasses profiles RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Project categories
-- ---------------------------------------------------------------------------
create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  filter_key text not null unique,
  label jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_categories_sort_order_idx on public.project_categories (sort_order);

alter table public.project_categories enable row level security;

drop policy if exists "project_categories_select_all" on public.project_categories;
create policy "project_categories_select_all"
  on public.project_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "project_categories_insert_admin" on public.project_categories;
create policy "project_categories_insert_admin"
  on public.project_categories
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "project_categories_update_admin" on public.project_categories;
create policy "project_categories_update_admin"
  on public.project_categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "project_categories_delete_admin" on public.project_categories;
create policy "project_categories_delete_admin"
  on public.project_categories
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.project_categories (id) on delete restrict,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  location jsonb not null default '{}'::jsonb,
  area jsonb not null default '{}'::jsonb,
  year text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_category_id_idx on public.projects (category_id);
create index if not exists projects_published_sort_idx on public.projects (published, sort_order);

alter table public.projects enable row level security;

drop policy if exists "projects_select_published" on public.projects;
create policy "projects_select_published"
  on public.projects
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "projects_select_admin" on public.projects;
create policy "projects_select_admin"
  on public.projects
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin"
  on public.projects
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "projects_update_admin" on public.projects;
create policy "projects_update_admin"
  on public.projects
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin"
  on public.projects
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Project media (images in project-images bucket, video in files bucket)
-- ---------------------------------------------------------------------------
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  object_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_id_idx on public.project_media (project_id);
create index if not exists project_media_project_sort_idx on public.project_media (project_id, sort_order);

alter table public.project_media enable row level security;

drop policy if exists "project_media_select_published" on public.project_media;
create policy "project_media_select_published"
  on public.project_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_media.project_id
        and p.published = true
    )
  );

drop policy if exists "project_media_select_admin" on public.project_media;
create policy "project_media_select_admin"
  on public.project_media
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "project_media_insert_admin" on public.project_media;
create policy "project_media_insert_admin"
  on public.project_media
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "project_media_update_admin" on public.project_media;
create policy "project_media_update_admin"
  on public.project_media
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "project_media_delete_admin" on public.project_media;
create policy "project_media_delete_admin"
  on public.project_media
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets (public read for portfolio + video playback)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'project-images',
    'project-images',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'files',
    'files',
    true,
    524288000,
    array['video/mp4', 'video/webm', 'video/quicktime']::text[]
  )
on conflict (id) do nothing;

-- Storage policies (drop first so re-push succeeds if objects already existed)
drop policy if exists "storage_project_images_public_read" on storage.objects;
drop policy if exists "storage_files_public_read" on storage.objects;
drop policy if exists "storage_project_images_admin_insert" on storage.objects;
drop policy if exists "storage_project_images_admin_update" on storage.objects;
drop policy if exists "storage_project_images_admin_delete" on storage.objects;
drop policy if exists "storage_files_admin_insert" on storage.objects;
drop policy if exists "storage_files_admin_update" on storage.objects;
drop policy if exists "storage_files_admin_delete" on storage.objects;

-- Public read
create policy "storage_project_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "storage_files_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'files');

-- Admin write under projects/
create policy "storage_project_images_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'projects/%'
  );

create policy "storage_project_images_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'projects/%'
  )
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'projects/%'
  );

create policy "storage_project_images_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'projects/%'
  );

create policy "storage_files_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'projects/%'
  );

create policy "storage_files_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'projects/%'
  )
  with check (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'projects/%'
  );

create policy "storage_files_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'projects/%'
  );

-- ---------------------------------------------------------------------------
-- API grants (PostgREST)
-- ---------------------------------------------------------------------------
grant select on table public.project_categories to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant select on table public.project_media to anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert, update, delete on table public.project_categories to authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant insert, update, delete on table public.project_media to authenticated;
