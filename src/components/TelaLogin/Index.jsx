import './tela-login.css'

function TelaLogin({ aoFechar }) {
  return (
    <div className="fundo-login" role="presentation" onClick={aoFechar}>
      <section
        className="cartao-login"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-login"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          className="botao-fechar-login"
          onClick={aoFechar}
          aria-label="Fechar tela de login"
        >
          x
        </button>

        <div className="topo-login">
          <span className="selo-login">Acesso seguro</span>
          <h2 id="titulo-login">Entrar na sua conta</h2>
          <p>Use seu e-mail e senha para continuar seu pedido.</p>
        </div>

        <form className="formulario-login">
          <label className="campo-login">
            <span>E-mail</span>
            <input type="email" placeholder="seunome@email.com" />
          </label>

          <label className="campo-login">
            <span>Senha</span>
            <input type="password" placeholder="Digite sua senha" />
          </label>

          <button type="button" className="botao-primario-login">
            Entrar
          </button>

          <button type="button" className="botao-secundario-login">
            Entrar com Google
          </button>

          <a href="/" className="link-login" onClick={(evento) => evento.preventDefault()}>
            Esqueci minha senha
          </a>
        </form>
      </section>
    </div>
  )
}

export default TelaLogin
