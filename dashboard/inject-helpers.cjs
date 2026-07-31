const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const funcs = `
const getKurdishName = (val) => {
  if (val === null || val === undefined || val === "") return "";
  if (typeof val === 'object' && !Array.isArray(val)) return String(val.ku || val.KU || "");
  if (typeof val !== 'string') return "";
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === 'object') return String(parsed.ku || parsed.KU || "");
  } catch(e) {}
  return "";
};
const getArabicName = (val) => {
  if (val === null || val === undefined || val === "") return "";
  if (typeof val === 'object' && !Array.isArray(val)) return String(val.ar || val.AR || "");
  if (typeof val !== 'string') return "";
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === 'object') return String(parsed.ar || parsed.AR || "");
  } catch(e) {}
  return "";
};
`;

if (!content.includes('const getKurdishName =')) {
  content = content.replace('const getEnglishName = (val) => {', funcs + '\nconst getEnglishName = (val) => {');
  fs.writeFileSync(file, content);
  console.log('Added helper functions');
} else {
  console.log('Helpers already exist');
}
