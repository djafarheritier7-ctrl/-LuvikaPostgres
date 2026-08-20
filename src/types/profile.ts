// src/types/profile.ts
export type PublicProfile = {
  full_name: string | null;
  username: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  badges?: string[];
  sections_visibility: Record<
    | 'bio'
    | 'contact'
    | 'social'
    | 'portfolio'
    | 'certificates'
    | 'identity'
    | 'professional'
    | 'skills'
    | 'links' // 👈 Ajouté
    | 'location',
    boolean
  >;
  // 🔹 Ajout : sections supplémentaires pour le nouveau design
  sections_visibility_extended?: Record<
    | 'cv' // ✅ CV
    | 'custom_link' // ✅ Custom Link
    | 'portfolio' // ✅ Portfolio
    | 'certificates' // ✅ Certificates
    | 'skills' // ✅ Skills
    , boolean
  >;
  // 🔹 Ajout : champ pour le lien personnalisé
  custom_link_url?: string | null;
};
