/* ============ i18n ============ */
const LANG = (document.documentElement.lang || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
const T = {
  fr: {
    successTitle: "Tu es sur la liste !",
    successBody: (email) => `Merci 🙌 On t'écrit à <strong>${email}</strong> dès l'ouverture de la bêta. Surveille ta boîte mail (et les spams, au cas où).`
  },
  en: {
    successTitle: "You're on the list!",
    successBody: (email) => `Thanks 🙌 We'll email <strong>${email}</strong> the moment the beta opens. Keep an eye on your inbox (and spam, just in case).`
  }
}[LANG];

/* ============ MODALE WAITLIST ============ */
const modal = document.getElementById("waitlist-modal");
const modalClose = document.getElementById("modal-close");
const modalContent = document.getElementById("modal-content");
const form = document.getElementById("waitlist-form");
const nameInput = document.getElementById("waitlist-name");
const emailInput = document.getElementById("waitlist-email");
const errorMsg = document.getElementById("modal-error");
const countEl = document.getElementById("signup-count");

let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => emailInput?.focus(), 60);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

// Ouvrir depuis tous les boutons "waitlist"
document.querySelectorAll("[data-waitlist]").forEach((btn) => {
  btn.addEventListener("click", openModal);
});

modalClose?.addEventListener("click", closeModal);

// Fermer en cliquant sur le fond
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Fermer avec Échap
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    errorMsg.hidden = false;
    emailInput.focus();
    return;
  }
  errorMsg.hidden = true;

  if (supabaseClient) {
    const submitBtn = form.querySelector("button[type=submit]");
    if (submitBtn) submitBtn.disabled = true;
    const { error } = await supabaseClient.from("waitlist").insert({ name, email });
    if (submitBtn) submitBtn.disabled = false;
    // Code 23505 = contrainte unique déjà en base (email déjà inscrit) : on ignore.
    if (error && error.code !== "23505") {
      errorMsg.textContent = LANG === "fr"
        ? "Une erreur est survenue, réessaie."
        : "Something went wrong, please try again.";
      errorMsg.hidden = false;
      return;
    }
  } else {
    // Fallback local si Supabase n'est pas configuré (voir haut de fichier).
    try {
      const list = JSON.parse(localStorage.getItem("findly_waitlist") || "[]");
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem("findly_waitlist", JSON.stringify(list));
      }
    } catch (_) { /* stockage indisponible : on continue quand même */ }
  }

  // Incrémente le compteur affiché
  if (countEl) {
    const current = parseInt(countEl.textContent.replace(/\D/g, ""), 10) || 1248;
    countEl.textContent = (current + 1).toLocaleString("fr-FR");
  }

  // Écran de succès
  modalContent.innerHTML = `
    <div class="modal-success">
      <div class="check">✅</div>
      <h2>${T.successTitle}</h2>
      <p>${T.successBody(email.replace(/</g, "&lt;"))}</p>
    </div>`;
  setTimeout(closeModal, 2600);
});

/* ============ REVEAL AU SCROLL ============ */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

/* ============ FLUX DES BOUTIQUES ============ */
const fashionStream = document.querySelector(".fashion-stream");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (fashionStream && !reduceMotion.matches) {
  if ("IntersectionObserver" in window) {
    const streamObserver = new IntersectionObserver(([entry]) => {
      fashionStream.classList.toggle("is-active", entry.isIntersecting);
    }, { threshold: 0.01 });
    streamObserver.observe(fashionStream);
  } else {
    fashionStream.classList.add("is-active");
  }
}

/* ============ DÉMONSTRATION PRODUIT ============ */
const productDemo = document.querySelector(".product-demo");
const demoForm = document.getElementById("demo-search");
const demoQuery = document.getElementById("demo-query");
const demoResult = document.getElementById("demo-result");
const demoSubmit = document.getElementById("demo-submit");
const demoTabs = document.querySelectorAll("[data-demo-scenario]");
const demoProductImage = document.getElementById("demo-product-image");
const demoProductLabel = document.getElementById("demo-product-label");
const demoProductTitle = document.getElementById("demo-product-title");
const demoProductDescription = document.getElementById("demo-product-description");
const demoProductPrice = document.getElementById("demo-product-price");
const demoProductLink = document.getElementById("demo-product-link");
const demoProductLinkLabel = document.getElementById("demo-product-link-label");
const demoProductNote = document.getElementById("demo-product-note");
const demoResults = document.getElementById("demo-results");

