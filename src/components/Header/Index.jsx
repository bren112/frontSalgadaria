import BotaoCarrinho from '../carrinho/btnCarrinho'
import './header.css'

function Cabecalho({ aoAbrirCarrinho, aoAbrirLogin }) {
  const situacao = 'Fechado'
  const horario = '18:00 - 23:59'
  const pedidoMinimo = 'R$ 20,00'
  const textoBotao = 'Login'

  return (
    <header className="header">
      <div className="header-container">

        <div>
          <div className="header-linha-status">
            <span className="badge-status">{situacao}</span>

            <span className="horario">{horario}</span>

            <span className="info">i</span>
          </div>

          <div className="pedido-minimo">
            Pedido mínimo: <span>{pedidoMinimo}</span>
          </div>
        </div>

    <div id='divCarrinho'>
        <button className="btn-login" onClick={aoAbrirLogin} type="button">
          {textoBotao}
        </button>

    <BotaoCarrinho aoClicar={aoAbrirCarrinho} />

    </div>

      </div>
    </header>
  )
}

export default Cabecalho
