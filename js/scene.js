// js/scene.js — Forja das Almas VR (Dark Fantasy)

const formArma    = document.getElementById('formArma');
const vitrine     = document.getElementById('vitrine-armas');
const btnSalvar   = document.getElementById('btnSalvar');
const btnLabel    = document.getElementById('btnLabel');
const btnVerb     = document.getElementById('btnVerb');
const btnCancelar = document.getElementById('btnCancelar');
const listaEl     = document.getElementById('lista-armas');
const contadorEl  = document.getElementById('contador-armas');
const hudMao      = document.getElementById('hud-mao');
const hudNome     = document.getElementById('hud-mao-nome');
const hudMeta     = document.getElementById('hud-mao-meta');
const btnDevolver = document.getElementById('btnDevolver');
const dicaEl      = document.getElementById('dica-interacao');

let armaEquipadaId = null;

const DICA_LIVRE  = 'WASD para andar · clique numa arma para pega-la · Q para devolver';
const DICA_PUNHO  = 'Arma em punho · Q ou o botao para devolver a vitrine';

// Porta = onde a arma senta na camera (sem depender dos bracos).
// Cada tipo ocupa um canto/angulo diferente da tela.
const EMPUNHADURA = {
    espada: {
        maos: 1,
        porta: { position: '0.40 -0.06 -0.52', rotation: '6 -32 4' },
        scale: 0.30,
        grip:  { x: 0, y: 0.05, z: 0 },
        grip2: null
    },
    martelo: {
        maos: 2,
        porta: { position: '0.32 -0.10 -0.55', rotation: '10 40 -8' },
        scale: 0.22,
        grip:  { x: 0, y: -0.10, z: 0 },
        grip2: { x: 0, y: -0.32, z: 0 }
    },
    foice: {
        maos: 2,
        porta: { position: '0.20 -0.10 -0.52', rotation: '-18 72 -12' },
        scale: 0.24,
        grip:  { x: 0, y: -0.10, z: 0 },
        grip2: { x: 0, y: 0.40, z: 0 }
    },
    lanca: {
        maos: 2,
        porta: { position: '0.36 -0.16 -0.50', rotation: '-52 22 6' },
        scale: 0.22,
        grip:  { x: 0, y: -0.35, z: 0 },
        grip2: { x: 0, y: 0.40, z: 0 }
    }
};

// ─── Paleta dark fantasy por tipo ───────────────────────
const TEMAS = {
    espada: {
        metal:     '#8a8878',
        detalhe:   '#b8a860',
        cabo:      '#3a2010',
        label:     'Espada Bastarda',
        cor_texto: '#b0a070'
    },
    martelo: {
        metal:     '#5a5248',
        detalhe:   '#7a6a50',
        cabo:      '#2a1808',
        label:     'Martelo de Guerra',
        cor_texto: '#907858'
    },
    foice: {
        metal:     '#606060',
        detalhe:   '#8a2020',
        cabo:      '#2a1a0a',
        label:     'Foice das Almas',
        cor_texto: '#905040'
    },
    lanca: {
        metal:     '#7a7060',
        detalhe:   '#4a6a30',
        cabo:      '#3a2810',
        label:     'Lança do Pântano',
        cor_texto: '#607848'
    }
};

// ─── Sanitiza texto para a-text (não suporta acentos) ───
function sem(str) {
    return str
        .replace(/[áàãâä]/gi, 'a')
        .replace(/[éèêë]/gi,  'e')
        .replace(/[íìîï]/gi,  'i')
        .replace(/[óòõôö]/gi, 'o')
        .replace(/[úùûü]/gi,  'u')
        .replace(/[ç]/gi,     'c')
        .replace(/[ñ]/gi,     'n');
}

// ─── Helpers de geometria ────────────────────────────────

function box(pai, pos, size, cor, emissive = cor, ei = 0) {
    const el = document.createElement('a-box');
    el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    el.setAttribute('width',  size.w);
    el.setAttribute('height', size.h);
    el.setAttribute('depth',  size.d || size.w);
    el.setAttribute('material', `color: ${cor}; emissive: ${emissive}; emissiveIntensity: ${ei}; roughness: 0.9; metalness: 0.3`);
    pai.appendChild(el);
    return el;
}

