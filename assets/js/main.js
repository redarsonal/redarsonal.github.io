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

	// Terminal background effect: types randomized terminal-style commands into a fixed
	// background layer, character by character, then clears and repeats indefinitely.
	// The text color is set just barely above the background so it reads as ambient
	// texture rather than competing with foreground content.
	(function() {
		var lines = [
			'> initializing...',
			'> loading assets...',
			'> checking dependencies...',
			'> all systems nominal',
			'$ ls -la projects/\ndrwxr-xr-x  shuttlefall/\ndrwxr-xr-x  moth2/\ndrwxr-xr-x  refraction/\ndrwxr-xr-x  procedural dungeon/',
			'$ git log --oneline',
			'a1f3c9e  fix: panel height transition bug',
			'c74aa12  refactor: clean up util.js',
			'$ ping localhost',
			'64 bytes from 127.0.0.1: icmp_seq=1 ttl=64',
			'64 bytes from 127.0.0.1: icmp_seq=2 ttl=64',
			'$ whoami\n> systems_programmer',
			'> many days, many bugs...',
			'$ find . -name "*.bug" -delete',
			'> no bugs found (suspicious)',
			'> help, im trapped in this terminal!',
			'$ npm run dev',
			'> compiled successfully in 142ms',
			'$ grep -r "TODO" src/',
			'> main.js:47: TODO: rewrite entire codebase\n> (just kidding)',
			'$ ./run_game.sh',
			'> loading world...',
			'> entities spawned: 312',
			'> ready.',
			'> cd top_secret/',
			'> weather unknown: you are inside',
			'> everything is fine\n> (it is not fine)',
			'> 1 file changed, 214 insertions(+), 1 deletion(-)',
			'> found 2 zombie processes.\n> left them alone out of respect',
			'> warning: you should know better',
			'> model name: fast enough, probably',
			'> vim (not a cry for help)',
			'> echo "hello world"',
			'> last reboot: because something broke',
			'$ diff old_code.js new_code.js \n> its the same code.\n> you added a comment.',
			'$ touch grass.txt\n> created.\n> reminder set for: eventually',
			'> alain spawned...',
			'> drill shuttoff initalized.',
			'> Quota met, SHUTTLEFALL initiated.',
			'> Anyone seen Nick?',
			'$ systemctl restart everything ',
			'$ kill -9 1337',
			'$ git stash pop',
			'$ git pull origin main',
			'$ git init',
			'$ unzip assets.zip -d assets/',
			'$ ./please_work.sh',
			'$ !!',
			'$ echo $?',
			'> Michael, the moths are broken again...',
			'$ uptime -p\n> up 3 weeks, 2 days, 14 hours',
			'> running 10 iterations...\n> avg: 4.7ms\n> peak: 4.8ms\n> worst: 312ms  <-- what happened here',
			'> you are doing science.',
			'> If the laws of physics no longer apply in the future, God help you.',
			'$ ping space\n> space.\n> spaaaacee.',
			'> - removed herobrine',
			'> spruce wood is better than oak wood',
			'> - removed herobrine',
			'> DETERMINATION',
			'> despite everything, it is still you.',
			'$ ./reset.sh',
			'> - removed herobrine',
			'> anonymous user connected.\n> no messages exchanged.\n> reached summit together.\n> anonymous user disconnected.',
			'> drwxr-xr-x  golden_wasteland/',
			'> returning to the sky.',
			'> winged light found: 3',
			'> spirit is showing you something.',
			'> drwxr-xr-x  eye_of_eden/',
			'$ @echo "Hello?"\n> [Turret]: Hello.',
			'> This next test may involve trace amounts of time travel. So, word of advice: If you meet yourself on the testing track, dont make eye contact.',
			'$ playmusic.exe\n> playing: "Aria Math" by C418',
			'$ playmusic.exe\n> playing: "Excuse" by C418',
			'$ playmusic.exe\n> playing: "End of Small Sanctuary" by Akira Yamaoka',	
			'$ playmusic.exe\n> playing: "Theme of Laura" by Akira Yamaoka',
			'$ playmusic.exe\n> playing: "End of Small Sanctuary" by Akira Yamaoka',	
			'$ playmusic.exe\n> playing: "Rainy Day" by Alec Holowka',	
		];

		// Create the container and pre element.
		var container = document.createElement('div');
		container.id = 'terminal-bg';
		var pre = document.createElement('pre');
		container.appendChild(pre);
		document.body.insertBefore(container, document.body.firstChild);

		var displayed = '';   // Full text currently shown
		var lineIdx   = 0;    // Which line we're typing
		var charIdx   = 0;    // Which character within the line
		var paused    = false;

		// Shuffle lines so the order feels organic each visit.
		lines = lines.slice().sort(function() { return Math.random() - 0.5; });

		function typeChar() {
			if (paused) return;

			var line = lines[lineIdx];

			if (charIdx < line.length) {
				// Still typing the current line.
				displayed += line.charAt(charIdx);
				charIdx++;
				pre.textContent = displayed;
				setTimeout(typeChar, Math.random() * 30 + 20); // 20–50ms per char
			} else {
				// Finished the line — pause, add newline, move to next.
				displayed += '\n';
				charIdx = 0;
				lineIdx = (lineIdx + 1) % lines.length;

				// When we loop back to the start, clear the screen after a pause.
				if (lineIdx === 0) {
					paused = true;
					setTimeout(function() {
						displayed = '';
						pre.textContent = '';
						paused = false;
						lines = lines.slice().sort(function() { return Math.random() - 0.5; });
						setTimeout(typeChar, 400);
					}, 2500);
				} else {
					setTimeout(typeChar, Math.random() * 200 + 100); // pause between lines
				}
			}
		}

		document.addEventListener('DOMContentLoaded', function() {
			setTimeout(typeChar, 300); // slight delay before starting
		});
	})();

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