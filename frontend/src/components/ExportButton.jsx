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

      // Generate filename with date
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const filename = `ostra-squad-${dateStr}.png`;

      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });

      if (!blob) {
        console.error('Failed to create blob');
        setIsExporting(false);
        return;
      }

      // Try Web Share API first (works great on iOS/Android)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        const shareData = { files: [file] };
        
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setIsExporting(false);
            return;
          } catch (err) {
            // User cancelled or share failed, fall back to download
            if (err.name === 'AbortError') {
              setIsExporting(false);
              return;
            }
          }
        }
      }

      // Fallback: regular download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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
      title="Spara bild"
    >
      <Camera size={22} weight="bold" className={isExporting ? "text-white/50" : "text-white"} />
    </button>
  );
};
