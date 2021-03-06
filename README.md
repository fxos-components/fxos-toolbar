# fxos-toolbar [![](https://travis-ci.org/fxos-components/fxos-toolbar.svg)](https://travis-ci.org/fxos-components/fxos-toolbar)


## Installation

```bash
$ bower install fxos-components/fxos-toolbar
```


## Examples

- [Example](http://fxos-components.github.io/fxos-toolbar)


## Accessibility

If you are using more than one toolbar in your app or web page please make sure that each toolbar
has an appropriate label. If you are using localization mechanism provided by Firefox OS, you simply
need a data-l10n-id attribute pointing to the label entry in your app's message bundle.

```html
<fxos-toolbar data-l10n-id="communications">
  <button> Call log </button>
  <button> Dialer </button>
</fxos-toolbar>
```

If you are not using localization, you can add a label by directly specifying an aria-label
attribute for the toolbar.

```html
<fxos-toolbar aria-label="Communications">
  <button> Call log </button>
  <button> Dialer </button>
</fxos-toolbar>
```


## Localization

If you are using fxos-toolbar you need to provide a label for a "More" button that is represented as
an icon. If you are using localization mechanism provided by Firefox OS, you simply need to add the
label entry in your app's message bundle for "FXOSToolbarMore"

```
// If using .l20n format:
<FXOSToolbarMore ariaLabel: "More">
```

```
// If using .properties format:
FXOSToolbarMore.ariaLabel = More
```

## Readiness

- [x] Accessibility ([@yzen](https://github.com/yzen))
- [ ] Test Coverage
- [ ] Performance
- [ ] Visual/UX
- [ ] RTL


## Tests

1. Ensure Firefox Nightly is installed on your machine.
2. To run unit tests you need npm >= 3 installed.
3. `$ npm install`
4. `$ npm run test-unit`

If your would like tests to run on file change use:

`$ npm run test-unit-dev`

If your would like run integration tests, use:
`$ export FIREFOX_NIGHTLY_BIN=/absolute/path/to/nightly/firefox-bin`
`$ npm run test-integration`

## Lint check

Run lint check with command:

`$ npm run test-lint`
