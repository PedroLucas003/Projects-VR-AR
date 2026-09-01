// js/scene.js
const formArma = document.getElementById('formArma');
const vitrine = document.getElementById('vitrine-armas');
const btnSalvar = document.getElementById('btnSalvar');

// Função principal para desenhar as armas do Banco na tela 3D
function renderizarCena() {
    // Limpa a vitrine atual
    vitrine.innerHTML = '';
    
    // GET (Read) - Pega os dados do db.js
    const armas = lerArmas();

    armas.forEach((arma, index) => {
        // Calcula a posição (um ao lado do outro)
        const posX = (index * 2) - (armas.length - 1); 
        
        // Cria um elemento (Entidade A-Frame)
        const armaEl = document.createElement('a-entity');
        armaEl.setAttribute('position', `${posX} 0 0`);
        
        // Define a forma geométrica baseada no tipo da arma
        let geometria = '';
        let cor = '';
        if(arma.tipo === 'espada') { geometria = 'primitive: box; height: 1.5; width: 0.2; depth: 0.2'; cor = '#CCCCCC'; }
        if(arma.tipo === 'machado') { geometria = 'primitive: cylinder; height: 1.2; radius: 0.3'; cor = '#8B4513'; }
        if(arma.tipo === 'magia') { geometria = 'primitive: sphere; radius: 0.5'; cor = '#9370DB'; }

        armaEl.setAttribute('geometry', geometria);
        armaEl.setAttribute('material', `color: ${cor}`);
        armaEl.setAttribute('class', 'interativel'); // Classe para o cursor reconhecer

        // Cria o texto flutuante com o nome e o dano
        const textoEl = document.createElement('a-text');
        textoEl.setAttribute('value', `${arma.nome}\nDano: ${arma.dano}`);
        textoEl.setAttribute('align', 'center');
        textoEl.setAttribute('position', '0 1.2 0');
        textoEl.setAttribute('color', '#4CAF50');
        
        // Interação: Clicar para EDITAR (PUT) ou DELETAR (DELETE)
        armaEl.addEventListener('click', () => {
            const acao = confirm(`O que deseja fazer com ${arma.nome}?\n[OK] = Editar\n[Cancelar] = Deletar`);
            if(acao) {
                // Preparar edição
                document.getElementById('armaId').value = arma.id;
                document.getElementById('nomeArma').value = arma.nome;
                document.getElementById('tipoArma').value = arma.tipo;
                document.getElementById('danoArma').value = arma.dano;
                btnSalvar.textContent = 'Atualizar Arma (PUT)';
            } else {
                // DELETE
                deletarArma(arma.id);
                renderizarCena();
            }
        });

        armaEl.appendChild(textoEl);
        vitrine.appendChild(armaEl);
    });
}

// Escuta o envio do formulário
formArma.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('armaId').value;
    const novaArma = {
        nome: document.getElementById('nomeArma').value,
        tipo: document.getElementById('tipoArma').value,
        dano: document.getElementById('danoArma').value
    };

    if (id) {
        // PUT
        atualizarArma(id, novaArma);
        btnSalvar.textContent = 'Criar Arma (POST)';
        document.getElementById('armaId').value = '';
    } else {
        // POST
        criarArma(novaArma);
    }

    formArma.reset();
    renderizarCena();
});

renderizarCena();