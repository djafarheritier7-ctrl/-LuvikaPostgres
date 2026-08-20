/**
 * Vérifie si une date appartient au mois en cours
 */
export const isThisMonth = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

/**
 * Vérifie si une date appartient à la semaine en cours
 */
export const isThisWeek = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  
  // Obtenir le premier jour de la semaine (lundi)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  
  // Obtenir le dernier jour de la semaine (dimanche)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return d >= startOfWeek && d <= endOfWeek;
};

/**
 * Vérifie si une date appartient à aujourd'hui
 */
export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

/**
 * Filtre un tableau d'objets par date (champ created_at)
 */
export const filterByDateRange = (
  items: any[],
  range: 'today' | 'week' | 'month' | 'all' = 'all'
): any[] => {
  if (range === 'all') return items;
  
  return items.filter(item => {
    const date = item.created_at || item.joined_at || item.date;
    if (!date) return false;
    
    switch (range) {
      case 'today':
        return isToday(date);
      case 'week':
        return isThisWeek(date);
      case 'month':
        return isThisMonth(date);
      default:
        return true;
    }
  });
};

/**
 * Calcule des statistiques agrégées
 */
export const calculateStats = (
  items: any[],
  valueField: string = 'total_amount',
  statusField: string = 'status',
  successStatus: string = 'delivered'
) => {
  const delivered = items.filter(i => i[statusField] === successStatus);
  const pending = items.filter(i => i[statusField] === 'pending');
  
  return {
    total: items.length,
    delivered: delivered.length,
    pending: pending.length,
    revenue: delivered.reduce((sum: number, item: any) => sum + (item[valueField] || 0), 0),
    average: items.length > 0 
      ? delivered.reduce((sum: number, item: any) => sum + (item[valueField] || 0), 0) / delivered.length 
      : 0
  };
};