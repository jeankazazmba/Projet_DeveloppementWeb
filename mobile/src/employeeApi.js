export const orderStatus = {
  received: 'Reçue', accepted: 'Acceptée', preparing: 'En préparation', ready: 'Prête',
  served: 'Servie', delivering: 'Remise au livreur', delivered: 'Livrée', cancelled: 'Annulée',
};
export const nextOrderStatus = {
  received: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'served',
};
export const complaintStatus = {
  ouverte: 'À traiter', prise_en_charge: 'En cours', proposition_employe: 'Envoyée au gérant',
  validation_gerant: 'Validée', decision_admin: 'Décision admin', resolue: 'Résolue',
  rejetee: 'Rejetée', escaladee: 'Escaladée',
};
export const mapEmployeeOrder = order => ({
  id: order.id, customer: order.customer_name, service: order.service === 'delivery' ? 'Livraison' : 'Sur place',
  location: order.table?.code || order.delivery_zone?.district || 'Retrait',
  items: (order.lines || []).map(line => `${line.title_snapshot} ×${line.quantity}`).join(', '),
  amount: order.amount_cdf, status: orderStatus[order.status] || order.status,
  rawStatus: order.status, version: order.version, createdAt: order.created_at,
});
export const mapEmployeeClaim = claim => ({
  id: claim.id, student: claim.student_name, orderId: claim.order_id || '—', reason: claim.reason,
  message: claim.messages?.find(item => item.kind === 'student')?.body || claim.reason,
  status: complaintStatus[claim.status] || claim.status, rawStatus: claim.status, version: claim.version,
  received: new Date(claim.created_at).toLocaleString('fr-CD'), amount: 0, location: '', attachment: null,
  response: claim.messages?.find(item => item.kind === 'employee_proposal')?.body || '',
});
