;(function(define){define(function(require,exports,module){
/*jshint esnext:true*/
'use strict';

/**
 * Dependencies
 */

var pressed = require('pressed');
var GaiaDialog = require('gaia-dialog');

// Needs icons loaded
require('gaia-icons');

/**
 * Locals
 */

var forEach = [].forEach;
var slice = [].slice;

/**
 * Extend from the `HTMLElement` prototype
 *
 * @type {Object}
 */
var proto = Object.create(HTMLElement.prototype);

/**
 * Runs when an instance of `GaiaTabs`
 * is first created.
 *
 * The initial value of the `select` attribute
 * is used to select a tab.
 *
 * @private
 */
proto.createdCallback = function() {
  this.createShadowRoot().innerHTML = template;

  this.els = {
    inner: this.shadowRoot.querySelector('.inner'),
    moreButton: this.shadowRoot.querySelector('.more-button')
  };

  this.els.moreButton.addEventListener('click', this.openOverflow.bind(this));

  var self = this;
  this.reflow_raf = rafWrap(this.reflow, this);
  addEventListener('resize', this.reflow_raf);
  this.shadowStyleHack();
  pressed(this.shadowRoot);


  if (document.readyState === 'loading') {
    addEventListener('load', this.reflow.bind(this));
    return;
  }

  this.style.visibility = 'hidden';
  self.reflow_raf();
};

proto.attachedCallback = function() {
  this.style.visibility = 'hidden';
  this.reflow_raf();
};

proto.reflow = function() {
  this.release();

  var container = this.els.inner.getBoundingClientRect();
  var total = this.getTotalItemLength();
  var overflowed = Math.max(total - container.width, 0);

  // console.log('overflowed', container.width, total);

  if (overflowed > 3) {
    this.onOverflowed(overflowed, total);
  }

  // Make sure it's shown
  this.style.visibility = '';
};

proto.onOverflowed = function(overflowed, total) {
  var items = slice.call(this.children, 0, -1);
  var itemWidth = total / items.length;
  var numToHide = Math.ceil(overflowed / itemWidth) + 1;

  console.log(overflowed, items, total, numToHide, itemWidth);

  this.hiddenChildren = slice.call(items, 0 - numToHide);
  this.hiddenChildren.forEach(function(el) { el.classList.add('overflowing'); });
  this.els.inner.classList.add('overflowed');
};

proto.release = function() {
  if (!this.hiddenChildren) { return; }
  this.els.inner.classList.remove('overflowed');
  forEach.call(this.hiddenChildren, function(el) {
    el.classList.remove('overflowing');
  });
};


proto.getTotalItemLength = function() {
  return [].reduce.call(this.children, function(total, el) {
    return total + el.clientWidth;
  }, 0);
};

proto.shadowStyleHack = function() {
  var style = this.shadowRoot.querySelector('style').cloneNode(true);
  this.classList.add('-content', '-host');
  style.setAttribute('scoped', '');
  this.appendChild(style);
};

proto.openOverflow = function(e) {
  this.dialog = new GaiaDialog();

  this.hiddenChildren.forEach(function(el) {
    el.style.display = '';
    this.dialog.appendChild(el);
  }, this);

  this.shadowRoot.appendChild(this.dialog);
  this.dialog.addEventListener('click', this.dialog.close.bind(this.dialog));
  this.dialog.addEventListener('closed', this.onDialogClosed.bind(this));
  this.dialog.open(e);
};

proto.onDialogClosed = function() {
  this.hiddenChildren.forEach(function(el) {
    el.style.display = 'none';
    this.insertBefore(el, this.lastChild);
  }, this);

  this.dialog.remove();
  this.dialog = null;
};

function rafWrap(fn, ctx) {
  var raf = requestAnimationFrame;
  var frame;

  return function() {
    if (frame) { return; }
    var args = arguments;

    frame = raf(function() {
      raf(function() {
        frame = null;
        fn.apply(ctx, arguments);
      });
    });
  };
}

var template = `
<style>

/** Host
 ---------------------------------------------------------*/

.-host {
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

.-content > *,
.more-button {
  position: relative;
  display: flex;
  height: 100%;
  padding: 0 24px;
  border: 0;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-weight: lighter;
  background: none;
  cursor: pointer;
  color: inherit;
  white-space: nowrap;

  box-sizing: border-box;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;

  color:
    var(--text-color);
}

/**
 * :active
 */

.more-button.pressed,
.-content > .pressed {
  color: var(--highlight-color);
}

/**
 * .overflowing
 */

.-content > .overflowing {
  display: none;
}

/**
 * [disabled]
 */

.-content > [disabled] {
  pointer-events: none;
  opacity: 0.3;
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
  background: none;
  border: 0;
  padding: 0;
}

.more-button:before {
  font-family: 'gaia-icons';
  font-weight: 500;
  content: 'more';
  text-rendering: optimizeLegibility;
  font-style: normal;
  font-size: 32px;
  line-height: 1;
}

.overflowed .more-button {
  display: block;
}

</style>

<div class="inner">
  <content></content>
  <button class="more-button"></button>
</div>`;

// Register and expose the constructor
module.exports = document.registerElement('gaia-toolbar', { prototype: proto });

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-toolbar',this));
