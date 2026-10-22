'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const galleries = {
  whiteray: [
    ['whiteray-clients.jpg', 'База клиентов и остатки бумаги', 'Клиенты', 'White Ray: список клиентов, количество рулонов и остатки бумаги'],
    ['whiteray-stock.jpg', 'Карточка клиента: рулоны, приход и расход', 'Учёт рулонов', 'White Ray: карточка клиента с остатками и историей движения рулонов'],
    ['whiteray-alerts.jpg', 'Низкий остаток бумаги: уведомление в Telegram', 'Уведомления', 'Telegram-бот White Ray: предупреждения о низком остатке бумаги и готовая накладная'],
    ['whiteray-invoice.jpg', 'Автоматически сформированная накладная', 'Накладная', 'White Ray: готовая накладная с товарами, количеством и итоговой суммой'],
    ['whiteray-orders.jpg', 'Заказ принят и доставлен: клиент получает статус', 'Статусы заказа', 'Telegram-бот White Ray: сообщения о принятом и доставленном заказе'],
    ['whiteray-usage.jpg', 'Расход бумаги по датам', 'Расход бумаги', 'White Ray: график расхода бумаги по датам'],
    ['whiteray-products.jpg', 'Каталог продукции и вариантов упаковки', 'Каталог', 'White Ray: каталог продукции в стиках и саше'],
    ['whiteray-analytics.jpg', 'Сводная аналитика документов по организациям', 'Аналитика', 'White Ray: сводная аналитика накладных по организациям']
  ],
  onesim: [
    ['onesim-website.jpg', 'Сайт для путешественников', 'Сайт', 'Сайт OneSim: выбор страны, тарифы eSIM, информация о сервисе и партнёрская программа'],
    ['onesim-partners.jpg', 'Портал партнёров, демонстрационный аккаунт', 'Портал', 'Партнёрский портал OneSim: продажи, баланс, клиенты и заказы. Демонстрационный аккаунт'],
    ['onesim-checkout.jpg', 'Оформление заказа и выбор способа оплаты', 'Оплата', 'OneSim: данные клиента, доставка eSIM, Click, Uzum Bank, Payme и оплата с баланса'],
    ['onesim-mini-home.jpg', 'Telegram Mini App: главный экран', 'Mini App', 'OneSim Telegram Mini App: поиск стран и список eSIM'],
    ['onesim-mini-usage.jpg', 'Telegram Mini App: статус eSIM и остаток трафика', 'Трафик', 'OneSim Telegram Mini App: статус пакета, использованный и оставшийся трафик'],
    ['onesim-traffic.jpg', 'Бот: проверка трафика и статуса eSIM', 'Бот: статус', 'Бот OneSim: выбор eSIM и уведомление об окончании срока пакета'],
    ['onesim-support.jpg', 'Бот: инструкции и обращение в поддержку', 'Бот: поддержка', 'Бот OneSim: инструкции по настройке eSIM и создание обращения в поддержку']
  ]
};
const position = (index, count) => `${index + 1} из ${count}`;

// Tabs share one keyboard model: arrows move focus and selection, Home/End jump.
function bindTabKeys(tabs, select, vertical = false) {
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    const keys = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    let next = null;
    if (event.key === keys[0] || event.key === (vertical ? 'ArrowLeft' : 'ArrowUp')) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === keys[1] || event.key === (vertical ? 'ArrowRight' : 'ArrowDown')) next = (index + 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
    tabs[next].focus();
  }));
}

/* Navigation */
const navShell = document.querySelector('.nav-shell');
const navLinks = [...document.querySelectorAll('.nav-links a')];
const indicator = document.querySelector('.nav-indicator');
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function moveIndicator(link) {
  if (!link) { indicator.style.opacity = '0'; return; }
  indicator.style.opacity = '1';
  indicator.style.width = `${link.offsetWidth}px`;
  indicator.style.transform = `translateX(${link.offsetLeft}px)`;
}
let scrollFrame = null;
function updateNav() {
  scrollFrame = null;
  navShell.classList.toggle('is-scrolled', window.scrollY > 24);
  let active = null;
  sections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= window.innerHeight * .35) active = navLinks[index];
  });
  const lastSection = sections[sections.length - 1];
  if (lastSection && lastSection.getBoundingClientRect().bottom < 0) active = null;
  navLinks.forEach(link => link === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  moveIndicator(active);
}
const requestNav = () => { if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateNav); };
window.addEventListener('scroll', requestNav, { passive: true });
window.addEventListener('resize', requestNav);
document.fonts?.ready.then(requestNav);
updateNav();

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.hidden = !open;
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); toggle.focus(); } });
document.addEventListener('click', event => { if (!mobileMenu.hidden && !navShell.contains(event.target)) setMenu(false); });

