'use strict';


  /**
   * Checks a word against a given word bank
   * @param {string} word
   * @param {string} [wordBank]
   * @return {string} Returns the corrected string
   */
  var custom = function(word, wordBank) {
    if (!wordBank || wordBank.length === 0) return word;
    return mistyep(word, wordBank);
  };
  /**
   * Checks an email address for likely validity
   * @param {string} email
   * @param {Object} options (optional) - accepts "customDomains" and "customTLDs" as string arrays
   * @return {string} Returns the corrected email address
   */
  var theEmail = function(email, options) {
    // NOTE: these are not comprehensive lists.
    // Domains and TLDs sourced from multiple lists of the most common usages in email servers, plus Google's list of gccTLDs.
    var DEFAULT_EMAIL_DOMAINS = ['gmail','yahoo','aol','outlook','att','msn','mchsi','comcast','live','mail','ymail','googlemail','hotmail'];
    var DEFAULT_EMAIL_TLDS = ['com','co','org','net','info','edu','gov','int','mil','biz','me','ly','io','us','co.uk','ru','mobi', 'ad', 'as', 'bz', 'cc', 'cd', 'dj', 'fm', 'la', 'ms', 'nu', 'sc', 'sr', 'su', 'tv', 'tk', 'ws', 'eu', 'asia', 'br', 'ca', 'cn', 'de', 'fr', 'in', 'jp', 'ru'];

    if (options) {
      if (options.customDomains) {
        for (var i=0;i<options.customDomains.length;i++) {
          if (DEFAULT_EMAIL_DOMAINS.indexOf(options.customDomains[i]) === -1)
            DEFAULT_EMAIL_DOMAINS.push(options.customDomains[i]);
        }
      }
      if (options.customTLDs) {
        for (var i=0;i<options.customTLDs.length;i++) {
          if (DEFAULT_EMAIL_TLDS.indexOf(options.customTLDs[i]) === -1)
            DEFAULT_EMAIL_TLDS.push(options.customTLDs[i]);
        }
      }
    }

    if (!email || typeof email !== 'string') return email;

    var localPart = email.match(/((.+)@)/);
    (localPart && localPart.length) ?
      localPart = localPart[1] :
      localPart = '';

    var domainPart = email.match(/@(.+?)\.((.+){2,})/);
    domainPart =
      (domainPart && domainPart.length >= 2) ? domainPart[1] : '';

    var tldPart = email.match(/@(.+?)\.((.+){2,})/);
    tldPart =
      (tldPart && tldPart.length >= 3) ? tldPart[2] : '';

    var domainSuggestion =
      (domainPart && domainPart.length < 18) ?
        mistyep(domainPart, DEFAULT_EMAIL_DOMAINS) :
        domainPart;

    var tldSuggestion =
      (tldPart && tldPart.length < 8) ?
        mistyep(tldPart, DEFAULT_EMAIL_TLDS) :
        tldPart;

    if (domainPart !== domainSuggestion || tldPart !== tldSuggestion) {
      return localPart + domainSuggestion + '.' + tldSuggestion;
    }

    // else return the original input
    return email;
  };



// Feel free to change this. Tolerance is how far away from the _correct_ key we can stray.
var TOLERANCE = 2.5;

var PhysicalKey = function(ch, x, y) {
  this.ch = ch, this.x = x, this.y = y;

  this.getDistance = function (physicalKey, distanceType) {
    if (physicalKey.ch == ' ') {
      return 1;
    }
    else {
      if (typeof distanceType === 'undefined') {
        // the default behavior returns Manhattan distance.
        return Math.abs(this.x - physicalKey.x) + Math.abs(this.y - physicalKey.y);
      }
      else {
        // feel free to add other types of distance calculations here.  For example, Euclidean distance:
        return Math.sqrt(Math.pow((this.x - physicalKey.x), 2) + Math.pow((this.y - physicalKey.y), 2))
      }
    }
  };
};

// NOTE: this only works for the standard US keyboard layout. YMMV.
var PHYSICAL_KEYS = {};
'1 2 3 4 5 6 7 8 9 0 - ='.split(' ').forEach(addToPhysicalKeyboard, {'x': 0, 'y': 0});
'q w e r t y u i o p [ ]'.split(' ').forEach(addToPhysicalKeyboard, {'x': 0.5, 'y': 1});
'a s d f g h j k l'.split(' ').forEach(addToPhysicalKeyboard, {'x': 0.7, 'y': 2});
'z x c v b n m , . /'.split(' ').forEach(addToPhysicalKeyboard, {'x': 1.2, 'y': 3});
PHYSICAL_KEYS[' '] = new PhysicalKey(' ', 0, 0);  // default value for a 'space' key

