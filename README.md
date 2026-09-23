# DKF Consultoria Digital

Site institucional e loja da DKF Consultoria Digital, publicados na Vercel.

## Páginas

- `index.html`: site principal com apresentação da DKF, soluções, trabalhos, avaliações, loja, FAQ e contato.
- `servicos.html`: loja DKF com serviços práticos, produtos digitais e produtos parceiros com checkout pela Kiwify.
- `obrigado.html`: página de retorno após envio de formulário.
- `404.html`: página de erro personalizada.
- `privacidade.html`, `termos.html` e `reembolso.html`: informações públicas de tratamento de dados e compra.

## Estrutura

- `style.css`: estilos globais e responsivos.
- `script.js`: menu mobile, header com scroll, animações de entrada e seleção do briefing.
- `assets/site/`: imagens do site e previews sociais.
- `assets/products/`: capas dos produtos da loja.
- `site.webmanifest` e ícones PNG: identidade da DKF em atalhos e dispositivos móveis.
- `vercel.json`: URLs limpas, headers de segurança e cache.
- `tests/audit.mjs`: verificação de IDs, imagens, links locais e configurações.
- `.github/workflows/quality.yml`: validação automática a cada envio para o GitHub.

## Publicação

O deploy principal é feito pela Vercel em:

https://dkf-consultoria.vercel.app/

## Manutenção

Instale as dependências e valide o projeto antes de publicar:

```powershell
pnpm install
pnpm test
```

As capas próprias podem ser regeneradas com `pnpm exec node scripts/generate-covers.mjs`. As versões WebP são atualizadas com `pnpm exec node scripts/optimize-images.mjs`.

Ao alterar produtos, confira:

- título, descrição, preço e link Kiwify;
- capa em `assets/products/`;
- opção correspondente no formulário de briefing, quando fizer sentido;
- `sitemap.xml`, caso uma nova página pública seja criada.
- edição/ano do material, recorrência, autoria e condições mostradas no checkout.
- se toda promessa comercial pode ser comprovada e se o checkout repete as mesmas condições da loja;
- se produtos com edição anual continuam atuais antes de recolocá-los na vitrine.

Produtos desatualizados permanecem fora da vitrine até que conteúdo, capa e checkout sejam revisados em conjunto. Avaliações só devem ser publicadas com conteúdo real e autorização do cliente.
