import React from 'react';
import { 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  ArrowUpRight, 
  Eye, 
  QrCode, 
  Plus, 
  Map, 
  Building, 
  Calendar, 
  Check,
  Trash2
} from 'lucide-react';
import { 
  ExtinguisherUnit, 
  InspectionRecord, 
  Language, 
  ExtinguisherStatus 
} from '../types';

interface DashboardViewProps {
  lang: Language;
  extinguishers: ExtinguisherUnit[];
  records: InspectionRecord[];
  onOpenNewInspection: () => void;
  onOpenNewUnit: () => void;
  onOpenFacilityMap: () => void;
  onViewUnitDetail: (unit: ExtinguisherUnit) => void;
  onOpenQrCode: (unit: ExtinguisherUnit) => void;
  onDeleteUnit?: (unitId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  extinguishers,
  records,
  onOpenNewInspection,
  onOpenNewUnit,
  onOpenFacilityMap,
  onViewUnitDetail,
  onOpenQrCode,
  onDeleteUnit,
}) => {
  const isTh = lang === 'th';

  // Metrics calculations
  const totalCount = extinguishers.length;
  const normalCount = extinguishers.filter(u => u.status === 'normal').length;
  const dueSoonCount = extinguishers.filter(u => u.status === 'due_soon').length;
  const criticalCount = extinguishers.filter(u => u.status === 'critical' || u.status === 'expired').length;
  const readinessPercent = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 0;

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
            {isTh ? 'ใกล้กำหนดตรวจ (Due Soon)' : 'Due Soon'}
          </span>
        );
      case 'expired':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {isTh ? 'เร่งด่วน / หมดอายุ' : 'Expired / Critical'}
          </span>
        );
    }
  };

  const getRecordStatusBadge = (status: 'passed' | 'failed' | 'maintenance') => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {isTh ? 'ผ่าน (Passed)' : 'Passed'}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
            {isTh ? 'ไม่ผ่าน (Failed)' : 'Failed'}
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
            {isTh ? 'ส่งซ่อมบำรุง' : 'Maintenance'}
          </span>
        );
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* Top Banner & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-[#900c14] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 text-white/90 text-xs font-semibold rounded-full border border-white/20 mb-3">
            {isTh ? '⚡ ระบบเฝ้าระวังอัคคีภัยแบบ Real-time' : '⚡ Real-Time Safety Surveillance'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {isTh ? 'แผงควบคุมและสถานะอุปกรณ์ถังดับเพลิง' : 'Fire Extinguisher Command Center'}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {isTh 
              ? 'ระบบติดตามสถานะ การตรวจสอบประจำเดือน และการจัดการอุปกรณ์ถังดับเพลิงภายในหน่วยงาน'
              : 'Monitor asset readiness and monthly safety checks in real-time.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="dashboard-open-map-btn"
            onClick={onOpenFacilityMap}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-sm border border-white/20 transition-all"
          >
            <Map className="w-4 h-4 text-red-300" />
            <span>{isTh ? 'ผังอาคารแบบ Interactive' : 'Facility Map'}</span>
          </button>

          <button
            id="dashboard-add-unit-btn"
            onClick={onOpenNewUnit}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? 'เพิ่มอุปกรณ์ถังใหม่' : 'Add Unit'}</span>
          </button>
        </div>

        {/* Subtle background glow effect */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#d32f2f]/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assets */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">
              {isTh ? 'รายการทั้งหมด (Total Assets)' : 'Total Assets'}
            </p>
            <div className="p-2 bg-gray-100 rounded-xl text-gray-700">
              <Flame className="w-5 h-5 text-[#d32f2f]" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalCount.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="text-emerald-600 font-bold flex items-center">
              {totalCount > 0 ? `${totalCount} ${isTh ? 'รายการในระบบ' : 'registered units'}` : (isTh ? 'ยังไม่มีข้อมูล' : 'No data')}
            </span>
            <span>• {isTh ? 'ทุกอาคาร' : 'All Areas'}</span>
          </div>
        </div>

        {/* Functional / Normal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">
              {isTh ? 'ใช้งานได้ปกติ (Functional)' : 'Functional Assets'}
            </p>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{normalCount.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <span>{totalCount > 0 ? `${((normalCount / totalCount) * 100).toFixed(1)}%` : '0%'} {isTh ? 'ของอุปกรณ์ทั้งหมด' : 'of total assets'}</span>
          </div>
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">
              {isTh ? 'ใกล้กำหนดตรวจ (Due Soon)' : 'Inspection Due Soon'}
            </p>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{dueSoonCount.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 font-semibold">
            <span>{isTh ? 'ต้องตรวจภายใน 14 วัน' : 'Due within 14 days'}</span>
          </div>
        </div>

        {/* Urgent / Critical */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">
              {isTh ? 'เร่งด่วน / หมดอายุ (Urgent)' : 'Urgent Action Needed'}
            </p>
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#d32f2f] mt-2">{criticalCount.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-semibold">
            <span>{isTh ? 'ต้องดำเนินการซ่อมบำรุงด่วน' : 'Requires immediate service'}</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Donut Status Gauge & Recent Inspection Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Capacity Donut Gauge */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 flex items-center justify-between">
              <span>{isTh ? 'ดัชนีความพร้อมใช้งาน' : 'Asset Readiness Gauge'}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {readinessPercent}% Safe
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isTh ? 'สัดส่วนความปลอดภัยของถังดับเพลิงในระบบ' : 'Proportion of operational vs due extinguishers'}
            </p>
          </div>

          {/* Visual Donut Chart Simulation */}
          <div className="my-6 flex flex-col items-center justify-center relative">
            <div className="w-44 h-44 rounded-full border-[18px] border-emerald-500 border-t-amber-500 border-r-red-500 flex items-center justify-center shadow-inner relative">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-gray-900 block">{readinessPercent}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {isTh ? 'ความพร้อม' : 'Operational'}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-gray-700 font-medium">{isTh ? 'ปกติ (Normal)' : 'Normal Status'}</span>
              </div>
              <span className="font-bold text-gray-900">
                {normalCount} ({totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-gray-700 font-medium">{isTh ? 'ใกล้กำหนดตรวจ (Due Soon)' : 'Due Soon'}</span>
              </div>
              <span className="font-bold text-gray-900">
                {dueSoonCount} ({totalCount > 0 ? ((dueSoonCount / totalCount) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-700 font-medium">{isTh ? 'หมดอายุ / ชำรุด (Expired)' : 'Expired / Critical'}</span>
              </div>
              <span className="font-bold text-gray-900">
                {criticalCount} ({totalCount > 0 ? ((criticalCount / totalCount) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
          </div>
        </div>

        {/* Recent Inspections Log Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  {isTh ? 'ประวัติการตรวจสอบล่าสุด' : 'Recent Inspection Activities'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isTh ? 'ผลการตรวจถังดับเพลิงและบันทึกโดยเจ้าหน้าที่' : 'Latest monthly field checks logged by inspectors'}
                </p>
              </div>
              <button
                id="dashboard-new-inspection-trigger"
                onClick={onOpenNewInspection}
                className="text-xs font-bold text-[#d32f2f] hover:text-[#af101a] flex items-center gap-1 hover:underline"
              >
                <span>{isTh ? '+ บันทึกการตรวจ' : '+ Add Log'}</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="px-3 py-2.5">{isTh ? 'รหัสถัง' : 'Unit ID'}</th>
                    <th className="px-3 py-2.5">{isTh ? 'วันที่ & เวลา' : 'Date & Time'}</th>
                    <th className="px-3 py-2.5">{isTh ? 'เจ้าหน้าที่ตรวจ' : 'Inspector'}</th>
                    <th className="px-3 py-2.5">{isTh ? 'ผลการตรวจ' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        {isTh ? 'ยังไม่มีประวัติการตรวจสอบ เริ่มต้นโดยการกดปุ่ม "+ บันทึกการตรวจ"' : 'No inspection records yet. Click "+ Add Log" to start.'}
                      </td>
                    </tr>
                  ) : (
                    records.slice(0, 5).map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-3 py-3 font-bold text-gray-900">{rec.extinguisherId}</td>
                        <td className="px-3 py-3 text-gray-600">
                          {rec.date} <span className="text-gray-400 font-normal">({rec.time})</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {rec.inspectorAvatar ? (
                              <img src={rec.inspectorAvatar} alt={rec.inspectorName} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-red-100 text-[#d32f2f] font-bold text-[10px] flex items-center justify-center">
                                {rec.inspectorInitials}
                              </div>
                            )}
                            <span className="font-semibold text-gray-800">
                              {isTh ? rec.inspectorNameTh : rec.inspectorName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {getRecordStatusBadge(rec.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-4 text-right">
            <span className="text-xs text-gray-400">
              {isTh 
                ? `แสดง ${Math.min(5, records.length)} จาก ${records.length} บันทึก` 
                : `Showing ${Math.min(5, records.length)} of ${records.length} records`}
            </span>
          </div>
        </div>

      </div>

      {/* Asset Inventory Quick Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {isTh ? 'รายการอุปกรณ์ถังดับเพลิงในระบบ' : 'Fire Extinguisher Inventory'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isTh ? 'แสดงรายการถังดับเพลิง สถานะ และตำแหน่งประจำอาคาร' : 'Manage equipment specs, location tags, and QR codes'}
            </p>
          </div>
        </div>

        {/* Inventory Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">{isTh ? 'รหัสถัง (Unit ID)' : 'Unit ID'}</th>
                <th className="px-4 py-3">{isTh ? 'ประเภทอุปกรณ์' : 'Type'}</th>
                <th className="px-4 py-3">{isTh ? 'อาคาร & ตำแหน่ง' : 'Location'}</th>
                <th className="px-4 py-3">{isTh ? 'ตรวจล่าสุด' : 'Last Inspection'}</th>
                <th className="px-4 py-3">{isTh ? 'กำหนดตรวจถัดไป' : 'Next Due'}</th>
                <th className="px-4 py-3">{isTh ? 'สถานะ' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{isTh ? 'การจัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {extinguishers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Flame className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-gray-600">
                        {isTh ? 'ยังไม่มีข้อมูลถังดับเพลิงในระบบ' : 'No fire extinguishers registered yet'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isTh ? 'กดปุ่ม "เพิ่มอุปกรณ์ถังใหม่" เพื่อเริ่มกรอกข้อมูลของคุณ' : 'Click "Add Unit" to start entering your assets'}
                      </p>
                      <button
                        onClick={onOpenNewUnit}
                        className="mt-2 px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        {isTh ? '+ เพิ่มอุปกรณ์ถังใหม่' : '+ Add New Unit'}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                extinguishers.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenQrCode(unit)}
                          className="p-1 text-gray-400 hover:text-[#d32f2f] hover:bg-red-50 rounded-md transition-colors"
                          title={isTh ? 'ดู QR Code Badge' : 'View QR Code'}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div>
                          <span className="font-extrabold text-gray-900 text-sm block">{unit.id}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{unit.assetId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700 capitalize">
                      {unit.type.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800">{isTh ? unit.buildingTh : unit.building}</p>
                      <p className="text-[11px] text-gray-500">{isTh ? unit.roomLocationTh : unit.roomLocation}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">{unit.lastInspectionDate}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">{unit.nextDueDate}</td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(unit.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`unit-view-btn-${unit.id}`}
                          onClick={() => onViewUnitDetail(unit)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#d32f2f] bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isTh ? 'ดูรายละเอียด' : 'Details'}</span>
                        </button>

                        {onDeleteUnit && (
                          <button
                            onClick={() => onDeleteUnit(unit.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

    </div>
  );
};
