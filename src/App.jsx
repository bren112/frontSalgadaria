import { useState as usarEstado } from 'react'
import Cabecalho from './components/Header/Index'
import ListaSalgados from './components/SalgadosList/Index'
import './App.css'
import SecaoCarrinho from './pages/secCarrinho/secCarrinho'
import TelaLogin from './components/TelaLogin/Index'

function Aplicacao() {
  const [mostrarCarrinho, definirMostrarCarrinho] = usarEstado(false)
  const [mostrarLogin, definirMostrarLogin] = usarEstado(false)
  const [itensCarrinho, definirItensCarrinho] = usarEstado([])
  const [ultimoItemAdicionadoId, definirUltimoItemAdicionadoId] = usarEstado(null)

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

  return (
    <main className="app">
      <Cabecalho
        aoAbrirCarrinho={() => definirMostrarCarrinho(true)}
        aoAbrirLogin={() => definirMostrarLogin(true)}
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
          aoFechar={() => definirMostrarCarrinho(false)}
        />
      )}
      {mostrarLogin && (
        <TelaLogin aoFechar={() => definirMostrarLogin(false)} />
      )}
    </main>
  )
}

export default Aplicacao