function cyl(pai, pos, r, h, cor) {
    const el = document.createElement('a-cylinder');
    el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    el.setAttribute('radius', r);
    el.setAttribute('height', h);
    el.setAttribute('material', `color: ${cor}; roughness: 1; metalness: 0.1`);
    pai.appendChild(el);
    return el;
}

// ─── Geometrias pixel das armas ─────────────────────────

function criarEspada(t) {
    const g = document.createElement('a-entity');

    box(g, {x:0,     y:0.85, z:0}, {w:0.22, h:0.40, d:0.09}, t.metal);
    box(g, {x:0,     y:1.18, z:0}, {w:0.18, h:0.30, d:0.08}, t.metal);
    box(g, {x:0,     y:1.45, z:0}, {w:0.14, h:0.28, d:0.07}, t.metal);
    box(g, {x:0,     y:1.68, z:0}, {w:0.09, h:0.22, d:0.06}, t.metal);
    box(g, {x:0,     y:1.84, z:0}, {w:0.05, h:0.16, d:0.05}, t.metal);
    box(g, {x:0.02,  y:1.10, z:0}, {w:0.03, h:0.85, d:0.02}, t.detalhe, t.detalhe, 0.05);
    box(g, {x:-0.22, y:0.52, z:0}, {w:0.38, h:0.10, d:0.10}, t.detalhe);
    box(g, {x: 0.12, y:0.52, z:0}, {w:0.14, h:0.10, d:0.10}, t.detalhe);
    box(g, {x:-0.34, y:0.52, z:0}, {w:0.08, h:0.18, d:0.08}, t.detalhe, t.detalhe, 0.06);
    box(g, {x:0,     y:0.22, z:0}, {w:0.11, h:0.14, d:0.11}, t.cabo);
    box(g, {x:0,     y:0.07, z:0}, {w:0.11, h:0.14, d:0.11}, t.cabo);
    box(g, {x:0,     y:-0.08,z:0}, {w:0.11, h:0.14, d:0.11}, t.cabo);
    box(g, {x:0,     y:-0.26,z:0}, {w:0.18, h:0.10, d:0.12}, t.detalhe);
    box(g, {x:0,     y:-0.34,z:0}, {w:0.12, h:0.08, d:0.10}, t.detalhe, t.detalhe, 0.04);

    return g;
}

function criarMartelo(t) {
    const g = document.createElement('a-entity');

    box(g, {x:0,     y:-0.32, z:0}, {w:0.12, h:0.38, d:0.12}, t.cabo);
    box(g, {x:0,     y: 0.00, z:0}, {w:0.12, h:0.38, d:0.12}, t.cabo);
    box(g, {x:0,     y: 0.32, z:0}, {w:0.12, h:0.38, d:0.12}, t.cabo);
    box(g, {x:0,     y: 0.00, z:0}, {w:0.16, h:0.10, d:0.16}, t.detalhe);
    box(g, {x:0.08,  y:0.72,  z:0}, {w:0.65, h:0.52, d:0.42}, t.metal);
    box(g, {x:0.30,  y:0.72,  z:0}, {w:0.22, h:0.56, d:0.44}, t.metal);
    box(g, {x:-0.30, y:0.76,  z:0}, {w:0.12, h:0.24, d:0.20}, t.metal);
    box(g, {x:0.30,  y:0.88,  z:0.22}, {w:0.18, h:0.04, d:0.04}, t.detalhe, t.detalhe, 0.05);
    box(g, {x:0.30,  y:0.72,  z:0.22}, {w:0.18, h:0.04, d:0.04}, t.detalhe, t.detalhe, 0.05);
    box(g, {x:0.30,  y:0.56,  z:0.22}, {w:0.18, h:0.04, d:0.04}, t.detalhe, t.detalhe, 0.05);
    box(g, {x:0.14,  y:1.04,  z:0}, {w:0.30, h:0.12, d:0.30}, t.metal);
    box(g, {x:0.14,  y:1.14,  z:0}, {w:0.16, h:0.10, d:0.16}, t.detalhe);

    return g;
}

