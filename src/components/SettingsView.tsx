import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Bell, 
  Save, 
  Check, 
  Lock, 
  Smartphone, 
  Building2,
  Camera,
  MessageSquare,
  Send,
  Download,
  Upload,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UserProfile, Language, LineNotifyConfig } from '../types';
import { LineNotificationModal } from './modals/LineNotificationModal';

interface SettingsViewProps {
  lang: Language;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  lineConfig?: LineNotifyConfig;
  setLineConfig?: React.Dispatch<React.SetStateAction<LineNotifyConfig>>;
  onExportFullBackup?: () => void;
  onImportFullBackup?: (data: any) => void;
  onResetDemoData?: () => void;
  extinguishersCount?: number;
  recordsCount?: number;
  firebaseConnected?: boolean;
  onSyncFirestore?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  profile,
  setProfile,
  lineConfig = {
    enabled: true,
    channelAccessToken: '',
    targetGroupName: 'RT-Fire Safety Officer Group',
    alertOnFailed: true,
    alertOnMaintenance: true,
    alertOnExpiring: true,
  },
  setLineConfig,
  onExportFullBackup,
  onImportFullBackup,
  onResetDemoData,
  extinguishersCount = 12,
  recordsCount = 8,
  firebaseConnected = true,
  onSyncFirestore,
}) => {
  const isTh = lang === 'th';

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mfa, setMfa] = useState(profile.mfaEnabled);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isTestLineOpen, setIsTestLineOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // LINE Config local state
  const [localLineConfig, setLocalLineConfig] = useState<LineNotifyConfig>(lineConfig);

  const [formData, setFormData] = useState({
    name: profile.name,
    nameTh: profile.nameTh,
    jobTitle: profile.jobTitle,
    jobTitleTh: profile.jobTitleTh,
    email: profile.email,
    department: profile.department,
    departmentTh: profile.departmentTh,
    avatarUrl: profile.avatarUrl,
  });

  useEffect(() => {
    setFormData({
      name: profile.name,
      nameTh: profile.nameTh,
      jobTitle: profile.jobTitle,
      jobTitleTh: profile.jobTitleTh,
      email: profile.email,
      department: profile.department,
      departmentTh: profile.departmentTh,
      avatarUrl: profile.avatarUrl,
    });
    setMfa(profile.mfaEnabled);
  }, [profile]);

  useEffect(() => {
    setLocalLineConfig(lineConfig);
  }, [lineConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: formData.name,
      nameTh: formData.nameTh,
      jobTitle: formData.jobTitle,
      jobTitleTh: formData.jobTitleTh,
      email: formData.email,
      department: formData.department,
      departmentTh: formData.departmentTh,
      avatarUrl: formData.avatarUrl,
      mfaEnabled: mfa,
    }));

    if (setLineConfig) {
      setLineConfig(localLineConfig);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportFullBackup) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImportFullBackup(parsed);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 4000);
        } catch (err) {
          alert(isTh ? 'ไฟล์ JSON ไม่ถูกต้อง หรือเสียหาย' : 'Invalid or corrupt JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualSync = () => {
    setSyncingCloud(true);
    setTimeout(() => {
      setSyncingCloud(false);
      setLastSyncTime(new Date().toLocaleTimeString(isTh ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#d32f2f]" />
            {isTh ? 'การตั้งค่าระบบ RT-Fire Safety' : 'RT-Fire Safety System Settings'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isTh ? 'ปรับแต่งข้อมูลผู้ใช้งาน บัญชีเจ้าหน้าที่ การเชื่อมต่อ LINE Notify และการสำรองข้อมูล' : 'Configure officer credentials, LINE alerts, camera verification, and data persistence'}
          </p>
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-[11px]">
            <p className="font-bold text-emerald-900 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTh ? 'สถานะ: ข้อมูลเชื่อมต่อแล้ว' : 'Cloud Status: Online'}</span>
            </p>
            <p className="text-emerald-700 text-[10px]">{isTh ? `บันทึกล่าสุด ${lastSyncTime}` : `Synced ${lastSyncTime}`}</p>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncingCloud}
            className="p-1.5 hover:bg-emerald-100 rounded-xl text-emerald-800 transition-colors ml-1"
            title={isTh ? 'ซิงค์ข้อมูลเดี๋ยวนี้' : 'Sync now'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingCloud ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">
              {isTh ? 'บันทึกการตั้งค่าและข้อมูลทั้งหมดเรียบร้อยแล้ว' : 'Settings and preferences saved successfully.'}
            </span>
          </div>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="font-bold">
            {isTh ? 'กู้คืนและนำเข้าข้อมูลชุดสมบูรณ์สำเร็จแล้ว!' : 'Backup restored successfully!'}
          </span>
        </div>
      )}

      {/* Section 1: User Profile Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <h3 className="font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
          <User className="w-5 h-5 text-[#d32f2f]" />
          <span>{isTh ? 'ข้อมูลเจ้าหน้าที่ตรวจสอบ (Inspector Profile)' : 'Inspector Profile'}</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          
          <div className="flex items-center gap-4 pb-2">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#d32f2f]/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-100 text-[#d32f2f] font-bold text-xl flex items-center justify-center">
                  {profile.initials}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">{isTh ? formData.nameTh : formData.name}</p>
              <p className="text-gray-500">{isTh ? formData.jobTitleTh : formData.jobTitle}</p>
              <span className="inline-block mt-1 bg-red-50 text-[#d32f2f] px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                Badge {profile.badgeNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'ชื่อ-นามสกุล (ภาษาไทย)' : 'Full Name (Thai)'}
              </label>
              <input
                type="text"
                value={formData.nameTh}
                onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'ชื่อ-นามสกุล (English)' : 'Full Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'ตำแหน่งงาน (ภาษาไทย)' : 'Job Title (Thai)'}
              </label>
              <input
                type="text"
                value={formData.jobTitleTh}
                onChange={(e) => setFormData({ ...formData, jobTitleTh: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'ตำแหน่งงาน (English)' : 'Job Title (English)'}
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'อีเมลทางการ' : 'Official Email'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'แผนก/หน่วยงาน' : 'Department / Division'}
              </label>
              <input
                type="text"
                value={isTh ? formData.departmentTh : formData.department}
                onChange={(e) => {
                  if (isTh) setFormData({ ...formData, departmentTh: e.target.value });
                  else setFormData({ ...formData, department: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                {isTh ? 'รูปภาพโปรไฟล์ (Avatar URL / Upload File)' : 'Avatar Image (URL or File)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder={isTh ? 'ระบุ URL หรือกดปุ่มอัปโหลดรูป' : 'Paste URL or browse image file'}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-mono text-[11px]"
                />
                <label className="cursor-pointer px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#d32f2f] border border-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>{isTh ? 'เลือกรูป' : 'Browse'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isTh ? 'บันทึกการเปลี่ยนแปลงโปรไฟล์' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: LINE Notify & Team Alert Suite */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#06c755]/10 text-[#06c755] rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {isTh ? 'การเชื่อมต่อการแจ้งเตือน LINE Notify / Webhook' : 'LINE Notify & Safety Alerts'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'ส่งการแจ้งเตือนอัตโนมัติเมื่อพบถังดับเพลิงชำรุด หรือครบกำหนดตรวจเช็ก' : 'Dispatch automatic safety reports to LINE Groups'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTestLineOpen(true)}
            className="px-3.5 py-2 bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTh ? '📲 ทดสอบส่งข้อความ LINE' : 'Test LINE Message'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'ชื่อกลุ่ม LINE / ห้องแชทปลายทาง' : 'Target LINE Group / Room Name'}
            </label>
            <input
              type="text"
              value={localLineConfig.targetGroupName}
              onChange={(e) => setLocalLineConfig({ ...localLineConfig, targetGroupName: e.target.value })}
              placeholder={isTh ? 'กลุ่มความปลอดภัยอาคาร / จป. ประจำการ' : 'Fire Safety Response Team'}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06c755]/30 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isTh ? 'LINE Webhook URL / Access Token (ถ้ามี)' : 'LINE Notify Token / Webhook URL'}
            </label>
            <input
              type="password"
              value={localLineConfig.channelAccessToken}
              onChange={(e) => setLocalLineConfig({ ...localLineConfig, channelAccessToken: e.target.value })}
              placeholder="https://notify-api.line.me/api/notify หรือ Webhook..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06c755]/30 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* LINE Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900 text-xs">{isTh ? 'ส่งแจ้งเตือนทันทีเมื่อตรวจพบถังชำรุด (Failed)' : 'Instant Alert on Failed Unit'}</p>
              <p className="text-[11px] text-gray-500">{isTh ? 'ส่งข้อมูลถัง เลขทะเบียน และสถานที่เพื่อให้ช่างเข้าเปลี่ยนทันที' : 'Dispatches location and unit ID immediately'}</p>
            </div>
            <button
              type="button"
              onClick={() => setLocalLineConfig({ ...localLineConfig, alertOnFailed: !localLineConfig.alertOnFailed })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                localLineConfig.alertOnFailed ? 'bg-[#06c755]' : 'bg-gray-300'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                localLineConfig.alertOnFailed ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900 text-xs">{isTh ? 'ส่งแจ้งเตือนเมื่อถังต้องส่งซ่อมบำรุง (Maintenance)' : 'Alert on Maintenance Required'}</p>
              <p className="text-[11px] text-gray-500">{isTh ? 'แจ้งเตือนเมื่อเข็มเกจเริ่มตก หรือสายฉีดมีรอยปริ' : 'Notifies caretakers to schedule servicing'}</p>
            </div>
            <button
              type="button"
              onClick={() => setLocalLineConfig({ ...localLineConfig, alertOnMaintenance: !localLineConfig.alertOnMaintenance })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                localLineConfig.alertOnMaintenance ? 'bg-[#06c755]' : 'bg-gray-300'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                localLineConfig.alertOnMaintenance ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Data Management & Cloud Backup Suite */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#d32f2f]" />
            <span>{isTh ? 'การจัดการฐานข้อมูลและการสำรองไฟล์ (Cloud & Backup)' : 'Database & Backup Persistence'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            firebaseConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-emerald-500 shadow-2xs shadow-emerald-500/50' : 'bg-amber-500'}`} />
            <span>{firebaseConnected ? (isTh ? '🔥 Firebase เชื่อมต่อแล้ว' : '🔥 Firebase Connected') : (isTh ? 'กำลังเชื่อมต่อ...' : 'Connecting...')}</span>
          </div>
        </h3>

        {/* Firebase Cloud Firestore Active Info Card */}
        <div className="p-4 bg-gradient-to-r from-red-50/70 via-orange-50/40 to-white rounded-2xl border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#d32f2f] text-white rounded-xl shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-gray-900">Google Cloud Firestore Database</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Real-time Sync Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {isTh 
                  ? 'ข้อมูลถังดับเพลิง บันทึกการตรวจ 7 จุด และข้อมูลอาคารถูกซิงค์อัตโนมัติลงฐานข้อมูล Firestore ปลอดภัยและเข้าถึงได้จากทุกอุปกรณ์'
                  : 'Extinguisher units, 7-point records, and building compliance are synchronized live to Cloud Firestore.'}
              </p>
            </div>
          </div>

          {onSyncFirestore && (
            <button
              type="button"
              disabled={syncingCloud}
              onClick={async () => {
                setSyncingCloud(true);
                try {
                  await onSyncFirestore();
                  setLastSyncTime(isTh ? 'เมื่อสักครู่นี้' : 'Just now');
                } finally {
                  setTimeout(() => setSyncingCloud(false), 500);
                }
              }}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#d32f2f] ${syncingCloud ? 'animate-spin' : ''}`} />
              <span>{syncingCloud ? (isTh ? 'กำลังซิงค์...' : 'Syncing...') : (isTh ? 'ซิงค์ข้อมูลเดี๋ยวนี้' : 'Sync Now')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Full JSON Backup Export */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-red-100 text-[#d32f2f] flex items-center justify-center mb-2">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{isTh ? 'สำรองข้อมูลทั้งหมด (.JSON)' : 'Full System Backup (JSON)'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {isTh ? `ส่งออกถัง ${extinguishersCount} จุด, บันทึก ${recordsCount} รายการ และอาคารทั้งหมด` : `Export all ${extinguishersCount} units, logs & buildings`}
              </p>
            </div>
            <button
              type="button"
              onClick={onExportFullBackup}
              className="w-full py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isTh ? 'ดาวน์โหลดไฟล์ Backup' : 'Export JSON'}</span>
            </button>
          </div>

          {/* Card 2: Restore JSON Backup */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{isTh ? 'กู้คืนข้อมูลจากไฟล์ Backup' : 'Restore from JSON File'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {isTh ? 'นำเข้าไฟล์ .json เพื่อกู้คืนข้อมูลถังดับเพลิงและบันทึกประวัติ' : 'Import previously exported .json file to restore data'}
              </p>
            </div>
            <label className="cursor-pointer w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTh ? 'เลือกไฟล์เพื่อกู้คืน' : 'Upload Backup'}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJsonFile}
              />
            </label>
          </div>

          {/* Card 3: Reset Dataset */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{isTh ? 'รีเซ็ตข้อมูลตัวอย่างมาตรฐาน' : 'Reset to Standard Demo'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {isTh ? 'คืนค่าระบบกลับสู่ชุดข้อมูลมาตรฐานของอาคาร' : 'Restore default extinguishers and logs dataset'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(isTh ? 'คุณต้องการรีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นใช่หรือไม่?' : 'Are you sure you want to reset to demo dataset?')) {
                  if (onResetDemoData) onResetDemoData();
                }
              }}
              className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isTh ? 'รีเซ็ตข้อมูล' : 'Reset Data'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Section 4: Security & MFA */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <h3 className="font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#d32f2f]" />
          <span>{isTh ? 'ความปลอดภัยและการยืนยันตัวตน' : 'Security & Multi-Factor Auth'}</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {isTh ? 'การยืนยันตัวตนแบบหลายปัจจัย (MFA / 2FA)' : 'Two-Factor Authentication (MFA)'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isTh ? 'เพิ่มความปลอดภัยด้วยรหัสผ่านแบบใช้ครั้งเดียวผ่านแอป Authenticator' : 'Protect credentials with hardware or TOTP key'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMfa(!mfa)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                mfa ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                mfa ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Test LINE modal */}
      <LineNotificationModal
        isOpen={isTestLineOpen}
        onClose={() => setIsTestLineOpen(false)}
        lang={lang}
      />

    </div>
  );
};
