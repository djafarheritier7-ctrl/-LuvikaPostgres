# 🔒 Guide : Configurer RLS de Manière Sécurisée

## 📋 Objectif

Réactiver Row Level Security (RLS) sur la table `profiles` tout en permettant :
- ✅ Lecture publique des profils publics
- ✅ Protection des profils privés
- ✅ Modification uniquement par le propriétaire

## 🔑 Politiques SQL Recommandées

### 1. Créer les Politiques dans Supabase

Allez dans **Supabase Dashboard → Authentication → Policies** et exécutez :

```sql
-- ============================================
-- LECTURE PUBLIQUE DES PROFILS PUBLICS
-- ============================================

-- Permettre à tout le monde de voir les profils publics
CREATE POLICY "allow_public_read_public_profiles"
ON public.profiles
FOR SELECT
USING (is_public = true);

-- Permettre aux utilisateurs connectés de voir leur propre profil
CREATE POLICY "allow_users_read_own_profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Permettre aux admins de voir tous les profils
CREATE POLICY "allow_admins_read_all"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- MODIFICATION DES PROFILS
-- ============================================

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "allow_users_update_own_profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permettre aux admins de modifier tous les profils
CREATE POLICY "allow_admins_update_all"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- INSERTION DE PROFILS
-- ============================================

-- Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "allow_users_insert_own_profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- SUPPRESSION DE PROFILS
-- ============================================

-- Permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "allow_users_delete_own_profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Permettre aux admins de supprimer des profils
CREATE POLICY "allow_admins_delete_profiles"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 🧪 Tester les Politiques

### Test 1 : Profil Public (Devrait Fonctionner)
```powershell
curl.exe "http://localhost:3000/api/profiles?username=hassandalmo1"
```
✅ Devrait retourner le profil complet

### Test 2 : Profil Privé (Devrait Échouer si non connecté)
```sql
-- D'abord, rendre un profil privé
UPDATE public.profiles
SET is_public = false
WHERE username = 'maurice';
```
```powershell
curl.exe "http://localhost:3000/api/profiles?username=maurice"
```
❌ Devrait retourner "Profil introuvable" (c'est normal !)

### Test 3 : Liste de Tous les Profils Publics
```powershell
curl.exe "http://localhost:3000/api/profiles/debug"
```
✅ Devrait lister uniquement les profils publics

## 🔄 Migration Progressive

Si vous voulez réactiver RLS progressivement :

### Étape 1 : Vérifier l'État Actuel
```sql
-- Vérifier si RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
```

### Étape 2 : Activer RLS
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Étape 3 : Créer les Politiques (voir ci-dessus)

### Étape 4 : Tester Progressivement
1. Test avec profils publics ✅
2. Test avec profils privés ✅
3. Test avec utilisateur connecté ✅
4. Test avec admin ✅

## 🎯 Cas d'Usage Couverts

| Scénario | Politique | Résultat |
|----------|-----------|----------|
| Visiteur anonyme → Profil public | `allow_public_read_public_profiles` | ✅ Accès autorisé |
| Visiteur anonyme → Profil privé | Aucune | ❌ Accès refusé |
| Utilisateur → Son propre profil | `allow_users_read_own_profile` | ✅ Accès autorisé |
| Utilisateur → Profil privé d'autrui | Aucune | ❌ Accès refusé |
| Admin → Tous les profils | `allow_admins_read_all` | ✅ Accès autorisé |
| Utilisateur → Modifier son profil | `allow_users_update_own_profile` | ✅ Modification autorisée |
| Utilisateur → Modifier autre profil | Aucune | ❌ Modification refusée |

## 🔧 Dépannage

### Si l'API retourne toujours "Profil introuvable" après avoir créé les politiques :

1. **Vérifier que les profils sont publics :**
```sql
SELECT username, is_public FROM public.profiles;
```

2. **Vérifier que les politiques sont actives :**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

3. **Désactiver temporairement RLS pour tester :**
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

4. **Vérifier les logs Supabase :**
- Allez dans **Supabase Dashboard → Logs**
- Cherchez les erreurs de politique

## 📝 Recommandations

### Pour Votre Cas (LUVIKA) :

**Option 1 : RLS Simple (Recommandé pour commencer)**
- Tous les profils sont publics par défaut
- Pas besoin de RLS complexe au début
- Gardez RLS désactivé jusqu'à avoir besoin de profils privés

**Option 2 : RLS Complet (Pour production)**
- Activez RLS avec les politiques ci-dessus
- Permettez aux utilisateurs de choisir (public/privé)
- Protégez les données sensibles

### Configuration `.env.local`
Assurez-vous d'avoir :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service (pour bypass RLS si besoin)
```

## 🎉 Conclusion

Vous avez maintenant 2 options :

1. **Garder RLS désactivé** (plus simple pour commencer) ✅
2. **Activer RLS avec politiques** (plus sécurisé pour production) 🔒

Les deux approches sont valides selon vos besoins actuels ! 🚀