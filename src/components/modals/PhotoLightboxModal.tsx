import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import { Language } from '../../types';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  photoUrl: string | null;
  title?: string;
  subtitle?: string;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  lang,
  photoUrl,
  title,
  subtitle,
}) => {
  if (!isOpen || !photoUrl) return null;

  const isTh = lang === 'th';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `RT_FireSafe_Evidence_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl border border-gray-800 text-white flex flex-col space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-red-500" />
              <span>{title || (isTh ? 'ภาพถ่ายหลักฐานหน้างาน' : 'Field Inspection Photo Evidence')}</span>
            </h3>
            {subtitle && (
              <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-1 bg-gray-800/80 px-3"
              title={isTh ? 'ดาวน์โหลดภาพ' : 'Download Photo'}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isTh ? 'ดาวน์โหลด' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo Canvas */}
        <div className="bg-black/90 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[70vh] border border-gray-800/80">
          <img
            src={photoUrl}
            alt="Inspection Evidence"
            className="w-full h-full object-contain max-h-[68vh] rounded-xl"
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span>{isTh ? '🔒 บันทึกภาพพร้อมระบบยืนยันความปลอดภัย RT-Fire Safety' : '🔒 Verified RT-Fire Safety Visual Record'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors text-xs"
          >
            {isTh ? 'ปิดหน้าต่าง' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
