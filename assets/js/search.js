async function initSearch() {
    const input = document.getElementById("searchInput");
    const resultsBox = document.getElementById("searchResults");
    const clearBtn = document.getElementById("clearSearch");
    const preloader = document.getElementById("preloader");

    if (!input || !resultsBox) return;

    // === Cargar catálogo completo ===
    const res = await fetch("/data/catalog.json");
    const catalog = await res.json();

    let allProducts = [];
    for (const cat of catalog.categories) {
        for (const p of cat.products) {
            const basePath = `/data/products/${cat.id}/${p.src}`;
            const url = `${basePath}/product.json`;
            try {
                const data = await (await fetch(url)).json();
                data.category = cat.label;
                data.basePath = basePath;
                allProducts.push(data);
            } catch (e) {
                console.warn("No se pudo leer", url);
            }
        }
    }

    // === Función auxiliar: similitud de palabras ===
    function similarity(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        const longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        let same = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer[i] === shorter[i]) same++;
        }
        return same / longerLength;
    }

    // === Mostrar preloader suave ===
    function smoothNavigate(url) {
        preloader.style.opacity = "1";
        preloader.style.visibility = "visible";
        setTimeout(() => {
            window.location.href = url;
        }, 400);
    }

    // === Estado del autocompletado
    let activeIndex = -1;

    // === Buscar coincidencias
    input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        clearBtn.style.display = q ? "block" : "none";
        activeIndex = -1;

        if (q.length < 3) {
            resultsBox.innerHTML = "";
            resultsBox.classList.remove("visible");
            return;
        }

        const productos = allProducts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.gender || "").toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
            (p.materials || []).some(m => m.toLowerCase().includes(q)) ||
            (p.colors || []).some(c =>
                (c.name || "").toLowerCase().includes(q) ||
                (c.hex || "").toLowerCase().includes(q)
            ) ||
            String(p.id).includes(q)
        );

        const categorias = [...new Set(productos.map(p => p.category))];

        // === Sugerencia “Quizás quisiste decir”
        const todasPalabras = [
            ...new Set(allProducts.flatMap(p => [
                p.name,
                ...(p.tags || []),
                p.category,
                ...(p.materials || []),
                ...(p.colors || []).map(c => c.name)
            ].filter(Boolean)))
        ];

        let sugerencia = null;
        let maxScore = 0;

        todasPalabras.forEach(palabra => {
            const score = similarity(q, palabra);
            if (score > maxScore && score < 1 && palabra.length > 2) {
                maxScore = score;
                sugerencia = palabra;
            }
        });

        // === Renderizado ===
        resultsBox.innerHTML = "";

        // 🔹 Sugerencia
        if (sugerencia && maxScore > 0.45 && sugerencia.toLowerCase() !== q) {
            const sectionSugg = document.createElement("section");
            sectionSugg.innerHTML = `
        <h6>¿Quizás quisiste decir?</h6>
        <div class="item suggest">${sugerencia}</div>
      `;
            sectionSugg.querySelector(".suggest").onclick = () => {
                input.value = sugerencia;
                input.dispatchEvent(new Event("input"));
            };
            resultsBox.appendChild(sectionSugg);
        }

        // 🔹 Productos
        if (productos.length) {
            const section = document.createElement("section");
            section.innerHTML = `<h6>Productos</h6>`;

            productos.slice(0, 6).forEach(p => {
                const div = document.createElement("div");
                div.className = "item";
                div.setAttribute("data-url", `product.html?productid=${p.id}`);

                const img = document.createElement("img");
                const imagePath = `${p.basePath}/images/${p.images?.[0] || "no-image.webp"}`;
                img.src = imagePath;
                img.onerror = () => (img.src = "/assets/images/no-image.webp");

                const div_span = document.createElement("div");

                const span = document.createElement("span");
                span.textContent = p.name;

                if (p.no_stock) {
                    const span_agotado = document.createElement("span");
                    span_agotado.className = "badge-search badge-agotado ms-1";
                    span_agotado.textContent = "AGOTADO";
                    div_span.append(span, span_agotado);
                } else {
                    div_span.append(span);
                }
                div.append(img, div_span);
                section.appendChild(div);
            });

            resultsBox.appendChild(section);
        }

        // 🔹 Categorías
        if (categorias.length) {
            const sectionCat = document.createElement("section");
            sectionCat.innerHTML = `<h6>Categorías</h6>`;
            categorias.forEach(c => {
                const div = document.createElement("div");
                div.className = "item";
                div.textContent = c;
                div.setAttribute("data-url", `catalogo.html?categoria=${c.toLowerCase()}`);
                sectionCat.appendChild(div);
            });
            resultsBox.appendChild(sectionCat);
        }

        // 🔹 Sin resultados
        if (!productos.length && !categorias.length && !sugerencia) {
            resultsBox.innerHTML = `<p class="text-muted px-3 py-2 mb-0">No se encontraron resultados para "<strong>${q}</strong>".</p>`;
        }

        resultsBox.classList.add("visible");
    });

    // === Navegación por teclado (↑ ↓ Enter)
    input.addEventListener("keydown", (e) => {
        const items = Array.from(resultsBox.querySelectorAll(".item"));
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const url = items[activeIndex].getAttribute("data-url");
            if (url) smoothNavigate(url);
            return;
        }

        items.forEach((el, i) => {
            el.classList.toggle("active", i === activeIndex);
        });
    });

    // === Click directo sobre un resultado
    resultsBox.addEventListener("click", (e) => {
        const item = e.target.closest(".item");
        if (item && item.dataset.url) smoothNavigate(item.dataset.url);
    });

    // === Limpiar búsqueda
    clearBtn.addEventListener("click", () => {
        input.value = "";
        clearBtn.style.display = "none";
        resultsBox.classList.remove("visible");
    });

    // === Cerrar si se hace clic fuera
    document.addEventListener("click", (e) => {
        if (!resultsBox.contains(e.target) && e.target !== input) {
            resultsBox.classList.remove("visible");
        }
    });
}
