import { useEffect, useState } from 'react'
import './salgados-list.css'

const apiUrls = [
  'http://localhost:8080/salgados',
  'https://backsalgadaria.onrender.com/salgados',
]

const categoriasFixas = {
  1: 'Assados',
  2: 'Sucos',
  3: 'Sucos com Polpa',
}

function pegarNomeCategoria(produto) {
  if (produto.categoria?.nome) {
    return produto.categoria.nome
  }

  if (categoriasFixas[produto.categoria_id]) {
    return categoriasFixas[produto.categoria_id]
  }

  return 'Sem categoria'
}

async function buscarSalgados() {
  for (const url of apiUrls) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return await response.json()
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel carregar os salgados.')
}

function ListaSalgados({ aoAdicionar, ultimoItemAdicionadoId }) {
  const [salgados, setSalgados] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')

  useEffect(() => {
    async function carregar() {
      try {
        const data = await buscarSalgados()
        setSalgados(data)
      } catch (error) {
        console.error('Erro ao carregar salgados:', error)
      }
    }

    carregar()
  }, [])

  const categorias = [
    'Todos',
    ...new Set(salgados.map((produto) => pegarNomeCategoria(produto))),
  ]

  const produtosFiltrados =
    categoriaAtiva === 'Todos'
      ? salgados
      : salgados.filter(
          (produto) => pegarNomeCategoria(produto) === categoriaAtiva
        )

  const produtosAgrupados = produtosFiltrados.reduce((acc, produto) => {
    const categoria = pegarNomeCategoria(produto)

    if (!acc[categoria]) {
      acc[categoria] = []
    }

    acc[categoria].push(produto)

    return acc
  }, {})

  return (
    <section className="salgados-section">
      <div className="salgados-topo">
        <span className="salgados-tag">Cardapio</span>

        <h1>Lista de salgados</h1>

        <p>
          Escolha seus favoritos para montar um pedido rapido e saboroso.
        </p>
      </div>

      <div className="categorias-filtro" aria-label="Filtrar por categoria">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            type="button"
            className={
              categoria === categoriaAtiva
                ? 'categoria-botao categoria-botao-ativa'
                : 'categoria-botao'
            }
            onClick={() => setCategoriaAtiva(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      {Object.entries(produtosAgrupados).map(
        ([categoria, produtos]) => (
          <div
            key={categoria}
            className="categoria-bloco"
          >
            <h2 className="titulo-categoria">
              {categoria}
            </h2>

            <div className="salgados-grid">
              {produtos.map((itemSalgado) => (
                <article
                  className="salgado-card"
                  key={itemSalgado.id}
                >
                  <img
                    className="imagem-salgado"
                    src={itemSalgado.imagem_url}
                    alt={itemSalgado.nome}
                  />

                  <span className="salgado-destaque">
                    R$ {itemSalgado.preco}
                  </span>

                  <h2>{itemSalgado.nome}</h2>

                  <p>{itemSalgado.descricao}</p>

                  <div className="salgado-rodape">
                    <button
                      className={
                        itemSalgado.id === ultimoItemAdicionadoId
                          ? 'botao-adicionar botao-adicionar-ativo'
                          : 'botao-adicionar'
                      }
                      onClick={() => aoAdicionar(itemSalgado)}
                    >
                      {itemSalgado.id === ultimoItemAdicionadoId
                        ? 'Adicionado'
                        : 'Adicionar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )
      )}
    </section>
  )
}

export default ListaSalgados
