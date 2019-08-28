const YamlLocales = require('./yaml-locales');

const DEFAULT_YAML_FILE = './src/i18n-messages.yaml';
const DEFAULT_LANGUAGE = 'en';
const ONLY_SUPPORTED_LANGUAGES = true;
const MESSAGE_KEYS = ['message', 'msg', 'm'];
const DESCRIPTION_KEYS = ['description', 'desc', 'd'];

class YamlLocalesWebpackPlugin {
  /**
   * @param {Object} [options={}]
   * @param {string} [Object.yamlFile='./src/i18n-messages.yaml']
   * @param {string} [Object.defaultLanguage='en']
   * @param {boolean} [Object.onlySupportedLanguages = true]
   * @param {string[]} [Object.messageKeys=['message', 'msg', 'm']]
   * @param {string[]} [Object.descriptionKeys=['description', 'desc', 'd']]
   */
  constructor({
    yamlFile = DEFAULT_YAML_FILE,
    defaultLanguage = DEFAULT_LANGUAGE,
    onlySupportedLanguages = ONLY_SUPPORTED_LANGUAGES,
    messageKeys = MESSAGE_KEYS,
    descriptionKeys = DESCRIPTION_KEYS
  } = {}) {
    this.yamlFile = yamlFile;
    this.defaultLanguage = defaultLanguage;
    this.onlySupportedLanguages = onlySupportedLanguages;
    this.messageKeys = messageKeys;
    this.descriptionKeys = descriptionKeys;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('YamlLocalesWebpackPlugin ', compilation => {
      compilation.hooks.additionalAssets.tapAsync(
        'YamlLocalesWebpackPlugin',
        callback => {
          try {
            const yamlLocales = new YamlLocales({
              yamlFile: this.yamlFile,
              defaultLanguage: this.defaultLanguage,
              onlySupportedLanguages: this.onlySupportedLanguages,
              messageKeys: this.messageKeys,
              descriptionKeys: this.descriptionKeys
            });

            const locales = yamlLocales.getLocales();
            const languages = Object.keys(locales);

            languages.forEach(lang => {
              const messages = JSON.stringify(locales[lang], null, 2);
              compilation.assets[`_locales/${lang}/messages.json`] = {
                source() {
                  return messages;
                },
                size() {
                  return messages.length;
                }
              };
            });
          } catch (error) {
            callback(error);
          }

          callback();
        }
      );
    });
  }
}

module.exports = YamlLocalesWebpackPlugin;

module.exports.defaultSettings = {
  yamlFile: DEFAULT_YAML_FILE,
  defaultLanguage: DEFAULT_LANGUAGE,
  onlySupportedLanguages: ONLY_SUPPORTED_LANGUAGES,
  messageKeys: MESSAGE_KEYS,
  descriptionKeys: DESCRIPTION_KEYS
};
