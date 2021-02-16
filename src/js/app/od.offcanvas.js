/* ================================================== 
version: 3.0.0
author: sod
date: 01.01.2021
dependencies : 
- jquery
================================================== */


class ODOffcanvas {
	constructor( $el, settings ) {
		let O = this;
		O.$E = $el;
		O._initiated = false;
		O._opts = $.extend( true, {}, {
			close 					: '.offcanvas__close',
			closeContainer 			: O.$E,
			cover 					: '.offcanvas__cover',
			coverContainer			: O.$E,
			docked 					: 'r',
			menu 					: 'clone', //clone, links, false
			menuContainer			: '.offcanvas__body',
			menuObj					: null,
			shiftObj 				: null,
			shiftSpeed 				: 1000,
			submenuToggle 			: null,
			submenuToggleContainer 	: '.sub-menu',
			submenuToggleSpeed 		: 300,
			submenuToggleThreshold 	: 768,
			submenuToggleBtn 		: true, // true = extra toggle btn or complete element
			submenuToggleBtnClass	: '',	
			threshold 				: 1023,
			toggle 					: '.offcanvas__toggle',
			on 						: {
				afterInit 				: null,
				clickLink 				: null,
				afterOpen 				: null,
				afterClose 				: null,
				afterToggle 			: null,
			}			
		} , settings );
		O._docked = O.opts.docked;
		O._shiftDir = O.opts.docked == 'right' ? 'l' : 'r';
		O.$shiftObj = [];
		O._active = false;
		O._thresholdState = $( window ).width() < O.opts.submenuToggleThreshold;
		// basic init actions
		O._create();
		O.$E.addClass( '-initiated' );
		O._initiated = true;
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
	_create () {
		let O = this;

		O._createOffcanvas();
		O._createToggle();
		O._createCover();
		O._createClose();

		O._setShiftObj();
		O._setMenu();
		O._setSubmenuToggles();
	}

	_createOffcanvas () {
		let O = this;
		O.$E.addClass( 'offcanvas--'+ O._docked );
		// set container
		if( O.$E.find( O.opts.menuContainer ).length > 0 ) {
			O.$E.$container = O.$E.find( O.opts.menuContainer );
		}
		else {
			O.$E.$container = $( '<div class="'+ O.opts.menuContainer.substring( 1 ) +'"></div>' ).appendTo( O.$E );
		}
	}

	_createClose () {
		let O = this;
		if( O.opts.close ) {
			if( O.opts.closeContainer.find( O.opts.close ).length > 0 ) {
				O.$E.$close = $( O.opts.close );
			}
			else {
				O.$E.$close = $( '<button type="button" class="'+ O.opts.close.substring( 1 ) +'" aria-label="Close"></button>' ).prependTo( O.opts.closeContainer );
			}
			O.$E.$close.bind( 'click', ( event ) => {
				event.preventDefault();
	 			O._close();
			} );
		}
		// resize > check threshold
		$( window ).resize( ( event ) => { 
			if( $( window ).width() > O.opts.threshold && O._active && O.opts.threshold > 0 ) {
				O._close();
			}
		} );	
		// close layer on ESC key
		$( document ).keyup( ( event ) => {
			if( O._active && event.keyCode === 27 ) {
				if( ! $( ':focus' ).is( 'input' ) ) {
					O._close();
				}
			}
		} );
	}

	_createToggle () {
		let O = this;
		// Main Toggle
		O.$E.$toggle = null;

		if( O.opts.toggle ) {
			O.$E.$toggle = $( O.opts.toggle );
			O.$E.$toggle.bind( 'click', ( event ) => {
				O.$E.$toggle.blur();
				event.preventDefault();
	 			O._toggle( $( this ) );
			} );
		}
	}

	_createCover () {
		let O = this;
		// Build cover to hide content, when showing off-canvas
		if( O.opts.cover ) {
			if( $( O.opts.cover ).length > 0 ) {
				O.$E.$cover = $( O.opts.cover );
			}
			else {
				O.$E.$cover = $( '<div class="'+ O.opts.cover.substring( 1 ) +'"></div>' ).prependTo( O.opts.coverContainer );
			}
			O.$E.$cover.bind( 'click', ( event ) => {
				event.preventDefault();
	 			O._close();
			} );
		}
	}

	_setShiftObj () {
		let O = this;
		// Define canvas objects, that will be shift on click
		if( O.opts.shiftObj ) {
			O.$shiftObj = [];
			$( O.opts.shiftObj ).each( ( i, el ) => {
				O.$shiftObj.push( $( el ) );
				$( el ).attr( 'data-shift', O.opts.docked );
			} );
			// $( window ).on( 'resize orientationchange keyup mouseenter mouseleave click', ( event ) => {
			// 	if( O._active ) {
			// 		O.shift( O._shiftDir, false );
			// 	}
			// } );
		}
	}

	_setMenu () {
		let O = this;
		// set menu container
		if( O.opts.menuContainer ) {
			if( O.$E.find( O.opts.menuContainer ).length > 0 ) { // option with class selector
				O.$E.$menuContainer = O.$E.find( O.opts.menuContainer );
			}
			else { // option with element build
				O.$E.$menuContainer = $( O.opts.menuContainer ).appendTo( O.$E.$container );
			}
		}
		else { // false
			O.$E.$menuContainer = O.$E.$container;
		}

		if( O.opts.menu ) {
			// Build offcanvas content 
			if( O.opts.menu == 'links' ) { // copy only links from link obj
				var $list = $( '<ul />' ).appendTo( O.$E.$menuContainer );
				$( O.opts.menuObj ).find( 'a' ).each( ( i, el ) => {
					$( '<li />', {html: $( el ).clone()} ).appendTo( $list );
				} );
			}
			else if( O.opts.menu == 'clone' ) { // clone object
				$( O.opts.menuObj ).each( ( i, el ) => {
					$( el ).clone().appendTo( O.$E.$menuContainer );
				} );
			}
		}
	}
	_setSubmenuToggles () {
		let O = this;
		// Collapse Submenus
		if( O.opts.submenuToggle ) {
			O.$E.find( O.opts.submenuToggle ).each( ( i, el ) => {

				let $menuItem = $( el );

				var submenuToggleId = $menuItem.attr( 'id' ) == undefined ? i : $menuItem.attr( 'id' );
				var $submenuContainer = $menuItem.find( O.opts.submenuToggleContainer );
				$submenuContainer.attr( 'id', 'sub-'+ submenuToggleId );
				var $submenuToggleBtn;
				if( O.opts.submenuToggleBtn ) {
					if( $menuItem.find( 'a + .sub-menu__toggle' ).length == 0  ){
						$submenuToggleBtn = $( '<button type="button" class="sub-menu__toggle" aria-label="Toggle Menu"><img class="svg" src="'+ pathTheme +'assets/img/arrow-down.svg" /></button>' ).insertAfter( $menuItem.children( 'a' ) );
					}
					else {
						$submenuToggleBtn = $menuItem.find( 'a + .sub-menu__toggle' );
					}
				}
				else {
					$submenuToggleBtn = $menuItem;
				}
				$submenuToggleBtn.addClass( O.opts.submenuToggleBtnClass );
				$submenuToggleBtn.data( 'collapse-container', $submenuContainer.attr( 'id' ) );
				$submenuToggleBtn.on( 'click', ( event ) => {
					this.blur();
					let $submenu = $( '#'+ $submenuToggleBtn.data( 'collapse-container' ) );

					event.preventDefault();
					if( $menuItem.hasClass( '-active' ) ) {
						$menuItem.removeClass( '-active' );
						O._submenuCollapse( $submenu );
					}
					else {
						$menuItem.addClass( '-active' );
						O._submenuExpand( $submenu );
					}
				} );
			} );
			if( O.opts.submenuToggleThreshold > 0 && $( window ).width() < O.opts.submenuToggleThreshold ) {
				O._submenuCollapse( O.$E.find( O.opts.submenuToggleContainer ) );
			}
			// check for threshold
			$( window ).on( 'resize orientationchange', ( event ) => {
				let currentThresholdState = $( window ).width() < O.opts.submenuToggleThreshold;
				if( currentThresholdState != O._thresholdState ) {
					O._thresholdState = currentThresholdState;
					if( O._active ) {
						if( O.opts.submenuToggleThreshold > 0 && $( window ).width() < O.opts.submenuToggleThreshold ) {
							O._submenuCollapse( O.$E.find( O.opts.submenuToggleContainer ) );
						}
						else {
							O._submenuExpand( O.$E.find( O.opts.submenuToggleContainer ) );
						}
					}
				}
			} );
		}
	}

	_submenuCollapse ( $elem ) {
		let O = this;
		$elem.slideUp( O.opts.submenuToggleSpeed, function() { 
			$( this ).removeClass( '-active' ); 
		} );
	}

	_submenuExpand ( $elem ) {
		let O = this;
		$elem.slideDown( O.opts.submenuToggleSpeed, function() { 
			$( this ).removeClass( '-active' ); 
		} );
	}

	_toggle ( $toggle ) {
		let O = this;
		if( O._active ) {
			O._close();
		}
		else {
			O._open( $toggle );
		}
		// callback
		if( $.isFunction( O.opts.on.afterToggle ) ) {
			O.opts.on.afterToggle.call( this, $toggle );
		}
	}

	_close () {
		let O = this;
		if( O._active ) {
			O.$E.removeClass( '-active' );
			$( 'html' ).removeClass( '-offcanvas-active' );
			O._shift( -1, true );
			$( O.opts.toggle ).removeClass( '-active' );
			O._active = false;
			// callback
			if( $.isFunction( O.opts.on.afterClose ) ) {
				O.opts.on.afterClose.call( this );
			}
		}
	}

	_open ( $toggle ) {
		let O = this;
		O.$E.addClass( '-active' );
		$( 'html' ).addClass( '-offcanvas-active' );
		O._shift( O._shiftDir, true );
		if( $toggle ) {
			$toggle.addClass( '-active' );
		}
		O._active = true;
		// callback
		if( $.isFunction( O.opts.on.afterOpen ) ) {
			O.opts.on.afterOpen.call( this );
		}
	}
	
	_shift ( dir, animate ) {
		let O = this;

		if( O.opts.shiftObj ) {
			$( O.opts.shiftObj ).each( ( i, el ) => {
				let $shiftEl = $( el );
				let shiftDelta = 0;
				let shiftSpeed = animate ? O.opts.shiftSpeed : 0;
				if( dir != -1 ) {
					shiftDelta = O.$E.innerWidth();
					if( dir == 'l' ) {
						shiftDelta *= -1;
					}
				}
			} );
		}
	}

	_updateMenu ( url ) {
		let O = this;
		var currUrl;
		if( ! _isNull( url ) && url.length > 0 ) {
			currUrl = url.split( '/' ).pop();
		}
		else {
			currUrl = window.location.pathname.split( '/' ).pop();
		}
		O.$E.find( '.menu-item' ).removeClass( 'current-menu-item current-menu-parent current-menu-ancestor' );
		O.$E.find( '.menu-item a[href*="'+ currUrl +'"]' ).parents( '.menu-item' ).addClass( 'current-menu-item' );
	}
}

// helper function for instantiation
$.fn.odOffcanvas = function ( settings ) {
	let $el = $( this );
	let O = $el.data( 'od-offcanvas' );
	if( ! O ) {
		O = new ODOffcanvas( $el, settings );
		$el.data( 'od-offcanvas', O );
	}
	return O;
};