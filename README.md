# 🌿 Vitrine da Saúde — Hortifrúti

Site estático (HTML + CSS + JavaScript). **Não precisa de Node nem de servidor** — roda direto no GitHub Pages, de graça.

## Como o site funciona
| Endereço | O que abre |
|---|---|
| `…/` | Catálogo com busca e filtros |
| `…/#/alimento/morango` | Página só do morango (com receita e QR Code) |
| `…/#/comentarios` | Comentários e avaliações dos clientes |
| `…/#/sobre` | Sobre o projeto |
| `…/adm` | Painel administrativo (não existe link para ele no site) |

Cada alimento é clicável e abre sozinho; a receita de cada um fica dentro da própria página dele.

## Estrutura
```
index.html        página única do site
404.html          faz o endereço /adm funcionar no GitHub Pages
css/style.css     visual
js/config.js      senha do /adm e comentários  <-- você edita aqui
js/app.js         todo o funcionamento
data/alimentos.json   os 95 alimentos e receitas  <-- é o "banco de dados"
.nojekyll         necessário para o GitHub Pages
```

## Publicar no GitHub (passo a passo)
1. Crie uma conta em github.com e clique em **New repository** (ex.: `vitrine-hortifruti`, público).
2. Clique em **uploading an existing file**, arraste **todo o conteúdo desta pasta** (inclusive `.nojekyll`, se o seu sistema mostrar arquivos ocultos) e faça **Commit**.
3. Vá em **Settings → Pages**. Em *Build and deployment*, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e **Save**.
4. Em ~1 minuto o site fica em `https://SEU-USUARIO.github.io/vitrine-hortifruti/`.
5. Se o seu repositório se chamar `SEU-USUARIO.github.io` (ou se usar domínio próprio), abra `404.html` e troque `PASTAS_DE_BASE = 1` por `0`.

> Depois de publicar, gere/imprima os QR Codes (botão **Baixar QR Code** em cada alimento) já com o endereço definitivo.

## Usar o painel /adm
1. Acesse `https://SEU-SITE/adm` (ou digite `/adm` no endereço). **Senha inicial: `admin123` — troque!**
2. Adicione, edite ou remova alimentos e receitas (pode haver várias receitas por alimento).
3. As alterações ficam num **rascunho só no seu navegador**. Para publicar: **Baixar alimentos.json** → no GitHub, abra a pasta `data/` → *Add file → Upload files* → envie o arquivo (substitui o antigo) → Commit.

### Trocar a senha
No `/adm`, abra **Trocar a senha**, digite a nova, copie o código gerado e cole em `js/config.js` no campo `adminHash`.

### Sobre segurança (honestidade)
Como o site é estático, a senha é verificada no navegador: ela esconde o painel, mas **não é proteção forte**. Mesmo assim ninguém consegue alterar o site público pelo `/adm` — as mudanças só entram no ar quando enviadas ao seu repositório, e isso exige a sua conta do GitHub (ative a verificação em duas etapas nela).

## Comentários (opcional, gratuito) — Giscus
Cada página de alimento pode ter comentários, guardados nas *Discussions* do seu repositório:
1. No repositório: **Settings → General → Features → Discussions** (marcar).
2. Crie a categoria **Comentarios** (formato *Announcement*).
3. Instale o app https://github.com/apps/giscus no repositório.
4. Em https://giscus.app preencha o repositório e copie `data-repo`, `data-repo-id`, `data-category` e `data-category-id` para `js/config.js`.
Enquanto não configurar, a área de comentários fica oculta.

## Testar no seu computador
Abrir o `index.html` com duplo clique **não funciona** (o navegador bloqueia a leitura do JSON). Use:
- VS Code → extensão **Live Server** → *Go Live*; ou
- terminal na pasta: `python -m http.server 8000` e abra http://localhost:8000
(No teste local, o endereço `/adm` direto não funciona; use `http://localhost:8000/#/adm`.)

## Imagens — revisar antes de apresentar
89 dos 95 alimentos usam fotos do serviço *loremflickr*, que sorteia fotos por palavra-chave e **pode mostrar imagem errada**. Se uma foto não carregar, o site mostra um emoji do alimento. Para fotos certas: coloque os arquivos em uma pasta `img/` (ex.: `img/morango.jpg`) e, no `/adm`, edite o alimento colocando `img/morango.jpg` no campo Imagem.


## Nova aba de comentários dos clientes
O menu **Comentários** permite registrar nome, nota de 1 a 5 estrelas e comentário. As avaliações ficam salvas no `localStorage` do navegador em que foram enviadas. Isso é útil para testar a interface, mas **não compartilha automaticamente as avaliações com outros visitantes ou dispositivos**. Para receber comentários reais de todos os clientes, será necessário conectar um serviço com backend (por exemplo, Firebase ou MongoDB com uma API) e configurar regras de segurança/moderação.
