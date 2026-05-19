import { useState } from 'react'
import './tela-login.css'

const urlsApiLogin = [
  'http://localhost:8080/login',
  'https://backsalgadaria.onrender.com/login',
]

const urlsApiCadastro = [
  'http://localhost:8080/usuarios',
  'https://backsalgadaria.onrender.com/usuarios',
]

async function entrarNaConta(dadosLogin) {
  for (const url of urlsApiLogin) {
    try {
      const resposta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosLogin),
      })

      const dados = await resposta.json()

      if (resposta.ok) {
        return dados
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel realizar o login.')
}

async function criarConta(dadosCadastro) {
  for (const url of urlsApiCadastro) {
    try {
      const resposta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCadastro),
      })

      const dados = await resposta.json()

      if (resposta.ok) {
        return dados
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel criar a conta.')
}

function TelaLogin({ aoFechar, aoLoginRealizado }) {
  const [modoFormulario, definirModoFormulario] = useState('login')
  const [nome, definirNome] = useState('')
  const [email, definirEmail] = useState('')
  const [senha, definirSenha] = useState('')
  const [carregandoFormulario, definirCarregandoFormulario] = useState(false)
  const [mensagemErro, definirMensagemErro] = useState('')

  const estaEmModoCadastro = modoFormulario === 'cadastro'

  function trocarModoFormulario() {
    definirModoFormulario((modoAtual) =>
      modoAtual === 'login' ? 'cadastro' : 'login'
    )
    definirMensagemErro('')
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()

    if (estaEmModoCadastro && !nome.trim()) {
      definirMensagemErro('Preencha seu nome.')
      return
    }

    if (!email.trim() || !senha.trim()) {
      definirMensagemErro('Preencha e-mail e senha.')
      return
    }

    try {
      definirCarregandoFormulario(true)
      definirMensagemErro('')

      let usuario = null

      if (estaEmModoCadastro) {
        usuario = await criarConta({
          nome: nome.trim(),
          email: email.trim(),
          senha: senha.trim(),
        })
      } else {
        usuario = await entrarNaConta({
          email: email.trim(),
          senha: senha.trim(),
        })
      }

      aoLoginRealizado(usuario)
    } catch (error) {
      definirMensagemErro(
        estaEmModoCadastro
          ? 'Nao foi possivel criar a conta com esses dados.'
          : 'Nao foi possivel entrar com esses dados.'
      )
      console.error(error)
    } finally {
      definirCarregandoFormulario(false)
    }
  }

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
          <h2 id="titulo-login">
            {estaEmModoCadastro ? 'Criar sua conta' : 'Entrar na sua conta'}
          </h2>
          <p>
            {estaEmModoCadastro
              ? 'Se ainda nao tiver cadastro, crie sua conta para fazer pedidos.'
              : 'Entre com seu cadastro para continuar seu pedido.'}
          </p>
        </div>

        <div className="alternador-login">
          <button
            type="button"
            className={
              !estaEmModoCadastro
                ? 'botao-alternador-login botao-alternador-ativo'
                : 'botao-alternador-login'
            }
            onClick={() => {
              definirModoFormulario('login')
              definirMensagemErro('')
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={
              estaEmModoCadastro
                ? 'botao-alternador-login botao-alternador-ativo'
                : 'botao-alternador-login'
            }
            onClick={() => {
              definirModoFormulario('cadastro')
              definirMensagemErro('')
            }}
          >
            Criar conta
          </button>
        </div>

        <form className="formulario-login" onSubmit={enviarFormulario}>
          {estaEmModoCadastro && (
            <label className="campo-login">
              <span>Nome</span>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(evento) => definirNome(evento.target.value)}
              />
            </label>
          )}

          <label className="campo-login">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="seunome@email.com"
              value={email}
              onChange={(evento) => definirEmail(evento.target.value)}
            />
          </label>

          <label className="campo-login">
            <span>Senha</span>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(evento) => definirSenha(evento.target.value)}
            />
          </label>

          {mensagemErro && <p className="mensagem-erro-login">{mensagemErro}</p>}

          <button
            type="submit"
            className="botao-primario-login"
            disabled={carregandoFormulario}
          >
            {carregandoFormulario
              ? estaEmModoCadastro
                ? 'Criando conta...'
                : 'Entrando...'
              : estaEmModoCadastro
                ? 'Criar conta'
                : 'Entrar'}
          </button>

          <button
            type="button"
            className="link-login link-login-botao"
            onClick={trocarModoFormulario}
          >
            {estaEmModoCadastro
              ? 'Ja tenho conta'
              : 'Ainda nao tenho conta'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default TelaLogin
