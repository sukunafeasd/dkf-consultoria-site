// Menu mobile
const menuBtn = document.getElementById('menuBtn');
const menuMobile = document.getElementById('menuMobile');
const mobileLinks = document.querySelectorAll('.mobile-link');

function setMenuOpen(open) {
  menuMobile.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
}

menuBtn?.addEventListener('click', () => {
  setMenuOpen(menuMobile.classList.contains('hidden'));
});

// Fechar menu ao clicar em um link (mobile)
mobileLinks.forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// Fechar menu com Esc
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuMobile && !menuMobile.classList.contains('hidden')) {
    setMenuOpen(false);
    menuBtn.focus();
  }
});

// Ano do rodapé
const ano = document.getElementById('ano');
if (ano) {
  ano.textContent = String(new Date().getFullYear());
}
