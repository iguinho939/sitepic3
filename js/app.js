/* ============================================================
   Vitrine do Hortifruti — site estático (funciona no GitHub Pages)
   Rotas (usam "#", então não precisam de servidor):
     #/                  -> catálogo
     #/alimento/<id>     -> página só daquele alimento (com receitas)
     #/sobre             -> sobre o projeto
     #/adm               -> painel administrativo (não aparece no menu)
   ============================================================ */

const DADOS_URL = 'data/alimentos.json';
const CHAVE_RASCUNHO = 'hf_rascunho_v2';
const CHAVE_SESSAO = 'hf_adm_ok';
const CHAVE_COMENTARIOS = 'hf_comentarios_clientes_v1';

const EMOJIS = {
  morango:'🍓', banana:'🍌', laranja:'🍊', abacate:'🥑', manga:'🥭', mirtilo:'🫐', maca:'🍎', pera:'🍐',
  uva:'🍇', melancia:'🍉', melao:'🍈', abacaxi:'🍍', mamao:'🧡', limao:'🍋', tangerina:'🍊', goiaba:'🍈',
  kiwi:'🥝', pessego:'🍑', ameixa:'🍑', cereja:'🍒', framboesa:'🍓', amora:'🫐', coco:'🥥', maracuja:'🍈',
  acerola:'🍒', caju:'🍎', jabuticaba:'🫐', pitaya:'🐉', caqui:'🍊', roma:'🍎', graviola:'🍈', cupuacu:'🥭',
  acai:'🫐', pinha:'🍈', nectarina:'🍑', figo:'🍇', physalis:'🟠', carambola:'⭐', seriguela:'🍑', cambuci:'🍈',
  alface:'🥬', couve:'🥬', espinafre:'🥬', rucula:'🥬', agriao:'🌿', acelga:'🥬', repolho:'🥬', 'repolho-roxo':'🥬',
  chicoria:'🥬', escarola:'🥬', almeirao:'🥬', 'mostarda-folhas':'🥬', salsinha:'🌿', cebolinha:'🌿', coentro:'🌿',
  manjericao:'🌿', hortela:'🌿', 'aipo-salsao':'🥬', 'alho-poro':'🧅', endivia:'🥬',
  tomate:'🍅', cenoura:'🥕', batata:'🥔', 'batata-doce':'🍠', mandioca:'🥔', mandioquinha:'🥔', beterraba:'🟣',
  abobora:'🎃', abobrinha:'🥒', berinjela:'🍆', pepino:'🥒', 'pimentao-verde':'🫑', 'pimentao-vermelho':'🫑',
  cebola:'🧅', alho:'🧄', brocolis:'🥦', 'couve-flor':'🥦', vagem:'🫛', ervilha:'🫛', milho:'🌽', quiabo:'🥒',
  chuchu:'🥒', nabo:'🥔', rabanete:'🌱', jilo:'🍆', palmito:'🌴', aspargo:'🌱', alcachofra:'🌱', cogumelo:'🍄',
  'abobora-cabotia':'🎃', inhame:'🍠', cara:'🍠', maxixe:'🥒', 'broto-de-feijao':'🌱', edamame:'🫛'
};
const EMOJI_CATEGORIA = { fruta: '🍎', verdura: '🥬', legume: '🥕' };
const NOME_CATEGORIA = { fruta: 'Fruta', verdura: 'Verdura', legume: 'Legume' };

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const semAcento = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = s => semAcento(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const emojiDe = a => EMOJIS[a.id] || EMOJI_CATEGORIA[a.categoria] || '🌿';
const linhas = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean);

