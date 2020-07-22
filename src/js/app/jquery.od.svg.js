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