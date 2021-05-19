/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
//     (c) 2012-2016 Airbnb, Inc.
//
//     polyglot.js may be freely distributed under the terms of the BSD
//     license. For all licensing information, details, and documention:
//     http://airbnb.github.com/polyglot.js
//
//
// Polyglot.js is an I18n helper library written in JavaScript, made to
// work both in the browser and in Node. It provides a simple solution for
// interpolation and pluralization, based off of Airbnb's
// experience adding I18n functionality to its Backbone.js and Node apps.
//
// Polylglot is agnostic to your translation backend. It doesn't perform any
// translation; it simply gives you a way to manage translated phrases from
// your client- or server-side JavaScript application.
//

let root = window
let replace = String.prototype.replace;
var delimeter = '||||';

var pluralTypes :Record<string, any> = {
  "chinese":   function(n?:any) { return 0; },
  "german":    function(n?:any) { return n !== 1 ? 1 : 0; },
  "french":    function(n?:any) { return n > 1 ? 1 : 0; },
  "russian":   function(n?:any) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
  "czech":     function(n?:any) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
  "polish":    function(n?:any) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
  "icelandic": function(n?:any) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
};

// Mapping from pluralization group to individual locales.
var pluralTypeToLanguages = {
  "chinese":   ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
  "german":    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
  "french":    ['fr', 'tl', 'pt-br'],
  "russian":   ['hr', 'ru'],
  "czech":     ['cs', 'sk'],
  "polish":    ['pl'],
  "icelandic": ['is']
};

var trimRe = /^\s+|\s+$/g;
function trim(str:string){
  return str.replace(trimRe, "");
}

function warn(message:any) {
  root.console && root.console.warn && root.console.warn('WARNING: ' + message);
}

function clone(source?:any) {
  var ret: any = {};
  for (var prop in source) {
    ret[prop] = source[prop];
  }
  return ret;
}

var dollarRegex = /\$/g;
var dollarBillsYall = '$$$$';
function interpolate(phrase?:any, options?:any) {
  for (var arg in options) {
    if (arg !== '_' && options.hasOwnProperty(arg)) {
      // Ensure replacement value is escaped to prevent special $-prefixed
      // regex replace tokens. the "$$$$" is needed because each "$" needs to
      // be escaped with "$" itself, and we need two in the resulting output.
      var replacement = options[arg];
      if (typeof replacement === 'string') {
        replacement = options[arg].replace(dollarRegex, dollarBillsYall);
      }
      // We create a new `RegExp` each time instead of using a more-efficient
      // string replace so that the same argument can be replaced multiple times
      // in the same phrase.
      phrase = replace.call(phrase, new RegExp('%\\{'+arg+'\\}', 'g'), replacement);
    }
  }
  return phrase;
}

function choosePluralForm(text?:any, locale?:any, count?:any){
  var ret, texts, chosenText;
  if (count != null && text) {
    texts = text.split(delimeter);
    chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];
    ret = trim(chosenText);
  } else {
    ret = text;
  }
  return ret;
}

function langToTypeMap(mapping?:any) {
  var type, langs, l, ret:any = {};
  for (type in mapping) {
    if (mapping.hasOwnProperty(type)) {
      langs = mapping[type];
      for (l in langs) {
        ret[langs[l]] = type;
      }
    }
  }
  return ret;
}

function pluralTypeName(locale?:any) : string {
  var langToPluralType = langToTypeMap(pluralTypeToLanguages);
  return langToPluralType[locale] || langToPluralType.en;
}

function pluralTypeIndex(locale?:any, count?:any) {
  return pluralTypes[pluralTypeName(locale)](count);
}

export class Polyglot {
  phrases: any;
  currentLocale: any;
  allowMissing: boolean;
  warn: any;
  static VERSION = '1.0.0'
  constructor(options: any) {
    options = options || {};
    this.phrases = {};
    this.extend(options.phrases || {});
    this.currentLocale = options.locale || 'en';
    this.allowMissing = !!options.allowMissing;
    this.warn = options.warn || warn;
  }

  extend(morePhrases?:any, prefix?:any) {
    var phrase;

    for (var key in morePhrases) {
      if (morePhrases.hasOwnProperty(key)) {
        phrase = morePhrases[key];
        if (prefix) key = prefix + '.' + key;
        if (typeof phrase === 'object') {
          this.extend(phrase, key);
        } else {
          this.phrases[key] = phrase;
        }
      }
    }
  };

  locale(newLocale?:any) {
    if (newLocale) this.currentLocale = newLocale;
    return this.currentLocale;
  };

  unset(morePhrases?:any, prefix?:any) {
    var phrase;

    if (typeof morePhrases === 'string') {
      delete this.phrases[morePhrases];
    } else {
      for (var key in morePhrases) {
        if (morePhrases.hasOwnProperty(key)) {
          phrase = morePhrases[key];
          if (prefix) key = prefix + '.' + key;
          if (typeof phrase === 'object') {
            this.unset(phrase, key);
          } else {
            delete this.phrases[key];
          }
        }
      }
    }
  };

  clear() {
    this.phrases = {};
  };

  replace(newPhrases?:any) {
    this.clear();
    this.extend(newPhrases);
  };

  t(key?:any, options?:any) {
    var phrase, result;
    options = options == null ? {} : options;
    // allow number as a pluralization shortcut
    if (typeof options === 'number') {
      options = {smart_count: options};
    }
    if (typeof this.phrases[key] === 'string') {
      phrase = this.phrases[key];
    } else if (typeof options._ === 'string') {
      phrase = options._;
    } else if (this.allowMissing) {
      phrase = key;
    } else {
      this.warn('Missing translation for key: "'+key+'"');
      result = key;
    }
    if (typeof phrase === 'string') {
      options = clone(options);
      result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
      result = interpolate(result, options);
    }
    return result;
  };

  has(key?:any) {
    return key in this.phrases;
  };
}
