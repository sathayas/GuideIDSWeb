/* ================================================== 
version: 1.0.0
author: sod
date: 27.12.2020
dependencies : 
- conditionizr
================================================== */


class ODUI {
	constructor ( settings ) {
		let O = this;
		// defaults
		O._opts = $.extend( true, {}, {
			scrollDirOffset : 0, // offset from top to start with classes 
			scrollThreshold : 0, // delay when scroll changes will take effect
			status 			: $( 'html' ),
			on 				: {
				afterInit		: null
			}
		}, settings );

		O._$status = O.opts.status;
		O._vh = 1;

		O._create();
		// callback
		if( $.isFunction( O.opts.on.afterInit ) ) {
			O.opts.on.afterInit.call( O );
		}
	}
	get opts () {
		return this._opts;
	}
	set opts ( settings ) {
		this._opts = $.extend( true, {}, this.opts, settings );
	}


	/**
	 * CREATE
	 * init basic ui features
	 */

	_create () {
		this._initConditionizr();
		this._initScrollDir();
		this._initVH();
		this._initLinks();
	}


	/**
	 * INIT CONDITIONIZR
	 * browser detection tests
	 */

	_initConditionizr () {
		let O = this;

		try {
			conditionizr.add( 'iedge', () => {
				return /Edge\/\d./i.test( navigator.userAgent );
			} );
			conditionizr.add( 'ie11', () => {
				return !!navigator.userAgent.match(/Trident.*rv\:11\./);
			} );
			conditionizr.add( 'safari', () => {
				return /constructor/i.test( window.HTMLElement ) || ( function ( p ) { return p.toString() === "[object SafariRemoteNotification]"; } ) ( !window['safari'] || safari.pushNotification ); 
	 		} );
			conditionizr.add( 'firefox', () => {
				return /firefox/i.test( navigator.userAgent );
	 		} );
			conditionizr.add( 'ios', () => {
				return /iP(ad|hone|od)/i.test( navigator.userAgent );
			} );
			conditionizr.add('touch', () => {
				return 'ontouchstart' in window || !!navigator.msMaxTouchPoints;
			} );

			// polyfills
			// conditionizr.polyfill( '//cdn.jsdelivr.net/npm/css-vars-ponyfill@2', ['ie11'] );

			// add ie/iedge classes to html 
			conditionizr.on( 'iedge', () => {
				O._$status.addClass( '-iedge' );
				_log( 'IEDGE' );
			} );
			conditionizr.on( 'ie11', () => {
				O._$status.addClass( '-ie11' );
				_log( 'IE11' );
			} );
			conditionizr.on( 'safari', () => {
				O._$status.addClass( '-safari' );
				_log( 'Safari' );
			} );
			conditionizr.on( 'firefox', () => {
				O._$status.addClass( '-firefox' );
				_log( 'Firefox' );
			} );
			conditionizr.on( 'ios', () => {
				O._$status.addClass( '-ios' );
				_log( 'iOS' );
			} );
			conditionizr.on( 'touch', () => {
				O._$status.addClass( '-touch' );
				_log( 'Touch' );
			} );

		}
		catch( err ) {
			_log( err );
		}
	}


	/**
	 * HANDLE SCROLL DIR
	 * handler for scroll dir detection
	 */

	_handleScrollDir ( event ) {
		let O = this;

		return window.requestAnimationFrame( () => { O._setScrollDir(); } );
	}


	/**
	 * SET SCROLL DIR
	 * set scroll dir detection as class
	 */

	_setScrollDir () {
		let O = this;

		let currY = $( window ).scrollTop(); // get current scroll position
		let currDir = ( currY > O._scrollLastY ) ? 'down' : ( ( currY === O._scrollLastY ) ? 'none' : 'up' ); // determine current scroll direction
		
		clearTimeout( O._scrollCheck );
		// changed scroll-pos since last action?
		if( Math.abs( currY - O._scrollLastY ) > O._scrollThreshold ) {

			// scroll pos above offset: remove all
			if( currY <= O._scrollDirOffset ) {
				O._$status.removeClass( '-scrolling -scrolling-down -scrolling-up -scrolled -scrolled-up -scrolled-down' );
			}
			// scrolled below offset
			else if( currY > O._scrollDirOffset ) {
				if( currDir == 'up' ) {
					O._$status.addClass( '-scrolled -scrolled-up' );
					O._$status.addClass( '-scrolling -scrolling-up' );
					O._$status.removeClass( '-scrolling-down -scrolled-down' );
					O._scrollDir = 1;
				}
				else if( currDir == 'down' ) {
					O._$status.addClass( '-scrolled -scrolled-down' );
					O._$status.addClass( '-scrolling -scrolling-down' );
					O._$status.removeClass( '-scrolling-up -scrolled-up' );
					O._scrollDir = -1;
				}
				else {
					O._$status.removeClass( '-scrolling -scrolling-down -scrolling-up' );
					O._scrollDir = 0;
				}
			}
			O._scrollLastY = currY; // update last scroll position to current position
			O._scrollCheck = setTimeout( () => {
				O._setScrollDir();
			}, 250 );
		}
		else {
			O._$status.removeClass( '-scrolling -scrolling-down -scrolling-up' );
		}
	}


	/**
	 * INIT SCROLL DIR
	 * initialize scroll direction detectection
	 */

	_initScrollDir () {
		let O = this;

		O._scrollLastY = window.scrollY || window.pageYOffset;
		O._scrollDirOffset = O.opts.scrollDirOffset; // offset from top to start with classes 
		O._scrollThreshold = O.opts.scrollThreshold; // delay when scroll changes will take effect
		O._scrollDir = 0;
		// O._scrollLastY = $( window ).scrollTop();// initialize last scroll position
		$( window ).on( 'resize orientationchange scroll', function( event ) {
			O._handleScrollDir( event );
		} );
	}


	/**
	 * SET VH
	 * sets as css var viewport height
	 */

	_setVH () {
		let O = this;
		// if( ! O._$status.hasClass( '-ios' ) ) {
			// get the viewport height and we multiple it by 1% to get a value for a vh unit
			O._vh = window.innerHeight * 0.01;
			// set the value in the --vh custom property to the root of the document
			document.documentElement.style.setProperty( '--vh', `${ O._vh }px` );
		// }
	}


	/**
	 * INIT VH
	 * sanitize viewport height
	 */

	_initVH () {
		let O = this;

		O._setVH();
		$( window ).on( 'resize orientationchange', function( event ) {
			O._setVH();
		} );
	}


	/**
	 * INIT LINKS
	 * handle anchor links
	 */

	_initLinks () {
		let O = this;

		// scroll to position on load
		let hash = window.location.hash.replace( '#', '' );
		if( hash.length > 1 ) {
			let $deepTarget = $( '#' + hash );
			if( $deepTarget && $deepTarget.length > 0 ) {
				$deepTarget._goTo();
			}
		}

		$( 'a, button' ).on( 'click', function( event ) {
			this.blur();
		} );
	}
}
