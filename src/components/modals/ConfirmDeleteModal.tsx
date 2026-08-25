import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Language } from '../../types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  lang?: Language;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  lang = 'th',
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  return (
    <div id="confirm-delete-modal-backdrop" className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 text-center space-y-4">
        
        <div className="w-14 h-14 bg-red-100 text-[#d32f2f] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Trash2 className="w-7 h-7" />
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-gray-900">
            {title || (isTh ? 'ยืนยันการลบข้อมูล' : 'Confirm Deletion')}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {message || (isTh ? 'คุณต้องการลบรายการนี้ออกจากระบบใช่หรือไม่? ข้อมูลจะถูกลบถาวร' : 'Are you sure you want to delete this item? This action cannot be undone.')}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
          >
            {isTh ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isTh ? 'ยืนยันลบ' : 'Delete'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
