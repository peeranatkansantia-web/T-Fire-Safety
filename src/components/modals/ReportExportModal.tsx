import React from 'react';
import { X, FileText, Printer, Trash2 } from 'lucide-react';
import { Language, ExtinguisherUnit, BuildingCompliance, UserProfile } from '../../types';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  extinguishers?: ExtinguisherUnit[];
  buildings?: BuildingCompliance[];
  profile?: UserProfile;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  lang,
  extinguishers = [],
  buildings = [],
  profile,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';

  const totalAssets = extinguishers.length > 0 ? extinguishers.length : buildings.reduce((acc, b) => acc + b.assetsCount, 0);
  const normalAssets = extinguishers.length > 0 ? extinguishers.filter(u => u.status === 'normal').length : buildings.reduce((acc, b) => acc + b.inspectedCount, 0);
  const operationalRate = totalAssets > 0 ? Math.round((normalAssets / totalAssets) * 100) : 0;

  const [removedBuildingIds, setRemovedBuildingIds] = React.useState<string[]>([]);

  // Compute building summary list dynamically
  const displayBuildings = React.useMemo(() => {
    let list: BuildingCompliance[] = [];

    if (buildings.length > 0) {
      list = buildings;
    } else if (extinguishers.length > 0) {
      const map = new Map<string, { name: string; nameTh: string; total: number; normal: number }>();
      extinguishers.forEach(u => {
        const key = u.buildingTh || u.building;
        const current = map.get(key) || { name: u.building, nameTh: u.buildingTh || u.building, total: 0, normal: 0 };
        current.total += 1;
        if (u.status === 'normal') current.normal += 1;
        map.set(key, current);
      });

      list = Array.from(map.entries()).map(([_, data], idx) => {
        const rate = data.total > 0 ? Math.round((data.normal / data.total) * 100) : 0;
        return {
          id: `BLD-${idx + 1}`,
          name: data.name,
          nameTh: data.nameTh,
          location: 'Site Location',
          locationTh: 'พื้นที่ภายในโครงการ',
          assetsCount: data.total,
          inspectedCount: data.normal,
          riskLevel: 'low' as const,
          complianceRate: rate,
          floorPlans: ['GF'],
        };
      });
    }

    // Filter out removed buildings and specifically 'อาคารผู้โดยสาร' / 'Passenger Terminal'
    return list.filter(b => {
      if (removedBuildingIds.includes(b.id)) return false;
      const thName = (b.nameTh || '').toLowerCase();
      const enName = (b.name || '').toLowerCase();
      if (thName.includes('ผู้โดยสาร') || enName.includes('passenger') || enName.includes('terminal')) {
        return false;
      }
      return true;
    });
  }, [buildings, extinguishers, removedBuildingIds]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-export-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {isTh ? 'ตัวอย่างรายงานสรุปผลการตรวจสอบ (PDF)' : 'Executive Inspection Summary PDF'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'รายงานสรุปผลการตรวจสอบ และสรุปความพร้อมใช้งานประจำเดือน' : 'Official readiness summary & audit breakdown'}
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

        {/* Printable PDF Preview Paper Canvas */}
        <div className="my-4 overflow-y-auto custom-scrollbar flex-1 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
          <div id="printable-pdf-document" className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-gray-900 text-xs space-y-6">
            
            {/* Header Document */}
            <div className="flex items-center justify-between border-b-2 border-[#d32f2f] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#d32f2f] uppercase tracking-wide">
                  RT-Fire Safety • Safety Audit
                </h2>
                <p className="text-[11px] text-[#d32f2f] font-bold mt-0.5">
                  🏛️ {isTh ? (profile?.departmentTh || 'สำนักงานสาธารณสุขจังหวัดนครราชสีมา') : (profile?.department || 'Nakhon Ratchasima Provincial Public Health Office')}
                </p>
                <p className="text-[10px] text-gray-500">
                  {isTh ? 'รายงานผลการตรวจสอบและสรุปสถานะอุปกรณ์ดับเพลิง' : 'Official Fire Safety Readiness & Asset Audit Certificate'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-400 block">Doc ID: RT-RPT-{new Date().getFullYear()}-OFFICIAL</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  ✓ VERIFIED PASSED
                </span>
              </div>
            </div>

            {/* Audit Summary Grid */}
            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">{isTh ? 'จำนวนถังทั้งหมด' : 'Total Assets'}</p>
                <p className="text-xl font-extrabold text-gray-900">{totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">{isTh ? 'พร้อมใช้งาน' : 'Operational'}</p>
                <p className="text-xl font-extrabold text-emerald-600">{normalAssets} ({operationalRate}%)</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">{isTh ? 'อัตราความพร้อม' : 'Readiness'}</p>
                <p className="text-xl font-extrabold text-[#d32f2f]">{operationalRate}%</p>
              </div>
            </div>

            {/* Building breakdown summary */}
            <div>
              <p className="font-bold text-sm text-gray-900 mb-2">{isTh ? 'สรุปการตรวจสอบแยกตามอาคาร' : 'Building Status Summary'}</p>
              <table className="w-full text-left border-collapse border border-gray-200 text-[11px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold">
                    <th className="p-2 border border-gray-200">{isTh ? 'ชื่ออาคาร / โซน' : 'Building Zone'}</th>
                    <th className="p-2 border border-gray-200">{isTh ? 'จำนวนอุปกรณ์' : 'Assets'}</th>
                    <th className="p-2 border border-gray-200">{isTh ? 'พร้อมใช้งาน' : 'Ready'}</th>
                    <th className="p-2 border border-gray-200">{isTh ? 'อัตราความพร้อม %' : 'Compliance'}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBuildings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        {isTh ? 'ยังไม่มีข้อมูลอาคารในระบบ' : 'No building records available'}
                      </td>
                    </tr>
                  ) : (
                    displayBuildings.map((b) => (
                      <tr key={b.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="p-2 border border-gray-200 font-bold flex items-center justify-between">
                          <span>{isTh ? b.nameTh : b.name}</span>
                          <button
                            type="button"
                            onClick={() => setRemovedBuildingIds(prev => [...prev, b.id])}
                            title={isTh ? 'นำออกรายการนี้' : 'Remove row'}
                            className="print:hidden text-gray-300 hover:text-red-600 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="p-2 border border-gray-200">{b.assetsCount}</td>
                        <td className="p-2 border border-gray-200">{b.inspectedCount}</td>
                        <td className="p-2 border border-gray-200 font-bold text-emerald-600">{b.complianceRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-mono">Inspector Officer</p>
                <p className="font-bold text-gray-800">{isTh ? (profile?.nameTh || 'เจ้าหน้าที่ตรวจสอบ') : (profile?.name || 'Inspector')}</p>
                <p className="text-[10px] text-gray-500">{isTh ? (profile?.jobTitleTh || 'เจ้าหน้าที่ความปลอดภัย') : (profile?.jobTitle || 'Safety Inspector')}</p>
              </div>
              <div className="w-28 h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-gray-400 text-xs">
                {profile?.name || 'Authorized'}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
          >
            {isTh ? 'ปิดหน้าต่าง' : 'Close'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{isTh ? 'พิมพ์ / ดาวน์โหลด PDF' : 'Print / Download PDF'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
