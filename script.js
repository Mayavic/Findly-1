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
