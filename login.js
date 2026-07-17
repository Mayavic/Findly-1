const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authPasswordConfirm = document.getElementById("auth-password-confirm");
const authSubmit = document.getElementById("auth-submit");
const authError = document.getElementById("auth-error");
const authSuccess = document.getElementById("auth-success");
const authToggle = document.getElementById("auth-toggle");
const authTitle = document.getElementById("auth-title");
const authSub = document.getElementById("auth-sub");

let mode = "login"; // "login" | "signup"

function setMode(next) {
  mode = next;
  authError.hidden = true;
  authSuccess.hidden = true;
  authPasswordConfirm.hidden = mode !== "signup";
  authPasswordConfirm.required = mode === "signup";
  if (mode === "login") {
    authTitle.textContent = "Connexion";
    authSub.textContent = "Réservé à l'équipe Findly.";
    authPassword.setAttribute("autocomplete", "current-password");
    authSubmit.textContent = "Se connecter →";
    authToggle.textContent = "Pas encore de compte ? Créer un compte";
  } else {
    authTitle.textContent = "Créer un compte";
    authSub.textContent = "Réservé à l'équipe Findly.";
    authPassword.setAttribute("autocomplete", "new-password");
    authSubmit.textContent = "Créer le compte →";
    authToggle.textContent = "Déjà un compte ? Se connecter";
  }
}

authToggle?.addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));

if (!supabaseClient) {
  authError.textContent = "La librairie Supabase ne s'est pas chargée (vérifie ta connexion internet et recharge la page).";
  authError.hidden = false;
}

// Si déjà connecté, direction l'espace admin.
(async () => {
  if (!supabaseClient) return;
  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data?.session) window.location.href = "admin.html";
  } catch (err) {
    console.error("Erreur getSession:", err);
  }
})();

authForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.hidden = true;
  authSuccess.hidden = true;

  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!supabaseClient) {
    authError.textContent = "La librairie Supabase ne s'est pas chargée (vérifie ta connexion internet et recharge la page).";
    authError.hidden = false;
    return;
  }

  if (mode === "signup" && password !== authPasswordConfirm.value) {
    authError.textContent = "Les deux mots de passe ne correspondent pas.";
    authError.hidden = false;
    return;
  }

  if (password.length < 6) {
    authError.textContent = "Le mot de passe doit faire au moins 6 caractères.";
    authError.hidden = false;
    return;
  }

  authSubmit.disabled = true;

  try {
    if (mode === "login") {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        authError.textContent = error.message === "Email not confirmed"
          ? "Confirme d'abord ton adresse email (lien reçu par email) avant de te connecter."
          : "Email ou mot de passe incorrect.";
        authError.hidden = false;
        return;
      }
      window.location.href = "admin.html";
    } else {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) {
        authError.textContent = error.message || "Impossible de créer le compte.";
        authError.hidden = false;
        return;
      }
      if (data?.user && !data.session) {
        authSuccess.textContent = "Compte créé ! Vérifie ta boîte mail (et les spams) pour confirmer ton adresse, puis connecte-toi.";
        authSuccess.hidden = false;
        setMode("login");
      } else if (data?.session) {
        window.location.href = "admin.html";
      }
    }
  } catch (err) {
    console.error("Erreur d'authentification:", err);
    authError.textContent = "Erreur inattendue : " + (err?.message || String(err));
    authError.hidden = false;
  } finally {
    authSubmit.disabled = false;
  }
});
