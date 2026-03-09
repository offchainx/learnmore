-- T-014: 统一 storage.objects policy 命名（不改权限语义）

DO $$
BEGIN
  -- avatars
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Avatar images are publicly accessible.'
  ) THEN
    ALTER POLICY "Avatar images are publicly accessible."
      ON storage.objects
      RENAME TO "storage_avatars_select_public";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can upload their own avatar.'
  ) THEN
    ALTER POLICY "Users can upload their own avatar."
      ON storage.objects
      RENAME TO "storage_avatars_insert_authenticated";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can update their own avatar.'
  ) THEN
    ALTER POLICY "Users can update their own avatar."
      ON storage.objects
      RENAME TO "storage_avatars_update_authenticated";
  END IF;

  -- community-posts
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow authenticated uploads 1glw6b3_0'
  ) THEN
    ALTER POLICY "Allow authenticated uploads 1glw6b3_0"
      ON storage.objects
      RENAME TO "storage_community_posts_insert_authenticated";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow authenticated uploads 1glw6b3_1'
  ) THEN
    ALTER POLICY "Allow authenticated uploads 1glw6b3_1"
      ON storage.objects
      RENAME TO "storage_community_posts_update_authenticated";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow authenticated uploads 1glw6b3_2'
  ) THEN
    ALTER POLICY "Allow authenticated uploads 1glw6b3_2"
      ON storage.objects
      RENAME TO "storage_community_posts_select_authenticated";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow authenticated uploads 1glw6b3_3'
  ) THEN
    ALTER POLICY "Allow authenticated uploads 1glw6b3_3"
      ON storage.objects
      RENAME TO "storage_community_posts_delete_authenticated";
  END IF;

  -- source-files
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read access'
  ) THEN
    ALTER POLICY "Public read access"
      ON storage.objects
      RENAME TO "storage_source_files_select_public";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow admin and teacher upload'
  ) THEN
    ALTER POLICY "Allow admin and teacher upload"
      ON storage.objects
      RENAME TO "storage_source_files_insert_admin_teacher";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow admin delete'
  ) THEN
    ALTER POLICY "Allow admin delete"
      ON storage.objects
      RENAME TO "storage_source_files_delete_admin";
  END IF;

  -- videos
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload videos.'
  ) THEN
    ALTER POLICY "Authenticated users can upload videos."
      ON storage.objects
      RENAME TO "storage_videos_insert_authenticated";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can view videos.'
  ) THEN
    ALTER POLICY "Authenticated users can view videos."
      ON storage.objects
      RENAME TO "storage_videos_select_authenticated";
  END IF;
END;
$$;
