# 📝 Correction Blog - Table `blog_posts` Manquante

## 🎯 Problème identifié

La table `blog_posts` n'existe pas dans Supabase, ce qui provoque l'erreur:
```
Error: column blog_posts.is_published does not exist
```

## ✅ Solution

### Étape 1: Exécuter la migration

**Option A: Via Supabase CLI** (recommandé)
```bash
cd supabase
supabase migration up
```

**Option B: Via Supabase Dashboard**
1. Allez sur https://supabase.com/dashboard
2. Cliquez sur votre projet
3. Allez dans **SQL Editor**
4. Copiez/collez le contenu de `supabase/migrations/create_blog_posts_table.sql`
5. Exécutez le script

### Étape 2: Tester

```bash
npm run dev
# Puis visitez http://localhost:3000/blog
```

## 📊 Structure de la table

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID unique |
| `title` | TEXT | Titre de l'article |
| `slug` | TEXT | URL-friendly slug |
| `excerpt` | TEXT | Résumé court |
| `content` | TEXT | Contenu HTML |
| `author` | TEXT | Auteur |
| `category` | TEXT | Catégorie |
| `published_at` | TIMESTAMP | Date de publication |
| `is_published` | BOOLEAN | Publié ou non |
| `locale` | TEXT | Langue (fr, en, etc) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Dernière modification |

## 🔒 Sécurité RLS

- ✅ Les posts publiés sont visibles par tous
- ✅ Seuls les admins peuvent modifier les posts
- ✅ Les permissions sont gérées via RLS

## 📝 Ajouter un nouvel article

### Via Supabase Dashboard
1. Allez dans **Table Editor**
2. Ouvrez **blog_posts**
3. Cliquez sur **+ Insert row**
4. Remplissez les champs

### Via SQL
```sql
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
  'Mon premier article',
  'mon-premier-article',
  'Un résumé court de l''article',
  '<h2>Contenu</h2><p>Voici le contenu en HTML...</p>',
  'Votre nom',
  'Catégorie',
  'fr',
  TRUE
);
```

## ✨ Changements au code

- ✅ Erreur gérée correctement (affiche "Aucun article" au lieu de 404)
- ✅ Types TypeScript corrects (`BlogPost`)
- ✅ Import Supabase correct (`createClientForPage`)
- ✅ Logging pour faciliter le débogage
