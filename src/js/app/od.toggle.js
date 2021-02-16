/*

version: 4.1.0
author: Sascha Obermüller
date: 06.02.2021

dependencies :
- anime.js

options by data attributes: 
data-toggle="#id"
data-toggle-group="group-id"
data-toggle-keep-active
data-toggle-load="src"
 */

class ODToggle {
	constructor( $el, settings ) {
		let O = this;
		O.$E = $( $el );
		O._initiated = false;
		O._opts = $.extend( true, {}, {
			animate 		: true,
			easing 			: 'cubicBezier(0.16, 1, 0.3, 1)',
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
				loading			: _pathTheme + 'assets/img/loader.svg'
			},
			keepActive 		: O.$E.data( 'toggle-keep-active' ) == undefined ? false : O.$E.data( 'toggle-keep-active' ),
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
		}, settings );
		O._loaded = false;
		O._active = false;
		// basic init actions
		O._create();
		O.$E.addClass( '-initiated' );
		O._initiated = true;
		// callback
		if( $.isFunction( O.opts.on.afterInit ) ) {
			O.opts.on.afterInit.call( O );
		}
	}
	get opts() {
		return this._opts;
	}
	set opts( settings ) {
		this._opts = $.extend( true, {}, this._opts, settings );
	}
	_create ( check ) {
		_log( 'toggle / create' );
		let O = this;
		// set animation spped
		if ( ! O.opts.animate ) {
			O.opts.speed = 0;
		}
		// unbind default click event
		O.$E.unbind( 'click' );
		// set toggle container
		O.$container = $( O.$E.data( 'toggle' ) );

		O.$container.$close = $( '[data-toggle-close="'+ O.$E.data( 'toggle' ) +'"]' );
		O.$container.$close.bind( 'click', function( e ) {
			this.blur();
			O._toggle();
		} );
		// create loading spinner
		if ( O.$E.data( 'toggle-load' ) && O.$E.data( 'toggle-load' ).length > 0 ) {
			O.$loading = $( '<div class="toggle-loading loading"><img src="'+ O.opts.icons.loading +'" alt="loading..." /></div>' );
		}
		// set toggle group
		O.$E.$group = $( '[data-toggle-group="'+ O.$E.data( 'toggle-group' ) +'"]' );
		// bind event
		O.$E.bind( 'click', function( e ) {
			// load content if data-toggle load is set and not loaded yet
			if ( O.$E.data( 'toggle-load' ) && O.$E.data( 'toggle-load' ).length > 0 ) {
				if ( ! O._loaded || O.opts.reload ) {
					O._load( O.$E.data( 'toggle-load' ) );
				}
			}
			// when keep active attr is set, toggle only if toggle is not active
			if ( ! O.opts.keepActive || O.opts.keepActive && ! O.$E.hasClass( '-active' ) ) {
				O._toggle();
			}
			O.$E.blur();
		} );
		// switch label ?
		O.$E.$label = O.$E.find( O.opts.label.$el );
		O._switchLabel();

		// initial active toggle
		if ( O.$E.hasClass( '-active' ) ) {
			O._active = true;
			O.$container.css( 'height', '' );
			O.$E.addClass( '-active' );
			O.$container.addClass( '-active' );
		}
		else {
			// set initial height of container to css min-height
			if( O.$container.css( 'min-height' ) != 'auto' ) {
				O.$container.height( O.$container.css( 'min-height' ) );
			}
			else {
				O.$container.height( 0 );
			}
			// O.$container.hide();
		}

		// change container height on resize;
		$( window ).on( 'resize orientationchange', function( e ) {
			let ch;
			if( O._active ) {
				ch = '';
			}
			else {
				// set initial height of container to css min-height
				ch = O.$container.css( 'min-height' ) > 0 ? O.$container.css( 'min-height' ) : 0;
			}
			O.$container.height( ch );
		} );
	}
	_toggle () {
		let O = this;
		// beforeToggle Action
		if ( $.isFunction( O.opts.on.beforeToggle ) ) {
			O.opts.on.beforeToggle.call( this );
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
		if ( O._active ) {
			O._collapse( O.opts.focus.collapse );
		}
		else {
			O._expand( O.opts.focus.expand );
		}
		// afterToggle Action
		if ( $.isFunction( O.opts.on.afterToggle ) ) {
			O.opts.on.afterToggle.call( this );
		}	
	}
	_abortLoad () {
		this.$container.xhr.abort();
	}
	_load ( source, callback ) {
		_log( 'toggle / load: '+ source );
		let O = this;
		// abort already running ajax calls
		if ( ! _isNull( O.$container.xhr ) ) {
			O._abortLoad();
		}
		O.$E.$loading = O.$loading.appendTo( O.$E ); // append loading spinner to container
		O.$E.addClass( '-loading' );
		O.$container.addClass( '-loading' );
		// start loading source
		O.$container.xhr = $.ajax( {
			url 	: source,
			async 	: false,
			success : function( data ) {
				O.$E.removeClass( '-loading' );
				O.$container.removeClass( '-loading' );
				O.$E.$loading.detach();
				try {
					O.$container.html( data );
					O._loaded = true;
				}
				catch( err ) {
					_log( err );
				}
				O.$container.xhr = null;
				// callback Action
				if ( $.isFunction( callback ) ) {
					callback.call( this );
				}
			},
			error 	: function( xhr ) {
				O.$E.removeClass( '-loading' );
				O.$container.removeClass( '-loading' );
				O.$container.addClass( '-toggle-error' );
				_log( xhr.status +' '+ xhr.statusText );
				O.$container.xhr = null;
			}
		} );
	}
	_collapse ( focus ) {
		// _log( 'toggle / collapse' );
		let O = this;
		if ( O._active ) {
			O._active = false;
			O.$container.height( O.$container.prop( 'scrollHeight' ) );
			let ch = O.$container.css( 'min-height' ) > 0 ? O.$container.css( 'min-height' ) : 0;

			// O.$container.slideUp();

			anime( {
				targets 	: [O.$container[0]],
				height 		: ch, 
				duration 	: O.opts.speed,
				easing 		: O.opts.easing,
				complete	: function() {
					if ( focus !== false ) {
						 // scroll to toggle when loaded
						O._focus( -1 );
					}
				}
			} );
			O.$E.removeClass( '-active' );
			O.$container.removeClass( '-active' );

			O._switchLabel();
		}
	}
	_expand ( focus ) {
		// _log( 'toggle / expand' );
		let O = this;

		if ( ! O._active ) {
			O._active = true;
			let ch  = O.$container.prop( 'scrollHeight' );//.children().outerHeight( true );

			// O.$container.slideDown();

			anime( {
				targets 	: [O.$container[0]],
				height 		: ch,
				duration 	: O.opts.speed,
				easing 		: O.opts.easing,
				complete	: function() {
					if ( focus !== false ) {
						 // scroll to toggle when loaded
						O._focus( 1 );
					}
					O.$container.css( 'height', '' );
				}
			} );
			O.$E.addClass( '-active' );
			O.$container.addClass( '-active' );

			O._switchLabel();
		}
	}
	_switchLabel () {
		let O = this;
		if ( O.opts.label.switch && O.$E.$label ) {
			if ( O._active ) {
				O.$E.$label.html( O.$E.$label.data( 'toggle-collapse' ) );
			}
			else if ( ! O._active ) {
				O.$E.$label.html( O.$E.$label.data( 'toggle-expand' ) );
			}
		}
	}
	_focus ( dir ) {
		let O = this;
		// before focus action
		if ( $.isFunction( O.opts.on.beforeFocus ) ) {
			O.opts.on.beforeFocus.call( this );
		}	
		let $target = O.$E;
		// get target param depending on toggle direction
		let t = dir > 0 ? O.opts.focus.expand.target : O.opts.focus.collapse.target;
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
			$target._goTo( O.opts.focus.expand );
		} 
		else if ( dir < 0 ) {
			$target._goTo( O.opts.focus.collapse );
		}
	}
}

// helper function for instantiation
$.fn.odToggle = function( settings ) {
	let Os = [];
	this.each( function( index ) {
		let $el = $( this );
		let O = $el.data( 'od-toggle' );
		if( ! O ) {
			O = new ODToggle( $el, settings );
			$el.data( 'od-toggle', O );
		}
		Os.push( O );
	} );
	return Os;
};