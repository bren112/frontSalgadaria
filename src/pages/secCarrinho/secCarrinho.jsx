import { useState } from 'react'
import PedidosPendentes from '../../components/PedidosPendentes/Index'
import './secCarrinho.css'

const apiPedidosUrls = [
  'http://localhost:8080/pedidos',
  'https://backsalgadaria.onrender.com/pedidos',
]

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`
}

function calcularTotalItens(itensCarrinho) {
  return itensCarrinho.reduce((total, item) => {
    return total + Number(item.preco || 0) * Number(item.quantidade || 0)
  }, 0)
}

function montarItensPedido(itensCarrinho) {
  return itensCarrinho.map((item) => ({
    id: item.id,
    nome: item.nome,
    precoUnitario: Number(item.preco) || 0,
    quantidade: Number(item.quantidade) || 0,
  }))
}

function montarPayloadPedido({ usuarioLogado, itensCarrinho }) {
  return {
    usuarioId: usuarioLogado.id,
    itens: montarItensPedido(itensCarrinho),
  }
}

function validarPedido({ usuarioLogado, itensCarrinho }) {
  if (!usuarioLogado?.id) {
    return 'Faça login para finalizar o pedido.'
  }

  if (itensCarrinho.length === 0) {
    return 'Adicione pelo menos um item no carrinho.'
  }

  const possuiItemInvalido = itensCarrinho.some((item) => {
    return !item.nome || Number(item.preco) <= 0 || Number(item.quantidade) <= 0
  })

  if (possuiItemInvalido) {
    return 'Existem itens invalidos no pedido.'
  }

  return ''
}

async function salvarPedidoNaApi(pedido) {
  for (const url of apiPedidosUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
      })

      if (response.ok) {
        return await response.json()
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel salvar o pedido.')
}

function SecaoCarrinho({
  itensCarrinho,
  ultimoItemAdicionadoId,
  aoAumentarQuantidade,
  aoDiminuirQuantidade,
  aoLimparCarrinho,
  usuarioLogado,
  aoAbrirLogin,
  aoPedidoCriado,
  atualizadorPedidos,
  aoFechar,
}) {
  const [salvandoPedido, definirSalvandoPedido] = useState(false)
  const [mensagem, definirMensagem] = useState('')
  const [abaPedidosAtiva, definirAbaPedidosAtiva] = useState('pendentes')
  const valorTotal = calcularTotalItens(itensCarrinho)

  async function finalizarPedido() {
    const erroValidacao = validarPedido({
      usuarioLogado,
      itensCarrinho,
    })

    if (erroValidacao) {
      definirMensagem(erroValidacao)
      return
    }

    const pedido = montarPayloadPedido({
      usuarioLogado,
      itensCarrinho,
    })

    try {
      definirSalvandoPedido(true)
      definirMensagem('')

      const respostaPedido = await salvarPedidoNaApi(pedido)

      definirMensagem(
        `Pedido salvo com sucesso. Total: ${formatarMoeda(
          respostaPedido.valorTotal || valorTotal
        )}.`
      )
      aoLimparCarrinho()
      aoPedidoCriado?.()
    } catch (error) {
      definirMensagem('Erro ao salvar o pedido.')
      console.error(error)
    } finally {
      definirSalvandoPedido(false)
    }
  }

  return (
    <div className="fundo-carrinho" role="presentation" onClick={aoFechar}>
      <aside
        className="carrinho-lateral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-carrinho"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="cabecalho-carrinho">
          <div>
            <h2 id="titulo-carrinho">Meu Pedido</h2>
            <span className="contador-carrinho">{itensCarrinho.length} itens</span>
          </div>

          <button
            type="button"
            className="botao-fechar-carrinho"
            onClick={aoFechar}
            aria-label="Fechar carrinho"
          >
            x
          </button>
        </div>

        <div className="itens-carrinho">
          <section className="secao-abas-pedidos">
            <div className="abas-pedidos">
              <button
                type="button"
                className={
                  abaPedidosAtiva === 'pendentes'
                    ? 'aba-pedidos aba-pedidos-ativa'
                    : 'aba-pedidos'
                }
                onClick={() => definirAbaPedidosAtiva('pendentes')}
              >
                Pendentes
              </button>
              <button
                type="button"
                className={
                  abaPedidosAtiva === 'concluidos'
                    ? 'aba-pedidos aba-pedidos-ativa'
                    : 'aba-pedidos'
                }
                onClick={() => definirAbaPedidosAtiva('concluidos')}
              >
                Concluidos
              </button>
            </div>
          </section>

          {itensCarrinho.length === 0 && (
            <p className="carrinho-vazio">Seu carrinho esta vazio.</p>
          )}

          {itensCarrinho.map((itemCarrinho) => (
            <div
              key={itemCarrinho.id}
              className={
                itemCarrinho.id === ultimoItemAdicionadoId
                  ? 'item-carrinho item-carrinho-destaque'
                  : 'item-carrinho'
              }
            >
              <div className="info-item">
                <h3>{itemCarrinho.nome}</h3>
                <strong>{formatarMoeda(itemCarrinho.preco)}</strong>
              </div>

              <div className="controles-item">
                <button
                  className="botao-quantidade"
                  onClick={() => aoDiminuirQuantidade(itemCarrinho.id)}
                >
                  -
                </button>
                <span className="numero-quantidade">{itemCarrinho.quantidade}</span>
                <button
                  className="botao-quantidade"
                  onClick={() => aoAumentarQuantidade(itemCarrinho.id)}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {abaPedidosAtiva === 'pendentes' && (
            <PedidosPendentes
              usuarioLogado={usuarioLogado}
              atualizadorLista={atualizadorPedidos}
            />
          )}

          {abaPedidosAtiva === 'concluidos' && (
            <PedidosPendentes
              usuarioLogado={usuarioLogado}
              atualizadorLista={atualizadorPedidos}
              tipo="concluidos"
            />
          )}
        </div>

        <div className="rodape-carrinho">
          <div className="resumo-usuario-carrinho">
            {usuarioLogado ? (
              <p>
                Pedido para <strong>{usuarioLogado.nome || usuarioLogado.email}</strong>
              </p>
            ) : (
              <p>Entre na sua conta para concluir o pedido.</p>
            )}
          </div>

          <div className="total-carrinho">
            <span>Total</span>
            <strong>{formatarMoeda(valorTotal)}</strong>
          </div>

          {mensagem && <p className="mensagem-carrinho">{mensagem}</p>}

          <button
            className="botao-finalizar"
            onClick={finalizarPedido}
            disabled={salvandoPedido || !usuarioLogado?.id || itensCarrinho.length === 0}
          >
            {salvandoPedido ? 'Salvando...' : 'Finalizar Compra'}
          </button>
          {!usuarioLogado && (
            <button className="botao-login-carrinho" onClick={aoAbrirLogin}>
              Fazer Login
            </button>
          )}
          <button className="botao-continuar" onClick={aoFechar}>
            Continuar Comprando
          </button>
        </div>
      </aside>
    </div>
  )
}

export default SecaoCarrinho
