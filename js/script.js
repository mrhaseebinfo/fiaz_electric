/* ============================================================
   Fiaz Electric & Sanitary — Interactions
   ============================================================ */
(function () {
    "use strict";

    const WHATSAPP_NUMBER = "923135881281";

    /* ============================================================
       HERO SLIDER — auto-play, 3 slides, dots, arrows, swipe
       ============================================================ */
    const slider = document.getElementById("slider");
    const slides = Array.from(slider.querySelectorAll(".slide"));
    const dotsWrap = document.getElementById("sliderDots");
    const btnPrev = document.getElementById("prevSlide");
    const btnNext = document.getElementById("nextSlide");
    let current = 0;
    let autoTimer = null;
    const AUTO_DELAY = 6000;

    // build dots
    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
        slides[current].classList.remove("is-active");
        dots[current].classList.remove("is-active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("is-active");
        dots[current].classList.add("is-active");
        restartAuto();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, AUTO_DELAY);
    }

    function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
    }

    function restartAuto() {
        startAuto();
    }

    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);

    // pause on hover / focus, resume on leave
    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener("focusin", stopAuto);
    slider.addEventListener("focusout", startAuto);

    // keyboard navigation (when slider area focused or arrows pressed)
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
    });

    // touch swipe
    let touchX = null;
    slider.addEventListener("touchstart", (e) => {
        touchX = e.touches[0].clientX;
        stopAuto();
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
        if (touchX === null) return;
        const delta = e.changedTouches[0].clientX - touchX;
        if (Math.abs(delta) > 46) {
            delta < 0 ? next() : prev();
        }
        touchX = null;
        startAuto();
    }, { passive: true });

    // clicking the photo (not a button/links) advances to the next slide
    slides.forEach((slide) => {
        slide.querySelector(".slide__bg").addEventListener("click", (e) => {
            // ignore clicks that started on links/buttons inside the slide
            if (e.target.closest("a, button")) return;
            next();
        });
    });

    startAuto();

    /* ============================================================
       Header + scroll-spy (FAQ intentionally NOT in header nav)
       ============================================================ */
    const header = document.getElementById("header");
    const navLinks = document.querySelectorAll(".nav__link");
    // only spy on sections that appear in the nav
    const spyTargets = Array.from(navLinks)
        .map((l) => document.querySelector(l.getAttribute("href")))
        .filter(Boolean);

    function onScrollSpy() {
        header.classList.toggle("is-scrolled", window.scrollY > 30);

        let currentId = spyTargets[0]?.id;
        spyTargets.forEach((sec) => {
            if (window.scrollY >= sec.offsetTop - 160) currentId = sec.id;
        });
        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
        });

        toTop.classList.toggle("is-visible", window.scrollY > 500);
    }

    /* ============================================================
       Mobile menu
       ============================================================ */
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");

    function closeMenu() {
        nav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        hamburger.classList.toggle("is-open", open);
        hamburger.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    /* ============================================================
       Reveal on scroll
       ============================================================ */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    /* ============================================================
       Counters
       ============================================================ */
    function animateCounter(el) {
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.6 }
    );
    document.querySelectorAll("[data-counter]").forEach((el) => counterObserver.observe(el));

    /* ============================================================
       Product category filter
       ============================================================ */
    const tabs = document.querySelectorAll("#tabs .tab");
    const productCards = document.querySelectorAll("#productGrid .card");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => {
                t.classList.remove("is-active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("is-active");
            tab.setAttribute("aria-selected", "true");

            const filter = tab.dataset.filter;
            productCards.forEach((card) => {
                const match = filter === "all" || card.dataset.cat === filter;
                card.classList.toggle("is-hidden", !match);
                if (match) {
                    card.classList.remove("is-visible");
                    void card.offsetWidth; // re-trigger reveal animation
                    card.classList.add("is-visible");
                }
            });
        });
    });

    /* ============================================================
       FAQ — single-open accordion behaviour
       (plain <details> works without JS too; this enhances it)
       ============================================================ */
    const faqItems = document.querySelectorAll("#faqList details");
    faqItems.forEach((item) => {
        item.addEventListener("toggle", () => {
            if (item.open) {
                faqItems.forEach((other) => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });

    /* ============================================================
       Google reCAPTCHA v2 + REAL EMAIL DELIVERY
       ------------------------------------------------------------
       reCAPTCHA keys: configured & verified working (07 Nov 2026).

       EMAIL — two free services, works in this order:
       1) Web3Forms (api.web3forms.com) — preferred.
          ONE-TIME SETUP: go to https://web3forms.com
          → enter our email (fiazelectric.info@gmail.com)
          → the ACCESS KEY arrives by email → paste it below.
       2) FormSubmit (formsubmit.co) — automatic fallback.
          Its very first submit emails a one-time activation link
          to our Gmail; click it once and deliveries start.
       3) Self-hosted alternative for cPanel/PHP: contact.php
       ============================================================ */
    const WEB3FORMS_ACCESS_KEY = "fefed1bb-8dd1-47ed-af6e-27d40597e4b2"; // web3forms access key (fiazelectric.info@gmail.com)
    const FORMSUBMIT_TO = "fiazelectric.info@gmail.com";

    const RECAPTCHA_SITE_KEY = "6LfyrxMuAAAAAF-qWPVGhF0Uys2uMfF-ZHcnC1WK";
    const captchaConfigured = Boolean(RECAPTCHA_SITE_KEY) && !RECAPTCHA_SITE_KEY.includes("YOUR-SITE-KEY");
    let captchaWidgetId = null;

    const captchaBox = document.getElementById("recaptchaBox");
    const captchaError = document.getElementById("captchaError");

    function setCaptchaError(msg) {
        if (captchaError) captchaError.textContent = msg || "";
        captchaBox.classList.toggle("is-invalid", Boolean(msg));
    }

    function safeCaptchaResponse() {
        try {
            return captchaWidgetId !== null ? grecaptcha.getResponse(captchaWidgetId) : "";
        } catch {
            return "";
        }
    }

    function loadRecaptcha() {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            try {
                captchaWidgetId = grecaptcha.render("recaptchaWidget", {
                    sitekey: RECAPTCHA_SITE_KEY,
                    theme: "light",
                    callback: () => setCaptchaError(""),
                    "expired-callback": () => setCaptchaError("reCAPTCHA expired — please verify again."),
                    "error-callback": () => {
                        captchaWidgetId = null;
                        setCaptchaError("reCAPTCHA rejected this key/domain — check key type & domains in the Google console.");
                    }
                });
            } catch (err) {
                captchaWidgetId = null;
                console.warn("reCAPTCHA render failed:", err);
                setCaptchaError("reCAPTCHA could not start — form will send without it.");
            }
        };
        script.onerror = () => {
            console.warn("reCAPTCHA script blocked — offline or file:// preview.");
            setCaptchaError("reCAPTCHA unavailable — form will send without it.");
        };
        document.head.appendChild(script);
    }

    if (captchaConfigured) {
        // hide the "not configured" hint and load the real widget
        captchaBox.classList.add("is-configured");
        loadRecaptcha();
    }

    /* ============================================================
       Contact form — validation + AJAX email send
       (the floating WhatsApp button on the page stays; the form
       itself no longer sends via WhatsApp)
       ============================================================ */
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");

    function setError(input, message) {
        const field = input.closest(".field");
        field.classList.toggle("is-invalid", Boolean(message));
        field.querySelector(".field__error").textContent = message || "";
    }

    function validate() {
        let valid = true;
        const name = form.elements.name;
        const phone = form.elements.phone;
        const message = form.elements.message;

        if (name.value.trim().length < 3) {
            setError(name, "Please enter your full name.");
            valid = false;
        } else setError(name, "");

        if (!/^[+\d][\d\s-]{8,14}$/.test(phone.value.trim())) {
            setError(phone, "Please enter a valid phone number.");
            valid = false;
        } else setError(phone, "");

        if (message.value.trim().length < 10) {
            setError(message, "Message should be at least 10 characters.");
            valid = false;
        } else setError(message, "");

        // reCAPTCHA: only required when the widget actually rendered
        if (captchaConfigured && captchaWidgetId !== null && safeCaptchaResponse() === "") {
            setCaptchaError("Please confirm you are not a robot.");
            valid = false;
        } else {
            setCaptchaError("");
        }

        return valid;
    }

    ["name", "phone", "message"].forEach((key) => {
        form.elements[key].addEventListener("input", () => {
            if (form.elements[key].closest(".field").classList.contains("is-invalid")) validate();
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // clear any previous fallback link / status
        document.querySelector(".mailto-fallback")?.remove();
        status.textContent = "";

        if (!validate()) {
            status.textContent = "Please fix the errors above.";
            status.className = "form-status err";
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = "Sending…";

        // Prepare the enquiry data once
        const token = safeCaptchaResponse();
        const data = {
            Name: form.elements.name.value.trim(),
            Phone: form.elements.phone.value.trim(),
            Need: form.elements.subject.value,
            Message: form.elements.message.value.trim()
        };
        if (token) data["g-recaptcha-response"] = token;

        // ---- Sender 1: Web3Forms (preferred) -----------------------
        function sendViaWeb3Forms() {
            return fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    name: data.Name,
                    phone: data.Phone,
                    subject: "Website enquiry — " + data.Need,
                    message: data.Message,
                    from_name: "Fiaz Electric Website",
                    "g-recaptcha-response": token
                })
            }).then((r) => r.json());
        }

        // ---- Sender 2: FormSubmit (fallback) -----------------------
        function sendViaFormSubmit() {
            return fetch("https://formsubmit.co/ajax/" + FORMSUBMIT_TO, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    _subject: "Website enquiry — " + data.Need,
                    _template: "table",
                    Name: data.Name,
                    Phone: data.Phone,
                    Need: data.Need,
                    Message: data.Message
                })
            }).then((r) => r.json());
        }

        function onEmailSuccess() {
            status.textContent = "✓ Message sent! We will contact you soon.";
            status.className = "form-status ok";
            form.reset();
            if (captchaWidgetId !== null) {
                try { grecaptcha.reset(captchaWidgetId); } catch { /* noop */ }
            }
            showToast("Shukriya! Message delivered by email.");
        }

        // Last-resort fallback: hand the enquiry to the visitor's own email app
        function showMailtoFallback() {
            const subject = encodeURIComponent("Website enquiry — " + data.Need);
            const body = encodeURIComponent(
                `Assalam O Alikum,\n\nName: ${data.Name}\nPhone: ${data.Phone}\nNeed: ${data.Need}\n\n${data.Message}\n`
            );
            const link = document.createElement("a");
            link.href = `mailto:fiazelectric.info@gmail.com?subject=${subject}&body=${body}`;
            link.className = "mailto-fallback";
            link.textContent = "→ Or send with your Email app instead";
            status.after(link);
        }

        function onEmailFail(errInfo) {
            const msg = String(errInfo || "");

            if (/activat/i.test(msg)) {
                status.textContent = "⚠ One-time setup: open the verification email in our inbox, click the link, then submit again.";
            } else if (WEB3FORMS_ACCESS_KEY === "" && /network|could not|fail/i.test(msg)) {
                // owner reading the site while no key is configured yet
                status.innerHTML =
                    "⚠ Auto-email needs setup: register our email at <b>web3forms.com</b> and paste the access key into " +
                    "<b>js/script.js</b> (WEB3FORMS_ACCESS_KEY). Meanwhile use the button below.";
            } else if (/access.?key/i.test(msg)) {
                status.textContent = "⚠ Web3Forms key invalid — owner: paste a valid access key in js/script.js.";
            } else {
                status.textContent = "Sending failed: " + msg;
            }
            status.className = "form-status err";
            showMailtoFallback();
        }

        let sendChain;
        if (WEB3FORMS_ACCESS_KEY) {
            sendChain = sendViaWeb3Forms();
        } else {
            sendChain = sendViaFormSubmit();
        }

        sendChain
            .then((res) => {
                const ok = res.success === true || res.success === "true" || res.ok === true;
                if (ok) {
                    onEmailSuccess();
                } else {
                    // FormSubmit down / unreachable → try the other service
                    if (WEB3FORMS_ACCESS_KEY) {
                        return sendViaFormSubmit().then((res2) => {
                            const ok2 = res2.success === true || res2.success === "true" || res2.ok === true;
                            ok2 ? onEmailSuccess() : onEmailFail(res2.message || res2.error || "Could not send.");
                        });
                    }
                    onEmailFail(res.message || res.error || "Could not send.");
                }
            })
            .catch(() => {
                // network-level failure of the primary → try fallback
                if (WEB3FORMS_ACCESS_KEY) {
                    sendViaFormSubmit()
                        .then((res2) => {
                            const ok2 = res2.success === true || res2.success === "true" || res2.ok === true;
                            ok2 ? onEmailSuccess() : onEmailFail(res2.message || res2.error || "Could not send.");
                        })
                        .catch(() => onEmailFail("network error — please try again."));
                } else {
                    onEmailFail("network error — please check your internet and try again.");
                }
            })
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = original;
            });
    });

    /* ============================================================
       Toast
       ============================================================ */
    const toast = document.getElementById("toast");
    let toastTimer;

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
    }

    /* ============================================================
       Back to top
       ============================================================ */
    const toTop = document.getElementById("toTop");
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    /* ============================================================
       Footer year + scroll listeners
       ============================================================ */
    document.getElementById("year").textContent = new Date().getFullYear();
    window.addEventListener("scroll", onScrollSpy, { passive: true });
    onScrollSpy();
})();
