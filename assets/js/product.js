(window.webpackJsonp = window.webpackJsonp || []).push([
    [3],
    {
        187: function (t, s, e) {
            "use strict";
            e.r(s),
                e.d(s, "default", function () {
                    return a;
                });
            var i = e(1),
                n = e(3),
                r = e.n(n),
                o = e(41);
            class a extends o.a {
                static get Defaults() {
                    return i.a.extend({}, o.a.Defaults, { enableMq: "md-up" });
                }
                init() {
                    if (
                        ((this.$sliderContent = this.$container.find("[data-sticky-slider-content]")),
                            (this.height = 0),
                            !this.$sliderContent.length)
                    )
                        throw new Error("StickySlider content `[data-sticky-slider-content]` not found");
                    super.init();
                }
                enable() {
                    super.enable() &&
                        (this.$sliderContent.attr("data-sticky-slider-content-ready", ""), this.handleResize());
                }
                disable() {
                    super.disable() &&
                        (this.$sliderContent.css("transform", ""),
                            this.$sliderContent.removeAttr("data-sticky-slider-content-ready"),
                            this.$container.css("min-height", ""),
                            this.$container.get(0).style.removeProperty("--sticky-full-height"));
                }
                getConstraints() {
                    const t = super.getConstraints(),
                        s = this.$sliderContent,
                        e = Math.min(window.innerWidth, s.get(0).offsetWidth),
                        n = s.get(0).scrollWidth;
                    return i.a.extend(t, { maxScroll: Math.max(0, n - e) });
                }
                handleAfterResize() {
                    super.handleAfterResize();
                    const t = this.$container,
                        s = this.constraints.maxScroll + window.innerHeight;
                    s !== this.height &&
                        ((this.height = s),
                            t.css("min-height", s + "px"),
                            t.get(0).style.setProperty("--sticky-full-height", s + "px"),
                            t.trigger("resize").trigger("appear"));
                }
                update(t) {
                    const s = t * this.constraints.maxScroll * -1;
                    this.$sliderContent.css("transform", `translateX(${s}px)`),
                        this.$container.trigger("move.sticky-slider", { position: t, offset: s });
                }
                reset() {
                    this.$sliderContent.css("transform", ""),
                        this.$container.trigger("move.sticky-slider", { position: 0, offset: 0 });
                }
            }
            i.a.fn.stickySlider = r()(a);
        },
        458: function (t, s, e) {
            e(13), e(69), e(187), (t.exports = e(459));
        },
        459: function (t, s, e) {
            "use strict";
            e.r(s);
            var i = e(1),
                n = e(3),
                r = e.n(n),
                o = e(6);
            i.a.fn.cardsHover = r()(
                class {
                    static get Defaults() {
                        return {
                            cardClass: ".card",
                            cardContentClass: ".card__content",
                            cardHoverClass: ".card__hover",
                        };
                    }
                    constructor(t, s) {
                        (this.options = i.a.extend({}, this.constructor.Defaults, s)),
                            (this.$container = Object(i.a)(t)),
                            (this.$cards = this.$container.find(this.options.cardClass)),
                            (this.$content = this.$container.find(this.options.cardContentClass)),
                            (this.$hover = this.$container.find(this.options.cardHoverClass)),
                            o.a.hasHoverSupport() ||
                            (this.$content.on("click", this.open.bind(this)),
                                this.$hover.on("click", this.close.bind(this)),
                                this.$container.on("change.mobile-scrollable", this.closeAll.bind(this)));
                    }
                    open(t) {
                        const s = Object(i.a)(t.currentTarget).closest(this.options.cardClass);
                        this.closeAll(), s.addClass("is-open-hover");
                    }
                    close(t) {
                        Object(i.a)(t.currentTarget).closest(this.options.cardClass).removeClass("is-open-hover");
                    }
                    closeAll() {
                        this.$cards.removeClass("is-open-hover");
                    }
                }
            );
        },
    },
    [[458, 0]],
]);

