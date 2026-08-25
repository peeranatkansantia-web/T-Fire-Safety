export type Language = 'th' | 'en';

export type TabType = 'dashboard' | 'extinguishers' | 'records' | 'reports' | 'settings';

export type ExtinguisherStatus = 'normal' | 'due_soon' | 'expired' | 'critical';

export type ExtinguisherType = 'co2' | 'water_mist' | 'dry_powder' | 'foam' | 'clean_agent';

export interface ExtinguisherUnit {
  id: string; // e.g. FE-2041
  assetId: string;
  building: string;
  buildingTh: string;
  floor: string;
  roomLocation: string;
  roomLocationTh: string;
  type: ExtinguisherType;
  lastInspectionDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  status: ExtinguisherStatus;
  qrCodeUrl?: string;
  photoUrl?: string;
  xPos?: number; // percentage on map blueprint
  yPos?: number; // percentage on map blueprint
  customQrData?: string; // Custom URL or custom data payload embedded in QR
}

export interface InspectionRecord {
  id: string;
  date: string; // e.g. Oct 27, 2023 or 27 ต.ค. 2566
  rawDate: string; // YYYY-MM-DD
  time: string; // e.g. 10:45 AM
  extinguisherId: string;
  inspectorName: string;
  inspectorNameTh: string;
  inspectorBadge: string; // e.g. #882
  inspectorAvatar?: string;
  inspectorInitials: string;
  status: 'passed' | 'failed' | 'maintenance';
  notes: string;
  notesTh: string;
  pressurePsi?: number;
  sealIntact?: boolean;
  photoUrl?: string; // Attached photo evidence
  checkpointDetails?: Record<string, boolean>;
  lineNotified?: boolean;
}

export interface LineNotifyConfig {
  enabled: boolean;
  tokenOrWebhook: string;
  channelName: string;
  notifyOnFailed: boolean;
  notifyOnDueSoon: boolean;
  sendPhoto: boolean;
}

export interface BuildingCompliance {
  id: string;
  name: string;
  nameTh: string;
  location: string;
  locationTh: string;
  assetsCount: number;
  inspectedCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  complianceRate: number; // e.g. 99.5
  floorPlans: string[]; // e.g. ['L1', 'L2', 'L3']
}

export interface ActivityLog {
  id: string;
  timestamp: string; // e.g. "2 hours ago"
  timestampTh: string; // e.g. "2 ชั่วโมงที่แล้ว"
  unitId: string;
  title: string;
  titleTh: string;
  location: string;
  locationTh: string;
  severity: 'normal' | 'warning' | 'error';
}

export interface CustomMapPin {
  id: string;
  title: string;
  description?: string;
  xPos: number; // percentage 0-100
  yPos: number; // percentage 0-100
  color: string; // e.g. 'red', 'emerald', 'amber', 'blue', 'purple', 'cyan', 'pink'
  iconType?: 'flame' | 'shield' | 'alert' | 'check' | 'map_pin' | 'info';
  unitId?: string; // Optional link to an ExtinguisherUnit
}

export interface CustomFloorPlan {
  id: string;
  name: string;
  imageUrl: string;
}

export interface UserProfile {
  name: string;
  nameTh: string;
  jobTitle: string;
  jobTitleTh: string;
  email: string;
  avatarUrl: string;
  mfaEnabled: boolean;
  department: string;
  departmentTh: string;
}

export interface FilterOptions {
  building: string;
  type: string;
  status: string;
  searchQuery: string;
}
