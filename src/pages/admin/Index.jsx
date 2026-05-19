import { useEffect, useState } from 'react'
import PedidosPendentes from '../../components/PedidosPendentes/Index'
import './admin.css'

const urlsApiPedidosPendentes = [
  'http://localhost:8080/pedidos/pendentes',
  'https://backsalgadaria.onrender.com/pedidos/pendentes',
]

const urlsApiPedidosConcluidos = [
  'http://localhost:8080/pedidos/concluidos',
  'https://backsalgadaria.onrender.com/pedidos/concluidos',
]

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`
}

async function buscarPedidosPorUrl({ usuarioLogado, urlsBase }) {
  for (const urlBase of urlsBase) {
    try {
      const url = new URL(urlBase)

      if (usuarioLogado?.id) {
        url.searchParams.set('usuarioId', String(usuarioLogado.id))
      }

      const resposta = await fetch(url)

      if (resposta.ok) {
        return await resposta.json()
      }
    } catch {
    }
  }

  throw new Error('Nao foi possivel carregar os dados do dashboard.')
}

function montarResumoClientes(pedidosPendentes, pedidosEntregues) {
  const pedidos = [...pedidosPendentes, ...pedidosEntregues]
  const clientes = new Map()

  pedidos.forEach((pedido) => {
    const email = pedido.email_id || 'Cliente nao identificado'
    const clienteAtual = clientes.get(email) || {
      nome: email,
      quantidadePedidos: 0,
      valorTotal: 0,
    }

    clienteAtual.quantidadePedidos += 1
    clienteAtual.valorTotal += Number(pedido.valorTotal || 0)
    clientes.set(email, clienteAtual)
  })

  return Array.from(clientes.values()).sort(
    (clienteA, clienteB) => clienteB.quantidadePedidos - clienteA.quantidadePedidos
  )
}

function PaginaAdmin({ usuarioLogado, atualizadorPedidos }) {
  const [abaAtiva, definirAbaAtiva] = useState('dashboard')
  const [atualizadorAdmin, definirAtualizadorAdmin] = useState(0)
  const [pedidosPendentes, definirPedidosPendentes] = useState([])
  const [pedidosEntregues, definirPedidosEntregues] = useState([])
  const [carregandoDashboard, definirCarregandoDashboard] = useState(true)
  const [erroDashboard, definirErroDashboard] = useState('')

  useEffect(() => {
    async function carregarDashboard() {
      if (!usuarioLogado?.id) {
        definirPedidosPendentes([])
        definirPedidosEntregues([])
        definirCarregandoDashboard(false)
        definirErroDashboard('')
        return
      }

      try {
        definirCarregandoDashboard(true)
        definirErroDashboard('')

        const [listaPendentes, listaEntregues] = await Promise.all([
          buscarPedidosPorUrl({
            usuarioLogado,
            urlsBase: urlsApiPedidosPendentes,
          }),
          buscarPedidosPorUrl({
            usuarioLogado,
            urlsBase: urlsApiPedidosConcluidos,
          }),
        ])

        definirPedidosPendentes(listaPendentes)
        definirPedidosEntregues(listaEntregues)
      } catch (error) {
        definirErroDashboard('Nao foi possivel carregar o dashboard.')
        console.error(error)
      } finally {
        definirCarregandoDashboard(false)
      }
    }

    carregarDashboard()
  }, [usuarioLogado, atualizadorPedidos, atualizadorAdmin])

  function sincronizarPedidos() {
    definirAtualizadorAdmin((valorAtual) => valorAtual + 1)
  }

  const valorTotalEntregue = pedidosEntregues.reduce((total, pedido) => {
    return total + Number(pedido.valorTotal || 0)
  }, 0)

  const resumoClientes = montarResumoClientes(pedidosPendentes, pedidosEntregues)
  const quantidadeClientes = resumoClientes.length

  return (
    <section className="pagina-admin">
      <div className="topo-admin">
        <div>
          <span className="tag-admin">Painel</span>
          <h1>Painel de pedidos</h1>
          <p>
            Acompanhe os pedidos da loja, marque como entregue e acompanhe o resumo
            geral em secoes separadas.
          </p>
        </div>

        <div className="resumo-admin">
          <span>Administrador</span>
          <strong>{usuarioLogado?.nome || usuarioLogado?.email}</strong>
        </div>
      </div>

      <section className="secao-abas-admin">
        <div className="abas-admin">
          <button
            type="button"
            className={
              abaAtiva === 'dashboard' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={
              abaAtiva === 'pendentes' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('pendentes')}
          >
            Pendentes
          </button>
          <button
            type="button"
            className={
              abaAtiva === 'entregues' ? 'aba-admin aba-admin-ativa' : 'aba-admin'
            }
            onClick={() => definirAbaAtiva('entregues')}
          >
            Entregues
          </button>
        </div>
      </section>

      {abaAtiva === 'dashboard' && (
        <div className="grade-dashboard-admin">
          <section className="bloco-dashboard-admin">
            <span className="rotulo-dashboard-admin">Valor total entregue</span>
            <strong className="valor-dashboard-admin">
              {carregandoDashboard ? 'Carregando...' : formatarMoeda(valorTotalEntregue)}
            </strong>
            <p>Soma dos pedidos que ja foram marcados como entregues.</p>
          </section>

          <section className="bloco-dashboard-admin">
            <span className="rotulo-dashboard-admin">Quantidade de clientes</span>
            <strong className="valor-dashboard-admin">
              {carregandoDashboard ? 'Carregando...' : quantidadeClientes}
            </strong>
            <p>Total de clientes unicos encontrados entre pedidos pendentes e entregues.</p>
          </section>

          <section className="bloco-dashboard-admin secao-clientes-admin">
            <div className="cabecalho-clientes-admin">
              <div>
                <span className="rotulo-dashboard-admin">Clientes</span>
                <h2>Nome e quantidade de pedidos</h2>
              </div>
            </div>

            {erroDashboard && <p className="mensagem-dashboard-admin">{erroDashboard}</p>}

            {carregandoDashboard && (
              <p className="mensagem-dashboard-admin">Carregando resumo de clientes...</p>
            )}

            {!carregandoDashboard && !erroDashboard && resumoClientes.length === 0 && (
              <p className="mensagem-dashboard-admin">Nenhum cliente encontrado no momento.</p>
            )}

            {!carregandoDashboard && !erroDashboard && resumoClientes.length > 0 && (
              <div className="lista-clientes-admin">
                {resumoClientes.map((cliente) => (
                  <article key={cliente.nome} className="item-cliente-admin">
                    <div>
                      <h3>{cliente.nome}</h3>
                      <p>{cliente.quantidadePedidos} pedidos</p>
                    </div>
                    <strong>{formatarMoeda(cliente.valorTotal)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {abaAtiva === 'pendentes' && (
        <PedidosPendentes
          usuarioLogado={usuarioLogado}
          atualizadorLista={atualizadorPedidos + atualizadorAdmin}
          titulo="Pedidos pendentes"
          descricao="Pedidos aguardando atendimento e confirmacao de entrega."
          mostrarEmailPedido
          permitirMarcarPago
          aoAtualizarPedidos={sincronizarPedidos}
        />
      )}

      {abaAtiva === 'entregues' && (
        <PedidosPendentes
          usuarioLogado={usuarioLogado}
          atualizadorLista={atualizadorPedidos + atualizadorAdmin}
          tipo="concluidos"
          titulo="Pedidos entregues"
          descricao="Pedidos que ja foram finalizados e marcados como entregues."
          mostrarEmailPedido
        />
      )}
    </section>
  )
}

export default PaginaAdmin