const lerLS = (k, fb = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const gravarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const apagarLS = k => { try { localStorage.removeItem(k); } catch { /* ignora */ } };
const admLogado = () => { try { return sessionStorage.getItem(CHAVE_SESSAO) === '1'; } catch { return false; } };

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ---------- dados ---------- */
let alimentos = [];
let usandoRascunho = false;

async function carregarDados() {
  const r = await fetch(DADOS_URL, { cache: 'no-cache' });
  if (!r.ok) throw new Error('Não foi possível carregar data/alimentos.json');
  const publicado = (await r.json()).alimentos;
  const rascunho = admLogado() ? lerLS(CHAVE_RASCUNHO) : null;
  usandoRascunho = !!rascunho;
  alimentos = rascunho || publicado;
}
const acharAlimento = id => alimentos.find(a => a.id === id);

/* ---------- estado do catálogo (mantido ao voltar da página do alimento) ---------- */
const filtro = { categoria: 'todos', busca: '' };

/* ============================================================
   PÁGINAS
   ============================================================ */

/* ----- catálogo ----- */
function paginaHome() {
  document.title = 'Vitrine do Hortifruti | Hortifrúti';
  const cont = n => alimentos.filter(a => a.categoria === n).length;
  app.innerHTML = `
    <section class="hero">
      <span class="badge">🌿 Alimentação saudável</span>
      <h1>Vitrine do Hortifruti:<br><em>o poder dos alimentos</em></h1>
      <p>Clique em um alimento para ver seus nutrientes, benefícios e receitas.</p>
      <div class="stats">
        <div><strong>${alimentos.length}</strong><span>Alimentos</span></div>
        <div><strong>${cont('fruta')}</strong><span>Frutas</span></div>
        <div><strong>${cont('verdura')}</strong><span>Verduras</span></div>
        <div><strong>${cont('legume')}</strong><span>Legumes</span></div>
      </div>
    </section>
    <section class="wrap">
      <div class="toolbar">
        <input id="busca" type="search" placeholder="Buscar alimento…" aria-label="Buscar alimento" value="${esc(filtro.busca)}" autocomplete="off">
        <div class="filters" role="group" aria-label="Filtrar por categoria">
          ${[['todos', 'Todos'], ['fruta', 'Frutas'], ['verdura', 'Verduras'], ['legume', 'Legumes']]
            .map(([v, t]) => `<button class="chip ${filtro.categoria === v ? 'on' : ''}" data-cat="${v}" aria-pressed="${filtro.categoria === v}">${t}</button>`).join('')}
        </div>
      </div>
      <p class="count" id="contagem"></p>
      <div class="grid" id="grid"></div>
    </section>`;

  $('#busca').addEventListener('input', e => { filtro.busca = e.target.value; desenharGrade(); });
  app.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
    filtro.categoria = b.dataset.cat;
    app.querySelectorAll('[data-cat]').forEach(x => {
      x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b);
    });
    desenharGrade();
  }));
  desenharGrade();
}

function cartao(a) {
  return `
    <a class="card" href="#/alimento/${esc(a.id)}" aria-label="Abrir ${esc(a.nome)}">
      <div class="card-img">
        <span class="emoji" aria-hidden="true">${emojiDe(a)}</span>
        <img class="foto" src="${esc(a.imagem)}" alt="${esc(a.nome)}" loading="lazy" referrerpolicy="no-referrer">
        <span class="tag ${esc(a.categoria)}">${NOME_CATEGORIA[a.categoria] || esc(a.categoria)}</span>
      </div>
      <div class="card-body">
        <h3>${esc(a.nome)}</h3>
        <p>${esc(a.descricao)}</p>
        <span class="more">Ver detalhes e receita →</span>
      </div>
    </a>`;
}

