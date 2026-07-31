const fs = require('fs');
const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Restore Sidebar background to #36454F
content = content.replace(
  'bg-white text-slate-700 border-r border-slate-100 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
  'bg-[#36454F] text-[#F5F5DC] border-r border-[#B2AC88]/20 p-6'
);

// Restore Sidebar Header Logo
content = content.replace(
  'text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 block',
  'text-[10px] uppercase font-bold tracking-widest text-[#B2AC88]/60 mt-1 block'
);

// Restore Sidebar Nav links inactive color
content = content.replaceAll(
  'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800',
  'text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80'
);

// Restore Logout Link
content = content.replace(
  'text-red-400 hover:text-red-500 hover:bg-red-50',
  'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
);

fs.writeFileSync(targetFile, content);
console.log('Sidebar color restored successfully!');
