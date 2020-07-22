/*	================================================== 
	global vars
	================================================== */

var debug = false; // switch for debug mode
const globalScreenSizes = {
	min 	: {
		xxxs	: 380,
		xxs		: 460,
		xs		: 576,
		sm		: 768,
		md		: 1024,
		lg		: 1280,
		xl		: 1440,
		xxl		: 1920
	}
};
const pathTheme = '/';
const gridMaxWidth = 1280;
const globalEasing = 'easeInOutCubic';
const globalSpeedFaster = 125;
const globalSpeedFast = 250;
const globalSpeed = 500;
const globalSpeedSlow = 750;
const globalSpeedSlower = 1000;
const globalScrollSpeed = globalSpeedSlower;
const scrollToLinkOffset = 128;

/*	================================================== 
	header & menu
	================================================== */

function setStickyHeader(){
	let $header = $( '.page__header' );
	let scrollTop = $( window ).scrollTop();
	if( scrollTop > 0 ){ 
		$header.addClass( '-sticky' );
	}
	else {
		$header.removeClass( '-sticky' ); 
	}
}

function initStickyHeader() {
	setStickyHeader();
	$( window ).on( 'scroll', function() {
		setStickyHeader();
	} );
}

function initHeader() {
	initStickyHeader();
}

/*	================================================== 
	menus
	================================================== */

function initAnchorNav() {
	let $el = $( '[data-anchor-nav]' );
	if( $el.length > 0 ) {
		// create anchor nav
		$el.odAnchorNav( {
			anchors 	: {
				'h2'		: 0,
				'h3'		: 1
			},
			$navContainer : $( $el.data( 'anchor-nav' ) ),
			scrollSpeed : globalScrollSpeed,
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
}

/*	================================================== 
	offcanvas navigation
	================================================== */

var offcanvasController;

function initOffcanvas() {
	offcanvasController = $( '.page__offcanvas' ).odOffcanvas( {
		closeIcon 		: false,
		cover 			: null,
		coverContainer 	: null,
		docked 			: 'right',
		shiftObj 		: '.page__offcanvas',
		shiftSpeed		: globalSpeed,
		shiftEasing		: globalEasing,
		threshold 		: 767,
		toggle 			: '.nav-header--min .menu-toggle',
		toggleContainer	: null,
		on 				: {
			afterInit		: function() {
				let O = this;
				O.$E.sb = new SimpleBar( O.$E.find( '.offcanvas__container' )[0] );
			},
			afterOpen		: function() {
				let O = this;
				let ani = anime( {
					targets		: $('.page__canvas')[0],
					translateX 	: ['100%', '0'],
					duration 	: O.options.shiftSpeed,
					easing 		: O.options.shiftEasing
				} );
			},
			afterClose		: function() {
				let O = this;
				let ani = anime( {
					targets		: $('.page__canvas')[0],
					translateX 	: ['0', '100%'],
					duration 	: O.options.shiftSpeed,
					easing 		: O.options.shiftEasing
				} );
			}	
		}
	} );
}

/*	================================================== 
	svg
	================================================== */

function initSVG( container ) {
	let $elems = $( container ).length > 0 ? $( container ).find( 'img.svg' ) : $( 'img.svg' );
	svg4everybody();
	initSVGInline( $elems );
}

/*	================================================== 
	toggles
	================================================== */

function initToggles( container ) {

	let $elems = $( container ).length > 0 ? $( container ).find( '[data-toggle]' ) : $( '[data-toggle]' );

	// toggles
	$elems.odToggle( {
		calcHeight		: true,
		easing			: globalEasing,
		label 			: {
			switch 			: true
		},
		minHeight 		: 0,
		speed			: globalSpeed,
		focus			: {
			collapse 		: {
				speed 			: globalSpeed
			},
			expand 			: false
		}
	} );
}

/*	================================================== 
	slider
	================================================== */

function initTestimonialsSlider( container ) {
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
			speed 			: globalSpeedSlower
		}
	} );
}

function initSliders() {
	initTestimonialsSlider( '.mod-testimonials' );
}


/* ================================================== 
	particles
   ================================================== */

function initStage() {
	let $elems = $( '.mod__bg--particles' );
	if( $elems.length > 0 ) {
		$elems.each( function(){
			particleground( $( this )[0], {
				dotColor: '#000000',
				lineColor: '#000000'
			} );			
		} );
	}
}

/*	================================================== 
	anime.js helper
	================================================== */

function getAnimeTargets( ani ) {
	log( ani );
	return ani.children.reduce(
		( all, one ) => all.concat( getAnimeTargets( one ) ),
		ani.animatables.map( ( a ) => a.target )
	);
}

function cancelAnime( ani ) {
	getAnimeTargets( ani ).forEach( anime.remove );
}

/*	================================================== 
	init all
	================================================== */

// init main scripts
function initMainScripts() {
	initUtils();
	initHeader();
	initOffcanvas();
	initSliders();
	initToggles();
	initAnchorNav();
	initSVG();
	initStage();
	initFixes();
}

$( document ).ready( function() { 
	initMainScripts();
} );