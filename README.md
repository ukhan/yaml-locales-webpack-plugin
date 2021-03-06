# YAML to Locales plugin for Webpack

Plugin for Webpack, which creates localization files of Google Chrome extension from one YAML file.

## Installation

```bash
# npm
npm install --save-dev yaml-locales-webpack-plugin

# yarn
yarn add --dev yaml-locales-webpack-plugin
```

## Usage

**webpack.config.js (simple usage)**

```javascript
const YamlLocalesWebpackPlugin = require('yaml-locales-webpack-plugin');

module.exports = {
  plugins: [new YamlLocalesWebpackPlugin()]
};
```

**webpack.config.js (with beta build)**

```javascript
const YamlLocalesWebpackPlugin = require('yaml-locales-webpack-plugin');

module.exports = (env, argv) => {
  plugins: [
    new YamlLocalesWebpackPlugin({
      messageAdditions: argv.beta
        ? {
            extName: ' (beta)',
            extDescription: {
              en: ' Beta version.',
              uk: ' Бета версія.'
            }
          }
        : {}
    })
  ];
};
```

## Options

```javascript
new YamlLocalesWebpackPlugin(options?: object)
```

| Name                     | Type       | Default                        | Description                                                     |
| :----------------------- | :--------- | :----------------------------- | :-------------------------------------------------------------- |
| `yamlFile`               | `string`   | `'./src/i18n-messages.yaml'`   | Path to the YAML file with translations                         |
| `defaultLanguage`        | `string`   | `'en'`                         | Default language                                                |
| `onlySupportedLanguages` | `boolean`  | `true`                         | Only [supported][langs] Chrome Web Store languages              |
| `messageKeys`            | `string[]` | `['message', 'msg', 'm']`      | Keys in the YAML file to describe messages                      |
| `descriptionKeys`        | `string[]` | `['description', 'desc', 'd']` | Keys in the YAML file for descriptions                          |
| `messageAdditions`       | `Object`   | `{}`                           | Additions for messages (see example in [Usage](#Usage) section) |

[langs]: https://developer.chrome.com/webstore/i18n#localeTable

## Example of a YAML file

```yaml
key_1: Message for key_1 (language-independent)
key_2:
  message: Message for key_2 (language-independent)
  description: Description for key_2 (language-independent)
key_3:
  m: Message for key_3 (language-independent)
  d: Description for key_3 (language-independent)
key_4:
  en: Message for key_4 (EN)
  ru: Сообщение для key_4 (RU)
  uk: Повідомлення для key_4 (UK)
key_5:
  en:
    m: Message for key_5 (EN)
    d: Description for key_5 (EN)
  uk: Повідомлення для key_5 (UK)
key_6:
  description: Description for key_6 (language-independent)
  en: Message for key_6 (EN)
  uk: Повідомлення для key_6 (UK)
key_7:
  message: Message for key_6 (language-independent)
  en:
    description: Description for key_6 (EN)
  uk:
    description: Опис для key_6 (UK)
```