function desenharGrade() {
  const q = semAcento(filtro.busca.trim());
  const lista = alimentos.filter(a =>
    (filtro.categoria === 'todos' || a.categoria === filtro.categoria) && semAcento(a.nome).includes(q));
  $('#grid').innerHTML = lista.map(cartao).join('') ||
    '<p class="empty">Nenhum alimento encontrado. Tente outro nome ou categoria.</p>';
  $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'alimento' : 'alimentos'}`;
}

/* ----- página de um alimento ----- */
function paginaAlimento(id) {
  const a = acharAlimento(id);
  if (!a) return pagina404();
  document.title = `${a.nome} | Vitrine do Hortifruti`;

  const relacionados = alimentos.filter(x => x.categoria === a.categoria && x.id !== a.id)
    .sort(() => Math.random() - .5).slice(0, 4);
  const receitas = a.receitas || [];

  app.innerHTML = `
    <article class="wrap detalhe">
      <a class="voltar" href="#/">← Voltar ao catálogo</a>

      <div class="detalhe-topo">
        <div class="detalhe-img">
          <span class="emoji" aria-hidden="true">${emojiDe(a)}</span>
          <img class="foto" src="${esc(a.imagem)}" alt="${esc(a.nome)}" referrerpolicy="no-referrer">
        </div>
        <div>
          <span class="tag inline ${esc(a.categoria)}">${NOME_CATEGORIA[a.categoria] || esc(a.categoria)}</span>
          <h1>${esc(a.nome)}</h1>
          <p class="lead">${esc(a.descricao)}</p>
          ${(a.nutrientes || []).length ? `<h2 class="rotulo">Nutrientes principais</h2>
            <div class="pills">${a.nutrientes.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div>` : ''}
          ${(a.beneficios || []).length ? `<h2 class="rotulo">Benefícios</h2>
            <ul class="beneficios">${a.beneficios.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>

      <section class="bloco">
        <h2>🍽️ ${receitas.length > 1 ? 'Receitas' : 'Receita'} com ${esc(a.nome.toLowerCase())}</h2>
        ${receitas.length ? receitas.map(r => `
          <div class="receita">
            <h3>${esc(r.nome)}</h3>
            <h4>Ingredientes</h4>
            <ul>${(r.ingredientes || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
            <h4>Modo de preparo</h4>
            <p>${esc(r.modoPreparo)}</p>
          </div>`).join('') : '<p class="muted">Este alimento ainda não tem receita cadastrada.</p>'}
      </section>

      <section class="bloco qr-bloco">
        <div id="qr" class="qr" aria-label="QR Code de ${esc(a.nome)}"></div>
        <div>
          <h2>📱 QR Code deste alimento</h2>
          <p class="muted">Escaneie para abrir esta página no celular.</p>
          <p class="link-box" id="link-pagina"></p>
          <div class="acoes">
            <button class="btn" id="baixar-qr">Baixar QR Code</button>
            <button class="btn ghost" id="copiar">Copiar link</button>
            <button class="btn ghost hidden" id="compartilhar">Compartilhar</button>
          </div>
        </div>
      </section>

      <div id="comentarios"></div>

      ${relacionados.length ? `
      <section class="bloco">
        <h2>Veja também</h2>
        <div class="grid pequeno">${relacionados.map(cartao).join('')}</div>
      </section>` : ''}
    </article>`;

  montarQR(a);
  montarComentarios(a);
}

function urlDoAlimento(a) {
  return `${location.origin}${location.pathname}#/alimento/${a.id}`;
}

let qrLibPromise;
function carregarQRLib() {
  if (window.QRCode) return Promise.resolve();
  qrLibPromise = qrLibPromise || new Promise((ok, falha) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = ok; s.onerror = () => falha(new Error('qr'));
    document.head.append(s);
  });
  return qrLibPromise;
}

function montarQR(a) {
  const url = urlDoAlimento(a);
  $('#link-pagina').textContent = url;
  $('#copiar').onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link copiado!'); }
    catch { toast('Não foi possível copiar. Copie o link manualmente.'); }
  };
  if (navigator.share) {
    const b = $('#compartilhar'); b.classList.remove('hidden');
    b.onclick = () => navigator.share({ title: a.nome, text: `Conheça ${a.nome} na Vitrine do Hortifruti`, url }).catch(() => {});
  }
  carregarQRLib().then(() => {
    const el = $('#qr'); if (!el) return;
    el.innerHTML = '';
    new QRCode(el, { text: url, width: 200, height: 200, colorDark: '#17482e', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    const bt = $('#baixar-qr'); if (!bt) return;
    bt.onclick = () => {
      const cv = el.querySelector('canvas'); if (!cv) return;
      const l = document.createElement('a'); l.download = `qr-${a.id}.png`; l.href = cv.toDataURL('image/png'); l.click();
    };
  }).catch(() => {
    $('#qr')?.remove();
    $('#baixar-qr')?.remove();
  });
}

function montarComentarios(a) {
  const g = (window.CONFIG || {}).giscus || {};
  if (!g.repo || !g.repoId || !g.categoryId) return; // não configurado: oculta
  const box = $('#comentarios');
  box.innerHTML = '<section class="bloco"><h2>💬 Comentários</h2><div id="giscus-area"></div></section>';
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js'; s.async = true; s.crossOrigin = 'anonymous';
  Object.entries({
    'data-repo': g.repo, 'data-repo-id': g.repoId, 'data-category': g.category, 'data-category-id': g.categoryId,
    'data-mapping': 'specific', 'data-term': `alimento:${a.id}`, 'data-strict': '1', 'data-reactions-enabled': '1',
    'data-emit-metadata': '0', 'data-input-position': 'top', 'data-theme': 'light', 'data-lang': 'pt'
  }).forEach(([k, v]) => s.setAttribute(k, v));
  $('#giscus-area').append(s);
}


/* ----- comentários e avaliações dos clientes ----- */
function obterComentarios() {
  const lista = lerLS(CHAVE_COMENTARIOS, []);
  return Array.isArray(lista) ? lista : [];
}

function paginaComentarios() {
  document.title = 'Comentários dos clientes | Vitrine do Hortifruti';
  const comentarios = obterComentarios().sort((a, b) => b.criadoEm - a.criadoEm);
  const media = comentarios.length
    ? (comentarios.reduce((s, c) => s + Number(c.nota || 0), 0) / comentarios.length).toFixed(1)
    : '—';

  app.innerHTML = `
    <section class="reviews-hero">
      <div class="wrap reviews-hero-inner">
        <span class="badge">💬 Opiniões de quem compra</span>
        <h1>A sua opinião <em>faz a diferença!</em></h1>
        <p>Conte como foi sua experiência e ajude outras pessoas a conhecerem nossa vitrine.</p>
        <div class="review-summary">
          <div class="review-score"><strong>${media}</strong><span>${comentarios.length ? '★'.repeat(Math.round(Number(media))) : '☆☆☆☆☆'}</span><small>${comentarios.length} avaliação(ões)</small></div>
          <div><b>Transparência e confiança</b><p>Leia avaliações e compartilhe sua experiência com a loja.</p></div>
        </div>
      </div>
    </section>
    <section class="wrap reviews-layout">
      <form class="review-form" id="form-comentario">
        <span class="section-kicker">DEIXE SUA AVALIAÇÃO</span>
        <h2>Como foi sua experiência?</h2>
        <p class="muted">Sua opinião é muito importante para nós.</p>
        <label for="cliente-nome">Seu nome</label>
        <input id="cliente-nome" name="nome" maxlength="50" placeholder="Ex.: Maria Silva" required>
        <label for="cliente-nota">Sua nota</label>
        <select id="cliente-nota" name="nota" required>
          <option value="">Selecione uma avaliação</option>
          <option value="5">★★★★★ — Excelente</option>
          <option value="4">★★★★☆ — Muito bom</option>
          <option value="3">★★★☆☆ — Bom</option>
          <option value="2">★★☆☆☆ — Regular</option>
          <option value="1">★☆☆☆☆ — Precisa melhorar</option>
        </select>
        <label for="cliente-comentario">Comentário</label>
        <textarea id="cliente-comentario" name="comentario" rows="5" maxlength="500" placeholder="Conte o que achou dos produtos e do atendimento..." required></textarea>
        <div class="review-form-bottom"><small>Máximo de 500 caracteres.</small><button class="btn" type="submit">Enviar avaliação →</button></div>
        <p class="review-notice">🔒 Não informe dados pessoais ou informações sensíveis no comentário.</p>
      </form>
      <div class="reviews-list">
        <div class="reviews-heading"><div><span class="section-kicker">VOZ DOS CLIENTES</span><h2>O que estão dizendo</h2></div><span class="reviews-total">${comentarios.length} avaliações</span></div>
        <div id="lista-comentarios">
          ${comentarios.length ? comentarios.map(c => `
            <article class="review-card">
              <div class="review-card-top"><div class="avatar-cliente">${esc((c.nome || 'C').trim().charAt(0).toUpperCase())}</div>
                <div class="review-author"><strong>${esc(c.nome)}</strong><small>${esc(c.data || '')}</small></div>
                <span class="review-stars" aria-label="${Number(c.nota)} de 5 estrelas">${'★'.repeat(Number(c.nota))}${'☆'.repeat(5 - Number(c.nota))}</span>
              </div>
              <p>${esc(c.comentario)}</p>
            </article>`).join('') : '<div class="reviews-empty"><span>🌱</span><h3>Seja o primeiro a avaliar!</h3><p>Compartilhe sua experiência com a gente.</p></div>'}
        </div>
      </div>
    </section>`;
  $('#form-comentario').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get('nome') || '').trim();
    const comentario = String(f.get('comentario') || '').trim();
    const nota = Number(f.get('nota'));
    if (nome.length < 2 || comentario.length < 3 || nota < 1 || nota > 5) {
      toast('Preencha seu nome, uma nota e um comentário válido.'); return;
    }
    const lista = obterComentarios();
    lista.push({
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      nome, nota, comentario,
      criadoEm: Date.now(),
      data: new Date().toLocaleDateString('pt-BR')
    });
    if (!gravarLS(CHAVE_COMENTARIOS, lista)) {
      toast('Não foi possível salvar a avaliação neste navegador.'); return;
    }
    toast('Obrigado! Sua avaliação foi registrada neste dispositivo.');
    paginaComentarios();
  });
}

