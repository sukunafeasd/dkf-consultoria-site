document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileLinks = document.querySelectorAll('.mobile-nav a');
let lastFocusedElement = null;

const closeMenu = ({ restoreFocus = false } = {}) => {
  if (!menuButton || !mobileMenu) return;
  menuButton.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
  if (restoreFocus) (lastFocusedElement || menuButton).focus();
};

const openMenu = () => {
  if (!menuButton || !mobileMenu) return;
  lastFocusedElement = document.activeElement;
  menuButton.classList.add('is-open');
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Fechar menu');
  mobileMenu.hidden = false;
  document.body.classList.add('menu-open');
  mobileMenu.querySelector('a')?.focus();
};

menuButton?.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu({ restoreFocus: true });
  } else {
    openMenu();
  }
});

mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu({ restoreFocus: true });
  }
});

document.addEventListener('click', (event) => {
  if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
  if (!header?.contains(event.target)) closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1020) closeMenu();
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealItems.forEach((item) => item.classList.add('reveal-pending'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 12% 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const serviceSelectLinks = document.querySelectorAll('.service-select');
const serviceSelectInput = document.getElementById('selectServico');
const packageInput = document.getElementById('selectPacote');

serviceSelectLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (serviceSelectInput) serviceSelectInput.value = link.dataset.service || '';
    if (packageInput && link.dataset.package) packageInput.value = link.dataset.package;
  });
});

const storeSearch = document.querySelector('[data-store-search]');
const filterButtons = document.querySelectorAll('[data-store-filter]');
const productCards = document.querySelectorAll('[data-product-card]');
const resultsStatus = document.querySelector('[data-results-status]');
let activeFilter = 'todos';

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const updateProducts = () => {
  if (!productCards.length) return;
  const query = normalize(storeSearch?.value.trim() || '');
  let visible = 0;
  productCards.forEach((card) => {
    const categoryMatch = activeFilter === 'todos' || card.dataset.category === activeFilter;
    const textMatch = !query || normalize(card.textContent).includes(query);
    card.hidden = !(categoryMatch && textMatch);
    if (!card.hidden) visible += 1;
  });
  if (resultsStatus) resultsStatus.textContent = `${visible} ${visible === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.storeFilter || 'todos';
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    updateProducts();
  });
});
storeSearch?.addEventListener('input', updateProducts);
updateProducts();

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    if (!button || button.disabled) return;
    button.disabled = true;
    button.textContent = 'Enviando...';
    button.setAttribute('aria-busy', 'true');
  });
});

document.querySelectorAll('[data-current-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;

  let eventName = '';
  if (link.href.includes('pay.kiwify.com.br')) eventName = 'kiwify_checkout';
  if (link.href.includes('wa.me/')) eventName = 'whatsapp_click';
  if (link.origin === window.location.origin && link.pathname === '/servicos') eventName = 'store_open';
  if (!eventName) return;

  const product = link.closest('[data-product-card]')?.querySelector('h3')?.textContent.trim() || '';
  const payload = JSON.stringify({
    event: eventName,
    page: window.location.pathname,
    product: product.slice(0, 100)
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }));
  } else {
    fetch('/api/event', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true });
  }
});
