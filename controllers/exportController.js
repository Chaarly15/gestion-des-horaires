const PDFDocument = require('pdfkit');
const ExcelJS     = require('exceljs');
const {
  Enseignant, HeureEffectuee,
  AnneeAcademique, Departement, Matiere
} = require('../models');
const { fn, col } = require('sequelize');

// ─────────────────────────────────────────────
// fichePDF
// Génère la fiche PDF d'un enseignant
// GET /api/exports/fiche/:id_enseignant?id_annee=1
// ─────────────────────────────────────────────
const fichePDF = async (req, res) => {
  try {
    const { id_enseignant } = req.params;
    const { id_annee }      = req.query;

    const enseignant = await Enseignant.findByPk(id_enseignant, {
      include: [{ model: Departement, as: 'departement' }]
    });

    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant introuvable.'
      });
    }

    const where = { id_enseignant };
    if (id_annee) where.id_annee = id_annee;

    const heures = await HeureEffectuee.findAll({
      where,
      include: [{ model: Matiere, as: 'matiere' }],
      order: [['date_cours', 'ASC']]
    });

    // Calcul des totaux
    const totalCM = heures.filter(h => h.type_heure === 'CM')
      .reduce((s, h) => s + parseFloat(h.duree), 0);
    const totalTD = heures.filter(h => h.type_heure === 'TD')
      .reduce((s, h) => s + parseFloat(h.duree), 0);
    const totalTP = heures.filter(h => h.type_heure === 'TP')
      .reduce((s, h) => s + parseFloat(h.duree), 0);
    const total   = totalCM + totalTD + totalTP;

    // Génération du PDF
    const doc = new PDFDocument({ margin: 50 });

    // Headers HTTP pour téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=fiche_${enseignant.nom}_${enseignant.prenom}.pdf`
    );

    // Le PDF se streame directement dans la réponse
    doc.pipe(res);

    // ── Contenu du PDF ────────────────────────
    doc.fontSize(18).font('Helvetica-Bold')
       .text('FICHE INDIVIDUELLE ENSEIGNANT', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('Informations personnelles');
    doc.font('Helvetica')
       .text(`Nom et Prénom : ${enseignant.nom} ${enseignant.prenom}`)
       .text(`Grade          : ${enseignant.grade}`)
       .text(`Statut         : ${enseignant.statut}`)
       .text(`Département    : ${enseignant.departement?.nom_departement}`)
       .text(`Taux horaire   : ${enseignant.taux_horaire} FCFA/h`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Récapitulatif des heures');
    doc.font('Helvetica')
       .text(`Total CM : ${totalCM}h`)
       .text(`Total TD : ${totalTD}h`)
       .text(`Total TP : ${totalTP}h`)
       .text(`Total    : ${total}h`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Détail des séances');
    heures.forEach(h => {
      doc.font('Helvetica').fontSize(10)
         .text(`${h.date_cours} | ${h.type_heure} | ${h.duree}h | ${h.matiere?.intitule} | Salle : ${h.salle || 'N/A'}`);
    });

    doc.end();

  } catch (error) {
    console.error('Erreur fichePDF :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─────────────────────────────────────────────
// etatGlobalExcel
// Génère l'état global des heures en Excel
// GET /api/exports/etat-global?id_annee=1
// ─────────────────────────────────────────────
const etatGlobalExcel = async (req, res) => {
  try {
    const { id_annee } = req.query;

    const enseignants = await Enseignant.findAll({
      include: [{ model: Departement, as: 'departement' }],
      order: [['nom', 'ASC']]
    });

    let annee = null;
    if (id_annee) annee = await AnneeAcademique.findByPk(id_annee);

    // Création du classeur Excel
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('État Global des Heures');

    // Style des en-têtes
    worksheet.columns = [
      { header: 'Nom',                    key: 'nom',           width: 20 },
      { header: 'Prénom',                 key: 'prenom',        width: 20 },
      { header: 'Grade',                  key: 'grade',         width: 20 },
      { header: 'Statut',                 key: 'statut',        width: 15 },
      { header: 'Département',            key: 'departement',   width: 25 },
      { header: 'Total CM (h)',           key: 'total_cm',      width: 15 },
      { header: 'Total TD (h)',           key: 'total_td',      width: 15 },
      { header: 'Total TP (h)',           key: 'total_tp',      width: 15 },
      { header: 'Total Heures (h)',       key: 'total',         width: 18 },
      { header: 'Quota Contractuel (h)',  key: 'quota',         width: 20 },
      { header: 'H. Complémentaires (h)', key: 'complementaires', width: 22 },
      { header: 'Montant à Payer (FCFA)', key: 'montant',       width: 22 },
    ];

    // Style de la ligne d'en-tête
    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF1A3C6E' }
      };
      cell.font  = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Remplissage des données
    for (const ens of enseignants) {
      const where = { id_enseignant: ens.id };
      if (id_annee) where.id_annee = id_annee;

      const heures = await HeureEffectuee.findAll({ where });

      const cm  = heures.filter(h => h.type_heure === 'CM').reduce((s, h) => s + parseFloat(h.duree), 0);
      const td  = heures.filter(h => h.type_heure === 'TD').reduce((s, h) => s + parseFloat(h.duree), 0);
      const tp  = heures.filter(h => h.type_heure === 'TP').reduce((s, h) => s + parseFloat(h.duree), 0);
      const tot = cm + td + tp;

      let quota = 0;
      if (annee) {
        quota = ens.statut === 'Permanent'
          ? parseFloat(annee.h_contract_permanent)
          : parseFloat(annee.h_contract_vacataire);
      }

      const comp    = Math.max(0, tot - quota);
      const montant = comp * parseFloat(ens.taux_horaire);

      worksheet.addRow({
        nom:            ens.nom,
        prenom:         ens.prenom,
        grade:          ens.grade,
        statut:         ens.statut,
        departement:    ens.departement?.nom_departement,
        total_cm:       cm,
        total_td:       td,
        total_tp:       tp,
        total:          tot,
        quota,
        complementaires: comp,
        montant
      });
    }

    // Headers HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=etat_global_${annee?.libelle || 'toutes_annees'}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erreur etatGlobalExcel :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { fichePDF, etatGlobalExcel };