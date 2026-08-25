import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Filter, 
  Map, 
  Plus, 
  QrCode, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Clock, 
  History,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { 
  ExtinguisherUnit, 
  ActivityLog, 
  Language, 
  ExtinguisherStatus, 
  ExtinguisherType,
  BuildingCompliance
} from '../types';

interface ExtinguishersViewProps {
  lang: Language;
  extinguishers: ExtinguisherUnit[];
  activityLogs: ActivityLog[];
  buildings?: BuildingCompliance[];
  onOpenNewUnit: () => void;
  onOpenFacilityMap: () => void;
  onViewUnitDetail: (unit: ExtinguisherUnit) => void;
  onOpenQrCode: (unit: ExtinguisherUnit) => void;
  onDeleteUnit?: (unitId: string) => void;
}

export const ExtinguishersView: React.FC<ExtinguishersViewProps> = ({
  lang,
  extinguishers,
  activityLogs,
  buildings = [],
  onOpenNewUnit,
  onOpenFacilityMap,
  onViewUnitDetail,
  onOpenQrCode,
  onDeleteUnit,
}) => {
  const isTh = lang === 'th';

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');

  const buildingOptions = React.useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const seen = new Set<string>();

    extinguishers.forEach(u => {
      const bKey = u.building || u.buildingTh;
      if (bKey && !seen.has(bKey)) {
        seen.add(bKey);
        list.push({
          value: bKey,
          label: isTh ? (u.buildingTh || u.building) : (u.building || u.buildingTh),
        });
      }
    });

    buildings.forEach(b => {
      const bKey = b.name || b.nameTh;
      if (bKey && !seen.has(bKey)) {
        seen.add(bKey);
        list.push({
          value: bKey,
          label: isTh ? (b.nameTh || b.name) : (b.name || b.nameTh),
        });
      }
    });

    return list;
  }, [extinguishers, buildings, isTh]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Filter Logic
  const filteredUnits = extinguishers.filter((unit) => {
    const matchBuilding = selectedBuilding === 'all' || unit.building.toLowerCase().includes(selectedBuilding.toLowerCase()) || unit.buildingTh.includes(selectedBuilding);
    const matchType = selectedType === 'all' || unit.type === selectedType;
    const matchStatus = selectedStatus === 'all' || unit.status === selectedStatus;
    const matchSearch = 
      unit.id.toLowerCase().includes(search.toLowerCase()) ||
      unit.assetId.toLowerCase().includes(search.toLowerCase()) ||
      unit.building.toLowerCase().includes(search.toLowerCase()) ||
      unit.buildingTh.includes(search) ||
      unit.roomLocation.toLowerCase().includes(search.toLowerCase()) ||
      unit.roomLocationTh.includes(search);

    return matchBuilding && matchType && matchStatus && matchSearch;
  });

  const getStatusBadge = (status: ExtinguisherStatus) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isTh ? 'ปกติ (Functional)' : 'Normal'}
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {isTh ? 'ใกล้กำหนดตรวจ' : 'Due Soon'}
          </span>
        );
      case 'expired':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {isTh ? 'เร่งด่วน / หมดอายุ' : 'Expired'}
          </span>
        );
    }
  };

  const expiredUnitsCount = extinguishers.filter(u => u.status === 'critical' || u.status === 'expired').length;
  const dueSoonUnitsCount = extinguishers.filter(u => u.status === 'due_soon').length;

  return (
    <div id="extinguishers-inventory-view" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#d32f2f]" />
            {isTh ? 'รายการถังดับเพลิงและอุปกรณ์ทั้งหมด' : 'Fire Extinguishers Inventory'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isTh ? 'ตรวจสอบ จัดการ และดูตำแหน่งการติดตั้งถังดับเพลิงแยกตามอาคาร' : 'Manage equipment specs, location tags, and QR inspection badges'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="extinguishers-map-view-btn"
            onClick={onOpenFacilityMap}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#d32f2f] font-bold text-xs rounded-xl border border-red-200 transition-colors"
          >
            <Map className="w-4 h-4" />
            <span>{isTh ? 'แผนผังจุดติดตั้ง' : 'Map View'}</span>
          </button>

          <button
            id="extinguishers-add-unit-btn"
            onClick={onOpenNewUnit}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isTh ? 'เพิ่มถังใหม่' : 'Add New Unit'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Alert Banners */}
      {extinguishers.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-blue-900">
                {isTh ? 'ระบบพร้อมสำหรับการลงข้อมูลของคุณ' : 'System ready for data entry'}
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                {isTh ? 'เริ่มต้นลงทะเบียนอุปกรณ์ถังดับเพลิงชิ้นแรกของคุณโดยการกดปุ่ม "เพิ่มถังใหม่"' : 'Get started by adding your first fire extinguisher asset.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewUnit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
          >
            {isTh ? '+ เพิ่มถังใหม่' : '+ Add Unit'}
          </button>
        </div>
      ) : (expiredUnitsCount > 0 || dueSoonUnitsCount > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">
                {isTh ? `พบถังหมดอายุเร่งด่วน (${expiredUnitsCount} รายการ)` : `Critical / Expired Units (${expiredUnitsCount} Assets)`}
              </h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                {isTh 
                  ? 'อุปกรณ์บางส่วนอยู่ในสถานะหมดอายุการบริการ ต้องการการตรวจสอบหรือส่งซ่อมด่วน'
                  : 'Some extinguishers require immediate refill and seal inspection.'}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                {isTh ? `ถังใกล้ครบกำหนดตรวจ (${dueSoonUnitsCount} รายการ)` : `Inspection Due Soon (${dueSoonUnitsCount} Assets)`}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {isTh 
                  ? 'อุปกรณ์บางส่วนใกล้ครบกำหนดตรวจประจำเดือนภายใน 14 วันนี้'
                  : 'Equipment scheduled for monthly checkup within 14 days.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-emerald-900">
              {isTh ? 'อุปกรณ์ทั้งหมดอยู่ในสภาพปกติและพร้อมใช้งาน' : 'All assets are functional and fully ready'}
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              {isTh ? `พบ ${extinguishers.length} รายการในระบบ ผ่านเกณฑ์การใช้งาน 100%` : `All ${extinguishers.length} registered units are up-to-date.`}
            </p>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTh ? 'ค้นหารหัสถัง, สถานที่...' : 'Search unit ID, location...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
            />
          </div>

          {/* Filter Building */}
          <div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium text-gray-700"
            >
              <option value="all">{isTh ? 'ทุกอาคาร (All Buildings)' : 'All Buildings'}</option>
              {buildingOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium text-gray-700"
            >
              <option value="all">{isTh ? 'ทุกประเภทสารดับเพลิง' : 'All Agent Types'}</option>
              <option value="co2">CO2 (ก๊าซคาร์บอนไดออกไซด์)</option>
              <option value="water_mist">Water Mist (ละอองน้ำ)</option>
              <option value="dry_powder">Dry Powder (เคมีแห้ง)</option>
              <option value="foam">Foam (โฟม)</option>
              <option value="clean_agent">Clean Agent (สารสะอาด)</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium text-gray-700"
            >
              <option value="all">{isTh ? 'ทุกสถานะ' : 'All Statuses'}</option>
              <option value="normal">{isTh ? 'ปกติ (Normal)' : 'Normal'}</option>
              <option value="due_soon">{isTh ? 'ใกล้กำหนดตรวจ (Due Soon)' : 'Due Soon'}</option>
              <option value="critical">{isTh ? 'เร่งด่วน / หมดอายุ (Critical)' : 'Critical / Expired'}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table + Realtime Activity Log Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Extinguisher Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-900">
              {isTh ? 'ตารางข้อมูลถังดับเพลิง' : 'Extinguishers Master Inventory'}
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              {isTh ? `พบ ${filteredUnits.length} รายการ` : `Found ${filteredUnits.length} items`}
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="px-3.5 py-3">{isTh ? 'รหัสถัง' : 'Unit ID'}</th>
                  <th className="px-3.5 py-3">{isTh ? 'อาคาร & ห้อง' : 'Building / Room'}</th>
                  <th className="px-3.5 py-3">{isTh ? 'ประเภท' : 'Type'}</th>
                  <th className="px-3.5 py-3">{isTh ? 'กำหนดตรวจ' : 'Next Due'}</th>
                  <th className="px-3.5 py-3">{isTh ? 'สถานะ' : 'Status'}</th>
                  <th className="px-3.5 py-3 text-right">{isTh ? 'การจัดการ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      {isTh ? 'ไม่พบข้อมูลถังดับเพลิงที่ตรงกับเงื่อนไขค้นหา' : 'No fire extinguishers match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenQrCode(unit)}
                            className="p-1 text-gray-400 hover:text-[#d32f2f] rounded transition-colors"
                            title={isTh ? 'สแกน/พิมพ์ QR' : 'View QR'}
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <span>{unit.id}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <p className="font-semibold text-gray-800">{isTh ? unit.buildingTh : unit.building}</p>
                        <p className="text-[10px] text-gray-400">{isTh ? unit.roomLocationTh : unit.roomLocation}</p>
                      </td>
                      <td className="px-3.5 py-3 font-medium uppercase text-gray-600">
                        {unit.type.replace('_', ' ')}
                      </td>
                      <td className="px-3.5 py-3 text-gray-600 font-medium">
                        {unit.nextDueDate}
                      </td>
                      <td className="px-3.5 py-3">
                        {getStatusBadge(unit.status)}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewUnitDetail(unit)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#d32f2f] bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isTh ? 'ดูข้อมูล' : 'View'}</span>
                          </button>

                          {onDeleteUnit && (
                            <button
                              onClick={() => onDeleteUnit(unit.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={isTh ? 'ลบถังนี้' : 'Delete unit'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Compliance Feed / Activity Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-[#d32f2f]" />
              <span>{isTh ? 'กิจกรรมล่าสุดในระบบ' : 'Compliance Activity Feed'}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isTh ? 'บันทึกความเคลื่อนไหวและการรายงานแบบ Real-Time' : 'Live update stream from field inspectors'}
            </p>

            <div className="space-y-4">
              {activityLogs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  {isTh ? 'ยังไม่มีบันทึกกิจกรรมในระบบ' : 'No compliance activity logged yet'}
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
                      <span className="font-mono text-[#d32f2f] font-bold">{log.unitId}</span>
                      <span>{isTh ? log.timestampTh : log.timestamp}</span>
                    </div>
                    <p className="font-medium text-gray-800 leading-snug">
                      {isTh ? log.titleTh : log.title}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-500">
                      <span>📍 {isTh ? log.locationTh : log.location}</span>
                      <span className="text-emerald-600 font-semibold">{isTh ? 'บันทึกแล้ว' : 'Logged'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              {isTh ? 'ซิงค์ข้อมูลล่าสุดกับคลาวด์อัตโนมัติ' : 'Auto-synchronized with RT-Fire Safety Cloud'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
