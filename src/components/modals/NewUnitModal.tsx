import React, { useState } from 'react';
import { X, Flame, Building2, Plus } from 'lucide-react';
import { ExtinguisherUnit, ExtinguisherType, Language, BuildingCompliance } from '../../types';

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  buildings?: BuildingCompliance[];
  onAddUnit: (unit: ExtinguisherUnit) => void;
}

export const NewUnitModal: React.FC<NewUnitModalProps> = ({
  isOpen,
  onClose,
  lang,
  buildings = [],
  onAddUnit,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  const [unitId, setUnitId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('custom');
  const [building, setBuilding] = useState('');
  const [buildingTh, setBuildingTh] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [roomTh, setRoomTh] = useState('');
  const [type, setType] = useState<ExtinguisherType>('co2');
  const [customQrData, setCustomQrData] = useState('');

  const handleBuildingSelectChange = (val: string) => {
    setSelectedBuildingId(val);
    if (val !== 'custom') {
      const found = buildings.find(b => b.id === val);
      if (found) {
        setBuilding(found.name);
        setBuildingTh(found.nameTh);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const newUnit: ExtinguisherUnit = {
      id: unitId,
      assetId,
      building: building || buildingTh,
      buildingTh: buildingTh || building,
      floor,
      roomLocation: room || roomTh,
      roomLocationTh: roomTh || room,
      type,
      lastInspectionDate: today.toISOString().slice(0, 10),
      nextDueDate: nextMonth.toISOString().slice(0, 10),
      status: 'normal',
      customQrData: customQrData.trim() || undefined,
      xPos: 50,
      yPos: 50,
    };

    onAddUnit(newUnit);
    onClose();
  };

  return (
    <div id="new-unit-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {isTh ? 'เพิ่มอุปกรณ์ถังดับเพลิงใหม่' : 'Register New Fire Extinguisher Unit'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'ลงทะเบียนอุปกรณ์ รหัสทรัพย์สิน และกำหนดตำแหน่งติดตั้งในอาคาร' : 'Add new asset tag, specifications, and building assignment'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'รหัสถังดับเพลิง (Unit ID)' : 'Unit ID'}</label>
              <input
                type="text"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                placeholder="FE-1001"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'รหัสทรัพย์สิน (Asset Tag)' : 'Asset Tag'}</label>
              <input
                type="text"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="FS-2026-001"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ประเภทสารดับเพลิง (Agent Type)' : 'Agent Type'}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExtinguisherType)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold text-gray-800"
            >
              <option value="co2">CO2 (ก๊าซคาร์บอนไดออกไซด์)</option>
              <option value="water_mist">Water Mist (ละอองน้ำแรงดันสูง)</option>
              <option value="dry_powder">Dry Powder (ผงเคมีแห้ง)</option>
              <option value="foam">Foam (โฟมดับเพลิง)</option>
              <option value="clean_agent">Clean Agent (สารสะอาดดับเพลิง)</option>
            </select>
          </div>

          {/* Building Selector */}
          {buildings.length > 0 && (
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'เลือกอาคารที่มีในระบบ' : 'Select Registered Building'}</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => handleBuildingSelectChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold text-gray-800"
              >
                <option value="custom">✏️ {isTh ? '+ กำหนดชื่ออาคารเอง / อาคารใหม่' : '+ Enter New Building Name'}</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    🏢 {isTh ? b.nameTh : b.name} ({isTh ? b.locationTh : b.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ชื่ออาคาร (ภาษาไทย)' : 'Building Name (TH)'}</label>
              <input
                type="text"
                value={buildingTh}
                onChange={(e) => {
                  setBuildingTh(e.target.value);
                  setSelectedBuildingId('custom');
                }}
                placeholder={isTh ? 'อาคารอำนวยการ' : 'Administration Building'}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ชื่ออาคาร (ภาษาอังกฤษ)' : 'Building Name (EN)'}</label>
              <input
                type="text"
                value={building}
                onChange={(e) => {
                  setBuilding(e.target.value);
                  setSelectedBuildingId('custom');
                }}
                placeholder="Administration Building"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
                required
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
                placeholder="1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-gray-700 mb-1">{isTh ? 'ตำแหน่งห้อง/โถงทางเดิน' : 'Room / Location'}</label>
              <input
                type="text"
                value={isTh ? roomTh : room}
                onChange={(e) => {
                  setRoomTh(e.target.value);
                  setRoom(e.target.value);
                }}
                placeholder={isTh ? 'ห้อง 101 โถงด้านหน้า' : 'Room 101 Front Hall'}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'ข้อมูล/ลิงก์พิเศษสำหรับฝังใน QR Code (เว้นว่างไว้เพื่อใช้รหัสมาตรฐาน)' : 'Custom Link or Data Payload for QR Code (Optional)'}
            </label>
            <input
              type="text"
              value={customQrData}
              onChange={(e) => setCustomQrData(e.target.value)}
              placeholder="e.g. https://mycompany.com/inspect/FE-1001"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-medium text-gray-800"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isTh ? 'ลงทะเบียนอุปกรณ์' : 'Register Unit'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
