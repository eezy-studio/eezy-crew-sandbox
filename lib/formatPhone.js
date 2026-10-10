'use strict';

/** Format a primitive +1 E.164 string; no assignment or reachability checks. */
function formatPhone(e164) {
  // The length check also rejects a final newline, which $ can match before.
  if (typeof e164 !== 'string' || e164.length !== 12 || !/^\+1[0-9]{10}$/.test(e164)) {
    throw new Error('formatPhone: expected +1 followed by exactly 10 ASCII digits');
  }

  return `(${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8)}`;
}

module.exports = { formatPhone };
