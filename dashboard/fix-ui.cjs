const fs = require('fs');

const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

const items = [
  { subtab: 'badges', itemState: 'editingBadge', varEn: 'newBadgeEn', varKu: 'newBadgeKu', varAr: 'newBadgeAr', addFn: 'handleAddBadge', updateFn: 'handleUpdateBadge', delFn: 'handleDeleteBadge', btnText: 'Add Badge', itemVar: 'b' },
  { subtab: 'styles', itemState: 'editingStyle', varEn: 'newStyleEn', varKu: 'newStyleKu', varAr: 'newStyleAr', addFn: 'handleAddStyle', updateFn: 'handleUpdateStyle', delFn: 'handleDeleteStyle', btnText: 'Add Style', itemVar: 'style' },
  { subtab: 'materials', itemState: 'editingMaterial', varEn: 'newMatEn', varKu: 'newMatKu', varAr: 'newMatAr', addFn: 'handleAddMaterial', updateFn: 'handleUpdateMaterial', delFn: 'handleDeleteMaterial', btnText: 'Add Material', itemVar: 'mat' },
  { subtab: 'seasons', itemState: 'editingSeason', varEn: 'newSeasonEn', varKu: 'newSeasonKu', varAr: 'newSeasonAr', addFn: 'handleAddSeason', updateFn: 'handleUpdateSeason', delFn: 'handleDeleteSeason', btnText: 'Add Season', itemVar: 'sea' },
  { subtab: 'sizes', itemState: 'editingSize', varEn: 'newSizeEn', varKu: 'newSizeKu', varAr: 'newSizeAr', addFn: 'handleAddSize', updateFn: 'handleUpdateSize', delFn: 'handleDeleteSize', btnText: 'Add Size', itemVar: 'sz' },
  { subtab: 'promotions', itemState: 'editingPromotion', varEn: 'newPromoEn', varKu: 'newPromoKu', varAr: 'newPromoAr', addFn: 'handleAddPromotion', updateFn: 'handleUpdatePromotion', delFn: 'handleDeletePromotion', btnText: 'Add Promotion', itemVar: 'promo' },
];

for (const { itemState, varEn, varKu, varAr, addFn, updateFn, delFn, btnText, itemVar } of items) {
  // 1. Submit Form
  const oldSubmit = `onSubmit={(e) => {
                        e.preventDefault();
                        ${addFn}(${varEn}, ${varKu}, ${varAr});
                        set${varEn.charAt(0).toUpperCase() + varEn.slice(1)}("");
                        set${varKu.charAt(0).toUpperCase() + varKu.slice(1)}("");
                        set${varAr.charAt(0).toUpperCase() + varAr.slice(1)}("");
                      }}`;
  const newSubmit = `onSubmit={(e) => {
                        e.preventDefault();
                        if (${itemState}) {
                          ${updateFn}(${itemState}.id, ${varEn}, ${varKu}, ${varAr});
                        } else {
                          ${addFn}(${varEn}, ${varKu}, ${varAr});
                        }
                        set${varEn.charAt(0).toUpperCase() + varEn.slice(1)}("");
                        set${varKu.charAt(0).toUpperCase() + varKu.slice(1)}("");
                        set${varAr.charAt(0).toUpperCase() + varAr.slice(1)}("");
                        set${itemState.charAt(0).toUpperCase() + itemState.slice(1)}(null);
                      }}`;
  if (!content.includes(oldSubmit)) {
    console.error("COULD NOT FIND SUBMIT FOR", addFn);
  } else {
    content = content.replace(oldSubmit, newSubmit);
  }

  // 2. Button
  const oldBtnRegex = new RegExp(`<button\\s+type="submit"[\\s\\S]*?>\\s*${btnText}\\s*<\\/button>`);
  const newBtn = `<div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={!${varEn}.trim() || !${varKu}.trim() || !${varAr}.trim()}
                          className="flex-1 py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
  content = content.replace(oldBtnRegex, newBtn);

  // 3. Delete Icon
  const oldIconStr = `<button
                                onClick={() => ${delFn}(${itemVar})}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>`;
  const newIcons = `<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
  content = content.replace(oldIconStr, newIcons);
}

// COLORS (Special logic)
const oldColorSubmit = `onSubmit={(e) => {
                        e.preventDefault();
                        handleAddColor({
                          nameEn: newColorEn,
                          nameKu: newColorKu,
                          nameAr: newColorAr,
                          colorVal: colorValue,
                          family: "Standard",
                        });
                        setNewColorEn("");
                        setNewColorKu("");
                        setNewColorAr("");
                      }}`;
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
content = content.replace(oldColorSubmit, newColorSubmit);

const oldColorBtn = /<button\s+type="submit"[^>]*?>\s*Add Color Swatch\s*<\/button>/;
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
content = content.replace(oldColorBtn, newColorBtn);

const oldColorIcon = `<button
                                onClick={() => handleDeleteColor(color)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>`;
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
content = content.replace(oldColorIcon, newColorIcon);

fs.writeFileSync(targetFile, content);
console.log("Successfully rebuilt UI edits");
