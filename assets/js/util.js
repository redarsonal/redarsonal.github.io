/*
	Astral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	/**
	 * Generate an indented list of links from a nav element.
	 * Intended for use with panel().
	 * @return {string} HTML string of anchor tags.
	 */
	$.fn.navList = function() {
		var $this = $(this),
			$a    = $this.find('a'),
			b     = []; // Missing 'var' in original caused $a and b to leak to outer scope

		$a.each(function() {
			var $this  = $(this),
				indent = Math.max(0, $this.parents('li').length - 1),
				href   = $this.attr('href'),
				target = $this.attr('target');

			b.push(
				'<a ' +
					'class="link depth-' + indent + '"' +
					(target ? ' target="' + target + '"' : '') +
					(href   ? ' href="'   + href   + '"' : '') +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					$this.text() +
				'</a>'
			);
		});

		return b.join('');
	};

	/**
	 * Panel-ify an element: adds show/hide behavior, swipe support, and scroll locking.
	 * @param {object} userConfig User config.
	 * @return {jQuery} jQuery object.
	 */
	$.fn.panel = function(userConfig) {

		// No elements? Bail.
		if (this.length === 0)
			return this; // Original returned undefined $this (not declared in this scope)

		// Multiple elements? Apply to each individually.
		if (this.length > 1) {
			for (var i = 0; i < this.length; i++)
				$(this[i]).panel(userConfig);

			return this; // Same fix as above
		}

		var $this   = $(this),
			$body   = $('body'),
			$window = $(window),
			id      = $this.attr('id'),
			config;

		config = $.extend({
			delay:        0,
			hideOnClick:  false,
			hideOnEscape: false,
			hideOnSwipe:  false,
			resetScroll:  false,
			resetForms:   false,
			side:         null,
			target:       $this,
			visibleClass: 'visible'
		}, userConfig);

		// Ensure config.target is always a jQuery object.
		if (!(config.target instanceof $))
			config.target = $(config.target);

		// Hide the panel and run optional post-hide cleanup.
		$this._hide = function(event) {
			if (!config.target.hasClass(config.visibleClass))
				return;

			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			config.target.removeClass(config.visibleClass);

			window.setTimeout(function() {
				if (config.resetScroll)
					$this.scrollTop(0);

				if (config.resetForms)
					$this.find('form').each(function() { this.reset(); });
			}, config.delay);
		};

		// Vendor scroll fixes for IE and iOS.
		$this
			.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
			.css('-webkit-overflow-scrolling', 'touch');

		// Hide on click: close panel and navigate to link href.
		if (config.hideOnClick) {
			$this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

			$this.on('click', 'a', function(event) {
				var $a    = $(this),
					href   = $a.attr('href'),
					target = $a.attr('target');

				if (!href || href === '#' || href === '' || href === '#' + id)
					return;

				event.preventDefault();
				event.stopPropagation();

				$this._hide();

				window.setTimeout(function() {
					if (target === '_blank')
						window.open(href);
					else
						window.location.href = href;
				}, config.delay + 10);
			});
		}

		// Touch: record start position.
		$this.on('touchstart', function(event) {
			$this.touchPosX = event.originalEvent.touches[0].pageX;
			$this.touchPosY = event.originalEvent.touches[0].pageY;
		});

		// Touch: handle swipe-to-close and prevent overscroll.
		$this.on('touchmove', function(event) {
			if ($this.touchPosX === null || $this.touchPosY === null)
				return;

			var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
				diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
				th    = $this.outerHeight(),
				ts    = $this.get(0).scrollHeight - $this.scrollTop();

			if (config.hideOnSwipe) {
				var result   = false,
					boundary = 20,
					delta    = 50;

				switch (config.side) {
					case 'left':   result = (diffY < boundary && diffY > -boundary) && (diffX > delta);  break;
					case 'right':  result = (diffY < boundary && diffY > -boundary) && (diffX < -delta); break;
					case 'top':    result = (diffX < boundary && diffX > -boundary) && (diffY > delta);  break;
					case 'bottom': result = (diffX < boundary && diffX > -boundary) && (diffY < -delta); break;
				}

				if (result) {
					$this.touchPosX = null;
					$this.touchPosY = null;
					$this._hide();
					return false;
				}
			}

			// Block overscroll past top or bottom of the panel.
			if (($this.scrollTop() < 0 && diffY < 0) ||
				(ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		// Stop panel-internal events from bubbling to the body hide handler.
		$this.on('click touchend touchstart touchmove', function(event) {
			event.stopPropagation();
		});

		// Clicking an anchor that points to this panel's own ID closes it.
		$this.on('click', 'a[href="#' + id + '"]', function(event) {
			event.preventDefault();
			event.stopPropagation();
			config.target.removeClass(config.visibleClass);
		});

		// Clicking anywhere on the body outside the panel closes it.
		$body.on('click touchend', function(event) {
			$this._hide(event);
		});

		// Clicking a trigger anchor that points to this panel's ID toggles it.
		$body.on('click', 'a[href="#' + id + '"]', function(event) {
			event.preventDefault();
			event.stopPropagation();
			config.target.toggleClass(config.visibleClass);
		});

		// Hide on ESC keypress.
		if (config.hideOnEscape) {
			$window.on('keydown', function(event) {
				if (event.keyCode === 27)
					$this._hide(event);
			});
		}

		return $this;
	};

	/**
	 * Polyfill the placeholder attribute for browsers that don't support it natively.
	 * @return {jQuery} jQuery object.
	 */
	$.fn.placeholder = function() {

		// Modern browsers support placeholder natively — nothing to do.
		if (typeof (document.createElement('input')).placeholder !== 'undefined')
			return $(this);

		if (this.length === 0)
			return this; // Fixed: original returned undefined $this

		if (this.length > 1) {
			for (var i = 0; i < this.length; i++)
				$(this[i]).placeholder();

			return this; // Fixed: same
		}

		var $this = $(this);

		// Text inputs and textareas.
		$this.find('input[type=text],textarea')
			.each(function() {
				var i = $(this);

				if (i.val() === '' || i.val() === i.attr('placeholder'))
					i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
			})
			.on('blur', function() {
				var i = $(this);

				if (i.attr('name').match(/-polyfill-field$/))
					return;

				if (i.val() === '')
					i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
			})
			.on('focus', function() {
				var i = $(this);

				if (i.attr('name').match(/-polyfill-field$/))
					return;

				if (i.val() === i.attr('placeholder'))
					i.removeClass('polyfill-placeholder').val('');
			});

		// Password inputs: swap to a visible text clone when empty to show placeholder.
		$this.find('input[type=password]').each(function() {
			var i = $(this);
			var x = $(
				$('<div>')
					.append(i.clone())
					.remove()
					.html()
					.replace(/type="password"/i, 'type="text"')
					.replace(/type=password/i,   'type=text')
			);

			if (i.attr('id')   !== '') x.attr('id',   i.attr('id')   + '-polyfill-field');
			if (i.attr('name') !== '') x.attr('name', i.attr('name') + '-polyfill-field');

			x.addClass('polyfill-placeholder').val(x.attr('placeholder')).insertAfter(i);

			if (i.val() === '') i.hide();
			else                x.hide();

			i.on('blur', function(event) {
				event.preventDefault();

				var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

				if (i.val() === '') {
					i.hide();
					x.show();
				}
			});

			x.on('focus', function(event) {
				event.preventDefault();

				var i = x.parent().find(
					'input[name=' + x.attr('name').replace('-polyfill-field', '') + ']'
				);

				x.hide();
				i.show().focus();
			})
			.on('keypress', function(event) {
				event.preventDefault();
				x.val('');
			});
		});

		// On submit: strip polyfill names/values so they aren't sent to the server.
		$this.on('submit', function() {
			$this.find('input[type=text],input[type=password],textarea').each(function() {
				var i = $(this);

				if (i.attr('name').match(/-polyfill-field$/))
					i.attr('name', '');

				if (i.val() === i.attr('placeholder')) {
					i.removeClass('polyfill-placeholder');
					i.val('');
				}
			});
		})
		.on('reset', function(event) {
			event.preventDefault();

			$this.find('select').val($('option:first').val());

			$this.find('input,textarea').each(function() {
				var i = $(this), x;

				i.removeClass('polyfill-placeholder');

				switch (this.type) {
					case 'submit':
					case 'reset':
						break;

					case 'password':
						i.val(i.attr('defaultValue'));
						x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

						if (i.val() === '') { i.hide(); x.show(); }
						else                { i.show(); x.hide(); }
						break;

					case 'checkbox':
					case 'radio':
						i.attr('checked', i.attr('defaultValue'));
						break;

					case 'text':
					case 'textarea':
						i.val(i.attr('defaultValue'));

						if (i.val() === '') {
							i.addClass('polyfill-placeholder');
							i.val(i.attr('placeholder'));
						}
						break;

					default:
						i.val(i.attr('defaultValue'));
						break;
				}
			});
		});

		return $this;
	};

	/**
	 * Move elements to/from the top of their parent containers based on a condition.
	 * Used for responsive reordering (e.g. moving a sidebar above content on mobile).
	 *
	 * @param {jQuery|string} $elements Elements to prioritize.
	 * @param {boolean}       condition If true, move to top. If false, restore original position.
	 */
	$.prioritize = function($elements, condition) {
		var key = '__prioritize';

		if (!($elements instanceof $))
			$elements = $($elements);

		$elements.each(function() {
			var $e      = $(this),
				$parent = $e.parent(),
				$p;

			if ($parent.length === 0)
				return;

			if (!$e.data(key)) {
				// Not yet moved.
				if (!condition)
					return;

				$p = $e.prev();

				// Already at the top — nothing to do.
				if ($p.length === 0)
					return;

				$e.prependTo($parent);
				$e.data(key, $p); // Store previous sibling as restore point.

			} else {
				// Already moved — restore if condition is now false.
				if (condition)
					return;

				$p = $e.data(key);
				$e.insertAfter($p);
				$e.removeData(key);
			}
		});
	};

})(jQuery);