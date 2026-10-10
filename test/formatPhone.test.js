'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatPhone } = require('../lib/formatPhone');

const validCases = [
  ['+19544243682', '(954) 424-3682'],
  ['+12125551234', '(212) 555-1234'],
  ['+10000000000', '(000) 000-0000'],
  ['+19999999999', '(999) 999-9999'],
  ['+10123456789', '(012) 345-6789'],
  ['+11111111111', '(111) 111-1111'],
  ['+12119110000', '(211) 911-0000'],
];

for (const [input, expected] of validCases) {
  test(`format ${input} exactly and deterministically`, () => {
    const original = input;
    assert.equal(typeof formatPhone, 'function');
    assert.equal(formatPhone(input), expected);
    assert.equal(formatPhone(input), expected);
    assert.equal(input, original);
  });
}

const invalidStrings = [
  '', '+1', '+1954424368', '+195442436820',
  '+29544243682', '+449544243682', '+09544243682',
  '19544243682', '9544243682', '++19544243682', 'tel:+19544243682',
  ' +19544243682', '+19544243682 ', '\t+19544243682',
  '+19544243682\n', '+19544243682\r', '+19544243682\r\n',
  '\n+19544243682', '+1954\n4243682', '+19544243682\u2028',
  '+19544243682\u2029', '+19544243682\u00a0',
  '+1(954)424-3682', '+1 954 424 3682', '+1954.424.3682',
  '+1954424368a', '+19544243682 ext 1', '+19544243682\0',
  '+１９５４４２４３６８２', '+1٩٥٤٤٢٤٣٦٨٢', '+1954424368２',
  '＋19544243682', '+19544243682９',
];

for (const input of invalidStrings) {
  test(`reject invalid string ${JSON.stringify(input)}`, () => {
    assert.throws(() => formatPhone(input), Error);
  });
}

const nonstrings = [
  ['null', null], ['undefined', undefined], ['number', 19544243682],
  ['zero', 0], ['NaN', NaN], ['Infinity', Infinity],
  ['true', true], ['false', false], ['object', Object.freeze({})],
  ['array', Object.freeze(['+19544243682'])],
  ['boxed String', Object.freeze(new String('+19544243682'))],
  ['BigInt', 19544243682n], ['Symbol', Symbol('phone')],
  ['function', () => '+19544243682'],
];

for (const [label, input] of nonstrings) {
  test(`reject ${label} without mutation`, () => {
    const before = input !== null && typeof input === 'object'
      ? Object.getOwnPropertyDescriptors(input) : undefined;
    assert.throws(() => formatPhone(input), Error);
    if (before !== undefined) {
      assert.deepEqual(Object.getOwnPropertyDescriptors(input), before);
    }
  });
}

test('missing argument throws Error', () => {
  assert.throws(() => formatPhone(), Error);
});

test('throwing conversion hooks are never called', () => {
  let calls = 0;
  const throwing = () => { calls++; throw new Error('unexpected coercion'); };
  const hostile = Object.freeze({
    toString: throwing,
    valueOf: throwing,
    [Symbol.toPrimitive]: throwing,
  });
  const before = Object.getOwnPropertyDescriptors(hostile);
  assert.throws(() => formatPhone(hostile), Error);
  assert.equal(calls, 0);
  assert.deepEqual(Object.getOwnPropertyDescriptors(hostile), before);
});