/* ----- sobre / 404 ----- */
function paginaSobre() {
  document.title = 'Sobre | Vitrine do Hortifruti';
  app.innerHTML = `
    <section class="wrap texto">
      <a class="voltar" href="#/">← Voltar ao catálogo</a>
      <h1>Sobre o projeto</h1>
      <p>A <strong>Vitrine do Hortifruti</strong> é um catálogo educativo de hortifrúti. Cada alimento tem uma página própria com
      nutrientes, benefícios, receita e um QR Code que leva direto a ela — ideal para colocar em placas e bancas.</p>
      <p>As informações têm caráter educativo e <strong>não substituem</strong> a orientação de um nutricionista ou médico.</p>
      <p><a class="btn" href="#/">Explorar o catálogo</a></p>
    </section>`;
}

function pagina404() {
  document.title = 'Página não encontrada | Vitrine do Hortifruti';
  app.innerHTML = `
    <section class="wrap texto center">
      <div class="grande">🥕❓</div>
      <h1>Página não encontrada</h1>
      <p>Esse alimento ou endereço não existe.</p>
      <p><a class="btn" href="#/">Voltar ao catálogo</a></p>
    </section>`;
}

/* ============================================================
   ADMINISTRAÇÃO  (só aparece em  #/adm  — não há link no site)
   ============================================================
   Observação importante: o site é estático, então não existe
   "servidor" para guardar alterações. O painel edita um RASCUNHO
   neste navegador; para publicar, baixe o alimentos.json e envie
   para a pasta data/ do repositório no GitHub (veja o README).
   ============================================================ */
