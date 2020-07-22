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