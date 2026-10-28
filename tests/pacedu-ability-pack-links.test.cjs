const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadLinks() {
  const window = {};
  const document = { createElement(tag) { return { tagName: tag, children: [], attrs: {}, style: '',
    appendChild(child) { this.children.push(child); },
    setAttribute(k, v) { this.attrs[k] = v; },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(k, fn) { this['on' + k] = fn; }
  }; } };
  vm.runInNewContext(fs.readFileSync('src/js/paceduAbilityPackLinks.js', 'utf8'), { window, document, String, Object });
  return { api: window.PacEduAbilityPackLinks, document };
}

test('matching draft packs resolve only for authored class and subject combinations', () => {
  const { api } = loadLinks();
  assert.match(api.getUrl('Class 1', 'English'), /class1-english-ability-pack\.md$/);
  assert.match(api.getUrl('Class 4', 'Mathematics'), /class4-mathematics-ability-pack\.md$/);
  assert.match(api.getUrl('Form 3', 'Science'), /form3-basic-science-ability-pack\.md$/);
  assert.equal(api.getUrl('Form 7', 'Chemistry'), '');
  assert.equal(api.getUrl('Class 5', 'English'), '');
});

test('teacher controls explain review status and hide unavailable links', () => {
  const { api, document } = loadLinks();
  function selector(value) { return { value, listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; } }; }
  const level = selector('Class 1');
  const subject = selector('English');
  const host = document.createElement('div');
  assert.equal(api.renderControls(host, { level, subject }), true);
  const box = host.children[0];
  const link = box.children.find(x => x.tagName === 'a');
  const status = box.children[box.children.length - 1];
  assert.match(link.href, /class1-english-ability-pack\.md$/);
  assert.match(status.textContent, /teacher review/i);
  level.value = 'Class 5';
  level.listeners.change();
  assert.equal(link.hidden, true);
  assert.match(status.textContent, /No matching draft pack/i);
});

test('existing download builder and app entry point load the link integration', () => {
  const builder = fs.readFileSync('src/js/paceduDownloadableClassPacks.js', 'utf8');
  const entry = fs.readFileSync('src/index.html', 'utf8');
  assert.match(builder, /PacEduAbilityPackLinks\.renderControls/);
  assert.match(entry, /paceduAbilityPackLinks\.js/);
});
