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
