const fs = require('fs');

const d = JSON.parse(fs.readFileSync('db_logs.json', 'utf8'));

// Filter same as JS filter
const userBinsToLower = "bin_001";
const raw = d.logs.filter(l => String(l.bin_id).toLowerCase() === userBinsToLower);

console.log("Filtered to bin_001:", raw.length, "items");
console.log("First 3 items:", raw.slice(0, 3).map(r => r.updated_at));
