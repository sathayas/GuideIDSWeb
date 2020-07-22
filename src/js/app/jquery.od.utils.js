
/*	================================================== 
	Conditionizr
	================================================== */

function initConditionizr() {
	// Browser Detection Tests
	try {
		conditionizr.add( 'iedge', function() {
			return /Edge\/\d./i.test( navigator.userAgent );
		} );
		conditionizr.add( 'ie11', function () {
			return !!navigator.userAgent.match(/Trident.*rv\:11\./);
		} );
		conditionizr.add( 'ie10', function () {
			return navigator.appVersion.indexOf( 'MSIE 10' ) !== -1;
		} );
		conditionizr.add( 'safari', function () {
			return /constructor/i.test( window.HTMLElement ) || ( function ( p ) { return p.toString() === "[object SafariRemoteNotification]"; } ) ( !window['safari'] || safari.pushNotification ); 
 		} );
		conditionizr.add( 'firefox', function () {
			return /firefox/i.test( navigator.userAgent );
 		} );
		conditionizr.add( 'ios', function () {
			return /iP(ad|hone|od)/i.test( navigator.userAgent );
		} );
		conditionizr.add('touch', function () {
			return 'ontouchstart' in window || !!navigator.msMaxTouchPoints 
		} );
		// add ie/iedge classes to html 
		conditionizr.on( 'iedge', function() {
			$( 'html' ).addClass( '-iedge' );
			log( 'IEDGE' );
		} );
		conditionizr.on( 'ie11', function() {
			$( 'html' ).addClass( '-ie11' );
			log( 'IE11' );
		} );
		// polyfill css var
		conditionizr.polyfill('//cdn.jsdelivr.net/gh/nuxodin/ie11CustomProperties@4.1.0/ie11CustomProperties.min.js', ['ie11']);
		conditionizr.on( 'ie10', function() {
			$( 'html' ).addClass( '-ie10' );
			log( 'IE10' );
		} );
		conditionizr.on( 'safari', function() {
			$( 'html' ).addClass( '-safari' );
			log( 'Safari' );
		} );
		conditionizr.on( 'firefox', function() {
			$( 'html' ).addClass( '-firefox' );
			log( 'Firefox' );
		} );
		conditionizr.on( 'ios', function() {
			$( 'html' ).addClass( '-ios' );
			log( 'iOS' );
		} );
		conditionizr.on( 'touch', function() {
			$( 'html' ).addClass( '-touch' );
			log( 'Touch' );
		} );
	}
	catch( err ) {
		log( err );
	}
}

/*	================================================== 
	scroll direction
	================================================== */

var scrollDirOffset = 0; // offset from top to start with classes 
var scrollThreshold = 0; // delay when scroll changes will take effect
var scrollDir = 0;
var scrollLastY = $( window ).scrollTop();// initialize last scroll position

function handleScrollDirection( e ) {
	return window.requestAnimationFrame( setScrollDirection );
}

function setScrollDirection() {
	let currY = $( window ).scrollTop(), // get current scroll position
		y = ( currY > scrollLastY ) ? 'down' : ( ( currY === scrollLastY ) ? 'none' : 'up' ); // determine current scroll direction
	if( Math.abs( currY - scrollLastY ) > scrollThreshold ) {

		$( 'html' ).removeClass( '-scrolled' );
		if( currY > scrollDirOffset ) {
			// reset all -scrolling classes
			$( 'html' ).removeClass( '-scrolling -scrolling-down -scrolling-up -scrolled-up -scrolled-down' );
			$( 'html' ).addClass( '-scrolled' );
			if( scrollDir > 0 ) {
				$( 'html' ).addClass( '-scrolled-up' );
			}
			else if( scrollDir < 0 ) {
				$( 'html' ).addClass( '-scrolled-down' );
			}
			scrollDir = 0;
		}
		if( currY <= scrollDirOffset ) {
			$( 'html' ).removeClass( '-scrolling -scrolling-down -scrolling-up -scrolled -scrolled-up -scrolled-down' );
		}
		else if( currY > scrollDirOffset ) {
			if( y == 'up' ) {
				$( 'html' ).addClass( '-scrolling -scrolling-up' );
				$( 'html' ).removeClass( '-scrolling-down' );
				scrollDir = 1;
			}
			else {
				$( 'html' ).addClass( '-scrolling -scrolling-down' );
				$( 'html' ).removeClass( '-scrolling-up' );
				scrollDir = -1;
			}
		}
		scrollLastY = currY; // update last scroll position to current position
	}
}

function initScrollDirection() {
    scrollPivot = window.scrollY || window.pageYOffset;
	// setScrollDirection();
	$( window ).on( 'resize orientationchange scroll', function( e ) {
		handleScrollDirection( e );
	} );
}

/*	================================================== 
	viewport
	================================================== */

var vh;

function setViewportHeight() {
	// if( ! $( 'html' ).hasClass( 'is-ios' ) ) {
		// get the viewport height and we multiple it by 1% to get a value for a vh unit
		vh = window.innerHeight * 0.01;
		// set the value in the --vh custom property to the root of the document
		document.documentElement.style.setProperty( '--vh', `${vh}px` );
	// }
}

function initViewportHeight() {
	setViewportHeight();
	$( window ).on( 'resize orientationchange', function( e ) {
		setViewportHeight();
	} );
}

/*	==================================================
	links
	================================================== */

function initLinks() {
	// scroll to position on load
	let hash = window.location.hash.replace( '#', '' );
	if( hash.length > 1 ) {
		let $deepTarget = $( '#' + hash );
		if( $deepTarget && $deepTarget.length > 0 ) {
			$deepTarget.goTo( {
				'offset' : scrollToLinkOffset
			} );
		}
	}

	$( 'a, button' ).on( 'click', function( e ) {
		this.blur();
	} );

	// link in page anchor
	$( 'a[href*="#"]' ).on( 'click', function( e ) {
		let href = $(this).attr( 'href' );
		// check if link is inpage link and no deeplink to other page
		if( !isUndefined( href ) && ( href.indexOf( window.location.href ) >= 0 || 
			window.location.href.indexOf( href.substring( 0, href.indexOf( '#' ) ) ) >= 0  || 
			href.indexOf( '#' ) == 0 ) && href.length > 1 ) {
			// close offcanvas menu if open
			if( $( 'html' ).hasClass( '-offcanvas-active' ) ) {
				$( '.page__offcanvas' ).data( 'od-offcanvas' ).close();
			}
			// e.preventDefault(); 
			let hash = href.substring( href.indexOf( '#' ) ); // get pure hash
			let $target = $( hash ); // target obj
			if( $target && $target.length > 0 ) {
				$target.goTo( {
					'offset' : scrollToLinkOffset
				} );
				window.location.hash = hash; // set hash
			}
		}
	} );	
}

/*	================================================== 
	utils
	================================================== */

function initUtils() {
	initConditionizr();
	initScrollDirection();
	initViewportHeight();
	initLinks();
}