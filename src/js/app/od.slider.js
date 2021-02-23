/* ================================================== 
version: 3.0.0
author: sod
date: 01.01.2021
dependencies : 
- jquery
- swiper
================================================== */

class ODSlider {
	constructor( $el, settings ) {
		let O = this;
		O.$E = $el;
		O.$E.id = O.$E.attr( 'id' );
		O._initiated = false;
		O._opts = $.extend( true, {}, {
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
				slidesPerView			: 'auto',
				spaceBetween			: 0,
				speed 					: 500,
				virtualTranslate		: false,
				watchOverflow			: true,
				on 						: {
					init  						: function() {
						// O._setActiveSlide();
					},
					slideChangeTransitionEnd 	: function () {
						O._setActiveSlide();
					},
					slideChange 				: function () {
						$( this.el ).attr( 'data-slide-active', this.realIndex );
					},
					slideNextTransitionStart 	: function () {
						//slides by 2 if two 50% slides visual
						if( O._initiated ) {
							var nextIndex = this.activeIndex + 1 > this.slides.length -1 ? 0 : this.activeIndex + 1;
							if( $( window ).width() > O.opts.threshold.split && $( this.slides[this.previousIndex] ).hasClass( 'slide--50' ) && $( this.slides[this.activeIndex] ).hasClass( 'slide--50' ) ) {
								this.slideTo( nextIndex, this.params.speed, false );
							}
							O._setActiveSlide();
						}
					},
					slidePrevTransitionStart 	: function () {
						//slides by 2 if previous two slides are 50% wide
						if( O._initiated ) {
							var prevIndex = this.activeIndex - 1 >=  0 ? this.activeIndex - 1 : this.slides.length - 1;
							if( $( window ).width() > O.opts.threshold.split && $( this.slides[this.activeIndex] ).hasClass( 'slide--50' ) && $( this.slides[prevIndex] ).hasClass( 'slide--50' ) ) {
								this.slideTo( prevIndex, this.params.speed, false );
							}
							O._setActiveSlide();
						}
					}
				}
			},
			on 	: {
				afterInitSlider	: null
			}
		}, settings );
		O.slider = null;
		O.$E.$wrapper = O.$E.parents( '.slider' );
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
		this._opts = $.extend( true, {}, this.opts, settings );
	}

	_create () {
		let O = this;
		//add autoplay if set by data attr
		O.autoplay = O.$E.data( 'autoplay' );
		if( O.autoplay && O.autoplay > 0 ) {
			O.opts = $.extend( true, O.opts, {
				swiperDefaults : {
					autoplay: {
						delay 					: O.autoplay,
						disableOnInteraction 	: false
					}
				}
			} );
		} 
		else {
			O.opts = $.extend( true, O.opts, {
				swiperDefaults : {
					autoplay: false
				}
			} );
		}
		// brightness element function
		if( $.isFunction( O.opts.brightnessEl ) ) {
			O.$brightnessEl = O.opts.brightnessEl.call( this );
			if( ! O.$brightnessEl ) {
				O.$brightnessEl = $( O.opts.brightnessEl );
			}
		}
		else {
			O.$brightnessEl = $( O.opts.brightnessEl );
		}
		// create slider only when it contains more than 1 slides
		if( O.$E.find( O.opts.slideClass ).length > 1 ) { 
			O._createSlider();
			// after init action
			if( $.isFunction( O.opts.on.afterInitSlider ) ) {
				O.opts.on.afterInitSlider.call( this, O.slider );
			}
		}
		else { // ... otherwise remove slider nav components
			$( O.opts.swiperDefaults.pagination.el ).remove();
			$( O.opts.swiperDefaults.navigation.prevEl ).remove();
			$( O.opts.swiperDefaults.navigation.nextEl ).remove();
		}
		// // resize triggers _update
		// O.$E.parents( O.opts.parentClass ).sizeChanged( function() {
		// 	O._update();
		// } );
	}

	_createSlider () {
		let O = this;
		// create Swiper
		O.slider = new Swiper( '#'+ O.$E.id, O.opts.swiperDefaults );
	}


	_update () {
		let O = this;
		if( ! _isUndefined( O.slider ) ) {
			// fake resize triggers _update
			$( window ).trigger( 'resize' );
		}
	}

	_setActiveSlide () {
		let O = this;
		O.$activeSlide = O.$E.find( '.slide--active' );
		// special case split slide
		if( O.$activeSlide.hasClass( 'slide--50' ) && $( window ).width() > O.opts.threshold.split ){
			O.$activeSlide.next( '.slide' ).addClass( 'slide--active' );
		}

		// slide brightness
		if( O.opts.brightness && O.$brightnessEl ) {
			O.$brightnessEl.removeClass( '-bright -dark' );
			// set brightness class of slide
			if( O.$activeSlide.hasClass( '-dark' ) ) {
				O.$brightnessEl.addClass( '-dark' );
			}
			else {
				O.$brightnessEl.addClass( '-bright' );
			}
		}
	}
}

// helper function for instantiation
$.fn.odSlider = function ( settings ) {
	let Os = [];
	this.each( function ( index ) {
		let $el = $( this );
		let O = $el.data( 'od-slider' );
		if( ! O ) {
			O = new ODSlider( $el, settings );
			$el.data( 'od-slider', O );
		}
		Os.push( O );
	} );
	return Os;
}