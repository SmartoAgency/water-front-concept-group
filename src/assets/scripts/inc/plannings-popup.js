import Swiper, { Navigation } from "swiper";

Swiper.use([Navigation]);

const mock = () => {
    return [
        {
            title: 'Townnhouse A2E2345 ' + new Date().getTime(),
            img: './assets/images/home/plannings/townhosue.jpg',
            properties: [
                { key: 'Будинок:', value: '5' },
                { key: 'Поверх:', value: '5–8' },
                { key: 'Загальна площа:', value: '97 м²' },
                { key: 'Житлова площа:', value: '78 м²' },
                { key: 'Кімнат:', value: '3' },
                { key: 'Кухня:', value: '15.88 м²' },
                { key: 'Санвузол:', value: '5.78 м²' },
                { key: 'Пральня:', value: '5.46 м²' },
                { key: 'Гардероб:', value: '5.76 м²' },
            ]
        },
    ]
}

function planningCard(data = {}) {

    const { title, img, properties } = data;

    return `
        <div class="apartment-plan swiper-slide">
            <div class="apartment-plan__inner">
                <div class="apartment-plan__floor-plan">
                    <div class="apartment-plan__floor-plan-wrapper">
                        <img class="apartment-plan__image" src="${img}" alt="${title}">
                    </div>
                </div>
                <div class="apartment-plan__details">
                    <h2 class="text-style-1920-subtitle text-style-375-subtitle apartment-plan__title">${title}</h2>
                    <div class="apartment-plan__info">
                        ${properties.map(item => `
                            <div class="apartment-plan__info-row">
                                <span class="apartment-plan__info-label">${item.key}</span>
                                <span class="apartment-plan__info-value">${item.value}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="apartment-plan__action">
                        <button class="button-primary button-primary--no-icon" type="button" data-callback-popup-call=""> <span>ЗВ'ЯЗАТИСЯ З МЕНЕДЖЕРОМ</span></button>
                    </div>
                </div>
            </div>
        </div>
    `;

}

function planningsPopupHandler () {
    const popup = document.querySelector('[data-plannings-popup-wrapper]');
    const popupBody = popup.querySelector('[data-plannings-popup-body]');
    const sliderContainer = popup.querySelector('[data-plannings-popup-slider]');
    const popupTitleContainer = popup.querySelector('[data-plannings-popup-title]');

    document.body.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-planning-popup]');
        if (!target) return;
        const code = target.getAttribute('data-planning-popup');
        const isLocal = document.documentElement.getAttribute('data-status') === 'local';
    
        const url = document.documentElement.getAttribute('data-planning-popup-url');
        if (document.documentElement.getAttribute('data-status') === 'local') {
    
        }
        document.body.style.cursor = 'wait';
        let response = isLocal ? await Promise.resolve([...mock(), ...mock(),...mock()]) : await fetch(url + code);

        if (!isLocal) {
            response = await response.json();
            console.log('response', response);
            response = response.filter(item => item.acf.block.premise_type === code);
            response = response.map(resItem => {
                return {
                    title: resItem.title.rendered,
                    img: resItem._embedded['wp:featuredmedia'] ? resItem._embedded['wp:featuredmedia'][0].source_url : '',
                    properties: resItem.acf.block.apps ? resItem.acf.block.apps : []
                }
            })
        }
    

        const newLayoute = response.map(item => planningCard(item)).join('');
        popupBody.innerHTML = newLayoute;
        popupTitleContainer.textContent = target.closest('.card-planning').querySelector('.card-planning__title').textContent;
        popup.classList.add('active');
        document.body.style.cursor = 'default';
        document.body.classList.add('popup-open');
        if (sliderContainer.swiper) {
            sliderContainer.swiper.update();
        } else {
            new Swiper(sliderContainer, {
                spaceBetween: 2,
                navigation: {
                    nextEl: '[data-plannings-popup-slider-next]',
                    prevEl: '[data-plannings-popup-slider-prev]',
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    601: {
                        slidesPerView: 1.1,
                        spaceBetween: 2,
                    },
                    1025: {
                        slidesPerView: 2.01,
                        spaceBetween: 2,
                    }
                }
            })
        }
    })

    popup.addEventListener('click', (e) => {
        if (e.target === popup || e.target.closest('.popup__close')) {
            popup.classList.remove('active');
            document.body.classList.remove('popup-open');
        }
    })
}


planningsPopupHandler();


function planningsBigSlider() {
   
}
planningsBigSlider();