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

/* ============ INTERLUDE MODE AU SCROLL ============ */
const fashionMotion = document.getElementById("fashion-motion");
const fashionStage = document.getElementById("fashion-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let fashionTicking = false;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function updateFashionMotion() {
  fashionTicking = false;
  if (!fashionMotion || !fashionStage || reduceMotion.matches) return;

  const rect = fashionMotion.getBoundingClientRect();
  const scrollDistance = Math.max(fashionMotion.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / scrollDistance);
  const scan = smoothstep((progress - 0.16) / 0.48);
  const beamOpacity = smoothstep((progress - 0.1) / 0.08) * (1 - smoothstep((progress - 0.68) / 0.08));
  const result = smoothstep((progress - 0.72) / 0.18);
  const scanDistance = Math.max(fashionStage.clientHeight * 0.54, 220);
  const setProgress = (name, value) => fashionStage.style.setProperty(name, clamp(value).toFixed(3));

  fashionStage.style.setProperty("--scan-y", `${scan * scanDistance}px`);
  fashionStage.style.setProperty("--beam-opacity", beamOpacity.toFixed(3));
  setProgress("--source-one", (progress - 0.02) / 0.1);
  setProgress("--source-two", (progress - 0.09) / 0.1);
  setProgress("--source-three", (progress - 0.16) / 0.1);
  setProgress("--criterion-one", (progress - 0.28) / 0.1);
  setProgress("--criterion-two", (progress - 0.42) / 0.1);
  setProgress("--criterion-three", (progress - 0.56) / 0.1);
  fashionStage.style.setProperty("--result-opacity", result.toFixed(3));
  fashionStage.style.setProperty("--result-y", `${(1 - result) * 18}px`);
  fashionStage.style.setProperty("--analysis-opacity", (1 - result * 0.78).toFixed(3));
  fashionStage.style.setProperty("--garment-scale", (0.96 + scan * 0.04).toFixed(3));
}

function requestFashionUpdate() {
  if (fashionTicking) return;
  fashionTicking = true;
  requestAnimationFrame(updateFashionMotion);
}

if (fashionMotion && fashionStage && !reduceMotion.matches) {
  updateFashionMotion();
  window.addEventListener("scroll", requestFashionUpdate, { passive: true });
  window.addEventListener("resize", requestFashionUpdate);
}
