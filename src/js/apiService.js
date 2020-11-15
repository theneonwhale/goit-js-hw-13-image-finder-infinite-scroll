const API_KEY = '18468929-778868d20e0ea2a779d7d4913';
const BASE_URL = 'https://pixabay.com/api';

export default class ImagesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.BASE_URL = 'https://pixabay.com/api';
    this.API_KEY = '18468929-778868d20e0ea2a779d7d4913';
  }

  async fetchImages() {
    const searchParams = new URLSearchParams({
      image_type: 'photo',
      orientation: 'horizontal',
      q: this.searchQuery,
      page: this.page,
      per_page: 12,
      key: API_KEY,
    });
    const url = `${BASE_URL}/?${searchParams}`;

    const response = await fetch(url);
    const images = await response.json();
    const { total, hits } = images;

    this.incrementPage();

    return { total, hits };
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
