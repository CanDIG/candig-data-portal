import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        root: true,
        env: {
            browser: true,
            es2021: true
        },
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            'airbnb',
            'prettier',
            'plugin:jsx-a11y/recommended',
            'plugin:react-hooks/recommended',
            'plugin:react/recommended',
            'plugin:react/jsx-runtime'
        ],
        settings: {
            'import/resolver': {
                node: {
                    moduleDirectory: ['node_modules', 'src/']
                }
            }
        },
        parser: '@babel/eslint-parser',
        parserOptions: {
            ecmaFeatures: {
                experimentalObjectRestSpread: true,
                impliedStrict: true
            },
            ecmaVersion: 2020
        },
        plugins: {
            prettier: {},
            react: {},
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'react/jsx-filename-extension': 0,
            'no-param-reassign': 0,
            'react/prop-types': 1,
            'react/require-default-props': 0,
            'react/no-array-index-key': 0,
            'react/jsx-props-no-spreading': 0,
            'react/forbid-prop-types': 0,
            'import/order': 0,
            'no-console': 0,
            'jsx-a11y/anchor-is-valid': 0,
            'prefer-destructuring': 0,
            'no-shadow': 0,
            'no-unused-vars': [
                1,
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    ignoreRestSiblings: false
                }
            ],
            'prettier/prettier': [
                2,
                {
                    bracketSpacing: true,
                    printWidth: 140,
                    singleQuote: true,
                    trailingComma: 'none',
                    tabWidth: 4,
                    useTabs: false,
                    endOfLine: 'auto',
                    camelcase: 'off'
                }
            ]
        }
    }
);