// ===== PRODUCT PAGE =====
(async function () {
    const qs = new URLSearchParams(location.search);
    const productId = qs.get("productid");
    const CATALOG_URL = "/data/catalog.json";

    const $detail = document.getElementById("prd-detail");
    const $error = document.getElementById("prd-error");
    const $bc = document.getElementById("prd-bc");

    const $viewer = document.getElementById("prd-viewer");
    const $viewerImg = document.getElementById("prd-viewer-img");
    const $thumbs = document.getElementById("prd-thumbs");

    const $pName = document.getElementById("prd-name");
    const $pPrice = document.getElementById("prd-price");
    const $pColors = document.getElementById("prd-colors");
    const $pSizes = document.getElementById("prd-sizes");
    const $pMaterials = document.getElementById("prd-materials");
    const $pTags = document.getElementById("prd-tags");
    const $pSpecs = document.getElementById("prd-specs");

    if (!productId) return showError("Falta el parámetro ?productid=##");

    const moneyCOP = (v) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(v);

    const fetchJSON = async (u) => {
        const r = await fetch(u);
        if (!r.ok) throw new Error(`${u} -> ${r.status}`);
        return r.json();
    };

    function showError(msg) {
        $error.hidden = false;
        $error.textContent = msg || "Error cargando producto.";
    }

    async function resolveSrcById(id) {
        const catalog = await fetchJSON(CATALOG_URL);
        for (const cat of catalog.categories) {
            for (const p of cat.products) {
                if (String(p.id) === String(id)) {
                    const basePath = `/data/products/${cat.id}/${p.src}`;
                    return { basePath, category: cat.id, categoryLabel: cat.label };
                }
            }
        }
        return null;
    }

    function chips(arr, map) {
        return (arr || []).map(map).join("");
    }

    try {
        const resolved = await resolveSrcById(productId);
        if (!resolved) throw new Error("ID no encontrado en catalog.json");

        const productUrl = `${resolved.basePath}/product.json`;
        const prod = await fetchJSON(productUrl);

        // Breadcrumbs
        const catLabel = resolved.categoryLabel || prod.category || "Catálogo";
        $bc.innerHTML = `
      <a href="index.html">Inicio</a> / 
      <a href="catalogo.html?categoria=${resolved.category}">${catLabel}</a> / 
      <strong>${prod.name}</strong>`;

        // Información principal
        $pName.textContent = prod.name;

        /* function updateMeta(name, content, property = false) {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector);
            if (!meta) {
                meta = document.createElement('meta');
                if (property) meta.setAttribute('property', name);
                else meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        } */

        // Cambiar el título del navegador dinámicamente
        document.title = `${prod.name} | WILLZART`;

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${prod.name} | WILLZART`);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', `${prod.detail}`);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', `${window.location.origin}${resolved.basePath}/images/${prod.images[0]}`);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${prod.name} | WILLZART`);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', `${prod.detail}`);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', `${window.location.origin}${resolved.basePath}/images/${prod.images[0]}`);

        document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${window.location.origin}/product.html?productid=${prod.id}`);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${window.location.origin}/product.html?productid=${prod.id}`);

        // === ETIQUETAS DE PRODUCTO ===
        const $badges = document.getElementById("prd-badges");
        let badgesHTML = "";

        if (prod.is_new) {
            badgesHTML += `<span class="badge badge-nuevo me-1">NUEVO</span>`;
        }
        if (prod.is_featured) {
            badgesHTML += `<span class="badge badge-destacado me-1">DESTACADO</span>`;
        }
        $badges.innerHTML = badgesHTML;


        // Precio (con o sin oferta)
        if (prod.is_offer && prod.discount_price) {
            const descuento = Math.round((1 - prod.discount_price / prod.price) * 100);
            $pPrice.innerHTML = `
        <span class="text-danger text-decoration-line-through me-2">${moneyCOP(prod.price)}</span>
        <span class="fw-bold text-success">${moneyCOP(prod.discount_price)}</span>
        <small class="badge bg-warning-subtle text-dark ms-2">-${descuento}%</small>`;
        } else {
            $pPrice.innerHTML = `<span class="fw-bold text-primary">${moneyCOP(prod.price)}</span>`;
        }

        // Colores (doble color si hex1 existe)
        $pColors.innerHTML = chips(prod.colors, (c) => {
            const gradient = c.hex1
                ? `linear-gradient(90deg, ${c.hex} 50%, ${c.hex1} 50%)`
                : c.hex;
            return `<span class="chip">
        <i class="swatch" style="background:${gradient}" title="${c.name}"></i>${c.name}
      </span>`;
        });

        $pSizes.innerHTML = chips(prod.sizes, (s) => `<span class="chip">${s}</span>`);
        $pMaterials.innerHTML = chips(prod.materials, (m) => `<span class="chip">${m}</span>`);
        $pTags.innerHTML = chips(prod.tags, (t) => `<span class="chip">${t}</span>`);

        const baseSpecs = [
            prod.detail ? `${prod.detail}` : null,
            prod.id ? `Código de producto: ${prod.id}` : null
        ].filter(Boolean);
        $pSpecs.innerHTML = baseSpecs.map((s) => `<li>${s}</li>`).join("");

        // Galería
        const images = prod.images && prod.images.length ? prod.images : ["1.webp"];
        const fullPaths = images.map((img) => `${resolved.basePath}/images/${img}`);

        let current = 0;

        function setImage(i) {
            current = i;
            const url = fullPaths[i];
            $viewer.style.backgroundImage = `url('${url}')`;
            $viewerImg.src = url;
            $viewerImg.alt = `${prod.name} - imagen ${i + 1}`;
            $viewer.classList.remove("is-zoom");
            $viewer.style.backgroundPosition = "center";
            $thumbs.querySelectorAll("button").forEach((b, idx) =>
                b.setAttribute("aria-current", String(idx === i))
            );
        }

        $thumbs.innerHTML = fullPaths
            .map(
                (src, i) =>
                    `<button type="button" aria-current="${i === 0}"><img src="${src}" alt="Vista ${i + 1}" onerror="this.onerror=null; this.src='/assets/images/no-image.webp';"></button>`
            )
            .join("");
        Array.from($thumbs.children).forEach((btn, i) => btn.addEventListener("click", () => setImage(i)));

        // ---- ZOOM UNIVERSAL (PC + MÓVIL) ----
        let zoomed = false;
        let isPointerDown = false;
        let lastTapTime = 0;
        const isTouch = matchMedia("(pointer: coarse)").matches;

        function setZoom(on) {
            zoomed = on;
            $viewer.classList.toggle("is-zoom", on);
            if (!on) $viewer.style.backgroundPosition = "center";
        }

        function updatePosition(e, invert = false) {
            const rect = $viewer.getBoundingClientRect();
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;
            if (invert) {
                x = 100 - x;
                y = 100 - y;
            }
            $viewer.style.backgroundPosition = `${x}% ${y}%`;
        }

        if (!isTouch) {
            $viewer.addEventListener("click", () => setZoom(!zoomed));
            $viewer.addEventListener("mousemove", (e) => zoomed && updatePosition(e));
            $viewer.addEventListener("mouseleave", () => setZoom(false));
        } else {
            $viewer.addEventListener("pointerdown", (e) => {
                const now = Date.now();
                const diff = now - lastTapTime;
                if (diff < 300) setZoom(!zoomed);
                lastTapTime = now;
                if (zoomed) {
                    isPointerDown = true;
                    updatePosition(e, true);
                }
            });
            ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
                $viewer.addEventListener(ev, () => (isPointerDown = false))
            );
            $viewer.addEventListener("pointermove", (e) => zoomed && isPointerDown && updatePosition(e, true));
        }

        window.addEventListener("keydown", (ev) => {
            if (ev.key === "ArrowRight") setImage((current + 1) % fullPaths.length);
            if (ev.key === "ArrowLeft") setImage((current - 1 + fullPaths.length) % fullPaths.length);
        });

        setImage(0);
        $detail.hidden = false;
    } catch (err) {
        console.error(err);
        showError("No se pudo cargar el producto.");
    }
})();
