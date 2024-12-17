const apiURL = "http://localhost:3000/produtos";

const formulario = document.getElementById('formulario-produto');
const nomeProdutoInput = document.getElementById('nome-produto');
const precoProdutoInput = document.getElementById('preco-produto');
const imagemProdutoInput = document.getElementById('imagem-produto');
const produtosLista = document.getElementById('produtos-lista');
const mensagemVazia = document.getElementById('mensagem-vazia');
const btnLimparFormulario = document.getElementById('btn-limpar-formulario');
const mensagemErro = document.getElementById('mensagem-erro'); 

function exibirErro(mensagem) {
  mensagemErro.textContent = mensagem;
  mensagemErro.style.display = 'block';
}

function limparErros() {
  mensagemErro.textContent = '';
  mensagemErro.style.display = 'none';
}

function renderizarProdutos(produtos) {
  produtosLista.innerHTML = "";
  if (produtos.length === 0) {
    mensagemVazia.style.display = 'block';
  } else {
    mensagemVazia.style.display = 'none';
    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto" />
        <div class="card-container--info">
          <h2 class="nome-produto">${produto.nome}</h2>
          <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
          <button class="btn-excluir" data-id="${produto.id}">
            <img src="./img/excluir.png" alt="Excluir produto" />
          </button>
        </div>`;
      produtosLista.appendChild(card);
    });
  }
}

async function buscarProdutos() {
  try {
    const response = await fetch(apiURL);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

async function adicionarProduto(produto) {
  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(produto)
    });
    if (response.ok) {
      buscarProdutos().then(renderizarProdutos);
    }
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
  }
}

async function excluirProduto(id) {
  try {
    const response = await fetch(`${apiURL}/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      buscarProdutos().then(renderizarProdutos);
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
  }
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  limparErros();

  const nome = nomeProdutoInput.value.trim().replace(/^\w/, c => c.toUpperCase());

  let preco = precoProdutoInput.value.replace(',', '.');
  preco = parseFloat(preco);

  const imagem = imagemProdutoInput.value.trim();
  const imagemValida = /\.(jpg|jpeg|png|gif)$/i.test(imagem);

  if (!imagemValida) {
    exibirErro("Por favor, insira uma URL de imagem válida (jpg, jpeg, png ou gif).");
    return;
  }

  if (!nome || isNaN(preco) || preco <= 0) {
    exibirErro("Por favor, preencha os campos corretamente.");
    return;
  }

  const produtos = await buscarProdutos();

  const nomeExiste = produtos.some(produto => produto.nome === nome);
  if (nomeExiste) {
    exibirErro("Já existe um produto com este nome. Escolha outro.");
    return;
  }

  const novoProduto = { nome, preco, imagem };
  adicionarProduto(novoProduto);
  formulario.reset();
});

produtosLista.addEventListener('click', (e) => {
  const btnExcluir = e.target.closest('.btn-excluir');
  if (btnExcluir) {
    const id = btnExcluir.dataset.id;
    excluirProduto(id);
  }
});

btnLimparFormulario.addEventListener('click', (e) => {
  e.preventDefault();
  limparErros(); 
  nomeProdutoInput.value = '';
  precoProdutoInput.value = '';
  imagemProdutoInput.value = '';
});

buscarProdutos().then(renderizarProdutos);
