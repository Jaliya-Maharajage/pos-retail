const fs = require("fs");
const path = require("path");

const root = path.resolve(process.cwd(), "src", "app", "api");

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && e.name === "route.ts") yield full;
  }
}

const files = Array.from(walk(root));
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const original = src;

  // (req, params: { ... })  ->  (req, { params }: { ... })
  src = src.replace(
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,]+)\s*,\s*params\s*:\s*(\{[^)]*\})\s*\)/g,
    (_m, verb, firstArg, typeObj) => `export async function ${verb}(${firstArg}, { params }: ${typeObj})`
  );

  // (req, params)  ->  (req, { params })
  src = src.replace(
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,]+)\s*,\s*params\s*\)/g,
    (_m, verb, firstArg) => `export async function ${verb}(${firstArg}, { params })`
  );

  if (src !== original) {
    fs.copyFileSync(file, `${file}.bak`);
    fs.writeFileSync(file, src, "utf8");
    console.log("Fixed:", path.relative(process.cwd(), file));
    changed++;
  }
}

console.log(`Done. Updated ${changed} file(s).`);
