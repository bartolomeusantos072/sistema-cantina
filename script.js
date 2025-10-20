// -----------------------------
// CONSTANTES DE API
// -----------------------------
const API_COZINHEIRAS = "https://api-cantina-storage.vercel.app/cozinheiras";
const API_CARDAPIOS = "https://api-cantina-storage.vercel.app/cardapios";

// -----------------------------
// LOGIN E CADASTRO DE COZINHEIRAS
// -----------------------------

async function loginCozinheira(email, senha) {
  try {
    const res = await fetch(API_COZINHEIRAS);
    const cozinheiras = await res.json();

    const user = cozinheiras.find(c => c.email === email && c.senha === senha);
    if (user) {
      localStorage.setItem("cozinheiraId", user.id);
      localStorage.setItem("cozinheiraNome", user.nome);
      alert("Login realizado com sucesso!");
      window.location.href = "sistema.html";
    } else {
      alert("Usuário ou senha incorretos!");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Ocorreu um erro ao fazer login.");
  }
}

async function cadastrarCozinheira(nome, email, senha) {
  try {
    const res = await fetch(API_COZINHEIRAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
    if (res.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "index.html";
    } else {
      alert("Erro ao cadastrar cozinheira!");
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Ocorreu um erro ao cadastrar.");
  }
}

// -----------------------------
// FUNÇÕES DE CARDÁPIO
// -----------------------------

async function listarCardapios() {
  try {
    const res = await fetch(API_CARDAPIOS);
    const cardapios = await res.json();
    renderTabelaCardapios(cardapios);
  } catch (error) {
    console.error("Erro ao listar cardápios:", error);
    alert("Ocorreu um erro ao carregar o cardápio.");
  }
}

// Renderiza a tabela com refeição e lanche
function renderTabelaCardapios(cardapios) {
  const tabela = document.querySelector("table");
  tabela.innerHTML = `
    <tr>
      <th>Turno</th>
      <th>Data</th>
      <th>Refeição</th>
      <th>Lanche</th>
      <th>Editar</th>
      <th>Excluir</th>
    </tr>
  `;

  cardapios.forEach(cardapio => {
    const tr = document.createElement("tr");
    const dataFormatada = new Date(cardapio.data).toLocaleDateString("pt-BR");

    // Refeição principal
    const refeicaoItens = cardapio.refeicao?.itens?.join(", ") || "-";
    const refeicaoBebidas = cardapio.refeicao?.bebida?.join(", ") || "-";
    const refeicaoImgs = (cardapio.refeicao?.img || []).map(url => `<img src="${url}" alt="img" width="50">`).join(" ");

    // Lanche (opcional)
    let lancheConteudo = "-";
    if (cardapio.lanche) {
      const lancheItens = cardapio.lanche.itens.join(", ");
      const lancheBebidas = cardapio.lanche.bebida.join(", ");
      const lancheImgs = (cardapio.lanche.img || []).map(url => `<img src="${url}" alt="img" width="50">`).join(" ");
      lancheConteudo = `<b>${cardapio.lanche.titulo} (${cardapio.lanche.horario})</b><br>Itens: ${lancheItens}<br>Bebidas: ${lancheBebidas}<br>${lancheImgs}`;
    }

    tr.innerHTML = `
      <td>${cardapio.turno}</td>
      <td>${dataFormatada}</td>
      <td><b>${cardapio.refeicao.titulo}</b><br>Itens: ${refeicaoItens}<br>Bebidas: ${refeicaoBebidas}<br>${refeicaoImgs}</td>
      <td>${lancheConteudo}</td>
      <td><button onclick="editarCardapio(${cardapio.id})">✏️</button></td>
      <td><button onclick="excluirCardapio(${cardapio.id})">🗑️</button></td>
    `;
    tabela.appendChild(tr);
  });
}

// Função para cadastrar nova refeição
async function cadastrarCardapio(cardapio) {
  try {
    cardapio.cozinheiraId = Number(localStorage.getItem("cozinheiraId"));
    const res = await fetch(API_CARDAPIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardapio)
    });
    if (res.ok) {
      alert("Refeição cadastrada com sucesso!");
      listarCardapios();
    } else {
      alert("Erro ao cadastrar refeição!");
    }
  } catch (error) {
    console.error("Erro ao cadastrar cardápio:", error);
    alert("Ocorreu um erro ao cadastrar a refeição.");
  }
}

// Função para buscar cardápio para edição
async function editarCardapio(id) {
  try {
    const res = await fetch(`${API_CARDAPIOS}/${id}`);
    const cardapio = await res.json();

    document.querySelector("#date").value = cardapio.data.split("T")[0];
    document.querySelector("select#turnos").value = cardapio.turno;
    document.querySelector("input[name='refeição']").value = cardapio.refeicao.titulo;
    document.querySelector("textarea[name='itens']").value = cardapio.refeicao.itens.join(", ");
    document.querySelector("input[name='bebida']").value = cardapio.refeicao.bebida.join(", ");

    // Para lanche, caso exista, você pode abrir campos extras se quiser
    if (cardapio.lanche) {
      // Exemplo: preencher campos extras de lanche
    }

    // Após edição, chamar atualizarCardapio(id, cardapioAtualizado)
  } catch (error) {
    console.error("Erro ao buscar cardápio para edição:", error);
  }
}

// Atualizar cardápio existente
async function atualizarCardapio(id, cardapioAtualizado) {
  try {
    const res = await fetch(`${API_CARDAPIOS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardapioAtualizado)
    });
    if (res.ok) {
      alert("Refeição atualizada com sucesso!");
      listarCardapios();
    } else {
      alert("Erro ao atualizar refeição!");
    }
  } catch (error) {
    console.error("Erro ao atualizar cardápio:", error);
    alert("Ocorreu um erro ao atualizar a refeição.");
  }
}

// Excluir cardápio
async function excluirCardapio(id) {
  if (!confirm("Deseja realmente excluir esta refeição?")) return;
  try {
    const res = await fetch(`${API_CARDAPIOS}/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Refeição excluída com sucesso!");
      listarCardapios();
    } else {
      alert("Erro ao excluir refeição!");
    }
  } catch (error) {
    console.error("Erro ao excluir cardápio:", error);
    alert("Ocorreu um erro ao excluir a refeição.");
  }
}

// -----------------------------
// EVENTOS
// -----------------------------

// Cadastro de refeição
document.querySelector("#cadastrar")?.addEventListener("click", async (e) => {
  e.preventDefault();

  const cardapio = {
    data: document.querySelector("#date").value,
    turno: document.querySelector("select#turnos").value,
    refeicao: {
      titulo: document.querySelector("input[name='refeição']").value,
      itens: document.querySelector("textarea[name='itens']").value.split(",").map(i => i.trim()),
      bebida: document.querySelector("input[name='bebida']").value.split(",").map(b => b.trim()),
      img: [] // Inserir links ou implementação de upload de imagens
    }
  };

  // Adicionar lanche apenas se turno for integral
  if (cardapio.turno === "integral") {
    cardapio.lanche = {
      titulo: "Lanche",
      horario: "15:00",
      itens: [],
      bebida: [],
      img: []
    };
  }

  await cadastrarCardapio(cardapio);
});

// Carregar cardápios ao iniciar a página
window.addEventListener("DOMContentLoaded", () => {
  listarCardapios();
});