function addToPhysicalKeyboard(value, index) {
  PHYSICAL_KEYS[value] = new PhysicalKey(value, index + this['x'], this['y']);
}

var mistyep = function(wordToCorrect, wordBank) {
  wordBank = wordBank.map(toLower);
  wordToCorrect = toLower(wordToCorrect);

  if (wordToCorrect.length > 0) {
    return matchClosestWord(wordToCorrect, wordBank);
  }
  else return wordToCorrect;
};

function toLower(word) {
  return (typeof word === 'string') ? word.toLowerCase() : word;
}

function matchClosestWord(testWord, wordBank) {
  var minDistance = Number.MAX_VALUE;
  var newWord = null;
  wordBank.some(function(word) {
    var distance = physicalEditDistance(word, testWord);
    if (distance === 0) {
      // perfect match!
      newWord = word;
      return true;
    }
    else if (distance < TOLERANCE && distance < minDistance) {
      // matched within our pre-defined TOLERANCE. Don't break, since there might be a better match later on in the array
      minDistance = distance;
      newWord = word;
    }
  });
  return (newWord === null) ? testWord : newWord;  // if there was no match, return the original word
}

function physicalEditDistance(word1, word2) {
  var lengthDifference = word1.length - word2.length;
  if (lengthDifference !== 0) {  // normalize string lengths by inserting spaces into the shorter word
    if (lengthDifference < 0) {
      word1 = [word2, word2 = word1][0];  // one-line swap :)
    }
    for (var i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) {
        word2 = [word2.slice(0, i), ' ', word2.slice(i)].join('');  // thanks, SO!
      }
    }
    word2 = word2.slice(0, word1.length);
  }

  // check pairs of letters, rather than individual letters
  var runningDistance = 0;
  for (var i = 0; i < word1.length - 1; i++) {
    // account for invalid characters
    var word1CurrKey = PHYSICAL_KEYS.hasOwnProperty(word1[i]) ? word1[i] : ' ';
    var word1NextKey = PHYSICAL_KEYS.hasOwnProperty(word1[i+1]) ? word1[i+1] : ' ';
    var word2CurrKey = PHYSICAL_KEYS.hasOwnProperty(word2[i]) ? word2[i] : ' ';
    var word2NextKey = PHYSICAL_KEYS.hasOwnProperty(word2[i+1]) ? word2[i+1] : ' ';

    if (word1CurrKey === word2NextKey &&
      word1NextKey === word2CurrKey &&
      word1CurrKey !== ' ' &&
      word1NextKey !== ' ' &&
      word1CurrKey !== word1NextKey) {
      //swapped letters
      runningDistance += 1;
      if (i === 0 || i === word1.length - 2) {  // ends of the word
        runningDistance -= (PHYSICAL_KEYS[word1CurrKey].getDistance(PHYSICAL_KEYS[word2CurrKey])) / 2.0;
      }
      else {
        runningDistance -= PHYSICAL_KEYS[word1CurrKey].getDistance(PHYSICAL_KEYS[word2CurrKey]);
      }
    }
    else if (i === 0) {
      // beginning of the word
      runningDistance += PHYSICAL_KEYS[word1CurrKey].getDistance(PHYSICAL_KEYS[word2CurrKey]) +
        ((PHYSICAL_KEYS[word1NextKey].getDistance(PHYSICAL_KEYS[word2NextKey])) / 2.0);
    }
    else if (i === word1.length - 2) {
      // end of the word
      runningDistance += ((PHYSICAL_KEYS[word1CurrKey].getDistance(PHYSICAL_KEYS[word2CurrKey]) / 2.0) +
      PHYSICAL_KEYS[word1NextKey].getDistance(PHYSICAL_KEYS[word2NextKey]));
    }
    else {
      // somewhere in the middle of the word
      runningDistance += (PHYSICAL_KEYS[word1CurrKey].getDistance(PHYSICAL_KEYS[word2CurrKey]) / 2.0) +
        (PHYSICAL_KEYS[word1NextKey].getDistance(PHYSICAL_KEYS[word2NextKey]) / 2.0);
    }
  }
  return runningDistance;
}