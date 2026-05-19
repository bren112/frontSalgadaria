import BotaoCarrinho from '../carrinho/btnCarrinho'
import './header.css'

function Cabecalho({ usuarioLogado, aoAbrirCarrinho, aoAbrirLogin, aoSair }) {
  const situacao = 'Fechado'
  const horario = '18:00 - 23:59'
  const pedidoMinimo = 'R$ 20,00'
  const textoBotao = usuarioLogado
    ? `Sair (${usuarioLogado.nome || usuarioLogado.email})`
    : 'Login'

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
        <button
          className="btn-login"
          onClick={usuarioLogado ? aoSair : aoAbrirLogin}
          type="button"
        >
          {textoBotao}
        </button>

    <BotaoCarrinho aoClicar={aoAbrirCarrinho} />

    </div>

      </div>
    </header>
  )
}

export default Cabecalho
