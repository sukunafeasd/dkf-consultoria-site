const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileLinks = document.querySelectorAll('.mobile-nav a');

const closeMenu = () => {
  if (!menuButton || !mobileMenu) return;
  menuButton.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  if (mobileMenu) {
    mobileMenu.hidden = !isOpen;
  }
});

mobileLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

const revealItems = document.querySelectorAll('.reveal');
const serviceSelectLinks = document.querySelectorAll('.service-select');
const serviceSelectInput = document.getElementById('selectServico');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 12% 0px' });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

serviceSelectLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (serviceSelectInput) {
      serviceSelectInput.value = link.dataset.service || '';
    }
  });
});
