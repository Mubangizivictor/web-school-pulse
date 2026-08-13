// Plain Node test runner (no framework/deps) that executes the *actual*
// register.astro inline script against a minimal fake DOM, so this test
// fails if the real file regresses rather than only testing a copy of the
// logic. Run with: node __tests__/register_location.test.cjs
//
// Regression coverage for the production bug: a Uganda location selected
// via autocomplete carried `formattedAddress` but no `address`, so the
// hidden #address field (and therefore the submitted payload) silently
// became empty even though the UI showed the Location step as complete.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  - ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  - ${name}`);
    console.log(`        ${error.stack || error.message}`);
  }
}

const source = fs.readFileSync(path.join(__dirname, '../src/pages/register.astro'), 'utf8');
const scriptMatch = source.match(/<script type="module" is:inline>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'could not locate the registration inline <script> block in register.astro');
let rawScript = scriptMatch[1];

// Strip the two Firebase Auth ESM imports - they're irrelevant to the pure
// location/payload logic under test and would otherwise require a real
// network-capable module loader. Stub functionsBaseUrl/auth so the
// script's top-level loadPlans() call doesn't throw at load time.
rawScript = rawScript.replace(/^\s*import[^\n]*\n/gm, '');
rawScript = 'const functionsBaseUrl = "https://example.test";\nconst auth = { currentUser: null };\n' + rawScript;

// Expose the page-scope functions under test on window - a real
// <script type="module"> keeps top-level bindings private to itself, so
// this line only exists for the test harness, not real page behavior.
rawScript += '\nwindow.__exposed = { resolveLocation, setLocationFields, payload, byId };\n';

// --- Minimal fake DOM -------------------------------------------------
function makeElement(id) {
  return {
    id,
    value: '',
    hidden: false,
    disabled: false,
    dataset: {},
    checked: false,
    textContent: '',
    innerHTML: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    getAttribute() { return null; },
    appendChild() {},
    closest() { return makeElement(`${id}-closest`); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {},
  };
}

// Every test gets a brand-new VM context (fresh module-level state like
// locationSelected, and a fresh element registry) so tests can never leak
// state into one another.
function loadFreshPage() {
  const elements = new Map();
  function byIdFake(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  }
  const documentStub = {
    getElementById: byIdFake,
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener() {},
    createElement: (tag) => makeElement(`created-${tag}`),
  };
  const localStorageStub = {
    _store: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; },
  };
  const sandbox = {
    document: documentStub,
    localStorage: localStorageStub,
    navigator: { geolocation: undefined },
    location: { search: '', href: '' },
    URLSearchParams,
    fetch: async () => ({ ok: false, json: async () => ({}) }),
    // loadPlans() fires-and-forgets a fetch at script load time and logs a
    // console.warn when it fails - expected and harmless here since fetch is
    // stubbed to always fail; silence it so test output stays readable.
    console: { ...console, warn() {} },
    setTimeout,
    clearTimeout,
    scrollTo() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(rawScript, sandbox, { filename: 'register.astro-inline-script.js' });
  return sandbox.__exposed;
}

// Fail fast if the script doesn't even load, rather than every test failing
// individually with a confusing error.
const smoke = loadFreshPage();
assert.equal(typeof smoke.resolveLocation, 'function', 'resolveLocation() must exist on the page script');
assert.equal(typeof smoke.setLocationFields, 'function', 'setLocationFields() must exist on the page script');
assert.equal(typeof smoke.payload, 'function', 'payload() must exist on the page script');

console.log('setLocationFields() - address fallback chain (the exact production bug)');

test('a location with formattedAddress but no address populates the hidden #address field', () => {
  const { setLocationFields, byId } = loadFreshPage();
  setLocationFields({
    locationName: 'Kampala',
    formattedAddress: 'Kampala, Central Region, Uganda',
    district: 'Kampala',
    region: 'Central',
    country: 'Uganda',
  });
  assert.equal(byId('address').value, 'Kampala, Central Region, Uganda');
});

test('legacy locations that already provide address are unaffected', () => {
  const { setLocationFields, byId } = loadFreshPage();
  setLocationFields({ locationName: 'Old Kampala', address: 'Old Kampala Road', district: 'Kampala', region: 'Central' });
  assert.equal(byId('address').value, 'Old Kampala Road');
});

test('manual location entry (address === area) still works', () => {
  const { setLocationFields, byId } = loadFreshPage();
  setLocationFields({ locationName: 'Kanyanya', address: 'Kanyanya', area: 'Kanyanya', district: 'Kampala', region: 'Central' });
  assert.equal(byId('address').value, 'Kanyanya');
});

test('a location with neither address nor formattedAddress falls back to locationName', () => {
  const { setLocationFields, byId } = loadFreshPage();
  setLocationFields({ locationName: 'Mbarara', district: 'Mbarara', region: 'Western' });
  assert.equal(byId('address').value, 'Mbarara');
});

console.log('\nresolveLocation() - the browser must not advance on locationSelected alone');

test('a fully-formed autocomplete selection resolves as valid', () => {
  const { setLocationFields, resolveLocation } = loadFreshPage();
  setLocationFields({ locationName: 'Kampala', formattedAddress: 'Kampala, Central Region, Uganda', district: 'Kampala', region: 'Central' });
  assert.equal(resolveLocation(), true);
});

test('no selection at all is invalid', () => {
  const { setLocationFields, resolveLocation } = loadFreshPage();
  setLocationFields(null);
  assert.equal(resolveLocation(), false);
});

test('a selection missing every address-like field is invalid (must fail before submission, not just at the API)', () => {
  const { setLocationFields, resolveLocation } = loadFreshPage();
  setLocationFields({ locationName: '', district: 'Kampala', region: 'Central' });
  assert.equal(resolveLocation(), false);
});

test('a selection missing district is invalid even if address is present', () => {
  const { setLocationFields, resolveLocation } = loadFreshPage();
  setLocationFields({ locationName: 'Kampala', formattedAddress: 'Kampala, Uganda', district: '', region: 'Central' });
  assert.equal(resolveLocation(), false);
});

console.log('\npayload() - resolved address never sent as empty/undefined when a selection exists');

test('payload().location.address uses the formattedAddress fallback even if the hidden field were somehow stale', () => {
  const { setLocationFields, payload, byId } = loadFreshPage();
  setLocationFields({ locationName: 'Kampala', formattedAddress: 'Kampala, Central Region, Uganda', district: 'Kampala', region: 'Central' });
  byId('address').value = ''; // simulate the hidden field not having been populated
  const body = payload();
  assert.equal(body.location.address, 'Kampala, Central Region, Uganda');
});

test('payload().location.address is never undefined when no location is selected', () => {
  const { payload } = loadFreshPage();
  const body = payload();
  assert.notEqual(body.location.address, undefined);
  assert.equal(body.location.address, '');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
