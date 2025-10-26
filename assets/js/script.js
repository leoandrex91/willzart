document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // --- Al terminar de cargar la página (fade out) ---
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.remove("active");
      preloader.classList.add("fade-out");
    }, 1000);
  });

  // --- Al hacer click en enlaces internos (fade in) ---
  document.querySelectorAll("a[href]").forEach(link => {
    const url = link.getAttribute("href");

    // Evita aplicar el efecto a enlaces externos, anclas o vacíos
    if (!url || url.startsWith("#") || url.startsWith("http")) return;

    link.addEventListener("click", e => {
      e.preventDefault();
      preloader.classList.remove("fade-out");
      preloader.classList.add("active");

      setTimeout(() => {
        window.location.href = url;
      }, 1000);
    });
  });
});


(async function ProductsSection() {
  const CATALOG_URL = "/data/catalog.json";
  const $tabs = document.querySelector(".products__tabs");
  const $wrap = document.querySelector(".products__carousels");
  if (!$tabs || !$wrap) return;

  const moneyCOP = v => new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(v);

  const fetchJSON = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(url);
    return r.json();
  };

  const catalog = await fetchJSON(CATALOG_URL);
  let allProducts = [];

  for (const cat of catalog.categories) {
    for (const entry of cat.products) {
      try {
        const basePath = `/data/products/${cat.id}/${entry.src}`;
        const productUrl = `${basePath}/product.json`;
        const p = await fetchJSON(productUrl);
        allProducts.push({ ...p, basePath, id: entry.id });
      } catch (e) {
        console.warn("No se pudo cargar", entry, e);
      }
    }
  }

  const grupos = {
    destacados: allProducts.filter(p => p.is_featured),
    nuevos: allProducts.filter(p => p.is_new),
    ofertas: allProducts.filter(p => p.is_offer)
  };

  const tabs = [
    { id: "destacados", label: "Destacados" },
    { id: "nuevos", label: "Nuevos" },
    { id: "ofertas", label: "Ofertas" }
  ];

  // Crear tabs
  tabs.forEach((t, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.role = "tab";
    b.textContent = t.label;
    b.dataset.cat = t.id;
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", () => {
      document.querySelectorAll(".products__tabs button").forEach(x => x.setAttribute("aria-selected", "false"));
      b.setAttribute("aria-selected", "true");
      document.querySelectorAll(".products__carousel").forEach(c => c.hidden = true);
      document.querySelector(`.products__carousel[data-cat="${t.id}"]`).hidden = false;
    });
    $tabs.appendChild(b);
  });

  // Crear carruseles
  for (const tab of tabs) {
    const items = grupos[tab.id];
    if (!items.length) continue;

    const carousel = document.createElement("div");
    carousel.className = "products__carousel";
    carousel.dataset.cat = tab.id;

    const prev = Object.assign(document.createElement("button"), {
      className: "products__btn products__btn--prev",
      innerText: "‹"
    });
    const next = Object.assign(document.createElement("button"), {
      className: "products__btn products__btn--next",
      innerText: "›"
    });
    const track = Object.assign(document.createElement("div"), {
      className: "products__track"
    });

    carousel.append(prev, next, track);
    $wrap.appendChild(carousel);

    for (const p of items) {
      const images = (p.images || []).map(img => `${p.basePath}/images/${img}`);
      let currentImg = 0;

      // Etiquetas
      let badges = "";
      if (p.is_new) badges += `<span class="badge badge-nuevo me-1">NUEVO</span>`;
      if (p.is_featured) badges += `<span class="badge badge-destacado me-1">DESTACADO</span>`;
      if (p.is_offer && p.discount_price) {
        const descuento = Math.round((1 - p.discount_price / p.price) * 100);
        badges += `<span class="badge badge-oferta me-1">OFERTA -${descuento}%</span>`;
      }

      // Precio
      let priceHTML = "";
      if (p.is_offer && p.discount_price) {
        if (p.no_stock) {
          priceHTML = `
          <div class="product-card__price">
            <span class="badge badge-agotado me-1">AGOTADO</span>
            <span class="text-danger text-decoration-line-through me-2 small">${moneyCOP(p.price)}</span>
            <span class="fw-bold text-success">${moneyCOP(p.discount_price)}</span>
          </div>`;
        } else {
          priceHTML = `
          <div class="product-card__price">
            <span class="text-danger text-decoration-line-through me-2 small">${moneyCOP(p.price)}</span>
            <span class="fw-bold text-success">${moneyCOP(p.discount_price)}</span>
          </div>`;
        }

      } else {
        if (p.no_stock) {
          priceHTML = `
          <div class="product-card__price">
            <span class="badge badge-agotado me-1">AGOTADO</span>
            <span class="fw-bold text-primary">${moneyCOP(p.price)}</span>
          </div>`;
        } else {
          priceHTML = `
          <div class="product-card__price">
            <span class="fw-bold text-primary">${moneyCOP(p.price)}</span>
          </div>`;
        }
      }

      // Colores
      const colorHTML = (p.colors || [])
        .map(c => {
          const dual = c.hex1
            ? `background: linear-gradient(90deg, ${c.hex} 50%, ${c.hex1} 50%)`
            : `background:${c.hex}`;
          return `<span class="color-dot" title="${c.name}" style="${dual}" data-color="${c.name}"></span>`;
        })
        .join("");

      const card = document.createElement("article");
      card.className = "product-card";
      let overlay_img = `product-card__media`;
      if (p.no_stock) {
        overlay_img = `product-card__media show-overlay`;
      } else {
        overlay_img = `product-card__media`;
      };
      card.innerHTML = `
      <div class="${overlay_img}" aria-label="${p.name}">
        <div class="badges-container">
          ${badges}
        </div>
        <a href="product.html?productid=${encodeURIComponent(p.id)}" class="image-wrapper">
          <img src="${images[0] || '/assets/images/no-image.webp'}" alt="${p.name}" class="fade-image" onerror="this.src='/assets/images/no-image.webp';">
        </a>
      </div>
      <div class="product-card__body">
        ${priceHTML}
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__colors">${colorHTML}</div>
      </div>
      `;


      const imgTag = card.querySelector("img");
      const colorDots = card.querySelectorAll(".color-dot");

      // Función animada para cambiar imagen
      function changeImage(newSrc) {
        imgTag.classList.remove("fade-in", "fade-out");
        void imgTag.offsetWidth;
        imgTag.classList.add("fade-out");

        setTimeout(() => {
          imgTag.src = newSrc;
          imgTag.classList.remove("fade-out");
          imgTag.classList.add("fade-in");
        }, 500);
      }


      // Click en color → cambia imagen con animación
      /* colorDots.forEach((dot, idx) => {
        dot.addEventListener("click", e => {
          e.stopPropagation();
          if (images[idx]) {
            currentImg = idx;
            changeImage(images[idx]);
          }
        });
      }); */

      // Rotación automática con animación
      if (images.length > 1) {
        let interval;
        const startRotation = () => {
          interval = setInterval(() => {
            currentImg = (currentImg + 1) % images.length;
            changeImage(images[currentImg]);
          }, 3000);
        };
        const stopRotation = () => clearInterval(interval);

        card.addEventListener("mouseenter", stopRotation);
        card.addEventListener("mouseleave", startRotation);
        startRotation();
      }

      track.appendChild(card);
    }

    function getScrollStep(track) {
      const firstCard = track.querySelector(".product-card");
      if (!firstCard) return 340;
      return firstCard.getBoundingClientRect().width + 18;
    }

    prev.addEventListener("click", () => {
      const step = getScrollStep(track);
      track.scrollBy({ left: -step, behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      const step = getScrollStep(track);
      track.scrollBy({ left: step, behavior: "smooth" });
    });

  }

  document.querySelectorAll(".products__carousel").forEach((c, i) => c.hidden = i !== 0);
})();


