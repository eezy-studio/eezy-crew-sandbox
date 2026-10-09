'use strict';

/**
 * Produce a lossy ASCII slug; empty outputs and collisions are allowed.
 * Accepts only primitive strings and has no dependencies or side effects.
 */
function slugify(text) {
  if (typeof text !== 'string') {
    throw new TypeError('slugify: text must be a string');
  }

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = { slugify };
