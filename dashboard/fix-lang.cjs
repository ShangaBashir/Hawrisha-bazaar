const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const badCode = `const LangTextInput = ({
  label,
  valueEn,
  valueKu,
  valueAr,
  onChangeEn,
        </span>
      )}
      <div className={type === "textarea" ? "space-y-4" : "grid grid-cols-3 gap-3"}>`;

const goodCode = `const LangTextInput = ({
  label,
  valueEn,
  valueKu,
  valueAr,
  onChangeEn,
  onChangeKu,
  onChangeAr,
  placeholder = "",
  required = false,
  type = "input",
  error = false,
  errorMessage = "",
  allowEnglish = false
}) => {
  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
      {label && (
        <span className="block text-base font-bold uppercase text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <div className={type === "textarea" ? "space-y-4" : "grid grid-cols-3 gap-3"}>`;

content = content.replace(badCode, goodCode);
fs.writeFileSync(file, content);
console.log('Fixed LangTextInput and added allowEnglish prop.');