const demoScenarios = {
  search: {
    query: "Short Nike AeroSwift rose, taille S",
    image: "assets/nike-aeroswift-pink-example.jpg",
    alt: "Short de running Nike AeroSwift rose porté, présenté dans le résultat d’exemple",
    label: "Meilleure offre disponible",
    title: "Nike AeroSwift",
    description: "Short de running femme · Hyper Pink",
    price: "79,99 €",
    link: "https://www.nike.com/fr/t/short-de-running-taille-mi-haute-avec-sous-short-integre-dri-fit-adv-nike-aeroswift-8-cm-pour-femme-KxIbI2LN/FN2328-645",
    linkLabel: "Voir l’offre Nike",
    note: "Visuel produit utilisé à titre d’exemple. Nom, prix et lien issus de la page officielle Nike consultée le 27 juillet 2026.",
    submitLabel: "Trouver la pièce"
  },
  photo: {
    query: "Photo ajoutée — short de running rose",
    image: "assets/nike-aeroswift-pink-example.jpg",
    alt: "Short de running rose retrouvé à partir d’une photo",
    label: "Pièce retrouvée",
    title: "Nike AeroSwift",
    description: "Modèle identifié · Hyper Pink",
    price: "79,99 €",
    link: "https://www.nike.com/fr/t/short-de-running-taille-mi-haute-avec-sous-short-integre-dri-fit-adv-nike-aeroswift-8-cm-pour-femme-KxIbI2LN/FN2328-645",
    linkLabel: "Voir l’offre",
    note: "Simulation d’une recherche visuelle. Nom, prix et lien issus de la page officielle Nike consultée le 27 juillet 2026.",
    submitLabel: "Retrouver la pièce"
  },
  occasion: {
    query: "Robe élégante pour un mariage en Sicile · 250 € max",
    image: "assets/editorial-sicily-wedding-dress.jpg",
    alt: "Robe longue d’été colorée recommandée pour un mariage en Sicile",
    label: "Choix du personal shopper",
    title: "Robe longue Méditerranée",
    description: "Imprimé coloré · Fluide et élégante",
    price: "229 €",
    link: "#contact",
    linkLabel: "Voir la recommandation",
    note: "Visuel original et recommandation fictive présentés pour illustrer le futur mode personal shopper de Findly.",
    submitLabel: "Trouver ma tenue",
    hasSecondary: false
  }
};

function setDemoScenario(name) {
  const scenario = demoScenarios[name];
  if (!scenario) return;
  if (demoQuery) demoQuery.value = scenario.query;
  if (demoProductImage) {
    demoProductImage.src = scenario.image;
    demoProductImage.alt = scenario.alt;
  }
  if (demoProductLabel) demoProductLabel.textContent = scenario.label;
  if (demoProductTitle) demoProductTitle.textContent = scenario.title;
  if (demoProductDescription) demoProductDescription.textContent = scenario.description;
  if (demoProductPrice) demoProductPrice.textContent = scenario.price;
  if (demoProductLinkLabel) demoProductLinkLabel.textContent = scenario.linkLabel;
  if (demoProductNote) demoProductNote.textContent = scenario.note;
  if (demoSubmit) demoSubmit.innerHTML = `${scenario.submitLabel} <span aria-hidden="true">→</span>`;
  if (demoResults) demoResults.classList.toggle("single-result", scenario.hasSecondary === false);
  if (demoProductLink) {
    demoProductLink.href = scenario.link;
    if (scenario.link.startsWith("http")) {
      demoProductLink.target = "_blank";
      demoProductLink.rel = "noopener noreferrer";
    } else {
      demoProductLink.removeAttribute("target");
      demoProductLink.removeAttribute("rel");
    }
  }
}

demoTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    demoTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
    });
    setDemoScenario(tab.dataset.demoScenario);
  });
});

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!productDemo || productDemo.classList.contains("is-searching")) return;

  const submitButton = demoForm.querySelector("button[type='submit']");
  const initialLabel = submitButton?.innerHTML;
  productDemo.classList.add("is-searching");
  productDemo.classList.remove("is-complete");
  demoResult?.setAttribute("aria-busy", "true");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Analyse en cours…";
  }

  const completeDemo = () => {
    productDemo.classList.remove("is-searching");
    productDemo.classList.add("is-complete");
    demoResult?.setAttribute("aria-busy", "false");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = initialLabel || "Trouver la pièce →";
    }
  };

  window.setTimeout(completeDemo, reduceMotion.matches ? 120 : 1100);
});
