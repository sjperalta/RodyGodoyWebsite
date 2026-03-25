-- Allow authenticated users to create their own profile row if the signup trigger
-- missed them (e.g. user created before migration, or manual auth import).
-- They cannot set is_admin=true via this path.

grant insert on table public.profiles to authenticated;

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and coalesce(is_admin, false) = false
  );
