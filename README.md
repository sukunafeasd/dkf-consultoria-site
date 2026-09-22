# DKF Consultoria Digital

Site institucional e loja da DKF Consultoria Digital, publicados na Vercel.

## Páginas

- `index.html`: site principal com apresentação da DKF, soluções, trabalhos, avaliações, loja, FAQ e contato.
- `servicos.html`: loja DKF com serviços práticos, produtos digitais e produtos parceiros com checkout pela Kiwify.
- `obrigado.html`: página de retorno após envio de formulário.
- `404.html`: página de erro personalizada.

## Estrutura

- `style.css`: estilos globais e responsivos.
- `script.js`: menu mobile, header com scroll, animações de entrada e seleção do briefing.
- `assets/site/`: imagens do site e previews sociais.
- `assets/products/`: capas dos produtos da loja.
- `vercel.json`: URLs limpas, headers de segurança e cache.

## Publicação

O deploy principal é feito pela Vercel em:

https://dkf-consultoria.vercel.app/

## Manutenção

Ao alterar produtos, confira:

- título, descrição, preço e link Kiwify;
- capa em `assets/products/`;
- opção correspondente no formulário de briefing, quando fizer sentido;
- `sitemap.xml`, caso uma nova página pública seja criada.
