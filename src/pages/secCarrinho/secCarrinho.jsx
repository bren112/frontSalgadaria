import { useState } from 'react'
import './secCarrinho.css'

const apiPedidosUrls = [
  'http://localhost:8080/pedidos',
  'https://backsalgadaria.onrender.com/pedidos',
]

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
  aoFechar,
}) {
  const [email, definirEmail] = useState('')
  const [salvandoPedido, definirSalvandoPedido] = useState(false)
  const [mensagem, definirMensagem] = useState('')

  const valorTotal = itensCarrinho.reduce(
    (acumulador, itemCarrinho) =>
      acumulador + itemCarrinho.preco * itemCarrinho.quantidade,
    0,
  )

  async function finalizarPedido() {
    if (itensCarrinho.length === 0) {
      definirMensagem('Adicione pelo menos um item no carrinho.')
      return
    }

    const descricaoPedido = itensCarrinho
      .map(
        (item) =>
          `${item.nome} x${item.quantidade} - R$ ${(item.preco * item.quantidade)
            .toFixed(2)
            .replace('.', ',')}`
      )
      .join(' | ')

    const pedido = {
      email_id: email || null,
      descricao_pedido: descricaoPedido,
      valorTotal,
      pedidoPago: false,
    }

    try {
      definirSalvandoPedido(true)
      definirMensagem('')

      await salvarPedidoNaApi(pedido)

      definirMensagem('Pedido salvo com sucesso.')
      definirEmail('')
      aoLimparCarrinho()
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
                <strong>R$ {itemCarrinho.preco.toFixed(2).replace('.', ',')}</strong>
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
        </div>

        <div className="rodape-carrinho">
          <label className="campo-email-carrinho">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="seunome@email.com"
              value={email}
              onChange={(evento) => definirEmail(evento.target.value)}
            />
          </label>

          <div className="total-carrinho">
            <span>Total</span>
            <strong>R$ {valorTotal.toFixed(2).replace('.', ',')}</strong>
          </div>

          {mensagem && <p className="mensagem-carrinho">{mensagem}</p>}

          <button
            className="botao-finalizar"
            onClick={finalizarPedido}
            disabled={salvandoPedido}
          >
            {salvandoPedido ? 'Salvando...' : 'Finalizar Compra'}
          </button>
          <button className="botao-continuar" onClick={aoFechar}>
            Continuar Comprando
          </button>
        </div>
      </aside>
    </div>
  )
}

export default SecaoCarrinho
