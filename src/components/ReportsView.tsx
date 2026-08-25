import React from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  PieChart as PieIcon, 
  Flame,
  Plus,
  Trash2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BuildingCompliance, 
  ExtinguisherUnit,
  InspectionRecord,
  Language 
} from '../types';

interface ReportsViewProps {
  lang: Language;
  buildings: BuildingCompliance[];
  extinguishers?: ExtinguisherUnit[];
  records?: InspectionRecord[];
  onOpenExportModal: () => void;
  onOpenAddBuilding?: () => void;
  onEditBuilding?: (building: BuildingCompliance) => void;
  onDeleteBuilding?: (buildingId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  lang,
  buildings,
  extinguishers = [],
  records = [],
  onOpenExportModal,
  onOpenAddBuilding,
  onEditBuilding,
  onDeleteBuilding,
}) => {
  const isTh = lang === 'th';

  // Dynamically compute monthly trend data based on inspection records logged by user
  const monthlyTrendData = React.useMemo(() => {
    const allMonths = [
      { key: '01', month: 'Jan', monthTh: 'ม.ค.' },
      { key: '02', month: 'Feb', monthTh: 'ก.พ.' },
      { key: '03', month: 'Mar', monthTh: 'มี.ค.' },
      { key: '04', month: 'Apr', monthTh: 'เม.ย.' },
      { key: '05', month: 'May', monthTh: 'พ.ค.' },
      { key: '06', month: 'Jun', monthTh: 'มิ.ย.' },
      { key: '07', month: 'Jul', monthTh: 'ก.ค.' },
      { key: '08', month: 'Aug', monthTh: 'ส.ค.' },
      { key: '09', month: 'Sep', monthTh: 'ก.ย.' },
      { key: '10', month: 'Oct', monthTh: 'ต.ค.' },
      { key: '11', month: 'Nov', monthTh: 'พ.ย.' },
      { key: '12', month: 'Dec', monthTh: 'ธ.ค.' },
    ];

    const currentMonthIdx = new Date().getMonth(); // 0-indexed
    let selectedMonths = [];
    if (currentMonthIdx < 5) {
      selectedMonths = allMonths.slice(0, 6);
    } else {
      selectedMonths = allMonths.slice(currentMonthIdx - 5, currentMonthIdx + 1);
    }

    const targetPerMonth = extinguishers.length > 0 ? extinguishers.length : (records.length > 0 ? records.length : 5);

    return selectedMonths.map(m => {
      const completedCount = records.filter(r => {
        if (!r.rawDate) return false;
        const parts = r.rawDate.split('-');
        return parts.length >= 2 && parts[1] === m.key;
      }).length;

      return {
        month: m.month,
        monthTh: m.monthTh,
        completed: completedCount,
        projected: targetPerMonth,
      };
    });
  }, [records, extinguishers]);

  // Compute building list dynamically if buildings prop is empty but extinguishers exist
  const displayBuildings: BuildingCompliance[] = React.useMemo(() => {
    if (buildings.length > 0) return buildings;
    if (extinguishers.length === 0) return [];

    // Group by building
    const map = new Map<string, { name: string; nameTh: string; total: number; normal: number; critical: number }>();
    extinguishers.forEach(u => {
      const key = u.buildingTh || u.building;
      const current = map.get(key) || { name: u.building, nameTh: u.buildingTh || u.building, total: 0, normal: 0, critical: 0 };
      current.total += 1;
      if (u.status === 'normal') current.normal += 1;
      if (u.status === 'critical' || u.status === 'expired') current.critical += 1;
      map.set(key, current);
    });

    return Array.from(map.entries()).map(([key, data], idx) => {
      const rate = data.total > 0 ? Math.round((data.normal / data.total) * 100) : 0;
      const riskLevel: 'low' | 'medium' | 'high' = data.critical > 0 ? 'high' : rate >= 95 ? 'low' : 'medium';

      return {
        id: `BLD-${idx + 1}`,
        name: data.name,
        nameTh: data.nameTh,
        location: 'Facility Site',
        locationTh: 'ภายในพื้นที่สถานี',
        assetsCount: data.total,
        inspectedCount: data.normal,
        riskLevel,
        complianceRate: rate,
        floorPlans: ['GF', 'L1']
      };
    });
  }, [buildings, extinguishers]);

  const totalAssetsCount = extinguishers.length > 0 
    ? extinguishers.length 
    : buildings.reduce((acc, b) => acc + b.assetsCount, 0);

  const totalNormalCount = extinguishers.length > 0 
    ? extinguishers.filter(u => u.status === 'normal').length 
    : buildings.reduce((acc, b) => acc + b.inspectedCount, 0);

  const overallRate = totalAssetsCount > 0 
    ? ((totalNormalCount / totalAssetsCount) * 100).toFixed(1) 
    : '0';

  const highRiskBuildingCount = displayBuildings.filter(b => b.riskLevel === 'high').length;

  // Breakdown counts by type
  const co2Count = extinguishers.filter(u => u.type === 'co2').length;
  const waterMistCount = extinguishers.filter(u => u.type === 'water_mist').length;
  const dryPowderCount = extinguishers.filter(u => u.type === 'dry_powder').length;
  const cleanAgentCount = extinguishers.filter(u => u.type === 'clean_agent' || u.type === 'foam').length;

  const co2Pct = totalAssetsCount > 0 ? Math.round((co2Count / totalAssetsCount) * 100) : 0;
  const waterMistPct = totalAssetsCount > 0 ? Math.round((waterMistCount / totalAssetsCount) * 100) : 0;
  const dryPowderPct = totalAssetsCount > 0 ? Math.round((dryPowderCount / totalAssetsCount) * 100) : 0;
  const cleanAgentPct = totalAssetsCount > 0 ? Math.round((cleanAgentCount / totalAssetsCount) * 100) : 0;

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isTh ? 'ความเสี่ยงต่ำ (Low Risk)' : 'Low Risk'}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {isTh ? 'ความเสี่ยงปานกลาง' : 'Medium Risk'}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            {isTh ? 'ความเสี่ยงสูง (High Risk)' : 'High Risk'}
          </span>
        );
    }
  };

  return (
    <div id="reports-analytics-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#d32f2f]" />
            {isTh ? 'รายงานและสถิติความปลอดภัยอัคคีภัย' : 'Fire Safety Compliance & Analytics'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isTh ? 'การวิเคราะห์แนวโน้มการตรวจสอบ สัดส่วนอุปกรณ์ และรายงานสรุปแยกตามอาคาร' : 'Monthly trend analysis, equipment distribution ratio, and building status breakdown'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="reports-pdf-modal-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>{isTh ? 'ดาวน์โหลดรายงานสรุป PDF' : 'Download Executive PDF'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Executive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Compliance Rate */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              {isTh ? 'อัตราความพร้อมใช้งานรวม' : 'Overall Operational Rate'}
            </p>
            <p className="text-4xl font-extrabold mt-1">{overallRate}%</p>
            <p className="text-[11px] text-emerald-200/90 mt-1">
              {isTh ? 'คำนวณจากสถานะอุปกรณ์ทั้งหมด' : 'Compliant with safety standards'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-300" />
          </div>
        </div>

        {/* Total Monitored Assets */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isTh ? 'จำนวนอุปกรณ์ที่เฝ้าระวัง' : 'Active Monitored Assets'}
            </p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{totalAssetsCount.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {totalAssetsCount > 0 ? (isTh ? `${totalAssetsCount} อุปกรณ์ในระบบ` : `${totalAssetsCount} active assets`) : (isTh ? 'ยังไม่มีข้อมูล' : 'No assets')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#d32f2f] flex items-center justify-center">
            <Flame className="w-7 h-7" />
          </div>
        </div>

        {/* Urgent Attention Needed */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isTh ? 'อาคารที่ต้องเฝ้าระวังพิเศษ' : 'High-Risk Priority Zone'}
            </p>
            <p className="text-4xl font-extrabold text-[#d32f2f] mt-1">{highRiskBuildingCount < 10 ? `0${highRiskBuildingCount}` : highRiskBuildingCount}</p>
            <p className="text-[11px] text-red-600 font-semibold mt-1">
              {highRiskBuildingCount > 0 ? (isTh ? 'พบพื้นที่ความเสี่ยงสูง' : 'High-risk zone detected') : (isTh ? 'ทุกอาคารปลอดภัย' : 'All zones secure')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Inspection Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                {isTh ? 'แนวโน้มการตรวจเช็กประจำเดือน (Monthly Inspection Trends)' : 'Monthly Inspection Trends'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTh ? 'เปรียบเทียบจำนวนการตรวจที่เสร็จสิ้นกับเป้าหมายประจำเดือน' : 'Completed field checks vs scheduled target'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey={isTh ? "monthTh" : "month"} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar 
                  dataKey="completed" 
                  name={isTh ? "ตรวจเสร็จแล้ว" : "Completed Checks"} 
                  fill="#d32f2f" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="projected" 
                  name={isTh ? "เป้าหมายการตรวจ" : "Target Checks"} 
                  fill="#e5e7eb" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Equipment Type Ratio Gauges */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-1">
              {isTh ? 'สัดส่วนประเภทอุปกรณ์' : 'Asset Type Distribution'}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              {isTh ? 'กระจายตามชนิดสารดับเพลิงในระบบ' : 'Share of fire suppression agents'}
            </p>

            <div className="space-y-4 text-xs">
              
              <div>
                <div className="flex justify-between font-bold text-gray-800 mb-1">
                  <span>CO2 (คาร์บอนไดออกไซด์)</span>
                  <span className="text-[#d32f2f]">{co2Pct}% ({co2Count})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d32f2f] rounded-full" style={{ width: `${co2Pct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-800 mb-1">
                  <span>Water Mist (ละอองน้ำแรงดันสูง)</span>
                  <span className="text-blue-600">{waterMistPct}% ({waterMistCount})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${waterMistPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-800 mb-1">
                  <span>Dry Powder (ผงเคมีแห้ง)</span>
                  <span className="text-amber-600">{dryPowderPct}% ({dryPowderCount})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dryPowderPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-800 mb-1">
                  <span>Clean Agent & Foam (สารสะอาด/โฟม)</span>
                  <span className="text-emerald-600">{cleanAgentPct}% ({cleanAgentCount})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cleanAgentPct}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            {isTh ? `รวมอุปกรณ์ทั้งหมด ${totalAssetsCount} ชิ้น` : `Total ${totalAssetsCount} assets classified`}
          </div>
        </div>

      </div>

      {/* Building Compliance & Risk Assessment Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {isTh ? 'รายงานสรุปผลการตรวจสอบแยกตามอาคาร' : 'Building Status & Inspection Summary'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isTh ? 'ประเมินระดับความเสี่ยงและอัตราการตรวจเสร็จสิ้นในแต่ละอาคาร' : 'Compliance rates and risk tier classification per building structure'}
            </p>
          </div>
          {onOpenAddBuilding && (
            <button
              onClick={onOpenAddBuilding}
              className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isTh ? '+ เพิ่มอาคาร/โซนใหม่' : '+ Add Building / Zone'}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">{isTh ? 'ชื่ออาคาร / สถานที่' : 'Building Name'}</th>
                <th className="px-4 py-3">{isTh ? 'จำนวนถังทั้งหมด' : 'Total Assets'}</th>
                <th className="px-4 py-3">{isTh ? 'ตรวจแล้ว' : 'Inspected'}</th>
                <th className="px-4 py-3">{isTh ? 'อัตราผ่านเกณฑ์ %' : 'Compliance Rate'}</th>
                <th className="px-4 py-3">{isTh ? 'ระดับความเสี่ยง' : 'Risk Tier'}</th>
                <th className="px-4 py-3 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayBuildings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-gray-600">
                        {isTh ? 'ยังไม่มีข้อมูลอาคารหรืออุปกรณ์ในระบบ' : 'No building compliance records yet'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isTh ? 'กดปุ่ม "+ เพิ่มอาคาร/โซนใหม่" เพื่อเริ่มสร้างอาคารของคุณ' : 'Click "+ Add Building" to define your workspace locations'}
                      </p>
                      {onOpenAddBuilding && (
                        <button
                          onClick={onOpenAddBuilding}
                          className="mt-2 px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          {isTh ? '+ เพิ่มอาคาร/โซนใหม่' : '+ Add Building / Zone'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayBuildings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 text-sm">{isTh ? b.nameTh : b.name}</p>
                      <p className="text-[11px] text-gray-500">{isTh ? b.locationTh : b.location}</p>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-gray-900">
                      {b.assetsCount}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">
                      {b.inspectedCount}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              b.complianceRate >= 98 ? 'bg-emerald-500' : b.complianceRate >= 94 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${b.complianceRate}%` }}
                          ></div>
                        </div>
                        <span className="font-extrabold text-gray-900">{b.complianceRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getRiskBadge(b.riskLevel)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditBuilding && (
                          <button
                            onClick={() => onEditBuilding(b)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-[#d32f2f] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {isTh ? 'แก้ไข' : 'Edit'}
                          </button>
                        )}
                        {onDeleteBuilding && (
                          <button
                            onClick={() => onDeleteBuilding(b.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isTh ? 'ลบอาคารนี้' : 'Delete building'}
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