function criarFoice(t) {
    const g = document.createElement('a-entity');

    box(g, {x:0.06,  y:-0.60, z:0}, {w:0.10, h:0.34, d:0.10}, t.cabo);
    box(g, {x:0.04,  y:-0.28, z:0}, {w:0.10, h:0.34, d:0.10}, t.cabo);
    box(g, {x:0.02,  y: 0.04, z:0}, {w:0.10, h:0.34, d:0.10}, t.cabo);
    box(g, {x:0.00,  y: 0.36, z:0}, {w:0.10, h:0.34, d:0.10}, t.cabo);
    box(g, {x:-0.02, y: 0.68, z:0}, {w:0.10, h:0.34, d:0.10}, t.cabo);
    box(g, {x:0.08,  y:-0.80, z:0}, {w:0.14, h:0.10, d:0.14}, t.metal);
    box(g, {x:0.08,  y:-0.92, z:0}, {w:0.07, h:0.14, d:0.07}, t.detalhe, t.detalhe, 0.04);
    box(g, {x:-0.04, y:0.90,  z:0}, {w:0.20, h:0.12, d:0.14}, t.metal);
    box(g, {x:0.28,  y:1.06,  z:0}, {w:0.64, h:0.10, d:0.09}, t.metal);
    box(g, {x:0.54,  y:1.02,  z:0}, {w:0.14, h:0.10, d:0.09}, t.metal);
    box(g, {x:0.56,  y:0.90,  z:0}, {w:0.12, h:0.24, d:0.08}, t.metal);
    box(g, {x:0.60,  y:0.72,  z:0}, {w:0.10, h:0.20, d:0.07}, t.metal);
    box(g, {x:0.56,  y:0.56,  z:0}, {w:0.08, h:0.16, d:0.06}, t.metal);
    box(g, {x:0.62,  y:1.00,  z:0}, {w:0.04, h:0.90, d:0.04}, t.detalhe, t.detalhe, 0.06);
    box(g, {x:-0.30, y:1.06,  z:0}, {w:0.22, h:0.10, d:0.09}, t.metal);
    box(g, {x:-0.38, y:0.96,  z:0}, {w:0.08, h:0.18, d:0.07}, t.detalhe, t.detalhe, 0.05);

    return g;
}

function criarLanca(t) {
    const g = document.createElement('a-entity');

    cyl(g, {x:0, y:-0.20, z:0}, 0.055, 1.60, t.cabo);
    box(g, {x:0,     y: 0.20, z:0}, {w:0.12, h:0.08, d:0.12}, t.detalhe);
    box(g, {x:0,     y:-0.30, z:0}, {w:0.12, h:0.08, d:0.12}, t.detalhe);
    box(g, {x:0,     y:0.65,  z:0}, {w:0.16, h:0.14, d:0.16}, t.metal);
    box(g, {x:0,     y:0.74,  z:0}, {w:0.13, h:0.06, d:0.13}, t.metal);
    box(g, {x:0,     y:0.88,  z:0}, {w:0.18, h:0.18, d:0.09}, t.metal);
    box(g, {x:0,     y:1.04,  z:0}, {w:0.14, h:0.18, d:0.08}, t.metal);
    box(g, {x:0,     y:1.20,  z:0}, {w:0.10, h:0.16, d:0.07}, t.metal);
    box(g, {x:0,     y:1.34,  z:0}, {w:0.07, h:0.14, d:0.05}, t.metal);
    box(g, {x:0,     y:1.46,  z:0}, {w:0.04, h:0.14, d:0.04}, t.metal);
    box(g, {x:0,     y:1.15,  z:0}, {w:0.02, h:0.70, d:0.02}, t.detalhe, t.detalhe, 0.08);
    box(g, {x:-0.16, y:0.92,  z:0}, {w:0.14, h:0.08, d:0.06}, t.metal);
    box(g, {x: 0.16, y:0.92,  z:0}, {w:0.14, h:0.08, d:0.06}, t.metal);
    box(g, {x:0,     y:-1.02, z:0}, {w:0.10, h:0.10, d:0.10}, t.metal);
    box(g, {x:0,     y:-1.12, z:0}, {w:0.06, h:0.12, d:0.06}, t.detalhe);

    return g;
}

