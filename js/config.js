// ============================================================
//  CONFIGURAÇÕES DO SITE  (edite aqui, sem mexer no resto)
// ============================================================
window.CONFIG = {

  // Senha do /adm, guardada como "hash" SHA-256 (não como texto).
  // A senha padrão é:  admin123   -> TROQUE antes de publicar!
  // Para gerar o hash da sua senha: entre em /adm e use a caixa "Trocar a senha".
  adminHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",

  // Comentários em cada alimento, via Giscus (usa as "Discussions" do seu
  // repositório no GitHub, é gratuito). Passo a passo no README.md.
  // Enquanto estiver vazio, a área de comentários fica oculta.
  giscus: {
    repo: "",        // ex.: "seuusuario/vitrine-hortifruti"
    repoId: "",      // ex.: "R_kgDOxxxxxxx"
    category: "",    // ex.: "Comentarios"
    categoryId: ""   // ex.: "DIC_kwDOxxxxxxx"
  }
};
