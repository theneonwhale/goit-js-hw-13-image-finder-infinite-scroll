import ImagesApiService from './apiService';
import getRefs from './get-refs';
import imageTpl from '../templates/image-card.hbs';
import debounce from 'lodash.debounce';

import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import { success, notice, error } from '@pnotify/core';

import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';

// import InfiniteScroll from 'infinite-scroll';

const refs = getRefs();
const imagesApiService = new ImagesApiService();
let isFetched = false;
let isMatched = false;
let isNotMatched = false;

refs.form.addEventListener('input', debounce(onSearch, 500));

function onSearch(e) {
  clearImagesContainer();

  imagesApiService.query = e.target.value;

  if (imagesApiService.query === '') {
    onFetchError();
    return;
  }
  imagesApiService.resetPage();
  getImages();
}

function getImages() {
  imagesApiService.fetchImages().then(({ total, hits }) => {
    if (hits.length === 0 && !isFetched && !isMatched) {
      onFetchNoMatches();
      isFetched = true;

      return;
    } else if (!isMatched) {
      onFetchMatches(total);
      isMatched = true;
    }

    if (hits.length === 0 && !isNotMatched && !isFetched) {
      onFetchNoMoreMatches();
      isNotMatched = true;
    }

    appendImagesMarkup(hits);
  });
}

function appendImagesMarkup(image) {
  refs.imagesContainer.insertAdjacentHTML('beforeend', imageTpl(image));
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
  isFetched = false;
  isMatched = false;
  isNotMatched = false;
}

// Infinite scroll
function onEntry(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting && imagesApiService.query !== '') {
      getImages();
      // console.log(entry + Date.now());
    }
  });
}

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 0.5,
};

const observer = new IntersectionObserver(onEntry, options);

observer.observe(refs.sentinel);
// function getPath() {
//   const searchParams = new URLSearchParams({
//     image_type: 'photo',
//     orientation: 'horizontal',
//     q: this.searchQuery,
//     page: this.page,
//     per_page: 12,
//     key: this.API_KEY,
//   });

//   return `${this.BASE_URL}/?${searchParams}`;
// }

// const infScroll = new InfiniteScroll(refs.imagesContainer, {
//   path: getPath,
//   responseType: 'text',
//   history: false,
// });

// infScroll.on('load', getImages);

// Lightbox
refs.imagesContainer.addEventListener('click', onOpenLightbox);

function onOpenLightbox(e) {
  if (e.target.nodeName !== 'IMG') {
    return;
  }
  const instance = basicLightbox.create(`
    <img src="${e.target.dataset.source}" width="800" height="600">
`);

  instance.show();
}

// Pnotify
function onFetchMatches(total) {
  success({
    title: `Success!`,
    text: `Found ${total} images!`,
    delay: 2500,
  });
}

function onFetchNoMatches() {
  notice({
    title: 'No matches!',
    text: 'No matches found. Please enter another query.',
    delay: 2500,
  });
}

function onFetchNoMoreMatches() {
  notice({
    title: 'No matches!',
    text: 'No more matches found. Please enter another query.',
    delay: 2500,
  });
}

function onFetchError() {
  error({
    title: 'Error!',
    text: 'Please enter a query.',
    delay: 2500,
  });
}