function criarGeoArma(tipo) {
    const t = TEMAS[tipo] || TEMAS.espada;
    if (tipo === 'espada')  return criarEspada(t);
    if (tipo === 'martelo') return criarMartelo(t);
    if (tipo === 'foice')   return criarFoice(t);
    if (tipo === 'lanca')   return criarLanca(t);
    return criarEspada(t);
}

// ─── Viewmodel: so a arma, angulo por tipo ──────────────

function montarPersonagem() {
    const raiz = document.getElementById('bracos-personagem');
    if (!raiz || raiz.childElementCount) return;
    const porta = document.createElement('a-entity');
    porta.setAttribute('id', 'porta-arma');
    porta.setAttribute('visible', 'false');
    raiz.appendChild(porta);
}

function setPose(el, pose) {
    if (!el || !pose) return;
    el.removeAttribute('animation__pos');
    el.removeAttribute('animation__rot');
    el.setAttribute('position', pose.position);
    el.setAttribute('rotation', pose.rotation);
}

function esconderViewmodel() {
    const porta = document.getElementById('porta-arma');
    if (porta) porta.setAttribute('visible', 'false');
    pararBalanceio();
}

function iniciarBalanceio() {
    const raiz = document.getElementById('bracos-personagem');
    if (!raiz) return;
    raiz.removeAttribute('animation__bob');
    raiz.setAttribute('position', '0 0 0');
    raiz.setAttribute('animation__bob',
        'property: position; from: 0 -0.016 0; to: 0 0.016 0; dir: alternate; dur: 1700; easing: easeInOutSine; loop: true');
}

function pararBalanceio() {
    const raiz = document.getElementById('bracos-personagem');
    if (!raiz) return;
    raiz.removeAttribute('animation__bob');
    raiz.setAttribute('position', '0 0 0');
}

function slotVitrine(id) {
    const grupo = vitrine.querySelector(`[data-arma-id="${id}"]`);
    return grupo ? grupo.parentElement : null;
}

function setSlotVitrine(id, visivel) {
    const slot = slotVitrine(id);
    if (slot) slot.setAttribute('visible', visivel ? 'true' : 'false');
}

function limparMao() {
    const antiga = document.getElementById('arma-equipada');
    if (antiga) antiga.remove();
}

function montarArmaNaMao(arma) {
    limparMao();
    const porta = document.getElementById('porta-arma');
    if (!porta) return;

    const pose = EMPUNHADURA[arma.tipo] || EMPUNHADURA.espada;
    const s = pose.scale;
    const g = pose.grip;

    porta.setAttribute('visible', 'true');
    setPose(porta, pose.porta);

    const held = document.createElement('a-entity');
    held.setAttribute('id', 'arma-equipada');
    held.setAttribute('position', `${-g.x * s} ${-g.y * s} ${-g.z * s}`);
    held.setAttribute('scale', `${s} ${s} ${s}`);
    held.appendChild(criarGeoArma(arma.tipo));
    porta.appendChild(held);

    iniciarBalanceio();
}

function atualizarHudMao(arma) {
    if (!arma) {
        hudMao.classList.remove('visivel');
        dicaEl.textContent = DICA_LIVRE;
        return;
    }
    const t = TEMAS[arma.tipo] || TEMAS.espada;
    const pose = EMPUNHADURA[arma.tipo] || EMPUNHADURA.espada;
    const maos = pose.maos === 1 ? 'uma mao' : 'duas maos';
    hudNome.textContent = arma.nome;
    hudMeta.textContent = `${t.label}  ·  ${arma.dano} dmg  ·  ${maos}`;
    hudMao.classList.add('visivel');
    dicaEl.textContent = DICA_PUNHO;
}

function pegarArma(arma) {
    if (!arma) return;
    if (armaEquipadaId === arma.id) return;

    if (armaEquipadaId) setSlotVitrine(armaEquipadaId, true);

    armaEquipadaId = arma.id;
    setSlotVitrine(arma.id, false);
    montarArmaNaMao(arma);
    atualizarHudMao(arma);
    renderizarLista(lerArmas());
}

function soltarArma() {
    if (!armaEquipadaId) return;
    setSlotVitrine(armaEquipadaId, true);
    armaEquipadaId = null;
    limparMao();
    esconderViewmodel();
    atualizarHudMao(null);
    renderizarLista(lerArmas());
}

