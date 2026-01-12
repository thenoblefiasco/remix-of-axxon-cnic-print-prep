import jsPDF from 'jspdf';

export interface ExportImage {
  id: string;
  name: string;
  url: string;
  type: 'front' | 'back' | 'unknown';
  rotation: number;
  flipped: boolean;
  flippedVertical: boolean;
}

export interface ExportSettings {
  paperSize: 'a4' | 'a5' | 'letter';
  gridDensity: '2x4' | '3x3' | '4x4';
  margin: number;
  padding: number;
}

// CNIC dimensions in mm: 85.6 x 54 (credit card size)
const CNIC_WIDTH_MM = 85.6;
const CNIC_HEIGHT_MM = 54;

export const exportToPDF = async (
  images: ExportImage[],
  settings: ExportSettings
): Promise<void> => {
  const { paperSize, gridDensity, margin, padding } = settings;

  // Paper dimensions in mm
  const paperDimensions = {
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    letter: { width: 215.9, height: 279.4 },
  };

  const paper = paperDimensions[paperSize];
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [paper.width, paper.height],
  });

  // Calculate grid layout
  const [cols, rows] = gridDensity.split('x').map(Number);
  const availableWidth = paper.width - 2 * margin;
  const availableHeight = paper.height - 2 * margin;

  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  // Calculate image dimensions to fit in cell with padding
  const imageWidth = Math.min(CNIC_WIDTH_MM, cellWidth - 2 * padding);
  const imageHeight = Math.min(CNIC_HEIGHT_MM, cellHeight - 2 * padding);

  let imageIndex = 0;
  let pageNumber = 0;

  while (imageIndex < images.length) {
    if (pageNumber > 0) {
      pdf.addPage();
    }

    // Draw cutting guides
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = margin + col * cellWidth;
        const y = margin + row * cellHeight;
        
        // Draw rectangle for each cell
        pdf.rect(x + padding, y + padding, imageWidth, imageHeight);
      }
    }

    // Add images
    for (let row = 0; row < rows && imageIndex < images.length; row++) {
      for (let col = 0; col < cols && imageIndex < images.length; col++) {
        const image = images[imageIndex];
        const x = margin + col * cellWidth + padding;
        const y = margin + row * cellHeight + padding;

        try {
          // Create a canvas to handle rotation and flipping
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = image.url;
          });

          // Set canvas size based on rotation
          const isRotated = image.rotation === 90 || image.rotation === 270;
          canvas.width = isRotated ? img.height : img.width;
          canvas.height = isRotated ? img.width : img.height;

          // Apply transformations
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((image.rotation * Math.PI) / 180);
          if (image.flipped) {
            ctx.scale(-1, 1);
          }
          if (image.flippedVertical) {
            ctx.scale(1, -1);
          }
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();

          // Add to PDF
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          pdf.addImage(imageData, 'JPEG', x, y, imageWidth, imageHeight);

          // Add label
          pdf.setFontSize(6);
          pdf.setTextColor(100, 100, 100);
          if (image.type !== 'unknown') {
            pdf.text(image.type.toUpperCase(), x + 2, y + imageHeight - 2);
          }
        } catch (error) {
          console.error('Error adding image to PDF:', error);
        }

        imageIndex++;
      }
    }

    pageNumber++;
  }

  // Add footer to each page
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Axxon Formix - Page ${i}/${totalPages}`,
      paper.width / 2,
      paper.height - 5,
      { align: 'center' }
    );
  }

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`axxon-formix-cnic-layout-${timestamp}.pdf`);
};
