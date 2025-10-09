const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Disable hierarchical lookup to prevent Metro from finding React in parent
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  'cloudinary-react-native': path.resolve(workspaceRoot, 'src'),
};

// Resolve to source files for local development
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force cloudinary-react-native to use source files
  if (moduleName === 'cloudinary-react-native') {
    return {
      filePath: path.resolve(workspaceRoot, 'src', 'index.tsx'),
      type: 'sourceFile',
    };
  }
  
  // Fall back to the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

// Enhanced resolver configuration to handle @babel/runtime issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for "./construct.js" error with proper path resolution
config.resolver.alias = {
  ...config.resolver.alias,
  './construct.js': path.resolve(__dirname, 'node_modules/@babel/runtime/helpers/construct.js'),
  './construct': path.resolve(__dirname, 'node_modules/@babel/runtime/helpers/construct.js'),
  // Force React and React Native to resolve from example's node_modules
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
};

// Additional resolver options for better module resolution
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

// 🚫 Exclude nested react-native versions using blockList
// For Metro >= 0.60, blockList is the standard property
config.resolver.blockList = [
  // Exclude react-native from parent node_modules to prevent duplicates
  new RegExp(`${workspaceRoot.replace(/\\/g, '/')}/node_modules/react-native/.*`),
  // Exclude react from parent node_modules to prevent duplicate React instances
  new RegExp(`${workspaceRoot.replace(/\\/g, '/')}/node_modules/react/.*`),
  new RegExp(`${workspaceRoot.replace(/\\/g, '/')}/node_modules/react-dom/.*`),
];

module.exports = config;
