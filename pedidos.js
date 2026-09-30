(function () {
  const VERSION = '1.0.0';
  let idMontado = null;
  const pedidos = [];

  const ESTADOS = ['Recibido', 'En preparación', 'En camino', 'Entregado'];

  const CSS = `
    .ped-titulo { color: #0b4f8a; margin: 0 0 4px; }
    .ped-tarjeta { background: #fff; border: 1px solid #dde3ea; padding: 16px; margin-bottom: 12px; border-radius: 6px; }
    .ped-id { font-weight: bold; font-size: 16px; }
    .ped-estado { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #eaf3fb; color: #0b4f8a; margin-top: 8px; }
  `;

  function asegurarEstilos() {
    if (document.getElementById('ped-estilos')) return;
    const s = document.createElement('style');
    s.id = 'ped-estilos';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function pintar() {
    if (!idMontado) return;
    const raiz = document.getElementById(idMontado);
    let html = `<h2 class="ped-titulo">Seguimiento de pedidos</h2>
                <span style="font-size:12px; color:#888;">mfe-pedidos v${VERSION}</span>`;
    if (pedidos.length === 0) {
      html += '<p>No hay pedidos en curso.</p>';
    } else {
      html += pedidos.map(p => `
        <div class="ped-tarjeta">
          <div class="ped-id">Pedido: ${p.id}</div>
          <div>Total: $${p.total}</div>
          <div class="ped-estado">${p.estado}</div>
        </div>
      `).join('');
    }
    raiz.innerHTML = html;
  }

  window.addEventListener('pedido:confirmado', function (e) {
    const pedido = {
      id: e.detail.id,
      total: e.detail.total,
      estadoIndex: 0,
      estado: ESTADOS[0]
    };
    
    pedido.intervalo = setInterval(function () {
      if (pedido.estadoIndex < ESTADOS.length - 1) {
        pedido.estadoIndex++;
        pedido.estado = ESTADOS[pedido.estadoIndex];
        
        window.dispatchEvent(new CustomEvent('pedido:estado', {
          detail: {
            version: 1,
            id: pedido.id,
            estado: pedido.estado
          }
        }));
        
        pintar();
        
        if (pedido.estadoIndex === ESTADOS.length - 1) {
          clearInterval(pedido.intervalo);
        }
      }
    }, 5000);
    
    pedidos.push(pedido);
    pintar();
  });

  window.renderPedidos = function (idContenedor) {
    asegurarEstilos();
    idMontado = idContenedor;
    pintar();
  };

  window.unmountPedidos = function (idContenedor) {
    const raiz = document.getElementById(idContenedor);
    if (raiz) raiz.innerHTML = '';
    idMontado = null;
  };
})();
