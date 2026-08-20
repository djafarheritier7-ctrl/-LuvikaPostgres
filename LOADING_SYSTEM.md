# 🎨 Système de Chargement Global (Loading System)

## Vue d'ensemble

Un système de chargement professionnel avec spinner animé + logo, visible lors :
- Du **premier chargement** de l'application
- Des **transitions entre pages**
- Des **changements de route**

## Architecture

### 1. **Loading.tsx** - Composant de chargement au démarrage
- Spinner à double anneau animé
- Logo dégradé avec effet glow
- Texte animé "Révèle qui tu es..."
- Points de chargement (dots) animés
- Arrière-plan dégradé moderne

**Localisation :**
```
src/components/system/Loading.tsx
src/app/loading.tsx                    # Chargement racine
src/app/[locale]/loading.tsx          # Chargement par locale
```

### 2. **GlobalLoader.tsx** - Détecteur de transitions
- Détecte les changements de route via `useRouter`
- Affiche le loading overlay pendant 1.5s
- Gère les préchargements (prefetch)
- Composant client avec hook personnalisé

**Localisation :**
```
src/components/system/GlobalLoader.tsx
```

### 3. **PageLoader.tsx** - Wrapper Suspense (optionnel)
- Wrapper pour charger du contenu async
- Utilise React.Suspense
- Personnalisable avec fallback custom

**Localisation :**
```
src/components/system/PageLoader.tsx
```

### 4. **ClientProviders.tsx** - Intégration
- Enveloppe tous les composants client
- Import et export de GlobalLoader
- Initialisation au montage

**Localisation :**
```
src/components/system/ClientProviders.tsx
```

## Design

### Couleurs utilisées
```
- Fond principal    : Dégradé slate-900 → slate-800 → slate-900
- Spinner primaire  : Blue-500, Purple-500, Cyan-500
- Texte principal   : Gradient blue-400 → purple-400 → cyan-400
- Texte secondaire  : Gray-400
```

### Animations
```
- Spinner externe   : Rotation 360° (1s)
- Spinner interne   : Rotation inverse (2s)
- Points            : Pulse avec délai
- Arrière-plan      : Pulse 2s avec animations dégradées
```

## Utilisation

### 1. Chargement automatique au démarrage
Rien à faire ! Les fichiers `loading.tsx` sont automatiquement utilisés par Next.js.

```tsx
// Automatique - aucun code requis
// Le loading s'affiche pendant le chargement initial
```

### 2. Transitions entre pages
Automatique grâce à `GlobalLoader.tsx` dans `ClientProviders`.

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push('/autre-page');
    // GlobalLoader s'affiche automatiquement pendant 1.5s
  };

  return <button onClick={handleNavigation}>Aller ailleurs</button>;
}
```

### 3. Wrapper pour contenu async
Utiliser `PageLoader` pour du contenu qui nécessite du fetching :

```tsx
'use client';
import { PageLoader } from '@/src/components/system/PageLoader';
import Loading from '@/src/components/system/Loading';

async function DataComponent() {
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}

export default function Page() {
  return (
    <PageLoader fallback={<Loading />}>
      <DataComponent />
    </PageLoader>
  );
}
```

## Fichiers créés/modifiés

### ✅ Créés
```
src/components/system/Loading.tsx           # Composant principal
src/components/system/GlobalLoader.tsx      # Détecteur de transitions
src/components/system/PageLoader.tsx        # Wrapper Suspense
src/app/loading.tsx                         # Loading racine
src/app/[locale]/loading.tsx                # Loading par locale
```

### 🔄 Modifiés
```
src/components/system/ClientProviders.tsx   # + GlobalLoader import/export
```

## Personnalisation

### Changer les couleurs
Éditer `Loading.tsx` et `GlobalLoader.tsx` :

```tsx
// Exemple: changer le gradient principal
<div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-6">
```

### Changer la durée du loading
Dans `GlobalLoader.tsx` :

```tsx
const timer = setTimeout(() => setIsLoading(false), 3000); // 3 secondes au lieu de 1.5
```

### Ajouter une image/logo custom
Remplacer l'icône SVG par une image :

```tsx
<img 
  src="/logo.png" 
  alt="Logo" 
  className="w-16 h-16"
/>
```

### Désactiver les animations de fond
Retirer ou commenter les divs de background animé :

```tsx
{/* <div className="absolute -top-40 -right-40 w-80 h-80 ...">  */}
```

## Performance

- ⚡ Composant léger (~5KB minified)
- 🎯 Utilise uniquement les animations CSS
- 📦 Zéro dépendances supplémentaires
- 🔄 Pas de re-render inutile grâce à `useState`

## Dépannage

### Le loading ne s'affiche pas au premier chargement
✅ Vérifier que `src/app/loading.tsx` existe

### Le loading n'apparaît pas lors des transitions
✅ S'assurer que `GlobalLoader` est importé dans `ClientProviders`
✅ Vérifier la console pour les erreurs

### Animation saccadée
✅ Vérifier que le navigateur supporte les animations CSS3
✅ Réduire les autres animations actives

## Intégration Future

Possible d'intégrer avec :
- **NProgress.js** : Barre de progression
- **Nprogress** : Animation de barre
- **Custom transitions** : Avec Framer Motion
- **Service Worker** : Pour les PWA

---

**Créé le:** 30 Janvier 2026
**Status:** ✅ Production Ready
