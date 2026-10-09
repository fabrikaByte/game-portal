import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
  const full = join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const allFiles = walk(root);
const codeFiles = allFiles.filter(file => ['.js','.mjs'].includes(extname(file)));
let syntaxErrors = 0;
for (const file of codeFiles) {
  const checked = spawnSync(process.execPath, ['--input-type=module','--check'], {input:readFileSync(file,'utf8'), encoding:'utf8'});
  if (checked.status !== 0) {
    syntaxErrors++;
    console.error(`ESM SYNTAX FAIL: ${relative(root,file)}\n${checked.stderr || checked.stdout}`);
  }
}
assert.equal(syntaxErrors, 0, 'all JavaScript must parse as ES modules');
console.log(`ESM_SYNTAX=PASS (${codeFiles.length} files)`);

// The Browser Smoke page contains an inline ES module; parse it with module grammar too.
const smokeHtml = readFileSync(join(root,'tests/browser-smoke/index.html'),'utf8');
const inlineModules = [...smokeHtml.matchAll(/<script\s+type=\"module\"[^>]*>([\s\S]*?)<\/script>/gi)];
assert(inlineModules.length >= 1, 'browser smoke page has no inline module');
for (const moduleMatch of inlineModules) {
  const result = spawnSync(process.execPath,['--input-type=module','--check'],{input:moduleMatch[1],encoding:'utf8'});
  assert.equal(result.status,0,`browser smoke inline module syntax: ${result.stderr}`);
}
console.log(`BROWSER_SMOKE_MODULE_SYNTAX=PASS (${inlineModules.length} modules)`);

const refs = [];
for (const file of allFiles.filter(f => ['.js','.mjs','.html'].includes(extname(f)) && relative(root,f) !== 'tests/run-all.mjs')) {
  const src = readFileSync(file,'utf8');
  const patterns = [/(?:from\s*|import\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g, /(?:src|href)\s*=\s*['"](\.{1,2}\/[^'"]+)['"]/g];
  for (const pattern of patterns) {
    for (const match of src.matchAll(pattern)) refs.push({file, ref:match[1]});
  }
}
const broken = refs.filter(({file,ref}) => { const clean=ref.split(/[?#]/)[0]; return clean && !existsSync(resolve(dirname(file), clean)); });
assert.deepEqual(broken, [], `broken relative imports/links: ${broken.map(x=>relative(root,x.file)+' -> '+x.ref).join(', ')}`);
console.log(`LOCAL_IMPORTS_AND_LINKS=PASS (${refs.length} refs)`);
const publicGameDirs = readdirSync(join(root,'games'),{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>entry.name);
assert.deepEqual(publicGameDirs,['_engine-test'],'the engine-only build must contain no public game folders');
console.log('ENGINE_TEST_ONLY_LAYOUT=PASS');

const importProbe = spawnSync(process.execPath,['--input-type=module','-e',`await import('./framework/index.js'); await import('./ui/game-shell.js'); console.log('FRAMEWORK_AND_UI_IMPORT_GRAPH=PASS')`],{cwd:root,encoding:'utf8'});
assert.equal(importProbe.status,0,`framework/UI runtime import graph failed: ${importProbe.stderr}`);
process.stdout.write(importProbe.stdout);

const childTests = [
  'tests/engine-core.test.mjs',
  'tests/advanced-systems.test.mjs',
  'tests/engine-architecture.test.mjs',
  'tests/input-regressions.test.mjs',
  'tests/engine-test-entry.test.mjs',
];
for (const test of childTests) {
  const result = spawnSync(process.execPath, [test], {cwd:root, encoding:'utf8'});
  if (result.status !== 0) {
    console.error(result.stdout); console.error(result.stderr);
    process.exit(result.status || 1);
  }
  process.stdout.write(result.stdout);
}
console.log('ALL_AUTOMATED_TESTS=PASS');
