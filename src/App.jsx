import { useState as usarEstado } from 'react'
import Cabecalho from './components/Header/Index'
import ListaSalgados from './components/SalgadosList/Index'
import './App.css'
import SecaoCarrinho from './pages/secCarrinho/secCarrinho'
import TelaLogin from './components/TelaLogin/Index'

function Aplicacao() {
  const [mostrarCarrinho, definirMostrarCarrinho] = usarEstado(false)
  const [mostrarLogin, definirMostrarLogin] = usarEstado(false)

  return (
    <main className="app">
      <Cabecalho
        aoAbrirCarrinho={() => definirMostrarCarrinho(true)}
        aoAbrirLogin={() => definirMostrarLogin(true)}
      />
      <ListaSalgados />
      {mostrarCarrinho && (
        <SecaoCarrinho aoFechar={() => definirMostrarCarrinho(false)} />
      )}
      {mostrarLogin && (
        <TelaLogin aoFechar={() => definirMostrarLogin(false)} />
      )}
    </main>
  )
}

export default Aplicacao
