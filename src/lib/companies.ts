// Le type SupabaseClient est remplacé par any car le shim n'exporte pas ce type.
export async function ensureCompanyExists(
  supabase: any,
  userId: string,
  profile: { full_name?: string | null; username?: string | null }
) {
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (!existingCompany) {
    const firstName = profile.full_name?.split(' ')[0] || 'Entreprise';
    const companyName = `${firstName} Entreprise`;
    const slug = (profile.username || `entreprise-${userId.substring(0, 8)}`).toLowerCase();

    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        owner_id: userId,
        name: companyName,
        slug: slug,
        plan: 'entreprise',
      });

    if (companyError) {
      console.error('❌ Échec création entreprise:', companyError);
      throw new Error('Échec création entreprise');
    }
  }
}