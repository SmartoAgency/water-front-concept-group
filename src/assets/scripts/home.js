import Swiper, { EffectFade, Mousewheel, Navigation, Autoplay } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { pad, useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import Accordion from "accordion-js";
import googleMap from './modules/map/map';
import './modules/gallery/gallerySlider';
import { debounce } from 'lodash';
import { Fancybox } from '@fancyapps/ui';
import Swal from 'sweetalert2';
import './inc/plannings-popup.js';
import './modules/HeatDistortion/HeatDistortion.js';
// const header = document.querySelector('.header');

// const headroom = new Headroom(header, {});
// headroom.init();

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);
gsap.core.globals('ScrollTrigger', ScrollTrigger);
gsap.core.globals('SplitText', SplitText);


document.querySelectorAll('[data-split-lines-new-animation]').forEach((el) => {

    let split = SplitText.create(el, { type: "lines", mask: 'lines', linesClass: "line", });
    
    gsap.set(split.lines, {
        y: 100,
    });
    gsap.timeline({
        scrollTrigger: {
            trigger: el,
            once: true,
            start: '50% bottom',
        }
    })
        .fromTo(split.lines, {
            y: 100,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power4.out",
            stagger: {
                amount: 0.15,
            }
        })
        .add(() => {
            split.revert();
        })
})


googleMap();

Swiper.use([Mousewheel, Navigation]);


function planningsSliders() {
    function pad(num) {
        return (num < 10 ? '0' : '') + num;
    }
    
    document.querySelectorAll('[data-planning-item-slider]').forEach((slider) => {
        const container = slider.querySelector('.swiper-wrapper');
        container.addEventListener('click',function(evt){
            const slides = Array.from(container.querySelectorAll('.swiper-slide img'))
                .map(el => {
                    return {
                        src: el.getAttribute('data-src') || el.src,
                        thumb: el.getAttribute('data-thumb') || el.src,
                        type: 'image',
                        opts: {
                            caption: el.getAttribute('alt') || '',
                            thumb: el.getAttribute('data-thumb') || el.src
                        }
                    }
                });
            Fancybox.show(
                slides,
                // clas
                {
                    on: {
                        initLayout: (fancybox) => {
                            fancybox.getContainer().setAttribute('data-lenis-prevent', '');
                            
                        }
                    },
                }
            );
        });
    })
}
planningsSliders();


function planningsBigSlider() {
    new Swiper('[data-plannings-slider]', {
        spaceBetween: 20,
        slidesPerView: 3,
        navigation: {
            nextEl: '[data-plannings-slider-next]',
            prevEl: '[data-plannings-slider-prev]',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 6,
            },
            1025: {
                slidesPerView: 3,
                spaceBetween: 20,
            }
        },
    })
}
planningsBigSlider();


function projectsSlider() {
    new Swiper('[data-projects-swiper]', {
        slidesPerView: 3.05,

        navigation: {
            nextEl: '[data-projects-swiper-next]',
            prevEl: '[data-projects-swiper-prev]',
        },
        breakpoints: {
            320: {
                slidesPerView: 1.01,
                spaceBetween: 7,
            },
            1025: {
                slidesPerView: 3.05,
                spaceBetween: 1,
            }
        },
    })
}
projectsSlider();

function locationInfrastructureRightAnimation() {
    document.querySelectorAll('.screen2__right').forEach((el) => {
        gsap.set(el.querySelector('[data-screen2-form]'), {
            y: 50,
            autoAlpha: 0,
        })
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                once: true,
                start: '50% 50%',
            }
        })
        .fromTo(el.querySelector('[data-screen2-form]'), {
            autoAlpha: 0,
            y: 50,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1.25,
            ease: "power4.out",
        })
    })
}

locationInfrastructureRightAnimation();


function locationInfrastructureAnimation() {
    document.querySelectorAll('.location-infrastructure__item').forEach((el) => {
        const elHeight = el.offsetHeight;
        gsap.set(Array.from(el.children), {
            y: elHeight,
            autoAlpha: 0,
        })
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                once: true,
            }
        })
        .fromTo(Array.from(el.children), {
            autoAlpha: 0,
            y: elHeight,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1.25,
            stagger: 0.15,
            ease: "power4.out",
        })
    })
}

locationInfrastructureAnimation();

function managmetnScreenAnimation() {
    document.querySelectorAll('.managment__item').forEach((el) => {
        gsap.set(Array.from(el.children), {
            y: 50,
            autoAlpha: 0,
        })
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: '20% 100%',
                once: true,
            }
        })
        .fromTo(Array.from(el.children), {
            autoAlpha: 0,
            y: 50,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: {
                amount: 0.15,
            },
            ease: "power4.out",
        })
    })
}

managmetnScreenAnimation();

function teamParalax() {
    const trigger = document.querySelector('.team__bg');
    const img = document.querySelector('.team__bg img');
    if (!trigger || !img) return;
    gsap.set(img, {
        scale: 1.2,
    })
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: trigger,
            scrub: true,
            invalidateOnRefresh: true,
        }
    })
    tl.fromTo(img, {
        y: -100,
    }, {
        y: 100,
        ease: 'none',
    });


    document.querySelectorAll('.team__item').forEach((el) => {
        gsap.set(Array.from(el.children), {
            y: 30,
            autoAlpha: 0,
        })
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                once: true,
                start: '20% 80%',
            }
        })
        .fromTo(Array.from(el.children), {
            autoAlpha: 0,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1.25,
            stagger: 0.15,
            ease: "power4.out",
        })
    });


    document.querySelectorAll('.team__top-block').forEach((el) => {
        const items = el.querySelectorAll('.team__description p, .team__logo, .team__title');
        gsap.set(items, {
            y: 30,
            autoAlpha: 0,
        })
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                once: true,
            }
        })  
        .fromTo(items, {
            autoAlpha: 0,
            y: 30,
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1.25,
            stagger: 0.1,
            ease: "power4.out",
        })
    })
}

