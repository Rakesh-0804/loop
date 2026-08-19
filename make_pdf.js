const { spawn } = require('child_process');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = 'file:///C:/Users/rakes/Documents/antigravity/loop/documentation_pdf.html';
const pdfPath = 'C:\\Users\\rakes\\Documents\\antigravity\\loop\\Project_LOOP_Documentation_Team16.pdf';

console.log('Generating Project_LOOP_Documentation_Team16.pdf...');

const child = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  htmlPath,
]);

child.on('exit', (code) => {
  console.log('PDF Process Exited with Code:', code);
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('SUCCESS: PDF Created! Size:', stats.size, 'bytes');
  } else {
    console.error('ERROR: PDF file not found after process exit.');
  }
});
