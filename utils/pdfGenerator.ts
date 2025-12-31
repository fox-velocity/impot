import { jsPDF } from "jspdf";
import { SimulationResult, TaxInputs } from "../types";

const formatCur = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val || 0);

const getStandardDeduction = (salary: number) => {
    if (salary === 0) return 0;
    const d = salary * 0.10;
    // Bornes 2025 (revenus 2024) approx
    const min = 504;
    const max = 14426;
    let val = Math.max(d, min);
    val = Math.min(val, max);
    // On plafonne au salaire pour l'affichage pour éviter confusion si salaire < min
    return Math.min(val, salary);
}

export const generateTaxPDF = (results: SimulationResult, inputs: TaxInputs) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Configuration de la police
  doc.setFont("helvetica");

  // --- En-tête ---
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("Simulation Impôt 2025", margin, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, y);
  doc.text("Revenus 2024 - Barème 2025", margin, y + 5);

  y += 20;

  // --- Résultat Principal ---
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(34, 197, 94); // Green 500
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 35, 3, 3, 'FD');

  doc.setFontSize(14);
  doc.setTextColor(21, 128, 61); // Green 700
  doc.text("NET À PAYER", margin + 10, y + 12);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 83, 45); // Green 900
  doc.text(formatCur(results.totalTax), margin + 10, y + 25);
  
  doc.setFont("helvetica", "normal");
  y += 45;

  // --- Section : Données d'entrée (Situation & Revenus) ---
  const isCouple = inputs.situation === 'Couple';
  const boxHeight = isCouple ? 100 : 75;
  
  // Fond gris clair pour la zone contextuelle
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  
  // Cadre gauche: Situation
  doc.roundedRect(margin, y, 80, boxHeight, 2, 2, 'FD');
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Situation de Famille", margin + 5, y + 10);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`• Statut : ${inputs.situation}`, margin + 5, y + 20);
  doc.text(`• Enfants : ${inputs.children}`, margin + 5, y + 27);
  doc.text(`• Parts fiscales : ${results.parts}`, margin + 5, y + 34);

  // Cadre droite: Revenus & Charges
  doc.setFillColor(248, 250, 252); 
  doc.roundedRect(margin + 85, y, 85, boxHeight, 2, 2, 'FD');
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Revenus et Charges", margin + 90, y + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  
  let lineH = y + 20;
  const colX = margin + 90;

  // Déclarant 1
  doc.setFont("helvetica", "bold");
  doc.text(`Déclarant 1 : ${formatCur(inputs.salary1)}`, colX, lineH);
  doc.setFont("helvetica", "normal");
  lineH += 5;

  doc.setFontSize(8);
  // Frais Réels
  doc.text(`- Frais Réels : ${formatCur(inputs.realExpenses1)}`, colX, lineH);
  lineH += 4;
  
  if (inputs.realExpenses1 === 0 && inputs.salary1 > 0) {
      const deduc1 = getStandardDeduction(inputs.salary1);
      doc.setTextColor(100, 116, 139);
      doc.text(`  (Déduction 10% : ${formatCur(deduc1)})`, colX, lineH);
      doc.setTextColor(71, 85, 105);
      lineH += 4;
  }

  doc.text(`- Versement PER : ${formatCur(inputs.per1)}`, colX, lineH);
  lineH += 4;

  doc.setFontSize(9);
  lineH += 2;
  
  // Déclarant 2
  if (isCouple) {
      doc.setFont("helvetica", "bold");
      doc.text(`Déclarant 2 : ${formatCur(inputs.salary2)}`, colX, lineH);
      doc.setFont("helvetica", "normal");
      lineH += 5;

      doc.setFontSize(8);
      
      doc.text(`- Frais Réels : ${formatCur(inputs.realExpenses2)}`, colX, lineH);
      lineH += 4;

      if (inputs.realExpenses2 === 0 && inputs.salary2 > 0) {
        const deduc2 = getStandardDeduction(inputs.salary2);
        doc.setTextColor(100, 116, 139);
        doc.text(`  (Déduction 10% : ${formatCur(deduc2)})`, colX, lineH);
        doc.setTextColor(71, 85, 105);
        lineH += 4;
      }

      doc.text(`- Versement PER : ${formatCur(inputs.per2)}`, colX, lineH);
      lineH += 4;

      doc.setFontSize(9);
      lineH += 2;
  }
  
  if (inputs.commonCharges > 0) {
      doc.text(`Charges déduc. : ${formatCur(inputs.commonCharges)}`, colX, lineH);
      lineH += 5;
  }
  if (inputs.reduction > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`Réductions impôt : ${formatCur(inputs.reduction)}`, colX, lineH);
      doc.setTextColor(71, 85, 105);
  }

  y += (boxHeight + 10);

  // --- Tableau Détail du Calcul (Cascade) ---
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Décomposition du calcul", margin, y);
  y += 10;

  // Fonction helper pour une ligne du tableau
  const drawRow = (label: string, value: string, type: 'normal' | 'minus' | 'plus' | 'total' | 'subtotal' = 'normal') => {
    const rowHeight = type === 'total' ? 12 : 8;
    
    // Background style
    if (type === 'total') {
        doc.setFillColor(255, 251, 235); // Yellow 50
        doc.rect(margin, y - 5, pageWidth - (margin * 2), rowHeight, 'F');
    } else if (type === 'minus') {
        doc.setFillColor(236, 253, 245); // Emerald 50
        doc.rect(margin, y - 5, pageWidth - (margin * 2), rowHeight, 'F');
    } else if (type === 'plus') {
        doc.setFillColor(254, 242, 242); // Red 50
        doc.rect(margin, y - 5, pageWidth - (margin * 2), rowHeight, 'F');
    }

    // Text style
    doc.setFont("helvetica", type === 'total' || type === 'subtotal' ? "bold" : "normal");
    
    if (type === 'minus') doc.setTextColor(21, 128, 61); // Green 700
    else if (type === 'plus') doc.setTextColor(185, 28, 28); // Red 700
    else if (type === 'total') doc.setTextColor(30, 41, 59);
    else doc.setTextColor(71, 85, 105);

    doc.setFontSize(type === 'total' ? 12 : 10);
    doc.text(label, margin + 5, y);
    
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - margin - 5, y, { align: 'right' });

    y += rowHeight;
  };

  // 1. RNI & QF (Info contextuelle)
  drawRow("Revenu Net Imposable", formatCur(results.rni));
  drawRow("Quotient Familial", formatCur(results.qf));
  y += 2; // Spacer
  
  // 2. Droits Simples
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  drawRow("Droits Simples", formatCur(results.decote.taxBeforeDecote));

  // 3. Réduction Complémentaire (Veuf)
  if (results.pfqf.rcvReduction > 0) {
      drawRow("↳ Réduction impôt complémentaire (Quotient Conjugal)", `- ${formatCur(results.pfqf.rcvReduction)}`, 'minus');
  }

  // 4. Décote
  if (results.decote.amount > 0) {
      drawRow("↳ Décote", `- ${formatCur(results.decote.amount)}`, 'minus');
  }

  // 5. Réductions saisies
  if (inputs.reduction > 0) {
      drawRow("↳ Réductions / Crédits d'impôt saisies", `- ${formatCur(inputs.reduction)}`, 'minus');
  }

  // 6. Impôt Net
  drawRow("= Impôt sur le Revenu Net", formatCur(results.finalTax), 'subtotal');

  // 7. CEHR
  if (results.cehr > 0) {
      drawRow("+ Contribution Hauts Revenus (CEHR)", `+ ${formatCur(results.cehr)}`, 'plus');
  }

  // 8. Total
  doc.setDrawColor(30, 41, 59);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  drawRow("TOTAL À PAYER", formatCur(results.totalTax), 'total');

  y += 15;

  // --- Explications techniques ---
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); 
  doc.setFont("helvetica", "bold");
  doc.text("Explications techniques", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  results.details.forEach((line) => {
    if (y > 270) {
        doc.addPage();
        y = 20;
    }
    doc.text(`• ${line}`, margin, y);
    y += 7;
  });

  // Disclaimer bas de page
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Document généré à titre indicatif - Ne remplace pas l'avis d'imposition officiel.", pageWidth / 2, 290, { align: 'center' });
  }

  doc.save("simulation-impot-2025.pdf");
};