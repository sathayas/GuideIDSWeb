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
/*	================================================== 
	fit images / polyfill
	================================================== */

function initFitImgFix() {
	var $fitImages = $( '.media--cover img, .media--contain img' );
	if( $fitImages.length > 0 ) {
		objectFitImages( $fitImages, {watchMQ: true} );
	}
}

/*	================================================== 
	iedge fixes
	================================================== */

function initIEdgeFix() {
	// iedge <picture> fix
	$( '.no-object-fit.-iedge' ).find( $( '.media--contain picture source, .media--cover picture source' ) ).remove();
}

/*	================================================== 
	ie11 fixes
	================================================== */

function initIE11Fix() {
	// fix grid row autoplacement
	$( window ).on( 'scroll', function() {
		if( $( window ).scrollTop() > 0 ) { 
			let $nav = $( '.mod-nav-contents ' )
			let offsetNav = $( window ).scrollTop() + parseInt( $nav.parent().css( 'padding-top' ) );
			$nav.css( {
				top 		: offsetNav +'px'
			} );
		}
	} );
}

/*	================================================== 
	fixes
	================================================== */

function initFixes() {
	initFitImgFix();
	if( isBrowser( ['iedge'] ) ) {
		initIEdgeFix();
	}
	if( isBrowser( ['ie11'] ) ) {
		initIE11Fix();
	}
}
/*	================================================== 
	debug console log
	================================================== */

function log( log ) {
	if( debug ) {
		console.log( log );
	}
}

/*	==================================================
	is browser
	================================================== */

function isBrowser( browser ) {
	if( Array.isArray( browser ) ) {
		var isB = false;
		browser.forEach( function( el ) {
			if( $( 'html' ).hasClass( '-'+ el ) ) {
				isB = true;
			}
			// log( 'isBrowser: '+ el + ' = '+ isB );
		} );
		return isB;
	}
	else {
		return $( 'html' ).hasClass( browser );
	}
}

/*	==================================================
	get rest data
	================================================== */

// arg1 = array with (A) setting or (B) url
// arg2 = (B) returnType as function or boolean true to return data
// arg3 = (B) async
function getRestData( arg1, arg2, arg3 ) {

	let xhrArgs = {};
	let xhr;

	if( $.isArray( arg1 ) ) {
		xhrArgs = $.extend( true, xhrArgs, arg1 );
	}
	else if ( typeof arg1 === 'string' && typeof arg3 === 'boolean' && ( typeof arg2 === 'function' || typeof arg2 === 'boolean' ) ) {
		xhrArgs = {
			url 	: arg1,
			async 	: arg3,
			success : function( data ) {
				try {
					if( $.isFunction( arg2 ) ) {
						arg2.call( this, data );
					}
					else if ( arg2 === true ) {
						return data;
					}
				}
				catch( err ) {
					log( err );
				}
				xhr = null;
			},
			error 	: function( xhr, status, error ) {
				log( xhr.status +' '+ xhr.statusText );
				if( $.isFunction( arg2 ) ) {
					arg2.call( this, false );
				}
				else if ( arg2 === true ) {
					return false;
				}
				xhr = null;
			}
		};
	}
	xhr = $.ajax( xhrArgs );
}

/*	==================================================
	get scrollbar width
	================================================== */

function getScrollbarWidth() {
	return window.innerWidth - document.documentElement.clientWidth;
}

/*	==================================================
	get scrollbar width
	================================================== */

function getWinWidth() {
	return $( window ).innerWidth() + getScrollbarWidth();
}

/*	================================================== 
	get url vars
	================================================== */

