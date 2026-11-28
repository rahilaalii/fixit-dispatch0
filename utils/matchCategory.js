// First version of "problem to service" matching: simple keywords (English + Roman Urdu).
// In Week 3 the AI will replace this with real understanding.
const RULES = [
  { key: 'plumb', words: ['tap', 'leak', 'leaking', 'pipe', 'water', 'drain', 'flush', 'commode', 'toilet', 'sink', 'basin', 'tank', 'pani', 'paani', 'nal', 'tonti', 'blocked', 'overflow'] },
  { key: 'electric', words: ['fan', 'switch', 'wire', 'wiring', 'spark', 'sparking', 'socket', 'light', 'bulb', 'bijli', 'current', 'breaker', 'meter', 'shock', 'circuit', 'mcb'] },
  { key: 'ac', words: ['ac', 'cooling', 'compressor', 'gas', 'split', 'inverter', 'thanda'] },
  { key: 'appliance', words: ['washing', 'machine', 'fridge', 'refrigerator', 'freezer', 'oven', 'microwave', 'geyser', 'dryer', 'dishwasher', 'cooker'] },
  { key: 'carpent', words: ['door', 'cupboard', 'wardrobe', 'furniture', 'wood', 'wooden', 'drawer', 'table', 'chair', 'bed', 'darwaza', 'almari'] },
  { key: 'paint', words: ['paint', 'painting', 'wall', 'walls', 'polish', 'colour', 'color', 'dampness', 'ceiling', 'rang'] },
];

// categories = list from the database. Returns the best matching category or null.
module.exports = function matchCategory(text, categories) {
  const tokens = new Set((text.toLowerCase().match(/[a-z]+/g) || []));
  let best = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const cat = categories.find((c) => c.name.toLowerCase().includes(rule.key));
    if (!cat) continue;
    const score = rule.words.filter((w) => tokens.has(w)).length;
    if (score > bestScore) { best = cat; bestScore = score; }
  }
  return best;
};
