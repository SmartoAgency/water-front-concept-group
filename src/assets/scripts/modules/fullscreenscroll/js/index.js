import { gsap } from 'gsap';
// import "splitting/dist/splitting.css";
// import "splitting/dist/splitting-cells.css";
// import Splitting from "splitting";
import { preloadImages } from './utils';
import { CursorText } from './cursor';
import { Slide } from './slide';
import { Observer } from 'gsap/Observer.js';
gsap.registerPlugin(Observer);


document.body.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-gallery-category]');
    console.log('click', target);
    if (!target) return;
    
    const isLocal = document.documentElement.dataset.status === 'local';
    const container = document.querySelector('.home-gallery-screen .slides');
    const galleryCode = target.dataset.galleryCategory;
    const getSingleGalleryUrl = document.documentElement.dataset.getSingleGalleryUrl;

    gsap.to(container, {
        opacity: 0,
        duration: 0.3,
    });
    let data = isLocal ? await Promise.resolve({
        acf: {
            slides: [
                {img: './assets/images/home/hero-bg.jpg',},
                {img: './assets/images/home/hero-bg.jpg',},
                {img: './assets/images/home/hero-bg.jpg',},
                {img: './assets/images/home/hero-bg.jpg',},
                {img: './assets/images/home/hero-bg.jpg',},
            ]

        }
    }) : await fetch(getSingleGalleryUrl+galleryCode);

    data = isLocal ? data : await data.json();
    

    container.innerHTML = '';
    data.acf.slides.forEach(slide => {
        container.insertAdjacentHTML('beforeend', $slide(slide.img));
    });
    

    // Reinitialize the slides array and events
    DOM.slides = [...document.querySelectorAll('.slide')];
    slidesArr = [];
    document.querySelectorAll('.slide').forEach(slide => {
        
        slidesArr.push(new Slide(slide));
    });
    initEvents();
    current = 0;
    totalSlides = slidesArr.length;
    setCurrentSlide(current);
    document.querySelectorAll('[data-gallery-category]').forEach(item => {
        item.classList.remove('frame__nav-button--current');
    });
    document.querySelectorAll('[data-gallery-all]').forEach(item => {
        item.textContent = pad(data.acf.slides.length);
    });
    document.querySelectorAll('[data-gallery-current]').forEach(item => {
        item.textContent = pad(1);
    })
    target.classList.add('frame__nav-button--current');
     gsap.to(container, {
        opacity: 1,
        duration: 0.3,
    });
    console.log('DOM', DOM);

});

if (document.querySelector('.frame__nav-button')) {
    document.querySelector('.frame__nav-button').click();
}

function $slide(data) {
    return `
        <div class="slide">
            <div class="slide__inner">
                <div class="slide__img">
                    <div class="slide__img-inner" style="background-image:url(${data})"></div>
                    <div class="slide__img-inner2" style="background-image:url(${data})"></div>
                </div>
            </div>
        </div>
    `
}
// Call the splittingjs to transform the data-splitting texts to spans of chars 
// Splitting();

function pad(num) {
    return (num < 10 ? '0' : '') + num;
}

// Some DOM elements
const DOM = {
    slides: [...document.querySelectorAll('.slide')],
    cursor: document.querySelector('.cursor'),
    navigationItems: document.querySelectorAll('.frame__nav > .frame__nav-button'),
    onChangeSlide: (current) => {
        document.querySelectorAll('[data-gallery-current]').forEach(item => {
            item.textContent = pad(current+1);
        });
    },
    prevArrow: document.querySelector('[data-gallery="prev"]'),
    nextArrow: document.querySelector('[data-gallery="next"]'),
};

// document.querySelector('[data-home-gallery-mobile-slide-title]').textContent = DOM.navigationItems[0].textContent;

// total number of slides
let totalSlides = DOM.slides.length;

let slidesArr = [];
DOM.slides.forEach(slide => {
    slidesArr.push(new Slide(slide));
});

// current slide position
let current = -1;
// check if animation is in progress
let isAnimating = false;

if (DOM.prevArrow) {
    DOM.prevArrow.addEventListener('click', () => {
        if ( isAnimating ) return;
        prev();
    });
}
if (DOM.nextArrow) {
    DOM.nextArrow.addEventListener('click', () => {
        if ( isAnimating ) return;
        next();
    })
}

const setCurrentSlide = position => {
    if ( current !== -1 ) {
        slidesArr[current].DOM.el.classList.remove('slide--current');
    }

    current = position;
    slidesArr[current].DOM.el.classList.add('slide--current');

    // DOM.navigationItems[current].classList.add('frame__nav-button--current');
};

const next = () => {
    const newPosition = current < totalSlides - 1 ? current + 1 : 0;
    navigate(newPosition);
};

const prev = () => {
    const newPosition = current > 0 ? current - 1 : totalSlides - 1;
    navigate(newPosition);
};

