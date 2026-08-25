import React, { useState } from 'react';
import { X, Send, MessageSquare, Check, Copy, ExternalLink, Bell, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { InspectionRecord, ExtinguisherUnit, Language } from '../../types';

interface LineNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  record?: InspectionRecord | null;
  unit?: ExtinguisherUnit | null;
}

export const LineNotificationModal: React.FC<LineNotificationModalProps> = ({
  isOpen,
  onClose,
  lang,
  record,
  unit,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  const unitId = record?.extinguisherId || unit?.id || 'FE-2041';
  const status = record?.status || unit?.status || 'passed';
  const inspector = record?.inspectorNameTh || record?.inspectorName || 'เจ้าหน้าที่ จป. ประจำอาคาร';
  const location = unit?.buildingTh ? `${unit.buildingTh} (${unit.roomLocationTh})` : 'อาคารอำนวยการ (ชั้น 2)';
  const pressure = record?.pressurePsi ? `${record.pressurePsi} PSI` : '195 PSI';
  const notes = record?.notesTh || record?.notes || 'สภาพทั่วไปสมบูรณ์ พร้อมใช้งานตามมาตรฐาน';

  const statusLabel = status === 'passed' ? '✅ ผ่านการตรวจสอบ (Normal)' : status === 'failed' ? '🚨 ชำรุด/ไม่ผ่าน (Failed)' : '⚠️ ส่งซ่อมบำรุง (Maintenance)';

  // Format rich LINE message
  const lineMessage = 
    `🚨 [RT-Fire Safety แจ้งเตือนสถานะอุปกรณ์]\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📌 รหัสถัง: ${unitId}\n` +
    `🏢 สถานที่: ${location}\n` +
    `📊 ผลตรวจ: ${statusLabel}\n` +
    `💨 แรงดัน: ${pressure}\n` +
    `👤 ผู้ตรวจ: ${inspector}\n` +
    `📝 หมายเหตุ: ${notes}\n` +
    `⏰ เวลา: ${record?.date || new Date().toLocaleDateString('th-TH')} ${record?.time || ''}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🔗 เปิดดูข้อมูลและรายงานฉบับเต็มได้ที่ RT-Fire Safety Suite`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(lineMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToLineApp = () => {
    const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineMessage)}`;
    window.open(lineShareUrl, '_blank');
  };

  const handleSimulateWebhook = () => {
    setSimulatedSent(true);
    setTimeout(() => {
      setSimulatedSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#06c755]/10 text-[#06c755] rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-1.5">
                <span>{isTh ? 'ส่งการแจ้งเตือนผ่าน LINE' : 'LINE Safety Alert Notification'}</span>
              </h3>
              <p className="text-[10px] text-gray-500">
                {isTh ? 'แจ้งเตือนผลการตรวจ / ถังชำรุดเข้ากลุ่มช่างและผู้ดูแล' : 'Dispatch instant alert to LINE group or officer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LINE Flex Message Card Mockup */}
        <div className="bg-[#1b2b3a] p-4 rounded-2xl text-white shadow-md border border-gray-700 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <div className="flex items-center gap-1.5 text-[#06c755] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>RT-Fire Safety Notification</span>
            </div>
            <span className="text-[9px] bg-red-600/80 px-2 py-0.5 rounded-full font-bold">
              OFFICIAL
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-mono block">UNIT IDENTIFIER</span>
            <p className="font-extrabold text-lg text-white tracking-wide">{unitId}</p>
          </div>

          <div className="bg-[#243545] p-3 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">{isTh ? 'ผลการตรวจ:' : 'Status:'}</span>
              <span className={`font-bold ${status === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{isTh ? 'สถานที่:' : 'Location:'}</span>
              <span className="font-medium text-white truncate max-w-[180px]">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{isTh ? 'แรงดันเกจ:' : 'Pressure:'}</span>
              <span className="font-mono font-bold text-amber-300">{pressure}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{isTh ? 'ผู้ตรวจสอบ:' : 'Inspector:'}</span>
              <span className="font-medium text-gray-200">{inspector}</span>
            </div>
            {record?.notesTh && (
              <div className="pt-1.5 border-t border-gray-700 text-[11px] text-gray-300">
                <span className="text-gray-400 block mb-0.5">{isTh ? 'หมายเหตุ:' : 'Notes:'}</span>
                <p className="italic bg-black/20 p-1.5 rounded-lg">{record.notesTh}</p>
              </div>
            )}
          </div>

          <div className="text-center pt-1">
            <p className="text-[10px] text-gray-400">
              {isTh ? 'ข้อความพร้อมส่งต่อให้ทีมงานเพื่อประสานงานทันที' : 'Formatted for LINE Messaging API & Flex Message'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShareToLineApp}
            className="w-full py-3 bg-[#06c755] hover:bg-[#05b34c] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>{isTh ? '📲 เปิดแอป LINE เพื่อแชร์เข้ากลุ่มทันที' : '📲 Share to LINE App / Group'}</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isTh ? 'คัดลอกข้อความแล้ว!' : 'Copied!') : (isTh ? 'คัดลอกข้อความ' : 'Copy Text')}</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateWebhook}
              disabled={simulatedSent}
              className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{simulatedSent ? (isTh ? '✓ ส่งแจ้งเตือนแล้ว' : 'Sent!') : (isTh ? 'ส่งผ่าน Webhook' : 'Send Webhook')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
