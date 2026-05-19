/**
 * Build the resume PDF from a markdown source.
 * Usage: node scripts/build-resume.mjs <source.md> <output.pdf>
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/build-resume.mjs <source.md> <output.pdf>');
  process.exit(1);
}
const SRC = resolve(inputArg);
const OUT = resolve(outputArg);

const md = readFileSync(SRC, 'utf-8');

// Minimal markdown → HTML (only what this resume needs: h1/h2/h3, **bold**, *italic*, hr, lists, links, blank-line paragraphs)
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  let para = [];
  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.map(inline).join('<br/>')}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^---+$/.test(line)) {
      flushPara();
      closeList();
      out.push('<hr/>');
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    closeList();
    para.push(line);
  }
  flushPara();
  closeList();
  return out.join('\n');
}

const body = mdToHtml(md);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Resume</title>
<style>
  @page { size: A4; margin: 12mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #111;
    font-size: 9.5pt;
    line-height: 1.35;
    margin: 0;
  }
  h1 { font-size: 19pt; margin: 0 0 1pt; letter-spacing: 0.5pt; }
  h1 + p strong { font-weight: 600; }
  h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: 1pt; color: #000; border-bottom: 1px solid #000; padding-bottom: 1.5pt; margin: 10pt 0 5pt; }
  h3 { font-size: 10.5pt; margin: 7pt 0 1pt; color: #000; }
  h4 { font-size: 10pt; margin: 5pt 0 1pt; color: #222; font-weight: 600; }
  p  { margin: 1pt 0 4pt; }
  ul { margin: 2pt 0 5pt 16pt; padding: 0; }
  li { margin: 1pt 0; }
  hr { border: 0; border-top: 0.5pt solid #ddd; margin: 5pt 0; }
  a { color: #000; text-decoration: none; border-bottom: 0.5pt solid #888; }
  strong { font-weight: 600; }
  em { color: #555; font-style: italic; }
  code { font-family: "SF Mono", Menlo, monospace; font-size: 9.5pt; }
  h3 + p em { display: block; color: #555; margin-bottom: 4pt; }
</style>
</head>
<body>
${body}
</body>
</html>`;

const tmpHtml = OUT.replace(/\.pdf$/, '.tmp.html');
writeFileSync(tmpHtml, html, 'utf-8');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('file://' + tmpHtml, { waitUntil: 'load' });
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', right: '18mm', bottom: '16mm', left: '18mm' },
});
await browser.close();
console.log(`Wrote ${OUT}`);
