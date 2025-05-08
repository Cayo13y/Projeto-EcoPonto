let map;

const icons = {
  coleta: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/483/483361.png',
    iconSize: [30, 30]
  }),
  horta: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/766/766490.png',
    iconSize: [30, 30]
  }),
  feira: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2331/2331936.png',
    iconSize: [30, 30]
  })
};

window.onload = function () {
  map = L.map('map').setView([-15.7801, -47.9292], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Carrega pontos do Google Sheets e mostra no mapa
  fetch("https://script.google.com/macros/s/AKfycbzENDlrm_FGJkqkaevPhVpph3Fl_B5ZJ2Cvw1tkVsJpCm1PcnbMgNupklWn8xtdlWYvYg/exec")
    .then(response => response.json())
    .then(pontos => {
      pontos.forEach(ponto => {
        L.marker([ponto.latitude, ponto.longitude], {
          icon: icons[ponto.categoria]
        })
        .addTo(map)
        .bindPopup(`<b>${ponto.nome}</b><br>${ponto.descricao}`);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar pontos:", err);
    });
};

// Formulário para adicionar novo ponto
document.getElementById('add-point-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;
  const categoria = document.getElementById('categoria').value;
  const estado = document.getElementById('estado').value;
  const cidade = document.getElementById('cidade').value;
  const endereco = document.getElementById('endereco').value;
  const numero = document.getElementById('numero').value;
  const cep = document.getElementById('cep').value;

  const fullAddress = `${endereco}, ${numero}, ${cidade}, ${estado}, ${cep}, Brasil`;

  // Busca coordenadas com Nominatim
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`, {
    headers: {
      'User-Agent': 'EcoPontoApp/1.0 (seuemail@example.com)'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.length > 0) {
      const latitude = data[0].lat;
      const longitude = data[0].lon;

      // Envia os dados para o Google Sheets
      fetch("https://script.google.com/macros/s/AKfycbzENDlrm_FGJkqkaevPhVpph3Fl_B5ZJ2Cvw1tkVsJpCm1PcnbMgNupklWn8xtdlWYvYg/exec", {
        method: "POST",
        body: JSON.stringify({
          nome,
          descricao,
          categoria,
          estado,
          cidade,
          endereco,
          numero,
          cep,
          latitude,
          longitude
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Mostra o novo ponto no mapa
      L.marker([latitude, longitude], { icon: icons[categoria] })
        .addTo(map)
        .bindPopup(`<b>${nome}</b><br>${descricao}`)
        .openPopup();

      map.setView([latitude, longitude], 15);
      document.getElementById('add-point-form').reset();
    } else {
      alert("Endereço não encontrado. Verifique os dados.");
    }
  })
  .catch(error => {
    console.error("Erro ao buscar coordenadas:", error);
  });
});
