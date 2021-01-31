const fs = require('fs');

const yaml = require('js-yaml');

class YamlLocales {
  /**
   * Initial settings and load YAML file.
   * @param {Object} param
   * @param {string} param.yamlFile - path to YAML file
   * @param {string} param.defaultLanguage - default language code (e.g. 'en')
   * @param {boolean} param.onlySupportedLanguages
   * @param {string[]} param.messageKeys - valid keys for messages (e.g. ['message', 'msg', 'm'])
   * @param {string[]} param.descriptionKeys - valid keys for descriptions (e.g. ['description', 'desc', 'd'])
   * @param {Object} param.messageAdditions - additions for messages
   */
  constructor({
    yamlFile,
    defaultLanguage,
    onlySupportedLanguages,
    messageKeys,
    descriptionKeys,
    messageAdditions
  }) {
    this.yamlItems = yaml.load(fs.readFileSync(yamlFile, 'utf8')) || {};
    this.defaultLanguage = defaultLanguage;
    this.onlySupportedLanguages = onlySupportedLanguages;
    this.messageKeys = messageKeys;
    this.descriptionKeys = descriptionKeys;
    this.messageAdditions = messageAdditions;

    // {en: {key1: {message: 'Message'}, ...}, uk: {key1: {message: 'Повідомлення'}, ...}, ...}
    this.locales = {};
  }

  getLocales() {
    const keys = Object.keys(this.yamlItems);
    const keyLangs = {};

    keys.forEach(k => {
      const localItems = this.parseYamlItem({
        key: k,
        value: this.yamlItems[k]
      });

      keyLangs[k] = [];
      localItems.forEach(localItem => {
        const { key, message, description, language } = localItem;
        const spicedMessage = this.spiceMessage(key, language, message);

        this.addLocaleItem(key, spicedMessage, description, language);
        keyLangs[key].push(language || this.defaultLanguage);
      });
    });

    // Check and fix missing translations
    const langs = Object.keys(this.locales);
    keys.forEach(k => {
      if (langs.length !== keyLangs[k].length) {
        langs.forEach(l => {
          if (keyLangs[k].indexOf(l) === -1) {
            const substituteLang =
              keyLangs[k].indexOf(this.defaultLanguage) !== -1
                ? this.defaultLanguage
                : keyLangs[k][0];

            const { message, description } = this.locales[substituteLang][k];
            this.addLocaleItem(k, message, description, l);
          }
        });
      }
    });

    return this.locales;
  }

  /**
   * Add item to this.locales object.
   * @param {string} key - extName, extDescription and etc.
   * @param {string} message
   * @param {string} [description='']
   * @param {string} [language=this.defaultLanguage]
   */
  addLocaleItem(
    key,
    message,
    description = '',
    language = this.defaultLanguage
  ) {
    if (this.onlySupportedLanguages && !this.isSupportedLanguage(language)) {
      throw new Error(
        `Language '${language}' is not supported by Chrome Web Store.`
      );
    }

    const item = { message };
    if (description) {
      item.description = description;
    }

    if (!(language in this.locales)) {
      this.locales[language] = {};
    }

    this.locales[language][key] = item;
  }

  /**
   * Convert YAML item to Locale items.
   * @param {Object} yamlItem
   */
  parseYamlItem({ key, value }) {
    const localeItems = [];

    if (typeof value === 'string') {
      localeItems.push({ key, message: value });
    } else if (typeof value === 'object') {
      const langs = Object.keys(value);
      const message = this.getMessage(value);
      const description = this.getDescription(value);

      if (message && !langs.includes(this.defaultLanguage)) {
        const item = { key, message };
        if (description) {
          item.description = description;
        }
        localeItems.push(item);
      }

      langs.forEach(lang => {
        if (
          !this.messageKeys.includes(lang) &&
          !this.descriptionKeys.includes(lang)
        ) {
          const langValue = value[lang];
          const item = { key };
          if (message) {
            item.message = message;
          }
          if (description) {
            item.description = description;
          }

          if (typeof langValue === 'string') {
            item.message = langValue;
          } else if (typeof langValue === 'object') {
            const langMessage = this.getMessage(langValue);
            const langDescription = this.getDescription(langValue);

            if (langMessage) {
              item.message = langMessage;
            }
            if (langDescription) {
              item.description = langDescription;
            }
          }
          item.language = lang;

          if (item.message) {
            localeItems.push(item);
          }
        }
      });
    }

    return localeItems;
  }

  /**
   * Returns the value of the first key match from the keys array.
   * @param {Object} item
   * @param {string[]} keys
   * @returns {string|undefined}
   */
  // eslint-disable-next-line class-methods-use-this
  getKeysValue(item, keys) {
    let value;
    const key = Object.keys(item)
      .filter(k => keys.indexOf(k) !== -1)
      .pop();

    if (key && typeof item[key] === 'string') {
      value = item[key];
    }
    return value;
  }

  getMessage(item) {
    return this.getKeysValue(item, this.messageKeys);
  }

  spiceMessage(key, language, message) {
    const addsKeys = Object.keys(this.messageAdditions) || [];
    let spice = '';

    if (addsKeys.length && addsKeys.indexOf(key) !== -1) {
      if (typeof this.messageAdditions[key] === 'object') {
        if (Object.keys(this.messageAdditions[key]).indexOf(language) !== -1) {
          spice = this.messageAdditions[key][language];
        } else {
          spice = this.messageAdditions[key][this.defaultLanguage];
        }
      } else {
        spice = this.messageAdditions[key];
      }
    }

    return message + spice;
  }

  getDescription(item) {
    return this.getKeysValue(item, this.descriptionKeys);
  }

  /**
   * Checks for the submitted lang language in the list of supported languages.
   * @see {@link https://developer.chrome.com/webstore/i18n#localeTable}
   * @param {string} lang - language code (en, uk, ...)
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isSupportedLanguage(lang) {
    const supportedLanguages = [
      'ar',
      'am',
      'bg',
      'bn',
      'ca',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'en_GB',
      'en_US',
      'es',
      'es_419',
      'et',
      'fa',
      'fi',
      'fil',
      'fr',
      'gu',
      'he',
      'hi',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'kn',
      'ko',
      'lt',
      'lv',
      'ml',
      'mr',
      'ms',
      'nl',
      'no',
      'pl',
      'pt_BR',
      'pt_PT',
      'ro',
      'ru',
      'sk',
      'sl',
      'sr',
      'sv',
      'sw',
      'ta',
      'te',
      'th',
      'tr',
      'uk',
      'vi',
      'zh_CN',
      'zh_TW'
    ];
    return supportedLanguages.indexOf(lang) !== -1;
  }
}

module.exports = YamlLocales;
