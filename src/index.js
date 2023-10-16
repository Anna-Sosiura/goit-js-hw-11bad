import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const URL = 'https://pixabay.com/api/';
const options={
  params:{
  key:"39942542-8d5b68266dba1b25841dee772",
  q:'',
  image_type:"photo",
  orientation:"horizontal",
  safesearch:"true",
  page:1,
  per_page:40,
  }}

const gallery=document.querySelector('.gallery')
const searchForm = document.querySelector('.search-form');
const loadMoreBtn=document.querySelector('.load-more');
searchForm.addEventListener('submit', handleForm);
window.addEventListener('scroll', scroll);
loadMoreBtn.classList.add('is-hidden');
loadMoreBtn.classList.replace('load-more','is-hidden');

loadMoreBtn.addEventListener('click', loadMore);

let totalHits = 0;
let reachedEnd = false;
let isLoadMore = false;

const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
captionDelay: 250,
  close: false,
  enableKeyboard: true,
});
async function handleForm(event) {
  event.preventDefault();
  const { searchQuery } = event.currentTarget.elements;

  options.params.q = searchQuery.value.trim();
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  reachedEnd = false;
  gallery.innerHTML = '';

  try {
    const response = await axios.get(URL, options)
    totalHits = response.data.totalHits;
    const hits = response.data.hits;
    loadMoreBtn.classList.replace('is-hidden','load-more');
    if (hits.length !== 0) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      createMarkup(hits);
    } else {
      Notify.failure('Sorry. Try again, please');
    }
    searchForm.value = '';
  } catch (error) {
    Notify.failure(error);
  }
}


function createMarkup(hits) {
  const markup = hits
    .map(hit => {
      return `<a href="${hit.largeImageURL}" class="lightbox">
 <div class="photo-card">
  <img src="${hit.webformatURL}" alt="${hit.tags}" class="photo-img" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${hit.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${hit.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${hit.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${hit.downloads}
    </p>
  </div>
</div>
    </a>`;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  if (options.params.per_page * options.params.page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
    }
  }
  if (reachedEnd===true){
    
loadMoreBtn.classList.replace('load-more','is-hidden');
  }

  lightbox.refresh();
}

async function loadMore() {
  options.params.page += 1;
  isLoadMore = true;
  try {
    const response = await axios.get(URL, options);
    const hits = response.data.hits;
    createMarkup(hits);
  } catch (err) {
    Notify.failure(err);
    console.log(err);
  } finally {
    isLoadMore = false;
  }
}

function scroll(){
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();
  
  window.scrollBy({
    top: cardHeight * 500,
    behavior: "smooth",
  });}