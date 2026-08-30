import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Search, 
  PhoneCall, 
  Camera, 
  MapPin, 
  Lock, 
  Info, 
  BookOpen, 
  ArrowRight, 
  HelpCircle, 
  Building2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  Send
} from 'lucide-react';
import { ExtinguisherUnit, Language, PublicIssueReport } from '../types';

interface PublicViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  extinguishers: ExtinguisherUnit[];
  activeUnit: ExtinguisherUnit | null;
  onSelectUnit: (unit: ExtinguisherUnit) => void;
  onOpenQrScanner: () => void;
  onOpenReportIssue: (unit?: ExtinguisherUnit) => void;
  onRequestAdminLogin: (intendedAction?: 'inspect' | 'manage', unitId?: string) => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  lang,
  setLang,
  extinguishers,
  activeUnit: initialActiveUnit,
  onSelectUnit,
  onOpenQrScanner,
  onOpenReportIssue,
  onRequestAdminLogin,
}) => {
  const isTh = lang === 'th';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'unit' | 'all_units' | 'emergency_guide' | 'contacts'>('unit');
  const [selectedUnitState, setSelectedUnitState] = useState<ExtinguisherUnit | null>(initialActiveUnit || extinguishers[0] || null);

  // Sync state when active unit changes from parent or URL/QR scan
  React.useEffect(() => {
    if (initialActiveUnit) {
      setSelectedUnitState(initialActiveUnit);
      setActiveTab('unit');
    }
  }, [initialActiveUnit]);

  const activeUnit = selectedUnitState || initialActiveUnit || extinguishers[0] || null;

  // Unique buildings
  const buildings = useMemo(() => {
    const set = new Set<string>();
    extinguishers.forEach(u => {
      const b = isTh ? u.buildingTh || u.building : u.building;
      if (b) set.add(b);
    });
    return Array.from(set);
  }, [extinguishers, isTh]);

  // Filtered extinguishers for browsing
  const filteredUnits = useMemo(() => {
    return extinguishers.filter(u => {
      const matchSearch = 
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.buildingTh || u.building).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.roomLocationTh || u.roomLocation).toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const bName = isTh ? u.buildingTh || u.building : u.building;
      const matchBuilding = selectedBuilding === 'all' || bName === selectedBuilding;
      return matchSearch && matchBuilding;
    });
  }, [extinguishers, searchQuery, selectedBuilding, isTh]);

  // Type metadata
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'co2':
        return {
          nameTh: 'ก๊าซคาร์บอนไดออกไซด์ (CO2)',
          nameEn: 'Carbon Dioxide (CO2)',
          color: 'bg-slate-900 text-white',
          badge: 'Class B, C',
          bestForTh: 'อุปกรณ์ไฟฟ้า คอมพิวเตอร์ ห้องเซิร์ฟเวอร์ และน้ำมันไวไฟ (ไม่ทิ้งคราบสกปรก)',
          bestForEn: 'Electrical equipment, server rooms, flammable liquids (Leaves no residue)',
          warningTh: 'ระวังความเย็นจัดขณะฉีด และห้ามใช้ในที่อับอากาศโดยไม่มีเครื่องช่วยหายใจ',
        };
      case 'water_mist':
        return {
          nameTh: 'ละอองน้ำแรงดันสูง (Water Mist)',
          nameEn: 'Water Mist Fire Extinguisher',
          color: 'bg-sky-600 text-white',
          badge: 'Class A, B, C, K',
          bestForTh: 'ดับไฟได้ทุกประเภท เป็นมิตรต่อสิ่งแวดล้อม ปลอดภัยต่อมนุษย์',
          bestForEn: 'All fire types, eco-friendly, non-toxic',
          warningTh: 'ไม่เหมาะกับสารเคมีทำปฏิกิริยากับน้ำ',
        };
      case 'clean_agent':
        return {
          nameTh: 'สารสะอาดดับเพลิง (Clean Agent / BF2000)',
          nameEn: 'Clean Agent Extinguisher',
          color: 'bg-emerald-600 text-white',
          badge: 'Class A, B, C',
          bestForTh: 'ห้องควบคุม, เครื่องมือแพทย์, ห้องแล็บ, ห้องคอมพิวเตอร์',
          bestForEn: 'Control rooms, medical devices, laboratories',
          warningTh: 'ฉีดพ่นให้ตรงจุดต้นเพลิงเพื่อตัดปฏิกิริยาลูกโซ่',
        };
      case 'foam':
        return {
          nameTh: 'โฟมดับเพลิง (AFFF Foam)',
          nameEn: 'AFFF Foam Extinguisher',
          color: 'bg-amber-600 text-white',
          badge: 'Class A, B',
          bestForTh: 'น้ำมันเบนซิน, ดีเซล, สี, ทินเนอร์, ของเหลวติดไฟ',
          bestForEn: 'Gasoline, diesel, paints, flammable liquids',
          warningTh: '⚠️ ห้ามฉีดใส่ไฟที่เกิดจากเครื่องใช้ไฟฟ้าที่มีกระแสไฟไหลอยู่เด็ดขาด!',
        };
      case 'dry_powder':
      default:
        return {
          nameTh: 'ผงเคมีแห้ง (Dry Chemical Powder ABC)',
          nameEn: 'ABC Dry Chemical Powder',
          color: 'bg-red-600 text-white',
          badge: 'Class A, B, C',
          bestForTh: 'ไม้, กระดาษ, พลาสติก, น้ำมัน, ก๊าซหุงต้ม, ไฟฟ้าลัดวงจร',
          bestForEn: 'Wood, paper, flammable liquids, gases, electrical fires',
          warningTh: 'มีคราบฝุ่นผงตกค้างหลังการใช้งาน',
        };
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          labelTh: 'พร้อมใช้งาน • ปลอดภัย',
          labelEn: 'Normal • Ready to Use',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dotColor: 'bg-emerald-500',
          icon: CheckCircle2,
          descTh: 'ผ่านการตรวจสอบ 7 จุดตามมาตรฐาน NFPA 10 แรงดันและอุปกรณ์อยู่ในเกณฑ์สมบูรณ์',
        };
      case 'due_soon':
        return {
          labelTh: 'ใกล้ถึงกำหนดตรวจ',
          labelEn: 'Inspection Due Soon',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          dotColor: 'bg-amber-500',
          icon: AlertTriangle,
          descTh: 'ยังใช้งานได้ แต่มีกำหนดตรวจบำรุงรักษาประจำเดือนภายในเร็วๆ นี้',
        };
      case 'critical':
      case 'expired':
      default:
        return {
          labelTh: 'ต้องได้รับการตรวจสอบ / ชำรุด',
          labelEn: 'Needs Inspection / Overdue',
          badgeClass: 'bg-red-100 text-red-800 border-red-300',
          dotColor: 'bg-red-500',
          icon: AlertCircle,
          descTh: 'เลยกำหนดตรวจ หรืออาจมีปัญหาเรื่องแรงดัน/อุปกรณ์ กรุณาแจ้งเจ้าหน้าที่ทันที',
        };
    }
  };

  const currentTypeInfo = activeUnit ? getTypeInfo(activeUnit.type) : null;
  const currentStatusInfo = activeUnit ? getStatusDisplay(activeUnit.status) : null;

  return (
    <div id="public-portal-root" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      
      {/* Top Public Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d32f2f] text-white flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base sm:text-lg text-gray-900 tracking-tight leading-none">
                  RT-Fire Safety
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-[#d32f2f] rounded-full">
                  Public Portal
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {isTh ? 'ศูนย์ข้อมูลความปลอดภัยและตรวจเช็กถังดับเพลิง' : 'Safety Equipment & Emergency Portal'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick QR Scanner Trigger */}
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#d32f2f] rounded-xl text-xs font-bold border border-red-200 transition-colors shadow-2xs"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">{isTh ? 'สแกน QR หน้าถัง' : 'Scan QR'}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(isTh ? 'en' : 'th')}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 uppercase transition-colors"
            >
              {lang}
            </button>

            {/* Admin Portal Switch / Login Button */}
            <button
              onClick={() => onRequestAdminLogin()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTh ? 'สำหรับเจ้าหน้าที่ (Admin)' : 'Staff Login'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* Emergency Hotline Ticker Bar */}
      <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>🚨 {isTh ? 'แจ้งเหตุดับเพลิงฉุกเฉิน 24 ชั่วโมง:' : '24/7 Fire Emergency Hotline:'}</span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="tel:199" 
              className="bg-white text-red-700 px-2.5 py-0.5 rounded-lg font-black hover:bg-red-50 transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>199 (สายด่วนดับเพลิง)</span>
            </a>
            <a 
              href="tel:1669" 
              className="bg-red-700 text-white px-2 py-0.5 rounded-lg hover:bg-red-800 transition-colors hidden sm:inline-flex items-center gap-1 font-bold"
            >
              <PhoneCall className="w-3 h-3" />
              <span>1669 (กู้ชีพฉุกเฉิน)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 w-full flex-1 space-y-4">

        {/* Admin / Staff Switch Notice Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-white">
                  {isTh ? 'โหมดบุคคลทั่วไป (Public Portal)' : 'Public Visitor Portal'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isTh ? 'เชื่อมต่อ Cloud Firestore แล้ว' : 'Cloud Firestore Synced'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isTh 
                  ? 'ข้อมูลถังและประวัติตรวจเช็กถูกบันทึกไว้ในระบบ หากคุณต้องการดูตารางจัดการถังทั้งหมด, กราฟ Dashboard, หรือแก้ไขข้อมูล กรุณากดเข้าสู่ระบบเจ้าหน้าที่'
                  : 'All units & inspection data are stored in Cloud Firestore. To access complete unit tables, analytics dashboard, or management tools, switch to Admin mode.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRequestAdminLogin('manage')}
            className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Lock className="w-4 h-4" />
            <span>{isTh ? '🔒 เข้าสู่ระบบเจ้าหน้าที่ (Admin)' : '🔒 Staff Admin Login'}</span>
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setActiveTab('unit')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'unit' 
                ? 'bg-[#d32f2f] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isTh ? '1. ตรวจสอบสถานะถัง' : '1. Unit Status'}</span>
          </button>

          <button
            onClick={() => setActiveTab('all_units')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'all_units' 
                ? 'bg-[#d32f2f] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isTh ? '2. ถังดับเพลิงในอาคาร' : '2. Building Units'}</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency_guide')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'emergency_guide' 
                ? 'bg-[#d32f2f] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isTh ? '3. วิธีใช้งาน P.A.S.S.' : '3. How to Use'}</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'contacts' 
                ? 'bg-[#d32f2f] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isTh ? '4. ติดต่อฉุกเฉิน' : '4. Contacts'}</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE UNIT STATUS & EMERGENCY ACTIONS */}
        {activeTab === 'unit' && activeUnit && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Quick Switcher / Unit Dropdown if user wants to check another unit */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">{isTh ? 'กำลังดูข้อมูลถัง:' : 'Viewing Extinguisher:'}</span>
                <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {activeUnit.id} ({activeUnit.assetId})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeUnit.id}
                  onChange={(e) => {
                    const found = extinguishers.find(u => u.id === e.target.value);
                    if (found) {
                      setSelectedUnitState(found);
                      onSelectUnit(found);
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                >
                  {extinguishers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.id} — {isTh ? u.buildingTh || u.building : u.building} ({isTh ? u.roomLocationTh || u.roomLocation : u.roomLocation})
                    </option>
                  ))}
                </select>

                <button
                  onClick={onOpenQrScanner}
                  className="p-1.5 text-gray-600 hover:text-[#d32f2f] hover:bg-red-50 rounded-xl border border-gray-200"
                  title={isTh ? 'สแกน QR Code หน้าถังใหม่' : 'Scan another QR'}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Safety Status Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-sm text-left relative overflow-hidden space-y-6">
              
              {/* Top Banner: Status + Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {activeUnit.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#d32f2f] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                      {activeUnit.assetId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold">
                    📍 {isTh ? activeUnit.buildingTh || activeUnit.building : activeUnit.building} • {activeUnit.floor} • {isTh ? activeUnit.roomLocationTh || activeUnit.roomLocation : activeUnit.roomLocation}
                  </p>
                </div>

                {/* Prominent Status Pill */}
                {currentStatusInfo && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${currentStatusInfo.badgeClass}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${currentStatusInfo.dotColor} animate-pulse`} />
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider">{currentStatusInfo.labelTh}</span>
                      <span className="block text-[10px] opacity-80">{currentStatusInfo.labelEn}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Specifications Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isTh ? 'ชนิดถังดับเพลิง' : 'Type'}
                  </span>
                  <p className="text-sm font-extrabold text-gray-900">
                    {currentTypeInfo?.nameTh}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-[#d32f2f] rounded-md">
                    {currentTypeInfo?.badge}
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isTh ? 'ตรวจล่าสุดโดยเจ้าหน้าที่' : 'Last Inspection'}
                  </span>
                  <p className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{activeUnit.lastInspectionDate}</span>
                  </p>
                  <span className="text-[10px] text-gray-500 font-bold block mt-0.5">NFPA 10 Verified</span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isTh ? 'กำหนดตรวจครั้งถัดไป' : 'Next Due Date'}
                  </span>
                  <p className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{activeUnit.nextDueDate}</span>
                  </p>
                  <span className="text-[10px] text-gray-500 font-bold block mt-0.5">{isTh ? 'ตรวจทุก 30 วัน' : '30-Day Routine'}</span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isTh ? 'สถานะความสมบูรณ์' : 'Equipment Health'}
                  </span>
                  <p className="text-sm font-extrabold text-emerald-700">
                    {isTh ? 'เกจเข็มเขียว / ซีลแน่น' : 'Pressure OK / Sealed'}
                  </p>
                  <span className="text-[10px] text-gray-500 font-bold block mt-0.5">{isTh ? 'พร้อมฉีดดับไฟได้ทันที' : 'Emergency Ready'}</span>
                </div>
              </div>

              {/* Fire Classes Capability Card */}
              {currentTypeInfo && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#d32f2f]" />
                    <h4 className="text-xs font-black text-gray-900 uppercase">
                      {isTh ? 'ประสิทธิภาพการดับเพลิงของถังใบนี้:' : 'Extinguishing Capability:'}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    🎯 <strong className="text-gray-900">{isTh ? 'เหมาะสำหรับ:' : 'Effective on:'}</strong> {isTh ? currentTypeInfo.bestForTh : currentTypeInfo.bestForEn}
                  </p>
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
                    ⚠️ {currentTypeInfo.warningTh}
                  </p>
                </div>
              )}

              {/* Primary User Actions Bar */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Button 1: Report Damage / Issue (Public) */}
                <button
                  type="button"
                  onClick={() => onOpenReportIssue(activeUnit)}
                  className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 text-[#d32f2f] font-black text-xs sm:text-sm rounded-2xl border-2 border-red-200 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
                >
                  <AlertTriangle className="w-5 h-5 text-[#d32f2f]" />
                  <span>{isTh ? '🚨 แจ้งปัญหา / ถังชำรุด / สลักหลุด' : 'Report Issue / Damage'}</span>
                </button>

                {/* Button 2: For Safety Staff (Admin Audit) */}
                <button
                  type="button"
                  onClick={() => onRequestAdminLogin('inspect', activeUnit.id)}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{isTh ? '🔒 สำหรับเจ้าหน้าที่: บันทึกตรวจ 7 จุด' : 'Staff: Log 7-Point Audit'}</span>
                </button>

              </div>

            </div>

            {/* Quick 4-Step How to Use (P.A.S.S.) Preview Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-md text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                      {isTh ? 'วิธีใช้ถังดับเพลิงใน 4 ขั้นตอน (P.A.S.S.)' : 'How to Use Fire Extinguisher (P.A.S.S.)'}
                    </h3>
                    <p className="text-xs text-white/80">
                      {isTh ? 'จำง่ายๆ: ดึง - เล็ง - บีบ - ส่าย' : 'Pull • Aim • Squeeze • Sweep'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('emergency_guide')}
                  className="px-3 py-1.5 bg-white text-[#d32f2f] rounded-xl text-xs font-black hover:bg-red-50 transition-colors hidden sm:inline-flex items-center gap-1"
                >
                  <span>{isTh ? 'ดูคู่มือฉบับเต็ม' : 'Full Guide'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                  <span className="text-xl font-black block mb-1">1. P (Pull)</span>
                  <p className="text-xs font-bold">{isTh ? 'ดึงสลักนิรภัย' : 'Pull the Pin'}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{isTh ? 'ดึงสลักและซีลพลาสติกออก' : 'Break the seal'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                  <span className="text-xl font-black block mb-1">2. A (Aim)</span>
                  <p className="text-xs font-bold">{isTh ? 'เล็งไปที่ฐานไฟ' : 'Aim at Base'}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{isTh ? 'ยืนเหนือลม ห่าง 2-3 เมตร' : 'Stand 6-8 ft away'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                  <span className="text-xl font-black block mb-1">3. S (Squeeze)</span>
                  <p className="text-xs font-bold">{isTh ? 'บีบคันโยก' : 'Squeeze Lever'}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{isTh ? 'กดคันโยกเพื่อฉีดน้ำยา' : 'Release agent'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                  <span className="text-xl font-black block mb-1">4. S (Sweep)</span>
                  <p className="text-xs font-bold">{isTh ? 'ส่ายหัวฉีดไปมา' : 'Sweep Side-to-Side'}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{isTh ? 'ส่ายครอบคลุมฐานเพลิง' : 'Cover fire base'}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BROWSE ALL UNITS IN BUILDING */}
        {activeTab === 'all_units' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Search & Building Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTh ? 'ค้นหารหัสถัง, หมายเลขทรัพย์สิน, ตำแหน่งห้อง...' : 'Search units, asset IDs, room locations...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="font-bold text-gray-500 shrink-0">{isTh ? 'เลือกอาคาร:' : 'Building:'}</span>
                <button
                  onClick={() => setSelectedBuilding('all')}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedBuilding === 'all' 
                      ? 'bg-[#d32f2f] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {isTh ? `ทุกอาคาร (${extinguishers.length})` : `All (${extinguishers.length})`}
                </button>
                {buildings.map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBuilding(b)}
                    className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      selectedBuilding === b 
                        ? 'bg-[#d32f2f] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    🏢 {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Extinguishers Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
              {filteredUnits.map((u) => {
                const sInfo = getStatusDisplay(u.status);
                const tInfo = getTypeInfo(u.type);
                const isSelected = activeUnit?.id === u.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUnitState(u);
                      onSelectUnit(u);
                      setActiveTab('unit');
                    }}
                    className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between space-y-3 ${
                      isSelected 
                        ? 'border-[#d32f2f] ring-2 ring-[#d32f2f]/20 shadow-xs' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-base text-gray-900">{u.id}</h4>
                            <span className="text-[10px] font-mono text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                              {u.assetId}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-gray-600 block mt-0.5">
                            {tInfo.nameTh}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sInfo.badgeClass}`}>
                          {sInfo.labelTh.split('•')[0]}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <p className="font-bold text-gray-800">
                          📍 {isTh ? u.buildingTh || u.building : u.building} ({u.floor})
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {isTh ? u.roomLocationTh || u.roomLocation : u.roomLocation}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-bold pt-1">
                          ตรวจล่าสุด: {u.lastInspectionDate}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#d32f2f]">
                      <span>{isTh ? 'ดูข้อมูลละเอียด / แจ้งปัญหา' : 'View Details & Report'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUnits.length === 0 && (
              <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-bold text-gray-700">{isTh ? 'ไม่พบถังดับเพลิงตามเงื่อนไขที่ค้นหา' : 'No extinguishers found'}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBuilding('all');
                  }}
                  className="mt-2 text-xs font-bold text-[#d32f2f] underline"
                >
                  {isTh ? 'ล้างตัวกรองทั้งหมด' : 'Clear all filters'}
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: COMPLETE EMERGENCY & P.A.S.S. GUIDE */}
        {activeTab === 'emergency_guide' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-sm text-left space-y-6 animate-in fade-in">
            
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#d32f2f]" />
                <span>{isTh ? 'คู่มือขั้นตอนการระงับอัคคีภัยเบื้องต้น' : 'Emergency Fire Response & Evacuation'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'ข้อปฏิบัติตามมาตรฐานความปลอดภัยสากล NFPA' : 'NFPA Certified Emergency Guidelines'}
              </p>
            </div>

            {/* Step by step P.A.S.S. */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-gray-800">{isTh ? '1. เทคนิคการใช้ถังดับเพลิง P.A.S.S.' : '1. P.A.S.S. Technique'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#d32f2f] font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-xs">P</span>
                    <span>PULL - ดึงสลักนิรภัย</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    ดึงสลักล็อกที่คันบีบออกให้ซีลพลาสติกขาด เพื่อให้กลไกคันบีบพร้อมทำงาน
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#d32f2f] font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-xs">A</span>
                    <span>AIM - เล็งไปที่ฐานเพลิง</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    เล็งปากกระบอกฉีดไปที่ <strong>โคนต้นเพลิง</strong> (ห้ามเล็งที่เปลวไฟด้านบน) ยืนเหนือลม ห่างประมาณ 2 - 3 เมตร
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#d32f2f] font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-xs">S</span>
                    <span>SQUEEZE - บีบคันโยก</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    กดคันบีบด้านบนลงอย่างมั่นคง เพื่อปลดปล่อยสารดับเพลิงออกมาอย่างต่อเนื่อง
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#d32f2f] font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-xs">S</span>
                    <span>SWEEP - ส่ายหัวฉีดไปมา</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    ส่ายหัวฉีดจากซ้ายไปขวาให้ทั่วบริเวณฐานเพลิงจนกระทั่งไฟดับสนิท และเฝ้าระวังการประทุซ้ำ
                  </p>
                </div>
              </div>
            </div>

            {/* Fire Classification Matrix */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-black text-gray-800">{isTh ? '2. ประเภทของเพลิง (Fire Classification)' : '2. Fire Classes'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">Class A • ไฟจากเชื้อเพลิงทั่วไป</span>
                  <p className="text-gray-600 text-[11px]">ไม้, ผ้า, กระดาษ, พลาสติก, ขยะ</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-md inline-block">Class B • ของเหลวและก๊าซไวไฟ</span>
                  <p className="text-gray-600 text-[11px]">น้ำมัน, ทินเนอร์, สี, ก๊าซ LPG</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-block">Class C • ไฟจากอุปกรณ์ไฟฟ้า</span>
                  <p className="text-gray-600 text-[11px]">ตู้ควบคุมไฟ, มอเตอร์, เซิร์ฟเวอร์</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block">Class K • ไฟในครัว</span>
                  <p className="text-gray-600 text-[11px]">น้ำมันพืช, ไขมันสัตว์, กระทะทอด</p>
                </div>
              </div>
            </div>

            {/* Evacuation Guidelines */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <h5 className="font-black flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{isTh ? 'ข้อควรระวังสำคัญเมื่อเกิดเพลิงไหม้ขนาดใหญ่:' : 'Critical Evacuation Rules:'}</span>
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>หากไฟมีขนาดใหญ่กว่าความสูงคน หรือมีควันหนาทึบ <strong>ให้อพยพทันที ห้ามพยายามดับเพลิงคนเดียว</strong></li>
                <li>ก้มตัวให้ต่ำเพื่อหลบควันไฟ และใช้ผ้าชุบน้ำปิดจมูก</li>
                <li><strong>ห้ามใช้ลิฟต์โดยสารเด็ดขาด</strong> ให้ใช้บันไดหนีไฟเท่านั้น</li>
                <li>เมื่อออกจากอาคารได้แล้ว ให้ไปยังจุดรวมพล (Assembly Point) และแจ้งชื่อทันที</li>
              </ul>
            </div>

          </div>
        )}

        {/* TAB 4: CONTACTS & EMERGENCY DIRECTORY */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-sm text-left space-y-6 animate-in fade-in">
            
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#d32f2f]" />
                <span>{isTh ? 'เบอร์โทรศัพท์ฉุกเฉินและหน่วยงานรับผิดชอบ' : 'Emergency Directory & Safety Hotlines'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'กดเพื่อโทรออกหาหน่วยงานที่เกี่ยวข้องได้ทันที' : 'One-tap dial emergency services'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <a
                href="tel:199"
                className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-300 rounded-2xl flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-red-600 uppercase">Emergency Hot Line</span>
                  <h4 className="text-base font-black text-gray-900">199 ดับเพลิงและกู้ภัย</h4>
                  <p className="text-xs text-gray-600">สถานีดับเพลิงส่วนกลาง 24 ชั่วโมง</p>
                </div>
                <div className="p-3 bg-[#d32f2f] text-white rounded-xl group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </a>

              <a
                href="tel:1669"
                className="p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Medical Ambulance</span>
                  <h4 className="text-base font-black text-gray-900">1669 ศูนย์การแพทย์ฉุกเฉิน</h4>
                  <p className="text-xs text-gray-600">กู้ชีพ / รถพยาบาลฉุกเฉิน</p>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </a>

            </div>

            {/* Quick Report Issue Direct Button */}
            <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-black text-gray-900">
                  {isTh ? 'พบถังดับเพลิงในอาคารมีปัญหาหรือไม่พร้อมใช้?' : 'Found a damaged extinguisher?'}
                </h5>
                <p className="text-[11px] text-gray-600">
                  {isTh ? 'แจ้งปัญหาผ่านระบบเพื่อให้ทีมช่างเข้าตรวจสอบและเปลี่ยนถังทันที' : 'Submit a report so our safety team can replace or service it.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenReportIssue()}
                className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 justify-center"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTh ? 'แจ้งถังชำรุด' : 'Report Issue'}</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-[#d32f2f]" />
            <span>RT-Fire Safety Inspection System (NFPA 10 Standard)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRequestAdminLogin()}
              className="text-[#d32f2f] font-bold hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>{isTh ? 'เข้าสู่ระบบสำหรับเจ้าหน้าที่' : 'Staff Admin Login'}</span>
            </button>
            <span>•</span>
            <span>Version 2.5</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
