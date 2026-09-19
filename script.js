// Menu mobile
const menuBtn = document.getElementById('menuBtn');
const menuMobile = document.getElementById('menuMobile');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuBtn?.addEventListener('click', () => {
  menuMobile.classList.toggle('hidden');
});

// Fechar menu ao clicar em um link (mobile)
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuMobile.classList.add('hidden');
  });
});