function sincronizarMao() {
    if (!armaEquipadaId) return;
    const arma = lerArmas().find(a => a.id === armaEquipadaId);
    if (!arma) {
        armaEquipadaId = null;
        limparMao();
        esconderViewmodel();
        atualizarHudMao(null);
        return;
    }
    setSlotVitrine(arma.id, false);
    montarArmaNaMao(arma);
    atualizarHudMao(arma);
}

// ─── Montar entidade completa na cena ───────────────────

function criarEntidadeArma(arma, posX) {
    const t = TEMAS[arma.tipo] || TEMAS.espada;

    const wrapper = document.createElement('a-entity');
    wrapper.setAttribute('position', `${posX} 0 0`);
    wrapper.setAttribute('animation',
        `property: position; to: ${posX} 0.14 0; dir: alternate; dur: 2800; easing: easeInOutSine; loop: true`);

    const grupo = document.createElement('a-entity');
    grupo.setAttribute('class', 'interativel');
    grupo.setAttribute('rotation', '0 -15 0');
    grupo.setAttribute('animation__rot',
        'property: rotation; from: 0 -20 0; to: 0 20 0; dir: alternate; dur: 5000; easing: easeInOutSine; loop: true');

    grupo.appendChild(criarGeoArma(arma.tipo));

    const pool = document.createElement('a-circle');
    pool.setAttribute('position', '0 -0.82 0');
    pool.setAttribute('rotation', '-90 0 0');
    pool.setAttribute('radius', '0.3');
    pool.setAttribute('material', `color: ${t.detalhe}; opacity: 0.12; transparent: true`);
    grupo.appendChild(pool);

    const textoNome = document.createElement('a-text');
    textoNome.setAttribute('value', sem(arma.nome).toUpperCase());
    textoNome.setAttribute('align', 'center');
    textoNome.setAttribute('position', '0 1.55 0');
    textoNome.setAttribute('color', t.cor_texto);
    textoNome.setAttribute('width', '2.8');
    grupo.appendChild(textoNome);

    const textoDano = document.createElement('a-text');
    textoDano.setAttribute('value', `DMG  ${arma.dano}`);
    textoDano.setAttribute('align', 'center');
    textoDano.setAttribute('position', '0 1.34 0');
    textoDano.setAttribute('color', '#7a3a14');
    textoDano.setAttribute('width', '2.2');
    grupo.appendChild(textoDano);

    const textoTipo = document.createElement('a-text');
    textoTipo.setAttribute('value', sem(t.label));
    textoTipo.setAttribute('align', 'center');
    textoTipo.setAttribute('position', '0 -1.05 0');
    textoTipo.setAttribute('color', '#3a2a14');
    textoTipo.setAttribute('width', '2.0');
    grupo.appendChild(textoTipo);

    // Guarda o id no elemento e busca a arma do localStorage no click
    // evita problema de referência capturada pelo closure
    grupo.dataset.armaId = arma.id;
    grupo.addEventListener('click', e => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.armaId;
        const armaAtual = lerArmas().find(a => a.id === id);
        if (armaAtual) pegarArma(armaAtual);
    });
    grupo.addEventListener('mouseenter', () => {
        const cursor = document.querySelector('a-cursor');
        if (cursor) cursor.setAttribute('color', '#e8c040');
    });
    grupo.addEventListener('mouseleave', () => {
        const cursor = document.querySelector('a-cursor');
        if (cursor) cursor.setAttribute('color', '#c8860a');
    });

    wrapper.appendChild(grupo);
    return wrapper;
}

// ─── Renderizar cena 3D ─────────────────────────────────

function renderizarCena() {
    vitrine.innerHTML = '';
    const armas = lerArmas(); // GET

    armas.forEach((arma, i) => {
        const total = armas.length;
        const espc  = Math.min(2.6, 16 / Math.max(total, 1));
        const posX  = (i * espc) - ((total - 1) * espc / 2);
        vitrine.appendChild(criarEntidadeArma(arma, posX));
    });

    renderizarLista(armas);
    sincronizarMao();
}

// ─── Lista 2D no painel ─────────────────────────────────

