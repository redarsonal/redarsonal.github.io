/*
	Astral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$main = $('#main'),
		$panels = $main.children('.panel'),
		$nav = $('#nav'), $nav_links = $nav.children('a');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '361px',   '736px'  ],
			xsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Nav.
		$nav_links
			.on('click', function(event) {

				var href = $(this).attr('href');

				// Not a panel link? Bail.
					if (href.charAt(0) != '#'
					||	$panels.filter(href).length == 0)
						return;

				// Prevent default.
					event.preventDefault();
					event.stopPropagation();

				// Change panels.
					if (window.location.hash != href)
						window.location.hash = href;

			});

	// Panels.

		// Initialize.
			(function() {

				var $panel, $link;

				// Get panel, link.
					if (window.location.hash) {

				 		$panel = $panels.filter(window.location.hash);
						$link = $nav_links.filter('[href="' + window.location.hash + '"]');

					}

				// No panel/link? Default to first.
					if (!$panel
					||	$panel.length == 0) {

						$panel = $panels.first();
						$link = $nav_links.first();

					}

				// Deactivate all panels except this one.
					$panels.not($panel)
						.addClass('inactive')
						.hide();

				// Activate link.
					$link
						.addClass('active');

				// Reset scroll.
					$window.scrollTop(0);

			})();

		// Hashchange event.
			$window.on('hashchange', function(event) {

				var $panel, $link;

				// Get panel, link.
					if (window.location.hash) {

				 		$panel = $panels.filter(window.location.hash);
						$link = $nav_links.filter('[href="' + window.location.hash + '"]');

						// No target panel? Bail.
							if ($panel.length == 0)
								return;

					}

				// No panel/link? Default to first.
					else {

						$panel = $panels.first();
						$link = $nav_links.first();

					}

				// Deactivate all panels.
					$panels.addClass('inactive');

				// Deactivate all links.
					$nav_links.removeClass('active');

				// Activate target link.
					$link.addClass('active');

				// Set max/min height.
					$main
						.css('max-height', $main.height() + 'px')
						.css('min-height', $main.height() + 'px');

				// Delay.
					setTimeout(function() {

						// Hide all panels.
							$panels.hide();

						// Show target panel.
							$panel.show();

						// Set new max/min height.
							$main
								.css('max-height', $panel.outerHeight() + 'px')
								.css('min-height', $panel.outerHeight() + 'px');

						// Reset scroll.
							$window.scrollTop(0);

						// Delay.
							window.setTimeout(function() {

								// Activate target panel.
									$panel.removeClass('inactive');

								// Clear max/min height.
									$main
										.css('max-height', '')
										.css('min-height', '');

								// IE: Refresh.
									$window.triggerHandler('--refresh');

								// Unlock.
									locked = false;

							}, (breakpoints.active('small') ? 0 : 500));

					}, 250);

			});

	// IE: Fixes.
		if (browser.name == 'ie') {

			// Fix min-height/flexbox.
				$window.on('--refresh', function() {

					$wrapper.css('height', 'auto');

					window.setTimeout(function() {

						var h = $wrapper.height(),
							wh = $window.height();

						if (h < wh)
							$wrapper.css('height', '100vh');

					}, 0);

				});

				$window.on('resize load', function() {
					$window.triggerHandler('--refresh');
				});

			// Fix intro pic.
				$('.panel.intro').each(function() {

					var $pic = $(this).children('.pic'),
						$img = $pic.children('img');

					$pic
						.css('background-image', 'url(' + $img.attr('src') + ')')
						.css('background-size', 'cover')
						.css('background-position', 'center');

					$img
						.css('visibility', 'hidden');

				});

		}

	// Function to display code snippets
	document.addEventListener('DOMContentLoaded', function() {
		const codeBlocks = document.querySelectorAll('pre code');
		codeBlocks.forEach((block) => {
			hljs.highlightBlock(block);
		});

		// Toggle code snippet visibility
		const toggles = document.querySelectorAll('.code-toggle');
		toggles.forEach((toggle) => {
			toggle.addEventListener('click', function() {
				const codeSection = this.nextElementSibling;
				const icon = this.querySelector('img');
				if (codeSection.style.display === 'none' || codeSection.style.display === '') {
					codeSection.style.display = 'block';
					icon.style.transform = 'rotate(180deg)';
				} else {
					codeSection.style.display = 'none';
					icon.style.transform = 'rotate(0deg)';
				}
			});
		});
	});

	// Function to update the position of the light effect
	document.addEventListener('mousemove', function(event) {
		const light = document.getElementById('mouse-light');
		light.style.left = event.pageX + 'px';
		light.style.top = event.pageY + 'px';
	});

	document.addEventListener('DOMContentLoaded', function() {
		const bootText = `> Starting boot sequence...
	  > Performing Power-On Self-Test (POST)...
	  > [Booting...]
	  > [Memory OK] [CPU OK] [Disk OK]
	  > Loading custom environment...
	  > Initializing user interface...
	  > Loading bootloader...
	  > System boot complete.
	  
	  > Welcome! Feel free to check out my work, read about me, or reach out!`.trim();
	  
		const bootContainer = document.getElementById("boot-sequence");
		bootContainer.innerHTML = ""; // Clear previous content
		let bootIndex = 0;
		const bootSpeed = 20; // typing speed
	  
		function typeBootSequence() {
		  if (bootIndex < bootText.length) {
			const char = bootText.charAt(bootIndex);
			if (char === '\n') {
			  bootContainer.innerHTML += '<br>';
			  // Optionally, skip any extra spaces or tabs right after a newline:
			  while (
				bootText.charAt(bootIndex + 1) === ' ' ||
				bootText.charAt(bootIndex + 1) === '\t'
			  ) {
				bootIndex++;
			  }
			} else {
			  bootContainer.innerHTML += char;
			}
			bootIndex++;
			setTimeout(typeBootSequence, bootSpeed);
		  } else {
			// Finish up (fade out, etc.)
			setTimeout(() => {
			  document.getElementById("black-screen").style.opacity = 0;
			  setTimeout(() => {
				document.getElementById("black-screen").style.display = 'none';
			  }, 1000);
			}, 2000);
		  }
		}
	  
		setTimeout(typeBootSequence, 1000); // Start after 1 second
	  });	  

	// Function to create and animate CRT line effect
	function createCrtLine() {
		const crtLine = document.createElement('div');
		crtLine.classList.add('crt-line');
		document.body.appendChild(crtLine);

		function moveCrtLine() {
			crtLine.style.animation = 'none';
			crtLine.offsetHeight; // Trigger reflow
			crtLine.style.animation = '';
			setTimeout(moveCrtLine, Math.random() * 4000 + 1000); // Wait 1-5 seconds
		}

		moveCrtLine();
	}

	document.addEventListener('DOMContentLoaded', function() {
		createCrtLine();
	});

})(jQuery);