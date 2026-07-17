/* ============ i18n ============ */
const LANG = (document.documentElement.lang || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
const T = {
  fr: {
    results: [
      "👟 3 boutiques trouvées pour ta description — meilleur prix à partir de 89 €",
      "✨ Alternative repérée : modèle très proche, mieux noté (4.7/5), livraison 24h",
      "💸 Bonne affaire détectée : -32 % vs prix moyen constaté sur 30 jours",
      "🌱 Option seconde main : identique, neuf avec étiquette, dans ta taille"
    ],
    imageOk: (name) => "✅ " + name + " — les agents vont chercher ce visuel.",
    successTitle: "Tu es sur la liste !",
    successBody: (email) => `Merci 🙌 On t'écrit à <strong>${email}</strong> dès l'ouverture de la bêta. Surveille ta boîte mail (et les spams, au cas où).`
  },
  en: {
    results: [
      "👟 3 stores found for your description — best price from €89",
      "✨ Agent-spotted alternative: very close model, better rated (4.7/5), 24h delivery",
      "💸 Deal detected: -32% vs 30-day average price",
      "🌱 Second-hand option: identical, new with tags, in your size"
    ],
    imageOk: (name) => "✅ " + name + " — the agents will search for this visual.",
    successTitle: "You're on the list!",
    successBody: (email) => `Thanks 🙌 We'll email <strong>${email}</strong> the moment the beta opens. Keep an eye on your inbox (and spam, just in case).`
  }
}[LANG];

/* ============ DÉMO DE RECHERCHE (hero) ============ */
const tryBtn = document.getElementById("try-btn");
const promptInput = document.getElementById("prompt");
const results = document.getElementById("results");

const mockResults = T.results;

/* ---- Recherche par image (dépôt de photo) ---- */
const imageDrop = document.getElementById("image-drop");
const imageInput = document.getElementById("image-input");
const imageFile = document.getElementById("image-file");
let hasImage = false;

function showImageName(name) {
  hasImage = true;
  if (imageFile) {
    imageFile.hidden = false;
    imageFile.textContent = T.imageOk(name);
  }
}

imageDrop?.addEventListener("click", () => imageInput?.click());
imageInput?.addEventListener("change", () => {
  if (imageInput.files && imageInput.files[0]) showImageName(imageInput.files[0].name);
});
["dragover", "dragenter"].forEach((ev) =>
  imageDrop?.addEventListener(ev, (e) => { e.preventDefault(); imageDrop.classList.add("dragover"); })
);
["dragleave", "drop"].forEach((ev) =>
  imageDrop?.addEventListener(ev, (e) => { e.preventDefault(); imageDrop.classList.remove("dragover"); })
);
imageDrop?.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) showImageName(file.name);
});

tryBtn?.addEventListener("click", () => {
  const promptText = promptInput?.value.trim();
  if (!promptText && !hasImage) { promptInput?.focus(); return; }

  results.innerHTML = "";
  mockResults.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "result-item";
    row.textContent = item;
    row.style.opacity = "0";
    row.style.transform = "translateY(8px)";
    row.style.transition = "all 260ms ease";
    results.appendChild(row);
    setTimeout(() => {
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, 110 * index);
  });
});

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
