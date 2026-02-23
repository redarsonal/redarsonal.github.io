/*
	Astral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window   = $(window),
		$body     = $('body'),
		$wrapper  = $('#wrapper'),
		$main     = $('#main'),
		$panels   = $main.children('.panel'),
		$nav      = $('#nav'),
		$nav_links = $nav.children('a');

	// Breakpoints.
	breakpoints({
		xlarge: [ '1281px', '1680px' ],
		large:  [ '981px',  '1280px' ],
		medium: [ '737px',  '980px'  ],
		small:  [ '361px',  '736px'  ],
		xsmall: [ null,     '360px'  ]
	});

	// Remove preload class after page load to trigger entry animations.
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Nav: handle clicks on nav links that target panels.
	$nav_links.on('click', function(event) {
		var href = $(this).attr('href');

		// Not a panel link? Let the browser handle it normally.
		if (href.charAt(0) !== '#' || $panels.filter(href).length === 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		if (window.location.hash !== href)
			window.location.hash = href;
	});

	// Intercept any in-page anchor click that targets a panel.
	// Prevents default browser jump-scroll and uses hash-based panel switching instead.
	$(document).on('click', 'a[href^="#"]', function(event) {
		var href = $(this).attr('href');

		if (href && href.charAt(0) === '#' && $panels.filter(href).length > 0) {
			event.preventDefault();
			event.stopPropagation();

			if (window.location.hash !== href)
				window.location.hash = href;
		}
	});

	// Highlight the active nav tab on click.
	$nav_links.on('click', function() {
		$nav_links.removeClass('active');
		$(this).addClass('active');
	});

	// Panels.

	// Initialize: show the panel matching the current hash, or default to the first.
	(function() {
		var $panel, $link;

		if (window.location.hash) {
			$panel = $panels.filter(window.location.hash);
			$link  = $nav_links.filter('[href="' + window.location.hash + '"]');
		}

		// No valid panel found — fall back to first.
		if (!$panel || $panel.length === 0) {
			$panel = $panels.first();
			$link  = $nav_links.first();
		}

		// Hide all other panels.
		$panels.not($panel).addClass('inactive').hide();

		// Mark the matching nav link as active.
		$link.addClass('active');

		$window.scrollTop(0);
	})();

	// Hashchange: transition to the newly targeted panel.
	$window.on('hashchange', function() {
		var $panel, $link;

		if (window.location.hash) {
			$panel = $panels.filter(window.location.hash);
			$link  = $nav_links.filter('[href="' + window.location.hash + '"]');

			// Hash doesn't match any panel? Bail.
			if ($panel.length === 0)
				return;
		} else {
			$panel = $panels.first();
			$link  = $nav_links.first();
		}

		// Deactivate all panels and nav links.
		$panels.addClass('inactive');
		$nav_links.removeClass('active');

		// Activate the target nav link.
		$link.addClass('active');

		// Lock the main container height during transition to prevent layout jump.
		// Skip locking when leaving the home/intro panel — its content is much taller
		// than other panels and the locked value causes a phantom gap on the target panel.
		var leavingIntro = $panels.filter(':visible').hasClass('intro');
		if (!leavingIntro) {
			$main
				.css('max-height', $main.height() + 'px')
				.css('min-height', $main.height() + 'px');
		}

		setTimeout(function() {
			$panels.hide();
			$panel.show();

			// Resize container to fit new panel.
			$main
				.css('max-height', $panel.outerHeight() + 'px')
				.css('min-height', $panel.outerHeight() + 'px');

			$window.scrollTop(0);

			window.setTimeout(function() {
				$panel.removeClass('inactive');

				// Release fixed height so panel can grow/shrink freely.
				$main
					.css('max-height', '')
					.css('min-height', '');

				$window.triggerHandler('--refresh');

			}, breakpoints.active('small') ? 0 : 500);

		}, 250);
	});

	// IE fixes.
	if (browser.name === 'ie') {

		// Fix min-height / flexbox layout bug in IE.
		$window.on('--refresh', function() {
			$wrapper.css('height', 'auto');

			window.setTimeout(function() {
				var h  = $wrapper.height(),
					wh = $window.height();

				if (h < wh)
					$wrapper.css('height', '100vh');
			}, 0);
		});

		$window.on('resize load', function() {
			$window.triggerHandler('--refresh');
		});

		// IE fallback: use background-image instead of <img> inside .pic,
		// since IE has flexbox bugs with images inside certain containers.
		$('.panel.intro').each(function() {
			var $pic = $(this).children('.pic'),
				$img = $pic.children('img');

			$pic
				.css('background-image',    'url(' + $img.attr('src') + ')')
				.css('background-size',     'cover')
				.css('background-position', 'center');

			$img.css('visibility', 'hidden');
		});
	}

	// Syntax highlighting: applied to all <pre><code> blocks via highlight.js.
	document.addEventListener('DOMContentLoaded', function() {
		document.querySelectorAll('pre code').forEach(function(block) {
			hljs.highlightElement(block); // highlightBlock() is deprecated; use highlightElement()
		});

		// Toggle visibility of code snippet sections.
		// Expects: <button class="code-toggle"><img ...></button><div>...</div>
		document.querySelectorAll('.code-toggle').forEach(function(toggle) {
			toggle.addEventListener('click', function() {
				var section = this.nextElementSibling;
				var icon    = this.querySelector('img');
				var hidden  = section.style.display === 'none' || section.style.display === '';

				section.style.display    = hidden ? 'block' : 'none';
				icon.style.transform     = hidden ? 'rotate(180deg)' : 'rotate(0deg)';
			});
		});
	});

	// Mouse-light effect: moves a radial gradient highlight to follow the cursor.
	document.addEventListener('mousemove', function(event) {
		var light = document.getElementById('mouse-light');
		if (light) {
			light.style.left = event.pageX + 'px';
			light.style.top  = event.pageY + 'px';
		}
	});

	// CRT scanline effect: creates a single animated line that loops at a random interval.
	function createCrtLine() {
		var crtLine = document.createElement('div');
		crtLine.classList.add('crt-line');
		document.body.appendChild(crtLine);

		function moveCrtLine() {
			// Force reflow to restart the CSS animation cleanly each cycle.
			crtLine.style.animation = 'none';
			crtLine.offsetHeight; // intentional reflow trigger
			crtLine.style.animation = '';

			setTimeout(moveCrtLine, Math.random() * 4000 + 1000);
		}

		moveCrtLine();
	}

	document.addEventListener('DOMContentLoaded', function() {
		createCrtLine();
	});

})(jQuery);