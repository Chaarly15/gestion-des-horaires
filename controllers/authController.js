const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Utilisateur, Enseignant } = require('../models');

// ─────────────────────────────────────────────
// login
// Connecte un utilisateur et retourne un token
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    // 1. On récupère login et mot de passe
    //    envoyés par React dans le body
    const { login, mot_de_passe } = req.body;

    // 2. Vérification : les 2 champs sont-ils remplis ?
    if (!login || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Login et mot de passe obligatoires.'
      });
    }

    // 3. On cherche l'utilisateur dans la BDD
    //    On inclut aussi les infos de l'enseignant
    //    si le compte est lié à un enseignant
    const utilisateur = await Utilisateur.findOne({
      where: { login },
      include: [{
        model: Enseignant,
        as: 'enseignant',
        // On prend seulement ces colonnes de l'enseignant
        attributes: ['id', 'nom', 'prenom']
      }]
    });

    // 4. Si l'utilisateur n'existe pas
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect.'
      });
    }

    // 5. On compare le mot de passe envoyé
    //    avec le mot de passe hashé en BDD
    //    bcrypt.compare() retourne true ou false
    const motDePasseValide = await bcrypt.compare(
      mot_de_passe,
      utilisateur.mot_de_passe
    );

    // 6. Si le mot de passe est incorrect
    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect.'
      });
    }

    // 7. Tout est OK → on génère le token JWT
    //    Le token contient : id, login, role
    //    Il expire selon JWT_EXPIRES_IN dans .env
    const token = jwt.sign(
      {
        id:    utilisateur.id,
        login: utilisateur.login,
        role:  utilisateur.role,
        id_enseignant: utilisateur.id_enseignant
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 8. On retourne le token et les infos utiles
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      utilisateur: {
        id:           utilisateur.id,
        login:        utilisateur.login,
        role:         utilisateur.role,
        enseignant:   utilisateur.enseignant
      }
    });

  } catch (error) {
    // En cas d'erreur inattendue
    console.error('Erreur login :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getMonProfil
// Retourne les infos de l'utilisateur connecté
// Nécessite d'être authentifié (token valide)
// ─────────────────────────────────────────────
const getMonProfil = async (req, res) => {
  try {
    // req.utilisateur est rempli par le middleware
    // verifierToken → contient id, login, role
    const utilisateur = await Utilisateur.findByPk(
      req.utilisateur.id,
      {
        // On n'envoie pas le mot de passe au front
        attributes: { exclude: ['mot_de_passe'] },
        include: [{
          model: Enseignant,
          as: 'enseignant',
          attributes: ['id', 'nom', 'prenom', 'grade', 'statut']
        }]
      }
    );

    return res.status(200).json({
      success: true,
      data: utilisateur
    });

  } catch (error) {
    console.error('Erreur getMonProfil :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// changerMotDePasse
// Permet à l'utilisateur connecté de changer
// son mot de passe
// ─────────────────────────────────────────────
const changerMotDePasse = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    // 1. Vérification des champs
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Les deux mots de passe sont obligatoires.'
      });
    }

    // 2. Vérification longueur minimum
    if (nouveau_mot_de_passe.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      });
    }

    // 3. On récupère l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(
      req.utilisateur.id
    );

    // 4. On vérifie l'ancien mot de passe
    const ancienValide = await bcrypt.compare(
      ancien_mot_de_passe,
      utilisateur.mot_de_passe
    );

    if (!ancienValide) {
      return res.status(401).json({
        success: false,
        message: 'Ancien mot de passe incorrect.'
      });
    }

    // 5. On hashe le nouveau mot de passe
    //    Le "10" = nombre de tours de hashage
    //    Plus c'est élevé, plus c'est sécurisé
    //    mais plus c'est lent. 10 = bon équilibre
    const nouveauHash = await bcrypt.hash(
      nouveau_mot_de_passe, 10
    );

    // 6. On sauvegarde le nouveau mot de passe
    await utilisateur.update({ mot_de_passe: nouveauHash });

    return res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });

  } catch (error) {
    console.error('Erreur changerMotDePasse :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

module.exports = { login, getMonProfil, changerMotDePasse };
