'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify } = require('../lib/slugify');

// SPEC W1, Writer task t_ffa0a6bf. Escapes represent actual characters.
const stringCases = [
  ['TC01', 'Gel-X Full Set', 'gel-x-full-set'],
  ['TC02', 'Sơn gel chân', 'son-gel-chan'],
  ['TC03', 'Đắp bột', 'dap-bot'],
  ['TC04', 'SƠN GEL CHÂN', 'son-gel-chan'],
  ['TC05', 'ĐĐ đ', 'dd-d'],
  ['TC06', 'So\u031Bn gel cha\u0302n', 'son-gel-chan'],
  ['TC07', 'Mani & Pedi', 'mani-pedi'],
  ['TC08', 'Gel/Polish', 'gel-polish'],
  ['TC09', 'Gel+Spa', 'gel-spa'],
  ['TC10', 'Gel_X.Full', 'gel-x-full'],
  ['TC11', '  Gel   X  ', 'gel-x'],
  ['TC12', 'Gel\tX\nSet', 'gel-x-set'],
  ['TC13', 'Gel\u00A0X', 'gel-x'],
  ['TC14', '--Gel---X--', 'gel-x'],
  ['TC15', 'Gel–X—Set', 'gel-x-set'],
  ['TC16', "Men's Cut", 'men-s-cut'],
  ['TC17', 'Gel💅X', 'gel-x'],
  ['TC18', 'Gel 2.0', 'gel-2-0'],
  ['TC19', '', ''],
  ['TC20', ' \t\n\u00A0 ', ''],
  ['TC21', '&/+---', ''],
  ['TC22', '\u0301\u0302', ''],
  ['TC23', 'a\u1AB0b', 'ab'],
  ['TC24', '美甲', ''],
  ['TC25', 'aßb œ', 'a-b'],
  ['TC26', 'ＡＢＣ １２３', ''],
];

for (const [id, input, expected] of stringCases) {
  test(`${id}: ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
    assert.equal(slugify(input), expected);
  });
}

const invalidCases = [
  ['TC27', null],
  ['TC28', undefined],
  ['TC29', 123],
  ['TC30', true],
  ['TC31', []],
  ['TC32', {}],
  ['TC33', new String('Gel')],
];
const expectedError = {
  name: 'TypeError',
  message: 'slugify: text must be a string',
};

for (const [id, input] of invalidCases) {
  test(`${id}: reject non-primitive-string without mutation`, () => {
    const before = input !== null && typeof input === 'object'
      ? Object.getOwnPropertyDescriptors(input) : undefined;
    assert.throws(() => slugify(input), expectedError);
    if (before !== undefined) {
      assert.deepEqual(Object.getOwnPropertyDescriptors(input), before);
    }
  });
}

test('TC34: collisions are allowed without suffixes', () => {
  assert.equal(slugify('Sơn'), 'son');
  assert.equal(slugify('Son'), 'son');
});

test('TC35: existing slug is unchanged', () => {
  assert.equal(slugify('gel-x-full-set'), 'gel-x-full-set');
});

test('TC36: TC01–TC26 have equivalent NFD outputs', () => {
  for (const [id, input, expected] of stringCases) {
    assert.equal(slugify(input), expected, id);
    assert.equal(slugify(input.normalize('NFD')), expected, `${id} NFD`);
  }
});

test('TC37: TC01–TC26 are deterministic across independent calls', () => {
  for (const [id, input, expected] of stringCases) {
    assert.equal(slugify(input), expected, `${id} first call`);
    assert.equal(slugify(input), expected, `${id} second call`);
  }
});

test('TC38: TC01–TC26 are idempotent and match the ASCII output contract', () => {
  for (const [id, input, expected] of stringCases) {
    const actual = slugify(input);
    assert.equal(actual, expected, id);
    assert.equal(slugify(actual), expected, `${id} idempotence`);
    if (actual !== '') {
      assert.match(actual, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, id);
    }
  }
});

test('TC39: long strings are not truncated', () => {
  const actual = slugify('A'.repeat(300));
  assert.equal(actual, 'a'.repeat(300));
  assert.equal(actual.length, 300);
});

test('AC6: missing argument and other nonstrings throw without coercion', () => {
  assert.throws(() => slugify(), expectedError);
  let coercions = 0;
  const hostile = Object.freeze({
    toString() { coercions++; throw new Error('unexpected coercion'); },
    valueOf() { coercions++; throw new Error('unexpected coercion'); },
    [Symbol.toPrimitive]() { coercions++; throw new Error('unexpected coercion'); },
  });
  const before = Object.getOwnPropertyDescriptors(hostile);
  for (const input of [hostile, false, NaN, Infinity, 1n, Symbol('slug'), () => 'Gel']) {
    assert.throws(() => slugify(input), expectedError);
  }
  assert.equal(coercions, 0);
  assert.deepEqual(Object.getOwnPropertyDescriptors(hostile), before);
});

test('AC4: remove Mn, Mc, Me and astral marks, not just the basic block', () => {
  for (const mark of ['\u0301', '\u0903', '\u20DD', '\u{1D165}']) {
    assert.equal(slugify(`a${mark}b`), 'ab');
  }
});
