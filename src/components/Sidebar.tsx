import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  ClipboardList, 
  BarChart3, 
  Settings,
  Building2,
  Map,
  BookOpen
} from 'lucide-react';
import { TabType, Language } from '../types';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  lang: Language;
  onOpenFacilityMap: () => void;
  onSwitchToPublicView?: () => void;
  extinguishersCount?: number;
  pendingReportsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  onOpenFacilityMap,
  onSwitchToPublicView,
  extinguishersCount = 0,
  pendingReportsCount = 0,
}) => {
  const isTh = lang === 'th';

  const navItems = [
    {
      id: 'dashboard' as TabType,
      labelTh: 'แผงควบคุม',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'extinguishers' as TabType,
      labelTh: 'รายการอุปกรณ์',
      labelEn: 'Extinguishers',
      icon: Flame,
      badge: extinguishersCount.toLocaleString(),
    },
    {
      id: 'records' as TabType,
      labelTh: 'บันทึกการตรวจสอบ',
      labelEn: 'Inspection Records',
      icon: ClipboardList,
    },
    {
      id: 'reports' as TabType,
      labelTh: 'รายงานและสถิติ',
      labelEn: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as TabType,
      labelTh: 'การตั้งค่าระบบ',
      labelEn: 'Settings',
      icon: Settings,
    },
    {
      id: 'guide' as TabType,
      labelTh: 'คู่มือการใช้งาน',
      labelEn: 'User Manual',
      icon: BookOpen,
    },
  ];

  return (
    <>
      {/* Desktop Left Sidebar Navigation */}
      <aside id="desktop-sidebar" className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 min-h-[calc(100vh-65px)] p-4 justify-between">
        
        <div className="space-y-6">
          
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isTh ? 'เมนูหลัก' : 'Main Menu'}
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#d32f2f]/10 text-[#d32f2f] border-l-4 border-[#d32f2f] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#d32f2f]' : 'text-gray-400'}`} />
                      <span>{isTh ? item.labelTh : item.labelEn}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#d32f2f] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Tools & Maps */}
          <div className="space-y-2">
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {isTh ? 'ผังอาคาร & พื้นที่' : 'Facility Maps'}
            </p>
            <button
              id="sidebar-facility-map-btn"
              onClick={onOpenFacilityMap}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-red-50/50 hover:bg-red-50 border border-red-100 transition-colors group"
            >
              <Map className="w-4 h-4 text-[#d32f2f] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-gray-900">{isTh ? 'แผนผังจุดติดตั้งอุปกรณ์' : 'Interactive Map'}</p>
                <p className="text-[10px] text-gray-500">{isTh ? 'พิกัดและตำแหน่งในผัง' : 'Building floor plans'}</p>
              </div>
            </button>

            {onSwitchToPublicView && (
              <button
                id="sidebar-public-view-btn"
                onClick={onSwitchToPublicView}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
              >
                <div className="w-4 h-4 rounded-full bg-red-500/20 text-[#d32f2f] flex items-center justify-center text-[9px] font-black">
                  🌐
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{isTh ? 'มุมมองคนทั่วไป / ประชาชน' : 'Public Portal View'}</p>
                  <p className="text-[10px] text-gray-500">{isTh ? 'หน้าสแกน QR สำหรับพนักงาน' : 'Public scan view'}</p>
                </div>
              </button>
            )}
          </div>

        </div>

        {/* Footer Support Info */}
        <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{isTh ? 'สำนักงานสาธารณสุขจังหวัดนครราชสีมา' : 'Nakhon Ratchasima Health Office'}</span>
          </div>
          <p className="text-[10px] text-gray-400">
            RT-Fire Safety System • Public Health
          </p>
        </div>

      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#d32f2f]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{isTh ? item.labelTh : item.labelEn}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
