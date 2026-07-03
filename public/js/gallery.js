const GALLERY_ITEMS = [
  { src: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=700&q=80', cat: 'testing', tag: 'Testing', caption: 'Mobile testing unit set up in a community parking lot.' },
  { src: 'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=700&q=80', cat: 'vaccination', tag: 'Vaccination', caption: 'Nurse administering a vaccine dose at a public clinic.' },
  { src: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=700&q=80', cat: 'frontline', tag: 'Frontline staff', caption: 'Doctor reviewing patient charts during a night shift.' },
  { src: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&q=80', cat: 'relief', tag: 'Relief work', caption: 'Volunteers packing food and hygiene kits for delivery.' },
  { src: 'https://images.unsplash.com/photo-1583912086096-8c60d75a53ea?w=700&q=80', cat: 'testing', tag: 'Testing', caption: 'Sample collection point at a regional testing center.' },
  { src: 'https://images.unsplash.com/photo-1618022649301-155a25c72798?w=700&q=80', cat: 'vaccination', tag: 'Vaccination', caption: 'Residents lined up outside a vaccination drive.' },
  { src: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&q=80', cat: 'frontline', tag: 'Frontline staff', caption: 'Medical team suiting up in protective equipment.' },
  { src: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=700&q=80', cat: 'relief', tag: 'Relief work', caption: 'Community kitchen preparing meals for isolated households.' },
  { src: 'https://images.unsplash.com/photo-1620812097407-6c3ffcabb076?w=700&q=80', cat: 'vaccination', tag: 'Vaccination', caption: 'Vaccine vials being prepared before a clinic opens.' }
];

const grid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCap');

function renderGallery(filter) {
  const items = filter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.cat === filter);
  grid.innerHTML = items.map((item, idx) => `
    <div class="gallery-item" data-idx="${GALLERY_ITEMS.indexOf(item)}">
      <img src="${item.src}" alt="${item.caption}" loading="lazy">
      <div class="gallery-caption">
        <span class="tag">${item.tag}</span>
        ${item.caption}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(GALLERY_ITEMS[el.dataset.idx]));
  });
}

function openLightbox(item) {
  lightboxImg.src = item.src;
  lightboxImg.alt = item.caption;
  lightboxCap.textContent = item.caption;
  lightbox.classList.add('open');
}
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderGallery(chip.dataset.filter);
  });
});

renderGallery('all');
