// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    "expo",
    "prettier",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["prettier", "@typescript-eslint"],
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./"]],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
