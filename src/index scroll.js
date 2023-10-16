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
// window.addEventListener('scroll', scrollMore);
loadMoreBtn.classList.add('is-hidden');
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



// document.addEventListener('DOMContentLoaded', hideLoader);


async function loadMore() {
  options.params.page += 1;
  isLoadMore = true;
  try {
    const response = await axios.get(URL, options);
    const hits = response.data.hits;
    // if (gallery.innerHTML !== ''
    //       &&
    //       !isLoadMore &&
    //       reachedEnd===false)
    createMarkup(hits);
  } catch (err) {
    Notify.failure(err);
    console.log(err);
  } finally {
    isLoadMore = false;
  }
}

// function scrollMore() {
//   const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
//   const scrollMax = 300;
//   if (
//     scrollTop + clientHeight >= scrollHeight - scrollMax &&
//     gallery.innerHTML !== ''
//     &&
//     !isLoadMore &&
//     reachedEnd===false
//   ) {
//     loadMore();
//   }
// }



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
    loadMoreBtn.classList.remove('is-hidden');
    if (hits.length === 0) {
      Notify.failure('Sorry. Try again, please');
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);

      createMarkup(hits);
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
    loadMoreBtn.classList.add('is-hidden');
  }

  lightbox.refresh();
}