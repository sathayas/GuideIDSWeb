/*

Version: 1.0.0
Author: Sascha Obermüller
Date: 09.06.2020

 */

 ( function( $ ) {
	var ODAnchorNav = function( element, settings ) {
		var O = this;
		O.$E = $( element ); // content container
		var defaults = {
			anchors				: {},
			changeHash 			: false,
			easing 				: 'swing',
			$links 				: 'a',
			$navContainer		: O.$E,
			$navToggle 			: '<button class="menu-toggle" aria-label="Content Navigation"><img class="svg" src="assets/img/nav-content.svg" /></button>',
			navThreshold		: 768,
			scrollOffset 		: 0,
			scrollSpeed 		: 750,
			scrollThreshold 	: 0.5,
			on 					: {
				afterInit 			: null,
				clickLink 			: null,
				scrollStart			: null,
				scrollEnd 			: null
			}
		};
		O.options = $.extend( true, {}, defaults, settings );
		O.activeAnchor = null;
		O.anchors = {};

		O.getOptions = function() {
			return O.options;
		};
		O.setOptions = function( settings ) {
			O.options = $.extend( true, O.options, settings );
		};
		O.init = function() {

			O.create();
			// get link elems
			O.$links = O.$E.$nav.find( O.options.$links );

			O.updateAnchors();

			// update the anchor positions
			$( window ).on( 'resize orientationchange', function( e ) {
				O.updateAnchors();
			} );
			// update the nav items
			$( window ).on( 'scroll resize orientationchange', function( e ) {
				O.updateNav();
			} );

			O.$E.$nav.addClass( '-initiated' );

			// callback
			if( $.isFunction( O.options.on.afterInit ) ) {
				O.options.on.afterInit.call( this );
			}
		};
		O.create = function() {

			let anchorSelector = Object.keys( O.options.anchors );
			let $anchors = O.$E.find( anchorSelector.join( ',' ) );

			if( $anchors.length > 0 ) {
				// create nav and menu
				O.$E.$nav = $( '<nav id="nav-content" class="nav-content"></nav>' ).appendTo( O.options.$navContainer );
				O.$E.$nav.$menu = $( '<ul class="menu"></ul>').appendTo( O.$E.$nav );
				O.$E.$nav.$toggle = $( O.options.$navToggle ).prependTo( O.$E.$nav ); // mobile toggle
				// menu toggle for mobile 
				O.$E.$nav.$toggle.on( 'click', function() {
					O.toggleNav();
				} );

				let currentLevel = 0;
				let $currentMenu = O.$E.$nav.$menu;
				let $currentMenuItem = null;

				$anchors.each( function( i ) {
					let $anchor = $( this );
					$anchor.level = 0;

					$.each( O.options.anchors, function( selector, level ) {
						if( $anchor.is( selector ) ) {
							$anchor.level = level;
						}
					} );
					// set id if not set
					if( ! $anchor.hasAttr( 'id' ) ) {
						$anchor.attr( 'id', 'a'+i );
					}
					// create menu item
					let $menuItem = $( '<li class="menu__item"></li>');
					// add level class
					$menuItem.addClass( 'menu__item--lv'+ $anchor.level );

					if( currentLevel > $anchor.level ) {
						let $parentalMenus = $currentMenuItem.parents( '.menu, .submenu' );
						$currentMenu = $parentalMenus[ Math.min( $parentalMenus.length - 1, ( currentLevel - $anchor.level ) ) ];  //   $currentMenu.closest( '.menu, .submenu' );
					}
					else if( currentLevel < $anchor.level ) {
						if( !isNull( $currentMenuItem ) ) {
							// if( $anchor.level == 1 ) {
								$currentMenu = $( '<ul class="submenu"></ul>' ).appendTo( $currentMenuItem );
							// }
							// else {
							// 	$currentMenu = $currentMenuItem.closest( '.menu, .submenu' );
							// }
						}
					}
					// set level
					currentLevel = $anchor.level;
					// add item to menu
					$menuItem.appendTo( $currentMenu );
					$currentMenuItem = $menuItem;
					// create link
					let $menuLink = $( '<a href="#'+ $anchor.attr( 'id' ) +'"></a>' ).appendTo( $menuItem );
					$menuLink.text( $anchor.text() );
					// click handler
					$menuLink.on( 'click', function( e ) {
						$menuLink.blur();
						O.closeNav();
						O.setAnchor( e );
						// callback
						if( $.isFunction( O.options.on.clickLink ) ) {
							O.options.on.clickLink.call( this );
						}
					} );
				} );
			}
		};
		O.updateAnchors = function() {
			O.$links.each( function() {
				let $link = $( this );
				let linkHref = O.getHash( $link );
				let $linkTarget = $( '#' + linkHref );
				if( $linkTarget.length > 0 ) {
					O.anchors[ linkHref ] = Math.round( $linkTarget.offset().top );
				}
			});
		};
		O.updateNav = function() {
			if( O.getActiveAnchor() != O.activeAnchor ) {
				O.activeAnchor =  O.getActiveAnchor();
				// remove all active classes
				O.$E.$nav.find( '.menu__item' ).removeClass( '-active' ).removeClass( '-has-active' );
				O.$links.each( function() {
					let $link = $( this );
					if( O.getHash( $link ) == O.activeAnchor ) {
						$link.parent().addClass( '-active' );
						$link.parent().parents( '.menu__item' ).addClass( '-has-active' );
					}
				} );
			}
			if( getWinWidth() >= O.options.navThreshold ) {
				O.$E.$nav.$toggle.removeClass( '-active' );
				O.$E.$nav.$menu.removeClass( '-active' );
				O.$E.$nav.$menu.css( 'display', '' );
			}
		}
		O.toggleNav = function() {
			if( O.$E.$nav.$menu.hasClass( '-active' ) ) {
				O.closeNav();
			}
			else {
				O.openNav();
			}
		}
		O.closeNav = function() {
			O.$E.$nav.$toggle.removeClass( '-active' );
			O.$E.$nav.$menu.removeClass( '-active' );
			if( getWinWidth() < O.options.navThreshold ) {
				O.$E.$nav.$menu.slideUp( 500, function() {
					O.$E.$nav.$menu.css( 'display', '' );
				} );
			}
		}
		O.openNav = function() {
			O.$E.$nav.$toggle.addClass( '-active' );
			O.$E.$nav.$menu.addClass( '-active' );
			if( getWinWidth() < O.options.navThreshold ) {
				O.$E.$nav.$menu.slideDown( 500 );
			}
		}
		O.getHash = function( $link ) {
			return $link.attr( 'href' ).split( '#' )[1];
		};
		O.getActiveAnchor = function() {
			let winPosY = $( window ).scrollTop();
			let winH = Math.round( $( window ).height() * O.options.scrollThreshold );
			let activeAnchor = null;
			$.each( O.anchors, function( anchor, aPosY ) {
				if( ( aPosY - winH ) < winPosY ) {
					activeAnchor = anchor;
				}
			} );
			return activeAnchor;
		};
		O.setAnchor = function( e ) {
			let $link = $( e.currentTarget );
			var target = $link.attr( 'href' );

			if( O.getHash( $link ) != O.activeAnchor ) {
				// callback
				if( $.isFunction( O.options.on.scrollStart ) ) {
					O.options.on.scrollStart.call( this );
				}
				// scroll to the correct position
				O.scrollTo( target, function() {
					// do we need to change the hash?
					if( O.options.changeHash ) {
						window.location.hash = target;
					}
					O.updateNav();
					// callback
					if( $.isFunction( O.options.on.scrollEnd ) ) {
						O.options.on.scrollEnd.call( this );
					}
				} );
			}
			e.preventDefault();
		};
		O.scrollTo = function( target, callback ) {
			let scrollOffset = 0;
			// offset function
			if( $.isFunction( O.options.scrollOffset ) ) {
				scrollOffset = O.options.scrollOffset.call( this );
			}
			// offset val
			else {
				scrollOffset = O.options.scrollOffset;
			}

			let scrollY = $( target ).offset().top - scrollOffset;

			$( 'html, body' ).animate( {
				scrollTop: scrollY
			}, O.options.scrollSpeed, O.options.easing, callback );
		};
	};

	$.fn.odAnchorNav = function( settings ) {
		var $odAnchorNav = $( this );
		if( $odAnchorNav.data( 'od-scrollnav' ) ) return;
		var odan = new ODAnchorNav( $odAnchorNav, settings );
		$odAnchorNav.data( 'od-scrollnav', odan );
		odan.init();

		return odan;
	};
} )( jQuery );