import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { BuildingCompliance, Language } from '../../types';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  editingBuilding?: BuildingCompliance | null;
  onSaveBuilding: (building: BuildingCompliance) => void;
  onDeleteBuilding?: (buildingId: string) => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  isOpen,
  onClose,
  lang,
  editingBuilding,
  onSaveBuilding,
  onDeleteBuilding,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [locationTh, setLocationTh] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    if (editingBuilding) {
      setNameTh(editingBuilding.nameTh);
      setNameEn(editingBuilding.name);
      setLocationTh(editingBuilding.locationTh);
      setLocationEn(editingBuilding.location);
      setRiskLevel(editingBuilding.riskLevel);
    } else {
      setNameTh('');
      setNameEn('');
      setLocationTh('');
      setLocationEn('');
      setRiskLevel('low');
    }
  }, [editingBuilding, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh && !nameEn) return;

    const building: BuildingCompliance = {
      id: editingBuilding?.id || `BLD-${Date.now()}`,
      name: nameEn || nameTh,
      nameTh: nameTh || nameEn,
      location: locationEn || 'Main Site',
      locationTh: locationTh || 'พื้นที่โครงการหลัก',
      assetsCount: editingBuilding?.assetsCount || 0,
      inspectedCount: editingBuilding?.inspectedCount || 0,
      riskLevel,
      complianceRate: editingBuilding?.complianceRate || 100,
      floorPlans: editingBuilding?.floorPlans || ['GF', 'L1'],
    };

    onSaveBuilding(building);
    onClose();
  };

  return (
    <div id="building-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {editingBuilding 
                  ? (isTh ? 'แก้ไขข้อมูลอาคาร / โซน' : 'Edit Building / Zone') 
                  : (isTh ? 'เพิ่มอาคาร / โซนใหม่' : 'Add New Building / Zone')}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'กรอกรายละเอียดอาคารและสถานที่ติดตั้งสำหรับจัดกลุ่มอุปกรณ์' : 'Define building structure and zone details for safety tracking'}
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
          
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'ชื่ออาคาร / โซน (ภาษาไทย)' : 'Building Name (TH)'} *
            </label>
            <input
              type="text"
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="เช่น อาคารอำนวยการ A, คลังสินค้า 1"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'ชื่ออาคาร / โซน (ภาษาอังกฤษ)' : 'Building Name (EN)'}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Administration Building A, Warehouse 1"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'สถานที่ / เขตพื้นที่ (ภาษาไทย)' : 'Location / Area Zone (TH)'}
            </label>
            <input
              type="text"
              value={locationTh}
              onChange={(e) => setLocationTh(e.target.value)}
              placeholder="เช่น โซนโรงงานฝั่งเหนือ, ท่าเรือพาณิชย์ B"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'สถานที่ / เขตพื้นที่ (ภาษาอังกฤษ)' : 'Location / Area Zone (EN)'}
            </label>
            <input
              type="text"
              value={locationEn}
              onChange={(e) => setLocationEn(e.target.value)}
              placeholder="e.g. North Plant Zone, Commercial Dock B"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'ระดับความเสี่ยงของอาคาร' : 'Building Risk Profile'}
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold text-gray-800"
            >
              <option value="low">🟢 {isTh ? 'เสี่ยงต่ำ' : 'Low Risk'}</option>
              <option value="medium">🟡 {isTh ? 'เสี่ยงปานกลาง' : 'Medium Risk'}</option>
              <option value="high">🔴 {isTh ? 'เสี่ยงสูง' : 'High Risk'}</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            {editingBuilding && onDeleteBuilding ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteBuilding(editingBuilding.id);
                  onClose();
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isTh ? 'ลบอาคาร' : 'Delete'}</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{editingBuilding ? (isTh ? 'บันทึกการแก้ไข' : 'Save Changes') : (isTh ? 'เพิ่มอาคาร' : 'Add Building')}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
