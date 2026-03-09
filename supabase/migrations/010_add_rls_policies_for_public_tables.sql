-- T-013: Add least-privilege RLS policies for all public tables.
-- Prerequisite: 009_enable_rls_for_public_tables.sql

-- Helper: admin role check from public.users.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'::public."UserRole"
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 1) _SourceToGroup (admin only)
DROP POLICY IF EXISTS "_SourceToGroup_admin_all" ON public."_SourceToGroup";
CREATE POLICY "_SourceToGroup_admin_all"
ON public."_SourceToGroup"
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2) _SourceToQuestion (admin only)
DROP POLICY IF EXISTS "_SourceToQuestion_admin_all" ON public."_SourceToQuestion";
CREATE POLICY "_SourceToQuestion_admin_all"
ON public."_SourceToQuestion"
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3) admin_notes
DROP POLICY IF EXISTS "admin_notes_admin_all" ON public.admin_notes;
CREATE POLICY "admin_notes_admin_all"
ON public.admin_notes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_notes_user_read_own" ON public.admin_notes;
CREATE POLICY "admin_notes_user_read_own"
ON public.admin_notes
FOR SELECT
USING (auth.uid() = user_id);

-- 4) badges
DROP POLICY IF EXISTS "badges_auth_read" ON public.badges;
CREATE POLICY "badges_auth_read"
ON public.badges
FOR SELECT
TO authenticated
USING (true);

-- 5) blog_posts
DROP POLICY IF EXISTS "blog_posts_public_read_published" ON public.blog_posts;
CREATE POLICY "blog_posts_public_read_published"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_all"
ON public.blog_posts
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6) chapter_prerequisites
DROP POLICY IF EXISTS "chapter_prerequisites_auth_read" ON public.chapter_prerequisites;
CREATE POLICY "chapter_prerequisites_auth_read"
ON public.chapter_prerequisites
FOR SELECT
TO authenticated
USING (true);

-- 7) chapters
DROP POLICY IF EXISTS "chapters_auth_read" ON public.chapters;
CREATE POLICY "chapters_auth_read"
ON public.chapters
FOR SELECT
TO authenticated
USING (true);

-- 8) comments
DROP POLICY IF EXISTS "comments_auth_read" ON public.comments;
CREATE POLICY "comments_auth_read"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_update_delete_own_or_admin" ON public.comments;
CREATE POLICY "comments_update_delete_own_or_admin"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin())
WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "comments_delete_own_or_admin" ON public.comments;
CREATE POLICY "comments_delete_own_or_admin"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

-- 9) contact_submissions
DROP POLICY IF EXISTS "contact_submissions_public_insert" ON public.contact_submissions;
CREATE POLICY "contact_submissions_public_insert"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "contact_submissions_admin_read_write" ON public.contact_submissions;
CREATE POLICY "contact_submissions_admin_read_write"
ON public.contact_submissions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 10) content_review_logs
DROP POLICY IF EXISTS "content_review_logs_admin_all" ON public.content_review_logs;
CREATE POLICY "content_review_logs_admin_all"
ON public.content_review_logs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11) daily_tasks
DROP POLICY IF EXISTS "daily_tasks_read_own" ON public.daily_tasks;
CREATE POLICY "daily_tasks_read_own"
ON public.daily_tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_tasks_update_own" ON public.daily_tasks;
CREATE POLICY "daily_tasks_update_own"
ON public.daily_tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_tasks_admin_all" ON public.daily_tasks;
CREATE POLICY "daily_tasks_admin_all"
ON public.daily_tasks
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 12) error_book
DROP POLICY IF EXISTS "error_book_own_all" ON public.error_book;
CREATE POLICY "error_book_own_all"
ON public.error_book
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 13) exam_records
DROP POLICY IF EXISTS "exam_records_own_all" ON public.exam_records;
CREATE POLICY "exam_records_own_all"
ON public.exam_records
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "exam_records_admin_all" ON public.exam_records;
CREATE POLICY "exam_records_admin_all"
ON public.exam_records
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 14) impersonation_sessions
DROP POLICY IF EXISTS "impersonation_sessions_admin_all" ON public.impersonation_sessions;
CREATE POLICY "impersonation_sessions_admin_all"
ON public.impersonation_sessions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "impersonation_sessions_target_read" ON public.impersonation_sessions;
CREATE POLICY "impersonation_sessions_target_read"
ON public.impersonation_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = target_user_id);

-- 15) invite_codes
DROP POLICY IF EXISTS "invite_codes_own_student_all" ON public.invite_codes;
CREATE POLICY "invite_codes_own_student_all"
ON public.invite_codes
FOR ALL
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 16) knowledge_points
DROP POLICY IF EXISTS "knowledge_points_auth_read" ON public.knowledge_points;
CREATE POLICY "knowledge_points_auth_read"
ON public.knowledge_points
FOR SELECT
TO authenticated
USING (true);

