module.exports = {
  // Básico
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // JSX
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Outros
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  
  // Overrides para arquivos específicos
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
};