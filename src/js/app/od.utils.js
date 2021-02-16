/* ================================================== 
version: 1.0.0
author: sod
date: 27.12.2020
dependencies : 
================================================== */


/**
 * LOG
 * logs message to console, if _debug flag is set for this class
 * @param {string} log: log message
 * @param {string} style: key of style that shall be applied on the log
 */

var _debug = _debug || true;

var _log = ( log, style ) => {
	if( _debug ) {
		let styles = {
			primary 	: 'background: #000; color:#fff; padding: 1px 2px;',
			secondary 	: 'background: #aaa; color:#fff; padding: 1px 2px;',
			level1		: 'padding-left: 10px',
			level2		: 'padding-left: 20px',
			strong 		: 'font-weight: bold;',
			error 		: 'background: red; color: #ffffff; padding: 1px 2px;',
			warning 	: 'background: yellow; padding: 1px 2px;',
			hook 		: 'background: orange; padding: 1px 2px;'
		};
		if( style in styles ) {
			console.log( '%c'+ log, styles[style] );
		}
		else {
			console.log( log );
		}
	}
}

/** 
  * IS UNDEFINED
  * @param {any} val: any kind of value that shall be checked
  * @returns if the value is undefined
  */

var _isUndefined = ( val ) => typeof val === typeof undefined ? true : false;


/** 
  * IS NULL
  * @param {any} val: any kind of value that shall be checked
  * @returns if the value is null
  */

var _isNull = ( val ) => val == null ? true : false;


/** 
  * GET SCROLLBAR WIDTH
  * @returns the scrollbar width
  */

var _getScrollbarWidth = () => {
	return window.innerWidth - document.documentElement.clientWidth;
};


/** 
  * GET WIN WIDTH
  * @returns window width without scrollbar
  */

var _getWinWidth = () => {
	return $( window ).innerWidth() + _getScrollbarWidth();
};

var _isBrowser = ( browser ) => {
	if( Array.isArray( browser ) ) {
		var isB = false;
		browser.forEach( ( el ) => {
			if( _ui._$status.hasClass( el ) ) {
				isB = true;
			}
			// _log( 'isBrowser: '+ el + ' = '+ isB );
		} );
		return isB;
	}
	else {
		return _ui._$status.hasClass( browser );
	}
};

/** 
  * GET URL VARS
  * @returns the params of the current url
  */

var _getUrlVars = () => {
	let vars = [], hash;
	let anchorIndex = window.location.href.indexOf( '#' );
	let varsIndex = window.location.href.indexOf( '?' );
	if( anchorIndex < 0  ) {
		anchorIndex = window.location.href.length;
	}
	if( varsIndex >= 0 ) {
		let hashes = window.location.href.substring( varsIndex + 1, anchorIndex ).split( '&' );
		for( let i = 0; i < hashes.length; i++ ) {
			hash = hashes[i].split( '=' );
			vars.push( hash[0] );
			vars[hash[0]] = hash[1];
		}
	}
	return vars;
};


/** 
  * GO TO
  * scrolls to target on which the function is applied
  * @returns the target
  */

$.fn._goTo = function( opts ) {
	if( $( this ) ) {
		var scrollSpeed = 750;
		var scrollOffset = 0;
		if(! _isUndefined( opts ) && !_isUndefined( opts.speed ) && opts.speed > 0 ) {
			scrollSpeed = opts.speed;
		}
		if( ! _isUndefined( opts ) && !_isUndefined( opts.offset ) && opts.offset > 0 ) {
			scrollOffset = opts.offset;
		}
		$( 'html, body' ).animate( {
			scrollTop: ( $( this ).offset().top - scrollOffset ) + 'px'
		}, scrollSpeed );
	}
	return this;
};


/** 
  * HAS ATTRIBUTE
  * checks whether a certain element has a searched attribute
  * @param {string} attrName: name of the searched attribute
  * @returns if the element has the attribute 
  */

$.fn._hasAttr = function( attrName ) {
	if( $( this ) ) {
		var attr = $( this ).attr( attrName );
		if ( typeof attr !== typeof undefined && attr !== false ) { // Element has this attribute
			return true;
		}
	}
	return false;
};


/** 
  * IS VISIBLE
  * checks wether a certain element is in the visible viewport
  * @param {boolean} partial: element is partially or fully visible
  * @returns if the element is visible in terns of the params
  */

$.fn._isVisible = function( partial ) {
	var $t            = $( this ),
		$w            = $( window ),
		viewTop       = $w.scrollTop(),
		viewBottom    = viewTop + $w.height(),
		_top          = $t.offset().top,
		_bottom       = _top + $t.height(),
		compareTop    = partial === true ? _bottom : _top,
		compareBottom = partial === true ? _top : _bottom;

	return ( ( compareBottom <= viewBottom ) && ( compareTop >= viewTop ) );
};


/** 
  * IN VIEW
  * checks wether a certain element is in the visible viewport
  * @param {boolean} partial: element is partially or fully visible
  * @returns if the element is visible in terns of the params
  */

$.fn._inView = function( partial = true ) {
	const { top, left, bottom, right } = $( this )[0].getBoundingClientRect();
	const { innerHeight, innerWidth } = window;
	return partial
	? ( ( top > 0 && top < innerHeight ) || ( bottom > 0 && bottom < innerHeight ) ) &&
		( ( left > 0 && left < innerWidth ) || ( right > 0 && right < innerWidth ) )
	: top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};


/** 
  * GET TRANSFORM VALUE
  * get elements transfomation matrix
  * @param {integer} val: index of the matrix value
  * @returns the specific matrix value of transformation
  */

$.fn._getTransformValue = function( val ) {
	let matrix = new DOMMatrix( $( this ).css( 'transform' ) );
	if( _isUndefined( matrix[val] ) ) {
		return 0;
	}
	else {
		return matrix[val];
	}
};