document.addEventListener("DOMContentLoaded", () => {
  // === Generar navbar dinámicamente ===
  const header = document.querySelector("header") || document.body;

  const navbarHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm" data-bs-theme="dark">
    <div class="overlay-navbar"></div>
    <div class="container">
      <a class="navbar-brand d-lg-none" href="index.html">
        <img src="/assets/images/logos/logo_top.svg" class="icon logo">
        <img src="/assets/images/logos/logo_top_text.svg" class="icon text">
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas"
        aria-controls="offcanvas" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
        <div class="offcanvas-header">
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav flex-grow-1 justify-content-between" id="navbarLinks">
            <li class="nav-item d-none d-lg-block">
              <a class="nav-link" href="index.html" aria-label="Logo Willzart">
                <img src="/assets/images/logos/logo_top.svg" class="icon logo">
                <img src="/assets/images/logos/logo_top_text.svg" class="icon text">
              </a>
            </li>            
          </ul>
        </div>
      </div>
    </div>
  </nav>
  `;

  header.insertAdjacentHTML("afterbegin", navbarHTML);

  // === Agregar los links ===
  const links = [
    { label: "MUJER", href: "catalogo.html?mujer=1" },
    { label: "HOMBRE", href: "catalogo.html?hombre=1" },
    { label: "DEPORTIVA", href: "catalogo.html?deportiva=1" },
    { label: "RECORDS", href: "records.html" }
  ];

  const navbarLinks = document.getElementById("navbarLinks");

  links.forEach(link => {
    const li = document.createElement("li");
    li.className = "nav-item menu-links";
    li.innerHTML = `<a class="nav-link" href="${link.href}">${link.label}</a>`;
    navbarLinks.appendChild(li);
  });

  // Carrito Desktop
  const cartDesktop = document.createElement("li");
  cartDesktop.className = "nav-item";
  cartDesktop.innerHTML = `
    <a class="nav-link d-none d-lg-block" href="carrito.html" aria-label="Cart">
      <i class="bi bi-cart"></i>
    </a>`;
  navbarLinks.appendChild(cartDesktop);

  // Carrito Móvil + texto
  const cartMobile = document.createElement("li");
  cartMobile.className = "nav-item menu-links";
  cartMobile.innerHTML = `
    <a class="nav-link d-lg-none" href="como-comprar.html" aria-label="Cart">
      <i class="bi bi-cart"></i> COMO COMPRAR
    </a>`;
  navbarLinks.appendChild(cartMobile);

  // Search Box
  const search = document.createElement("form");
  search.className = "search-box position-relative";
  search.role = "search";
  search.addEventListener("submit", (e) => e.preventDefault());
  search.innerHTML = `
    <input type="text" id="searchInput" class="form-control" placeholder="Buscar..." autocomplete="off">
  <button type="button" id="clearSearch" class="clear-btn" aria-label="Limpiar búsqueda">
    <i class="bi bi-x"></i>
  </button>
  <i class="bi bi-search search-icon"></i>
  <div id="searchResults" class="search-results shadow-lg rounded"></div>`;
  navbarLinks.appendChild(search);

  // === Marcar enlace activo ===
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar .nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });

  // === ESPERAR a que la navbar esté en el DOM antes de activar scroll ===
  requestAnimationFrame(() => initNavbarScroll());
});

/* ==========================================
   FUNCIÓN PARA OCULTAR NAVBAR AL SCROLL
========================================== */
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  let lastScroll = 0;
  const delta = 5; // sensibilidad mínima
  const navbarHeight = navbar.offsetHeight;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    // No hacer nada si el desplazamiento es pequeño
    if (Math.abs(lastScroll - currentScroll) <= delta) return;

    if (currentScroll > lastScroll && currentScroll > navbarHeight + 20) {
      // Bajando: ocultar
      navbar.classList.add("navbar-hidden");
    } else {
      // Subiendo: mostrar
      navbar.classList.remove("navbar-hidden");
    }

    lastScroll = currentScroll;
  });

  // Evitar que se oculte si el offcanvas está abierto
  const offcanvasEl = document.getElementById("offcanvas");
  if (offcanvasEl) {
    offcanvasEl.addEventListener("show.bs.offcanvas", () => {
      navbar.classList.remove("navbar-hidden");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.createElement("footer");
  footerContainer.className = "container py-5";
  footerContainer.innerHTML = `
    <div class="row">
      <div class="col-12 col-md-4">
        <img src="/assets/images/logos/logo_top.svg" class="icon-f logo">
        <img src="/assets/images/logos/logo_top_text.svg" class="icon-f text">
        <p class="text-muted small mt-2 mb-0">
          © <span id="year"></span>. Todos los derechos reservados.        
        </p>
        <p class="text-muted small mb-0 pt-3">
          Desarrollado por PowerDevelop
        </p>
      </div>      

      <div class="col-12 col-md">
        <ul class="list-unstyled text-small">
          <li><a href="como-comprar.html" class="link-secondary text-decoration-none">Cómo comprar</a></li>
          <li><a href="#" class="link-secondary text-decoration-none">Envíos y entregas</a></li>
          <li><a href="#" class="link-secondary text-decoration-none">Cambios y devoluciones</a></li>
          <li><a href="#" class="link-secondary text-decoration-none">Preguntas frecuentes</a></li>
        </ul>
      </div>

      <div class="col-12 col-md">
        <ul class="list-unstyled text-small">
          <li><a href="#" class="link-secondary text-decoration-none">Sobre nosotros</a></li>
          <li><a href="#" class="link-secondary text-decoration-none">Tiendas</a></li>
          <li><a href="#" class="link-secondary text-decoration-none">Términos y privacidad</a></li>
        </ul>
      </div>

      <div class="col-12 col-md">
        <div class="d-flex justify-content-center justify-content-md-start gap-3">
          <a href="#" class="text-secondary fs-5"><i class="bi bi-instagram"></i></a>
          <a href="#" class="text-secondary fs-5"><i class="bi bi-facebook"></i></a>
          <a href="#" class="text-secondary fs-5"><i class="bi bi-tiktok"></i></a>
          <a href="#" class="text-secondary fs-5"><i class="bi bi-whatsapp"></i></a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(footerContainer);
  document.getElementById("year").textContent = new Date().getFullYear();
});

// === CARGAR SEARCH.JS DINÁMICAMENTE ===
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Error al cargar ${src}`));
    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Espera a que el navbar esté dibujado
    await new Promise(res => setTimeout(res, 300));

    // Carga dinámica del buscador
    await loadScript("/assets/js/search.js");

    // Llama a la función una vez esté cargado
    if (typeof initSearch === "function") {
      initSearch();
      console.log("Buscador inicializado correctamente");
    } else {
      console.warn("Error al inicializar el buscador");
    }
  } catch (err) {
    console.error("Error al cargar search.js:", err);
  }
});
