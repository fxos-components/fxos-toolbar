/* jshint maxlen:100 */
/* global sinon, assert, suite, setup, teardown, test, tb1, tb2 */

suite('FXOSToolbar', function() {
  'use strict';

  var accessibility = window['test-utils'].accessibility;

  function testToolbarAttributes(fxosToolbar) {
    assert.equal(fxosToolbar.getAttribute('role'), 'toolbar');
    assert.equal(fxosToolbar.els.moreButton.getAttribute('aria-expanded'),
      'false');
    assert.equal(fxosToolbar.els.moreButton.getAttribute('data-l10n-id'),
      'FXOSToolbarMore');
    if (fxosToolbar.needsLabel()) {
      assert.ok(fxosToolbar.getAttribute('data-l10n-id') ||
        fxosToolbar.getAttribute('aria-label'));
    }
  }

  setup(function() {
    this.sandbox = sinon.sandbox.create();
    this.dom = document.createElement('div');
    this.dom.innerHTML = `
      <fxos-toolbar id="tb1" class="l-mb-mega" aria-label="Communications">
        <button data-icon="recent-calls" aria-label="Recent calls"></button>
        <button data-icon="user" aria-label="User"></button>
        <button data-icon="dialpad" aria-label="Dialpad"></button>
        <button data-icon="sync" aria-label="Sync"></button>
        <button data-icon="camera" aria-label="Camera"></button>
      </fxos-toolbar>

      <fxos-toolbar id="tb2" class="l-mb-mega" aria-label="Call Log">
        <button data-icon="recent-calls" aria-label="Recent Calls"></button>
        <button data-icon="user" aria-label="User"></button>
      </fxos-toolbar>`;

    document.body.appendChild(this.dom);
  });

  teardown(function() {
    this.sandbox.restore();
    document.body.removeChild(this.dom);
    this.dom = null;
  });

  suite('accessibility', function() {
    /**
     * Accessibility test utils module tests the following things, amongst other
     * checks (all at once).:
     *  - ARIA attributes specific checks
     *  - accesskey uniqueness if applicable
     *  - Presence of alternative descriptions, labels and names
     *  - Color contrast
     *  - Markup is semantically correct from a11y standpoint
     *  - Heading order
     *  - Frame/document title and language
     *  - Landmarks if applicable
     *  - Keyboard focusability and tabindex
     *
     * Its checks are called at different stages and within different states of
     * the component.
     */

    setup(function(done) {
      // Accessibility attributes are set after the HTML has been parsed.
      setTimeout(done);
    });

    test('fxos-toolbar default states pass all accessibility checks above' +
      'and have attributes correctly set',
      function(done) {
        [tb1, tb2].forEach(tb => testToolbarAttributes(tb));
        accessibility.check(this.dom).then(done, done);
      });
  });
});
