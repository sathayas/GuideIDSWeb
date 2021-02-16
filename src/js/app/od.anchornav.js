/* ================================================== 
version: 2.0.0
author: sod
date: 13.02.2021
dependencies : 
- jquery
================================================== */


class ODAnchorNav {
	constructor( $el, settings ) {
		let O = this;
		O.$E = $el;
		O._initiated = false;
		O._opts = $.extend( true, {}, {
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
		} , settings );
		O._activeAnchor = null;
		O._anchors = {};
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

		let anchorSelector = Object.keys( O.opts.anchors );
		let $anchors = O.$E.find( anchorSelector.join( ',' ) );

		if( $anchors.length > 0 ) {
			// create nav and menu
			O.$E.$nav = $( '<nav id="nav-content" class="nav-content"></nav>' ).appendTo( O.opts.$navContainer );
			O.$E.$nav.$menu = $( '<ul class="menu"></ul>').appendTo( O.$E.$nav );
			O.$E.$nav.$toggle = $( O.opts.$navToggle ).prependTo( O.$E.$nav ); // mobile toggle
			// menu toggle for mobile 
			O.$E.$nav.$toggle.on( 'click', function() {
				O._toggleNav();
			} );

			let currentLevel = 0;
			let $currentMenu = O.$E.$nav.$menu;
			let $currentMenuItem = null;

			$anchors.each( function( i, el ) {
				let $anchor = $( el );
				$anchor.level = 0;

				$.each( O.opts.anchors, function( selector, level ) {
					if( $anchor.is( selector ) ) {
						$anchor.level = level;
					}
				} );
				// set id if not set
				if( ! $anchor._hasAttr( 'id' ) ) {
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
					if( ! _isNull( $currentMenuItem ) ) {
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
				$menuLink.on( 'click', function( event ) {
					$menuLink.blur();
					O._closeNav();
					O._setAnchor( event );
					// callback
					if( $.isFunction( O.opts.on.clickLink ) ) {
						O.opts.on.clickLink.call( this );
					}
				} );
			} );
		}

		// get link elems
		O.$links = O.$E.$nav.find( O.opts.$links );

		O._updateAnchors();

		// update the anchor positions
		$( window ).on( 'resize orientationchange', function( event ) {
			O._updateAnchors();
		} );
		// update the nav items
		$( window ).on( 'scroll resize orientationchange', function( event ) {
			O._updateNav();
		} );

		O.$E.$nav.addClass( '-initiated' );

		// callback
		if( $.isFunction( O.opts.on.afterInit ) ) {
			O.opts.on.afterInit.call( this );
		}
	}

	_updateAnchors () {
		let O = this;
		
		O.$links.each( ( i, el ) => {
			let $link = $( el );
			let linkHref = O._getHash( $link );
			let $linkTarget = $( '#' + linkHref );
			if( $linkTarget.length > 0 ) {
				O._anchors[ linkHref ] = Math.round( $linkTarget.offset().top );
			}
		});
	}

	_updateNav () {
		let O = this;

		if( O._getActiveAnchor() != O._activeAnchor ) {
			O._activeAnchor =  O._getActiveAnchor();
			// remove all active classes
			O.$E.$nav.find( '.menu__item' ).removeClass( '-active' ).removeClass( '-has-active' );
			O.$links.each( ( i, el ) => {
				let $link = $( el );
				if( O._getHash( $link ) == O._activeAnchor ) {
					$link.parent().addClass( '-active' );
					$link.parent().parents( '.menu__item' ).addClass( '-has-active' );
				}
			} );
		}
		if( _getWinWidth() >= O.opts.navThreshold ) {
			O.$E.$nav.$toggle.removeClass( '-active' );
			O.$E.$nav.$menu.removeClass( '-active' );
			O.$E.$nav.$menu.css( 'display', '' );
		}
	}

	_toggleNav () {
		let O = this;

		if( O.$E.$nav.$menu.hasClass( '-active' ) ) {
			O._closeNav();
		}
		else {
			O._openNav();
		}
	}
	
	_closeNav () {
		let O = this;

		O.$E.$nav.$toggle.removeClass( '-active' );
		O.$E.$nav.$menu.removeClass( '-active' );
		if( _getWinWidth() < O.opts.navThreshold ) {
			O.$E.$nav.$menu.slideUp( 500, function() {
				O.$E.$nav.$menu.css( 'display', '' );
			} );
		}
	}
	
	_openNav () {
		let O = this;

		O.$E.$nav.$toggle.addClass( '-active' );
		O.$E.$nav.$menu.addClass( '-active' );
		if( _getWinWidth() < O.opts.navThreshold ) {
			O.$E.$nav.$menu.slideDown( 500 );
		}
	}

	_getHash ( $link ) {
		return $link.attr( 'href' ).split( '#' )[1];
	}

	_getActiveAnchor () {
		let O = this;

		let winPosY = $( window ).scrollTop();
		let winH = Math.round( $( window ).height() * O.opts.scrollThreshold );
		let activeAnchor = null;
		$.each( O._anchors, function( anchor, aPosY ) {
			if( ( aPosY - winH ) < winPosY ) {
				activeAnchor = anchor;
			}
		} );
		return activeAnchor;
	}

	_setAnchor ( event ) {
		let O = this;

		let $link = $( event.currentTarget );
		var target = $link.attr( 'href' );

		if( O._getHash( $link ) != O._activeAnchor ) {
			// callback
			if( $.isFunction( O.opts.on.scrollStart ) ) {
				O.opts.on.scrollStart.call( this );
			}
			// scroll to the correct position
			O._scrollTo( target, function() {
				// do we need to change the hash?
				if( O.opts.changeHash ) {
					window.location.hash = target;
				}
				O._updateNav();
				// callback
				if( $.isFunction( O.opts.on.scrollEnd ) ) {
					O.opts.on.scrollEnd.call( this );
				}
			} );
		}

		event.preventDefault();
	}

	_scrollTo ( target, callback ) {
		let O = this;

		let scrollOffset = 0;
		// offset function
		if( $.isFunction( O.opts.scrollOffset ) ) {
			scrollOffset = O.opts.scrollOffset.call( this );
		}
		// offset val
		else {
			scrollOffset = O.opts.scrollOffset;
		}

		let scrollY = $( target ).offset().top - scrollOffset;

		$( 'html, body' ).animate( {
			scrollTop: scrollY
		}, O.opts.scrollSpeed, O.opts.easing, callback );
	}
}

// helper function for instantiation
$.fn.odAnchorNav = function ( settings ) {
	let $el = $( this );
	let O = $el.data( 'od-scrollnav' );
	if( ! O ) {
		O = new ODAnchorNav( $el, settings );
		$el.data( 'od-scrollnav', O );
	}
	return O;
};