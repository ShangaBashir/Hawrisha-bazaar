const fs = require('fs');

const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

const stateInjection = `
  const [editingBadge, setEditingBadge] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [editingStyle, setEditingStyle] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingSeason, setEditingSeason] = useState(null);
  const [editingSize, setEditingSize] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
`;

if (!content.includes('const [editingBadge, setEditingBadge] = useState(null);')) {
  content = content.replace('const [editingCategory, setEditingCategory] = useState(null);', 'const [editingCategory, setEditingCategory] = useState(null);\n' + stateInjection);
}

const handleUpdates = `
  const handleUpdateBadge = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/badges/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Badge updated successfully!"); fetchSettings(); setEditingBadge(null); }
    } catch {}
  };
  const handleUpdateColor = async (oldId, id, classVal, nameEn, nameKu, nameAr, family) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/colors/\${oldId}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, class: classVal, name: combinedVal, family }) });
      if (res.ok) { showToast("Color updated successfully!"); fetchSettings(); setEditingColor(null); }
    } catch {}
  };
  const handleUpdateStyle = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/styles/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Style updated successfully!"); fetchSettings(); setEditingStyle(null); }
    } catch {}
  };
  const handleUpdateMaterial = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/materials/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Material updated successfully!"); fetchSettings(); setEditingMaterial(null); }
    } catch {}
  };
  const handleUpdateSeason = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/seasons/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Season updated successfully!"); fetchSettings(); setEditingSeason(null); }
    } catch {}
  };
  const handleUpdateSize = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/sizes/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Size updated successfully!"); fetchSettings(); setEditingSize(null); }
    } catch {}
  };
  const handleUpdatePromotion = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/promotions/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Promotion updated successfully!"); fetchSettings(); setEditingPromotion(null); }
    } catch {}
  };
`;
if (!content.includes('const handleUpdateBadge')) {
  content = content.replace('  const handleDeleteCategory = async (cat) => {', handleUpdates + '\n  const handleDeleteCategory = async (cat) => {');
}

fs.writeFileSync(targetFile, content);
console.log("Functions injected.");
