document.documentElement.classList.remove('no-js');
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
    return;
  }
  if (event.key !== 'Tab' || menuButton?.getAttribute('aria-expanded') !== 'true' || !mobileMenu) return;
  const focusable = [...mobileMenu.querySelectorAll('a[href], button:not([disabled])')]
    .filter((item) => !item.hidden && item.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
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
  window.setTimeout(() => {
    revealItems.forEach((item) => {
      item.classList.remove('reveal-pending');
      item.classList.add('is-visible');
      observer.unobserve(item);
    });
  }, 1800);
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
const storeParams = new URLSearchParams(window.location.search);
let activeFilter = storeParams.get('categoria') || 'todos';

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
  if (storeSearch || filterButtons.length) {
    const nextParams = new URLSearchParams(window.location.search);
    if (query) nextParams.set('busca', storeSearch.value.trim());
    else nextParams.delete('busca');
    if (activeFilter !== 'todos') nextParams.set('categoria', activeFilter);
    else nextParams.delete('categoria');
    const nextUrl = `${window.location.pathname}${nextParams.size ? `?${nextParams}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }
};

if (storeSearch) storeSearch.value = storeParams.get('busca') || '';
if (![...filterButtons].some((button) => button.dataset.storeFilter === activeFilter)) activeFilter = 'todos';
filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.storeFilter === activeFilter)));

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.storeFilter || 'todos';
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    updateProducts();
  });
});
storeSearch?.addEventListener('input', updateProducts);
updateProducts();

const showFormStatus = (form, message, type = 'info') => {
  const status = form.querySelector('[data-form-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
};

const readSession = (key) => {
  try { return sessionStorage.getItem(key); } catch { return null; }
};
const writeSession = (key, value) => {
  try { sessionStorage.setItem(key, value); } catch { /* Storage is optional for contact forms. */ }
};

const setFieldInvalid = (field, invalid) => {
  if (!field) return;
  if (invalid) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
};

const validateSecureForm = (form) => {
  const startedAt = Number(form.dataset.startedAt || Date.now());
  const elapsed = Date.now() - startedAt;
  const honeypot = form.querySelector('[name="_gotcha"]');
  const phone = form.querySelector('input[type="tel"]');
  const message = form.querySelector('textarea[name="mensagem"], textarea[name="descricao"]');
  const phoneDigits = phone?.value.replace(/\D/g, '') || '';
  const messageLength = message?.value.trim().length || 0;

  if (honeypot?.value) return false;

  setFieldInvalid(phone, false);
  setFieldInvalid(message, false);

  if (elapsed < 2500) {
    showFormStatus(form, 'Aguarde alguns segundos antes de enviar. Isso ajuda a proteger o formulário contra spam.', 'error');
    return false;
  }

  if (phone && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
    setFieldInvalid(phone, true);
    showFormStatus(form, 'Confira o WhatsApp com DDD antes de enviar.', 'error');
    phone.focus();
    return false;
  }

  if (message && messageLength < 20) {
    setFieldInvalid(message, true);
    showFormStatus(form, 'Escreva um pouco mais sobre o que você precisa para a DKF responder melhor.', 'error');
    message.focus();
    return false;
  }

  return true;
};

const resetSubmitButtons = () => {
  document.querySelectorAll('form').forEach((form) => {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = false;
    button.textContent = button.dataset.defaultText || button.textContent;
    button.removeAttribute('aria-busy');
    showFormStatus(form, '');
  });
};

document.querySelectorAll('form').forEach((form) => {
  const button = form.querySelector('button[type="submit"]');
  if (button) button.dataset.defaultText = button.textContent;
  const startedAtInput = form.querySelector('[data-form-started-at]');
  form.dataset.startedAt = String(Date.now());
  if (startedAtInput) startedAtInput.value = new Date().toISOString();
  const returnPage = form.querySelector('[name="_next"]');
  if (returnPage && ['http:', 'https:'].includes(location.protocol)) {
    returnPage.value = new URL('/obrigado', location.origin).href;
  }
  form.addEventListener('submit', (event) => {
    if (!button) return;
    if (button.disabled) { event.preventDefault(); return; }
    if (!form.checkValidity()) return;
    if (form.matches('[data-secure-form]') && !validateSecureForm(form)) {
      event.preventDefault();
      return;
    }
    trackEvent('form_submit', form.id || form.querySelector('[name="_subject"]')?.value || 'formulario');
    writeSession('dkf_lead_pending', String(Date.now()));
    button.disabled = true;
    button.textContent = 'Enviando...';
    button.setAttribute('aria-busy', 'true');
    showFormStatus(form, 'Enviando sua mensagem com segurança...', 'success');
  });
});
window.addEventListener('pageshow', resetSubmitButtons);

document.querySelectorAll('[data-current-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});

const trackEvent = (eventName, product = '') => {
  const params = new URLSearchParams(window.location.search);
  let source = params.get('utm_source') || 'direto';
  if (!params.get('utm_source') && document.referrer) {
    try { source = new URL(document.referrer).origin; } catch { source = 'direto'; }
  }
  const payload = JSON.stringify({
    event: eventName,
    page: window.location.pathname,
    product: product.slice(0, 100),
    source: source.slice(0, 120),
    campaign: (params.get('utm_campaign') || '').slice(0, 80)
  });

  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }));
    if (!queued) {
      fetch('/api/event', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true })
        .catch(() => {});
    }
  } else {
    fetch('/api/event', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true })
      .catch(() => {});
  }
};

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;

  let eventName = '';
  if (link.href.includes('pay.kiwify.com.br')) eventName = 'kiwify_checkout';
  else if (link.href.includes('wa.me/')) eventName = 'whatsapp_click';
  else if (link.href.includes('instagram.com') || link.href.includes('tiktok.com')) eventName = 'social_click';
  else if (link.origin === window.location.origin && link.pathname === '/servicos') eventName = 'store_open';
  if (!eventName) return;

  const product = link.closest('[data-product-card]')?.querySelector('h3')?.textContent.trim()
    || link.getAttribute('aria-label')
    || link.textContent.trim();
  trackEvent(eventName, product);
});

const pendingLead = Number(readSession('dkf_lead_pending'));
if (['/obrigado', '/obrigado.html'].includes(window.location.pathname)
    && pendingLead > 0 && Date.now() >= pendingLead && Date.now() - pendingLead < 900_000) {
  writeSession('dkf_lead_pending', '');
  trackEvent('lead_success', 'formulario');
}
