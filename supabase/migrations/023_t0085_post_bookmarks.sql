-- Community post bookmarks
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS post_bookmarks_user_post_key
  ON public.post_bookmarks (user_id, post_id);

CREATE INDEX IF NOT EXISTS post_bookmarks_post_id_idx
  ON public.post_bookmarks (post_id);

