const path = require("path");
const { PurgeCSS } = require("purgecss");

async function run() {
  const contentGlobs = [
    path.join(__dirname, "..", "src/**/*.{js,jsx}"),
    path.join(__dirname, "..", "public/index.html"),
  ];

  const cssGlobs = [path.join(__dirname, "..", "src/**/*.css")];

  const results = await new PurgeCSS().purge({
    content: contentGlobs,
    css: cssGlobs,
    safelist: [], // add dynamic classes here if they would otherwise be removed
    rejected: true, // force PurgeCSS to report selectors it would drop
    defaultExtractor: (content) =>
      content.match(/[\w-/:]+(?<!:)/g) || [], // JSX-friendly extractor
  });

  let totalRejected = 0;
  results.forEach(({ file, rejected }) => {
    if (rejected && rejected.length > 0) {
      totalRejected += rejected.length;
      console.log(`\n${file} — ${rejected.length} unused selectors:`);
      console.log(rejected.join(", "));
    }
  });

  if (totalRejected === 0) {
    console.log("No unused selectors detected by PurgeCSS.");
  }
}

run().catch((err) => {
  console.error("PurgeCSS scan failed:", err);
  process.exit(1);
});