function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ).split( '&' );
    for( var i = 0; i < hashes.length; i++ ) {
        hash = hashes[i].split( '=' );
        vars.push( hash[0] );
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/*	================================================== 
	check if is undefined
	================================================== */

function isUndefined( val ) {
	return typeof val === typeof undefined ? true : false;
}

/*	==================================================
	check if is null undefined
	================================================== */

function isNull( val ) {
	return val == null ? true : false;
}

/*	==================================================
	strip html tags
	================================================== */

function stripHtmlTags( str ) {
	if ( ( str === null ) || ( str === '' ) ) {
		return false;
	}
	else {
		str = str.toString();
		return str.replace( /<[^>]*>/g, '' );
	}
}

/*	==================================================
	got to
	================================================== */

$.fn.goTo = function( opts ) {
	if( $( this ) ) {
		var scrollSpeed = globalScrollSpeed;
		var scrollOffset = 0;
		if(!isUndefined( opts ) && !isUndefined( opts.speed ) && opts.speed > 0 ) {
			scrollSpeed = opts.speed;
		}
		if( !isUndefined( opts ) && !isUndefined( opts.offset ) && opts.offset > 0 ) {
			scrollOffset = opts.offset;
		}
		$( 'html, body' ).animate({
			scrollTop: ( $( this ).offset().top - scrollOffset ) + 'px'
		}, scrollSpeed );
	}
	return this;
};

/*	==================================================
	has attribute
	================================================== */

$.fn.hasAttr = function( attrName ) {
	if( $( this ) ) {
		var attr = $( this ).attr( attrName );
		if ( typeof attr !== typeof undefined && attr !== false ) { // Element has this attribute
			return true;
		}
	}
	return false;
};

/*	==================================================
	is visible
	================================================== */
	
$.fn.inView = function( partial = true ) {
	const { top, left, bottom, right } = $( this )[0].getBoundingClientRect();
	const { innerHeight, innerWidth } = window;
	return partial
	? ( ( top > 0 && top < innerHeight ) || ( bottom > 0 && bottom < innerHeight ) ) &&
		( ( left > 0 && left < innerWidth ) || ( right > 0 && right < innerWidth ) )
	: top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

/*	==================================================
	get transform value
	================================================== */
	
$.fn.getTransformValue = function( val ) {
	let matrix = new DOMMatrix( $( this ).css( 'transform' ) );
	if( isUndefined( matrix[val] ) ) {
		return 0;
	}
	else {
		return matrix[val];
	}
};

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
/*

version: 2.1.0
author: Sascha Obermüller
date: 06/06/2020
dependencies : swiper

*/
( function( $ ) {
	var ODSlider = function( element, settings ) {
		var O = this;
		O.$E = $( element );
		O.$E.id = O.$E.attr( 'id' );
		var defaults = {
			brightness		: true,
			brightnessEl 	: O.$E,
			parentClass 	: '.mod',
			slideClass 		: '.slide',
			threshold 		: {
				split 		: 768
			},
			swiperDefaults	: {
				delay 			: 10,
				disableOnInteraction : true,
				effect			: 'slide',
				grabCursor 		: true,
				keyboardControl : true,
				lazy			: false,
				navigation 		: {
					nextEl				: '#'+ O.$E.id +'-nav-next',
					prevEl				: '#'+ O.$E.id +'-nav-prev',
					disabledClass 		: 'slider__btn--disabled',
					hiddenClass 		: 'slider__btn--hidden'
				},
				observer 		: true,
				observeParents	: true,
				pagination: {
					el 					: '#'+ O.$E.id +'-pagination',
					type 				: 'bullets',
					bulletElement 		: 'li',
					clickable			: true,
					modifierClass 		: 'slider__pagination--',
					bulletClass 		: 'slider__pagination-bullet',
					bulletActiveClass	: 'slider__pagination-bullet--active',
					currentClass 		: 'slider__pagination-current',
					totalClass 			: 'slider__pagination-total',
					hiddenClass 		: 'slider__pagination--hidden',
					progressbarFillClass: 'slider__pagination--progressbar-fill',
					clickableClass 		: 'slider__pagination--clickable',
					lockClass 			: 'slider__pagination--lock'
				},
				parallax		: false,
				preloadImages	: true,
				roundLengths	: true,
				slideClass				: 'slide',
				slideActiveClass 		: 'slide--active',
				slideNextClass			: 'slide--next',
				slideDuplicateNextClass	: 'slide--duplicate-next',
				slidePrevClass			: 'slide--prev',
				slideDuplicatePrevClass	: 'slide--duplicate-prev',
				slideDuplicateClass 	: 'slide--duplicate',
				slideVisibleClass 		: 'slide--visible',
				wrapperClass			: 'slider__slides',
				containerModifierClass 	: 'slider__container--',
				slidesPerView	: 'auto',
				spaceBetween	: 0,
				speed 			: 500,
				virtualTranslate: false,
				watchOverflow	: true,
				on 				: {
					init  : function() {
						// O.setActiveSlide();
					},
					slideChangeTransitionEnd 	: function() {
						O.setActiveSlide();
					},
					slideChange 				: function() {
						$( this.el ).attr( 'data-slide-active', this.realIndex );
					},
					slideNextTransitionStart 	: function() {
						//slides by 2 if two 50% slides visual
						if( O.initFinished ) {
							var nextIndex = this.activeIndex + 1 > this.slides.length -1 ? 0 : this.activeIndex + 1;
							if( $( window ).width() > O.options.threshold.split && $( this.slides[this.previousIndex] ).hasClass( 'slide--50' ) && $( this.slides[this.activeIndex] ).hasClass( 'slide--50' ) ) {
								this.slideTo( nextIndex, this.params.speed, false );
							}
							O.setActiveSlide();
						}
					},
					slidePrevTransitionStart 	: function() {
						//slides by 2 if previous two slides are 50% wide
						if( O.initFinished ) {
							var prevIndex = this.activeIndex - 1 >=  0 ? this.activeIndex - 1 : this.slides.length - 1;
							if( $( window ).width() > O.options.threshold.split && $( this.slides[this.activeIndex] ).hasClass( 'slide--50' ) && $( this.slides[prevIndex] ).hasClass( 'slide--50' ) ) {
								this.slideTo( prevIndex, this.params.speed, false );
							}
							O.setActiveSlide();
						}
					}
				}
			},
			on 	: {
				afterInitSlider	: null
			}
		};
		O.options = $.extend( true, {}, defaults, settings );
		O.$E.slider = null;
		O.$E.$wrapper = O.$E.parents( '.slider' );

		O.getOptions = function() {
			return O.options;
		};
		O.setOptions = function( settings ) {
			O.options = $.extend( true, O.options, settings );
		};
		O.init = function() {
			O.initFinished = false;
			//add autoplay if set by data attr
			O.autoplay = O.$E.data( 'autoplay' );
			if( O.autoplay && O.autoplay > 0 ) {
				O.options = $.extend( true, O.options, {
					swiperDefaults : {
						autoplay: {
							delay 					: O.autoplay,
							disableOnInteraction 	: false
						}
					}
				} );
			} 
			else {
				O.options = $.extend( true, O.options, {
					swiperDefaults : {
						autoplay: false
					}
				} );
			}
			// brightness element function
			if( $.isFunction( O.options.brightnessEl ) ) {
				O.$brightnessEl = O.options.brightnessEl.call( this );
				if( ! O.$brightnessEl ) {
					O.$brightnessEl = $( O.options.brightnessEl );
				}
			}
			else {
				O.$brightnessEl = $( O.options.brightnessEl );
			}
			// create slider only when it contains more than 1 slides
			if( O.$E.find( O.options.slideClass ).length > 1 ) { 
				O.createSlider();
				// after init action
				if( $.isFunction( O.options.on.afterInitSlider ) ) {
					O.options.on.afterInitSlider.call( this, O.$E.slider );
				}
			}
			else { // ... otherwise remove slider nav components
				$( O.options.swiperDefaults.pagination.el ).remove();
				$( O.options.swiperDefaults.navigation.prevEl ).remove();
				$( O.options.swiperDefaults.navigation.nextEl ).remove();
			}
			// // resize triggers update
			// O.$E.parents( O.options.parentClass ).sizeChanged( function() {
			// 	O.update();
			// } );
			
			O.initFinished = true;
		};
		O.createSlider = function() {
			// create Swiper
			O.$E.slider = new Swiper( '#'+ O.$E.id, O.options.swiperDefaults );
		};
		O.update = function() {
			if( !isUndefined( O.$E.slider ) ) {
				// fake resize triggers update
				$( window ).trigger( 'resize' );
			}
		};
		O.setActiveSlide = function() {

			O.$E.find( O.options.slideClass ).removeClass( 'slide--active' );
			O.$activeSlide = O.$E.find( '.swiper-slide-active' ).addClass( 'slide--active' );
			// special case split slide
			if( O.$activeSlide.hasClass( 'slide--50' ) && $( window ).width() > O.options.threshold.split ){
				O.$activeSlide.next( '.slide' ).addClass( 'slide--active' );
			}

			// slide brightness
			if( O.options.brightness && O.$brightnessEl ) {
				O.$brightnessEl.removeClass( 'bright dark' );
				// set brightness class of slide
				if( O.$activeSlide.hasClass( 'dark' ) ) {
					O.$brightnessEl.addClass( 'dark' );
				}
				else {
					O.$brightnessEl.addClass( 'bright' );
				}
			}
		};
	};

	$.fn.odSlider = function( settings ) {
		return this.each( function( index ) {
			let $odSlider = $( this );
			if( $odSlider.data( 'od-slider' ) ) return;
			let ods = new ODSlider( $odSlider, settings );
			$odSlider.data( 'od-slider', ods );
			ods.init();
		} );
	};
} )( jQuery );
/*	================================================== 
	svg
	================================================== */


function initSVGInline( $svgImg ) {

	//SVG Replacement
	$svgImg.each( function() {
		var $img = $( this );

		if( $img.is( 'img' ) ) {
			let imgID = $img.attr( 'id' );
			let imgClass = $img.attr( 'class' );
			let imgURL = $img.attr( 'src' );
			let imgDataSVGHover = $img.data( 'svg-hover' );
			let imgDataSVGTrigger = $img.data( 'svg-trigger' );
			let imgDataSVGDelay = $img.data( 'svg-delay' );
			let imgDataSVGDuration = $img.data( 'svg-duration' );
			let imgDataSVGOffset = $img.data( 'svg-offset' );
			let imgDataSVGReverse = $img.data( 'svg-reverse' );
			$.get( 
				imgURL, 
				function( data ) {
					// Get the SVG tag, ignore the rest
					let $svg = $( data ).find( 'svg' );
					// Add replaced image's ID to the new SVG
					if( typeof imgID !== 'undefined' ) {
						$svg = $svg.attr( 'id', imgID );
					}
					// Add replaced image's classes to the new SVG
					if( typeof imgClass !== 'undefined' ) {
						$svg = $svg.attr( 'class', imgClass+' svg--replaced' );
					}
					if( typeof imgDataSVGHover !== 'undefined' ) {
						$svg.attr( 'data-svg-hover', imgDataSVGHover );
					}
					if( typeof imgDataSVGTrigger !== 'undefined' ) {
						$svg.attr( 'data-svg-trigger', imgDataSVGTrigger );
					}
					if( typeof imgDataSVGDelay !== 'undefined' ) {
						$svg.attr( 'data-svg-delay', imgDataSVGDelay );
					}
					if( typeof imgDataSVGDuration !== 'undefined' ) {
						$svg.attr( 'data-svg-duration', imgDataSVGDuration );
					}
					if( typeof imgDataSVGOffset !== 'undefined' ) {
						$svg.attr( 'data-svg-offset', imgDataSVGOffset );
					}
					if( typeof imgDataSVGReverse !== 'undefined' ) {
						$svg.attr( 'data-svg-reverse', imgDataSVGReverse );
					}
					// Remove any invalid XML tags as per http://validator.w3.org
					$svg = $svg.removeAttr( 'xmlns:a' );
					// Check if the viewport is set, if the viewport is not set the SVG wont't scale.
					if( !$svg.attr( 'viewBox' ) && $svg.attr( 'height' ) && $svg.attr( 'width' ) ) {
						$svg.attr( 'viewBox', '0 0 ' + $svg.attr( 'height' ) + ' ' + $svg.attr( 'width' ) );
					}
					// Replace image with new SVG
					$img.replaceWith( $svg );
					$svg.addClass( 'svg--initiated' );
				},
				'xml'
			 );
		}
		else if( $img.is( 'svg' ) ) {
			$svg.addClass( 'svg--initiated' );
		}
	} );	
}

function prepareSVGPath ( $el ) {
	var lineLength = $el[0].getTotalLength();
	$el.css( 'stroke-dasharray', lineLength );
	$el.css( 'stroke-dashoffset', lineLength );
}
/*

version: 3.0.0
author: sascha obermüller
date: 23/06/2020
dependencies : anime.js

options by data attributes

data-toggle="#id"
data-toggle-group="group-id"
data-toggle-keep-active
data-toggle-load="src"

*/
( function( $ ) {
	var ODToggle = function( element, settings ) {
		var O = this;
		O.$E = $( element );
		var defaults = {
			animate 		: true,
			calcHeight		: true,
			easing 			: 'easeInOut',
			focus			: {
				collapse 		: {
					offset 			: $( window ).height() / 2,
					speed 			: 500,
					target 			: O.$E
				},
				expand 			: {
					offset			: $( window ).height() / 10,
					speed 			: 500,
					target 			: O.$E
				}
			},
			icons			: {
				loading			: pathTheme + 'assets/img/loading.svg'
			},
			label 			: {
				$el 			: '.toggle__label',
				switch 			: false // data-toggle-collapse & data-toggle-expand on label must be set
			},
			minHeight 		: 0,
			reload			: false, // call toggle content source every click
			speed 			: 500, // toggle speed
			on 				: {
				afterInit 		: null,
				afterToggle 	: null,
				afterCollapse 	: null,
				afterExpand 	: null,
				beforeFocus 	: null,
				beforeToggle 	: null
			}
		};
		O.options = $.extend( true, {}, defaults, settings );
		O.isActive = false;
		O.keepActive = false;
		O.hasLoaded = false;
		O.getOptions = function() {
			return O.options;
		};
		O.setOptions = function( settings ) {
			O.options = $.extend( true, O.options, settings );
		};
		O.init = function() {	
			O.initFinished = false;
			if ( !O.options.animate ) {
				O.options.speed = 0;
			}
			O.create();	
			// afterInit Action
			if ( $.isFunction( O.options.on.afterInit ) ) {
				O.options.on.afterInit.call( this );
			}
			O.initFinished = true;
		};
		O.create = function( check ) {
			O.$E.unbind( 'click' );

			O.keepActive = O.$E.data( 'toggle-keep-active' ) == undefined ? false : O.$E.data( 'toggle-keep-active' );
			O.$E.$container = $( O.$E.data( 'toggle' ) );
			// set initial height of container to css min-height
			O.$E.$container.height( O.$E.$container.css( 'min-height' ) );

			O.$E.$container.$close = $( '[data-toggle-close="'+ O.$E.data( 'toggle' ) +'"]' );
			O.$E.$container.$close.bind( 'click', function( e ) {
				this.blur();
				O.toggle();
			} );
			// create loading spinner
			if ( O.$E.data( 'toggle-load' ) && O.$E.data( 'toggle-load' ).length > 0 ) {
				O.$loading = $( '<div class="toggle-loading loading"><img src="'+ O.options.icons.loading +'" alt="loading..." /></div>' );
			}

			// set toggle group
			O.$E.$group = $( '[data-toggle-group="'+ O.$E.data( 'toggle-group' ) +'"]' );
			// bind event
			O.$E.bind( 'click', function( e ) {
				// load content if data-toggle load is set and not loaded yet
				if ( O.$E.data( 'toggle-load' ) && O.$E.data( 'toggle-load' ).length > 0 ) {
					if ( ! O.hasLoaded || O.options.reload ) {
						O.load( O.$E.data( 'toggle-load' ) );
					}
				}
				// when keep active attr is set, toggle only if toggle is not active
				if ( !O.keepActive || O.keepActive && !$( this ).hasClass( '-active' ) ) {
					O.toggle();
				}
				O.$E.blur();
			} );
			// switch label ?
			O.$E.$label = O.$E.find( O.options.label.$el );
			O.switchLabel();

			// initial active toggle
			if ( O.$E.hasClass( '-active' ) ) {
				O.toggle();
			}
			// change container height on resize;
			$( window ).on( 'resize orientationchange', function( e ) {
				if( O.isActive ) {
					O.$E.$container.height( O.$E.$container.children().outerHeight(true) );
				}
			} );
		};
		O.toggle = function() {
			// beforeToggle Action
			if ( $.isFunction( O.options.on.beforeToggle ) ) {
				O.options.on.beforeToggle.call( this );
			}	
			// close group elements
			if ( O.$E.$group.length > 0 ) {
				O.$E.$group.each( function( index ) {
					if ( $( this ).data( 'od-toggle' ) ) {
						if ( O.$E != $( this ).data( 'od-toggle' ).$E ) {
							$( this ).data( 'od-toggle' ).collapse( false );
						}
					}
				} );
			}
			if ( O.isActive ) {
				O.collapse( O.options.focus.collapse );
			}
			else {
				O.expand( O.options.focus.expand );
			}
			// afterToggle Action
			if ( $.isFunction( O.options.on.afterToggle ) ) {
				O.options.on.afterToggle.call( this );
			}	
		};
		O.abortLoad = function() {
			O.$E.$container.xhr.abort();
		};
		O.load = function( source, callback ) {
			// abort already running ajax calls
			if ( !isNull( O.$E.$container.xhr ) ) {
				O.abortLoad();
			}
			O.$E.$loading = O.$loading.appendTo( O.$E ); // append loading spinner to container
			O.$E.addClass( '-loading' );
			O.$E.$container.addClass( '-loading' );
			// start loading source
			O.$E.$container.xhr = $.ajax( {
				url 	: source,
				async 	: false,
				success : function( data ) {
					O.$E.removeClass( '-loading' );
					O.$E.$container.removeClass( '-loading' );
					O.$E.$loading.detach();
					try {
						O.$E.$container.html( data );
						O.hasLoaded = true;
					}
					catch( err ) {
						log( err );
					}
					O.$E.$container.xhr = null;
					// callback Action
					if ( $.isFunction( callback ) ) {
						callback.call( this );
					}
				},
				error 	: function( xhr ) {
					O.$E.removeClass( '-loading' );
					O.$E.$container.removeClass( '-loading' );
					O.$E.$container.addClass( 'toggle-error' );
					log( xhr.status +' '+ xhr.statusText );
					O.$E.$container.xhr = null;
				}
			} );
		};
		O.collapse = function( focus ) {
			if ( O.isActive ) {
				O.isActive = false;
				let ani = anime( {
					targets 	: [O.$E.$container[0]],
					height 		: O.$E.$container.css( 'min-height' ), 
					duration 	: O.options.speed,
					easing 		: O.options.easing,
					complete	: function() {
						if ( focus !== false ) {
							 // scroll to toggle when loaded
							O.focus( -1 );
						}
					}
				} );
				O.$E.removeClass( '-active' );
				O.$E.$container.removeClass( '-active' );

				O.switchLabel();
			}
		};
		O.expand = function( focus ) {
			if ( ! O.isActive ) {
				O.isActive = true;
				let ch = O.$E.$container.children().outerHeight(true);
				let ani = anime( {
					targets 	: [O.$E.$container[0]],
					height 		: ch,
					duration 	: O.options.speed,
					easing 		: O.options.easing,
					complete	: function() {
						if ( focus !== false ) {
							 // scroll to toggle when loaded
							O.focus( 1 );
						}
					}
				} );
				O.$E.addClass( '-active' );
				O.$E.$container.addClass( '-active' );
				
				O.switchLabel();
			}
		};
		O.switchLabel = function() {
			if ( O.options.label.switch && O.$E.$label ) {
				if ( O.isActive ) {
					O.$E.$label.html( O.$E.$label.data( 'toggle-collapse' ) );
				}
				else if ( ! O.isActive ) {
					O.$E.$label.html( O.$E.$label.data( 'toggle-expand' ) );
				}
			}
		};
		O.focus = function( dir ) {
			// before focus action
			if ( $.isFunction( O.options.on.beforeFocus ) ) {
				O.options.on.beforeFocus.call( this );
			}	
			let $target = O.$E;
			// get target param depending on toggle direction
			let t = dir > 0 ? O.options.focus.expand.target : O.options.focus.collapse.target;
			if ( t ) {
				// target is function
				if( $.isFunction( t ) ) {
					$target = t.call( this );
				} // or object
				else {
					$target = $( t );
				}
			}
			// focus dir: expand or collapse
			if ( dir > 0 ) {
				$target.goTo( O.options.focus.expand );
			} 
			else if ( dir < 0 ) {
				$target.goTo( O.options.focus.collapse );
			}
		};
	};

	$.fn.odToggle = function( settings ) {
		return this.each( function( index ) {
			var $odToggle = $( this );
			if ( $odToggle.data( 'od-toggle' ) ) return;
			var odt = new ODToggle( $odToggle, settings );
			$odToggle.data( 'od-toggle', odt );
			odt.init();
		} );
	};
} )( jQuery );

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