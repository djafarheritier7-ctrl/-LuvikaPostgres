// src/types/blog.ts
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string; // UUID de l'utilisateur
  author: string; // Nom de l'auteur (résolu via jointure ou fetch séparé)
  category: string;
  tags?: string[];
  featured_image_url?: string;
  is_published: boolean;
  published_at?: string; // ISO String
  created_at: string; // ISO String
  updated_at: string; // ISO String
};