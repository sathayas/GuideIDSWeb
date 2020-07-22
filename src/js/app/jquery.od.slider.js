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