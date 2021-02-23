
var _app = _app || {};
_app.controller = _app.controller || {};

$.fn._svgInline = function( callback ) {
	// svg replacement
	$( this ).each( ( i, img ) => {
		var $img = $( img );
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
					// get the svg tag, ignore the rest
					let $svg = $( data ).find( 'svg' );
					// add replaced image's id to the new ssvg
					if( ! _isUndefined( imgID ) ) {
						$svg = $svg.attr( 'id', imgID );
					}
					// add replaced image's classes to the new ssvg
					if( ! _isUndefined( imgClass ) ) {
						$svg = $svg.attr( 'class', imgClass+' svg--replaced' );
					}
					if( ! _isUndefined( imgDataSVGHover ) ) {
						$svg.attr( 'data-svg-hover', imgDataSVGHover );
					}
					if( ! _isUndefined( imgDataSVGTrigger ) ) {
						$svg.attr( 'data-svg-trigger', imgDataSVGTrigger );
					}
					if( ! _isUndefined( imgDataSVGDelay ) ) {
						$svg.attr( 'data-svg-delay', imgDataSVGDelay );
					}
					if( ! _isUndefined( imgDataSVGDuration ) ) {
						$svg.attr( 'data-svg-duration', imgDataSVGDuration );
					}
					if( ! _isUndefined( imgDataSVGOffset ) ) {
						$svg.attr( 'data-svg-offset', imgDataSVGOffset );
					}
					if( ! _isUndefined( imgDataSVGReverse ) ) {
						$svg.attr( 'data-svg-reverse', imgDataSVGReverse );
					}
					// remove any invalid xml tags as per http://validator.w3.org
					$svg = $svg.removeAttr( 'xmlns:a' );
					// check if the viewport is set, if the viewport is not set the svg wont't scale.
					if( !$svg.attr( 'viewBox' ) && $svg.attr( 'height' ) && $svg.attr( 'width' ) ) {
						$svg.attr( 'viewBox', '0 0 ' + $svg.attr( 'height' ) + ' ' + $svg.attr( 'width' ) );
					}
					// replace image with new ssvg
					$img.replaceWith( $svg );
					$svg.addClass( 'svg--initiated' );
					// $svg._svgDraw();
					// callback action
					if( $.isFunction( callback ) ) {
						callback.call( this, $svg );
					}		
				},
				'xml'
			 );
		}
		else if( $img.is( 'svg' ) ) {
			$img.addClass( 'svg--initiated' );
			// $img._svgDraw();
			// callback action
			if( $.isFunction( callback ) ) {
				callback.call( this, $img );
			}
		}
	} )	
};

$.fn._svgPreparePath = function( offset = 0 ) {
	let $el = $( this );
	var lineLength = Math.ceil( $el[0].getTotalLength() + offset );
	$el.data( 'stroke-dasharray', lineLength );
	$el.css( 'stroke-dasharray', lineLength );
	$el.css( 'stroke-dashoffset', lineLength );
	$el.addClass( '-prepared' );
};