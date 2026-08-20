// src/app/about/page.tsx
import { redirect } from 'next/navigation';

export default function AboutRedirect() {
  // Redirige vers la version localisée
  redirect('/fr/about'); // ou '/ln/about' si tu préfères Lingála par défaut
}