-- ---------------------------------------------------------------------------
-- Site settings (single-row: id='global')
-- Public read for marketing site, admin-only write.
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  id text primary key,
  hero_title jsonb not null default '{}'::jsonb,
  hero_subtitle jsonb not null default '{}'::jsonb,
  hero_cta jsonb not null default '{}'::jsonb,
  hero_background_type text not null default 'video' check (hero_background_type in ('video', 'image')),
  hero_background_object_path text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_all" on public.site_settings;
create policy "site_settings_select_all"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_insert_admin" on public.site_settings;
create policy "site_settings_insert_admin"
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin"
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_settings_delete_admin" on public.site_settings;
create policy "site_settings_delete_admin"
  on public.site_settings
  for delete
  to authenticated
  using (public.is_admin());

insert into public.site_settings (id)
values ('global')
on conflict (id) do nothing;

grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

-- ---------------------------------------------------------------------------
-- Storage policies for site assets under site/
-- Reuse existing buckets: project-images (images) and files (videos).
-- ---------------------------------------------------------------------------

drop policy if exists "storage_project_images_admin_insert_site" on storage.objects;
drop policy if exists "storage_project_images_admin_update_site" on storage.objects;
drop policy if exists "storage_project_images_admin_delete_site" on storage.objects;
drop policy if exists "storage_files_admin_insert_site" on storage.objects;
drop policy if exists "storage_files_admin_update_site" on storage.objects;
drop policy if exists "storage_files_admin_delete_site" on storage.objects;

create policy "storage_project_images_admin_insert_site"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'site/%'
  );

create policy "storage_project_images_admin_update_site"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'site/%'
  )
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'site/%'
  );

create policy "storage_project_images_admin_delete_site"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
    and name like 'site/%'
  );

create policy "storage_files_admin_insert_site"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'site/%'
  );

create policy "storage_files_admin_update_site"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'site/%'
  )
  with check (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'site/%'
  );

create policy "storage_files_admin_delete_site"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'files'
    and public.is_admin()
    and name like 'site/%'
  );

