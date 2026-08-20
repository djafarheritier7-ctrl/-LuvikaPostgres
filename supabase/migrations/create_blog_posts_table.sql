-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  locale TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS blog_posts_is_published_idx ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts(published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow everyone to read published posts
CREATE POLICY "Allow public read of published posts"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = TRUE);

-- Create policy: Allow admins to manage all posts
CREATE POLICY "Allow admins to manage posts"
  ON public.blog_posts
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert sample blog post
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author,
  category,
  locale,
  is_published
) VALUES (
  'Bienvenue sur le blog LUVIKA',
  'bienvenue-blog-luvika',
  'Découvrez les dernières actualités, tutoriels et conseils pour utiliser LUVIKA au maximum.',
  '<h2>Bienvenue!</h2><p>Ce blog est dédié aux actualités et tutoriels de LUVIKA.</p><p>Restez à l''écoute pour des contenus réguliers!</p>',
  'Équipe LUVIKA',
  'Actualités',
  'fr',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
