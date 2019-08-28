const YamlLocales = require('../src/yaml-locales');
const { defaultSettings } = require('../src/plugin');

const testSettings = { ...defaultSettings };
testSettings.yamlFile = defaultSettings.yamlFile.replace('/src/', '/test/');

describe('Check settings', () => {
  test('default settings ok', () => {
    expect(defaultSettings.yamlFile).toBe('./src/i18n-messages.yaml');
    expect(defaultSettings.defaultLanguage).toBe('en');
    expect(defaultSettings.messageKeys).toEqual(['message', 'msg', 'm']);
    expect(defaultSettings.descriptionKeys).toEqual([
      'description',
      'desc',
      'd'
    ]);
  });

  test('test settings ok', () => {
    expect(testSettings.yamlFile).toBe('./test/i18n-messages.yaml');
  });
});

describe('Load YAML file', () => {
  test('load with default settings', () => {
    const yamlLocales = new YamlLocales(testSettings);
    expect(Object.keys(yamlLocales.yamlItems).length).toBe(7);
    expect(yamlLocales.yamlItems.key_1).toBe(
      'Message for key_1 (default language)'
    );
    expect(yamlLocales.yamlItems.key_4).toEqual({
      en: 'Message for key_4 (EN)',
      ru: 'Сообщение для key_4 (RU)',
      uk: 'Повідомлення для key_4 (UK)'
    });
  });
});

describe('Check Locales object', () => {
  let yamlLocales;

  beforeEach(() => {
    yamlLocales = new YamlLocales(testSettings);
  });

  test('locales is empty at the beginning', () => {
    expect(yamlLocales.locales).toEqual({});
  });

  test('adds one message for default language', () => {
    yamlLocales.addLocaleItem('en_key_1', 'Message 1');
    expect(yamlLocales.locales).toEqual({
      en: { en_key_1: { message: 'Message 1' } }
    });
  });

  test('adds two messages for default language', () => {
    yamlLocales.addLocaleItem('en_key_1', 'Message 1');
    yamlLocales.addLocaleItem('en_key_2', 'Message 2', 'Description 2');
    expect(yamlLocales.locales).toEqual({
      en: {
        en_key_1: { message: 'Message 1' },
        en_key_2: { message: 'Message 2', description: 'Description 2' }
      }
    });
  });

  test('adds messages for two languages', () => {
    yamlLocales.addLocaleItem('en_key_1', 'Message 1 (EN)');
    yamlLocales.addLocaleItem(
      'uk_key_1',
      'Message 1 (UK)',
      'Description 1 (UK)',
      'uk'
    );
    expect(yamlLocales.locales).toEqual({
      en: {
        en_key_1: { message: 'Message 1 (EN)' }
      },
      uk: {
        uk_key_1: {
          message: 'Message 1 (UK)',
          description: 'Description 1 (UK)'
        }
      }
    });
  });
});

describe('Parse YAML items', () => {
  const yamlLocales = new YamlLocales(testSettings);
  const keys = Object.keys(yamlLocales.yamlItems);
  const values = Object.values(yamlLocales.yamlItems);

  test('empty item', () => {
    expect(yamlLocales.parseYamlItem({})).toEqual([]);
  });

  test('item with string value', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[0], value: values[0] })
    ).toEqual([
      {
        key: 'key_1',
        message: 'Message for key_1 (default language)'
      }
    ]);
  });

  test('message and description for default language', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[1], value: values[1] })
    ).toEqual([
      {
        key: 'key_2',
        message: 'Message for key_2 (default language)',
        description: 'Description for key_2 (default language)'
      }
    ]);
  });

  test('messages for multiple languages', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[3], value: values[3] })
    ).toEqual([
      {
        key: 'key_4',
        message: 'Message for key_4 (EN)',
        language: 'en'
      },
      {
        key: 'key_4',
        message: 'Сообщение для key_4 (RU)',
        language: 'ru'
      },
      {
        key: 'key_4',
        message: 'Повідомлення для key_4 (UK)',
        language: 'uk'
      }
    ]);
  });

  test('messages for multiple languages with descriptions', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[4], value: values[4] })
    ).toEqual([
      {
        key: 'key_5',
        message: 'Message for key_5 (EN)',
        description: 'Description for key_5 (EN)',
        language: 'en'
      },
      {
        key: 'key_5',
        message: 'Повідомлення для key_5 (UK)',
        language: 'uk'
      }
    ]);
  });

  test('messages for multiple languages with shared descriptions', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[5], value: values[5] })
    ).toEqual([
      {
        key: 'key_6',
        message: 'Message for key_6 (EN)',
        description: 'Description for key_6 (language-independent)',
        language: 'en'
      },
      {
        key: 'key_6',
        message: 'Повідомлення для key_6 (UK)',
        description: 'Description for key_6 (language-independent)',
        language: 'uk'
      }
    ]);
  });

  test('language-independent message', () => {
    expect(
      yamlLocales.parseYamlItem({ key: keys[6], value: values[6] })
    ).toEqual([
      {
        key: 'key_7',
        message: 'Message for key_6 (language-independent)',
        description: 'Description for key_6 (EN)',
        language: 'en'
      },
      {
        key: 'key_7',
        message: 'Message for key_6 (language-independent)',
        description: 'Опис для key_6 (UK)',
        language: 'uk'
      }
    ]);
  });
});

describe('Get message and description from YAML object', () => {
  const yamlLocales = new YamlLocales(testSettings);
  const item = {
    m: 'm_message',
    msg: 'msg_message',
    message: 'message_message',
    d: 'd_description',
    desc: 'desc_description',
    description: 'description_description',
    en: 'en_message',
    uk: 'uk_message'
  };

  test('getKeysValue', () => {
    expect(yamlLocales.getKeysValue(item, ['m', 'msg'])).toBe('msg_message');
  });

  test('getKeysValue is undefined', () => {
    expect(yamlLocales.getKeysValue(item, ['z', 'zz'])).toBeUndefined();
  });

  test('getMessage', () => {
    expect(yamlLocales.getMessage(item)).toBe('message_message');
  });

  test('getDescription', () => {
    expect(yamlLocales.getDescription(item)).toBe('description_description');
  });
});

describe('Add and get locales', () => {
  const yamlLocales = new YamlLocales(testSettings);
  const locales = yamlLocales.getLocales();
  const languages = Object.keys(locales);

  test('locales languages', () => {
    expect(languages).toEqual(['en', 'ru', 'uk']);
  });

  test('EN locale', () => {
    const enLocale = locales.en;
    expect(Object.keys(enLocale).length).toBe(7);
  });

  test('RU locale', () => {
    const ruLocale = locales.ru;
    expect(Object.keys(ruLocale).length).toBe(1);
  });

  test('UK locale', () => {
    const ukLocale = locales.uk;
    expect(Object.keys(ukLocale).length).toBe(4);
  });
});
