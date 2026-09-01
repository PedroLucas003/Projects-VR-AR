// js/db.js
const CHAVE_DB = 'loja_armas_db';

// Função para iniciar com dados mockados se o LocalStorage estiver vazio
function iniciarMock() {
    if (!localStorage.getItem(CHAVE_DB)) {
        const mockData = [
            { id: Date.now().toString(), nome: 'Excalibur', tipo: 'espada', dano: 99 }
        ];
        localStorage.setItem(CHAVE_DB, JSON.stringify(mockData));
    }
}

// GET (Read): Retorna todas as armas
function lerArmas() {
    return JSON.parse(localStorage.getItem(CHAVE_DB)) || [];
}

// POST (Create): Cria um novo registro
function criarArma(arma) {
    const armas = lerArmas();
    arma.id = Date.now().toString(); // Gera um ID único
    armas.push(arma);
    localStorage.setItem(CHAVE_DB, JSON.stringify(armas));
}

// PUT / PATCH (Update): Atualiza os dados de uma arma específica
function atualizarArma(id, dadosAtualizados) {
    let armas = lerArmas();
    armas = armas.map(arma => arma.id === id ? { ...arma, ...dadosAtualizados } : arma);
    localStorage.setItem(CHAVE_DB, JSON.stringify(armas));
}

// DELETE (Delete): Remove a arma do banco
function deletarArma(id) {
    let armas = lerArmas();
    armas = armas.filter(arma => arma.id !== id);
    localStorage.setItem(CHAVE_DB, JSON.stringify(armas));
}


iniciarMock();