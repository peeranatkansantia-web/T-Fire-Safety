import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  User, 
  Phone, 
  MessageSquare,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ExtinguisherUnit, Language, PublicIssueReport } from '../../types';
import { CameraCapture } from '../CameraCapture';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  unit: ExtinguisherUnit | null;
  extinguishers?: ExtinguisherUnit[];
  onSubmitReport: (report: PublicIssueReport) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  lang,
  unit,
  extinguishers = [],
  onSubmitReport,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  const [selectedUnitId, setSelectedUnitId] = useState<string>(unit ? unit.id : extinguishers[0]?.id || '');
  const [issueType, setIssueType] = useState<PublicIssueReport['issueType']>('pressure_low');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const targetUnit = extinguishers.find(u => u.id === selectedUnitId) || unit || extinguishers[0];

  const issueOptions: Array<{ id: PublicIssueReport['issueType']; labelTh: string; labelEn: string; descTh: string }> = [
    { 
      id: 'pressure_low', 
      labelTh: 'เข็มเกจวัดแรงดันตก / อยู่นอกแถบสีเขียว', 
      labelEn: 'Low Pressure Gauge',
      descTh: 'เข็มชี้ไปทางซ้าย (Recharge) หรือไม่มีแรงดัน'
    },
    { 
      id: 'seal_broken', 
      labelTh: 'สลักล็อก / ซีลนิรภัยขาดหรือหลุดหาย', 
      labelEn: 'Broken / Missing Tamper Seal',
      descTh: 'ไม่มีสลักเสียบ หรือซีลพลาสติกถูกดึงออกแล้ว'
    },
    { 
      id: 'damaged_body', 
      labelTh: 'ตัวถังบุบ / เป็นสนิม / สายฉีดแตกกรอบ', 
      labelEn: 'Physical Damage / Corrosion / Cracked Hose',
      descTh: 'มีรอยแตก บุบ เป็นสนิม หรือสายฉีดอุดตัน'
    },
    { 
      id: 'discharged', 
      labelTh: 'ถังถูกฉีดใช้งานไปแล้ว', 
      labelEn: 'Extinguisher Discharged / Used',
      descTh: 'มีการนำไปดับไฟหรือทดลองฉีด น้ำยาพร่อง'
    },
    { 
      id: 'missing', 
      labelTh: 'ถังไม่อยู่ที่จุดติดตั้ง / สูญหาย', 
      labelEn: 'Missing from Location',
      descTh: 'ไม่มีถังอยู่ที่จุดแขวน หรือตู้เก็บว่างเปล่า'
    },
    { 
      id: 'blocked', 
      labelTh: 'มีสิ่งกีดขวางหน้าถัง / เข้าถึงยาก', 
      labelEn: 'Blocked Access / Obstructed',
      descTh: 'มีสิ่งของวางบัง ไม่สามารถหยิบใช้งานได้สะดวก'
    },
    { 
      id: 'other', 
      labelTh: 'ปัญหาอื่นๆ', 
      labelEn: 'Other Issues',
      descTh: 'ระบุรายละเอียดเพิ่มเติมในช่องด้านล่าง'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim()) {
      setError(isTh ? 'กรุณากรอกชื่อผู้แจ้งเพื่อให้เจ้าหน้าที่ติดต่อกลับได้' : 'Please provide your name');
      return;
    }
    if (!description.trim() && issueType === 'other') {
      setError(isTh ? 'กรุณาระบุรายละเอียดของปัญหา' : 'Please provide issue description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const newReport: PublicIssueReport = {
      id: `REP-${Date.now().toString().slice(-6)}`,
      unitId: targetUnit ? targetUnit.id : selectedUnitId,
      assetId: targetUnit?.assetId,
      building: targetUnit ? targetUnit.building : 'Main Facility',
      buildingTh: targetUnit ? targetUnit.buildingTh || targetUnit.building : 'อาคารหลัก',
      roomLocation: targetUnit ? targetUnit.roomLocation : 'General Area',
      roomLocationTh: targetUnit ? targetUnit.roomLocationTh || targetUnit.roomLocation : 'พื้นที่ทั่วไป',
      issueType,
      description: description.trim() || issueOptions.find(o => o.id === issueType)?.labelTh || 'แจ้งปัญหาอุปกรณ์',
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim() || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: new Date().toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'pending',
    };

    setTimeout(() => {
      onSubmitReport(newReport);
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 400);
  };

  return (
    <div id="report-issue-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-100 text-[#d32f2f] rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                {isTh ? 'แจ้งปัญหา / ถังดับเพลิงชำรุด' : 'Report Equipment Issue / Damage'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'ส่งข้อมูลตรงถึงเจ้าหน้าที่ความปลอดภัย (จป.) ทันที' : 'Direct alert to Safety Officer'}
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

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {isTh ? 'ส่งข้อมูลแจ้งปัญหาเรียบร้อยแล้ว!' : 'Report Submitted Successfully!'}
            </h4>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              {isTh 
                ? 'ระบบได้ส่งการแจ้งเตือนไปยังเจ้าหน้าที่ผู้ดูแลความปลอดภัยเรียบร้อยแล้ว ขอบคุณที่ช่วยดูแลความปลอดภัยร่วมกันครับ' 
                : 'Safety team has been notified. Thank you for keeping our workplace safe.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 flex-1 mt-3">
            
            {/* Target Extinguisher Banner */}
            {targetUnit ? (
              <div className="bg-red-50/80 p-3 rounded-2xl border border-red-200 text-left flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900">{targetUnit.id}</span>
                    <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-md uppercase">
                      {targetUnit.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    📍 {isTh ? targetUnit.buildingTh || targetUnit.building : targetUnit.building} ({isTh ? targetUnit.roomLocationTh || targetUnit.roomLocation : targetUnit.roomLocation})
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">Asset ID: {targetUnit.assetId}</p>
                </div>
                {extinguishers.length > 1 && (
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="text-xs font-bold bg-white px-2 py-1 border border-gray-300 rounded-lg text-gray-800 focus:outline-none"
                  >
                    {extinguishers.map(u => (
                      <option key={u.id} value={u.id}>{u.id}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}

            {/* Issue Type Selection */}
            <div className="text-left space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                {isTh ? 'เลือกประเภทปัญหาที่พบ *' : 'Select Issue Type *'}
              </label>
              <div className="space-y-1.5">
                {issueOptions.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setIssueType(opt.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      issueType === opt.id 
                        ? 'bg-red-50/80 border-[#d32f2f] text-gray-900 shadow-2xs' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      checked={issueType === opt.id}
                      onChange={() => setIssueType(opt.id)}
                      className="w-4 h-4 text-[#d32f2f] focus:ring-[#d32f2f]"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold">{isTh ? opt.labelTh : opt.labelEn}</span>
                      {isTh && <span className="block text-[10px] text-gray-500">{opt.descTh}</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo Capture / Evidence */}
            <div className="text-left space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                {isTh ? 'ภาพถ่ายจุดที่ชำรุด (ไม่บังคับ แต่ช่วยให้แก้ไขได้เร็วขึ้น)' : 'Photo Evidence (Optional)'}
              </label>
              <CameraCapture
                lang={lang}
                photoUrl={photoUrl}
                onPhotoChange={setPhotoUrl}
                label={isTh ? 'ถ่ายภาพจุดชำรุด' : 'Take Issue Photo'}
              />
            </div>

            {/* Detailed Description */}
            <div className="text-left space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                {isTh ? 'รายละเอียดเพิ่มเติม (ถ้ามี):' : 'Additional Notes:'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isTh ? 'เช่น พบรอยน้ำยาหยดที่พื้น, สลักหายไปตั้งแต่เมื่อเช้า...' : 'Describe what happened...'}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
              />
            </div>

            {/* Reporter Contact Info */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-left space-y-2">
              <p className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#d32f2f]" />
                <span>{isTh ? 'ข้อมูลผู้แจ้งเหตุ (เพื่อให้เจ้าหน้าที่ติดต่อกลับ)' : 'Reporter Contact Info'}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder={isTh ? 'ชื่อ-นามสกุล / แผนก *' : 'Your Name / Dept *'}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder={isTh ? 'เบอร์โทรศัพท์ / เบอร์ภายใน' : 'Phone / Ext.'}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-[#d32f2f] text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{isTh ? 'กำลังส่งข้อมูล...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isTh ? 'ส่งเรื่องแจ้งปัญหาถึงเจ้าหน้าที่' : 'Submit Issue to Safety Team'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
