module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@assets': './src/assets',
            '@components': './src/components',
            '@features': './src/screens',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@context': './src/context',
            '@config': './src/constants',
            '@api' : './src/services',
          },
        },
      ],
      '@babel/plugin-transform-runtime',
      'react-native-reanimated/plugin',  
    ],
  };
};