/* Hero showcase: tabs advance on their own until the visitor takes over. */
const showcase = document.querySelector('.showcase');
const showcaseTabs = [...showcase.querySelectorAll('[role="tab"]')];
const showcaseUrl = showcase.querySelector('.showcase-url');
let showcaseIndex = 0;
let autoplay = !reducedMotion.matches;

function selectSlide(index, byUser = false) {
  if (byUser) stopAutoplay();
  showcaseIndex = index;
  showcaseTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  showcaseUrl.textContent = showcaseTabs[index].dataset.url;
  // Restart the progress animation on the newly selected tab.
  const bar = showcaseTabs[index].querySelector('.progress');
  bar.style.display = 'none';
  void bar.offsetWidth;
  bar.style.display = '';
}
function stopAutoplay() {
  autoplay = false;
  showcase.classList.remove('is-playing');
}
showcaseTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSlide(index, true));
  tab.querySelector('.progress').addEventListener('animationend', () => {
    if (autoplay) selectSlide((showcaseIndex + 1) % showcaseTabs.length);
  });
});
bindTabKeys(showcaseTabs, selectSlide);
showcase.addEventListener('pointerenter', () => showcase.classList.add('is-paused'));
showcase.addEventListener('pointerleave', () => showcase.classList.remove('is-paused'));
if (autoplay) showcase.classList.add('is-playing');

/* Event feed: a short loop of the kinds of events the OneSim backend handles. */
const feedItems = [...document.querySelectorAll('.event-feed li')];
let feedIndex = 0;
let feedTimer = null;
function showNextEvent() {
  const visible = feedItems.filter(item => item.classList.contains('is-shown') && !item.classList.contains('is-leaving'));
  if (visible.length >= 2) {
    const oldest = visible[0];
    oldest.classList.add('is-leaving');
    oldest.addEventListener('animationend', () => oldest.classList.remove('is-shown', 'is-leaving'), { once: true });
  }
  const item = feedItems[feedIndex];
  item.classList.remove('is-leaving');
  item.parentElement.append(item);
  item.classList.add('is-shown');
  feedIndex = (feedIndex + 1) % feedItems.length;
}
function startFeed() {
  if (feedTimer || reducedMotion.matches) return;
  feedTimer = setInterval(showNextEvent, 2800);
}
function stopFeed() { clearInterval(feedTimer); feedTimer = null; }
if (reducedMotion.matches) feedItems[1].classList.add('is-shown');
else { setTimeout(showNextEvent, 1100); }
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startFeed();
    else stopFeed();
    showcase.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(showcase);
} else startFeed();

/* Galleries */
const galleryStates = new Map();
for (const [name, items] of Object.entries(galleries)) galleryStates.set(name, { name, items, index: 0 });