async function sha256(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function paginaAdm() {
  document.title = 'Administração | Vitrine do Hortifruti';
  if (!admLogado()) return admLogin();
  admPainel();
}

function admLogin() {
  app.innerHTML = `
    <section class="wrap estreito">
      <form class="painel" id="form-login">
        <h1>🔒 Administração</h1>
        <p class="muted">Área restrita.</p>
        <label>Senha<input id="senha" type="password" autocomplete="current-password" required autofocus></label>
        <button class="btn" type="submit">Entrar</button>
        <p class="erro hidden" id="erro-login">Senha incorreta.</p>
      </form>
    </section>`;
  $('#form-login').onsubmit = async e => {
    e.preventDefault();
    let ok = false;
    try { ok = (await sha256($('#senha').value)) === window.CONFIG.adminHash; }
    catch { toast('Seu navegador não permite verificar a senha (use https).'); return; }
    if (!ok) { $('#erro-login').classList.remove('hidden'); return; }
    try { sessionStorage.setItem(CHAVE_SESSAO, '1'); } catch { /* ignora */ }
    await carregarDados();
    admPainel();
  };
}

let admBusca = '';

function admPainel(editarId = null, novo = false) {
  const editando = novo ? { id: '', nome: '', categoria: 'fruta', imagem: '', descricao: '', nutrientes: [], beneficios: [], receitas: [{ nome: '', ingredientes: [], modoPreparo: '' }] }
    : editarId ? acharAlimento(editarId) : null;

  app.innerHTML = `
    <section class="wrap">
      <div class="adm-topo">
        <h1>⚙️ Administração</h1>
        <div class="acoes">
          <a class="btn ghost" href="#/">Ver site</a>
          <button class="btn ghost" id="sair">Sair</button>
        </div>
      </div>

      ${usandoRascunho ? '<div class="aviso">📝 Você tem <b>alterações não publicadas</b> (rascunho só neste navegador). Baixe o JSON e envie ao GitHub para publicar.</div>' : ''}

      <div class="painel publicar">
        <h2>Publicar alterações</h2>
        <ol>
          <li>Faça as alterações abaixo (adicionar, editar ou remover).</li>
          <li>Clique em <b>Baixar alimentos.json</b>.</li>
          <li>No GitHub, abra a pasta <code>data/</code>, envie o arquivo substituindo o antigo e faça o commit.</li>
          <li>Em ~1 minuto o site público estará atualizado.</li>
        </ol>
        <div class="acoes">
          <button class="btn" id="baixar-json">⬇ Baixar alimentos.json</button>
          <label class="btn ghost">Importar JSON<input type="file" id="importar" accept="application/json" hidden></label>
          <button class="btn ghost danger" id="descartar" ${usandoRascunho ? '' : 'disabled'}>Descartar rascunho</button>
        </div>
      </div>

      ${editando ? admFormulario(editando, novo) : `
      <div class="painel">
        <div class="adm-topo">
          <h2>Alimentos (${alimentos.length})</h2>
          <button class="btn" id="novo">+ Novo alimento</button>
        </div>
        <input id="adm-busca" type="search" placeholder="Filtrar lista…" value="${esc(admBusca)}">
        <div id="adm-lista"></div>
      </div>

      <details class="painel">
        <summary><b>Trocar a senha do /adm</b></summary>
        <p class="muted">Digite a nova senha, copie o código gerado e cole em <code>js/config.js</code> no campo <code>adminHash</code>.</p>
        <input id="nova-senha" type="text" placeholder="Nova senha">
        <code id="novo-hash" class="hash"></code>
      </details>`}
    </section>`;

  $('#sair').onclick = () => { try { sessionStorage.removeItem(CHAVE_SESSAO); } catch { /* */ } carregarDados().then(() => { location.hash = '#/'; roteador(); }); };
  $('#baixar-json').onclick = baixarJSON;
  $('#descartar').onclick = () => {
    if (!confirm('Descartar todas as alterações não publicadas?')) return;
    apagarLS(CHAVE_RASCUNHO); carregarDados().then(() => { toast('Rascunho descartado.'); admPainel(); });
  };
  $('#importar').onchange = async e => {
    try {
      const j = JSON.parse(await e.target.files[0].text());
      if (!Array.isArray(j.alimentos)) throw 0;
      salvarRascunho(j.alimentos); toast('JSON importado como rascunho.'); admPainel();
    } catch { toast('Arquivo inválido.'); }
  };

  if (editando) return admLigarFormulario(editando, novo);

  $('#novo').onclick = () => admPainel(null, true);
  $('#adm-busca').oninput = e => { admBusca = e.target.value; admLista(); };
  $('#nova-senha').oninput = async e => { $('#novo-hash').textContent = e.target.value ? await sha256(e.target.value) : ''; };
  admLista();
}

function admLista() {
  const q = semAcento(admBusca);
  $('#adm-lista').innerHTML = alimentos.filter(a => semAcento(a.nome).includes(q)).map(a => `
    <div class="adm-linha">
      <span class="emoji-p">${emojiDe(a)}</span>
      <span class="grow"><b>${esc(a.nome)}</b> <small class="muted">${NOME_CATEGORIA[a.categoria] || ''}</small></span>
      <a class="mini" href="#/alimento/${esc(a.id)}">Ver</a>
      <button class="mini" data-edit="${esc(a.id)}">Editar</button>
      <button class="mini danger" data-del="${esc(a.id)}">Remover</button>
    </div>`).join('') || '<p class="muted">Nada encontrado.</p>';
  $('#adm-lista').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => admPainel(b.dataset.edit));
  $('#adm-lista').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const a = acharAlimento(b.dataset.del);
    if (!confirm(`Remover "${a.nome}"?\n(Só será publicado quando você enviar o JSON ao GitHub.)`)) return;
    salvarRascunho(alimentos.filter(x => x.id !== a.id)); toast('Removido no rascunho.'); admPainel();
  });
}

