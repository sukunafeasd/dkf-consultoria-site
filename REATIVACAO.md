# DKF pronta para reativacao

## Estado registrado em 07/10/2026

- Repositorio: `sukunafeasd/dkf-consultoria-site`, branch `main`.
- Vercel: equipe `mouradieferson4-4949s-projects`, projeto `dkf-consultoria`.
- Project ID: `prj_OxXlg6MsmLLNx68Kmsqwi3auhEuf`.
- Producao pausada. Os vinculos de `dkf-consultoria.vercel.app` e
  `site-modelo-generico.vercel.app` foram removidos; ambos retornaram HTTP 404.
- Nenhum projeto, checkout, formulario, imagem ou contato foi apagado.
- Deploy automatico desativado em `vercel.json`. A validacao do GitHub continua.
- Uma pausa de producao nao apaga previas antigas nem e um backup do codigo.
- As previas estao com Vercel Authentication / Standard Protection ativada;
  nao foram abertas ao publico nem foi criado segredo de bypass.
- A integracao Vercel tambem sinalizou `Account is blocked` na conta antiga.
  Isso e separado da pausa solicitada. Antes de um novo deploy, regularizar a
  restricao dessa conta junto a Vercel; o codigo nao remove limites da plataforma.

## O que existe

O site apresenta servicos de programacao, paginas, edicao de fotos, design,
presenca digital e automacoes; o briefing solicita escopo antes do pagamento.
A loja tem 13 links de checkout Kiwify, incluindo produtos parceiros com `afid`.
Os arquivos e links foram preservados, sem alterar comissoes ou precos.
Contatos: WhatsApp `5551999027441`, Instagram e TikTok `dkf_consultoria`.
Os formularios usam Formspree `https://formspree.io/f/xljddanr`.
Os dois endpoints locais registram eventos e violacoes CSP, nao armazenam
clientes ou produtos em um banco. Eventos nao incluem os campos do formulario.
Formspree e Kiwify mantem seus proprios dados; o Git nao e backup desses dados.

## Revisao concluida

- Envios repetidos bloqueados enquanto o primeiro formulario esta enviando.
- Retorno do formulario acompanha o dominio em uso; storage bloqueado nao quebra JS.
- Acesso direto a pagina de obrigado nao conta como contato enviado.
- Referrer de eventos registra apenas a origem, sem caminho, query ou fragmento.
- APIs conferem tamanho real do JSON mesmo sem Content-Length.
- Depoimentos demonstrativos removidos; referencias externas nao sao apresentadas
  como trabalhos comprovadamente feitos pela DKF.
- Sete paginas testadas em desktop e celular, filtros, menu, briefing e formularios.
- Testes usam simulacoes; nenhuma mensagem real ou pagamento foi enviado.
- Os 13 checkouts responderam HTTP 200 nesta data. Isso nao comprova preco,
  disponibilidade, entrega, afiliacao, licenca ou funcionamento futuro.

## Como voltar ao ar

1. Conferir contatos, conta Formspree, destinatario e limite de envios. Fazer um
   envio real autorizado e confirmar recebimento: os testes nao enviam emails.
2. Conferir conteudo, licenca, preco e disponibilidade dos 13 checkouts na Kiwify.
   Nao prometer resultados nem publicar avaliacoes sem evidencia e autorizacao.
3. Escolher um dominio disponivel. Atualizar todas as URLs publicas com
   `pnpm configure:origin https://seu-dominio`. Isso ajusta canonical, Open Graph,
   sitemap, robots, security.txt e retornos estaticos, sem tocar nos checkouts.
4. Rodar `pnpm install --frozen-lockfile`, `pnpm test`,
   `pnpm exec playwright install chromium` e `pnpm test:browser`.
5. Conferir que a conta Vercel permite novos deploys e enviar o codigo revisado
   ao GitHub. Na Vercel, retomar o projeto e criar um
   deploy da revisao atual; apenas retomar a pausa serviria o codigo antigo.
6. Associar o dominio a Production e conferir paginas, imagens, formulários e
   links sem fazer pagamentos de teste desnecessarios.
7. Somente se desejar publicacao automatica, mudar `git.deploymentEnabled` para
   `true` em `vercel.json`. Manter `false` permite continuar com deploy manual.

Se mudar o dominio, verificar tambem configuracoes externas do Formspree e da
Kiwify. Arquivos preparados nao garantem que servicos de terceiros continuem
ativos depois de meses ou anos.

Documentacao Vercel: https://vercel.com/docs/projects/managing-projects e
https://vercel.com/docs/project-configuration/git-configuration.
