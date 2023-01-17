module.exports = {
  trailingComma: "all",
  endOfLine: "lf",
  overrides: [
    {
      files: ["**/.vscode/*.json", "**/tsconfig.json", "**/tsconfig.*.json"],
      options: {
        parser: "json5",
        quoteProps: "preserve",
      },
    },
    {
      files: ["**/*.xml"],
      options: {
        printWidth: 1000000,
      },
    },
  ],
  xmlWhitespaceSensitivity: "ignore",
};