function admBlocoReceita(r = { nome: '', ingredientes: [], modoPreparo: '' }) {
  return `
    <fieldset class="rec">
      <legend>Receita</legend>
      <label>Nome da receita<input name="r-nome" value="${esc(r.nome)}" required></label>
      <label>Ingredientes (um por linha)<textarea name="r-ing" rows="4" required>${esc((r.ingredientes || []).join('\n'))}</textarea></label>
      <label>Modo de preparo<textarea name="r-prep" rows="4" required>${esc(r.modoPreparo)}</textarea></label>
      <button type="button" class="mini danger" data-rm-rec>Remover esta receita</button>
    </fieldset>`;
}

function admFormulario(a, novo) {
  return `
    <form class="painel" id="form-alimento">
      <h2>${novo ? 'Novo alimento' : `Editar: ${esc(a.nome)}`}</h2>
      <div class="cols">
        <label>Nome<input name="nome" value="${esc(a.nome)}" required></label>
        <label>Categoria
          <select name="categoria">${Object.entries(NOME_CATEGORIA).map(([v, t]) => `<option value="${v}" ${a.categoria === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </label>
      </div>
      <label>Imagem (endereço https://… ou caminho como <code>img/morango.jpg</code>)
        <input name="imagem" value="${esc(a.imagem)}" required></label>
      <label>Descrição<textarea name="descricao" rows="3" required>${esc(a.descricao)}</textarea></label>
      <div class="cols">
        <label>Nutrientes (um por linha)<textarea name="nutrientes" rows="4">${esc((a.nutrientes || []).join('\n'))}</textarea></label>
        <label>Benefícios (um por linha)<textarea name="beneficios" rows="4">${esc((a.beneficios || []).join('\n'))}</textarea></label>
      </div>
      <div id="receitas-form">${(a.receitas?.length ? a.receitas : [undefined]).map(r => admBlocoReceita(r)).join('')}</div>
      <button type="button" class="btn ghost" id="add-rec">+ Adicionar outra receita</button>
      <div class="acoes fim">
        <button class="btn" type="submit">Salvar no rascunho</button>
        <button class="btn ghost" type="button" id="cancelar">Cancelar</button>
      </div>
    </form>`;
}

function admLigarFormulario(a, novo) {
  const f = $('#form-alimento');
  $('#cancelar').onclick = () => admPainel();
  $('#add-rec').onclick = () => $('#receitas-form').insertAdjacentHTML('beforeend', admBlocoReceita());
  f.addEventListener('click', e => {
    if (e.target.matches('[data-rm-rec]')) {
      if (f.querySelectorAll('.rec').length > 1) e.target.closest('.rec').remove();
      else toast('Deixe ao menos uma receita.');
    }
  });
  f.onsubmit = e => {
    e.preventDefault();
    const d = new FormData(f);
    const img = String(d.get('imagem')).trim();
    if (!/^https:\/\//i.test(img) && !/^[\w./-]+$/.test(img)) { toast('Imagem: use https://… ou um caminho como img/foto.jpg'); return; }
    const receitas = [...f.querySelectorAll('.rec')].map(r => ({
      nome: r.querySelector('[name=r-nome]').value.trim(),
      ingredientes: linhas(r.querySelector('[name=r-ing]').value),
      modoPreparo: r.querySelector('[name=r-prep]').value.trim()
    }));
    const item = {
      id: novo ? slug(d.get('nome')) : a.id,
      nome: String(d.get('nome')).trim(),
      categoria: d.get('categoria'),
      descricao: String(d.get('descricao')).trim(),
      nutrientes: linhas(d.get('nutrientes')),
      beneficios: linhas(d.get('beneficios')),
      imagem: img,
      receitas
    };
    if (novo && alimentos.some(x => x.id === item.id)) { toast('Já existe um alimento com esse nome.'); return; }
    salvarRascunho(novo ? [...alimentos, item] : alimentos.map(x => x.id === a.id ? item : x));
    toast('Salvo no rascunho!'); admPainel();
  };
}

function salvarRascunho(lista) {
  alimentos = lista; usandoRascunho = true;
  if (!gravarLS(CHAVE_RASCUNHO, lista)) toast('Atenção: o navegador não conseguiu guardar o rascunho.');
}

function baixarJSON() {
  const ordenado = [...alimentos].sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  const blob = new Blob([JSON.stringify({ versao: 2, alimentos: ordenado }, null, 2)], { type: 'application/json' });
  const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = 'alimentos.json'; l.click();
  setTimeout(() => URL.revokeObjectURL(l.href), 1000);
}

/* ============================================================
   ROTEADOR
   ============================================================ */
function roteador() {
  let h = location.hash.replace(/^#\/?/, '');
  // compatibilidade com QR Codes antigos:  #morango  ->  #/alimento/morango
  if (h && !h.includes('/') && !['sobre', 'adm', 'comentarios'].includes(h)) { location.replace(`#/alimento/${h}`); return; }

  const [rota, param] = h.split('/');
  document.querySelectorAll('[data-nav]').forEach(l =>
    l.classList.toggle('on', l.dataset.nav === (rota === 'sobre' ? 'sobre' : rota === 'comentarios' ? 'comentarios' : (!rota || rota === 'alimento') ? 'home' : '')));

  if (!rota) paginaHome();
  else if (rota === 'alimento') paginaAlimento(decodeURIComponent(param || ''));
  else if (rota === 'sobre') paginaSobre();
  else if (rota === 'comentarios') paginaComentarios();
  else if (rota === 'adm') paginaAdm();
  else pagina404();

  window.scrollTo(0, 0);
}

// foto que falhar (link quebrado) some e deixa o emoji aparecer
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG' && e.target.classList.contains('foto')) e.target.remove();
}, true);

window.addEventListener('hashchange', roteador);

carregarDados().then(roteador).catch(err => {
  app.innerHTML = `<section class="wrap texto center"><div class="grande">⚠️</div><h1>Não foi possível carregar</h1>
    <p>${esc(err.message)}</p>
    <p class="muted">Se você abriu o arquivo direto no computador, rode um servidor local (veja o README) — o navegador não deixa ler o JSON por <code>file://</code>.</p></section>`;
});
