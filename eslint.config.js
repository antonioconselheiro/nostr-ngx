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
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "max-classes-per-file": [
        "error",
        1
      ],
      "max-lines": [
        "error",
        400
      ],
      "complexity": [
        "error",
        {
          "max": 7
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "nostr",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "nostr",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/no-output-native": [
        "off"
      ],
      "@angular-eslint/no-host-metadata-property": [
        "off"
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          "selector": [
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember"
          ],
          "format": [
            "camelCase",
            "PascalCase",
            "UPPER_CASE"
          ]
        }
      ],
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/member-delimiter-style": "off",
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
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/unbound-method": "error",
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          "ignoreEnums": true,
          "ignoreReadonlyClassProperties": true,
          "ignoreNumericLiteralTypes": true,
          "ignore": [
            0,
            1
          ]
        }
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          "assertionStyle": "as",
          "objectLiteralTypeAssertions": "allow-as-parameter"
        }
      ],
      "@typescript-eslint/no-use-before-define": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          "allowExpressions": true
        }
      ],
      "prefer-arrow/prefer-arrow-functions": "off",
      "for-direction": [ "off" ],
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
    ]
  }
);
