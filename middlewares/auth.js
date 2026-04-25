const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "votre_secret_super_securise";

/**
 * Middleware : verifierToken
 * Vérifie la présence et la validité du JWT dans le header Authorization.
 * Format attendu : Authorization: Bearer <token>
 */
const verifierToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // 1. Vérifier la présence du header
  if (!authHeader) {
    return res.status(401).json({
      succes: false,
      message: "Accès refusé : aucun token fourni.",
    });
  }

  // 2. Vérifier le format "Bearer <token>"
  const parties = authHeader.split(" ");
  if (parties.length !== 2 || parties[0] !== "Bearer") {
    return res.status(401).json({
      succes: false,
      message: "Format du token invalide. Utilisez : Bearer <token>",
    });
  }

  const token = parties[1];

  // 3. Vérifier et décoder le token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.utilisateur = decoded; // On attache le payload à la requête
    next();
  } catch (erreur) {
    if (erreur.name === "TokenExpiredError") {
      return res.status(401).json({
        succes: false,
        message: "Token expiré. Veuillez vous reconnecter.",
      });
    }
    return res.status(403).json({
      succes: false,
      message: "Token invalide.",
      detail: erreur.message,
    });
  }
};

/**
 * Middleware : verifierRole
 * Vérifie que l'utilisateur connecté possède un des rôles autorisés.
 * @param {...string} rolesAutorises - Les rôles qui ont accès à la route.
 * Usage : verifierRole("admin", "moderateur")
 */
const verifierRole = (...rolesAutorises) => {
  return (req, res, next) => {
    // Ce middleware doit être utilisé APRÈS verifierToken
    if (!req.utilisateur) {
      return res.status(401).json({
        succes: false,
        message: "Non authentifié. Exécutez verifierToken d'abord.",
      });
    }

    const roleUtilisateur = req.utilisateur.role;

    if (!rolesAutorises.includes(roleUtilisateur)) {
      return res.status(403).json({
        succes: false,
        message: `Accès interdit : le rôle '${roleUtilisateur}' n'est pas autorisé.`,
        rolesRequis: rolesAutorises,
      });
    }

    next();
  };
};

module.exports = { verifierToken, verifierRole };
