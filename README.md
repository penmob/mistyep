Mistyep
=========

Catch when tricky or non-standard words are ~mistyepd~ mistyped.

[Live demo](https://penmob.github.io/mistyep/)

## Installation

  `npm install mistyep --save`

## Usage

```
var mistyep = require('mistyep');
```
Then...
  
#### For emails
  
```
var emailInput = 'example@gmial.com';  // get your user's email input from e.g. a form

var correctedEmail = mistyep.email(emailInput);  // returns the original emailInput if no correction is found.

if (emailInput !== correctedEmail) {
  // suggest the alternative spelling to the user.
}
```
  
If you want to include custom email domains or TLDs, see the code example in 
the "Email Defaults" section below.
  
#### For custom words

`mistyep` is flexible enough to handle an arbitrary list of specialty words. 
Perhaps your users are only allowed to write in 
[Elvish](https://en.wikipedia.org/wiki/Elvish_languages), or there is app-level
jargon that needs to be spelled right. You can check against your own word list
with the `custom` method:

```
mistyep.custom('standup', ['ux', 'stand-up', 'bae', 'tbh']);
```
  
## Email Defaults

The default email values that `mistyep` checks agains are the following:

Domains: `gmail` | `yahoo` | `aol` | `outlook` | `att` | `msn` | `mchsi` | `comcast` | `live` | `mail` | `ymail` | `googlemail`

TLDs: `com` | `co` | `org` | `net` | `info` | `edu` | `gov` | `int` | `mil` | `biz` | `me` | `ly` | `io` | `us` | `co.uk` | `ru` | `mobi`

Obviously, this is not a complete list. I tried to pick many of the most common values, 
but you may have a different use-case, serve in a specific country, or serve 
to users with internal email addresses. In that case, you can supply custom
domains or TLDs with the following optional parameters:

  ```
  mistyep.email(
    emailInput, 
    { 
      customDomains: ['example', 'mycompany'], 
      customTLDs: ['ninja', 'chat', 'news', 'to', 'bz']
    });
  ```

Make sure you pass string arrays into `customDomains` and `customTLDs` if you choose to include them.

If I missed something glaring in the default lists, feel free to add it in a PR.

## In the wild

You can see `mistyep` in action on the [Penmob](https://www.penmob.com) login page 
(watch a suggestion pop up if you type in an invalid email):

[penmob.com/login](https://www.penmob.com/login)

[Example GIF](https://imgur.com/JBZICZ5)

Let me know if you use `mistyep` in your own app, and I'll add it to this page.

## Testing

  `npm test`
  
## Motivation
  
There is no sure-fire way to auto-verify that an email address exists, but there 
are a few things we can do to mitigate simple errors. When a user signs 
up for a new service with their email address, there is a nonzero chance that they'll
mistype it, thus making a confirmation or further communication with them impossible. 

This package uses most of the common email providers' domain names to offset the chance 
that someone will accidentally type, for example, `gnail` instead of `gmail`. It's best to offer the 
_suggestion_ returned by `mistyep` rather than to automatically change their input.
  
## How it works

`mistyep` uses a modified version of 
[Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) 
(or "edit distance") to correct a misspelled word, which I call the 
"physical edit distance". The theory being, it's much more likely that a user will
miss with their finger by a key or two, and the physical distance between keys 
on the keyboard should influence which word is selected as a replacement.

This is an imperfect solution, but if used as a heuristic, it catches most 
accidental mistypings.

## Caveats

The initial version was meant to be used as an email checker only, so the `custom` method has a lot
of room for improvement. It does not handle capitalized letters, or any special characters with
accents or umlauts. This version also only handles misspellings committed on a standard
QWERTY computer.
