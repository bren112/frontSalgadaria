import { useEffect, useState } from 'react'
import './salgados-list.css'

function ListaSalgados() {
  const [salgados, setSalgados] = useState([])

  useEffect(() => {
    async function carregar() {
      // const response = await fetch('http://localhost:8080/salgados')  
      const response = await fetch('https://backsalgadaria.onrender.com/salgados')  
      const data = await response.json()
      setSalgados(data) // salva os dados no estado 
    }

    carregar()
  }, [])

  return (
    <section className="salgados-section">
      <div className="salgados-topo">
        <span className="salgados-tag">Cardapio</span>
        <h1>Lista de salgados</h1>
        <p>Escolha seus favoritos para montar um pedido rapido e saboroso.</p>
      </div>

      <div className="salgados-grid">
        {salgados.map((itemSalgado) => (
          <article className="salgado-card" key={itemSalgado.id}>
            <img
              className="imagem-salgado"
              src={itemSalgado.imagem_url}
              alt={itemSalgado.nome}
            />
            <span className="salgado-destaque">{itemSalgado.nome}</span>
            <h2>{itemSalgado.nome}</h2>
            <p>{itemSalgado.descricao}</p>
            <div className="salgado-rodape">
              {/* <strong>{itemSalgado.preco}</strong> */}
              <button>Adicionar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ListaSalgados