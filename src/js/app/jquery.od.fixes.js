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