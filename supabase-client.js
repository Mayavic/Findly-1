/* ============ SUPABASE (client partagé) ============ */
const SUPABASE_URL = "https://amhpqypzvshbndjhjjmt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pKK-bfxAIbVlf_ZxKJfMOA_HQTNqv0_";

let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error("Supabase: la librairie CDN ne s'est pas chargée.");
  }
} catch (err) {
  // Certains navigateurs (Safari notamment) bloquent le stockage local
  // quand une page est ouverte en double-clic (file://) plutôt que via une vraie URL.
  console.error("Supabase: impossible d'initialiser le client —", err);
}
