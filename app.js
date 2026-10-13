'use strict';
const galleries = {
  whiteray: [
    ['whiteray-clients.jpg', 'База клиентов и остатки бумаги', 'Клиенты', 'White Ray: список клиентов, количество рулонов и остатки бумаги'],
    ['whiteray-stock.jpg', 'Карточка клиента: рулоны, приход и расход', 'Учёт рулонов', 'White Ray: карточка клиента с остатками и историей движения рулонов'],
    ['whiteray-alerts.jpg', 'Низкий остаток бумаги → уведомление в Telegram', 'Уведомления', 'Telegram-бот White Ray: предупреждения о низком остатке бумаги и готовая накладная'],
    ['whiteray-invoice.jpg', 'Автоматически сформированная накладная', 'Накладная', 'White Ray: готовая накладная с товарами, количеством и итоговой суммой'],
    ['whiteray-orders.jpg', 'Заказ принят и доставлен: клиент получает статус', 'Статусы заказа', 'Telegram-бот White Ray: сообщения о принятом и доставленном заказе'],
    ['whiteray-usage.jpg', 'Расход бумаги по датам', 'Расход бумаги', 'White Ray: график расхода бумаги по датам'],
    ['whiteray-products.jpg', 'Каталог продукции и вариантов упаковки', 'Каталог', 'White Ray: каталог продукции в стиках и саше'],
    ['whiteray-analytics.jpg', 'Сводная аналитика документов по организациям', 'Аналитика', 'White Ray: сводная аналитика накладных по организациям']
  ],
  onesim: [
    ['onesim-mini-home.jpg', 'Telegram Mini App: главный экран', 'Mini App / Главная', 'Onesim Telegram Mini App: поиск стран и список eSIM'],
    ['onesim-mini-usage.jpg', 'Telegram Mini App: статус eSIM и остаток трафика', 'Mini App / Трафик', 'Onesim Telegram Mini App: статус пакета, использованный и оставшийся трафик'],
    ['onesim-traffic.jpg', 'Проверка трафика и статуса eSIM', 'Трафик и статус', 'Бот Onesim: выбор eSIM и уведомление об окончании срока пакета'],
    ['onesim-support.jpg', 'Инструкции и передача обращения в поддержку', 'Поддержка', 'Бот Onesim: инструкции по настройке eSIM и создание обращения в поддержку']
  ]
};
const galleryStates = new Map();
const counter = (index, count) => `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const items = galleries[gallery.dataset.gallery];
  const state = { gallery, items, index: 0 };
  galleryStates.set(gallery.dataset.gallery, state);
  const thumbnails = gallery.querySelector('.gallery-thumbnails');
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumbnail';
    button.setAttribute('aria-label', `Показать: ${item[1]}`);
    button.setAttribute('aria-pressed', String(index === 0));
    const img = document.createElement('img');
    img.src = `assets/${item[0]}`;
    img.alt = '';
    img.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = item[2];
    button.append(img, label);
    button.addEventListener('click', () => {
      selectImage(state, index);
      if (!gallery.querySelector('.screen-open')) openLightbox(state);
    });
    thumbnails.append(button);
  });
  gallery.querySelector('.screen-open')?.addEventListener('click', () => openLightbox(state));
}
function selectImage(state, index) {
  state.index = index;
  const item = state.items[index];
  const img = state.gallery.querySelector('.gallery-main');
  if (img) {
    img.src = `assets/${item[0]}`;
    img.alt = item[3];
    state.gallery.querySelector('.screen-open').setAttribute('aria-label', `Увеличить скриншот: ${item[1]}`);
    state.gallery.querySelector('.gallery-title').textContent = item[1];
    state.gallery.querySelector('.gallery-counter').textContent = counter(index, state.items.length);
  }
  state.gallery.querySelectorAll('.thumbnail').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}
for (const button of document.querySelectorAll('[data-lightbox]')) {
  button.addEventListener('click', () => {
    const state = galleryStates.get(button.dataset.lightbox);
    selectImage(state, Number(button.dataset.imageIndex));
    openLightbox(state);
  });
}
const lightbox = document.querySelector('.lightbox');
let activeGallery = null;
function updateLightbox() {
  const item = activeGallery.items[activeGallery.index];
  lightbox.querySelector('.lightbox-image').src = `assets/${item[0]}`;
  lightbox.querySelector('.lightbox-image').alt = item[3];
  lightbox.querySelector('#lightbox-caption').textContent = item[1];
  lightbox.querySelector('.lightbox-counter').textContent = counter(activeGallery.index, activeGallery.items.length);
}
function openLightbox(state) {
  activeGallery = state;
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add('modal-open');
}
function moveImage(direction) {
  if (!activeGallery) return;
  const next = (activeGallery.index + direction + activeGallery.items.length) % activeGallery.items.length;
  selectImage(activeGallery, next);
  updateLightbox();
}
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
document.querySelector('.copy-phone').addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText('+998935149808');
    status.textContent = 'Номер скопирован';
  } catch {
    status.textContent = 'Номер для копирования: +998 93 514 98 08';
  }
});
