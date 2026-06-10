// utils/export.js
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ---- Export to Word ----
export async function exportToWord(notes, flashcards = []) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Study Notes", heading: "Heading1" }),
          new Paragraph(notes),
          ...(flashcards.length
            ? [
                new Paragraph({ text: "Flashcards", heading: "Heading1" }),
                ...flashcards.map(
                  (f, i) =>
                    new Paragraph({
                      children: [
                        new TextRun({ text: `Q${i + 1}: ${f.front}`, bold: true }),
                        new TextRun({ text: `\nA: ${f.back}` }),
                      ],
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notes.docx";
  a.click();
  window.URL.revokeObjectURL(url);
}

// ---- Export to PDF ----
export async function exportToPDF(elementId) {
  const input = document.getElementById(elementId);
  if (!input) return;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("notes.pdf");
}
