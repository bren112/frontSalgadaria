import { useEffect, useState } from 'react'
import './pedidos-pendentes.css'

const urlsApiPedidosPendentes = [
  'http://localhost:8080/pedidos/pendentes',
  'https://backsalgadaria.onrender.com/pedidos/pendentes',
]

const urlsApiPedidosConcluidos = [
  'http://localhost:8080/pedidos/concluidos',
  'https://backsalgadaria.onrender.com/pedidos/concluidos',
]

const urlsApiCancelarPedido = [
  'http://localhost:8080/pedidos',
  'https://backsalgadaria.onrender.com/pedidos',
]

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`
}

async function buscarPedidosPendentes(usuarioLogado) {
  return buscarPedidosPorUrl({
    usuarioLogado,
    urlsBase: urlsApiPedidosPendentes,
  })
}

async function buscarPedidosConcluidos(usuarioLogado) {
  return buscarPedidosPorUrl({
    usuarioLogado,
    urlsBase: urlsApiPedidosConcluidos,
  })
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

  throw new Error('Nao foi possivel carregar os pedidos.')
}

async function cancelarPedido({ pedidoId, usuarioId }) {
  for (const urlBase of urlsApiCancelarPedido) {
    try {
      const url = new URL(`${urlBase}/${pedidoId}`)
      url.searchParams.set('usuarioId', String(usuarioId))

      const resposta = await fetch(url, {
        method: 'DELETE',
      })

      if (resposta.ok) {
        return await resposta.json()
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel cancelar o pedido.')
}

function PedidosPendentes({ usuarioLogado, atualizadorLista, tipo = 'pendentes' }) {
  const [pedidosPendentes, definirPedidosPendentes] = useState([])
  const [carregandoPedidos, definirCarregandoPedidos] = useState(true)
  const [mensagemPedidos, definirMensagemPedidos] = useState('')
  const [pedidoCancelandoId, definirPedidoCancelandoId] = useState(null)
  const mostrandoPendentes = tipo === 'pendentes'

  useEffect(() => {
    async function carregarPedidos() {
      if (!usuarioLogado?.id) {
        definirPedidosPendentes([])
        definirCarregandoPedidos(false)
        definirMensagemPedidos('')
        return
      }

      try {
        definirCarregandoPedidos(true)
        definirMensagemPedidos('')

        const pedidos = mostrandoPendentes
          ? await buscarPedidosPendentes(usuarioLogado)
          : await buscarPedidosConcluidos(usuarioLogado)
        definirPedidosPendentes(pedidos)
      } catch (error) {
        definirMensagemPedidos(
          mostrandoPendentes
            ? 'Nao foi possivel carregar os pedidos pendentes.'
            : 'Nao foi possivel carregar os pedidos concluidos.'
        )
        console.error(error)
      } finally {
        definirCarregandoPedidos(false)
      }
    }

    carregarPedidos()
  }, [usuarioLogado, atualizadorLista, mostrandoPendentes])

  async function cancelarPedidoDoUsuario(pedidoId) {
    if (!usuarioLogado?.id) {
      return
    }

    try {
      definirPedidoCancelandoId(pedidoId)
      definirMensagemPedidos('')

      await cancelarPedido({
        pedidoId,
        usuarioId: usuarioLogado.id,
      })

      definirPedidosPendentes((pedidosAtuais) =>
        pedidosAtuais.filter((pedido) => pedido.id !== pedidoId)
      )
      definirMensagemPedidos('Pedido cancelado com sucesso.')
    } catch (error) {
      definirMensagemPedidos('Nao foi possivel cancelar o pedido.')
      console.error(error)
    } finally {
      definirPedidoCancelandoId(null)
    }
  }

  return (
    <section className="secao-pedidos-pendentes">
      <div className="cabecalho-pedidos-pendentes">
        <div>
          <span className="tag-pedidos-pendentes">Pedidos</span>
          <h2>
            {mostrandoPendentes
              ? 'Seus pedidos pendentes'
              : 'Seus pedidos concluidos'}
          </h2>
          <p>
            {mostrandoPendentes
              ? 'Veja apenas os pedidos que voce criou e cancele quando precisar.'
              : 'Consulte os pedidos que ja foram concluídos para a sua conta.'}
          </p>
        </div>
      </div>

      {mensagemPedidos && <p className="mensagem-pedidos-pendentes">{mensagemPedidos}</p>}

      {!usuarioLogado && (
        <p className="estado-pedidos-pendentes">Entre na sua conta para ver seus pedidos.</p>
      )}

      {carregandoPedidos && (
        <p className="estado-pedidos-pendentes">
          {mostrandoPendentes
            ? 'Carregando pedidos pendentes...'
            : 'Carregando pedidos concluidos...'}
        </p>
      )}

      {!carregandoPedidos && usuarioLogado && pedidosPendentes.length === 0 && (
        <p className="estado-pedidos-pendentes">
          {mostrandoPendentes
            ? 'Nenhum pedido pendente no momento.'
            : 'Nenhum pedido concluido no momento.'}
        </p>
      )}

      {!carregandoPedidos && usuarioLogado && pedidosPendentes.length > 0 && (
        <div className="lista-pedidos-pendentes">
          {pedidosPendentes.map((pedido) => (
            <article key={pedido.id} className="cartao-pedido-pendente">
              <div className="topo-cartao-pedido">
                <div>
                  <span className="numero-pedido">Pedido #{pedido.id}</span>
                  <h3>{usuarioLogado.nome || usuarioLogado.email}</h3>
                </div>
                <strong>{formatarMoeda(pedido.valorTotal)}</strong>
              </div>

              <p className="descricao-pedido-pendente">{pedido.descricao_pedido}</p>

              <div className="rodape-cartao-pedido">
                <span
                  className={
                    mostrandoPendentes
                      ? 'status-pedido-pendente'
                      : 'status-pedido-concluido'
                  }
                >
                  {mostrandoPendentes ? 'Pendente' : 'Concluido'}
                </span>
                {mostrandoPendentes && (
                  <button
                    type="button"
                    className="botao-cancelar-pedido"
                    onClick={() => cancelarPedidoDoUsuario(pedido.id)}
                    disabled={pedidoCancelandoId === pedido.id}
                  >
                    {pedidoCancelandoId === pedido.id ? 'Cancelando...' : 'Cancelar pedido'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default PedidosPendentes
