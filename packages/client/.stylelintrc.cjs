module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer', 'theme', 'custom-variant'],
      },
    ],
    'import-notation': 'string',
    'lightness-notation': null,
    'hue-degree-notation': null,
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'oklch'],
      },
    ],
  },
};
