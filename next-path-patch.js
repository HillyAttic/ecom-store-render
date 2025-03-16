// This file patches the path.relative function to handle undefined arguments
const originalPath = require('path');

// Create a patched version of path.relative
const originalRelative = originalPath.relative;
originalPath.relative = function patchedRelative(from, to) {
  if (from === undefined || to === undefined) {
    console.warn('Warning: path.relative called with undefined arguments');
    return '';
  }
  return originalRelative(from, to);
};

module.exports = originalPath; 