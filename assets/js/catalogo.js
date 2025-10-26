const contenedor = document.getElementById('productosContainer');
const filterCategoria = document.getElementById('filterCategoria');
const filterPrecio = document.getElementById('filterPrecio');
const precioValor = document.getElementById('precioValor');
const filterTallas = document.getElementById('filterTallas');
const filterColores = document.getElementById('filterColores');
const btnLimpiar = document.getElementById('btnLimpiarFiltros');

const filterNuevo = document.getElementById('filterNuevo');
const filterDestacado = document.getElementById('filterDestacado');
const filterOferta = document.getElementById('filterOferta');
const filterHombre = document.getElementById('filterHombre');
const filterMujer = document.getElementById('filterMujer');
const filterUnisex = document.getElementById('filterUnisex');
const filterDeportiva = document.getElementById('filterDeportiva');

let todosProductos = [];

/* ===========================================
   FUNCIONES DE CARGA Y DESHABILITADO
=========================================== */

// 🔹 Deshabilita o habilita todos los filtros
function setFiltrosHabilitados(estado) {
    filterCategoria.disabled = !estado;
    filterPrecio.disabled = !estado;
    btnLimpiar.disabled = !estado;

    document.querySelectorAll('.filter-talla, .color-filter').forEach(el => {
        el.classList.toggle('disabled', !estado);
        el.style.pointerEvents = estado ? 'auto' : 'none';
        el.style.opacity = estado ? '1' : '0.5';
    });
}

// 🔹 Mostrar mensaje de carga
function mostrarCargando() {
    contenedor.innerHTML = `
    <div class="text-center py-5 w-100">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Cargando productos...</p>
    </div>
  `;
}

/* ===========================================
   CARGA DE CATÁLOGO
=========================================== */

(async function cargarCatalogo() {
    try {
        // Deshabilitar filtros y mostrar spinner
        setFiltrosHabilitados(false);
        mostrarCargando();

        const res = await fetch('/data/catalog.json');
        const catalog = await res.json();

        // Cargar productos de cada categoría
        for (const categoria of catalog.categories) {
            for (const producto of categoria.products) {
                // Construir la ruta completa automáticamente
                const basePath = `/data/products/${categoria.id}/${producto.src}`;
                const productUrl = `${basePath}/product.json`;

                const pRes = await fetch(productUrl);
                const pData = await pRes.json();

                // guardar información base
                pData.basePath = basePath;
                pData.categoryLabel = categoria.label;

                todosProductos.push(pData);
            }
        }


        poblarFiltros(catalog.categories);
        mostrarProductos(todosProductos);

        // 🔹 Calcular el precio máximo dinámicamente
        let precioMaximo = Math.max(...todosProductos.map(p => p.price));
        precioMaximo = Math.ceil(precioMaximo / 50000) * 50000; // redondear al múltiplo superior
        filterPrecio.max = precioMaximo;
        filterPrecio.value = precioMaximo;
        precioValor.textContent = `$${precioMaximo.toLocaleString('es-CO')}`;

        // 🔹 Habilitar filtros
        setFiltrosHabilitados(true);

        // Aplicar filtros desde la URL si existen
        aplicarFiltrosDesdeURL();
        filtrar(false);

    } catch (error) {
        contenedor.innerHTML = `<p class="text-danger text-center mt-5">Error cargando catálogo.</p>`;
        console.error(error);
    }
})();

/* ===========================================
   FILTROS Y RENDERIZADO
=========================================== */

function poblarFiltros(categories) {
    // 🔸 Categorías
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.label.toLowerCase();
        option.textContent = cat.label;
        filterCategoria.appendChild(option);
    });

    // 🔸 Tallas únicas
    const tallas = [...new Set(todosProductos.flatMap(p => p.sizes))];
    tallas.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-dark btn-sm filter-talla';
        btn.textContent = t;
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled')) return;
            document.querySelectorAll('.filter-talla').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrar();
        });
        filterTallas.appendChild(btn);
    });

    // 🔸 Colores únicos
    const colores = [
        ...new Set(todosProductos.flatMap(p => p.colors.map(c => JSON.stringify(c))))
    ].map(c => JSON.parse(c));

    colores.forEach(color => {
        const span = document.createElement("span");
        span.className = "color-filter";
        span.dataset.hex = color.hex;
        span.style.background = color.hex1
            ? `linear-gradient(90deg, ${color.hex} 50%, ${color.hex1} 50%)`
            : color.hex;
        span.title = color.name;

        span.addEventListener("click", () => {
            if (span.classList.contains("disabled")) return;
            document.querySelectorAll(".color-filter").forEach(c => c.classList.remove("active"));
            span.classList.add("active");
            filtrar();
        });

        filterColores.appendChild(span);
    });


    // 🔸 Listeners de select y rango
    filterCategoria.addEventListener('change', filtrar);
    filterPrecio.addEventListener('input', () => {
        precioValor.textContent = `$${parseInt(filterPrecio.value).toLocaleString('es-CO')}`;
        filtrar();
    });

    // 🔸 Listeners de checkboxes
    [
        filterNuevo, filterDestacado, filterOferta,
        filterHombre, filterMujer, filterUnisex, filterDeportiva
    ].forEach(cb => cb.addEventListener('change', filtrar));

    // 🔸 Botón limpiar
    btnLimpiar.addEventListener('click', limpiarFiltros);
}

