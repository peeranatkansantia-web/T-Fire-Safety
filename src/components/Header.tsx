import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Globe, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode,
  Check,
  Info,
  CheckCheck,
  Trash2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Language, UserProfile, ExtinguisherUnit, ActivityLog } from '../types';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  profile: UserProfile;
  onOpenNewInspection: () => void;
  onOpenNewUnit: () => void;
  onOpenQrScanner: () => void;
  onOpenManual?: () => void;
  onSwitchToPublicView?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  extinguishers?: ExtinguisherUnit[];
  activityLogs?: ActivityLog[];
  onViewUnitDetail?: (unit: ExtinguisherUnit) => void;
  firebaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  profile,
  onOpenNewInspection,
  onOpenNewUnit,
  onOpenQrScanner,
  onOpenManual,
  onSwitchToPublicView,
  searchQuery,
  setSearchQuery,
  extinguishers = [],
  activityLogs = [],
  onViewUnitDetail,
  firebaseConnected = true,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [clearedNotifIds, setClearedNotifIds] = useState<string[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'alert' | 'activity'>('all');

  const isTh = lang === 'th';

  // Real-time notifications generated ONLY from actual user activity logs
  const computedNotifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      type: 'error' | 'warning' | 'success' | 'info';
      unitId?: string;
      category: 'alert' | 'activity';
    }> = [];

    // Real-time Activity Logs triggered by actual user operations
    activityLogs.forEach(log => {
      list.push({
        id: `notif-act-${log.id}`,
        title: isTh ? log.titleTh : log.title,
        desc: isTh 
          ? `สถานที่: ${log.locationTh} (รหัส: ${log.unitId})` 
          : `Location: ${log.location} (Ref: ${log.unitId})`,
        time: isTh ? log.timestampTh : log.timestamp,
        type: log.severity === 'error' ? 'error' : log.severity === 'warning' ? 'warning' : 'success',
        unitId: log.unitId,
        category: log.severity === 'error' || log.severity === 'warning' ? 'alert' : 'activity',
      });
    });

    return list.filter(item => !clearedNotifIds.includes(item.id));
  }, [activityLogs, isTh, clearedNotifIds]);

  const unreadCount = computedNotifications.filter(n => !readNotifIds.includes(n.id)).length;

  const filteredNotifications = computedNotifications.filter(n => {
    if (notifFilter === 'alert') return n.category === 'alert';
    if (notifFilter === 'activity') return n.category === 'activity';
    return true;
  });

  const handleMarkAllRead = () => {
    setReadNotifIds(computedNotifications.map(n => n.id));
  };

  const handleClearAll = () => {
    setClearedNotifIds(computedNotifications.map(n => n.id));
  };

  const handleNotifClick = (n: typeof computedNotifications[0]) => {
    if (!readNotifIds.includes(n.id)) {
      setReadNotifIds(prev => [...prev, n.id]);
    }
    if (n.unitId && onViewUnitDetail && extinguishers) {
      const found = extinguishers.find(u => u.id.toLowerCase() === n.unitId?.toLowerCase());
      if (found) {
        onViewUnitDetail(found);
        setShowNotifications(false);
      }
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d32f2f] to-[#af101a] text-white flex items-center justify-center shadow-md shadow-red-900/10 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-gray-900 leading-tight flex items-center gap-2">
              RT-Fire Safety <span className="text-[#d32f2f] text-xs font-semibold uppercase px-2 py-0.5 bg-red-50 rounded-full border border-red-200">PRO</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {isTh ? 'ระบบจัดการและตรวจสอบอุปกรณ์ป้องกันอัคคีภัย' : 'Fire Safety Equipment Management Suite'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTh ? 'ค้นหาถังดับเพลิง, รหัสอุปกรณ์, หรือตำแหน่งอาคาร...' : 'Search units, asset IDs, locations...'}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-sm text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 focus:border-[#d32f2f] transition-all"
            />
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* QR Scanner Quick Trigger */}
          <button
            id="header-qr-scanner-btn"
            onClick={onOpenQrScanner}
            title={isTh ? 'สแกน QR Code อุปกรณ์' : 'Scan Unit QR'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200/80 active:bg-gray-200 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4 text-[#d32f2f]" />
            <span className="hidden lg:inline">{isTh ? 'สแกน QR' : 'Scan QR'}</span>
          </button>

          {/* Quick Action Buttons */}
          <button
            id="header-new-inspection-btn"
            onClick={onOpenNewInspection}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#d32f2f] hover:bg-[#af101a] active:bg-[#900c14] rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isTh ? 'บันทึกการตรวจใหม่' : 'New Inspection'}</span>
          </button>

          {/* Firebase Cloud Sync Status */}
          <div 
            title={firebaseConnected ? (isTh ? 'เชื่อมต่อ Firebase Cloud Firestore สำเร็จ (เรียลไทม์)' : 'Connected to Firebase Cloud Firestore (Real-time)') : (isTh ? 'กำลังเชื่อมต่อ Cloud...' : 'Connecting to Cloud...')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
              firebaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-emerald-500 shadow-2xs shadow-emerald-500/50' : 'bg-amber-500'}`} />
            <span>{firebaseConnected ? 'Cloud Sync' : 'Connecting'}</span>
          </div>

          {/* Language Switcher */}
          <button
            id="header-language-toggle-btn"
            onClick={() => setLang(isTh ? 'en' : 'th')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-lg border border-gray-200 transition-colors"
            title={isTh ? 'สลับเป็น ภาษาอังกฤษ' : 'Switch to Thai'}
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Switch to Public View Button */}
          {onSwitchToPublicView && (
            <button
              id="header-public-view-btn"
              onClick={onSwitchToPublicView}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#d32f2f] bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              title={isTh ? 'สลับไปมุมมองบุคคลทั่วไป / ประชาชน' : 'Switch to Public / Employee Portal'}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#d32f2f]" />
              <span className="hidden sm:inline">{isTh ? 'หน้าคนทั่วไป' : 'Public View'}</span>
            </button>
          )}

          {/* User Manual Quick Button */}
          {onOpenManual && (
            <button
              id="header-manual-btn"
              onClick={onOpenManual}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
              title={isTh ? 'คู่มือการใช้งานระบบ' : 'User Manual'}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#d32f2f]" />
              <span className="hidden sm:inline">{isTh ? 'คู่มือ' : 'Guide'}</span>
            </button>
          )}

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isTh ? 'การแจ้งเตือน' : 'Notifications'}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#d32f2f] text-white rounded-full ring-2 ring-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div id="header-notifications-popover" className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                
                {/* Popover Header */}
                <div className="px-4 pb-2.5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-900">
                        {isTh ? 'การแจ้งเตือนระบบจริง' : 'Real-time Notifications'}
                      </h3>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} {isTh ? 'ใหม่' : 'New'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                          {isTh ? 'อ่านแล้วทั้งหมด' : 'All Read'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-gray-500 hover:text-[#d32f2f] font-medium transition-colors flex items-center gap-1"
                          title={isTh ? 'ทำเป็นอ่านแล้วทั้งหมด' : 'Mark all as read'}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isTh ? 'อ่านแล้ว' : 'Read'}</span>
                        </button>
                      )}
                      {computedNotifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors p-1 rounded-md"
                          title={isTh ? 'ล้างการแจ้งเตือนทั้งหมด' : 'Clear all'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg text-[11px] font-semibold text-gray-600">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`flex-1 py-1 rounded-md transition-all text-center ${notifFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}
                    >
                      {isTh ? `ทั้งหมด (${computedNotifications.length})` : `All (${computedNotifications.length})`}
                    </button>
                    <button
                      onClick={() => setNotifFilter('alert')}
                      className={`flex-1 py-1 rounded-md transition-all text-center ${notifFilter === 'alert' ? 'bg-white text-[#d32f2f] shadow-xs font-bold' : 'hover:text-gray-900'}`}
                    >
                      {isTh ? 'เตือนด่วน' : 'Alerts'}
                    </button>
                    <button
                      onClick={() => setNotifFilter('activity')}
                      className={`flex-1 py-1 rounded-md transition-all text-center ${notifFilter === 'activity' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}
                    >
                      {isTh ? 'กิจกรรม' : 'Activity'}
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 space-y-1">
                      <Info className="w-6 h-6 mx-auto text-gray-300" />
                      <p className="text-xs font-semibold text-gray-600">
                        {isTh ? 'ไม่มีการแจ้งเตือนในขณะนี้' : 'No notifications'}
                      </p>
                      <p className="text-[11px]">
                        {isTh ? 'อุปกรณ์และกิจกรรมทั้งหมดเป็นปัจจุบัน' : 'All equipment and logs are up to date'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const isRead = readNotifIds.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer relative group ${!isRead ? 'bg-red-50/20' : ''}`}
                        >
                          {!isRead && (
                            <span className="absolute left-1 top-4 w-1.5 h-1.5 bg-[#d32f2f] rounded-full"></span>
                          )}

                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                          {n.type === 'error' && <AlertTriangle className="w-4 h-4 text-[#d32f2f] shrink-0 mt-0.5" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs ${!isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                {n.title}
                              </p>
                              {n.unitId && (
                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed truncate">
                              {n.desc}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}
          </div>

          {/* User Profile Avatar Toggle */}
          <div className="relative">
            <button
              id="header-profile-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#d32f2f]/20"
              />
              <div className="hidden xl:block text-left pr-1">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {isTh ? profile.nameTh : profile.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate max-w-[130px]">
                  {isTh ? profile.jobTitleTh : profile.jobTitle}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            {showProfileMenu && (
              <div id="header-profile-menu" className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{isTh ? profile.nameTh : profile.name}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {isTh ? profile.departmentTh : profile.department}
                  </span>
                </div>
                <div className="py-1 text-xs text-gray-700">
                  <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                    <span>{isTh ? 'สถานะยืนยันตัวตน MFA' : 'MFA Authentication'}</span>
                    <span className="flex items-center text-emerald-600 font-semibold gap-1">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                  {onOpenManual && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenManual();
                      }}
                      className="w-full px-4 py-2 hover:bg-red-50 text-left flex items-center gap-2 text-gray-700 hover:text-[#d32f2f] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#d32f2f]" />
                      <span>{isTh ? 'คู่มือการใช้งานระบบ (User Manual)' : 'System User Manual'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

