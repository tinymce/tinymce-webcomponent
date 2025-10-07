// eslint.config.js
import { defineConfig } from "eslint/config";
import tinymceEslintPlugin from "@tinymce/eslint-plugin";

export default defineConfig([
	{
        plugins: {
            "@tinymce": tinymceEslintPlugin
        },
        extends: [
            "@tinymce/standard"
        ],
        languageOptions: {
            parserOptions: {
                sourceType: "module",
                project: [
                    "./tsconfig.json"
                ]
            },
        },
        rules: {
            "no-underscore-dangle": "off",
            "@typescript-eslint/explicit-member-accessibility": "off",
            "@tinymce/prefer-fun": "off",
            "@typescript-eslint/member-ordering": "off",
            "quote-props": [
                2,
                "consistent-as-needed",
                {
                    keywords: false
                }
            ]
        }
    }
]);
