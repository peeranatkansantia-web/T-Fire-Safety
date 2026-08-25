import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  UserCheck, 
  Check, 
  Gauge,
  Trash2,
  Camera,
  MessageSquare,
  Eye
} from 'lucide-react';
import { InspectionRecord, Language } from '../types';
import { PhotoLightboxModal } from './modals/PhotoLightboxModal';
import { LineNotificationModal } from './modals/LineNotificationModal';

interface RecordsViewProps {
  lang: Language;
  records: InspectionRecord[];
  onOpenNewInspection: () => void;
  onOpenExportModal: () => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  lang,
  records,
  onOpenNewInspection,
  onOpenExportModal,
  onDeleteRecord,
}) => {
  const isTh = lang === 'th';

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; subtitle: string } | null>(null);
  const [selectedLineRecord, setSelectedLineRecord] = useState<InspectionRecord | null>(null);

  const filteredRecords = records.filter((rec) => {
    const matchStatus = selectedStatus === 'all' || rec.status === selectedStatus;
    const matchSearch = 
      rec.extinguisherId.toLowerCase().includes(search.toLowerCase()) ||
      rec.inspectorName.toLowerCase().includes(search.toLowerCase()) ||
      rec.inspectorNameTh.includes(search) ||
      rec.notes.toLowerCase().includes(search.toLowerCase()) ||
      rec.notesTh.includes(search);

    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: 'passed' | 'failed' | 'maintenance') => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isTh ? 'ผ่านการตรวจ (Passed)' : 'Passed'}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {isTh ? 'ไม่ผ่าน (Failed)' : 'Failed'}
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {isTh ? 'ส่งซ่อมบำรุง' : 'Maintenance'}
          </span>
        );
    }
  };

  const totalLogs = records.length;
  const passedLogs = records.filter(r => r.status === 'passed').length;
  const failedLogs = records.filter(r => r.status === 'failed').length;
  const maintLogs = records.filter(r => r.status === 'maintenance').length;
  const passRate = totalLogs > 0 ? ((passedLogs / totalLogs) * 100).toFixed(1) : '0';

  const handleDownloadCsv = () => {
    const headers = ["Record ID", "Date", "Time", "Unit ID", "Inspector", "Status", "Pressure (PSI)", "Notes"];
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      r.time,
      r.extinguisherId,
      r.inspectorName,
      r.status,
      r.pressurePsi || 180,
      `"${r.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RT_Fire_Safety_Inspection_Records_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="inspection-records-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#d32f2f]" />
            {isTh ? 'ประวัติและบันทึกการตรวจสอบ' : 'Inspection Audit Logs'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isTh ? 'ประวัติการตรวจเช็กถังดับเพลิงประจำเดือน โดยเจ้าหน้าที่ตรวจสอบความปลอดภัย' : 'Official field inspection history, pressure logs, and inspector signatures'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="records-export-csv-btn"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200/80 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>{isTh ? 'ส่งออก CSV' : 'Export CSV'}</span>
          </button>

          <button
            id="records-export-pdf-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-[#d32f2f] font-bold text-xs rounded-xl border border-red-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{isTh ? 'พิมพ์รายงาน PDF' : 'Export PDF Report'}</span>
          </button>

          <button
            id="records-new-inspection-btn"
            onClick={onOpenNewInspection}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <span>{isTh ? '+ บันทึกการตรวจใหม่' : '+ Log Inspection'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards MTD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-gray-400">{isTh ? 'บันทึกทั้งหมด (Total Logs)' : 'Total Audit Logs'}</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalLogs.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-1">{isTh ? 'อัปเดตเรียลไทม์' : 'Real-time sync'}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-emerald-600">{isTh ? 'ผ่านการตรวจ (Passed MTD)' : 'Passed (MTD)'}</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{passedLogs.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{passRate}% {isTh ? 'อัตราผ่าน' : 'pass rate'}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-red-600">{isTh ? 'ไม่ผ่าน (Failed MTD)' : 'Failed (MTD)'}</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{failedLogs.toLocaleString()}</p>
          <p className="text-[11px] text-red-600 font-semibold mt-1">{isTh ? 'แจ้งซ่อมทันที' : 'Action requested'}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-amber-600">{isTh ? 'อยู่ระหว่างส่งซ่อม (Maintenance)' : 'In Maintenance'}</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{maintLogs.toLocaleString()}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">{isTh ? 'รอส่งคืนจุดติดตั้ง' : 'Pending return'}</p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTh ? 'ค้นหารหัสถัง, ชื่อเจ้าหน้าที่, บันทึก...' : 'Search logs, inspector, notes...'}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium text-gray-700 w-full sm:w-auto"
          >
            <option value="all">{isTh ? 'ทุกผลการตรวจ' : 'All Inspection Results'}</option>
            <option value="passed">{isTh ? 'ผ่านการตรวจ (Passed)' : 'Passed'}</option>
            <option value="failed">{isTh ? 'ไม่ผ่าน (Failed)' : 'Failed'}</option>
            <option value="maintenance">{isTh ? 'ส่งซ่อมบำรุง' : 'Maintenance'}</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">{isTh ? 'รหัสบันทึก / วันที่' : 'Log ID & Date'}</th>
                <th className="px-4 py-3">{isTh ? 'รหัสถังดับเพลิง' : 'Extinguisher ID'}</th>
                <th className="px-4 py-3">{isTh ? 'ผู้ตรวจสอบ' : 'Inspector'}</th>
                <th className="px-4 py-3">{isTh ? 'แรงดัน (PSI)' : 'Pressure (PSI)'}</th>
                <th className="px-4 py-3">{isTh ? 'ผลการตรวจ' : 'Status'}</th>
                <th className="px-4 py-3">{isTh ? 'หมายเหตุ & รายละเอียด' : 'Inspection Notes'}</th>
                <th className="px-4 py-3 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardList className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-gray-600">
                        {isTh ? 'ยังไม่มีประวัติบันทึกการตรวจเช็กในระบบ' : 'No inspection records found'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isTh ? 'กดปุ่ม "+ บันทึกการตรวจใหม่" เพื่อเริ่มบันทึกประวัติ' : 'Click "+ Log Inspection" to record an inspection'}
                      </p>
                      <button
                        onClick={onOpenNewInspection}
                        className="mt-2 px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        {isTh ? '+ บันทึกการตรวจใหม่' : '+ Log Inspection'}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-gray-400 block">{rec.id}</span>
                      <span className="font-semibold text-gray-800">{rec.date}</span>
                      <span className="text-[10px] text-gray-400 block">{rec.time}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                      {rec.extinguisherId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {rec.inspectorAvatar ? (
                          <img src={rec.inspectorAvatar} alt={rec.inspectorName} className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-100 text-[#d32f2f] font-bold text-xs flex items-center justify-center">
                            {rec.inspectorInitials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{isTh ? rec.inspectorNameTh : rec.inspectorName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Badge {rec.inspectorBadge}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rec.pressurePsi || 185} PSI</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-xs leading-relaxed">
                      <div className="space-y-1.5">
                        <p>{isTh ? rec.notesTh : rec.notes}</p>
                        {rec.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto({
                              url: rec.photoUrl!,
                              title: `${rec.extinguisherId} - ${rec.date}`,
                              subtitle: `${isTh ? rec.inspectorNameTh : rec.inspectorName} (${rec.status.toUpperCase()})`
                            })}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors group"
                          >
                            <Camera className="w-3 h-3 text-[#d32f2f] group-hover:scale-110 transition-transform" />
                            <span>{isTh ? 'ดูภาพถ่ายหลักฐาน' : 'View Evidence'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedLineRecord(rec)}
                          className="p-1.5 text-emerald-600 hover:text-white hover:bg-[#06c755] rounded-lg transition-colors"
                          title={isTh ? 'แชร์/ส่งแจ้งเตือนผ่าน LINE' : 'Share via LINE'}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteRecord && (
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isTh ? 'ลบบันทึกนี้' : 'Delete log'}
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

      {/* Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        lang={lang}
        photoUrl={previewPhoto?.url || null}
        title={previewPhoto?.title}
        subtitle={previewPhoto?.subtitle}
      />

      {/* LINE Notification Modal */}
      <LineNotificationModal
        isOpen={!!selectedLineRecord}
        onClose={() => setSelectedLineRecord(null)}
        lang={lang}
        record={selectedLineRecord}
      />

    </div>
  );
};
