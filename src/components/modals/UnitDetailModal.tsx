import React, { useState, useEffect } from 'react';
import { X, Flame, ShieldCheck, QrCode, MapPin, Edit3, Save, Trash2, Building2, Mail, MessageSquare } from 'lucide-react';
import { ExtinguisherUnit, ExtinguisherType, ExtinguisherStatus, Language } from '../../types';
import { LineNotificationModal } from './LineNotificationModal';

interface UnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  unit: ExtinguisherUnit | null;
  onOpenQr: (unit: ExtinguisherUnit) => void;
  onOpenNewInspection: () => void;
  onUpdateUnit?: (updatedUnit: ExtinguisherUnit) => void;
  onDeleteUnit?: (unitId: string) => void;
}

export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  isOpen,
  onClose,
  lang,
  unit,
  onOpenQr,
  onOpenNewInspection,
  onUpdateUnit,
  onDeleteUnit,
}) => {
  if (!isOpen || !unit) return null;

  const isTh = lang === 'th';

  const [isEditing, setIsEditing] = useState(false);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [building, setBuilding] = useState(unit.building);
  const [buildingTh, setBuildingTh] = useState(unit.buildingTh);
  const [floor, setFloor] = useState(unit.floor);
  const [roomLocation, setRoomLocation] = useState(unit.roomLocation);
  const [roomLocationTh, setRoomLocationTh] = useState(unit.roomLocationTh);
  const [type, setType] = useState<ExtinguisherType>(unit.type);
  const [status, setStatus] = useState<ExtinguisherStatus>(unit.status);
  const [lastInspectionDate, setLastInspectionDate] = useState(unit.lastInspectionDate);
  const [nextDueDate, setNextDueDate] = useState(unit.nextDueDate);
  const [customQrData, setCustomQrData] = useState(unit.customQrData || '');

  useEffect(() => {
    if (unit) {
      setBuilding(unit.building);
      setBuildingTh(unit.buildingTh);
      setFloor(unit.floor);
      setRoomLocation(unit.roomLocation);
      setRoomLocationTh(unit.roomLocationTh);
      setType(unit.type);
      setStatus(unit.status);
      setLastInspectionDate(unit.lastInspectionDate);
      setNextDueDate(unit.nextDueDate);
      setCustomQrData(unit.customQrData || '');
      setIsEditing(false);
    }
  }, [unit]);

  const handleLastDateChange = (newDateStr: string) => {
    setLastInspectionDate(newDateStr);
    if (newDateStr) {
      const d = new Date(newDateStr);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + 1);
        setNextDueDate(d.toISOString().slice(0, 10));
      }
    }
  };

  const handleSave = () => {
    if (!unit || !onUpdateUnit) return;

    const updated: ExtinguisherUnit = {
      ...unit,
      building: building || buildingTh,
      buildingTh: buildingTh || building,
      floor,
      roomLocation: roomLocation || roomLocationTh,
      roomLocationTh: roomLocationTh || roomLocation,
      type,
      status,
      lastInspectionDate,
      nextDueDate,
      customQrData: customQrData.trim() || undefined,
    };

    onUpdateUnit(updated);
    setIsEditing(false);
  };

  const handleSendEmailReport = () => {
    if (!unit) return;
    const subject = encodeURIComponent(`[แจ้งซ่อม/ชำรุดถังดับเพลิง] รหัสอุปกรณ์ ${unit.id}`);
    const body = encodeURIComponent(
      `เรียน ผู้ดูแลอาคาร / ทีมงานซ่อมบำรุง\n\n` +
      `ขอแจ้งซ่อมแซม/ตรวจสอบถังดับเพลิงชำรุด โดยมีรายละเอียดดังนี้:\n\n` +
      `• รหัสถังดับเพลิง: ${unit.id}\n` +
      `• รหัสทรัพย์สิน (Asset Tag): ${unit.assetId}\n` +
      `• อาคาร: ${unit.buildingTh || unit.building}\n` +
      `• สถานที่ติดตั้ง: ${unit.roomLocationTh || unit.roomLocation} (ชั้น ${unit.floor})\n` +
      `• ประเภทถัง: ${unit.type}\n` +
      `• สถานะอุปกรณ์: ${unit.status === 'normal' ? 'ปกติ' : unit.status === 'due_soon' ? 'ใกล้ครบกำหนดตรวจ' : 'ชำรุด/ส่งซ่อม'}\n` +
      `• ค่าแรงดันลม (PSI): ${unit.pressurePsi} PSI\n` +
      `• วันที่ตรวจล่าสุด: ${unit.lastInspectionDate}\n\n` +
      `โปรดเข้าดำเนินการตรวจสอบและซ่อมบำรุงเปลี่ยนถังทดแทนโดยด่วน\n\n` +
      `ขอบคุณครับ/ค่ะ`
    );
    window.open(`mailto:safety-caretaker@organization.go.th?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div id="unit-detail-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl text-gray-900">{unit.id}</h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-mono">{unit.assetId}</span>
              </div>
              <p className="text-xs text-gray-500">
                {isTh ? unit.buildingTh : unit.building} - {isTh ? unit.roomLocationTh : unit.roomLocation}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && onUpdateUnit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#d32f2f] font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                title={isTh ? 'แก้ไขสถานที่/ข้อมูล' : 'Edit location'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isTh ? 'แก้ไขสถานที่' : 'Edit Location'}</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsEditing(false);
                onClose();
              }}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Mode */}
        {isEditing ? (
          <div className="my-5 space-y-3 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 font-semibold">
              ✏️ {isTh ? 'โหมดแก้ไขสถานที่และข้อมูลถังดับเพลิง' : 'Edit Location & Asset Info'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ชื่ออาคาร (ไทย)' : 'Building (TH)'}</label>
                <input
                  type="text"
                  value={buildingTh}
                  onChange={(e) => setBuildingTh(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ชื่ออาคาร (อังกฤษ)' : 'Building (EN)'}</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ชั้น' : 'Floor'}</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ห้อง / ตำแหน่งติดตั้ง (ไทย)' : 'Room / Location (TH)'}</label>
                <input
                  type="text"
                  value={roomLocationTh}
                  onChange={(e) => setRoomLocationTh(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ประเภทสาร' : 'Type'}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExtinguisherType)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  <option value="co2">CO2</option>
                  <option value="water_mist">Water Mist</option>
                  <option value="dry_powder">Dry Powder</option>
                  <option value="foam">Foam</option>
                  <option value="clean_agent">Clean Agent</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'สถานะความพร้อม' : 'Status'}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExtinguisherStatus)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  <option value="normal">🟢 ปกติ (Normal)</option>
                  <option value="due_soon">🟡 ใกล้กำหนดตรวจ (Due Soon)</option>
                  <option value="critical">🔴 ชำรุด/ส่งซ่อม (Critical)</option>
                  <option value="expired">🔴 หมดอายุ (Expired)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'วันที่ตรวจล่าสุด' : 'Last Inspection'}</label>
                <input
                  type="date"
                  value={lastInspectionDate}
                  onChange={(e) => handleLastDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isTh ? 'กำหนดตรวจถัดไป (1 เดือน)' : 'Next Due Date (+1 mo)'}</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'ข้อมูล/ลิงก์ฝังใน QR Code (Custom QR Payload)' : 'Custom QR Link / Data Payload'}
              </label>
              <input
                type="text"
                value={customQrData}
                onChange={(e) => setCustomQrData(e.target.value)}
                placeholder="e.g. https://mycompany.com/inspect/FE-2041"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              {onDeleteUnit ? (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUnit(unit.id);
                    onClose();
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isTh ? 'ลบถังนี้' : 'Delete'}</span>
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isTh ? 'บันทึกการแก้ไข' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* View Mode */
          <div className="my-5 space-y-3 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{isTh ? 'ประเภทสารดับเพลิง' : 'Agent Type'}</p>
                <p className="font-extrabold text-gray-900 text-sm mt-0.5 uppercase">{unit.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{isTh ? 'สถานะปัจจุบัน' : 'Current Readiness'}</p>
                <p className={`font-extrabold text-sm mt-0.5 uppercase ${
                  unit.status === 'normal' ? 'text-emerald-600' :
                  unit.status === 'due_soon' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {unit.status === 'normal' ? 'Normal / Ready' : unit.status}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{isTh ? 'วันที่ตรวจล่าสุด' : 'Last Inspection'}</p>
                <p className="font-bold text-gray-800 text-xs mt-0.5">{unit.lastInspectionDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{isTh ? 'กำหนดตรวจถัดไป (รอบ 1 เดือน)' : 'Next Due Date (1-Mo Cycle)'}</p>
                <p className="font-extrabold text-[#d32f2f] text-xs mt-0.5">{unit.nextDueDate}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase">{isTh ? 'ตำแหน่งติดตั้งในอาคาร' : 'Building Installation Location'}</p>
                <MapPin className="w-3.5 h-3.5 text-[#d32f2f]" />
              </div>
              <p className="font-bold text-gray-900 text-xs">{isTh ? unit.buildingTh : unit.building}</p>
              <p className="text-gray-500 text-xs">{isTh ? unit.roomLocationTh : unit.roomLocation} (ชั้น {unit.floor})</p>
            </div>

            {/* Quick Inspection Guide Card */}
            <div 
              onClick={() => {
                onOpenNewInspection();
                onClose();
              }}
              className="bg-gradient-to-r from-red-50 to-orange-50 p-3.5 rounded-2xl border border-red-200/80 cursor-pointer hover:border-red-300 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#d32f2f] text-white rounded-xl group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-gray-900">
                    {isTh ? 'ภาพถังและคำอธิบายวิธีตรวจ 7 จุดมาตรฐาน' : '7-Point Visual Inspection Manual'}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {isTh ? 'ดูเกจวัด เกณฑ์ความดัน สลัก ซีลนิรภัย และวิธีตรวจ' : 'Inspect gauge, safety pin, hose, and NFPA standards'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#d32f2f] shrink-0 group-hover:translate-x-0.5 transition-transform">
                {isTh ? 'เปิดดู ➜' : 'View ➜'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenQr(unit);
                  onClose();
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-[#d32f2f]" />
                <span>{isTh ? 'QR Code' : 'QR Badge'}</span>
              </button>

              <button
                onClick={() => setIsLineModalOpen(true)}
                className="px-3 py-2 bg-[#06c755]/10 hover:bg-[#06c755] hover:text-white text-[#06c755] border border-[#06c755]/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                title={isTh ? 'แชร์ข้อมูลถังนี้เข้ากลุ่ม LINE' : 'Share unit details to LINE'}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isTh ? 'แชร์ LINE' : 'LINE Share'}</span>
              </button>

              <button
                onClick={handleSendEmailReport}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                title={isTh ? 'ส่งอีเมลแจ้งซ่อมไปยังผู้ดูแลอาคาร' : 'Send maintenance email'}
              >
                <Mail className="w-4 h-4 text-amber-600" />
                <span>{isTh ? 'แจ้งซ่อมทางอีเมล' : 'Email Caretaker'}</span>
              </button>

              {onDeleteUnit && (
                <button
                  onClick={() => {
                    onDeleteUnit(unit.id);
                    onClose();
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  title={isTh ? 'ลบถังนี้ออกจากระบบ' : 'Delete unit'}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isTh ? 'ลบถังนี้' : 'Delete'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onOpenNewInspection();
                onClose();
              }}
              className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isTh ? 'บันทึกการตรวจใหม่' : 'Log Check'}</span>
            </button>
          </div>
        )}

      </div>

      {/* LINE Notification Share Modal */}
      <LineNotificationModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        lang={lang}
        unit={unit}
      />
    </div>
  );
};
