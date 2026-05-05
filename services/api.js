const API_URL = 'http://localhost:3000';

export async function getEventos() {
  const response = await fetch(`${API_URL}/eventos`);
  return response.json();
}

export async function criarEvento(data) {
  const response = await fetch(`${API_URL}/eventos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',  // informa ao backend que os dados estão em formato JSON
    },
    body: JSON.stringify(data), // converte o objeto (data) em JSON para enviar na requ
  });

  return response.json();
}