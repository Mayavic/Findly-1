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

/* ============ PRÉFÉRENCES ============ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    description: "Short de running femme · Hyper Pink/Noir",
    price: "79,99 €",
    link: "https://www.nike.com/fr/t/short-de-running-taille-mi-haute-avec-sous-short-integre-dri-fit-adv-nike-aeroswift-8-cm-pour-femme-KxIbI2LN/FN2328-645",
    linkLabel: "Voir l’offre Nike",
    note: "Visuel produit utilisé à titre d’exemple.\nNom, prix et lien issus de la page officielle Nike consultée le 27 juillet 2026.",
    submitLabel: "Trouver la pièce",
    others: [{
      image: "assets/nike-aeroswift-pink-example.jpg",
      alt: "Short de running Nike AeroSwift rose, également disponible sur ASOS",
      label: "Indisponible chez ASOS",
      title: "Nike AeroSwift",
      description: "Short de running femme · Hyper Pink/Noir",
      price: "29,99 €",
      status: "Épuisé chez ASOS",
      note: "Prix constaté : 29,99 €. Cette offre n’est plus disponible."
    }]
  },
  photo: {
    query: "Photo ajoutée — veste Carhartt WIP noire, taille M",
    image: "assets/carhartt-detroit-black-example.jpg",
    alt: "Veste Carhartt WIP Detroit noire retrouvée à partir d’une photo",
    label: "Meilleure offre disponible",
    title: "Carhartt WIP Detroit Jacket",
    description: "Black / Black, Rinsed · Taille M en stock",
    price: "179 €",
    link: "https://www.carhartt-wip.com/fr-fr/p/detroit-jacket-black-black-rinsed-1743",
    linkLabel: "Voir l’offre Carhartt WIP",
    note: "Simulation d’une recherche visuelle.\nPrix et stock en taille M relevés sur les sites marchands le 23 septembre 2026.",
    submitLabel: "Retrouver la pièce",
    packshot: true,
    others: [
      {
        label: "Outback Sylt · M en stock",
        title: "Detroit Jacket",
        description: "Black (Rinsed)",
        price: "179 €",
        link: "https://www.outbacksylt.com/en/carhartt-wip-detroit-jacket-black-rinsed-73046",
        linkLabel: "Voir sur Outback Sylt"
      },
      {
        label: "D2 Store · Dernière pièce en M",
        title: "Detroit Jacket (Summer)",
        description: "Black",
        price: "180 €",
        link: "https://www.d2-store.com/en/product/carhartt-wip-detroit-jacket-summer-man-black-i033112-00e-02",
        linkLabel: "Voir sur D2 Store"
      },
      {
        label: "Indisponible en M chez SVD",
        title: "Detroit Jacket (Summer)",
        description: "Black",
        price: "225 €",
        status: "Épuisé en M chez SVD"
      }
    ]
  },
  occasion: {
    query: "Mocassins femme plissés style Saint Laurent, taille 38, moins de 200 €",
    image: "assets/massimo-dutti-mocassin-fronce-example.jpg",
    alt: "Mocassin en cuir froncé marron Massimo Dutti",
    label: "Choix du personal shopper",
    title: "Mocassin en cuir froncé",
    description: "Massimo Dutti · Marron · 38 disponible",
    price: "100 €",
    link: "https://www.massimodutti.com/fr/mocassin-en-cuir-fronce-l11573850?cS=700",
    linkLabel: "Voir chez Massimo Dutti",
    note: "Simulation du mode personal shopper.\nPrix et disponibilité en 38 relevés sur les sites marchands le 23 septembre 2026.",
    submitLabel: "Trouver mes mocassins",
    others: [
      {
        image: "assets/alohas-aven-rift-burgundy-example.jpg",
        label: "Alohas · 38 disponible",
        title: "Aven Rift",
        description: "Cuir bordeaux",
        price: "160 €",
        link: "https://alohas.com/products/aven-rift-burgundy-leather-loafers?variant=51001372770640",
        linkLabel: "Voir l’offre"
      },
      {
        image: "assets/arket-mocassins-laques-example.jpg",
        label: "Arket · 38 disponible",
        title: "Mocassins en cuir laqué",
        description: "Noir",
        price: "189 €",
        link: "https://www.arket.com/fr-fr/product/lacquered-leather-loafers-black-1317806001/",
        linkLabel: "Voir l’offre"
      }
    ]
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
  if (demoResults) {
    demoResults.classList.toggle("single-result", scenario.hasSecondary === false);
    demoResults.classList.toggle("is-packshot", scenario.packshot === true);
  }
  renderDemoOthers(scenario.others);
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

/* Autres offres : épuisées ou sur d’autres sites marchands */
const demoOthers = document.getElementById("demo-others");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/* Plusieurs offres avec photo : vignette à gauche pour rester compact */
function scenarioHasThumbs(offers) {
  return offers.length > 1;
}

function renderDemoOthers(offers) {
  if (!demoOthers || !offers) return;
  demoOthers.replaceChildren(...offers.map((offer) => {
    const card = el("div", "demo-result demo-result-secondary");
    card.classList.toggle("is-unavailable", Boolean(offer.status));
    card.classList.toggle("demo-result-compact", !offer.image || scenarioHasThumbs(offers));
    card.classList.toggle("demo-result-thumb", Boolean(offer.image) && scenarioHasThumbs(offers));
    if (offer.image) {
      const media = el("div", "demo-product-image");
      const img = el("img");
      img.src = offer.image;
      img.alt = offer.alt || "";
      media.append(img);
      card.append(media);
    }
    const info = el("div", "demo-product-info");
    const price = el("div", "demo-price");
    price.append(el("strong", "", offer.price));
    info.append(el("small", "", offer.label), el("h3", "", offer.title), el("p", "", offer.description), price);
    if (offer.status) {
      const status = el("p", "demo-offer-unavailable", offer.status);
      status.setAttribute("role", "status");
      info.append(status);
    } else if (offer.link) {
      const link = el("a", "demo-offer-link demo-offer-link-light");
      link.href = offer.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const arrow = el("span", "", "↗");
      arrow.setAttribute("aria-hidden", "true");
      link.append(el("span", "", offer.linkLabel), arrow);
      info.append(link);
    }
    if (offer.note) info.append(el("p", "demo-note", offer.note));
    card.append(info);
    return card;
  }));
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
