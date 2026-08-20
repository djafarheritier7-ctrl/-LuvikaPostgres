/**
 * Convertit un tableau d'objets en CSV
 */
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  // Obtenir les en-têtes (clés du premier objet)
  const headers = Object.keys(data[0]);
  
  // Fonction pour échapper les valeurs CSV
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Échapper si contient des virgules, guillemets ou retours à la ligne
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Créer la ligne d'en-têtes
  const csvRows = [headers.map(h => escapeCSV(h)).join(',')];

  // Ajouter les données
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      return escapeCSV(value);
    }).join(',');
    csvRows.push(row);
  });

  return csvRows.join('\n');
};

/**
 * Télécharge un CSV
 */
export const downloadCSV = (data: any[], filename: string = 'export'): void => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export des logs de présence
 */
export const exportAttendanceLogs = (logs: any[]): void => {
  const formattedData = logs.map(log => ({
    'Date': new Date(log.created_at).toLocaleDateString('fr-FR'),
    'Heure': new Date(log.created_at).toLocaleTimeString('fr-FR'),
    'Employé': log.employees?.full_name || log.employee_name || '—',
    'Statut': log.status === 'present' ? 'Présent' : log.status === 'late' ? 'En retard' : 'Absent',
    'ID Employé': log.employee_id || '—'
  }));

  downloadCSV(formattedData, 'presence-logs');
};

/**
 * Export des commandes
 */
export const exportOrders = (orders: any[]): void => {
  const formattedData = orders.map(order => ({
    'N° Commande': order.id.slice(0, 8),
    'Date': new Date(order.created_at).toLocaleDateString('fr-FR'),
    'Client': order.buyer?.full_name || order.buyer_name || 'Anonyme',
    'Email': order.buyer?.email || order.buyer_email || '—',
    'Montant': `${order.total_amount || 0} $`,
    'Statut': order.status === 'pending' ? 'En attente' :
               order.status === 'processing' ? 'En cours' :
               order.status === 'shipped' ? 'Expédiée' :
               order.status === 'delivered' ? 'Livrée' : 'Annulée',
    'Adresse': order.shipping_address || '—'
  }));

  downloadCSV(formattedData, 'commandes');
};

/**
 * Export des employés
 */
export const exportEmployees = (employees: any[]): void => {
  const formattedData = employees.map(emp => ({
    'Nom': emp.full_name,
    'Email': emp.email || '—',
    'Téléphone': emp.phone || '—',
    'Poste': emp.position || '—',
    'Rôle': emp.role === 'admin' ? 'Administrateur' :
            emp.role === 'manager' ? 'Manager' : 'Employé',
    'Statut': emp.status === 'active' ? 'Actif' :
              emp.status === 'inactive' ? 'Inactif' : 'Suspendu',
    'Date d\'adhésion': new Date(emp.joined_at).toLocaleDateString('fr-FR')
  }));

  downloadCSV(formattedData, 'employes');
};

/**
 * Export générique avec mapping personnalisé
 */
export const exportWithMapping = (
  data: any[],
  mapping: { [key: string]: string },
  filename: string
): void => {
  const formattedData = data.map(item => {
    const mapped: any = {};
    Object.entries(mapping).forEach(([key, label]) => {
      mapped[label] = item[key] || '—';
    });
    return mapped;
  });

  downloadCSV(formattedData, filename);
};