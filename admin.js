// La vraie protection est côté serveur (policy RLS sur la table waitlist).
// Cette liste ne sert qu'à afficher le bon écran côté client.
const ADMIN_EMAILS = [
  "ludovic.desgranges@newscore.fr",
  "victoire.gastaud10@gmail.com",
  "maiwenchio@yahoo.fr",
];

const loadingEl = document.getElementById("admin-loading");
const deniedEl = document.getElementById("admin-denied");
const contentEl = document.getElementById("admin-content");
const countEl = document.getElementById("admin-count");
const tableBody = document.getElementById("admin-table-body");
const adminUserEl = document.getElementById("admin-user");
const logoutBtn = document.getElementById("logout-btn");

function show(el) {
  [loadingEl, deniedEl, contentEl].forEach((e) => { e.hidden = e !== el; });
}

logoutBtn?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

(async () => {
  if (!supabaseClient) { show(deniedEl); return; }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const email = session.user.email;
  adminUserEl.textContent = email;
  adminUserEl.hidden = false;
  logoutBtn.hidden = false;

  if (!ADMIN_EMAILS.includes(email)) {
    show(deniedEl);
    return;
  }

  const { data, error } = await supabaseClient
    .from("waitlist")
    .select("name, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    show(deniedEl);
    return;
  }

  countEl.textContent = `${data.length} personne${data.length > 1 ? "s" : ""} sur la liste.`;
  tableBody.innerHTML = data.map((row) => `
    <tr>
      <td>${(row.name || "—").replace(/</g, "&lt;")}</td>
      <td>${row.email.replace(/</g, "&lt;")}</td>
      <td>${new Date(row.created_at).toLocaleString("fr-FR")}</td>
    </tr>
  `).join("");

  show(contentEl);
})();
