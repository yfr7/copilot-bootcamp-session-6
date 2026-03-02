#!/usr/bin/env node


import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import { marked } from "marked";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  ktDir: path.resolve(__dirname, ".."),
  outputDir: path.resolve(__dirname, "..", "pdf"),
  templatesDir: path.resolve(__dirname, "templates"),
  mermaidCdnUrl:
    "https://cdn.jsdelivr.net/npm/mermaid@11.12.2/dist/mermaid.esm.min.mjs",
  pdfOptions: {
    format: "A4",
    margin: {
      top: "25mm",
      right: "20mm",
      bottom: "25mm",
      left: "20mm",
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        <span>{{TITLE}}</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; display: flex; justify-content: space-between; padding: 0 20mm; color: #666;">
        <span class="title"></span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  },
};

/**
 * Load HTML template
 */
async function loadTemplate() {
  const templatePath = path.join(CONFIG.templatesDir, "document.html");
  const stylesPath = path.join(CONFIG.templatesDir, "styles.css");

  const [template, styles] = await Promise.all([
    fs.readFile(templatePath, "utf-8"),
    fs.readFile(stylesPath, "utf-8"),
  ]);

  return { template, styles };
}

/**
 * Configure marked for custom rendering
 */
function configureMarked() {
  // Custom renderer for code blocks (to handle mermaid)
  const renderer = new marked.Renderer();

  renderer.code = function (code, language) {
    if (language === "mermaid") {
      return `<pre class="mermaid">${code}</pre>`;
    }
    return `<pre><code class="language-${language || "text"}">${escapeHtml(code)}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Parse markdown file with frontmatter
 */
async function parseMarkdown(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const { data: frontmatter, content: markdown } = matter(content);

  const html = marked(markdown);

  return {
    frontmatter,
    html,
    title:
      frontmatter.title || path.basename(filePath, ".md").replace(/^\d+-/, ""),
  };
}

/**
 * Build complete HTML document
 */
function buildHtml(template, styles, content, title) {
  return template
    .replace("{{STYLES}}", styles)
    .replace("{{TITLE}}", title)
    .replace("{{CONTENT}}", content)
    .replace("{{MERMAID_CDN}}", CONFIG.mermaidCdnUrl);
}

/**
 * Convert markdown file to PDF
 */
async function convertToPdf(inputPath, browser, template, styles) {
  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);

  console.log(`Converting: ${path.basename(absolutePath)}`);

  // Parse markdown
  const { html, title } = await parseMarkdown(absolutePath);

  // Build HTML document
  const fullHtml = buildHtml(template, styles, html, title);

  // Create output directory if needed
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Generate output path
  const outputFilename =
    path.basename(absolutePath, ".md").replace(/\s+/g, "-") + ".pdf";
  const outputPath = path.join(CONFIG.outputDir, outputFilename);

  // Create page and set content
  const page = await browser.newPage();

  await page.setContent(fullHtml, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  // Wait for Mermaid diagrams to render (check for actual SVG elements)
  const hasMermaid = await page.evaluate(
    () => document.querySelectorAll(".mermaid").length > 0
  );

  if (hasMermaid) {
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll(".mermaid")).every((el) =>
          el.querySelector("svg")
        ),
      { timeout: 10000 }
    );
  }

  // Generate PDF
  await page.pdf({
    path: outputPath,
    ...CONFIG.pdfOptions,
  });

  await page.close();

  console.log(`  -> ${outputPath}`);
  return outputPath;
}

/**
 * Find all markdown files in kt directory
 */
async function findMarkdownFiles() {
  const files = await fs.readdir(CONFIG.ktDir);
  return files
    .filter((f) => f.endsWith(".md") && f.match(/^\d+-/))
    .sort()
    .map((f) => path.join(CONFIG.ktDir, f));
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node convert-to-pdf.js <file.md>   Convert single file");
    console.log("  node convert-to-pdf.js --all       Convert all KT documents");
    process.exit(1);
  }

  // Configure marked
  configureMarked();

  // Load template
  console.log("Loading template...");
  const { template, styles } = await loadTemplate();

  // Launch browser
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    let files;

    if (args[0] === "--all") {
      files = await findMarkdownFiles();
      console.log(`Found ${files.length} documents to convert`);
    } else {
      files = args.filter((arg) => !arg.startsWith("-"));
    }

    if (files.length === 0) {
      console.error("No markdown files specified or found");
      process.exit(1);
    }

    // Convert each file
    const results = [];
    for (const file of files) {
      try {
        const outputPath = await convertToPdf(file, browser, template, styles);
        results.push({ file, outputPath, success: true });
      } catch (error) {
        console.error(`  Error: ${error.message}`);
        results.push({ file, error: error.message, success: false });
      }
    }

    // Summary
    console.log("\n--- Summary ---");
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`Converted: ${successful.length}/${results.length}`);

    if (failed.length > 0) {
      console.log("\nFailed:");
      failed.forEach((r) => console.log(`  - ${r.file}: ${r.error}`));
    }

    if (successful.length > 0) {
      console.log(`\nPDFs saved to: ${CONFIG.outputDir}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
