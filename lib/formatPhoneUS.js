'use strict';

function formatPhoneUS(input) {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return {
    display: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
    href: `tel:+1${digits}`,
  };
}

module.exports = { formatPhoneUS };