teamParalax();




document.querySelectorAll('.home-front-screen__down').forEach((el) => {
    el.addEventListener('click', (evt) => {
        evt.preventDefault();
        document.querySelector('.screen2').scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    });
})



function openFullscreenIframe(url) {
    Swal.fire({
        html: `<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`,
        width: '100vw',
        padding: 0,
        background: 'transparent',
        showConfirmButton: false,
        showCloseButton: true,
        animation: false,
        customClass: {
            popup: 'fullscreen-swal'
        }
});
}

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-href]');
    if (target) {
        evt.preventDefault();
        const url = target.getAttribute('data-popup-href');
        openFullscreenIframe(url);
    }
});


function videoScreenHandler() {
    document.body.addEventListener('click', (evt) => {
        const toggle = evt.target.closest('[data-video-toggle]');
        if (toggle) {
            evt.preventDefault();
            const container = document.querySelector('[data-video-src]');
            const src = container ? container.getAttribute('data-video-src') : '';
            Swal.fire({
                html: `<video src="${src}" controls autoplay playsinline></video>`,
                width: '90vw',
                padding: 0,
                background: '#000',
                showConfirmButton: false,
                showCloseButton: true,
                animation: false,
                customClass: {
                    popup: 'fullscreen-swal video-swal'
                },
                willClose: () => {
                    if (!Swal.getHtmlContainer()) return;
                    const video = Swal.getHtmlContainer().querySelector('video');
                    if (video) video.pause();
                }
            });
        }
    });
}
videoScreenHandler();

function screen2ItemsEffect() {
    ///screen2__left-list
    gsap.timeline({
        scrollTrigger: {
            trigger: '.screen2__left-list',
            start: '20% 80%',
            end: '75% 80%',
            scrub: true,
            
        }
    })
    .fromTo('.screen2__left-list .screen2__left-item', {
        y: 30,
        autoAlpha: 0,
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 1.25,
        stagger: 0.15,
        ease: "power4.out",
    });

    if (window.screen.width < 1025) {
        return;
    }

    gsap.set('.screen2__left .screen2__left-bg', {
        scale: 1.1,
    })

    gsap.timeline({
        scrollTrigger: {
            trigger: '.screen2',
            scrub: true,
        }
    })
    .fromTo('.screen2__left .screen2__left-bg', {
        y: -50,
    }, {
        y: 50,
        ease: 'none',
    })
}   
screen2ItemsEffect();


function bigTitlesReveal() {
  document.querySelectorAll('.bgtitle').forEach((el) => {
    const parent = el.parentElement;

    // const split = SplitText.create(el, {
    //   type: "chars",
    //   charsClass: "char"
    // });

    // console.log('el', split,el);
    

    gsap.timeline({
      scrollTrigger: {
        trigger: parent,
        scrub: true,
      }
    }).fromTo(
      el,
      {
        y: 50,
      },
      {
        y: -50,
      }
    );
  });
}

Promise.all([
  document.fonts.load('1rem "Manhattan"'),
  document.fonts.ready
]).then(() => {
  bigTitlesReveal();
});


function planningsCardAnimation() {
    const cardsCont = document.querySelector('.plannings__list-wrapper');
    gsap.set(cardsCont.querySelectorAll('.card-planning'), {
        y: 30,
        autoAlpha: 0,
    });

    if (window.screen.width > 1025) {
        gsap.timeline({
            scrollTrigger: {
                trigger: cardsCont,
                start: '20% 80%',
                end: '75% 80%',
                once: true,
            }
        })
        .fromTo(cardsCont.querySelectorAll('.card-planning'), {
            y: 30,
            autoAlpha: 0,
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 1.25,
            stagger: 0.15,
            ease: "power4.out",
        })
    } else {
        cardsCont.querySelectorAll('.card-planning').forEach((card) => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: '20% 80%',
                    end: '75% 80%',
                    once: true,
                }
            })
            .fromTo(card, {
                y: 30,
                autoAlpha: 0,
            }, {
                y: 0,
                autoAlpha: 1,
                duration: 1.25,
                stagger: 0.15,
                ease: "power4.out",
            })
        });
    }
}

planningsCardAnimation();

function docsCardAnimation() {
    const cardsCont = document.querySelector('.documents__list');
    gsap.set(cardsCont.querySelectorAll('.documents__content-item'), {
        y: 30,
        autoAlpha: 0,
    })
    gsap.timeline({
        scrollTrigger: {
            trigger: cardsCont,
            start: '20% 80%',
            end: '75% 80%',
            once: true
        }
    })
    .fromTo(cardsCont.querySelectorAll('.documents__content-item'), {
        y: 30,
        autoAlpha: 0,
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 1.25,
        stagger: 0.15,
        ease: "power4.out",
    })
}

docsCardAnimation();

