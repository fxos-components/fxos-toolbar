/**
 * Dependencies
 */

var FXOSDialogMenu = require('fxos-dialog-menu');
var component = require('fxos-component');

/**
 * Locals
 */

var forEach = [].forEach;
var slice = [].slice;

function rafWrap(fn, ctx) {
  var raf = requestAnimationFrame;
  var frame;

  return function() {
    if (frame) { return; }
    var args = arguments;

    frame = raf(function() {
      raf(function() {
        frame = null;
        fn.apply(ctx, args);
      });
    });
  };
}

/**
 * Exports
 */

module.exports = component.register('fxos-toolbar', {
  created: function() {
    this.setupShadowRoot();

    this.els = {
      inner: this.shadowRoot.querySelector('.inner'),
      moreButton: this.shadowRoot.querySelector('.more-button')
    };

    this.els.moreButton.addEventListener('click', this.openOverflow.bind(this));

    // process everything that doesn't affect user interaction
    // after the component is created
    setTimeout(() => this.makeAccessible());

    this.reflow_raf = rafWrap(this.reflow, this);
    addEventListener('resize', this.reflow_raf);

    if (document.readyState === 'loading') {
      addEventListener('load', this.reflow.bind(this));
      return;
    }
  },

  makeAccessible: function() {
    this.setAttribute('role', 'toolbar');

    // If there's more than one toolbar present, toolbar must have a label.
    if (this.needsLabel()) {
        console.error('Component not fully accessible: please provide a label' +
          'for the toolbar itself.', this);
    }

    // Add expandable semantics to the … button: expanded when dialog is shown
    // and collapsed when dialog is hidden.
    this.els.moreButton.setAttribute('aria-expanded', !!this.dialog);
  },

  needsLabel: function() {
    return document.getElementsByTagName('fxos-toolbar').length > 1 &&
      !this.getAttribute('data-l10n-id') && !this.getAttribute('aria-label');
  },

  attached: function() {
    this.setupShadowL10n();
    this.style.visibility = 'hidden';
    this.reflow_raf();
  },

  reflow: function() {
    this.release();
    var overflow = this.getOverflowData();
    if (overflow.overflowed) { this.onOverflowed(overflow); }
    this.style.visibility = '';
  },

  getOverflowData: function() {
    var space = this.els.inner.clientWidth;
    var child = this.children[0];
    var overflowed = false;
    var willFit = 0;
    var total = 0;
    var overflow;
    var width;

    while (child) {
      width = child.clientWidth;
      overflow = width + total - space;

      if (overflow > 3) {
        overflowed = true;
        break;
      }

      willFit++;
      total += width;
      child = child.nextElementSibling;
    }

    return {
      willFit: willFit,
      remaining: space - total,
      overflowed: overflowed
    };
  },

  onOverflowed: function(overflow) {
    var items = slice.call(this.children, 0, -1);
    var minMoreButtonWidth = 70;
    var extra = overflow.remaining < minMoreButtonWidth ? 1 : 0;
    var numToHide = items.length - overflow.willFit + extra;

    this.hiddenChildren = slice.call(items, 0 - numToHide);
    this.hiddenChildren.forEach(el => el.classList.add('overflowing'));
    this.els.inner.classList.add('overflowed');
  },

  release: function() {
    if (!this.hiddenChildren) { return; }
    this.els.inner.classList.remove('overflowed');
    forEach.call(this.hiddenChildren, function(el) {
      el.classList.remove('overflowing');
    });
  },

  getTotalItemLength: function() {
    return [].reduce.call(this.children, function(total, el) {
      return total + el.clientWidth;
    }, 0);
  },

  openOverflow: function(e) {
    this.dialog = new FXOSDialogMenu();

    this.hiddenChildren.forEach(function(el) {
      this.dialog.appendChild(el);
      el.classList.remove('overflowing');
    }, this);

    this.els.moreButton.setAttribute('aria-expanded', true);

    this.appendChild(this.dialog);
    this.dialog.addEventListener('click', this.dialog.close.bind(this.dialog));
    this.dialog.addEventListener('closed', this.onDialogClosed.bind(this));
    this.dialog.open(e);
  },

  onDialogClosed: function() {
    this.dialog.remove();
    this.dialog = null;

    this.els.moreButton.setAttribute('aria-expanded', false);

    this.hiddenChildren.forEach(function(el) {
      el.classList.add('overflowing');
      this.insertBefore(el, this.lastChild);
    }, this);
  },

  template: `<div class="inner">
    <content></content>
    <button class="more-button" data-l10n-id="FXOSToolbarMore"></button>
  </div>
  <style>

  /** Reset
   ---------------------------------------------------------*/

  ::-moz-focus-inner { border: 0; }

  /** Host
   ---------------------------------------------------------*/

  :host {
    display: block;
  }

  /** Inner
   ---------------------------------------------------------*/

  .inner {
    display: flex;
    height: 45px;
    overflow: hidden;

    border-top: 1px solid;
    border-color:
      var(--border-color,
      var(--background-plus));

    justify-content: space-between;
  }

  /** Direct Children
   ---------------------------------------------------------*/

  ::content > * {
    box-sizing: border-box;
    flex: 1 0 0;
    height: 100%;
    margin: 0;
    padding: 0 6px;
    border: 0;
    font-size: 17px;
    line-height: 45px;
    font-style: italic;
    font-weight: lighter;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    transition: color 200ms 300ms;

    color:
      var(--text-color, inherit);
  }

  /**
   * :active
   */

  ::content > :active {
    transition: none;
    color: var(--highlight-color);
  }

  /**
   * .overflowing
   */

  ::content > .overflowing {
    display: none;
  }

  /**
   * [disabled]
   */

  ::content > [disabled] {
    pointer-events: none;
    opacity: 0.3;
  }

  ::content > [data-icon] {
    font-size: 0;
  }

  /** Style
   ---------------------------------------------------------*/

  style {
    display: none !important;
  }

  /** More Button
   ---------------------------------------------------------*/

  .more-button {
    display: none;
    flex: 0.7 0 0;
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0 6px;
    border: 0;
    font-size: 17px;
    line-height: 45px;
    font-style: italic;
    font-weight: lighter;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    transition: color 200ms 300ms;

    color:
      var(--text-color, inherit);
  }

  .more-button :active {
    transition: none;
    color: var(--highlight-color);
  }

  /** More Button Icon
   ---------------------------------------------------------*/

  .more-button:before {
    font-family: 'fxos-icons';
    font-weight: 500;
    content: 'more';
    text-rendering: optimizeLegibility;
    font-style: normal;
    font-size: 32px;
  }

  /**
   * .overflowed
   */

  .overflowed .more-button {
    display: block;
  }

  </style>`
});
