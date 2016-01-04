/* global marionette, setup, test */

'use strict';

var assert = require('chai').assert;
marionette.plugin('helper', require('marionette-helper'));

marionette('fxos-toolbar', function() {
  var client = marionette.client({
    profile: {
      prefs: {
        // Disable first time run UI
        'browser.feeds.showFirstRunUI': false,
        // Disable default browser check
        'browser.shell.checkDefaultBrowser': false,
        // Disable UI tutorial
        'browser.uitour.enabled': false,
        // Enable chrome debugging
        'devtools.chrome.enabled': true,
        'devtools.debugger.remote-enabled': true,

        // Load integration test page on startup
        'startup.homepage_welcome_url': __dirname + '/test-integration.html',

        // Allow loading test resources oudside of test/ directory
        // (e.g. bower-components)
        'security.fileuri.strict_origin_policy': false,

        // Enable web components
        'dom.webcomponents.enabled': true,
        // Enable touch events
        'dom.w3c_touch_events.enabled': 1
      }
    },
    desiredCapabilities: {
      raisesAccessibilityExceptions: true
    }
  });

  var components = [
    { selector: '#gt0'},
    { selector: '#gt1'},
    { selector: '#gt2'}
  ];

  /**
   * Perform a marionette operation and assert if an error is thrown.
   * @param  {Function} testFn operation to perform
   * @param  {String} message error message for the assert statement
   */
  function failOnA11yError(testFn, message) {
    try {
      testFn();
    } catch (err) {
      // Marionette raises an ElementNotAccessibleError exception when
      // raisesAccessibilityExceptions is set to true.
      assert(false, [message, err.message].join(' '));
    }
  }

  setup(function() {
    components.forEach(function(aComponent) {
      aComponent.element = client.findElement(aComponent.selector);
    });
  });

  test('fxos-toolbars are present and are visible to the assistive technology',
    function() {
      components.forEach(function(aComponent) {
        // Element is found
        assert.ok(aComponent.element, aComponent.selector);
        // Element is visible to all (inlcuding assistive technology)
        failOnA11yError(function() {
          assert.isTrue(aComponent.element.displayed());
        }, 'fxos-toolbar element should be visible both normally and to ' +
          'assistive technology.');

        // More button is hidden from all (inlcuding assistive technology)
        client.switchToShadowRoot(aComponent.element);
        failOnA11yError(function() {
          assert.isFalse(client.findElement('.more-button').displayed());
        }, 'more button element should be hidden both normally and from ' +
          'assistive technology by default.');
        client.switchToShadowRoot();
      });
    });

  test('fxos-toolbar inner subtree is accessible (no error thrown when ' +
    'clicking and tapping)', function() {
      ['click', 'tap'].forEach(function(action) {
        components.forEach(function(aComponent) {
          // The following checks for an element will be performed on tap/click:
          // * visible to the assistive technology
          // * enabled to the assistive technology
          // * not obstructed via pointer-events set to none
          // * focusable by the assistive technology
          // * named/labelled for the assistive technology
          // * support user actions (click/tap/etc) performed via assistive
          //   technology
          aComponent.element.findElements('button', function(err, buttons) {
            if (err) {
              assert(false,
                ['Error finding inner buttons', err.message].join(' '));
            }
            buttons.forEach(function(button) {
              failOnA11yError(function() {
                button[action]();
              }, 'fxos-toolbar inner button should be clickable and tappable ' +
                'including via the assistive technology.');
            });
          });
        });
      });
    });
});
