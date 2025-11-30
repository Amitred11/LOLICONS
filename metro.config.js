const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ❌ REMOVE any forced minifier
delete config.transformer.minifierPath;

// ✅ Optional: block useless folders for faster scanning
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/docs\/.*/,
  /.*\/\.git\/.*/,
];

module.exports = config;
