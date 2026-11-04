// Payment details stay in D1. Public responses expose only the member's own term.
export const duesRows = `
  SELECT member_id,'paid' AS kind,valid_until FROM membership_payments WHERE revoked=0
  UNION ALL SELECT member_id,kind,valid_until FROM manual_dues WHERE voided_at IS NULL`;
export const duesJoin = `LEFT JOIN (
  SELECT member_id,MAX(CASE WHEN kind='paid' THEN valid_until END) AS paid_until,
    MAX(CASE WHEN kind='waived' THEN valid_until END) AS waived_until,
    MAX(valid_until) AS covered_until FROM (${duesRows}) GROUP BY member_id
) d ON d.member_id=m.id`;
export function duesStatus(row, now = Date.now()) {
  return row.paid_until >= now ? 'paid' : row.waived_until >= now ? 'waived' : row.covered_until ? 'expired' : 'none';
}
export async function memberDues(env, id) {
  const row = await env.DB.prepare(`SELECT d.paid_until,d.waived_until,d.covered_until FROM members m ${duesJoin} WHERE m.id=?`).bind(id).first();
  return { ...row, dues_status: duesStatus(row || {}) };
}
