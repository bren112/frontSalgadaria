import './secCarrinho.css'

function SecaoCarrinho({ aoFechar }) {
  const itensCarrinho = [
    { codigo: 1, nome: 'Coxinha de Frango', preco: 8.5, quantidade: 2 },
    { codigo: 2, nome: 'Kibe com Queijo', preco: 9.0, quantidade: 1 },
  ]

  const valorTotal = itensCarrinho.reduce(
    (acumulador, itemCarrinho) =>
      acumulador + itemCarrinho.preco * itemCarrinho.quantidade,
    0,
  )

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
          {itensCarrinho.map((itemCarrinho) => (
            <div key={itemCarrinho.codigo} className="item-carrinho">
              <div className="info-item">
                <h3>{itemCarrinho.nome}</h3>
                <strong>R$ {itemCarrinho.preco.toFixed(2).replace('.', ',')}</strong>
              </div>

              <div className="controles-item">
                <button className="botao-quantidade">-</button>
                <span className="numero-quantidade">{itemCarrinho.quantidade}</span>
                <button className="botao-quantidade">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="rodape-carrinho">
          <div className="total-carrinho">
            <span>Total</span>
            <strong>R$ {valorTotal.toFixed(2).replace('.', ',')}</strong>
          </div>

          <button className="botao-finalizar">Finalizar Compra</button>
          <button className="botao-continuar" onClick={aoFechar}>
            Continuar Comprando
          </button>
        </div>
      </aside>
    </div>
  )
}

export default SecaoCarrinho
