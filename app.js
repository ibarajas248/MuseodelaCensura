const sourceArticle = 'https://esferapublica.org/museo-nacional-obras-censuradas-de-la-sala-hacer-sociedad/';

let works = [];

const caseGrid = document.querySelector('#case-grid');
const menuButton = document.querySelector('.menu-trigger');
const mainNav = document.querySelector('.main-nav');
const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#search-input');
const searchFeedback = document.querySelector('.search-feedback');
const searchResults = document.querySelector('.search-results');
const caseModal = document.querySelector('.case-modal');
const body = document.body;
let cards = [];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ';') {
      row.push(cell);
      cell = '';
    } else if (character === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (character !== '\r') {
      cell += character;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = (rows.shift() || []).map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) => headers.reduce((record, header, index) => {
      record[header] = (values[index] || '').trim();
      return record;
    }, {}));
}

async function loadWorks() {
  const response = await fetch('data/obras.csv', { cache: 'no-store' });
  if (!response.ok) throw new Error(`No se pudo cargar data/obras.csv: ${response.status}`);
  const records = parseCsv(await response.text());
  return records.map((record) => ({
    id: record.id,
    title: record.titulo,
    artist: record.artista,
    year: record.ano,
    decade: record.decada,
    medium: record.tecnica,
    dimensions: record.dimensiones,
    record: record.registro,
    room: record.sala,
    category: record.categoria,
    images: record.imagenes ? record.imagenes.split('|').map((image) => image.trim()).filter(Boolean) : [],
    note: record.nota,
    source: record.fuente
  }));
}


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function imageMarkup(work) {
  if (!work.images.length) {
    return `<div class="work-placeholder"><span>Reproducción pendiente</span><strong>Documento de archivo</strong></div>`;
  }
  const image = work.images[0];
  const count = work.images.length > 1 ? `<span class="image-count">${work.images.length} vistas</span>` : '';
  return `<img src="${image}" alt="${escapeAttribute(work.title)}. ${escapeAttribute(work.artist)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />${count}`;
}

function workCardMarkup(work) {
  const titleAndArtist = `${work.title} ${work.artist} ${work.room}`;
  return `<article class="case-card work-card" data-category="${escapeAttribute(work.category)}" data-decade="${escapeAttribute(work.decade)}" data-title="${escapeAttribute(titleAndArtist)}" data-work-id="${escapeAttribute(work.id)}">
    <div class="case-image work-image">
      ${imageMarkup(work)}
      <span class="work-overlay">Ver obra <span aria-hidden="true">↗</span></span>
    </div>
    <div class="case-meta"><span>${escapeHtml(work.room)}</span><span>${escapeHtml(work.year)}</span></div>
    <h3>${escapeHtml(work.title)}</h3>
    <p>${escapeHtml(work.artist)} · ${escapeHtml(work.medium)}</p>
    <button class="case-link" type="button" data-open-work="${escapeAttribute(work.id)}">Ver obra <span aria-hidden="true">→</span></button>
  </article>`;
}

async function init() {
  try {
    works = await loadWorks();
  } catch (error) {
    console.error(error);
    caseGrid.innerHTML = '<p class="no-results">No se pudo cargar el catálogo de obras.</p>';
    return;
  }

  caseGrid.innerHTML = works.map(workCardMarkup).join('');
cards = [...caseGrid.querySelectorAll('.case-card')];

const filterButtons = [...document.querySelectorAll('.filter-button')];

function applyFilter(value) {
  filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === value));
  cards.forEach((card) => {
    const visible = value === 'all' || card.dataset.category === value;
    card.classList.toggle('is-hidden', !visible);
    card.setAttribute('aria-hidden', String(!visible));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
});

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

function openSearch() {
  searchPanel.hidden = false;
  body.classList.add('modal-open');
  searchInput.focus();
  renderSearchResults('');
}

function closeSearch() {
  searchPanel.hidden = true;
  body.classList.remove('modal-open');
}

function renderSearchResults(query) {
  const cleanQuery = query.trim().toLowerCase();
  const matches = cards.filter((card) => {
    const haystack = `${card.dataset.title} ${card.textContent}`.toLowerCase();
    return !cleanQuery || haystack.includes(cleanQuery);
  });
  if (!matches.length) {
    searchResults.innerHTML = '<p class="no-results">No se encontraron fichas con ese término.</p>';
  } else {
    searchResults.innerHTML = matches.slice(0, 12).map((card) => `<button class="result-item" type="button" data-open-search-work="${escapeAttribute(card.dataset.workId)}"><span>${escapeHtml(card.querySelector('.case-meta span')?.textContent || '')}</span><strong>${escapeHtml(card.dataset.title.split(' ')[0] ? works.find((work) => work.id === card.dataset.workId)?.title || card.dataset.title : card.dataset.title)}</strong></button>`).join('');
    searchResults.querySelectorAll('[data-open-search-work]').forEach((button) => button.addEventListener('click', () => {
      closeSearch();
      openWork(button.dataset.openSearchWork);
    }));
  }
  searchFeedback.textContent = cleanQuery ? `${matches.length} ficha${matches.length === 1 ? '' : 's'} encontrada${matches.length === 1 ? '' : 's'}.` : `${works.length} piezas disponibles para consulta.`;
}

document.querySelector('.search-trigger').addEventListener('click', openSearch);
document.querySelectorAll('[data-close-search]').forEach((element) => element.addEventListener('click', closeSearch));
searchInput.addEventListener('input', (event) => renderSearchResults(event.target.value));

function openWork(id) {
  const work = works.find((item) => item.id === id);
  if (!work) return;
  const media = document.querySelector('#case-modal-media');
  media.innerHTML = work.images.length
    ? `<div class="modal-gallery${work.images.length === 1 ? ' single-image' : ''}">${work.images.map((image, index) => `<img src="${image}" alt="${escapeAttribute(work.title)}${work.images.length > 1 ? `, vista ${index + 1}` : ''}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`).join('')}</div>`
    : '<div class="modal-empty">No hay reproducción digital asociada en el artículo de referencia.</div>';
  document.querySelector('#case-modal-label').textContent = `${work.room} · ${String(works.indexOf(work) + 1).padStart(2, '0')}`;
  document.querySelector('#case-modal-title').textContent = work.title;
  const detailLines = [work.artist, `${work.year} · ${work.medium}`, work.dimensions !== '—' ? work.dimensions : '', work.record !== '—' ? work.record : '', work.note || ''].filter(Boolean);
  document.querySelector('#case-modal-description').innerHTML = detailLines.map((line, index) => index === 0 ? `<strong>${escapeHtml(line)}</strong>` : escapeHtml(line)).join('<br />');
  document.querySelector('#case-modal-category').textContent = work.room;
  document.querySelector('#case-modal-period').textContent = work.year;
  document.querySelector('#case-modal-source').href = sourceArticle;
  caseModal.hidden = false;
  body.classList.add('modal-open');
  document.querySelector('[data-close-case]').focus();
}

function closeCase() {
  caseModal.hidden = true;
  body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-work]').forEach((button) => button.addEventListener('click', () => openWork(button.dataset.openWork)));
caseGrid.addEventListener('click', (event) => {
  const image = event.target.closest('.work-image');
  if (image) openWork(image.closest('[data-work-id]').dataset.workId);
});
document.querySelectorAll('[data-close-case]').forEach((element) => element.addEventListener('click', closeCase));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!searchPanel.hidden) closeSearch();
  if (!caseModal.hidden) closeCase();
});
}

init();
