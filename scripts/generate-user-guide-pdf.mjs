import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
  console.log('🚀 Starting PDF generation...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load the HTML file
  const htmlPath = join(__dirname, '..', 'docs', 'EaseMail-User-Guide.html');
  const htmlUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

  console.log('📄 Loading HTML file:', htmlUrl);
  await page.goto(htmlUrl, { waitUntil: 'networkidle' });

  // Generate PDF with proper settings
  const pdfPath = join(__dirname, '..', 'docs', 'EaseMail-User-Guide.pdf');

  console.log('📝 Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '1in',
      left: '0.75in'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 0 0.75in; display: flex; justify-content: space-between; color: #718096;">
        <span>EaseMail User Guide</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    preferCSSPageSize: false,
  });

  await browser.close();

  console.log('✅ PDF generated successfully!');
  console.log('📍 Location:', pdfPath);
}

generatePDF().catch(error => {
  console.error('❌ Error generating PDF:', error);
  process.exit(1);
});
