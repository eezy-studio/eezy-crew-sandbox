# eezy-crew-sandbox

## formatPhoneUS

Requires Node.js 18 or newer; no dependencies. CommonJS usage:

```js
const { formatPhoneUS } = require('./lib/formatPhoneUS');
formatPhoneUS('9545551234');
// { display: '(954) 555-1234', href: 'tel:+19545551234' }
```

Run tests from the repository root:

```sh
node --test
```

Only primitive strings are accepted; other values return null without coercion.
All characters except ASCII digits 0–9 are discarded, including Unicode digits
(which are not converted), letters, punctuation and whitespace. Extension digits
are retained: `954555123 ext 4` is valid, but `9545551234 ext 99` is not.
Exactly 10 remaining digits are accepted, or 11 starting with 1 (that leading 1
is removed). Invalid lengths/prefixes return null. Each valid result is a new
plain object with only display and href string properties.

This is permissive normalization, not phone-number validation: there are no
area/exchange/reserved-code/geography checks, assignment or reachability checks,
or network requests. Even `0000000000` is accepted.