const navigate = newPosition => {
    isAnimating = true;
    
    // change navigation current class
    // DOM.navigationItems[current].classList.remove('frame__nav-button--current');
    // DOM.navigationItems[newPosition].classList.add('frame__nav-button--current');
    
    // navigation direction
    const direction = current < newPosition ? current === 0 && newPosition === totalSlides - 1 ? 'prev' : 'next' : current === totalSlides - 1 && newPosition === 0 ? 'next' : 'prev';
    
    const currentSlide = slidesArr[current];
    current = newPosition;
    const upcomingSlide = slidesArr[current];

    gsap.timeline({
        defaults: {
            duration: 1.6,
            ease: 'power3.inOut'
        },
        onComplete: () => {
            currentSlide.DOM.el.classList.remove('slide--current');
            // Close the current slide if it was open
            if ( currentSlide.isOpen ) {
                hideContent(currentSlide);
            }

            isAnimating = false;
        }
    })
    .addLabel('start', 0)

    .set([currentSlide.DOM.imgInner, upcomingSlide.DOM.imgInner], {
        transformOrigin: direction === 'next' ? '0% 50%' : '100% 50%'
    }, 'start')

    // Place coming slide either to the right (translate 100%) or left (translate -100%) and the slide__inner to the opposite translate.
    .set(upcomingSlide.DOM.el, {
        xPercent: direction === 'next' ? 100 : -100
    }, 'start')
    .set(upcomingSlide.DOM.inner, {
        xPercent: direction === 'next' ? -100 : 100
    }, 'start')
    
    // Add current class
    .add(() => {
        upcomingSlide.DOM.el.classList.add('slide--current');
    }, 'start')

    // hide the back button and show back the cursor text if the current slide was open
    .add(() => {
        if ( currentSlide.isOpen ) {
            toggleCursorBackTexts();
        }
    }, 'start')
    
    // Current slide moves either left or right (translate -100% or 100%)
    .to(currentSlide.DOM.el, {
        xPercent: direction === 'next' ? -100 : 100
    }, 'start')
    .to(currentSlide.DOM.imgInner, {
        scaleX: 2
    }, 'start')
    // Upcoming slide translates to 0
    .to([upcomingSlide.DOM.el, upcomingSlide.DOM.inner], {
        xPercent: 0
    }, 'start')
    .to(upcomingSlide.DOM.imgInner, {
        ease: 'power2.inOut',
        startAt: {scaleX: 2},
        scaleX: 1
    }, 'start');


    if (typeof DOM.onChangeSlide === 'function') {
        DOM.onChangeSlide(current);
    }
};

const toggleCursorBackTexts = isContent => {
    return gsap.timeline({
        onStart: () => {
            gsap.set(DOM.backChars, {opacity: isContent ? 0 : 1});
            if ( isContent ) {
                DOM.backCtrl.classList.add('frame__back--show');
            }
        },
        onComplete: () => {
            DOM.backCtrl.classList[isContent ? 'add' : 'remove']('frame__back--show');
            if ( !isContent ) {
                DOM.backCtrl.classList.remove('frame__back--show');
            }
        }
    })
};

const showContent = position => {
    if ( isAnimating ) return;
    isAnimating = true;

    const slide = slidesArr[position];

    slide.isOpen = true;

    gsap.timeline({
        defaults: {
            duration: 1.6,
            ease: 'power3.inOut'
        },
        onStart: () => {
            
        },
        onComplete: () => {
            isAnimating = false;
        }
    })
    .addLabel('start', 0)
    .add(() => {
        toggleCursorBackTexts('content');
    }, 'start')
    .to(slide.DOM.img, {
        yPercent: -100
    }, 'start')
    .set(slide.DOM.imgInner, {
        transformOrigin: '50% 100%'
    }, 'start')
    .to(slide.DOM.imgInner, {
        yPercent: 100,
        scaleY: 2
    }, 'start')
};

const hideContent = (slide, animate = false) => {
    // reset values
    isAnimating = true;

    const complete = () => {
        slide.isOpen = false;
        isAnimating = false;
    };

    if ( animate ) {
        gsap.timeline({
            defaults: {
                duration: 1.6,
                ease: 'power3.inOut'
            },
            onComplete: complete
        })
        .addLabel('start', 0)
        .to(slide.DOM.img, {
            yPercent: 0
        }, 'start')
        .to(slide.DOM.imgInner, {
            yPercent: 0,
            scaleY: 1
        }, 'start');
    }
    else {
        gsap.set(slide.DOM.img, {
            yPercent: 0
        });
        gsap.set(slide.DOM.imgInner, {
            yPercent: 0,
            scaleY: 1
        });
        complete();
    }
};

const initEvents = () => {
    // Links navigation
    [...DOM.navigationItems].forEach((item, position) => {
        // item.addEventListener('click', () => {
        //     if ( current === position || isAnimating ) return;
        //     navigate(position);
        // });
    });

    // Initialize the GSAP Observer plugin
    // Observer.create({
    //     type: 'wheel,touch,pointer',
    //     onDown: () => !isAnimating && prev(),
    //     onUp: () => !isAnimating && next(),
    //     // invert the mouse wheel delta
    //     wheelSpeed: -1,
    //     tolerance: 10
    // });

    for (const [position, slide] of slidesArr.entries()) {
        slide.DOM.img.addEventListener('click', () => {
            showContent(position);
        });
    }
};

// Set current slide
setCurrentSlide(0);

// Initialize custom cursor
// new CursorText(DOM.cursor);

// Initialize the events
initEvents();

// Preload images and initialize scrolling animations
preloadImages('.slide__img-inner').then( _ => {
	document.body.classList.remove('loading');
});
