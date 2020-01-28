const YamlLocales = require('./yaml-locales');

const DEFAULT_YAML_FILE = './src/i18n-messages.yaml';
const DEFAULT_LANGUAGE = 'en';
const ONLY_SUPPORTED_LANGUAGES = true;
const MESSAGE_KEYS = ['message', 'msg', 'm'];
const DESCRIPTION_KEYS = ['description', 'desc', 'd'];
const DEFAULT_MESSAGE_ADDS = {};

class YamlLocalesWebpackPlugin {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.yamlFile='./src/i18n-messages.yaml']
   * @param {string} [options.defaultLanguage='en']
   * @param {boolean} [options.onlySupportedLanguages = true]
   * @param {string[]} [options.messageKeys=['message', 'msg', 'm']]
   * @param {string[]} [options.descriptionKeys=['description', 'desc', 'd']]
   * @param {Object} [options.messageAdditions={}]
   */
  constructor({
    yamlFile = DEFAULT_YAML_FILE,
    defaultLanguage = DEFAULT_LANGUAGE,
    onlySupportedLanguages = ONLY_SUPPORTED_LANGUAGES,
    messageKeys = MESSAGE_KEYS,
    descriptionKeys = DESCRIPTION_KEYS,
    messageAdditions = DEFAULT_MESSAGE_ADDS
  } = {}) {
    this.yamlFile = yamlFile;
    this.defaultLanguage = defaultLanguage;
    this.onlySupportedLanguages = onlySupportedLanguages;
    this.messageKeys = messageKeys;
    this.descriptionKeys = descriptionKeys;
    this.messageAdditions = messageAdditions;
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
              descriptionKeys: this.descriptionKeys,
              messageAdditions: this.messageAdditions
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
  descriptionKeys: DESCRIPTION_KEYS,
  messageAdditions: DEFAULT_MESSAGE_ADDS
};