-- 17) leaderboard_entries
DROP POLICY IF EXISTS "leaderboard_entries_auth_read" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries_auth_read"
ON public.leaderboard_entries
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "leaderboard_entries_admin_all" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries_admin_all"
ON public.leaderboard_entries
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 18) lessons
DROP POLICY IF EXISTS "lessons_auth_read" ON public.lessons;
CREATE POLICY "lessons_auth_read"
ON public.lessons
FOR SELECT
TO authenticated
USING (true);

-- 19) notification_preferences
DROP POLICY IF EXISTS "notification_preferences_own_all" ON public.notification_preferences;
CREATE POLICY "notification_preferences_own_all"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 20) notifications
DROP POLICY IF EXISTS "notifications_own_all" ON public.notifications;
CREATE POLICY "notifications_own_all"
ON public.notifications
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all"
ON public.notifications
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 21) parent_students
DROP POLICY IF EXISTS "parent_students_select_related" ON public.parent_students;
CREATE POLICY "parent_students_select_related"
ON public.parent_students
FOR SELECT
TO authenticated
USING (auth.uid() = parent_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "parent_students_insert_parent" ON public.parent_students;
CREATE POLICY "parent_students_insert_parent"
ON public.parent_students
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "parent_students_delete_parent_or_admin" ON public.parent_students;
CREATE POLICY "parent_students_delete_parent_or_admin"
ON public.parent_students
FOR DELETE
TO authenticated
USING (auth.uid() = parent_id OR public.is_admin());

-- 22) post_likes
DROP POLICY IF EXISTS "post_likes_own_all" ON public.post_likes;
CREATE POLICY "post_likes_own_all"
ON public.post_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 23) posts
DROP POLICY IF EXISTS "posts_auth_read" ON public.posts;
CREATE POLICY "posts_auth_read"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update_delete_own_or_admin" ON public.posts;
CREATE POLICY "posts_update_delete_own_or_admin"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin())
WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "posts_delete_own_or_admin" ON public.posts;
CREATE POLICY "posts_delete_own_or_admin"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

-- 24) question_groups
DROP POLICY IF EXISTS "question_groups_auth_read" ON public.question_groups;
CREATE POLICY "question_groups_auth_read"
ON public.question_groups
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "question_groups_admin_all" ON public.question_groups;
CREATE POLICY "question_groups_admin_all"
ON public.question_groups
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 25) question_kp_relations
DROP POLICY IF EXISTS "question_kp_relations_auth_read" ON public.question_kp_relations;
CREATE POLICY "question_kp_relations_auth_read"
ON public.question_kp_relations
FOR SELECT
TO authenticated
USING (true);

-- 26) question_reports
DROP POLICY IF EXISTS "question_reports_select_own_or_admin" ON public.question_reports;
CREATE POLICY "question_reports_select_own_or_admin"
ON public.question_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reported_by OR public.is_admin());

DROP POLICY IF EXISTS "question_reports_insert_own" ON public.question_reports;
CREATE POLICY "question_reports_insert_own"
ON public.question_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

DROP POLICY IF EXISTS "question_reports_admin_manage" ON public.question_reports;
CREATE POLICY "question_reports_admin_manage"
ON public.question_reports
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "question_reports_admin_delete" ON public.question_reports;
CREATE POLICY "question_reports_admin_delete"
ON public.question_reports
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 27) question_tag_relations
DROP POLICY IF EXISTS "question_tag_relations_auth_read" ON public.question_tag_relations;
CREATE POLICY "question_tag_relations_auth_read"
ON public.question_tag_relations
FOR SELECT
TO authenticated
USING (true);

-- 28) question_tags
DROP POLICY IF EXISTS "question_tags_auth_read" ON public.question_tags;
CREATE POLICY "question_tags_auth_read"
ON public.question_tags
FOR SELECT
TO authenticated
USING (true);

-- 29) questions
DROP POLICY IF EXISTS "questions_auth_read" ON public.questions;
CREATE POLICY "questions_auth_read"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "questions_admin_all" ON public.questions;
CREATE POLICY "questions_admin_all"
ON public.questions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 30) referrals
DROP POLICY IF EXISTS "referrals_select_related_or_admin" ON public.referrals;
CREATE POLICY "referrals_select_related_or_admin"
ON public.referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referee_id OR public.is_admin());

DROP POLICY IF EXISTS "referrals_insert_referee" ON public.referrals;
CREATE POLICY "referrals_insert_referee"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referee_id);

