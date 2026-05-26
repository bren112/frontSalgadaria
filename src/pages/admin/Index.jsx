import { useEffect, useState } from 'react'
import PedidosPendentes from '../../components/PedidosPendentes/Index'
import './admin.css'

const urlsApiPedidosPendentes = [
  'http://localhost:8080/pedidos/pendentes',
  'https://backsalgadaria.onrender.com/pedidos/pendentes',
]

const urlsApiPedidosConcluidos = [
  'http://localhost:8080/pedidos/concluidos',
  'https://backsalgadaria.onrender.com/pedidos/concluidos',
]

const urlsApiProdutos = [
  'http://localhost:8080/salgados',
  'https://backsalgadaria.onrender.com/salgados',
]

const urlsApiCategorias = [
  'http://localhost:8080/categorias',
  'https://backsalgadaria.onrender.com/categorias',
]

const urlsApiCriarProduto = [
  'http://localhost:8080/produtos',
  'https://backsalgadaria.onrender.com/produtos',
]

const urlsApiAtualizarProduto = [
  'http://localhost:8080/produtos',
  'https://backsalgadaria.onrender.com/produtos',
]

const urlsApiRemoverProduto = [
  'http://localhost:8080/produtos',
  'https://backsalgadaria.onrender.com/produtos',
]

