const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.transformer.minifierPath = 'metro-minify-terser';

// Optional but helps module scanning:
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/docs\/.*/,
];

module.exports = config;
