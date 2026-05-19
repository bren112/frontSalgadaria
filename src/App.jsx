import { useEffect as usarEfeito, useState as usarEstado } from 'react'
import Cabecalho from './components/Header/Index'
import ListaSalgados from './components/SalgadosList/Index'
import './App.css'
import SecaoCarrinho from './pages/secCarrinho/secCarrinho'
import TelaLogin from './components/TelaLogin/Index'

const chaveUsuarioLocalStorage = 'malagutti_usuario_logado'

function lerUsuarioSalvo() {
  try {
    const usuarioSalvo = window.localStorage.getItem(chaveUsuarioLocalStorage)

    if (!usuarioSalvo) {
      return null
    }

    return JSON.parse(usuarioSalvo)
  } catch {
    return null
  }
}

function Aplicacao() {
  const [mostrarCarrinho, definirMostrarCarrinho] = usarEstado(false)
  const [mostrarLogin, definirMostrarLogin] = usarEstado(false)
  const [itensCarrinho, definirItensCarrinho] = usarEstado([])
  const [ultimoItemAdicionadoId, definirUltimoItemAdicionadoId] = usarEstado(null)
  const [usuarioLogado, definirUsuarioLogado] = usarEstado(() => lerUsuarioSalvo())
  const [atualizadorPedidos, definirAtualizadorPedidos] = usarEstado(0)

  usarEfeito(() => {
    try {
      if (usuarioLogado) {
        window.localStorage.setItem(
          chaveUsuarioLocalStorage,
          JSON.stringify(usuarioLogado)
        )
        return
      }

      window.localStorage.removeItem(chaveUsuarioLocalStorage)
    } catch {
    }
  }, [usuarioLogado])

  function adicionarAoCarrinho(produto) {
    definirMostrarCarrinho(true)
    definirUltimoItemAdicionadoId(produto.id)

    window.setTimeout(() => {
      definirUltimoItemAdicionadoId(null)
    }, 900)

    definirItensCarrinho((itensAtuais) => {
      const itemExistente = itensAtuais.find((item) => item.id === produto.id)

      if (itemExistente) {
        return itensAtuais.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }

      return [
        ...itensAtuais,
        {
          id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco) || 0,
          quantidade: 1,
        },
      ]
    })
  }

  function aumentarQuantidade(idProduto) {
    definirItensCarrinho((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === idProduto
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    )
  }

  function diminuirQuantidade(idProduto) {
    definirItensCarrinho((itensAtuais) =>
      itensAtuais
        .map((item) =>
          item.id === idProduto
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    )
  }

  function limparCarrinho() {
    definirItensCarrinho([])
  }

  function abrirCarrinho() {
    definirMostrarCarrinho(true)
  }

  function abrirLogin() {
    definirMostrarLogin(true)
  }

  function lidarComLogin(usuario) {
    definirUsuarioLogado(usuario)
    definirMostrarLogin(false)
  }

  function sairDaConta() {
    definirUsuarioLogado(null)
  }

  function atualizarListaPedidos() {
    definirAtualizadorPedidos((valorAtual) => valorAtual + 1)
  }

  return (
    <main className="app">
      <Cabecalho
        usuarioLogado={usuarioLogado}
        aoAbrirCarrinho={abrirCarrinho}
        aoAbrirLogin={abrirLogin}
        aoSair={sairDaConta}
      />
      <ListaSalgados
        aoAdicionar={adicionarAoCarrinho}
        ultimoItemAdicionadoId={ultimoItemAdicionadoId}
      />
      {mostrarCarrinho && (
        <SecaoCarrinho
          itensCarrinho={itensCarrinho}
          ultimoItemAdicionadoId={ultimoItemAdicionadoId}
          aoAumentarQuantidade={aumentarQuantidade}
          aoDiminuirQuantidade={diminuirQuantidade}
          aoLimparCarrinho={limparCarrinho}
          usuarioLogado={usuarioLogado}
          aoAbrirLogin={abrirLogin}
          aoPedidoCriado={atualizarListaPedidos}
          atualizadorPedidos={atualizadorPedidos}
          aoFechar={() => definirMostrarCarrinho(false)}
        />
      )}
      {mostrarLogin && (
        <TelaLogin
          aoFechar={() => definirMostrarLogin(false)}
          aoLoginRealizado={lidarComLogin}
        />
      )}
    </main>
  )
}

export default Aplicacao
