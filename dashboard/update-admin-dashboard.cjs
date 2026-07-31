const fs = require('fs');

const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Inject state
const stateInjection = `
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBadge, setEditingBadge] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [editingStyle, setEditingStyle] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingSeason, setEditingSeason] = useState(null);
  const [editingSize, setEditingSize] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
`;
if (!content.includes('const [editingBadge, setEditingBadge] = useState(null);')) {
  const targetStateStr = 'const [settingsSubTab, setSettingsSubTab] = useState("categories");';
  content = content.replace(targetStateStr, targetStateStr + '\n' + stateInjection);
}

// 2. Inject handler functions
const handleUpdates = `
  const handleUpdateCategory = async (id, nameEn, nameKu, nameAr) => {
    const combinedVal = JSON.stringify({ en: nameEn, ku: nameKu, ar: nameAr });
    try {
      const res = await fetch(\`/api/settings/categories/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: combinedVal }) });
      if (res.ok) { showToast("Category updated successfully!"); fetchSettings(); setEditingCategory(null); }
    } catch {}
  };
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

// 3. Process each subtab
const items = [
  { subtab: 'categories', varEn: 'newCatEn', varKu: 'newCatKu', varAr: 'newCatAr', stateVar: 'categories', itemState: 'editingCategory', btnText: 'Add Category', delFn: 'handleDeleteCategory', itemVar: 'cat' },
  { subtab: 'badges', varEn: 'newBadgeEn', varKu: 'newBadgeKu', varAr: 'newBadgeAr', stateVar: 'badges', itemState: 'editingBadge', btnText: 'Add Badge', delFn: 'handleDeleteBadge', itemVar: 'badge' },
  { subtab: 'styles', varEn: 'newStyleEn', varKu: 'newStyleKu', varAr: 'newStyleAr', stateVar: 'styles', itemState: 'editingStyle', btnText: 'Add Style', delFn: 'handleDeleteStyle', itemVar: 'style' },
  { subtab: 'materials', varEn: 'newMaterialEn', varKu: 'newMaterialKu', varAr: 'newMaterialAr', stateVar: 'materials', itemState: 'editingMaterial', btnText: 'Add Material', delFn: 'handleDeleteMaterial', itemVar: 'material' },
  { subtab: 'seasons', varEn: 'newSeasonEn', varKu: 'newSeasonKu', varAr: 'newSeasonAr', stateVar: 'seasons', itemState: 'editingSeason', btnText: 'Add Season', delFn: 'handleDeleteSeason', itemVar: 'season' },
  { subtab: 'sizes', varEn: 'newSizeEn', varKu: 'newSizeKu', varAr: 'newSizeAr', stateVar: 'sizes', itemState: 'editingSize', btnText: 'Add Size', delFn: 'handleDeleteSize', itemVar: 'sz' },
  { subtab: 'promotions', varEn: 'newPromoEn', varKu: 'newPromoKu', varAr: 'newPromoAr', stateVar: 'promotions', itemState: 'editingPromotion', btnText: 'Add Promotion Campaign', delFn: 'handleDeletePromotion', itemVar: 'promo' }
];

for (const { subtab, varEn, varKu, varAr, stateVar, itemState, btnText, delFn, itemVar } of items) {
  const startMarker = `settingsSubTab === "${subtab}" &&`;
  const nextSubtabs = ['badges', 'colors', 'styles', 'materials', 'seasons', 'sizes', 'promotions'];
  let endMarker = '</div>';
  for (const t of nextSubtabs) {
    if (content.indexOf(`settingsSubTab === "${t}" &&`, content.indexOf(startMarker)) > -1) {
      endMarker = `settingsSubTab === "${t}" &&`;
      break;
    }
  }

  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) continue;
  let endIdx = content.indexOf('settingsSubTab === "', startIdx + 30);
  if (endIdx === -1) endIdx = content.indexOf('activeTab === "settings" &&', startIdx);
  if (endIdx === -1) endIdx = content.length;

  let block = content.substring(startIdx, endIdx);

  // Replace onSubmit safely
  let submitMatch = block.match(/onSubmit=\{\(e\)\s*=>\s*\{[\s\S]*?\}\}/);
  if (submitMatch) {
    let fnName = `handleAdd${itemState.replace('editing', '')}`;
    let updateFnName = `handleUpdate${itemState.replace('editing', '')}`;
    let newSubmit = `onSubmit={(e) => {
                        e.preventDefault();
                        if (${itemState}) {
                          ${updateFnName}(${itemState}.id, ${varEn}, ${varKu}, ${varAr});
                        } else {
                          ${fnName}(${varEn}, ${varKu}, ${varAr});
                        }
                        set${varEn.charAt(0).toUpperCase() + varEn.slice(1)}("");
                        set${varKu.charAt(0).toUpperCase() + varKu.slice(1)}("");
                        set${varAr.charAt(0).toUpperCase() + varAr.slice(1)}("");
                        set${itemState.charAt(0).toUpperCase() + itemState.slice(1)}(null);
                      }}`;
    block = block.replace(submitMatch[0], newSubmit);
  }

  // Replace button safely
  let btnTextIdx = block.indexOf(btnText);
  if (btnTextIdx > -1) {
    let btnStart = block.lastIndexOf('<button', btnTextIdx);
    let btnEnd = block.indexOf('</button>', btnTextIdx) + 9;
    if (btnStart > -1 && btnEnd > btnStart) {
      let newBtn = `<div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={!${varEn}.trim() || !${varKu}.trim() || !${varAr}.trim()}
                          className="${subtab === 'promotions' || subtab === 'categories' ? 'w-full' : 'flex-1'} py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {${itemState} ? "Update" : "${btnText}"}
                        </button>
                        {${itemState} && (
                          <button
                            type="button"
                            onClick={() => {
                              set${itemState.charAt(0).toUpperCase() + itemState.slice(1)}(null);
                              set${varEn.charAt(0).toUpperCase() + varEn.slice(1)}("");
                              set${varKu.charAt(0).toUpperCase() + varKu.slice(1)}("");
                              set${varAr.charAt(0).toUpperCase() + varAr.slice(1)}("");
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>`;
      block = block.substring(0, btnStart) + newBtn + block.substring(btnEnd);
    }
  }

  // Replace Icons safely
  let iconDelIdx = block.indexOf(`${delFn}(${itemVar})`);
  if (iconDelIdx > -1) {
    let iconBtnStart = block.lastIndexOf('<button', iconDelIdx);
    let iconBtnEnd = block.indexOf('</button>', iconDelIdx) + 9;
    if (iconBtnStart > -1 && iconBtnEnd > iconBtnStart) {
      let newIcons = `<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  set${itemState.charAt(0).toUpperCase() + itemState.slice(1)}(${itemVar});
                                  set${varEn.charAt(0).toUpperCase() + varEn.slice(1)}(getEnglishName(${itemVar}.name));
                                  set${varKu.charAt(0).toUpperCase() + varKu.slice(1)}(getKurdishName(${itemVar}.name));
                                  set${varAr.charAt(0).toUpperCase() + varAr.slice(1)}(getArabicName(${itemVar}.name));
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => ${delFn}(${itemVar})}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>`;
      block = block.substring(0, iconBtnStart) + newIcons + block.substring(iconBtnEnd);
    }
  }
  
  content = content.substring(0, startIdx) + block + content.substring(endIdx);
}

// COLORS (Special logic safely)
const colorStartIdx = content.indexOf('settingsSubTab === "colors" &&');
if (colorStartIdx > -1) {
  let colorEndIdx = content.indexOf('settingsSubTab === "styles" &&');
  let colorBlock = content.substring(colorStartIdx, colorEndIdx);
  
  const oldColorSubmit = /onSubmit=\{\(e\)\s*=>\s*\{[\s\S]*?\}\}/;
  const newColorSubmit = `onSubmit={(e) => {
                        e.preventDefault();
                        if (editingColor) {
                          handleUpdateColor(editingColor.id, editingColor.id, colorValue, newColorEn, newColorKu, newColorAr, "Standard");
                        } else {
                          handleAddColor({ nameEn: newColorEn, nameKu: newColorKu, nameAr: newColorAr, colorVal: colorValue, family: "Standard" });
                        }
                        setNewColorEn("");
                        setNewColorKu("");
                        setNewColorAr("");
                        setEditingColor(null);
                      }}`;
  colorBlock = colorBlock.replace(oldColorSubmit, newColorSubmit);

  let btnTextIdx = colorBlock.indexOf("Add Color Swatch");
  if (btnTextIdx > -1) {
    let btnStart = colorBlock.lastIndexOf('<button', btnTextIdx);
    let btnEnd = colorBlock.indexOf('</button>', btnTextIdx) + 9;
    if (btnStart > -1 && btnEnd > btnStart) {
      const newColorBtn = `<div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={!newColorEn.trim() || !newColorKu.trim() || !newColorAr.trim()}
                          className="flex-1 py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingColor ? "Update Color" : "Add Color Swatch"}
                        </button>
                        {editingColor && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingColor(null);
                              setNewColorEn("");
                              setNewColorKu("");
                              setNewColorAr("");
                              setColorValue("#000000");
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>`;
      colorBlock = colorBlock.substring(0, btnStart) + newColorBtn + colorBlock.substring(btnEnd);
    }
  }

  let iconDelIdx = colorBlock.indexOf('handleDeleteColor(color)');
  if (iconDelIdx > -1) {
    let iconBtnStart = colorBlock.lastIndexOf('<button', iconDelIdx);
    let iconBtnEnd = colorBlock.indexOf('</button>', iconDelIdx) + 9;
    if (iconBtnStart > -1 && iconBtnEnd > iconBtnStart) {
      const newColorIcon = `<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingColor(color);
                                  setNewColorEn(getEnglishName(color.name));
                                  setNewColorKu(getKurdishName(color.name));
                                  setNewColorAr(getArabicName(color.name));
                                  setColorValue(color.class && color.class.startsWith("#") ? color.class : "#000000");
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteColor(color)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>`;
      colorBlock = colorBlock.substring(0, iconBtnStart) + newColorIcon + colorBlock.substring(iconBtnEnd);
    }
  }

  content = content.substring(0, colorStartIdx) + colorBlock + content.substring(colorEndIdx);
}

fs.writeFileSync(targetFile, content);
console.log("Successfully rebuilt UI edits");