const oneSimRow = document.querySelector('[data-gallery="onesim"] .screens-row');
galleries.onesim.forEach((item, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.setAttribute('aria-label', `Открыть скриншот: ${item[1]}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.dataset.lightbox = 'onesim';
  button.dataset.index = String(index);
  const img = document.createElement('img');
  img.src = `assets/${item[0]}`;
  img.alt = '';
  img.loading = 'lazy';
  const label = document.createElement('span');
  label.textContent = item[2];
  button.append(img, label);
  oneSimRow.append(button);
});

const viewer = document.querySelector('[data-gallery="whiteray"]');
const viewerTabs = viewer.querySelector('.viewer-tabs');
const viewerImage = viewer.querySelector('.viewer-image');
const viewerOpen = viewer.querySelector('.viewer-open');
const whiteray = galleryStates.get('whiteray');
galleries.whiteray.forEach((item, index) => {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', String(index === 0));
  tab.setAttribute('aria-controls', 'whiteray-panel');
  tab.tabIndex = index === 0 ? 0 : -1;
  const number = document.createElement('span');
  number.className = 'n';
  number.textContent = String(index + 1);
  tab.append(number, item[2]);
  tab.addEventListener('click', () => selectViewer(index));
  viewerTabs.append(tab);
});
const viewerButtons = [...viewerTabs.children];
function selectViewer(index) {
  whiteray.index = index;
  const item = whiteray.items[index];
  viewerButtons.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  viewerImage.src = `assets/${item[0]}`;
  viewerImage.alt = item[3];
  viewerImage.style.animation = 'none';
  void viewerImage.offsetWidth;
  viewerImage.style.animation = '';
  viewerOpen.setAttribute('aria-label', `Открыть скриншот: ${item[1]}`);
  viewer.querySelector('.viewer-title').textContent = item[1];
  viewer.querySelector('.viewer-counter').textContent = position(index, whiteray.items.length);
  viewerButtons[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}
bindTabKeys(viewerButtons, selectViewer, window.matchMedia('(min-width: 761px)').matches);
viewerOpen.setAttribute('aria-haspopup', 'dialog');
viewerOpen.addEventListener('click', () => openLightbox(whiteray));

/* Lightbox */
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('.lightbox-image');
const imageWrap = lightbox.querySelector('.lightbox-image-wrap');
const fitButton = lightbox.querySelector('.lightbox-fit');
let activeGallery = null;

function setImageFit(fit) {
  imageWrap.classList.toggle('fit-image', fit);
  fitButton.setAttribute('aria-pressed', String(fit));
  fitButton.textContent = fit ? 'По ширине' : 'Вписать в экран';
  imageWrap.scrollTop = 0;
}
fitButton.addEventListener('click', () => setImageFit(!imageWrap.classList.contains('fit-image')));
lightboxImage.addEventListener('load', () => setImageFit(lightboxImage.naturalHeight <= lightboxImage.naturalWidth * 1.5));

function updateLightbox() {
  const item = activeGallery.items[activeGallery.index];
  lightboxImage.style.animation = 'none';
  void lightboxImage.offsetWidth;
  lightboxImage.style.animation = '';
  lightboxImage.src = `assets/${item[0]}`;
  if (lightboxImage.complete && lightboxImage.naturalWidth) setImageFit(lightboxImage.naturalHeight <= lightboxImage.naturalWidth * 1.5);
  lightboxImage.alt = item[3];
  lightbox.querySelector('#lightbox-caption').textContent = item[1];
  lightbox.querySelector('.lightbox-counter').textContent = position(activeGallery.index, activeGallery.items.length);
}
function openLightbox(state) {
  activeGallery = state;
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add('modal-open');
}
function moveImage(direction) {
  if (!activeGallery) return;
  activeGallery.index = (activeGallery.index + direction + activeGallery.items.length) % activeGallery.items.length;
  if (activeGallery === whiteray) selectViewer(activeGallery.index);
  updateLightbox();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-lightbox]');
  if (!trigger) return;
  const state = galleryStates.get(trigger.dataset.lightbox);
  state.index = Number(trigger.dataset.index);
  openLightbox(state);
});
document.querySelectorAll('[data-lightbox]').forEach(button => button.setAttribute('aria-haspopup', 'dialog'));
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => moveImage(-1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => moveImage(1));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
lightbox.addEventListener('click', event => {
  const rect = lightbox.getBoundingClientRect();
  if (event.target === lightbox && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lightbox.close();
});
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveImage(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveImage(1); }
});
let touchStart = null;
imageWrap.addEventListener('touchstart', event => { touchStart = event.touches[0]; }, { passive: true });
imageWrap.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.clientX;
  const dy = event.changedTouches[0].clientY - touchStart.clientY;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) moveImage(dx < 0 ? 1 : -1);
  touchStart = null;
});

/* Services */
const serviceTabs = [...document.querySelectorAll('.svc-tabs [role="tab"]')];
function selectService(index) {
  serviceTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  serviceTabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}
serviceTabs.forEach((tab, index) => tab.addEventListener('click', () => selectService(index)));
bindTabKeys(serviceTabs, selectService, window.matchMedia('(min-width: 1081px)').matches);

/* Contact */
const copyButton = document.querySelector('.copy-phone');
const copyLabel = copyButton.querySelector('span');
const copyStatus = document.querySelector('.copy-status');
let copyTimer = null;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('+998935149808');
    copyButton.classList.add('is-copied');
    copyLabel.textContent = 'Скопировано';
    copyStatus.textContent = '';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyButton.classList.remove('is-copied'); copyLabel.textContent = 'Скопировать'; }, 2200);
  } catch {
    copyStatus.textContent = 'Скопируйте номер вручную: +998 93 514 98 08';
  }
});

/* Fact counters */
const factNumbers = document.querySelectorAll('[data-count]');
const countUp = el => {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const countObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countUp(entry.target);
      countObserver.unobserve(entry.target);
    }
  }, { threshold: 0.6 });
  factNumbers.forEach(el => { el.textContent = '0'; countObserver.observe(el); });
}

/* Reveal on scroll */
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(target => revealObserver.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add('is-visible'));
}