function mostrarProductos(productos) {
    contenedor.innerHTML = '';

    if (!productos.length) {
        contenedor.innerHTML = '<p class="text-center text-muted mt-5">No se encontraron productos.</p>';
        return;
    }

    productos.forEach(p => {
        // === Calcular etiquetas ===
        let badges = '';

        // 🟠 Oferta
        if (p.is_offer && p.discount_price) {
            const descuento = Math.round((1 - p.discount_price / p.price) * 100);
            badges += `<span class="badge badge-oferta m-1">OFERTA -${descuento}%</span>`;
        }

        // 🔵 Nuevo
        if (p.is_new) {
            badges += `<span class="badge badge-nuevo m-1">NUEVO</span>`;
        }

        // 🟢 Destacado
        if (p.is_featured) {
            badges += `<span class="badge badge-destacado m-1">DESTACADO</span>`;
        }

        // === Calcular precio ===
        let precioHTML = `<div style="display: flex; align-items: center;"><p class="fw-semibold text-primary mb-0">$${p.price.toLocaleString('es-CO')}</p>`;
        let overlay_img = `product-image-container`;
        if (p.is_offer && p.discount_price) {
            precioHTML = `
        <p class="text-danger text-decoration-line-through mb-0">$${p.price.toLocaleString('es-CO')}</p>
        <div style="display: flex; align-items: center;">
        <p class="fw-semibold text-primary mb-0">$${p.discount_price.toLocaleString('es-CO')}</p>
        `;
            if (p.no_stock) {
                precioHTML += `<span class="badge badge-agotado ms-2">AGOTADO</span>`;
                overlay_img = `product-image-container show-overlay`;
            } else {
                overlay_img = `product-image-container`;
            };            
        } else {
            if (p.no_stock) {
                precioHTML += `<span class="badge badge-agotado ms-2">AGOTADO</span>`;
                overlay_img = `product-image-container show-overlay`;
            } else {
                overlay_img = `product-image-container`;
            };
        }
        precioHTML += `</div>`;

        const url = `product.html?productid=${p.id}`;

        contenedor.innerHTML += `
      <div class="col-sm-6 col-md-4">
        <div class="card product-card h-100 position-relative" onclick="window.location.href='${url}'">
          <div class="badges-container position-absolute top-0 start-0 p-2 d-flex flex-column">
            ${badges}
          </div>
          <div class="${overlay_img}">
            <img src="${getImagePath(p, p.images[0])}" class="card-img-top" alt="${p.name}" onerror="this.src='/assets/images/no-image.webp';">
          </div>
          <div class="card-body">
            <h6 class="fw-bold mb-1">${p.name}</h6>
            <p class="text-muted small mb-1">${p.categoryLabel}</p>
            ${precioHTML}
          </div>
        </div>
      </div>`;
    });
}

/* ===========================================
   FILTRADO CON SOPORTE URL
=========================================== */

function filtrar(updateUrl = true) {
    const categoria = filterCategoria.value;
    const talla = document.querySelector('.filter-talla.active')?.textContent || '';
    const color = document.querySelector('.color-filter.active')?.dataset.hex || '';
    const precioMax = parseInt(filterPrecio.value);

    const mostrarNuevos = filterNuevo.checked;
    const mostrarDestacados = filterDestacado.checked;
    const mostrarOfertas = filterOferta.checked;
    const mostrarHombre = filterHombre.checked;
    const mostrarMujer = filterMujer.checked;
    const mostrarUnisex = filterUnisex.checked;
    const mostrarDeportiva = filterDeportiva.checked;

    const filtrados = todosProductos.filter(p => {
        // === ETIQUETAS (nuevo, destacado, oferta) ===
        const coincideEtiqueta =
            (!mostrarNuevos && !mostrarDestacados && !mostrarOfertas) ||
            (mostrarNuevos && p.is_new) ||
            (mostrarDestacados && p.is_featured) ||
            (mostrarOfertas && p.is_offer);

        // === GÉNERO ===
        const coincideGenero =
            (!mostrarHombre && !mostrarMujer && !mostrarUnisex) ||
            (mostrarHombre && (p.gender === 'hombre' || p.gender === 'unisex')) ||
            (mostrarMujer && (p.gender === 'mujer' || p.gender === 'unisex')) ||
            (mostrarUnisex && p.gender === 'unisex');

        // === DEPORTIVA (booleano)
        const coincideEstilo =
            (!mostrarDeportiva) || (mostrarDeportiva && p.is_sport === true);

        return (
            (!categoria || p.categoryLabel.toLowerCase() === categoria) &&
            (!talla || p.sizes.includes(talla)) &&
            (!color || p.colors.some(c => c.hex === color)) &&
            (p.discount_price <= precioMax) &&
            coincideEtiqueta &&
            coincideGenero &&
            coincideEstilo
        );
    });

    mostrarProductos(filtrados);

    if (updateUrl) actualizarURL();
}