function renderizarLista(armas) {
    contadorEl.textContent = armas.length;
    listaEl.innerHTML = '';

    if (armas.length === 0) {
        listaEl.innerHTML =
            '<div style="font-size:0.6rem;color:#3a2814;padding:10px 0;text-align:center;font-style:italic">Nenhuma arma forjada</div>';
        return;
    }

    armas.forEach(arma => {
        const t    = TEMAS[arma.tipo] || TEMAS.espada;
        const item = document.createElement('div');
        item.className = 'lista-item';
        const emPunho = arma.id === armaEquipadaId;
        if (emPunho) item.classList.add('em-punho');
        item.innerHTML = `
            <div class="lista-item-info">
                <div class="lista-item-nome">${arma.nome}${emPunho ? '<span class="lista-item-badge">EM PUNHO</span>' : ''}</div>
                <div class="lista-item-meta">${t.label}</div>
            </div>
            <div class="lista-item-dano">${arma.dano} dmg</div>
            <div class="lista-item-acoes">
                <button class="btn-edit" title="Editar">✎</button>
                <button class="btn-del"  title="Deletar">✕</button>
            </div>`;

        item.addEventListener('click', () => {
            if (armaEquipadaId === arma.id) soltarArma();
            else pegarArma(arma);
        });
        item.querySelector('.btn-edit').addEventListener('click', e => {
            e.stopPropagation();
            fillForm(arma);
        });
        item.querySelector('.btn-del').addEventListener('click', e => {
            e.stopPropagation();
            if (confirm(`Destruir "${arma.nome}"?`)) {
                if (armaEquipadaId === arma.id) soltarArma();
                deletarArma(arma.id); // DELETE
                renderizarCena();
            }
        });

        listaEl.appendChild(item);
    });
}

// ─── Formulário ─────────────────────────────────────────

function fillForm(arma) {
    document.getElementById('armaId').value  = arma.id;
    document.getElementById('nomeArma').value = arma.nome;
    document.getElementById('tipoArma').value = arma.tipo;
    document.getElementById('danoArma').value = arma.dano;
    btnLabel.textContent = 'Atualizar Arma';
    btnVerb.textContent  = 'PUT';
    btnSalvar.classList.add('modo-put');
    btnCancelar.style.display = 'block';
    document.getElementById('nomeArma').focus();
}

function resetForm() {
    formArma.reset();
    document.getElementById('armaId').value = '';
    btnLabel.textContent = 'Forjar Arma';
    btnVerb.textContent  = 'POST';
    btnSalvar.classList.remove('modo-put');
    btnCancelar.style.display = 'none';
}

formArma.addEventListener('submit', e => {
    e.preventDefault();
    const id    = document.getElementById('armaId').value;
    const dados = {
        nome: document.getElementById('nomeArma').value.trim(),
        tipo: document.getElementById('tipoArma').value,
        dano: parseInt(document.getElementById('danoArma').value, 10)
    };
    if (id) atualizarArma(id, dados); // PUT
    else    criarArma(dados);         // POST
    resetForm();
    renderizarCena();
});

btnCancelar.addEventListener('click', resetForm);

btnDevolver.addEventListener('click', soltarArma);

window.addEventListener('keydown', e => {
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'q' || e.key === 'Q') soltarArma();
});

function setMovimento(ligado) {
    const cam = document.getElementById('camera-jogador');
    if (cam) cam.setAttribute('wasd-controls', 'enabled', ligado);
}

document.querySelectorAll('#ui-container input, #ui-container select, #ui-container textarea').forEach(el => {
    el.addEventListener('focus', () => setMovimento(false));
    el.addEventListener('blur',  () => setMovimento(true));
});

AFRAME.registerComponent('limites-loja', {
    tick: function () {
        const p = this.el.object3D.position;
        p.x = Math.max(-9.5, Math.min(9.5, p.x));
        p.z = Math.max(-7.5, Math.min(4.5, p.z));
        p.y = 1.6;
    }
});

// ─── INIT ────────────────────────────────────────────────
function iniciarCena() {
    montarPersonagem();
    document.getElementById('camera-jogador').setAttribute('limites-loja', '');
    renderizarCena();
}

const sceneEl = document.querySelector('a-scene');
if (sceneEl.hasLoaded) iniciarCena();
else sceneEl.addEventListener('loaded', iniciarCena);