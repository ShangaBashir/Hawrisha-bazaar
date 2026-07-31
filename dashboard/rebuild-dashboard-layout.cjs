const fs = require('fs');
const targetFile = 'c:\\Users\\shang\\Desktop\\GorawiXana\\hawrisha-dashboard\\src\\components\\AdminDashboard.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Sidebar Styles (Light Mode, sleek white)
content = content.replace(
  'bg-[#36454F] text-[#F5F5DC] border-r border-[#B2AC88]/20 p-6',
  'bg-white text-slate-700 border-r border-slate-100 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
);

// 2. Sidebar Header Logo
content = content.replace(
  'text-[10px] uppercase font-bold tracking-widest text-[#B2AC88]/60 mt-1 block',
  'text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 block'
);

// 3. Sidebar Nav links inactive color
content = content.replaceAll(
  'text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80',
  'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800'
);
content = content.replaceAll(
  'text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80', // Replace any remaining
  'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800'
);

// 4. Logout Link
content = content.replace(
  'text-red-400/70 hover:text-red-400 hover:bg-red-500/10',
  'text-red-400 hover:text-red-500 hover:bg-red-50'
);

// 5. Stat Cards background
content = content.replaceAll(
  'bg-white border border-slate-100 shadow-sm rounded-2xl p-5',
  'bg-white border border-slate-50 shadow-md shadow-slate-200/40 rounded-3xl p-6 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50'
);

// 6. Change top padding/background of main container
content = content.replace(
  'flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50',
  'flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa]'
);

// 7. Make the Category & Store Settings header look premium
content = content.replace(
  '<h3 className="text-xl font-serif italic font-bold text-[#36454F] mb-6">System Settings</h3>',
  '<div className="mb-8"><h3 className="text-2xl font-serif italic font-bold text-slate-800">Category & Store Settings</h3><p className="text-sm text-slate-500 mt-1">Manage global system categories, variations, sizes, and attributes.</p></div>'
);

fs.writeFileSync(targetFile, content);
console.log('Layout replaced successfully!');
