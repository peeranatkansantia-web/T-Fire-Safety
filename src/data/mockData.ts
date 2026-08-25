import { ExtinguisherUnit, InspectionRecord, BuildingCompliance, ActivityLog, UserProfile } from '../types';

export const initialProfile: UserProfile = {
  name: 'Somchai Jaidee',
  nameTh: 'นายสมชาย ใจดี',
  jobTitle: 'Safety & Environment Officer',
  jobTitleTh: 'เจ้าหน้าที่บริหารงานทั่วไป / ตรวจเช็กความปลอดภัย',
  email: 'somchai@korat-health.go.th',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  mfaEnabled: true,
  department: 'Nakhon Ratchasima Provincial Public Health Office',
  departmentTh: 'สำนักงานสาธารณสุขจังหวัดนครราชสีมา',
};

export const initialExtinguishers: ExtinguisherUnit[] = [];

export const initialInspectionRecords: InspectionRecord[] = [];

export const initialBuildingCompliance: BuildingCompliance[] = [];

export const initialActivityLogs: ActivityLog[] = [];

export const monthlyTrendData = [
  { month: 'Jan', monthTh: 'ม.ค.', completed: 180, projected: 200 },
  { month: 'Feb', monthTh: 'ก.พ.', completed: 220, projected: 210 },
  { month: 'Mar', monthTh: 'มี.ค.', completed: 270, projected: 250 },
  { month: 'Apr', monthTh: 'เม.ย.', completed: 195, projected: 220 },
  { month: 'May', monthTh: 'พ.ค.', completed: 245, projected: 240 },
  { month: 'Jun', monthTh: 'มิ.ย.', completed: 290, projected: 280 },
];
