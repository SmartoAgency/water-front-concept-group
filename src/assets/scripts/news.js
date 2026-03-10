import { BehaviorSubject } from 'rxjs';
import isEmpty from 'lodash/isEmpty.js';
import FilterModel from './modules/filter/filterModel.js';
import FilterController from './modules/filter/filterController.js';
import FilterView from './modules/filter/filterView.js';
import { pushParams, removeParamsByRegExp, getUrlParam } from './modules/history/history.js';
import { debounceResize } from './modules/helpers/helpers.js';
import { get } from 'lodash';



if (document.documentElement.dataset.status != 'local') {
}
planningsGallery();


async function planningsGallery() {

    const SEARCH_PARAMS_FILTER_PREFIX = 'filter_';
    const currentFilteredFlatIds$ = new BehaviorSubject([]);

    const $moreButton = document.querySelector('[data-more]');
    const $paginationArrows = document.querySelector('[data-pagination]');

    const fetchedFlats = await getFlats();

    console.log('fetchedFlats', fetchedFlats);
    // fetchedFlats.forEach((flat) => {
    //     flat.posttype = flat.acf.block.type;
    // })
    // return;
    

    const flats = fetchedFlats.reduce((acc, flat) => {
        acc[flat.id] = flat;
        return acc;
    }, {});   


    let paginationData = [];
    let currentPage$ = new BehaviorSubject(getUrlParam('filterPage') ? +getUrlParam('filterPage') : 1);
    let totalPages = 0;
    const portion = 12;


    currentPage$.subscribe((page) => {
        const $container = document.querySelector('[data-planning-list]');

        $moreButton.classList.toggle('hidden', page >= totalPages);
        $paginationArrows.classList.toggle('hidden', totalPages == 0);

        if (!paginationData[page]) return;

        $container.insertAdjacentHTML('beforeend', paginationData[page].map(id => {
            const flat = flats[id];
            // return renderTemplate('flat-card-template', flat);
            return getProjectCard(flat);
        }).join(''));

        
        renderCurrentPageAndSwitchArrows(currentPage$);
        pushParams({
            filterPage: currentPage$.value,
        });

        onAfterChangePageEvents();
    })

    currentFilteredFlatIds$.subscribe((ids) => {
        
        const idsSortedByIds = ids;
        paginationData = preparePgination(idsSortedByIds).portionedFlats;
        totalPages = preparePgination(idsSortedByIds).totalPages;

        renderCountPages(totalPages);
        const $container = document.querySelector('[data-planning-list]');
        
        $container.innerHTML = '';
        if (ids.length === 0) {
            const template = document.getElementById('empty-planning-list');
            $container.innerHTML = template.innerHTML;
            onAfterChangePageEvents();
            return;
        }

        currentPage$.next(totalPages < currentPage$.value ? totalPages : currentPage$.value);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    document.querySelectorAll('[data-pagination="prev"]').forEach((el) => {
        el.addEventListener('click', (e) => {
            if (currentPage$.value > 1) {
                currentPage$.next(currentPage$.value - 1);
                currentFilteredFlatIds$.next(currentFilteredFlatIds$.value);
            }
        });
    });
    document.querySelectorAll('[data-pagination="next"]').forEach((el) => {
        el.addEventListener('click', (e) => {
            if (currentPage$.value < totalPages) {
                currentPage$.next(currentPage$.value + 1);
                currentFilteredFlatIds$.next(currentFilteredFlatIds$.value);
            }
        });
    });

    document.querySelectorAll('[id="resetFilter"]').forEach((el) => {
        el.addEventListener('click', (e) => {
            currentPage$.next(1);
        })
    })

    $moreButton.addEventListener('click', (e) => {
        
        currentPage$.next(+currentPage$.value + 1);
    })

    // mark checked checkboxes from default URL search params
    const filterDefaultSearchParams = new URLSearchParams(window.location.search);
    Array.from(filterDefaultSearchParams.entries()).forEach(([key, value]) => {
        if (key.startsWith(SEARCH_PARAMS_FILTER_PREFIX)) {
            const [_, name, valueName] = key.split('_');
            document.querySelectorAll(`input[data-${name}="${valueName}"]`).forEach((el) => {
                el.closest('label').classList.add('active');
                el.checked = true;
            })
        }
    });


    const filterModel = new FilterModel(
        {
            flats: flats,
            currentFilteredFlatIds$: currentFilteredFlatIds$,
            onChangeFilterState: (state, filterConfig) => {
                if (isEmpty(filterConfig)) return;

                const filterSearchParamsPrefix = SEARCH_PARAMS_FILTER_PREFIX;

                const searchParamsOfFilterState = Object.entries(state).reduce((acc, [key, value]) => {
                    const filterName = value[0];
                    const filterType = value[1].type;
                    switch (filterType) {
                        case 'range':
                            const rangeInstance = filterConfig[filterName].elem;
                            if (rangeInstance.result.from !== rangeInstance.result.min) {
                                acc[`${filterSearchParamsPrefix}${filterName}_min`] = value[1].min;
                            }
                            if (rangeInstance.result.to !== rangeInstance.result.max) {
                                acc[`${filterSearchParamsPrefix}${filterName}_max`] = value[1].max;
                            }
                            break;
                        case 'checkbox':
                            value[1].value.forEach(val => {
                                acc[`${filterSearchParamsPrefix}${filterName}_${val}`] = val;
                            });
                            break;
                        case 'text':
                            if (value[1].value) {
                                acc[`${filterSearchParamsPrefix}${filterName}`] = value[1].value;
                            }
                            break;
                    }
                    return acc;
                }, {});

                const regExp = new RegExp(`${SEARCH_PARAMS_FILTER_PREFIX}`);

                removeParamsByRegExp(regExp);

                pushParams(searchParamsOfFilterState);
            },

            types: {
                posttype: 'checkbox',
            }
        },
    );
    const filterView = new FilterView(filterModel, {});
    const filterController = new FilterController(filterModel, filterView);

    filterModel.init();

    function renderCountPages(totalPages) {
        document.querySelectorAll('[data-planning-pages-count]').forEach((el) => {
            el.textContent = totalPages < 10 ? `0${totalPages}` : totalPages;
        });
    }

    function renderCurrentPageAndSwitchArrows(currentPage$) {
        document.querySelectorAll('[name="pagination-current"]').forEach((el) => {
            el.value = padNumber(currentPage$.value);
        });
        document.querySelectorAll('[data-pagination="prev"]').forEach((el) => {
            el.disabled = currentPage$.value <= 1;
        });
        document.querySelectorAll('[data-pagination="next"]').forEach((el) => {
            el.disabled = currentPage$.value >= totalPages;
        });
    }

    function preparePgination(flats = []) {
        const portionedFlats = [];
        const length = flats.length;
        const totalPages = Math.ceil(length / portion);

        flats.forEach((flat, index) => {
            const page = Math.floor(index / portion) + 1;
            if (!portionedFlats[page]) {
                portionedFlats[page] = [];
            }
            portionedFlats[page].push(flat);
        });        

        return { portionedFlats, totalPages };
    }

    function onAfterChangePageEvents() {
        window.dispatchEvent(new CustomEvent('plannings:rendered', {}));
        window.dispatchEvent(new Event('resize'));
    }
}

async function getFlats() {
    const isDev =  window.location.href.match(/localhost|verstka|192/);
    let url = isDev ? './static/flats.json' : '/wp-json/wp/v2/posts?categories=3&_embed=1&per_page=100&order=desc';
    if (document.documentElement.dataset.news_api_url) {
        url = document.documentElement.dataset.news_api_url;
    }


    const response = await fetch(url, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}


const monthNames = {
    uk: {
        1: 'Січня',
        2: 'Лютого',
        3: 'Березня',
        4: 'Квітня',
        5: 'Травня',
        6: 'Червня',
        7: 'Липня',
        8: 'Серпня',
        9: 'Вересня',
        10: 'Жовтня',
        11: 'Листопада',
        12: 'Грудня',
    }, 
    en: {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December',
    }
}

function getProjectCard(data) {

    const {title, digit,month, year, img, link} = data

    return `
        <a class="news__item" href="${link}">
            <div class="news__item-img"><img src="${img}" alt="${title}" loading="lazy"></div>
            <div class="news__item-info">
                <div class="news__item-title text-style-1920-subtitle text-style-375-subtitle">${title}</div>
                <div class="news__item-date">
                    <div class="news__item-date-digit">${digit}</div>
                    <div class="news__item-date-month-year">${month} ${year}</div>
                </div>
                <div class="news__item-arrow">
                    <div class="news__item-arrow-line"></div>
                    <div class="news__item-arrow-icon"></div>
                </div>
            </div>
        </a>
    `
}

function padNumber(num) {
    return num < 10 ? `0${num}` : num;
}




window.addEventListener('load', () => {
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-filter-collapse]');
        if (!target) return;
        const filter = target.closest('[data-filter]');
        if (!filter) return;
        filter.classList.toggle('collapsed');
    });
    if (window.innerWidth <= 600) {
        document.querySelector('[data-filter]').classList.add('collapsed');
    }
})


const debFilterDisable = debounceResize(() => {
    if (window.innerWidth > 600) {
        document.querySelectorAll('[data-filter]').forEach((el) => {
            el.classList.remove('collapsed');
        });
    }
}, 1000);

    window.addEventListener('resize', debFilterDisable);


document.body.addEventListener('change', function handleUIOfFilterButtons(e) {
    const target = e.target.closest('[data-news-filter-button]');
    if (!target) return;
    const label = target.closest('label');
    label.classList.toggle('active', target.checked);
})

