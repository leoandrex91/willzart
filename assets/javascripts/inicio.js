(window.webpackJsonp = window.webpackJsonp || []).push([
    [27], {
        100: function (e, t) {
            e.exports = "#define SPEED_OUTER 12.0\n#define SPEED_INNER 48.0\n#define SCALE_RING_COUNT 2.0\n#define SCALE_RING_LENGTH 1.5\n\nuniform float uTime;\nuniform float uProgress;\nuniform sampler2D uNoiseTexture;\nuniform vec3 uInnerColor;\nuniform vec3 uOuterColor;\n\nvarying vec2 vUv;\n\nfloat inverseLerp(float v, float minValue, float maxValue) {\n    return (v - minValue) / (maxValue - minValue);\n}\n\nfloat remap(float v, float inMin, float inMax, float outMin, float outMax) {\n    float t = inverseLerp(v, inMin, inMax);\n    return mix(outMin, outMax, t);\n}\n\nfloat blendAdd(float base, float blend) {\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendAdd(vec3 base, vec3 blend) {\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendAdd(vec3 base, vec3 blend, float opacity) {\n\treturn (blendAdd(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvoid main() {\n    // Half a ring\n    if (vUv.x < 0.5) discard;\n\n    vec4 color = vec4(0.0);\n    color.a = 1.0;\n\n    float iterations = 3.0;\n\n    for(float i = 0.0; i < iterations; i++)\n    {\n        float progress = i / (iterations - 1.0);\n\n        float intensity = 1.0 - ((vUv.y - progress) * iterations) * 0.5;\n        intensity = smoothstep(0.0, 1.0, intensity);\n\n        vec2 uv = vUv;\n        uv.y *= SCALE_RING_COUNT;\n        uv.x /= SCALE_RING_LENGTH;\n        uv.x -= uTime / ((i * (SPEED_INNER - SPEED_OUTER)) + SPEED_OUTER);\n\n        vec3 ringColor = mix(uInnerColor, uOuterColor, progress);\n\n        float noiseIntensity = texture(uNoiseTexture, uv).r;\n\n        ringColor = mix(vec3(0.0), ringColor.rgb, noiseIntensity * intensity);\n\n        color.rgb = blendAdd(color.rgb, ringColor);\n    }\n\n    // float edgesAttenuation = max(1.0, min(inverseLerp(vUv.y, 0.0, 0.2), inverseLerp(vUv.y, 1.0, 0.8)));\n    float edgesAttenuation = sin(vUv.y * 3.141592 + 0.4) + 1.0;\n\n    color.rgb = mix(vec3(0.0), color.rgb, edgesAttenuation);\n\n    // End\n    float progressStart = max(0.0, uProgress / 2.0 + 0.5 - 0.15);\n    float progressEnd = uProgress / 2.0 + 0.5;\n    float endAttenuation = 1.0 - smoothstep(progressStart, progressEnd, vUv.x);\n\n    // gl_FragColor = vec4(uInnerColor, 1.0);\n    float lum = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n    gl_FragColor = color;\n    gl_FragColor.a = lum * endAttenuation;\n\n    // float c = clamp(1.0 - (vUv.x - 0.5) * 2.0, 0.0, 1.0);\n    // gl_FragColor = vec4(c, c, c, 1.0);\n    // gl_FragColor = vec4(0.0, 0.0, 0.0, c);\n}\n"
        },
        101: function (e, t) {
            e.exports = "varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n"
        },
        102: function (e, t) {
            e.exports = "uniform float uParallax;\nuniform sampler2D map;\n\nvarying vec2 vUv;\n\nvoid main() {\n    float scale = 1.2;\n    float scaleInverse = 1.0 / scale;\n    float offset = 1.0 - scaleInverse;\n\n    vec2 adjustedvUV = vec2(\n        vUv.x * scaleInverse + offset * 0.5,\n        vUv.y * scaleInverse + uParallax * offset\n    );\n\n    gl_FragColor = texture2D(map, adjustedvUV);\n}\n"
        },
        176: function (e, t, i) {
            "use strict";
            i.r(t), i.d(t, "default", (function () {
                return l
            }));
            var n = i(2),
                s = i.n(n),
                o = i(3),
                a = i.n(o),
                r = (i(52), i(87));
            i(136);
            class l extends r.default {
                constructor(e, t) {
                    super(e, t), this.$contentTemplate = e.find(".js-video-modal-content").template()
                }
                show(e) {
                    super.show(e);
                    const t = {
                        videoId: e.data("videoModalVideoId") || "",
                        videoType: e.data("videoModalVideoEmbedType"),
                        videoWidth: e.data("videoModalVideoWidth"),
                        videoHeight: e.data("videoModalVideoHeight"),
                        videoFullScreen: e.data("videoModalVideoFullscreen") || !1
                    };
                    this.$contentTemplate.template("replace", t)
                }
                afterModalHide() {
                    super.afterModalHide(), this.$contentTemplate.template("replace", {
                        videoId: null
                    })
                }
            }
            s.a.fn.videoModal = a()(l, {
                api: ["show", "hide", "toggle", "instance"]
            })
        },
        191: function (e, t, i) {
            "use strict";
            i.r(t);
            var n = i(1),
                s = i(3),
                o = i.n(s),
                a = i(0),
                r = i(16),
                l = i(25),
                d = {
                    rand_vect: function () {
                        let e = 2 * Math.random() * Math.PI;
                        return {
                            x: Math.cos(e),
                            y: Math.sin(e)
                        }
                    },
                    dot_prod_grid: function (e, t, i, n) {
                        let s, o = e - i,
                            a = t - n;
                        return this.gradients[[i, n]] ? s = this.gradients[[i, n]] : (s = this.rand_vect(), this.gradients[[i, n]] = s), o * s.x + a * s.y
                    },
                    smootherstep: function (e) {
                        return 6 * e ** 5 - 15 * e ** 4 + 10 * e ** 3
                    },
                    interp: function (e, t, i) {
                        return t + this.smootherstep(e) * (i - t)
                    },
                    seed: function () {
                        this.gradients = {}, this.memory = {}
                    },
                    get: function (e, t) {
                        if (this.memory.hasOwnProperty([e, t])) return this.memory[[e, t]];
                        let i = Math.floor(e),
                            n = Math.floor(t),
                            s = this.dot_prod_grid(e, t, i, n),
                            o = this.dot_prod_grid(e, t, i + 1, n),
                            a = this.dot_prod_grid(e, t, i, n + 1),
                            r = this.dot_prod_grid(e, t, i + 1, n + 1),
                            l = this.interp(e - i, s, o),
                            d = this.interp(e - i, a, r),
                            h = this.interp(t - n, l, d);
                        return this.memory[[e, t]] = h, h
                    }
                };
            let h = null;

            function u() {
                let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 128;
                if (!h) {
                    const t = document.createElement("canvas");
                    t.width = t.height = e, t.style.position = "fixed", t.style.zIndex = 100, t.style.left = 0, t.style.top = 0, d.seed();
                    const i = t.getContext("2d"),
                        n = i.getImageData(0, 0, e, e),
                        s = n.data;
                    for (let t = 0; t < s.length; t += 4) {
                        const i = t / 4 % e,
                            n = ~~(t / 4 / e);
                        s[t] = s[t + 1] = s[t + 2] = Math.min(255, ~~(255 * d.get(i / 10, n / 10))), s[t + 3] = 255
                    }
                    i.putImageData(n, 0, 0), h = new a.k(t), h.wrapS = a.Ib, h.wrapT = a.Ib
                }
                return h
            }
            var c = i(99),
                g = i.n(c),
                p = i(100),
                f = i.n(p),
                v = i(101),
                m = i.n(v),
                b = i(102),
                w = i.n(b),
                x = i(7);
            const y = [Math.PI / 180 * 23, Math.PI / 180 * 0, 0];
            class M extends l.a {
                static get Defaults() {
                    return n.a.extend(!0, {}, l.a.Defaults, {
                        lazy: !1,
                        debug: !1,
                        mouseTracking: !0,
                        scrollTracking: !0,
                        camera: {
                            position: [0, 0, 100],
                            rotation: [0, 0, 0],
                            fov: 40,
                            near: .1,
                            far: 1e3,
                            filmGauge: 90
                        },
                        bloom: {
                            threshold: 0,
                            strength: x.a.matches("md-up") ? 1 : .5,
                            radius: .01,
                            exposure: 1
                        },
                        radiusTop: 50,
                        radiusBottom: 30,
                        cameraOrbitControls: !1,
                        image: "assets/images/media/landing/touch/touch@xxxl.webp"
                    })
                }
                init() {
                    this.progress = new a.Tb(1), this.speed = .5, this.scene = null, this.disc = null, this.planeMaterial = null, super.init()
                }
                initGUI() {
                    super.initGUI(), this.gui && (this.guiProgress = this.gui.add(this.progress, "value", -1, 1).name("progress").onChange(this.updateRotation.bind(this)), this.gui.add(this, "speed", 0, 2).name("speed"))
                }
                initScene() {
                    this.scene = new a.Kb, this.initPlane(), this.initDisc()
                }
                initDisc() {
                    const e = new a.r(this.options.radiusTop, this.options.radiusBottom, 0, 96, 1, !0),
                        t = new a.Nb({
                            side: a.x,
                            transparent: !0,
                            uniforms: {
                                uTime: {
                                    value: 0
                                },
                                uNoiseTexture: {
                                    value: u(128)
                                },
                                uInnerColor: {
                                    value: new a.o(1, 101 / 255, 36 / 255)
                                },
                                uOuterColor: {
                                    value: new a.o(1, 101 / 255, 36 / 255)
                                },
                                uProgress: this.progress
                            },
                            vertexShader: g.a,
                            fragmentShader: f.a
                        });
                    this.disc = new a.eb(e, t), this.disc.rotation.set(y[0], y[1], y[2]), this.disc.position.set(0, 4.5, 0), this.disc.layers.enable(1), this.scene.add(this.disc)
                }
                initPlane() {
                    (new a.Sb).load(this.options.image, e => {
                        e.colorSpace = a.Jb;
                        const t = new a.tb(75 / e.source.data.naturalHeight * e.source.data.naturalWidth, 75);
                        let i;
                        i = x.a.matches("md-up") ? this.planeMaterial = new a.Nb({
                            uniforms: {
                                map: {
                                    type: "t",
                                    value: e
                                },
                                uParallax: {
                                    value: 0
                                }
                            },
                            vertexShader: m.a,
                            fragmentShader: w.a
                        }) : new a.fb({
                            map: e
                        }), this.planeMaterial = i;
                        const n = this.plane = new a.eb(t, i);
                        this.scene.add(n)
                    })
                }
                onMouseMove(e) { }
                onMouseMoveAnimated(e) {
                    this.updateRotation()
                }
                onScroll(e) {
                    const t = Object(r.a)(e, -.5, .5, -1, 1);
                    this.progress && (this.progress.value = t, this.guiProgress && this.guiProgress.updateDisplay()), this.updateRotation(), this.planeMaterial && (this.scrollAnimation ? this.planeMaterial.uniforms.uParallax.value = this.scrollAnimation.getTarget() : this.planeMaterial.uniforms.uParallax.value = e)
                }
                updateRotation() {
                    this.cylinder && (this.cylinder.rotation.y = y[1] - .2 * (this.mouseAnimated.x - .5) - 6 * this.scroll)
                }
                onTick(e) {
                    this.disc.material.uniforms.uTime.value = e / 1e3 * this.speed
                }
            }
            n.a.fn.visualizationLinesImage = o()(M)
        },
        261: function (e, t, i) {
            i(13), i(69), i(498), i(176), i(132), i(191), i(497), e.exports = i(399)
        },
        399: function (e, t, i) {
            "use strict";
            i.r(t);
            var n = i(1),
                s = i(3),
                o = i.n(s);
            n.a.fn.videoInview = o()(class {
                static get Defaults() {
                    return {}
                }
                constructor(e, t) {
                    this.options = n.a.extend({}, this.constructor.Defaults, t), this.$container = e, this.src = this.$container.data("src"), this.$container.inview({
                        enter: () => {
                            this.$container.attr("src", this.src)
                        },
                        leave: () => {
                            this.$container.attr("src", "")
                        }
                    })
                }
            })
        },
        497: function (e, t, i) {
            "use strict";
            i.r(t);
            var n = i(1),
                s = i(3),
                o = i.n(s),
                a = i(0),
                r = i(16),
                l = i(48),
                d = i(25),
                h = i(19),
                u = i(49),
                c = i(36),
                g = i(29);
            class p extends c.a {
                getXYZ(e) {
                    let {
                        position: t,
                        direction: i,
                        loops: n
                    } = e;
                    const s = Object(r.a)(Object(u.a)(.3, 1, t), 0, 1, .8, 1),
                        o = Math.sin(2 * Math.PI * t * i * n) * s,
                        a = Math.cos(2 * Math.PI * t * i * n) * s;
                    let l = -.1;
                    if (t > 1 ? l += 1 - Object(u.a)(1, 1.5, t) : t > .5 && (l += Object(u.a)(.5, 1, t)), t > .78) {
                        const e = Math.sin(Object(r.a)(t, .78, 1.22, 0, Math.PI)),
                            i = Object(u.a)(.78, 1.22, t);
                        l -= Object(g.a)(0, .3 * e, i)
                    }
                    return [o, l, a]
                }
            }
            const f = [0, Math.PI / 180 * 110, 0];
            class v extends d.a {
                static get Defaults() {
                    return n.a.extend(!0, {}, d.a.Defaults, {
                        lazy: !1,
                        debug: !1,
                        mouseTracking: !0,
                        scrollTracking: !0,
                        camera: {
                            position: [0, 10, 100],
                            rotation: [-.12, 0, 0],
                            fov: 40,
                            near: .1,
                            far: 1e3,
                            filmGauge: 90
                        },
                        cameraOrbitControls: !1
                    })
                }
                init() {
                    this.progress = new a.Tb(1), this.speed = new a.Tb(500), super.init()
                }
                initGUI() {
                    super.initGUI(), this.gui && (this.guiProgress = this.gui.add(this.progress, "value", -1, 1).name("progress").onChange(this.updateRotation.bind(this)), this.gui.add(this.speed, "value", 0, 2e3).name("speed"))
                }
                initScene() {
                    const e = this.scene = new a.Kb;
                    this.lines = [new h.a({
                        curve: p,
                        scale: [1, 1.1, 1],
                        loops: 1.4,
                        direction: -1,
                        radius: 26,
                        lineWidth: .25,
                        offset: .175,
                        length: .86,
                        colorNormal: new a.o(1, 101 / 255, 36 / 255),
                        colorLight: new a.o(1, 101 / 255, 36 / 255),
                        colorDark: new a.o(1, 38 / 255, 0),
                        rotation: f,
                        position: new a.ac(0, -10, 0),
                        gui: this.gui,
                        camera: this.camera,
                        progress: this.progress,
                        speed: this.speed,
                        varyingLoops: 5.81,
                        varyingLoopOffset: .175,
                        varyingMin: .75,
                        varyingMax: 1.2,
                        edgeRadius: .15,
                        blurCoeficient: 0,
                        blurPower: 3,
                        tubularSegments: 100
                    }), new h.a({
                        curve: p,
                        scale: [1, 1.1, 1],
                        loops: 1.4,
                        direction: -1,
                        radius: 26,
                        lineWidth: .5,
                        offset: .882,
                        length: .345,
                        colorNormal: new a.o(1, 101 / 255, 36 / 255),
                        colorLight: new a.o(1, 101 / 255, 36 / 255),
                        colorDark: new a.o(1, 38 / 255, 0),
                        rotation: f,
                        position: new a.ac(-1.5, -7.94, 0),
                        gui: this.gui,
                        camera: this.camera,
                        progress: this.progress,
                        speed: this.speed,
                        varyingLoops: 8,
                        varyingLoopOffset: .1,
                        varyingMin: .75,
                        varyingMax: 1,
                        edgeRadius: .2,
                        blurCoeficient: .32,
                        blurPower: 9.5,
                        tubularSegments: 100
                    }), new h.a({
                        curve: p,
                        scale: [1, 1.1, 1],
                        loops: 1.4,
                        direction: -1,
                        radius: 25,
                        lineWidth: .5,
                        offset: .686,
                        length: .267,
                        colorNormal: new a.o(1, 101 / 255, 36 / 255),
                        colorLight: new a.o(1, 101 / 255, 36 / 255),
                        colorDark: new a.o(1, 38 / 255, 0),
                        rotation: f,
                        position: new a.ac(-1.5, -6.96, 0),
                        gui: this.gui,
                        camera: this.camera,
                        progress: this.progress,
                        speed: this.speed,
                        varyingLoops: 8,
                        varyingLoopOffset: .1,
                        varyingMin: .75,
                        varyingMax: 1,
                        edgeRadius: .05,
                        blurCoeficient: .268,
                        blurPower: 9.57,
                        tubularSegments: 100
                    }), new h.a({
                        curve: p,
                        scale: [1, 1.1, 1],
                        loops: 1.4,
                        direction: -1,
                        radius: 26,
                        lineWidth: .12,
                        offset: .948,
                        length: .293,
                        colorNormal: new a.o(189 / 255, 57 / 255, 0),
                        colorLight: new a.o(1, 173 / 255, .4),
                        colorDark: new a.o(1, 38 / 255, 0),
                        rotation: f,
                        position: new a.ac(-1.5, -9.3, 0),
                        gui: this.gui,
                        camera: this.camera,
                        progress: this.progress,
                        speed: this.speed,
                        varyingLoops: 3.72,
                        varyingLoopOffset: .346,
                        varyingMin: .6,
                        varyingMax: 1.2,
                        edgeRadius: .05,
                        blurCoeficient: .058,
                        blurPower: 2.15,
                        tubularSegments: 100
                    }), new h.a({
                        curve: p,
                        scale: [1, 1.1, 1],
                        loops: 1.4,
                        direction: -1,
                        radius: 28,
                        lineWidth: .58,
                        offset: .17,
                        length: .241,
                        colorNormal: new a.o(189 / 255, 57 / 255, 0),
                        colorLight: new a.o(1, 173 / 255, .4),
                        colorDark: new a.o(1, 38 / 255, 0),
                        rotation: f,
                        position: new a.ac(-1.5, -9.55, 0),
                        gui: this.gui,
                        camera: this.camera,
                        progress: this.progress,
                        speed: this.speed,
                        varyingLoops: 3.72,
                        varyingLoopOffset: .346,
                        varyingMin: .6,
                        varyingMax: 1.2,
                        edgeRadius: .44,
                        blurCoeficient: .32,
                        blurPower: 7.62,
                        tubularSegments: 100
                    })], this.group = new a.H, e.add(this.group), this.lines.forEach(e => this.group.add(e.getMesh())), this.initCylinder()
                }
                initCylinder() {
                    const e = new a.r(18, 18, 47, 60, 1, !0);
                    (new a.Sb).load("assets/images/media/home/section4/webgl@xs.webp", t => {
                        t.colorSpace = a.Jb;
                        const i = new a.fb({
                            map: t,
                            transparent: !0,
                            side: a.x
                        }),
                            n = this.cylinder = new a.eb(e, i);
                        this.group.add(n)
                    })
                }
                onMouseMove(e) { }
                onMouseMoveAnimated(e) {
                    this.updateRotation()
                }
                onScroll(e) {
                    const t = Object(r.a)(e, 0, .5, -1, 1);
                    this.progress && (this.progress.value = t, this.guiProgress && this.guiProgress.updateDisplay()), this.updateRotation()
                }
                updateRotation() {
                    if (this.cylinder && (this.cylinder.rotation.y = f[1] - .2 * (this.mouseAnimated.x - .5) - 6 * this.scroll), this.group) {
                        const t = (e = Object(l.a)(.5 * this.progress.value + .5, 0, 1), -1 * (e /= 1) * (e - 2) + 0);
                        this.group.rotation.z = .5 * t
                    }
                    var e
                }
                onTick(e) {
                    this.lines.forEach(t => t.update(e))
                }
            }
            n.a.fn.visualizationLinesCylinder = o()(v)
        },
        498: function (e, t, i) {
            "use strict";
            i.r(t);
            var n = i(1),
                s = i(3),
                o = i.n(s),
                a = i(8),
                r = i(48),
                l = i(7);
            class d extends a.a {
                static get Defaults() {
                    return n.a.extend({}, a.a.Defaults, {
                        imageSource: null,
                        imagePostfix: ".webp",
                        frameCount: 0,
                        frameOffset: 0,
                        breakpoints: [],
                        fullscreen: !1,
                        enableMq: "md-up"
                    })
                }
                init() {
                    this.status = 0, this.images = [], this.masks = [], this.images = [], this.frame = 0, this.frameRendered = -1, this.$canvas = null
                }
                enable() {
                    super.enable() && (Object(n.a)(window).on("resize." + this.ns, this.handleResize.bind(this)), "function" == typeof requestIdleCallback ? requestIdleCallback(this.preload.bind(this)) : setTimeout(this.preload.bind(this), 100))
                }
                disable() {
                    super.disable() && Object(n.a)(window).add(document).off("." + this.ns)
                }
                destroy() {
                    this.images = null, Object(n.a)(window).add(document).off("." + this.ns)
                }
                getFileNamePostfix() {
                    const e = this.options.breakpoints;
                    if (e.length)
                        for (let t = 0; t < e.length; t++)
                            if (l.a.matches(e[t] + "-up")) return "@" + e[t];
                    return ""
                }
                preload(e) {
                    if (0 === this.status) {
                        this.status = 1;
                        let t = 0;
                        const i = e ? e.progress : null,
                            s = e ? e.end : null,
                            o = this.options.frameCount,
                            a = this.getFileNamePostfix(),
                            r = e => {
                                t++, i && (i(Object(n.a)()), i(Object(n.a)())), t === o && s ? (s(), this.ready()) : e === this.frame && this.ready()
                            };
                        this.images = [];
                        for (let e = 0; e < o; e++) {
                            const t = this.options.imageSource + this.getFileNameFrameNumber(e) + a + this.options.imagePostfix,
                                i = this.images[e] = document.createElement("img");
                            i.src = t,
                                function (e) {
                                    i.addEventListener("load", () => {
                                        r(e)
                                    }), i.addEventListener("error", () => {
                                        r(e)
                                    })
                                }(e)
                        }
                        return 2 * o
                    }
                    return 0
                }
                getFileNameFrameNumber(e) {
                    const t = this.options.frameOffset,
                        i = this.options.frameCount + t,
                        n = e + t;
                    let s = n;
                    return i >= 10 && n < 10 && (s = "0" + s), i >= 100 && n < 100 && (s = "0" + s), s
                }
                ready() {
                    2 !== this.status ? (this.status = 2, this.$canvas = Object(n.a)("<canvas />").appendTo(this.$container), this.ctx = this.$canvas.get(0).getContext("2d"), this.handleResize()) : this.render()
                }
                handleResize() {
                    if (this.$canvas) {
                        const e = 1;
                        let t = 0,
                            i = 0;
                        this.options.fullscreen ? (t = window.innerWidth, i = window.innerHeight) : (t = this.$container.width(), i = this.$container.height()), this.$canvas.css({
                            width: t + "px",
                            height: i + "px"
                        }).attr({
                            width: t * e,
                            height: i * e
                        }), this.dpr = e, this.width = t, this.height = i, this.render(!0)
                    }
                }
                render() {
                    let e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                    if (2 === this.status && (this.frameRendered !== this.frame || e)) {
                        const e = this.images[this.frame];
                        if (e.width && e.height) {
                            const t = this.ctx,
                                i = this.width * this.dpr,
                                n = this.height * this.dpr,
                                s = function (e, t, i, n) {
                                    const s = e / t;
                                    let o = i,
                                        a = o / s;
                                    return a > n && (a = n, o = a * s), {
                                        width: ~~o,
                                        height: ~~a,
                                        x: ~~(i - o) / 2,
                                        y: ~~(n - a) / 2
                                    }
                                }(e.width, e.height, i, n);
                            this.frameRendered = this.frame, t.clearRect(0, 0, i, n), t.drawImage(e, s.x, s.y, s.width, s.height)
                        }
                    }
                }
                setProgress(e) {
                    const t = this.options.frameCount,
                        i = Math.round(Object(r.a)(e, 0, 1) * (t - 1));
                    this.frame = i, this.render()
                }
            }
            n.a.fn.sequence = o()(d)
        },
        99: function (e, t) {
            e.exports = "varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n"
        }
    },
    [
        [261, 0]
    ]
]);

document.addEventListener("DOMContentLoaded", function () {
    const skipButton = document.querySelector(".preloader__canvas-button");
    const video = document.getElementById('landing-video');

    if (!document.cookie.includes('introSeen=true') && skipButton) {
        setTimeout(() => {
            skipButton.style.display = "block";
            skipButton.style.opacity = 0;
            skipButton.style.transition = "opacity 0.5s";
            setTimeout(() => {
                skipButton.style.opacity = 1;
            }, 10);
        }, 4000);
    }

    if (video) {
        video.addEventListener('ended', function () {
            introSeen();
            video.style.display = 'none';
        });
    }

    if (skipButton) {
        skipButton.addEventListener("click", function () {
            introSeen();
        });
    }

    function introSeen() {
        document.cookie = "introSeen=true; path=/; max-age=31536000";
        document.querySelector('.js-preloader-landing').classList.add('hidden');
        setTimeout(() => {
            document.querySelector('.js-preloader-landing').style.display = "none";
        }, 500);
    }
});