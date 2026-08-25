import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Gauge, 
  Mail, 
  BookOpen, 
  Sparkles, 
  Layers, 
  FileText, 
  CheckSquare, 
  HelpCircle,
  Maximize2,
  MessageSquare,
  Camera
} from 'lucide-react';
import { ExtinguisherUnit, InspectionRecord, Language, ExtinguisherType } from '../../types';
import { ExtinguisherInspectionGuide } from './ExtinguisherInspectionGuide';
import { CameraCapture } from '../CameraCapture';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  extinguishers: ExtinguisherUnit[];
  onAddRecord: (newRecord: InspectionRecord) => void;
  initialUnitId?: string;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  lang,
  extinguishers,
  onAddRecord,
  initialUnitId,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  const [activeTab, setActiveTab] = useState<'form' | 'guide'>('form');
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId || extinguishers[0]?.id || '');
  const [inspectorName, setInspectorName] = useState('');
  const [inspectorNameTh, setInspectorNameTh] = useState('');
  const [status, setStatus] = useState<'passed' | 'failed' | 'maintenance'>('passed');
  const [pressure, setPressure] = useState<number>(195);
  const [sealIntact, setSealIntact] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [notesTh, setNotesTh] = useState('');
  const [sendEmailAlert, setSendEmailAlert] = useState(false);
  const [sendLineAlert, setSendLineAlert] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [highlightedCheckpoint, setHighlightedCheckpoint] = useState<string>('gauge');

  useEffect(() => {
    if (initialUnitId && extinguishers.some(u => u.id === initialUnitId)) {
      setSelectedUnitId(initialUnitId);
    }
  }, [initialUnitId, extinguishers]);

  // 7-Point Inspection Checklist State
  const [checkpointsState, setCheckpointsState] = useState({
    gauge: true,
    pin_seal: true,
    hose_nozzle: true,
    cylinder: true,
    agent_weight: true,
    location_access: true,
    inspection_tag: true,
  });

  const selectedUnit = extinguishers.find(u => u.id === selectedUnitId) || extinguishers[0];

  // Auto-sync pressure when extinguisher type changes
  useEffect(() => {
    if (selectedUnit?.type === 'co2') {
      // CO2 has no gauge pressure; represents standard nominal weight
      setPressure(0);
    } else if (pressure === 0) {
      setPressure(195);
    }
  }, [selectedUnitId]);

  // Handle Checklist Item Toggle
  const handleToggleCheck = (key: keyof typeof checkpointsState) => {
    const newState = { ...checkpointsState, [key]: !checkpointsState[key] };
    setCheckpointsState(newState);

    const allPassed = Object.values(newState).every(Boolean);
    if (allPassed) {
      setStatus('passed');
      if (selectedUnit?.type !== 'co2') setPressure(195);
      setSealIntact(true);
    } else {
      // If critical items fail, suggest failed or maintenance
      const criticalFail = !newState.gauge || !newState.cylinder || !newState.hose_nozzle;
      setStatus(criticalFail ? 'failed' : 'maintenance');
      if (!newState.pin_seal) setSealIntact(false);
      if (!newState.gauge && selectedUnit?.type !== 'co2') setPressure(120);

      // Auto-suggest notes based on failed checks
      const failedLabels: string[] = [];
      if (!newState.gauge) failedLabels.push(isTh ? 'เกจแรงดันตก/ผิดปกติ' : 'Pressure gauge abnormal');
      if (!newState.pin_seal) failedLabels.push(isTh ? 'สลัก/ซีลล็อกชำรุด' : 'Tamper seal broken/missing');
      if (!newState.hose_nozzle) failedLabels.push(isTh ? 'สายฉีดแตกร้าว/อุดตัน' : 'Hose/nozzle damaged');
      if (!newState.cylinder) failedLabels.push(isTh ? 'ตัวถังมีสนิม/รอยบุบ' : 'Cylinder rust/dents');
      if (!newState.agent_weight) failedLabels.push(isTh ? 'สารเคมีจับก้อน/น้ำหนักลด' : 'Chemical caked/weight loss');
      if (!newState.location_access) failedLabels.push(isTh ? 'มีสิ่งกีดขวาง/ติดตั้งผิดระยะ' : 'Access blocked/improper mount');
      if (!newState.inspection_tag) failedLabels.push(isTh ? 'ป้ายบันทึกสูญหาย/ขาดการตรวจ' : 'Tag missing/overdue');

      const defectSummaryTh = `[ข้อบกพร่องที่พบ: ${failedLabels.join(', ')}]`;
      const defectSummaryEn = `[Defects noted: ${failedLabels.join(', ')}]`;
      setNotesTh(defectSummaryTh);
      setNotes(defectSummaryEn);
    }
  };

  const handlePassAllChecklist = () => {
    setCheckpointsState({
      gauge: true,
      pin_seal: true,
      hose_nozzle: true,
      cylinder: true,
      agent_weight: true,
      location_access: true,
      inspection_tag: true,
    });
    setStatus('passed');
    setSealIntact(true);
    if (selectedUnit?.type !== 'co2') setPressure(195);
    setNotesTh('ตรวจสอบสภาพเรียบร้อยแล้ว ทุกจุดผ่านเกณฑ์มาตรฐาน');
    setNotes('All 7 inspection criteria passed standard.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const initials = (inspectorName || inspectorNameTh || 'IN').split(' ').map(n => n[0]).join('').toUpperCase() || 'IN';
    const targetUnit = extinguishers.find(u => u.id === selectedUnitId) || extinguishers[0];

    const newRecord: InspectionRecord = {
      id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      rawDate: today.toISOString().slice(0, 10),
      time: timeStr,
      extinguisherId: selectedUnitId || (extinguishers[0]?.id || ''),
      inspectorName: inspectorName || inspectorNameTh || 'Inspector',
      inspectorNameTh: inspectorNameTh || inspectorName || 'ผู้ตรวจเช็ก',
      inspectorBadge: '#882',
      inspectorInitials: initials,
      status,
      notes: notes || (isTh ? 'ตรวจสอบสภาพเรียบร้อยแล้ว' : 'Inspection completed.'),
      notesTh: notesTh || notes || 'ตรวจสอบสภาพเรียบร้อยแล้ว',
      pressurePsi: pressure,
      sealIntact,
      photoUrl: photoUrl || undefined,
      lineNotified: sendLineAlert,
    };

    onAddRecord(newRecord);

    // If unit failed or needs maintenance and user enabled LINE alert
    if (sendLineAlert && targetUnit) {
      const statusText = status === 'passed' ? '✅ ผ่านการตรวจสอบ' : status === 'failed' ? '🚨 ชำรุด/ไม่ผ่านการตรวจ' : '⚠️ ส่งซ่อมบำรุง';
      const lineMsg = 
        `🚨 [RT-Fire Safety บันทึกผลการตรวจ]\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📌 รหัสถัง: ${targetUnit.id} (${targetUnit.assetId})\n` +
        `🏢 อาคาร: ${targetUnit.buildingTh || targetUnit.building} (${targetUnit.roomLocationTh || targetUnit.roomLocation})\n` +
        `📊 ผลการตรวจ: ${statusText}\n` +
        `💨 แรงดัน/น้ำหนัก: ${targetUnit.type === 'co2' ? 'CO2 (ชั่งน้ำหนัก)' : `${pressure} PSI`}\n` +
        `👤 ผู้ตรวจ: ${inspectorNameTh || inspectorName || 'เจ้าหน้าที่ จป.'}\n` +
        `📝 หมายเหตุ: ${notesTh || notes || '-'}\n` +
        `⏰ เวลา: ${dateStr} ${timeStr}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `บันทึกผ่านระบบ RT-Fire Safety Suite`;

      if (status !== 'passed') {
        const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineMsg)}`;
        window.open(lineShareUrl, '_blank');
      }
    }

    // If unit failed or needs maintenance and user enabled email alert, launch email client
    if (status !== 'passed' && sendEmailAlert && targetUnit) {
      const statusText = status === 'failed' ? 'ไม่ผ่านการตรวจเช็ก / ชำรุด' : 'ส่งซ่อมบำรุง';
      const subject = encodeURIComponent(`[แจ้งเตือนด่วน: ${statusText}] รหัสถังดับเพลิง ${targetUnit.id}`);
      const body = encodeURIComponent(
        `เรียน ผู้ดูแลอาคาร / ทีมงานซ่อมบำรุง\n\n` +
        `มีรายงานผลการตรวจสอบอุปกรณ์ชำรุด/ส่งซ่อมบำรุง โดยมีรายละเอียดดังนี้:\n\n` +
        `• รหัสอุปกรณ์: ${targetUnit.id}\n` +
        `• รหัสทรัพย์สิน: ${targetUnit.assetId}\n` +
        `• ประเภท: ${targetUnit.type.toUpperCase()}\n` +
        `• อาคาร: ${targetUnit.buildingTh || targetUnit.building}\n` +
        `• สถานที่: ${targetUnit.roomLocationTh || targetUnit.roomLocation} (ชั้น ${targetUnit.floor})\n` +
        `• ผลการตรวจ: ${statusText}\n` +
        `• สภาพซีล: ${sealIntact ? 'สมบูรณ์' : 'ชำรุด/สลักหาย'}\n` +
        `• แรงดันลม: ${targetUnit.type === 'co2' ? 'CO2 (ชั่งน้ำหนัก)' : `${pressure} PSI`}\n` +
        `• ผู้ตรวจเช็ก: ${inspectorNameTh || inspectorName || 'เจ้าหน้าที่ความปลอดภัย'}\n` +
        `• บันทึกข้อบกพร่อง: ${notesTh || notes || '-'}\n\n` +
        `โปรดเข้าดำเนินการตรวจสอบและซ่อมบำรุงเปลี่ยนถังดับเพลิงสำรองโดยด่วน\n\n` +
        `ขอบคุณครับ/ค่ะ`
      );
      window.open(`mailto:safety-caretaker@organization.go.th?subject=${subject}&body=${body}`, '_blank');
    }

    onClose();
  };

  const checklistItems = [
    {
      id: 'gauge' as const,
      labelTh: '1. เกจวัดแรงดัน (อยู่ในแถบสีเขียว ~195 PSI)',
      labelEn: '1. Pressure gauge in operable green zone',
      noteTh: selectedUnit?.type === 'co2' ? '(ถัง CO2 ตรวจชั่งน้ำหนักแทน)' : '',
    },
    {
      id: 'pin_seal' as const,
      labelTh: '2. สลักนิรภัยและซีลล็อก (เสียบแน่น ไม่ขาด/ไม่หลุด)',
      labelEn: '2. Safety pin inserted & tamper seal unbroken',
      noteTh: '',
    },
    {
      id: 'hose_nozzle' as const,
      labelTh: '3. สายฉีดและหัวฉีด (ไม่แตกลายงา ไม่อุดตัน)',
      labelEn: '3. Hose and nozzle unobstructed & flexible',
      noteTh: '',
    },
    {
      id: 'cylinder' as const,
      labelTh: '4. สภาพตัวถัง (ไม่บุบ ไม่ผุกร่อน ไร้สนิมขุม)',
      labelEn: '4. Cylinder body free from rust and dents',
      noteTh: '',
    },
    {
      id: 'agent_weight' as const,
      labelTh: '5. ผงเคมีไม่จับก้อน / น้ำหนัก CO2 ไม่ลดเกิน 10%',
      labelEn: '5. Chemical loose (inversion) / Weight within 10%',
      noteTh: '',
    },
    {
      id: 'location_access' as const,
      labelTh: '6. ตำแหน่งติดตั้ง (แขวนสูง ≤1.5 ม. ไร้สิ่งกีดขวาง)',
      labelEn: '6. Mounting clear & accessible (≤1.5m height)',
      noteTh: '',
    },
    {
      id: 'inspection_tag' as const,
      labelTh: '7. ป้ายบันทึกตรวจและ QR Code สมบูรณ์',
      labelEn: '7. Inspection tag & QR code legible',
      noteTh: '',
    },
  ];

  return (
    <div id="new-inspection-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                {isTh ? 'บันทึกการตรวจสอบถังดับเพลิง' : 'Extinguisher Inspection Center'}
                <span className="text-[11px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  NFPA 10
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'ตรวจเช็กสภาพ 7 จุดสำคัญ พร้อมภาพประกอบคำอธิบายการตรวจ' : '7-Point visual inspection guide & compliance logging'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl my-3 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? '1. แบบฟอร์มตรวจเช็ก 7 จุด' : '1. Inspection Form & Checklist'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? '2. ภาพถังและคู่มือวิธีตรวจ (7 จุด)' : '2. Extinguisher Diagram & Visual Guide'}</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          
          {/* Tab 1: Form & Interactive 7-Point Checklist */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Unit selection Bar */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>{isTh ? 'เลือกรหัสถังดับเพลิงที่ต้องการตรวจ:' : 'Select Extinguisher Asset:'}</span>
                  </label>
                  {selectedUnit && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-gray-200 text-gray-800 rounded-md font-bold">
                        Tag: {selectedUnit.assetId}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-md uppercase">
                        {selectedUnit.type}
                      </span>
                    </div>
                  )}
                </div>

                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold text-gray-900"
                >
                  {extinguishers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} — {isTh ? u.buildingTh || u.building : u.building} ({isTh ? u.roomLocationTh || u.roomLocation : u.roomLocation}) • {u.type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Visual Guide Banner Callout */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-2xl border border-red-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#d32f2f] text-white rounded-xl">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {isTh ? 'ต้องการดูภาพชิ้นส่วนถังและเกณฑ์มาตรฐาน?' : 'Need to reference standard diagram?'}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      {isTh ? 'ดูภาพโครงสร้างถัง จุดเกจวัด สลัก และวิธีคว่ำถัง' : 'View interactive visual diagram and inspection checkpoints'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#d32f2f] font-extrabold text-xs rounded-xl border border-red-200 shadow-2xs shrink-0"
                >
                  {isTh ? 'ดูภาพประกอบ ➜' : 'Open Diagram ➜'}
                </button>
              </div>

              {/* 7-Point Inspection Checklist Container */}
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#d32f2f]" />
                      <span>{isTh ? 'รายการตรวจเช็ก 7 จุดมาตรฐาน (NFPA 10 Checklist)' : '7-Point Standard Checklist'}</span>
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {isTh ? 'คลิกทำเครื่องหมายจุดที่ผ่านการตรวจสอบ' : 'Tick each verified item'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePassAllChecklist}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isTh ? '✓ ผ่านทุกข้อ (Pass All)' : 'Pass All'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklistItems.map((item) => {
                    const isChecked = checkpointsState[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCheck(item.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                          isChecked 
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                            : 'bg-red-50/50 border-red-200 text-red-950'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div onClick
                          className="w-4 h-4 mt-0.5 text-emerald-600 rounded-sm focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <p className="font-bold leading-tight">
                            {isTh ? item.labelTh : item.labelEn}
                          </p>
                          {item.noteTh && (
                            <p className="text-[10px] text-gray-500 mt-0.5">{item.noteTh}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Outcome Buttons */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  {isTh ? 'สรุปผลการตรวจสอบ (Overall Result)' : 'Overall Inspection Outcome'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('passed')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      status === 'passed'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isTh ? 'ผ่าน (Passed)' : 'Passed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('failed')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      status === 'failed'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>{isTh ? 'ไม่ผ่าน (Failed)' : 'Failed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('maintenance')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      status === 'maintenance'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isTh ? 'ส่งซ่อม (Service)' : 'Service'}</span>
                  </button>
                </div>
              </div>

              {/* Pressure & Seal Checklist Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-[#d32f2f]" />
                    <span>
                      {selectedUnit?.type === 'co2' 
                        ? (isTh ? 'น้ำหนักถัง CO2 (Kg/Gross Weight)' : 'CO2 Gross Weight') 
                        : (isTh ? 'ระดับแรงดันเกจ (Pressure PSI)' : 'Gauge Pressure (PSI)')}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={pressure}
                    onChange={(e) => setPressure(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-mono font-bold text-gray-900"
                    placeholder={selectedUnit?.type === 'co2' ? 'e.g. 15.5 kg' : '195'}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {selectedUnit?.type === 'co2' 
                      ? (isTh ? 'ถัง CO2 ใช้การชั่งน้ำหนักรวมตามสเปกบนคอถัง' : 'CO2 evaluated by gross scale weight')
                      : (isTh ? 'แถบสีเขียวมาตรฐานอยู่ที่ 195 PSI ±10%' : 'Standard green zone centered at 195 PSI')}
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  <label className="font-bold text-gray-700 mb-1">
                    {isTh ? 'สภาพสลักและซีลนิรภัย' : 'Safety Pin & Seal Status'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setSealIntact(!sealIntact)}
                    className={`py-2 px-3 rounded-xl font-bold text-left border transition-colors ${
                      sealIntact ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {sealIntact 
                      ? (isTh ? '✓ สภาพสมบูรณ์ สลักล็อกแน่น' : '✓ Intact & Sealed') 
                      : (isTh ? '✕ ซีลหลุด / สลักหาย / ถูกใช้งาน' : '✕ Seal Broken / Missing')}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {isTh ? 'สลักต้องเสียบขัดคันบีบและมีซีลพลาสติกรัดแน่น' : 'Must have plastic pull-wire intact'}
                  </p>
                </div>
              </div>

              {/* Inspector Name & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isTh ? 'ชื่อผู้ตรวจเช็ก (Inspector Name)' : 'Inspector Name'}
                  </label>
                  <input
                    type="text"
                    value={isTh ? inspectorNameTh : inspectorName}
                    onChange={(e) => {
                      if (isTh) setInspectorNameTh(e.target.value);
                      else setInspectorName(e.target.value);
                    }}
                    placeholder={isTh ? 'นายช่าง/จนท. จป. วิเชียร' : 'Safety Officer John'}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isTh ? 'บันทึกเพิ่มเติมจากผู้ตรวจ' : 'Inspector Notes'}
                  </label>
                  <input
                    type="text"
                    value={isTh ? notesTh : notes}
                    onChange={(e) => {
                      if (isTh) setNotesTh(e.target.value);
                      else setNotes(e.target.value);
                    }}
                    placeholder={isTh ? 'ระบุสภาพทั่วไป ป้าย วันตรวจ...' : 'Observation notes...'}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
                  />
                </div>
              </div>

              {/* Camera & Photo Evidence Attachment */}
              <CameraCapture
                lang={lang}
                photoUrl={photoUrl}
                onPhotoChange={setPhotoUrl}
              />

              {/* Instant LINE & Email Notification Options */}
              <div className="space-y-2">
                {/* LINE Alert Card */}
                <div className="bg-[#06c755]/10 border border-[#06c755]/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#06c755] text-white rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#048739] flex items-center gap-1.5">
                        <span>{isTh ? 'ส่งการแจ้งเตือนผลการตรวจเข้า LINE' : 'Send LINE Safety Alert'}</span>
                        <span className="text-[10px] bg-[#06c755] text-white px-1.5 py-0.2 rounded font-bold">
                          RECOMMENDED
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {isTh ? 'เปิดแอป LINE หรือส่งข้อมูลสรุปเข้ากลุ่ม จป./ช่างดูแลอาคาร' : 'Prepares rich text alert for LINE dispatch'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendLineAlert}
                    onChange={(e) => setSendLineAlert(e.target.checked)}
                    className="w-5 h-5 text-[#06c755] rounded-md focus:ring-[#06c755] cursor-pointer"
                  />
                </div>

                {/* Email Alert for Failed/Maintenance */}
                {status !== 'passed' && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900">
                          {isTh ? 'เปิดโปรแกรมอีเมลเพื่อแจ้งผู้ดูแลทันที' : 'Open Email Draft to Caretaker'}
                        </p>
                        <p className="text-[11px] text-amber-700">
                          {isTh ? 'ระบบจะเตรียมหัวข้อและข้อมูลการแจ้งซ่อมให้อัตโนมัติเมื่อกดบันทึก' : 'Auto-fills subject & unit details for email dispatch'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={sendEmailAlert}
                      onChange={(e) => setSendEmailAlert(e.target.checked)}
                      className="w-5 h-5 text-[#d32f2f] rounded-md focus:ring-[#d32f2f] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isTh ? 'บันทึกผลการตรวจ' : 'Save Inspection'}</span>
                </button>
              </div>

            </form>
          )}

          {/* Tab 2: Full Extinguisher Visual Diagram & Inspection Manual */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <ExtinguisherInspectionGuide
                lang={lang}
                selectedType={selectedUnit?.type || 'dry_chemical'}
                activeCheckpointId={highlightedCheckpoint}
                onSelectCheckpoint={(id) => setHighlightedCheckpoint(id)}
              />

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  {isTh ? 'เมื่อศึกษาขั้นตอนเรียบร้อยแล้ว สามารถสลับไปบันทึกผลการตรวจได้ทันที' : 'Switch back to the checklist form to record findings.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>{isTh ? 'กลับไปบันทึกผลการตรวจ ➜' : 'Back to Form ➜'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

