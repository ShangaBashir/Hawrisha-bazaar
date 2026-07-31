const fs = require('fs');

const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update LangTextInput definition
const oldLangTextProps = `  type = "input",
  error = false,
  errorMessage = ""
}) => {`;
const newLangTextProps = `  type = "input",
  error = false,
  errorMessage = "",
  allowEnglish = false
}) => {`;
content = content.replace(oldLangTextProps, newLangTextProps);

// 2. Update LangTextInput onChangeKu
content = content.replace(/onChange=\{\(e\) => onChangeKu\(e\.target\.value\.replace\(\/\[a-zA-Z\]\/g, ''\)\)\}/g, "onChange={(e) => onChangeKu(allowEnglish ? e.target.value : e.target.value.replace(/[a-zA-Z]/g, ''))}");
content = content.replace(/onChange=\{\(e\) => onChangeAr\(e\.target\.value\.replace\(\/\[a-zA-Z\]\/g, ''\)\)\}/g, "onChange={(e) => onChangeAr(allowEnglish ? e.target.value : e.target.value.replace(/[a-zA-Z]/g, ''))}");

// 3. Update Sizes subtab LangTextInput to use allowEnglish={true}
const oldSizesInput = `<LangTextInput
                        label="New Size Collection"
                        required
                        valueEn={newSizeEn}
                        valueKu={newSizeKu}
                        valueAr={newSizeAr}
                        onChangeEn={setNewSizeEn}
                        onChangeKu={setNewSizeKu}
                        onChangeAr={setNewSizeAr}
                        placeholder="Add custom size..."
                      />`;
const newSizesInput = `<LangTextInput
                        label="New Size Collection"
                        required
                        valueEn={newSizeEn}
                        valueKu={newSizeKu}
                        valueAr={newSizeAr}
                        onChangeEn={setNewSizeEn}
                        onChangeKu={setNewSizeKu}
                        onChangeAr={setNewSizeAr}
                        placeholder="Add custom size..."
                        allowEnglish={true}
                      />`;
content = content.replace(oldSizesInput, newSizesInput);

fs.writeFileSync(targetFile, content);
console.log('LangTextInput and sizes updated.');
