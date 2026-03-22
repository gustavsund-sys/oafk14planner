import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Camera } from '@phosphor-icons/react';

export const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Find the pitch element
      const pitchElement = document.querySelector('[data-testid="football-pitch"]');
      if (!pitchElement) {
        console.error('Pitch element not found');
        setIsExporting(false);
        return;
      }

      // Get the pitch area (includes subs bench)
      const pitchArea = document.querySelector('.pitch-area');
      const elementToCapture = pitchArea || pitchElement;

      // Create canvas from the element
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: '#050505',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Generate filename with date
          const date = new Date();
          const dateStr = date.toISOString().split('T')[0];
          link.download = `ostra-squad-${dateStr}.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Export failed:', error);
    }
    
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
      data-testid="export-image-button"
      title="Exportera som bild"
    >
      <Camera size={22} weight="bold" className="text-white" />
    </button>
  );
};
