// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: [
      "projects/**/*.ts"
    ],
    ignores: [
      "projects/belomonte/**"
    ],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "max-classes-per-file": [
        "error",
        1
      ],
      "max-lines": [
        "error",
        450
      ],
      "complexity": [
        "error",
        {
          "max": 11
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "nostr",
          style: "camelCase"
        }
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "nostr",
          style: "kebab-case"
        }
      ],
      "@angular-eslint/no-output-native": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": [
            "typeProperty",
            "objectLiteralProperty"
          ],
          "custom": {
            "regex": "(^#[a-z\\d]+|^[a-z_\\d]+$|^[a-z\\d]+([A-Z\\d][a-z\\d]*)*$|^wss?://[a-z\\d]+(\\.[a-z\\d]+)+$)",
            "match": true
          },
          "format": null
        },
        {
          "selector": [
            "classProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor"
          ],
          "format": [
            "camelCase",
            "PascalCase"
          ]
        },

        {
          "selector": [
            "enumMember"
          ],
          "format": [
            "UPPER_CASE"
          ]
        }
      ],
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/member-delimiter-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": false
        }
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          "accessibility": "no-public"
        }
      ],
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          "assertionStyle": "as",
          "objectLiteralTypeAssertions": "allow-as-parameter"
        }
      ],
      "@typescript-eslint/no-use-before-define": "warn",
      "@typescript-eslint/prefer-as-const": [ "off" ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          "allowExpressions": true
        }
      ],
      "prefer-arrow/prefer-arrow-functions": "off",
      "for-direction": [ "off" ],
      "@typescript-eslint/no-this-alias": "off",
      "eqeqeq": "warn",
      "quotes": [
        "off"
      ],
      "arrow-parens": [
        "off",
        "always"
      ],
      "import/order": "off",
      "jsdoc/check-alignment": "off",
      "jsdoc/newline-after-description": "off",
      "no-empty": [
        "error",
        {
          "allowEmptyCatch": true
        }
      ],
      "no-unused-expressions": "warn",
      "no-eval": "warn",
      "arrow-body-style": [
        "off"
      ],
      "one-var": [
        "off",
        "never"
      ]
    },
  },
  {
    files: ["projects/**/*.html"],
    ignores: [
      "projects/belomonte/**"
    ],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/no-autofocus": "off",
      "@angular-eslint/template/click-events-have-key-events": "off"
    }
  }
);
