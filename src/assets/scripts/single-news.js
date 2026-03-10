import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swiper, { Navigation } from 'swiper';
gsap.registerPlugin(ScrollTrigger);


// document.querySelector('[data-gallery="all"]').textContent = padNumber(document.querySelectorAll('[data-single-construction-slider] .swiper-slide').length);


function padNumber(num) {
    return num < 10 ? `0${num}` : num;
}
function constructionSlider() {
    const slider = new Swiper('[data-single-construction-slider]', {
        modules: [Navigation],
        loop: true,
        slidesPerView: 1,
        spaceBetween: 30,
        navigation: {
            nextEl: '[data-gallery="next"]',
            prevEl: '[data-gallery="prev"]',
        }
    });
    slider.on('slideChange', function (swiper) {
        const currentSlide = padNumber(swiper.realIndex + 1);
        document.querySelector('[data-gallery="current"]').textContent = currentSlide;
    })
}

constructionSlider();