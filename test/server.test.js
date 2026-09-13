import assert from 'node:assert';
import fs from 'node:fs';

console.log('Running Visit Wolaita test suite...');

// Test 1: package.json validation
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
assert.strictEqual(pkg.name, 'visit-wolaita');
console.log('✓ package.json name verified');

// Test 2: server.js integrity
const serverSrc = fs.readFileSync('./server.js', 'utf8');
assert.ok(serverSrc.includes('/api/health'), 'server.js contains health route');
assert.ok(serverSrc.includes('/api/info'), 'server.js contains info route');
assert.ok(serverSrc.includes('/api/emergency'), 'server.js contains emergency route');
assert.ok(serverSrc.includes('/api/currencies'), 'server.js contains currencies route');
console.log('✓ server routes verified');

// Test 3: index.html landmark checks
const indexHtml = fs.readFileSync('./index.html', 'utf8');
assert.ok(indexHtml.includes('Mount Damota'), 'index.html contains Mount Damota');
assert.ok(indexHtml.includes('Ajora'), 'index.html contains Ajora Falls');
console.log('✓ index.html destinations verified');

console.log('All smoke tests passed successfully!');