const formularioInicialProduto = {
  nome: '',
  descricao: '',
  preco: '',
  imagem_url: '',
  categoria_id: '',
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`
}

async function buscarPedidosPorUrl({ usuarioLogado, urlsBase }) {
  for (const urlBase of urlsBase) {
    try {
      const url = new URL(urlBase)

      if (usuarioLogado?.id) {
        url.searchParams.set('usuarioId', String(usuarioLogado.id))
      }

      const resposta = await fetch(url)

      if (resposta.ok) {
        return await resposta.json()
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel carregar os dados do dashboard.')
}

async function buscarListaPorUrls(urlsBase, mensagemErro) {
  for (const url of urlsBase) {
    try {
      const resposta = await fetch(url)

      if (resposta.ok) {
        return await resposta.json()
      }
    } catch {
    }
  }

  throw new Error(mensagemErro)
}

async function enviarProduto({ metodo, produtoId, usuarioLogado, dadosProduto }) {
  const urlsBase =
    metodo === 'POST' ? urlsApiCriarProduto : urlsApiAtualizarProduto

  for (const urlBase of urlsBase) {
    try {
      const url =
        metodo === 'PATCH' ? `${urlBase}/${produtoId}` : urlBase

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: usuarioLogado?.id,
          ...dadosProduto,
        }),
      })

      if (resposta.ok) {
        return await resposta.json()
      }

      const erro = await resposta.json().catch(() => null)

      if (resposta.status < 500) {
        throw new Error(erro?.error || 'Nao foi possivel salvar o produto.')
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        throw error
      }
    }
  }

  throw new Error('Nao foi possivel salvar o produto.')
}

async function removerProduto({ produtoId, usuarioLogado }) {
  for (const urlBase of urlsApiRemoverProduto) {
    try {
      const url = new URL(`${urlBase}/${produtoId}`)
      url.searchParams.set('usuarioId', String(usuarioLogado?.id || ''))

      const resposta = await fetch(url, {
        method: 'DELETE',
      })

      if (resposta.ok) {
        return
      }

      const erro = await resposta.json().catch(() => null)

      if (resposta.status < 500) {
        throw new Error(erro?.error || 'Nao foi possivel remover o produto.')
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        throw error
      }
    }
  }

  throw new Error('Nao foi possivel remover o produto.')
}

function montarResumoClientes(pedidosPendentes, pedidosEntregues) {
  const pedidos = [...pedidosPendentes, ...pedidosEntregues]
  const clientes = new Map()

  pedidos.forEach((pedido) => {
    const email = pedido.email_id || 'Cliente nao identificado'
    const clienteAtual = clientes.get(email) || {
      nome: email,
      quantidadePedidos: 0,
      valorTotal: 0,
    }

    clienteAtual.quantidadePedidos += 1
    clienteAtual.valorTotal += Number(pedido.valorTotal || 0)
    clientes.set(email, clienteAtual)
  })

  return Array.from(clientes.values()).sort(
    (clienteA, clienteB) => clienteB.quantidadePedidos - clienteA.quantidadePedidos
  )
}

function montarFormularioProduto(produto) {
  return {
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    preco: produto?.preco || '',
    imagem_url: produto?.imagem_url || '',
    categoria_id: produto?.categoria_id ? String(produto.categoria_id) : '',
  }
}

function PaginaAdmin({
  usuarioLogado,
  atualizadorPedidos,
  aoAtualizarProdutos,
}) {
  const [abaAtiva, definirAbaAtiva] = useState('dashboard')
  const [atualizadorAdmin, definirAtualizadorAdmin] = useState(0)
  const [pedidosPendentes, definirPedidosPendentes] = useState([])
  const [pedidosEntregues, definirPedidosEntregues] = useState([])
  const [carregandoDashboard, definirCarregandoDashboard] = useState(true)
  const [erroDashboard, definirErroDashboard] = useState('')
  const [produtos, definirProdutos] = useState([])
  const [categorias, definirCategorias] = useState([])
  const [carregandoProdutos, definirCarregandoProdutos] = useState(false)
  const [erroProdutos, definirErroProdutos] = useState('')
  const [mensagemProduto, definirMensagemProduto] = useState('')
  const [produtoEmEdicaoId, definirProdutoEmEdicaoId] = useState(null)
  const [salvandoProduto, definirSalvandoProduto] = useState(false)
  const [formularioProduto, definirFormularioProduto] = useState(formularioInicialProduto)

  useEffect(() => {
    async function carregarDashboard() {
      if (!usuarioLogado?.id) {
        definirPedidosPendentes([])
        definirPedidosEntregues([])
        definirCarregandoDashboard(false)
        definirErroDashboard('')
        return
      }

      try {
        definirCarregandoDashboard(true)
        definirErroDashboard('')

        const [listaPendentes, listaEntregues] = await Promise.all([
          buscarPedidosPorUrl({
            usuarioLogado,
            urlsBase: urlsApiPedidosPendentes,
          }),
          buscarPedidosPorUrl({
            usuarioLogado,
            urlsBase: urlsApiPedidosConcluidos,
          }),
        ])

        definirPedidosPendentes(listaPendentes)
        definirPedidosEntregues(listaEntregues)
      } catch (error) {
        definirErroDashboard('Nao foi possivel carregar o dashboard.')
        console.error(error)
      } finally {
        definirCarregandoDashboard(false)
      }
    }

    carregarDashboard()
  }, [usuarioLogado, atualizadorPedidos, atualizadorAdmin])

  useEffect(() => {
    async function carregarProdutos() {
      if (abaAtiva !== 'produtos') {
        return
      }

      try {
        definirCarregandoProdutos(true)
        definirErroProdutos('')

        const [listaProdutos, listaCategorias] = await Promise.all([
          buscarListaPorUrls(urlsApiProdutos, 'Nao foi possivel carregar os produtos.'),
          buscarListaPorUrls(urlsApiCategorias, 'Nao foi possivel carregar as categorias.'),
        ])

        definirProdutos(listaProdutos)
        definirCategorias(listaCategorias)
      } catch (error) {
        definirErroProdutos(error.message || 'Nao foi possivel carregar os produtos.')
      } finally {
        definirCarregandoProdutos(false)
      }
    }

    carregarProdutos()
  }, [abaAtiva, atualizadorAdmin])

  function sincronizarPedidos() {
    definirAtualizadorAdmin((valorAtual) => valorAtual + 1)
  }

  function atualizarCampoProduto(evento) {
    const { name, value } = evento.target

    definirFormularioProduto((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }))
  }

  function limparFormularioProduto() {
    definirFormularioProduto(formularioInicialProduto)
    definirProdutoEmEdicaoId(null)
  }

  function iniciarEdicaoProduto(produto) {
    definirProdutoEmEdicaoId(produto.id)
    definirFormularioProduto(montarFormularioProduto(produto))
    definirMensagemProduto('')
  }

  async function submeterProduto(evento) {
    evento.preventDefault()

    try {
      definirSalvandoProduto(true)
      definirMensagemProduto('')

      await enviarProduto({
        metodo: produtoEmEdicaoId ? 'PATCH' : 'POST',
        produtoId: produtoEmEdicaoId,
        usuarioLogado,
        dadosProduto: {
          ...formularioProduto,
          preco: Number(formularioProduto.preco),
          categoria_id: Number(formularioProduto.categoria_id),
        },
      })

      definirMensagemProduto(
        produtoEmEdicaoId
          ? 'Produto atualizado com sucesso.'
          : 'Produto criado com sucesso.'
      )
      limparFormularioProduto()
      definirAtualizadorAdmin((valorAtual) => valorAtual + 1)
      aoAtualizarProdutos?.()
    } catch (error) {
      definirMensagemProduto(error.message || 'Nao foi possivel salvar o produto.')
    } finally {
      definirSalvandoProduto(false)
    }
  }

  async function excluirProduto(produtoId) {
    const confirmar = window.confirm('Deseja remover este produto?')

    if (!confirmar) {
      return
    }

    try {
      definirMensagemProduto('')
      await removerProduto({ produtoId, usuarioLogado })
      definirMensagemProduto('Produto removido com sucesso.')

      if (produtoEmEdicaoId === produtoId) {
        limparFormularioProduto()
      }

      definirAtualizadorAdmin((valorAtual) => valorAtual + 1)
      aoAtualizarProdutos?.()
    } catch (error) {
      definirMensagemProduto(error.message || 'Nao foi possivel remover o produto.')
    }
  }

  const valorTotalEntregue = pedidosEntregues.reduce((total, pedido) => {
    return total + Number(pedido.valorTotal || 0)
  }, 0)

  const resumoClientes = montarResumoClientes(pedidosPendentes, pedidosEntregues)
  const quantidadeClientes = resumoClientes.length

  return (
    <section className="pagina-admin">
      <div className="topo-admin">
        <div>
          <span className="tag-admin">Painel</span>
          <h1>Painel de pedidos</h1>
          <p>
            Acompanhe os pedidos da loja, marque como entregue e acompanhe o resumo
            geral em secoes separadas.
          </p>
        </div>

        <div className="resumo-admin">
          <span>Administrador</span>
          <strong>{usuarioLogado?.nome || usuarioLogado?.email}</strong>
        </div>
      </div>

      <section className="secao-abas-admin">
        <div className="abas-admin">
          <button
            type="button"
            className={
              abaAtiva === 'dashboard' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={
              abaAtiva === 'pendentes' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('pendentes')}
          >
            Pendentes
          </button>
          <button
            type="button"
            className={
              abaAtiva === 'entregues' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('entregues')}
          >
            Entregues
          </button>
          <button
            type="button"
            className={
              abaAtiva === 'produtos' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('produtos')}
          >
            Produtos
          </button>
        </div>
      </section>

      {abaAtiva === 'dashboard' && (
        <div className="grade-dashboard-admin">
          <section className="bloco-dashboard-admin">
            <span className="rotulo-dashboard-admin">Valor total entregue</span>
            <strong className="valor-dashboard-admin">
              {carregandoDashboard ? 'Carregando...' : formatarMoeda(valorTotalEntregue)}
            </strong>
            <p>Soma dos pedidos que ja foram marcados como entregues.</p>
          </section>

          <section className="bloco-dashboard-admin">
            <span className="rotulo-dashboard-admin">Quantidade de clientes</span>
            <strong className="valor-dashboard-admin">
              {carregandoDashboard ? 'Carregando...' : quantidadeClientes}
            </strong>
            <p>Total de clientes unicos encontrados entre pedidos pendentes e entregues.</p>
          </section>

          <section className="bloco-dashboard-admin secao-clientes-admin">
            <div className="cabecalho-clientes-admin">
              <div>
                <span className="rotulo-dashboard-admin">Clientes</span>
                <h2>Nome e quantidade de pedidos</h2>
              </div>
            </div>

            {erroDashboard && <p className="mensagem-dashboard-admin">{erroDashboard}</p>}

            {carregandoDashboard && (
              <p className="mensagem-dashboard-admin">Carregando resumo de clientes...</p>
            )}

            {!carregandoDashboard && !erroDashboard && resumoClientes.length === 0 && (
              <p className="mensagem-dashboard-admin">Nenhum cliente encontrado no momento.</p>
            )}

            {!carregandoDashboard && !erroDashboard && resumoClientes.length > 0 && (
              <div className="lista-clientes-admin">
                {resumoClientes.map((cliente) => (
                  <article key={cliente.nome} className="item-cliente-admin">
                    <div>
                      <h3>{cliente.nome}</h3>
                      <p>{cliente.quantidadePedidos} pedidos</p>
                    </div>
                    <strong>{formatarMoeda(cliente.valorTotal)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {abaAtiva === 'pendentes' && (
        <PedidosPendentes
          usuarioLogado={usuarioLogado}
          atualizadorLista={atualizadorPedidos + atualizadorAdmin}
          titulo="Pedidos pendentes"
          descricao="Pedidos aguardando atendimento e confirmacao de entrega."
          mostrarEmailPedido
          permitirMarcarPago
          aoAtualizarPedidos={sincronizarPedidos}
        />
      )}

      {abaAtiva === 'entregues' && (
        <PedidosPendentes
          usuarioLogado={usuarioLogado}
          atualizadorLista={atualizadorPedidos + atualizadorAdmin}
          tipo="concluidos"
          titulo="Pedidos entregues"
          descricao="Pedidos que ja foram finalizados e marcados como entregues."
          mostrarEmailPedido
        />
      )}

      {abaAtiva === 'produtos' && (
        <section className="painel-produtos-admin">
          <section className="bloco-dashboard-admin formulario-produto-admin">
            <div className="cabecalho-produtos-admin">
              <div>
                <span className="rotulo-dashboard-admin">Produtos</span>
                <h2>
                  {produtoEmEdicaoId ? 'Editar produto' : 'Criar novo produto'}
                </h2>
              </div>
            </div>

            <form className="grade-formulario-produto" onSubmit={submeterProduto}>
              <label className="campo-admin">
                <span>Nome</span>
                <input
                  name="nome"
                  value={formularioProduto.nome}
                  onChange={atualizarCampoProduto}
                  placeholder="Ex.: Coxinha de frango"
                />
              </label>

              <label className="campo-admin">
                <span>Preco</span>
                <input
                  type="number"
                  name="preco"
                  min="0"
                  step="0.01"
                  value={formularioProduto.preco}
                  onChange={atualizarCampoProduto}
                  placeholder="0,00"
                />
              </label>

              <label className="campo-admin campo-admin-largo">
                <span>Descricao</span>
                <textarea
                  name="descricao"
                  rows="4"
                  value={formularioProduto.descricao}
                  onChange={atualizarCampoProduto}
                  placeholder="Descreva o produto"
                />
              </label>

              <label className="campo-admin campo-admin-largo">
                <span>Imagem</span>
                <input
                  name="imagem_url"
                  value={formularioProduto.imagem_url}
                  onChange={atualizarCampoProduto}
                  placeholder="https://..."
                />
              </label>

              <label className="campo-admin">
                <span>Categoria</span>
                <select
                  name="categoria_id"
                  value={formularioProduto.categoria_id}
                  onChange={atualizarCampoProduto}
                >
                  <option value="">Selecione</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="acoes-formulario-admin">
                <button
                  type="submit"
                  className="botao-admin botao-admin-primario"
                  disabled={salvandoProduto}
                >
                  {salvandoProduto
                    ? 'Salvando...'
                    : produtoEmEdicaoId
                      ? 'Salvar edicao'
                      : 'Criar produto'}
                </button>

                <button
                  type="button"
                  className="botao-admin botao-admin-secundario"
                  onClick={limparFormularioProduto}
                >
                  Limpar
                </button>
              </div>
            </form>

            {mensagemProduto && (
              <p className="mensagem-dashboard-admin">{mensagemProduto}</p>
            )}
          </section>

          <section className="bloco-dashboard-admin lista-produtos-admin">
            <div className="cabecalho-produtos-admin">
              <div>
                <span className="rotulo-dashboard-admin">Gerenciar</span>
                <h2>Editar e remover produto</h2>
              </div>
            </div>

            {erroProdutos && <p className="mensagem-dashboard-admin">{erroProdutos}</p>}
            {carregandoProdutos && (
              <p className="mensagem-dashboard-admin">Carregando produtos...</p>
            )}

            {!carregandoProdutos && !erroProdutos && produtos.length === 0 && (
              <p className="mensagem-dashboard-admin">Nenhum produto encontrado.</p>
            )}

            {!carregandoProdutos && !erroProdutos && produtos.length > 0 && (
              <div className="lista-clientes-admin">
                {produtos.map((produto) => (
                  <article key={produto.id} className="item-cliente-admin item-produto-admin">
                    <div className="conteudo-produto-admin">
                      <h3>{produto.nome}</h3>
                      <p>{produto.descricao}</p>
                      <small>
                        {produto.categoria?.nome || 'Sem categoria'} • {formatarMoeda(produto.preco)}
                      </small>
                    </div>

                    <div className="acoes-produto-admin">
                      <button
                        type="button"
                        className="botao-admin botao-admin-secundario"
                        onClick={() => iniciarEdicaoProduto(produto)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="botao-admin botao-admin-perigo"
                        onClick={() => excluirProduto(produto.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}
    </section>
  )
}

export default PaginaAdmin
