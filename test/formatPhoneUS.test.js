'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatPhoneUS } = require('../lib/formatPhoneUS');

const expected = { display: '(954) 555-1234', href: 'tel:+19545551234' };
for (const input of ['9545551234', '(954) 555-1234', '+1 (954) 555-1234',
  'abc9545551234', '1abc9545551234', '954555123 ext 4', '２9545551234',
  '9545551234９', '\t954\n555\r1234 ']) {
  test(`normalize ${JSON.stringify(input)}`, () => {
    const original = input;
    const actual = formatPhoneUS(input);
    assert.deepEqual(actual, expected);
    assert.equal(Object.getPrototypeOf(actual), Object.prototype);
    assert.deepEqual(Reflect.ownKeys(actual), ['display', 'href']);
    assert.equal(typeof actual.display, 'string');
    assert.equal(typeof actual.href, 'string');
    assert.deepEqual(formatPhoneUS(input), actual);
    assert.notEqual(formatPhoneUS(input), actual);
    assert.equal(input, original);
  });
}
for (const input of ['', '---', '954555123', '195455512345', '29545551234',
  '9545551234 ext 99', '９５４５５５１２３４', '٩٥٤٥٥٥١٢٣٤']) {
  test(`reject ${JSON.stringify(input)}`, () => {
    assert.equal(formatPhoneUS(input), null);
    assert.equal(formatPhoneUS(input), null);
  });
}
test('no area/exchange/reserved restrictions', () => {
  assert.deepEqual(formatPhoneUS('0000000000'), {
    display: '(000) 000-0000', href: 'tel:+10000000000',
  });
  for (const digits of ['1111111111', '2119110000', '9990001234']) {
    assert.deepEqual(formatPhoneUS(digits), {
      display: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
      href: `tel:+1${digits}`,
    });
    assert.deepEqual(formatPhoneUS('1' + digits), formatPhoneUS(digits));
  }
});
test('nonstrings do not throw, coerce or mutate', () => {
  let calls = 0;
  const throwing = () => { calls++; throw new Error('unexpected coercion'); };
  const hostile = Object.freeze({
    toString: throwing, valueOf: throwing, [Symbol.toPrimitive]: throwing,
  });
  const before = Object.getOwnPropertyDescriptors(hostile);
  const boxed = Object.freeze(new String('9545551234'));
  const array = Object.freeze(['9545551234']);
  for (const input of [null, undefined, true, false, 9545551234, 0, -1,
    NaN, Infinity, -Infinity, 9545551234n, Symbol('phone'), boxed, array,
    hostile, Object.freeze({}), () => '9545551234']) {
    assert.equal(formatPhoneUS(input), null);
  }
  assert.equal(calls, 0);
  assert.deepEqual(Object.getOwnPropertyDescriptors(hostile), before);
  assert.deepEqual(array, ['9545551234']);
  assert.equal(String.prototype.valueOf.call(boxed), '9545551234');
});
