import { StrictMode as ModoEstrito } from 'react'
import { createRoot as criarRaiz } from 'react-dom/client'
import './index.css'
import Aplicacao from './App.jsx'

criarRaiz(document.getElementById('root')).render(
  <ModoEstrito>
    <Aplicacao />
  </ModoEstrito>,
)
