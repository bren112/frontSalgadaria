import { useEffect as usarEfeito, useState as usarEstado } from 'react'
import Cabecalho from './components/Header/Index'
import ListaSalgados from './components/SalgadosList/Index'
import './App.css'
import SecaoCarrinho from './pages/secCarrinho/secCarrinho'
import TelaLogin from './components/TelaLogin/Index'
import PaginaAdmin from './pages/admin/Index'

const chaveUsuarioLocalStorage = 'malagutti_usuario_logado'
const rotaAdmin = '/admin'

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

function lerRotaAtual() {
  return window.location.pathname || '/'
}

function navegarPara(rota) {
  if (window.location.pathname === rota) {
    return
  }

  window.history.pushState({}, '', rota)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Aplicacao() {
  const [mostrarCarrinho, definirMostrarCarrinho] = usarEstado(false)
  const [mostrarLogin, definirMostrarLogin] = usarEstado(false)
  const [itensCarrinho, definirItensCarrinho] = usarEstado([])
  const [ultimoItemAdicionadoId, definirUltimoItemAdicionadoId] = usarEstado(null)
  const [usuarioLogado, definirUsuarioLogado] = usarEstado(() => lerUsuarioSalvo())
  const [atualizadorPedidos, definirAtualizadorPedidos] = usarEstado(0)
  const [atualizadorProdutos, definirAtualizadorProdutos] = usarEstado(0)
  const [rotaAtual, definirRotaAtual] = usarEstado(() => lerRotaAtual())
  const usuarioEhAdmin = Boolean(usuarioLogado?.admin)
  const estaNaRotaAdmin = rotaAtual === rotaAdmin

  usarEfeito(() => {
    function sincronizarRota() {
      definirRotaAtual(lerRotaAtual())
    }

    window.addEventListener('popstate', sincronizarRota)

    return () => {
      window.removeEventListener('popstate', sincronizarRota)
    }
  }, [])

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

  usarEfeito(() => {
    if (usuarioEhAdmin && !estaNaRotaAdmin) {
      navegarPara(rotaAdmin)
      return
    }

    if (!usuarioEhAdmin && estaNaRotaAdmin) {
      navegarPara('/')
    }
  }, [estaNaRotaAdmin, usuarioEhAdmin])

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

    if (usuario?.admin) {
      navegarPara(rotaAdmin)
    }
  }

  function sairDaConta() {
    definirUsuarioLogado(null)
    definirMostrarCarrinho(false)
    navegarPara('/')
  }

  function atualizarListaPedidos() {
    definirAtualizadorPedidos((valorAtual) => valorAtual + 1)
  }

  function atualizarListaProdutos() {
    definirAtualizadorProdutos((valorAtual) => valorAtual + 1)
  }

  return (
    <main className="app">
      <Cabecalho
        usuarioLogado={usuarioLogado}
        aoAbrirCarrinho={abrirCarrinho}
        aoAbrirLogin={abrirLogin}
        aoSair={sairDaConta}
        esconderCarrinho={usuarioEhAdmin}
      />

      {usuarioEhAdmin ? (
        <PaginaAdmin
          usuarioLogado={usuarioLogado}
          atualizadorPedidos={atualizadorPedidos}
          aoAtualizarProdutos={atualizarListaProdutos}
        />
      ) : (
        <>
          <ListaSalgados
            aoAdicionar={adicionarAoCarrinho}
            ultimoItemAdicionadoId={ultimoItemAdicionadoId}
            atualizadorProdutos={atualizadorProdutos}
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
        </>
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
