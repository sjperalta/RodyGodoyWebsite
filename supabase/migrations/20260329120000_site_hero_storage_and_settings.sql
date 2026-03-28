-- 1) Ensure Storage RLS allows admins to write site/ hero assets (idempotent if 20260326120000 ran).
-- 2) Remove seeded placeholder path that pointed at a non-existent object (home uses bundled video until upload).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_project_images_admin_insert_site'
  ) THEN
    CREATE POLICY "storage_project_images_admin_insert_site"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'project-images' AND public.is_admin() AND name LIKE 'site/%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_project_images_admin_update_site'
  ) THEN
    CREATE POLICY "storage_project_images_admin_update_site"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'project-images' AND public.is_admin() AND name LIKE 'site/%')
      WITH CHECK (bucket_id = 'project-images' AND public.is_admin() AND name LIKE 'site/%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_project_images_admin_delete_site'
  ) THEN
    CREATE POLICY "storage_project_images_admin_delete_site"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'project-images' AND public.is_admin() AND name LIKE 'site/%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_files_admin_insert_site'
  ) THEN
    CREATE POLICY "storage_files_admin_insert_site"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'files' AND public.is_admin() AND name LIKE 'site/%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_files_admin_update_site'
  ) THEN
    CREATE POLICY "storage_files_admin_update_site"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'files' AND public.is_admin() AND name LIKE 'site/%')
      WITH CHECK (bucket_id = 'files' AND public.is_admin() AND name LIKE 'site/%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_files_admin_delete_site'
  ) THEN
    CREATE POLICY "storage_files_admin_delete_site"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'files' AND public.is_admin() AND name LIKE 'site/%');
  END IF;
END $$;

UPDATE public.site_settings
SET hero_background_object_path = ''
WHERE id = 'global'
  AND hero_background_object_path = 'site/hero/airbnb-refugio-perfecto.mp4';