DROP POLICY IF EXISTS "referrals_admin_update_delete" ON public.referrals;
CREATE POLICY "referrals_admin_update_delete"
ON public.referrals
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "referrals_admin_delete" ON public.referrals;
CREATE POLICY "referrals_admin_delete"
ON public.referrals
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 31) security_logs
DROP POLICY IF EXISTS "security_logs_select_own_or_admin" ON public.security_logs;
CREATE POLICY "security_logs_select_own_or_admin"
ON public.security_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "security_logs_insert_own_or_admin" ON public.security_logs;
CREATE POLICY "security_logs_insert_own_or_admin"
ON public.security_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "security_logs_admin_update_delete" ON public.security_logs;
CREATE POLICY "security_logs_admin_update_delete"
ON public.security_logs
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "security_logs_admin_delete" ON public.security_logs;
CREATE POLICY "security_logs_admin_delete"
ON public.security_logs
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 32) source_files
DROP POLICY IF EXISTS "source_files_admin_all" ON public.source_files;
CREATE POLICY "source_files_admin_all"
ON public.source_files
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 33) subjects
DROP POLICY IF EXISTS "subjects_auth_read" ON public.subjects;
CREATE POLICY "subjects_auth_read"
ON public.subjects
FOR SELECT
TO authenticated
USING (true);

-- 34) subscribers
DROP POLICY IF EXISTS "subscribers_public_insert" ON public.subscribers;
CREATE POLICY "subscribers_public_insert"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "subscribers_admin_read_manage" ON public.subscribers;
CREATE POLICY "subscribers_admin_read_manage"
ON public.subscribers
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 35) user_attempts
DROP POLICY IF EXISTS "user_attempts_own_all" ON public.user_attempts;
CREATE POLICY "user_attempts_own_all"
ON public.user_attempts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 36) user_badges
DROP POLICY IF EXISTS "user_badges_select_own_or_admin" ON public.user_badges;
CREATE POLICY "user_badges_select_own_or_admin"
ON public.user_badges
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_badges_admin_manage" ON public.user_badges;
CREATE POLICY "user_badges_admin_manage"
ON public.user_badges
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 37) user_feedbacks
DROP POLICY IF EXISTS "user_feedbacks_select_own_or_admin" ON public.user_feedbacks;
CREATE POLICY "user_feedbacks_select_own_or_admin"
ON public.user_feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_feedbacks_insert_own" ON public.user_feedbacks;
CREATE POLICY "user_feedbacks_insert_own"
ON public.user_feedbacks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_feedbacks_update_own_or_admin" ON public.user_feedbacks;
CREATE POLICY "user_feedbacks_update_own_or_admin"
ON public.user_feedbacks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_feedbacks_delete_admin" ON public.user_feedbacks;
CREATE POLICY "user_feedbacks_delete_admin"
ON public.user_feedbacks
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 38) user_permission_overrides
DROP POLICY IF EXISTS "user_permission_overrides_admin_all" ON public.user_permission_overrides;
CREATE POLICY "user_permission_overrides_admin_all"
ON public.user_permission_overrides
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_permission_overrides_user_read_own" ON public.user_permission_overrides;
CREATE POLICY "user_permission_overrides_user_read_own"
ON public.user_permission_overrides
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 39) user_progress
DROP POLICY IF EXISTS "user_progress_own_all" ON public.user_progress;
CREATE POLICY "user_progress_own_all"
ON public.user_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 40) user_settings
DROP POLICY IF EXISTS "user_settings_own_all" ON public.user_settings;
CREATE POLICY "user_settings_own_all"
ON public.user_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 41) users
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_insert_self_or_admin" ON public.users;
CREATE POLICY "users_insert_self_or_admin"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_update_self_or_admin" ON public.users;
CREATE POLICY "users_update_self_or_admin"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
CREATE POLICY "users_delete_admin"
ON public.users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 42) voucher_codes
DROP POLICY IF EXISTS "voucher_codes_auth_read_active" ON public.voucher_codes;
CREATE POLICY "voucher_codes_auth_read_active"
ON public.voucher_codes
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (valid_from IS NULL OR valid_from <= now())
  AND (valid_to IS NULL OR valid_to >= now())
);

DROP POLICY IF EXISTS "voucher_codes_admin_all" ON public.voucher_codes;
CREATE POLICY "voucher_codes_admin_all"
ON public.voucher_codes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 43) voucher_redemptions
DROP POLICY IF EXISTS "voucher_redemptions_select_own_or_admin" ON public.voucher_redemptions;
CREATE POLICY "voucher_redemptions_select_own_or_admin"
ON public.voucher_redemptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "voucher_redemptions_insert_own" ON public.voucher_redemptions;
CREATE POLICY "voucher_redemptions_insert_own"
ON public.voucher_redemptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "voucher_redemptions_admin_update_delete" ON public.voucher_redemptions;
CREATE POLICY "voucher_redemptions_admin_update_delete"
ON public.voucher_redemptions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "voucher_redemptions_admin_delete" ON public.voucher_redemptions;
CREATE POLICY "voucher_redemptions_admin_delete"
ON public.voucher_redemptions
FOR DELETE
TO authenticated
USING (public.is_admin());