function limpiarFiltros() {
    filterCategoria.value = '';
    filterPrecio.value = filterPrecio.max;
    precioValor.textContent = `$${parseInt(filterPrecio.max).toLocaleString('es-CO')}`;
    document.querySelectorAll('.filter-talla, .color-filter').forEach(el => el.classList.remove('active'));
    [filterNuevo, filterDestacado, filterOferta, filterHombre, filterMujer, filterUnisex, filterDeportiva]
        .forEach(cb => cb.checked = false);
    mostrarProductos(todosProductos);
    actualizarURL();
}

function actualizarURL() {
    const params = new URLSearchParams();

    // 🔹 Nueva línea: categoría seleccionada
    if (filterCategoria.value) params.set('categoria', filterCategoria.value);

    if (filterNuevo.checked) params.set('nuevo', 1);
    if (filterDestacado.checked) params.set('destacado', 1);
    if (filterOferta.checked) params.set('oferta', 1);
    if (filterHombre.checked) params.set('hombre', 1);
    if (filterMujer.checked) params.set('mujer', 1);
    if (filterUnisex.checked) params.set('unisex', 1);
    if (filterDeportiva.checked) params.set('deportiva', 1);

    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    history.replaceState(null, '', url);
}


function aplicarFiltrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);

    // 🔹 Leer la categoría desde la URL
    if (params.has('categoria')) {
        filterCategoria.value = params.get('categoria');
    }

    filterNuevo.checked = params.has('nuevo');
    filterDestacado.checked = params.has('destacado');
    filterOferta.checked = params.has('oferta');
    filterHombre.checked = params.has('hombre');
    filterMujer.checked = params.has('mujer');
    filterUnisex.checked = params.has('unisex');
    filterDeportiva.checked = params.has('deportiva');
}

function getImagePath(p, imageName) {
    if (p.basePath) {
        return `${p.basePath}/images/${imageName}`;
    }
    return `/images/${imageName}`;
}

// Filtros plegables en móvil
(function () {
    const filters = document.getElementById('filters');
    const toggle = document.getElementById('filtersToggle');
    const body = document.getElementById('filtersBody');
    if (!filters || !toggle || !body) return;



    const isMobile = () => window.matchMedia('(max-width: 767.98px)').matches;

    function setOpen(open) {
        filters.dataset.open = open ? 'true' : 'false';
        toggle.setAttribute('aria-expanded', String(open));

        if (isMobile()) {
            if (open) {
                // 2) Resetea para calcular altura real
                body.style.maxHeight = 'none';
                // 3) Mide y aplica con un pequeño buffer para márgenes/bordes
                const target = body.scrollHeight + 30; // px extra evita cortes
                // 4) Prepara la animación desde 0
                body.style.maxHeight = '0px';
                requestAnimationFrame(() => { body.style.maxHeight = target + 'px'; });
            } else {
                // Cierre: anima desde altura actual a 0
                const current = body.scrollHeight + 30;
                body.style.maxHeight = current + 'px';
                requestAnimationFrame(() => { body.style.maxHeight = '0px'; });

                // Quita padding al terminar (para que cerrado quede bien pegado)
                body.addEventListener('transitionend', function onEnd() {
                    body.removeEventListener('transitionend', onEnd);
                }, { once: true });
            }
        } else {
            // Desktop: abierto sin límites
            body.style.maxHeight = 'none';
            body.classList.add('p-3');
        }
    }


    toggle.addEventListener('click', () => {
        setOpen(filters.dataset.open !== 'true');
    });

    // Desktop siempre abierto; móvil inicia cerrado
    function applyByViewport() {
        setOpen(!isMobile());
    }
    window.addEventListener('resize', applyByViewport);
    applyByViewport();
})();
