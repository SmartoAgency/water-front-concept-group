import Headroom from 'headroom.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import './modules/form';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { lenis } from './modules/scroll/leniscroll';
import Swal from 'sweetalert2';



gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);


const header = document.querySelector('.header');
const headroom = new Headroom(header, {
    offset : 100,
});
headroom.init();
header.headroom = headroom;

window.addEventListener('popup-opened',function(evt){
    console.log('Popup opened');
    console.log('headroom', headroom);
    headroom.notTop();
    
});

//data-popup

function useState(initialValue) {
    let value = initialValue;
    const subscribers = [];

    function setValue(newValue) {
        value = newValue;
        subscribers.forEach((subscriber) => subscriber(value));
    }

    function getState() {
        return value;
    }

    function subscribe(callback) {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    return [getState, setValue, subscribe];
}


const [formPopup, setFormPopup, useSetPopupEffect] = useState(false);

useSetPopupEffect(val => {
    const popup = document.querySelector('[data-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
    if (val){
        window.dispatchEvent(new Event('popup-opened'));
    }
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-call]');
    if (target) {
        setFormPopup(true);

    }
});
document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setFormPopup(false);
    }
});


const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    if (window.screen.width < 1025) return;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

const [menuState, setMenuState, useSetMenuEffect] = useState(false);

useSetMenuEffect(val => {
    const menu = document.querySelector('[data-menu]');
    menu.classList.toggle('active', val);
    if (val) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    document.body.classList.toggle('popup-open', val);
    if (val){
        window.dispatchEvent(new Event('popup-opened'));
    }
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-menu-call]');
    
    if (target && menuState() === false) {
        setMenuState(true);
        return
    }
    console.log('menu state', menuState());
    if (evt.target.closest('[data-menu-close]') && menuState()) {
        setMenuState(false);
    }
});

document.querySelectorAll('.menu__link').forEach(el => {
    el.addEventListener('click',function(evt){
        setMenuState(false);
    });
})

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-menu-close]');
    if (evt.target.closest('[data-menu-call]')) {
        return;
    }
    if (target || evt.target.classList.contains('menu')) {
        setMenuState(false);
    }
});

const [callbackPopupOpen, setCallbackPopupOpen, useSetCallbackPopupEffect] = useState(false);

useSetCallbackPopupEffect(val => {
    const popup = document.querySelector('[data-callback-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
    if (!val && popup.querySelector('[data-success]')) {
        popup.querySelector('[data-success]').remove();
    }
    if (val){
        window.dispatchEvent(new Event('popup-opened'));
    }
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-callback-popup-call]');
    if (target) {
        setCallbackPopupOpen(true);
    }
});
document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-callback-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setCallbackPopupOpen(false);
    }
});


splitToLinesAndFadeUp('[data-split-lines], .bgtitle', gsap);




document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('.up-arrow');
    if (!target) return;
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});