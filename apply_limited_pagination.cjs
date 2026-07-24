const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'hawrisha-dashboard', 'src', 'components', 'AdminDashboard.jsx'),
  path.join(__dirname, 'src', 'components', 'AdminDashboard.jsx')
];

const targetPattern = `                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = safePage === pageNum;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setDashboardPage(pageNum)}
                              className={\`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer border \${
                                isActive
                                  ? "bg-[#B2AC88] text-white border-[#B2AC88]"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50/80"
                              }\`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}`;

const replacement = `                        {(() => {
                          let startPage = Math.max(1, safePage - 2);
                          let endPage = Math.min(totalPages, startPage + 4);
                          if (endPage - startPage < 4) {
                            startPage = Math.max(1, endPage - 4);
                          }
                          const pageNumbers = [];
                          for (let p = startPage; p <= endPage; p++) {
                            pageNumbers.push(p);
                          }
                          return pageNumbers.map((pageNum) => {
                            const isActive = safePage === pageNum;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setDashboardPage(pageNum)}
                                className={\`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer border \${
                                  isActive
                                    ? "bg-[#B2AC88] text-white border-[#B2AC88]"
                                    : "border-slate-200 text-slate-500 hover:bg-slate-50/80"
                                }\`}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}`;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Normalize line endings to LF before match
  const lfContent = content.replace(/\r\n/g, '\n');
  const normalizedPattern = targetPattern.replace(/\r\n/g, '\n');

  if (lfContent.includes(normalizedPattern)) {
    const updated = lfContent.replace(normalizedPattern, replacement);
    // Write back with original line endings if desired
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Successfully limited pagination buttons in ${file}`);
  } else {
    console.error(`Pattern not found in ${file}`);
  }
});
