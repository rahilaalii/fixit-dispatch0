// Simple rule-based urgency scoring. Works now, and in Week 3 the AI will improve it.
// Keywords include some Roman Urdu words because customers often write that way.
const HIGH = ['burst', 'flood', 'no water', 'sparking', 'spark', 'short circuit', 'gas', 'fire', 'smoke',
  'shock', 'overflow', 'emergency', 'urgent', 'paani nahi', 'pani nahi', 'dhuan', 'aag', 'current lag', 'bijli nahi'];
const LOW = ['drip', 'drips', 'sometimes', 'minor', 'slow', 'noise', 'routine', 'service', 'paint', 'check'];

const RANK = { High: 3, Medium: 2, Low: 1 };

function scoreUrgency(text = '') {
  const t = text.toLowerCase();
  const hitHigh = HIGH.find((w) => t.includes(w));
  if (hitHigh) return { urgency: 'High', rank: 3, reason: `Contains urgent word: "${hitHigh}"` };
  const hitLow = LOW.find((w) => t.includes(w));
  if (hitLow) return { urgency: 'Low', rank: 1, reason: `Looks minor: "${hitLow}"` };
  return { urgency: 'Medium', rank: 2, reason: 'No urgent or minor keywords found' };
}

module.exports = { scoreUrgency, RANK };
