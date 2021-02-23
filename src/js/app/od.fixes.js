/*	================================================== 
	fit images / polyfill
	================================================== */

var _initFitImgFix = () => {
	var $fitImages = $( '.media--cover img, .media--contain img' );
	if( $fitImages.length > 0 ) {
		objectFitImages( $fitImages, {watchMQ: true} );
	}
}


/*	================================================== 
	ie fixes
	================================================== */

var _initIEFix = () => {
	// iedge <picture> fix
	$( '.no-object-fit.-iedge' ).find( $( '.media--contain picture source, .media--cover picture source' ) ).remove();

	// css vars polyfill
	if ( _isBrowser( ['-ie10', '-ie11'] ) ) {
		cssVars();
	}
}


/*	================================================== 
	fixes
	================================================== */

var _initFixes = () => {
	_initFitImgFix();
	_initIEFix();
}