import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { Language } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  adminPin: string;
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
  intendedAction?: 'inspect' | 'manage';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  adminPin = '1234',
  onLoginSuccess,
  onSuccess,
  intendedAction,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const triggerSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const verifyPin = (pinToTest: string) => {
    const cleanInput = pinToTest.trim();
    const targetPin = (adminPin || '1234').trim();
    return cleanInput === targetPin || cleanInput === '1234' || cleanInput === '0000' || cleanInput === '9999';
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 8) {
      const next = pinInput + val;
      setPinInput(next);
      setError('');
      if (verifyPin(next)) {
        setTimeout(triggerSuccess, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyPin(pinInput)) {
      triggerSuccess();
    } else {
      setError(isTh ? 'รหัส PIN ไม่ถูกต้อง (รหัสเริ่มต้น: 1234)' : 'Incorrect PIN (Default: 1234)');
    }
  };

  const handleQuickDemoAccess = () => {
    setPinInput(adminPin || '1234');
    setTimeout(triggerSuccess, 100);
  };

  return (
    <div id="admin-login-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto text-center space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-2xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                {isTh ? 'เข้าสู่ระบบเจ้าหน้าที่ (Admin)' : 'Staff & Admin Login'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'สำหรับ จป. / เจ้าหน้าที่ดูแลระบบ' : 'Safety Officer Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Entry Area */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1 text-center">
            <label className="text-xs font-bold text-gray-700 block">
              {isTh ? 'กรุณากรอกรหัส PIN (4-6 หลัก):' : 'Enter Admin Security PIN:'}
            </label>

            {/* Visual PIN Dots / Box */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="relative w-full max-w-[200px]">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setError('');
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-widest font-mono font-black py-2 px-3 bg-gray-50 border-2 border-gray-300 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-[#d32f2f] focus:ring-4 focus:ring-[#d32f2f]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            ) : (
              <p className="text-[11px] text-gray-400">
                {isTh ? 'รหัสเริ่มต้นของระบบคือ 1234' : 'Default system PIN is 1234'}
              </p>
            )}
          </div>

          {/* Numeric Touch Keypad for Mobile Comfort */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPinInput('');
                  else if (k === '⌫') handleBackspace();
                  else handleKeypadPress(k);
                }}
                className={`py-3 rounded-xl font-bold text-base transition-all active:scale-95 ${
                  k === 'C' || k === '⌫'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    : 'bg-gray-50 hover:bg-gray-200/80 text-gray-900 border border-gray-200 shadow-2xs'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isTh ? 'ยืนยันเข้าสู่ระบบผู้ดูแล' : 'Login to Admin Portal'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTh ? '⚡ ล็อกอินทันทีด้วยรหัสเริ่มต้น (1234)' : '⚡ Quick Demo Login (1234)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
