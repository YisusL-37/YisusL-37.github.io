document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // MENÚ MOVIL
    // =====================
    const btnMenu = document.getElementById('btn-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.getElementById('overlay-menu');
    const btnCerrar = menuLateral?.querySelector('.cerrar-menu');

    function abrirMenu() {
        menuLateral.classList.add('activo');
        overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }

    function cerrarMenu() {
        menuLateral.classList.remove('activo');
        overlay.classList.remove('activo');
        document.body.style.overflow = '';
    }

    if (btnMenu && menuLateral && overlay) {
        btnMenu.addEventListener('click', abrirMenu);
        btnCerrar?.addEventListener('click', cerrarMenu);
        overlay.addEventListener('click', cerrarMenu);
    }

    // =====================
    // BUSCADOR + OCULTAR BANNER
    // =====================
    const buscarInput = document.getElementById('buscar');
    const verTodoBtn = document.getElementById('verTodo');
    const secciones = document.querySelectorAll('main section');
    const boletin = document.getElementById('boletin') || document.getElementById('carrusel-banners');

    if (buscarInput && verTodoBtn && secciones.length) {
        buscarInput.addEventListener('input', () => {
            const filtro = buscarInput.value.toLowerCase();
            let hayCoincidencias = false;

            secciones.forEach(seccion => {
                const productos = seccion.querySelectorAll('.producto');
                let coincidencias = 0;

                productos.forEach(prod => {
                    const texto = prod.textContent.toLowerCase();
                    const visible = texto.includes(filtro);
                    prod.style.display = visible ? 'block' : 'none';
                    if (visible)
                        coincidencias++;
                });

                seccion.style.display = coincidencias > 0 ? 'block' : 'none';
                if (coincidencias > 0)
                    hayCoincidencias = true;
            });

            if (boletin)
                boletin.style.display = filtro ? 'none' : 'block';
        });

        verTodoBtn.addEventListener('click', () => {
            buscarInput.value = '';
            secciones.forEach(seccion => {
                seccion.style.display = 'block';
                seccion.querySelectorAll('.producto').forEach(prod => {
                    prod.style.display = 'block';
                });
            });
            if (boletin)
                boletin.style.display = 'block';
        });
    }

    // =====================
    // CARRUSEL DE BANNERS (RADIOS)
    // =====================
    const carruselBanners = document.getElementById('carrusel-banners');
    if (carruselBanners) {
        const radios = Array.from(carruselBanners.querySelectorAll('input[name="radio-btn"]'));
        const btnNext = carruselBanners.querySelector('.arrow-next');
        const btnPrev = carruselBanners.querySelector('.arrow-prev');

        let currentIndex = radios.findIndex(r => r.checked);
        if (currentIndex === -1) {
            currentIndex = 0;
            radios[0].checked = true;
        }

        function showSlide(index) {
            const total = radios.length;
            currentIndex = (index + total) % total;
            radios[currentIndex].checked = true;
        }

        btnNext?.addEventListener('click', () => showSlide(currentIndex + 1));
        btnPrev?.addEventListener('click', () => showSlide(currentIndex - 1));

        radios.forEach((radio, idx) => {
            radio.addEventListener('change', () => {
                if (radio.checked)
                    currentIndex = idx;
            });
        });
    }

    // =====================
    // MINI-CARRITO EMERGENTE
    // =====================
    const IGV = 0.18;

    function getCarrito() {
        const data = localStorage.getItem('carritoUTP');
        return data ? JSON.parse(data) : [];
    }

    function saveCarrito(carrito) {
        localStorage.setItem('carritoUTP', JSON.stringify(carrito));
    }

    function slugify(text) {
        return text
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
    }

    function actualizarMiniCarrito() {
        const carrito = getCarrito();
        const lista = document.getElementById('mini-carrito-lista');
        const totalSpan = document.getElementById('mini-carrito-total');
        if (!lista || !totalSpan)
            return;

        lista.innerHTML = '';
        let total = 0;

        carrito.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nombre} x${item.cantidad} - S/ ${(item.precio * item.cantidad).toFixed(2)}`;
            lista.appendChild(li);
            total += item.precio * item.cantidad;
        });

        totalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }

    function mostrarMiniCarrito() {
        document.getElementById('mini-carrito')?.classList.remove('oculto');
    }

    document.getElementById('btn-cerrar-mini')?.addEventListener('click', () => {
        document.getElementById('mini-carrito')?.classList.add('oculto');
    });

    document.getElementById('btn-proceder')?.addEventListener('click', () => {
        window.location.href = 'carrito.html';
    });

    // =====================
    // BOTONES AGREGAR PRODUCTO
    // =====================
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    botonesAgregar.forEach(btn => {
        if (btn.dataset.listenerAttached === "true")
            return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            const tarjeta = btn.closest('.producto');
            if (!tarjeta)
                return;

            const nombre = tarjeta.querySelector('h3')?.textContent.trim() || 'Producto';
            const descElem = Array.from(tarjeta.querySelectorAll('p')).find(p => !p.classList.contains('precio'));
            const descripcion = descElem ? descElem.textContent.trim() : '';
            const precioTexto = tarjeta.querySelector('.precio')?.textContent || '0';
            const precio = parseFloat(precioTexto.replace('S/', '').replace(',', '.').trim()) || 0;
            const id = slugify(nombre);
            const imgSrc = tarjeta.querySelector('img')?.getAttribute('src') || '';

            let carrito = getCarrito();
            const existente = carrito.find(item => item.id === id);

            if (existente) {
                existente.cantidad += 1;
            } else {
                carrito.push({id, nombre, descripcion, precio, cantidad: 1, imagen: imgSrc});
            }

            saveCarrito(carrito);
            actualizarMiniCarrito();
            mostrarMiniCarrito();
        });

        btn.dataset.listenerAttached = "true";
    });

    // =====================
    // CARRITO COMPLETO
    // =====================
    const tbody = document.getElementById('carrito-body');
    const baseSpan = document.getElementById('base-imponible');
    const igvSpan = document.getElementById('igv');
    const totalSpan = document.getElementById('total');

    if (tbody && baseSpan && igvSpan && totalSpan) {
        let carrito = getCarrito();

        function actualizarTotales() {
            const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
            const base = total / (1 + IGV);
            const igv = total - base;

            baseSpan.textContent = `S/ ${base.toFixed(2)}`;
            igvSpan.textContent = `S/ ${igv.toFixed(2)}`;
            totalSpan.textContent = `S/ ${total.toFixed(2)}`;
        }

        function renderCarrito() {
            tbody.innerHTML = '';

            if (!carrito.length) {
                const fila = document.createElement('tr');
                const celda = document.createElement('td');
                celda.colSpan = 6;
                celda.textContent = 'Tu carrito está vacío.';
                celda.classList.add('carrito-vacio');
                fila.appendChild(celda);
                tbody.appendChild(fila);
                actualizarTotales();
                return;
            }

            carrito.forEach(item => {
                const tr = document.createElement('tr');
                tr.dataset.id = item.id;
                tr.innerHTML = `
          <td class="col-imagen">
            <img src="${item.imagen}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
          </td>
          <td class="col-nombre">
            <strong>${item.nombre}</strong><br>
            <small>${item.descripcion}</small>
          </td>
          <td class="col-precio">S/ ${item.precio.toFixed(2)}</td>
          <td class="col-cantidad">
            <button class="btn-cantidad btn-restar">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad btn-sumar">+</button>
          </td>
          <td class="col-subtotal">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
          <td class="col-eliminar">
            <button class="btn-eliminar">Eliminar</button>
          </td>
        `;
                tbody.appendChild(tr);
            });

            actualizarTotales();
        }

        // Eventos para sumar/restar/eliminar
        tbody.addEventListener('click', e => {
            const btn = e.target;
            const fila = btn.closest('tr');
            if (!fila)
                return;
            const id = fila.dataset.id;
            const item = carrito.find(i => i.id === id);
            if (!item)
                return;

            if (btn.classList.contains('btn-sumar')) {
                item.cantidad++;
            } else if (btn.classList.contains('btn-restar')) {
                if (item.cantidad > 1) {
                    item.cantidad--;
                } else {
                    carrito = carrito.filter(i => i.id !== id);
                }
            } else if (btn.classList.contains('btn-eliminar')) {
                carrito = carrito.filter(i => i.id !== id);
            }

            saveCarrito(carrito);
            renderCarrito();
        });

        // Render inicial
        renderCarrito();

        // =====================
        // PAGO Y TICKET
        // =====================
        const formPago = document.getElementById('form-pago');
        const ticketDiv = document.getElementById('ticket');
        const ticketContenido = document.getElementById('ticket-contenido');
        const btnImprimir = document.getElementById('btn-imprimir');

        function generarCodigoPedido() {
            const ahora = new Date();
            const parteTiempo = ahora.getTime().toString(36).slice(-6);
            const random = Math.floor(Math.random() * 46656).toString(36).padStart(3, '0');
            return (parteTiempo + random).toUpperCase();
        }

        if (formPago && ticketDiv && ticketContenido) {
            formPago.addEventListener('submit', e => {
                e.preventDefault();

                if (!carrito.length) {
                    alert('Tu carrito está vacío.');
                    return;
                }

                const codigoEstudiante = document.getElementById('codigo-estudiante')?.value.trim();
                if (!codigoEstudiante) {
                    alert('Por favor, ingresa tu código de estudiante.');
                    return;
                }

                const fecha = new Date();
                const fechaTexto = fecha.toLocaleString('es-PE', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                });

                const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
                const base = total / (1 + IGV);
                const igv = total - base;
                const codigoPedido = generarCodigoPedido();

                let detalleHTML = `
          <h3>Ticket de compra - Kiosco UTP</h3>
          <p><strong>Código de estudiante:</strong> ${codigoEstudiante}</p>
          <p><strong>Fecha y hora:</strong> ${fechaTexto}</p>
          <p><strong>Código de recogida:</strong> ${codigoPedido}</p>
          <hr>
          <table class="ticket-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
        `;

                carrito.forEach(item => {
                    detalleHTML += `
            <tr>
              <td>${item.nombre}</td>
              <td>${item.cantidad}</td>
              <td>S/ ${item.precio.toFixed(2)}</td>
              <td>S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
            </tr>
          `;
                });

                detalleHTML += `
            </tbody>
          </table>
          <hr>
          <p><strong>Base imponible:</strong> S/ ${base.toFixed(2)}</p>
          <p><strong>IGV (18%):</strong> S/ ${igv.toFixed(2)}</p>
          <p><strong>Total a pagar:</strong> S/ ${total.toFixed(2)}</p>
          <p style="margin-top:10px;">Presenta este código en caja para recoger tu pedido.</p>
        `;

                ticketContenido.innerHTML = detalleHTML;
                ticketDiv.classList.remove('oculto');

                carrito = [];
                saveCarrito(carrito);
                renderCarrito();
                formPago.reset();
            });
        }

        btnImprimir?.addEventListener('click', () => {
            window.print();
        });
    }
});
