/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2018, Codrops
 * http://www.codrops.com
 */
const nav_items = document.querySelectorAll('.slideshow-control a')

{
    // The Slide (Product) class.
    class Slide {
        constructor(el, settings) {
            this.DOM = {el: el};
            
            // The slide´s container.
            this.DOM.wrap = this.DOM.el.querySelector('.slide__wrap');
            // The image element.
            this.DOM.img = this.DOM.wrap.querySelector('.slide__img');
            // The title container.
            this.DOM.titleWrap = this.DOM.wrap.querySelector('.slide__title-wrap');
            // Some config values.
            this.config = {
                animation: {
                    duration: 1.2,
                    ease: Expo.easeInOut
				}
            };
        }
        // Sets the current class.
		setCurrent(isCurrent = true) {
			this.DOM.el.classList[isCurrent ? 'add' : 'remove']('slide--current');
		}
        // Hide the slide.
        hide(direction) {
			return this.toggle('hide', direction);
        }
        // Show the slide.
        show(direction) {
            this.DOM.el.style.zIndex = 1000;
            return this.toggle('show', direction);
        }
        // Show/Hide the slide.
        toggle(action, direction) {
			return new Promise((resolve, reject) => {
                // When showing a slide, the slide´s container will move 100% from the right or left depending on the direction.
                // At the same time, both title wrap and the image will move the other way around thus creating the unreveal effect.
                // Also, when showing or hiding a slide, we scale it from or to a value of 1.1.
                if ( action === 'show' ) {
                    TweenMax.to(this.DOM.wrap, this.config.animation.duration, {
                        ease: this.config.animation.ease,
                        startAt: {x: direction === 'right' ? '100%' : '-100%'},
                        x: '0%'
                    });
                    TweenMax.to(this.DOM.titleWrap, this.config.animation.duration, {
                        ease: this.config.animation.ease,
                        startAt: {x: direction === 'right' ? '-100%' : '100%'},
                        x: '0%'
                    });
                }

                TweenMax.to(this.DOM.img, this.config.animation.duration, {
                    ease: this.config.animation.ease,
                    startAt: action === 'hide' ? {} : {x: direction === 'right' ? '-100%' : '100%', scale: 1.1},
                    x: '0%',
                    scale: action === 'hide' ? 1.1 : 1,
                    onStart: () => {
                        this.DOM.img.style.transformOrigin = action === 'hide' ? 
                                                                direction === 'right' ? '100% 50%' : '0% 50%':
                                                                direction === 'right' ? '0% 50%' : '100% 50%';
                        this.DOM.el.style.opacity = 1;
                    },
                    onComplete: () => {
                        this.DOM.el.style.zIndex = 999;
                        this.DOM.el.style.opacity = action === 'hide' ? 0 : 1;
                        resolve();
                    }
                });
            });
        }
    }

    // The navigation class. Controls the .boxnav animations (e.g. pagination animation).
    class Navigation {
        constructor(el, settings) {
            this.DOM = {el: el};

            this.settings = {
                next: () => {return false;},
                prev: () => {return false;}
            }
            Object.assign(this.settings, settings);

            // Navigation controls (prev and next)
			this.DOM.prevCtrl = this.DOM.el.querySelector('.boxnav__item--prev');
            this.DOM.nextCtrl = this.DOM.el.querySelector('.boxnav__item--next');
            // The current and total pages elements.
            this.DOM.pagination = {
                current: this.DOM.el.querySelector('.boxnav__label--current'),
                total: this.DOM.el.querySelector('.boxnav__label--total')
            };
            this.initEvents();
        }
        // Updates the current page element value.
        // Animate the element up, update the value and finally animate it in from bottom up.
        setCurrent(val, direction) {
            //this.DOM.pagination.current.innerHTML = val;
            TweenMax.to(this.DOM.pagination.current, 0.4, {
                ease: 'Back.easeIn',
                y: direction === 'right' ? '-100%' : '100%',
                opacity: 0,
                onComplete: () => {
                    this.DOM.pagination.current.innerHTML = val;
                    TweenMax.to(this.DOM.pagination.current, 0.8, {
                        ease: 'Expo.easeOut',
                        startAt: {y: direction === 'right' ? '50%' : '-50%', opacity: 0},
                        y: '0%',
                        opacity: 1
                    });    
                }
            });
        }
        // Sets the total pages value.
        setTotal(val) {
            this.DOM.pagination.total.innerHTML = val;
        }
        // Initialize the events on the next/prev controls.
        initEvents() {
            this.DOM.prevCtrl.addEventListener('click', () => this.settings.prev());
            this.DOM.nextCtrl.addEventListener('click', () => this.settings.next());
        }
    }

    // The Slideshow class.
    class Slideshow {
        constructor(el) {
            this.DOM = {el: el};
            // Initialize the navigation instance. When clicking the next or prev ctrl buttons, trigger the navigate function.
            this.navigation = new Navigation(document.querySelector('.boxnav'), {
                next: () => this.navigate('right'),
                prev: () => this.navigate('left')
            });
            // The details container.
            this.slides = [];
            // Initialize/Create the slides instances.
            Array.from(this.DOM.el.querySelectorAll('.slide')).forEach((slideEl,pos) => this.slides.push(new Slide(slideEl, {})));
            this.slidesTotal = this.slides.length;
            // Set the total number of slides in the navigation box.
            this.navigation.setTotal(this.slidesTotal);
            // At least 2 slides to continue...
            if ( this.slidesTotal < 2 ) {
                return false;
            }
            // Current slide position.
            this.current = 0;
            // Initialize the slideshow.
            this.init();
        }
        // Set the current slide and initialize some events.
        init() {
            this.slides[this.current].setCurrent();
            setInterval(() => {
                this.navigate('right')
            }, 5000)
        }
        // Navigate the slideshow.
        navigate(direction) {
            // If animating return.
            if ( this.isAnimating ) return;
            this.isAnimating = true;

            // The next/prev slide´s position.
            this.nextSlidePos = direction === 'right' ? 
                    this.current < this.slidesTotal-1 ? this.current+1 : 0 :
                    this.current > 0 ? this.current-1 : this.slidesTotal-1;

            // Close the details boxes (if open) and then hide the current slide and show the next/previous one.
            this.navigation.setCurrent(this.nextSlidePos+1, direction);
            
            Promise.all([this.slides[this.current].hide(direction), this.slides[this.nextSlidePos].show(direction)])
                   .then(() => {
                        // Update current.
                        this.slides[this.current].setCurrent(false);
                        this.current = this.nextSlidePos;
                        this.slides[this.current].setCurrent();

                        for (const elem of nav_items) {
                            elem.style.opacity = 0.2
                        }
                        const current_item = nav_items[this.current]
                        current_item.style.opacity = 1

                        this.isAnimating = false;
                   });
        }
    }

    // Initialize the slideshow
    window.slideshow = new Slideshow(document.querySelector('.slideshow'));
    // Preload all the images..
    imagesLoaded(document.querySelectorAll('.slide__img'), {background: true}, () => document.body.classList.remove('loading'));
}
