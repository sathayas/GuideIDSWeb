/*

Version: 1.7.0
Author: Sascha Obermüller
Date: 11.06.2020

 */
( function( $ ) {
	var ODOffcanvas = function( element, settings ) {
		var O = this;
		this.$E = $( element );
		var defaults = {
			close 					: false,
			closeIcon				: '', // only when close=false
			closeContainer 			: null,
			cover 					: '.offcanvas__cover',
			coverContainer			: O.$E,
			docked 					: 'right',
			menu 					: 'clone', //clone, links, false
			menuContainer			: '.offcanvas__body',
			menuObj					: null,
			shiftObj 				: null,
			shiftSpeed 				: 1000,
			shiftEasing 			: 'easeInOutExpo',
			submenuToggle 			: null,
			submenuToggleContainer 	: '.sub-menu',
			submenuToggleSpeed 		: 300,
			submenuToggleThreshold 	: 768,
			submenuToggleBtn 		: true, // true = extra toggle btn or complete element
			submenuToggleBtnClass	: '',	
			threshold 				: 1023,
			toggle 					: false,
			toggleContainer 		: '.nav--toggle',
			on 						: {
				afterInit 				: null,
				clickLink 				: null,
				afterOpen 				: null,
				afterClose 				: null,
				afterToggle 			: null,
			}			
		};
		O.options = $.extend( true, {}, defaults, settings );
		O.$shiftObj = [];
		O.docked = O.options.docked == 'right' ? 'r' : 'l';
		O.shiftDir = O.options.docked == 'right' ? 'l' : 'r';
		O.isActive = false;
		O.thresholdState = $( window ).width() < O.options.submenuToggleThreshold;

		O.getOptions = function() {
			return O.options;
		};
		O.setOptions = function( settings ) {
			O.options = $.extend( true, O.options, settings );
		};
		O.init = function() {
			O.createOffcanvas();
			O.createToggle();
			O.createCover();
			O.createClose();
			O.setShiftObj();
			O.setMenu();
			O.setSubmenuToggles();

			O.$E.addClass( '-initiated' );

			// callback
			if( $.isFunction( O.options.on.afterInit ) ) {
				O.options.on.afterInit.call( this );
			}
		};
		O.createOffcanvas = function() {
			
			O.$E.addClass( 'offcanvas--'+ O.docked );

			// set container
			if( O.$E.find( '.offcanvas__container' ).length > 0 ) {
				O.$E.$container = O.$E.find( '.offcanvas__container' );
			}
			else {
				O.$E.$container = $( '<div class="offcanvas__container"></div>' ).appendTo( O.$E );
			}

		};
		O.createClose = function() {
			// set close container
			if( O.options.closeContainer ) {
				if( O.$E.find( O.options.closeContainer ).length > 0 ) { // option with class selector
					O.$E.$closeContainer = O.$E.find( O.options.closeContainer );
				}
				else { // option with element build
					O.$E.$closeContainer = $( O.options.closeContainer ).appendTo( O.$E.$container );
				}
			}
			else { // false
				O.$E.$closeContainer = O.$E.$container;
			}
			// set close button
			if( O.options.close ) {
				O.$E.$close = $( O.options.close );
				if( O.$E.$container.find( O.$E.$close ).length <= 0 ) {
					O.$E.$close.appendTo( O.$E.$closeContainer );
				}
			}
			else {
				if( O.options.closeIcon ) {
					O.$E.$close = $( '<button type="button" class="offcanvas__close" aria-label="Close">'+ O.options.closeIcon +'</button>' ).appendTo( O.$E.$closeContainer );
				}				
			}
			if( O.$E.$close ) {
				O.$E.$close.bind( 'click', function( e ) {
					e.preventDefault();
		 			O.close();
				} );	
			}
			// resize > check threshold
			$( window ).resize( function() { 
				if( $( window ).width() > O.options.threshold && O.isActive && O.options.threshold > 0 ) {
					O.close();
				}
			} );	
			// close layer on ESC key
			$( document ).keyup( function( e ) {
				if( O.isActive && e.keyCode === 27 ) {
					if( !$( ':focus' ).is( 'input' ) ) {
						O.close();
					}
				}
			} );
		};
		O.createToggle = function() {
			// Main Toggle
			O.$E.$toggle = null;

			if( O.options.toggle ) {
				O.$E.$toggle = $( O.options.toggle );
				// O.$E.$toggle.appendTo( O.options.toggleContainer );
				O.$E.$toggle.bind( 'click', function( e ) {
					e.preventDefault();
		 			O.toggle( $( this ) );
				} );
			}
		};
		O.createCover = function() {
			// Build cover to hide content, when showing off-canvas
			if( O.options.cover ) {
				if( $( O.options.cover ).length > 0 ) {
					O.$E.$cover = $( O.options.cover );
				}
				else {
					O.$E.$cover = $( '<div class="'+ O.options.cover.substring( 1 ) +'"></div>' ).prependTo( O.options.coverContainer );
				}
				O.$E.$cover.bind( 'click', function( e ) {
					e.preventDefault();
		 			O.close();
				} );
			}
		};
		O.setShiftObj = function() {
			// Define canvas objects, that will be shift on click
			if( O.options.shiftObj ) {
				O.$shiftObj = [];
				$( O.options.shiftObj ).each( function( i ) {
					O.$shiftObj.push( $( this ) );
					$( this ).attr( 'data-shift', O.options.docked );
				} );

				// $( window ).on( 'resize orientationchange keyup mouseenter mouseleave click', function( e ) {
				// 	if( O.isActive ) {
				// 		O.shift( O.shiftDir, false );
				// 	}
				// } );
			}
		};
		O.setMenu = function() {
			// set menu container
			if( O.options.menuContainer ) {
				if( O.$E.find( O.options.menuContainer ).length > 0 ) { // option with class selector
					O.$E.$menuContainer = O.$E.find( O.options.menuContainer );
				}
				else { // option with element build
					O.$E.$menuContainer = $( O.options.menuContainer ).appendTo( O.$E.$container );
				}
			}
			else { // false
				O.$E.$menuContainer = O.$E.$container;
			}

			if( O.options.menu ) {
				// Build offcanvas content 
				if( O.options.menu == 'links' ) { // copy only links from link obj
					var $list = $( '<ul />' ).appendTo( O.$E.$menuContainer );
					$( O.options.menuObj ).find( 'a' ).each( function() {
						$( '<li />', {html: $( this ).clone()} ).appendTo( $list );
					} );
				}
				else if( O.options.menu == 'clone' ) { // clone object
					$( O.options.menuObj ).each( function() {
						$( this ).clone().appendTo( O.$E.$menuContainer );
					} );
				}
			}
		};
		O.setSubmenuToggles = function() {
			// Collapse Submenus
			if( O.options.submenuToggle ) {
				O.$E.find( O.options.submenuToggle ).each( function( i ) {

					let $menuItem = $( this );

					var submenuToggleId = $menuItem.attr( 'id' ) == undefined ? i : $menuItem.attr( 'id' );
					var $submenuContainer = $menuItem.find( O.options.submenuToggleContainer );
					$submenuContainer.attr( 'id', 'sub-'+ submenuToggleId );
					var $submenuToggleBtn;
					if( O.options.submenuToggleBtn ) {
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
					$submenuToggleBtn.addClass( O.options.submenuToggleBtnClass );
					$submenuToggleBtn.data( 'collapse-container', $submenuContainer.attr( 'id' ) );
					$submenuToggleBtn.on( 'click', function( e ) {
						this.blur();
						let $submenu = $( '#'+ $submenuToggleBtn.data( 'collapse-container' ) );

						e.preventDefault();
						if( $menuItem.hasClass( '-active' ) ) {
							$menuItem.removeClass( '-active' );
							O.submenuCollapse( $submenu );
						}
						else {
							$menuItem.addClass( '-active' );
							O.submenuExpand( $submenu );
						}
					} );
				} );
				if( O.options.submenuToggleThreshold > 0 && $( window ).width() < O.options.submenuToggleThreshold ) {
					O.submenuCollapse( O.$E.find( O.options.submenuToggleContainer ) );
				}

				$( window ).on( 'resize orientationchange', function( e ) {
					let currentThresholdState = $( window ).width() < O.options.submenuToggleThreshold
					if( currentThresholdState != O.thresholdState ) {
						O.thresholdState = currentThresholdState;
						if( O.isActive ) {
							if( O.options.submenuToggleThreshold > 0 && $( window ).width() < O.options.submenuToggleThreshold ) {
								O.submenuCollapse( O.$E.find( O.options.submenuToggleContainer ) );
							}
							else {
								O.submenuExpand( O.$E.find( O.options.submenuToggleContainer ) );
							}
						}
					}
				} );
			}
		};
		O.submenuCollapse = function( $elem ) {
			$elem.slideUp( O.options.submenuToggleSpeed, function() { 
				$( this ).removeClass( '-active' ); 
			} );
		};
		O.submenuExpand = function( $elem ) {
			$elem.slideDown( O.options.submenuToggleSpeed, function() { 
				$( this ).removeClass( '-active' ); 
			} );
		};
		O.toggle = function( $toggle ) {
			if( O.isActive ) {
				O.close();
			}
			else {
				O.open( $toggle );
			}
			// callback
			if( $.isFunction( O.options.on.afterToggle ) ) {
				O.options.on.afterToggle.call( this, $toggle );
			}
		};
		O.close = function() {
			if( O.isActive ) {
				O.$E.removeClass( '-active' );
				$( 'html' ).removeClass( '-offcanvas-active' );
				O.shift( -1, true );
				$( O.options.toggle ).removeClass( '-active' );
				O.isActive = false;
				// callback
				if( $.isFunction( O.options.on.afterClose ) ) {
					O.options.on.afterClose.call( this );
				}
			}
		};
		O.open = function( $toggle ) {
			O.$E.addClass( '-active' );
			$( 'html' ).addClass( '-offcanvas-active' );
			O.shift( O.shiftDir, true );
			if( $toggle ) {
				$toggle.addClass( '-active' );
			}
			O.isActive = true;
			// callback
			if( $.isFunction( O.options.on.afterOpen ) ) {
				O.options.on.afterOpen.call( this );
			}
		};
		O.shift = function( shiftDir, shiftAnimated ) {
			if( O.options.shiftObj ) {
				$( O.options.shiftObj ).each( function( i ) {
					let $shiftEl = $( this );
					let shiftDelta = 0;
					let shiftSpeed = shiftAnimated ? O.options.shiftSpeed : 0;
					if( shiftDir != -1 ) {
						shiftDelta = O.$E.innerWidth();
						if( shiftDir == 'l' ) {
							shiftDelta *= -1;
						}
					}
				} );
			}
		};
		O.updateMenu = function( url ) {
			var currUrl;
			if( !isNull( url ) && url.length > 0 ) {
				currUrl = url.split( '/' ).pop();
			}
			else {
				currUrl = window.location.pathname.split( '/' ).pop();
			}
			O.$E.find( '.menu-item' ).removeClass( 'current-menu-item current-menu-parent current-menu-ancestor' );
			O.$E.find( '.menu-item a[href*="'+ currUrl +'"]' ).parents( '.menu-item' ).addClass( 'current-menu-item' );
		};
	};

	$.fn.odOffcanvas = function( settings ) {
		var $odOffcanvas = $( this );
		if( $odOffcanvas.data( 'od-offcanvas' ) ) return;
		var odo = new ODOffcanvas( $odOffcanvas, settings );
		$odOffcanvas.data( 'od-offcanvas', odo );
		odo.init();
		return odo;
	};
} )( jQuery );