var _pathTheme = '/';

var _ui = _ui || new ODUI();

var _app = _app || {};
_app._globals = {
	spa 			: true, // single page app
	status 			: $( 'html' ),
	breakpoints 	: {
		min 		: {
			xxxs		: 375,
			xxs			: 460,
			xs			: 576,
			sm			: 768,
			md			: 1024,
			lg			: 1280,
			xl			: 1440,
			xxl			: 1920
		}
	},
	easing 			: {
		default 		: 'easeInOutCubic',
		slider 			: 'cubicBezier(0.83, 0, 0.17, 1)'
	},
	speed 			: {
		default 		: 500,
		slow 			: 750,
		slower 			: 1000,
		fast 			: 250,
		faster 			: 125,
		scroll 			: 1000
	}
};

_app._controller = _app._controller || {}; // controllers

/*	================================================== 
	menus
	================================================== */

_app._initAnchorNav = () => {
	let $el = $( '[data-anchor-nav]' );
	if( $el.length > 0 ) {
		// create anchor nav
		$el.odAnchorNav( {
			anchors 	: {
				'h2'		: 0,
				'h3'		: 1
			},
			$navContainer : $( $el.data( 'anchor-nav' ) ),
			scrollSpeed : _app._globals.speed.slower,
			scrollOffset : function() {
				if( $( window ).width() > 768 ) {
					return 140;
				}
				else {
					return 160;
				}
			},
			on 			: {
				afterInit 	: function() {
					// let target = this.$E.data( 'anchor-nav-download' );
					// if( target.length > 0 ) {
					// 	let $btn = $( '<a class="btn" href="'+ target +'" download>Download all Materials</a>' ).appendTo( this.$E.$nav );
					// }
					// this.$E.$nav.sb = new SimpleBar( this.$E.$nav[0] );
				}
			}
		} );
	}
};

/*	================================================== 
	offcanvas navigation
	================================================== */

_app._initOffcanvas = () => {
	_app._controller.offcanvas = $( '.page__offcanvas' ).odOffcanvas( {
		closeIcon 		: false,
		cover 			: null,
		coverContainer 	: null,
		docked 			: 'right',
		shiftObj 		: '.page__offcanvas',
		shiftSpeed		: _app._globals.speed.default,
		shiftEasing		: _app._globals.easing.default,
		threshold 		: 767,
		toggle 			: '.nav-header--min .menu-toggle',
		toggleContainer	: null,
		on 				: {
			afterInit		: function() {
				let O = this;
			},
			afterOpen		: function() {
				let O = this;
				let ani = anime( {
					targets		: $('.page__canvas')[0],
					translateX 	: ['100%', '0'],
					duration 	: O.opts.shiftSpeed,
					easing 		: O.opts.shiftEasing
				} );
			},
			afterClose		: function() {
				let O = this;
				let ani = anime( {
					targets		: $('.page__canvas')[0],
					translateX 	: ['0', '100%'],
					duration 	: O.opts.shiftSpeed,
					easing 		: O.opts.shiftEasing
				} );
			}	
		}
	} );
};

/*	================================================== 
	svg
	================================================== */

_app._initSVG = ( container ) => {
	let $elems = $( container ).length > 0 ? $( container ).find( 'img.svg' ) : $( 'img.svg' );
	svg4everybody();

	$elems._svgInline();
};

/*	================================================== 
	toggles
	================================================== */

_app._initToggles = ( container ) => {

	let $elems = $( container ).length > 0 ? $( container ).find( '[data-toggle]' ) : $( '[data-toggle]' );

	// toggles
	$elems.odToggle( {
		calcHeight		: true,
		easing			: _app._globals.easing.default,
		label 			: {
			switch 			: true
		},
		minHeight 		: 0,
		speed			: _app._globals.speed.default,
		focus			: {
			collapse 		: {
				speed 			: _app._globals.speed.default
			},
			expand 			: false
		}
	} );
};

/*	================================================== 
	slider
	================================================== */

_app._initTestimonialsSlider = ( container ) => {
	let $elems = $( container ).find( '.slider__container' );
	
	$elems.odSlider( { 
		swiperDefaults : {
			autoHeight 		: true,
			effect 			: 'slide',
			grabCursor 		: true,
			keyboard		: false,
			loop			: true,
			mousewheel		: false,
			pagination 		: {
				type 			: 'progressbar'
			},
			simulateTouch 	: true,
			spaceBetween	: 0,
			speed 			: _app._globals.speed.slower
		}
	} );
};

_app._initSliders = () => {
	_app._initTestimonialsSlider( '.mod-testimonials' );
};

/*	================================================== 
	init all
	================================================== */

// init page
_app._init = () => {
	_app._initOffcanvas();
	_app._initSliders();
	_app._initToggles();
	_app._initAnchorNav();
	_app._initSVG();

	_initFixes();
};

$( document ).ready( function() { 
	_app._init();
} );