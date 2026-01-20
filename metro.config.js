const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add epub to asset extensions
config.resolver.assetExts.push('epub');

// Exclude non-app folders from Metro bundler
// These folders contain Node.js-only code or development tools
const exclusionList = [
  /scripts\/.*/,        // CLI tools (ts-node)
  /\.worktrees\/.*/,    // Git worktrees
  /e2e\/.*/,            // E2E tests (Playwright)
  /openspec\/.*/,       // OpenSpec docs
  /docs\/.*/,           // Documentation
];

// Merge with existing blockList (if any)
const defaultBlockList = config.resolver.blockList || [];
config.resolver.blockList = Array.isArray(defaultBlockList)
  ? [...defaultBlockList, ...exclusionList]
  : exclusionList;

module.exports = config;
