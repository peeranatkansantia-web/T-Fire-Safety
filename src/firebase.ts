import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';
import { 
  ExtinguisherUnit, 
  InspectionRecord, 
  BuildingCompliance, 
  ActivityLog, 
  UserProfile, 
  LineNotifyConfig,
  PublicIssueReport
} from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Collection references
export const COLLECTIONS = {
  EXTINGUISHERS: 'extinguishers',
  INSPECTIONS: 'inspections',
  BUILDINGS: 'buildings',
  ACTIVITY_LOGS: 'activityLogs',
  APP_SETTINGS: 'appSettings',
  PUBLIC_REPORTS: 'publicReports',
};

// ---------------------------------------------------------------------------
// Firestore Data Sanitizer (Removes undefined fields to prevent Firestore SDK errors)
// ---------------------------------------------------------------------------

export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Extinguishers CRUD
// ---------------------------------------------------------------------------

export const subscribeToExtinguishers = (
  callback: (units: ExtinguisherUnit[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.EXTINGUISHERS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const units: ExtinguisherUnit[] = [];
      snapshot.forEach((docSnap) => {
        units.push({ ...docSnap.data(), id: docSnap.id } as ExtinguisherUnit);
      });
      callback(units);
    },
    (err) => {
      console.warn('Firestore Extinguishers subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveExtinguisherToFirebase = async (unit: ExtinguisherUnit) => {
  const docRef = doc(db, COLLECTIONS.EXTINGUISHERS, unit.id);
  const sanitized = cleanFirestoreData({ ...unit, updatedAt: new Date().toISOString() });
  await setDoc(docRef, sanitized, { merge: true });
};

export const deleteExtinguisherFromFirebase = async (unitId: string) => {
  const docRef = doc(db, COLLECTIONS.EXTINGUISHERS, unitId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// Inspections CRUD
// ---------------------------------------------------------------------------

export const subscribeToInspections = (
  callback: (records: InspectionRecord[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.INSPECTIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: InspectionRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ ...docSnap.data(), id: docSnap.id } as InspectionRecord);
      });
      // Sort newest first
      records.sort((a, b) => {
        const timeA = new Date(a.rawDate || a.date).getTime();
        const timeB = new Date(b.rawDate || b.date).getTime();
        return timeB - timeA;
      });
      callback(records);
    },
    (err) => {
      console.warn('Firestore Inspections subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const addInspectionToFirebase = async (record: InspectionRecord) => {
  const docRef = doc(db, COLLECTIONS.INSPECTIONS, record.id);
  const sanitized = cleanFirestoreData({ ...record, createdAt: new Date().toISOString() });
  await setDoc(docRef, sanitized, { merge: true });
};

export const deleteInspectionFromFirebase = async (recordId: string) => {
  const docRef = doc(db, COLLECTIONS.INSPECTIONS, recordId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// Buildings CRUD
// ---------------------------------------------------------------------------

export const subscribeToBuildings = (
  callback: (buildings: BuildingCompliance[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.BUILDINGS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const buildings: BuildingCompliance[] = [];
      snapshot.forEach((docSnap) => {
        buildings.push({ ...docSnap.data(), id: docSnap.id } as BuildingCompliance);
      });
      callback(buildings);
    },
    (err) => {
      console.warn('Firestore Buildings subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveBuildingToFirebase = async (building: BuildingCompliance) => {
  const docRef = doc(db, COLLECTIONS.BUILDINGS, building.id);
  const sanitized = cleanFirestoreData(building);
  await setDoc(docRef, sanitized, { merge: true });
};

export const deleteBuildingFromFirebase = async (buildingId: string) => {
  const docRef = doc(db, COLLECTIONS.BUILDINGS, buildingId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// Activity Logs CRUD
// ---------------------------------------------------------------------------

export const subscribeToActivityLogs = (
  callback: (logs: ActivityLog[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ ...docSnap.data(), id: docSnap.id } as ActivityLog);
      });
      callback(logs);
    },
    (err) => {
      console.warn('Firestore ActivityLogs subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const addActivityLogToFirebase = async (log: ActivityLog) => {
  const docRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, log.id);
  const sanitized = cleanFirestoreData(log);
  await setDoc(docRef, sanitized, { merge: true });
};

// ---------------------------------------------------------------------------
// App Settings (Profile & Line Notifications)
// ---------------------------------------------------------------------------

export const subscribeToAppSettings = (
  callback: (settings: { profile?: UserProfile; lineConfig?: LineNotifyConfig }) => void,
  onError?: (error: any) => void
) => {
  const docRef = doc(db, COLLECTIONS.APP_SETTINGS, 'general');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as { profile?: UserProfile; lineConfig?: LineNotifyConfig });
      }
    },
    (err) => {
      console.warn('Firestore AppSettings subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveAppSettingsToFirebase = async (settings: {
  profile?: UserProfile;
  lineConfig?: LineNotifyConfig;
}) => {
  const docRef = doc(db, COLLECTIONS.APP_SETTINGS, 'general');
  const sanitized = cleanFirestoreData({ ...settings, updatedAt: new Date().toISOString() });
  await setDoc(docRef, sanitized, { merge: true });
};

// ---------------------------------------------------------------------------
// Public Issue Reports CRUD
// ---------------------------------------------------------------------------

export const subscribeToPublicReports = (
  callback: (reports: PublicIssueReport[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.PUBLIC_REPORTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const reports: PublicIssueReport[] = [];
      snapshot.forEach((docSnap) => {
        reports.push({ ...docSnap.data(), id: docSnap.id } as PublicIssueReport);
      });
      // Sort newest first
      reports.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(reports);
    },
    (err) => {
      console.warn('Firestore PublicReports subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const addPublicReportToFirebase = async (report: PublicIssueReport) => {
  const docRef = doc(db, COLLECTIONS.PUBLIC_REPORTS, report.id);
  const sanitized = cleanFirestoreData(report);
  await setDoc(docRef, sanitized, { merge: true });
};

export const updatePublicReportInFirebase = async (
  reportOrId: string | PublicIssueReport,
  updates?: Partial<PublicIssueReport>
) => {
  const id = typeof reportOrId === 'string' ? reportOrId : reportOrId.id;
  const data = typeof reportOrId === 'string' ? updates || {} : reportOrId;
  const docRef = doc(db, COLLECTIONS.PUBLIC_REPORTS, id);
  const sanitized = cleanFirestoreData(data);
  await setDoc(docRef, sanitized, { merge: true });
};

export const deletePublicReportFromFirebase = async (reportId: string) => {
  const docRef = doc(db, COLLECTIONS.PUBLIC_REPORTS, reportId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// Full Cloud Synchronization Helper
// ---------------------------------------------------------------------------

export const uploadAllLocalDataToCloud = async (
  extUnits: ExtinguisherUnit[],
  inspRecords: InspectionRecord[],
  bldList: BuildingCompliance[],
  actLogs: ActivityLog[],
  userProf?: UserProfile,
  lineConf?: LineNotifyConfig
) => {
  try {
    const batch = writeBatch(db);

    if (extUnits && extUnits.length > 0) {
      extUnits.forEach((unit) => {
        if (unit && unit.id) {
          const ref = doc(db, COLLECTIONS.EXTINGUISHERS, unit.id);
          const sanitized = cleanFirestoreData({ ...unit, updatedAt: new Date().toISOString() });
          batch.set(ref, sanitized, { merge: true });
        }
      });
    }

    if (inspRecords && inspRecords.length > 0) {
      inspRecords.forEach((record) => {
        if (record && record.id) {
          const ref = doc(db, COLLECTIONS.INSPECTIONS, record.id);
          const sanitized = cleanFirestoreData({ ...record, createdAt: (record as any).createdAt || new Date().toISOString() });
          batch.set(ref, sanitized, { merge: true });
        }
      });
    }

    if (bldList && bldList.length > 0) {
      bldList.forEach((bld) => {
        if (bld && bld.id) {
          const ref = doc(db, COLLECTIONS.BUILDINGS, bld.id);
          const sanitized = cleanFirestoreData(bld);
          batch.set(ref, sanitized, { merge: true });
        }
      });
    }

    if (actLogs && actLogs.length > 0) {
      actLogs.forEach((log) => {
        if (log && log.id) {
          const ref = doc(db, COLLECTIONS.ACTIVITY_LOGS, log.id);
          const sanitized = cleanFirestoreData(log);
          batch.set(ref, sanitized, { merge: true });
        }
      });
    }

    if (userProf || lineConf) {
      const settingsRef = doc(db, COLLECTIONS.APP_SETTINGS, 'general');
      const sanitized = cleanFirestoreData({
        ...(userProf ? { profile: userProf } : {}),
        ...(lineConf ? { lineConfig: lineConf } : {}),
        updatedAt: new Date().toISOString(),
      });
      batch.set(settingsRef, sanitized, { merge: true });
    }

    await batch.commit();
    console.log('Successfully uploaded all data to Cloud Firestore');
    return true;
  } catch (err) {
    console.error('Error uploading local data to Cloud Firestore:', err);
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Helper: Seed Initial Data or sync local storage if cloud is empty
// ---------------------------------------------------------------------------

export const seedInitialDataIfEmpty = async (
  currentExtinguishers: ExtinguisherUnit[],
  currentRecords: InspectionRecord[],
  currentBuildings: BuildingCompliance[],
  currentLogs: ActivityLog[],
  currentProf: UserProfile,
  currentLine: LineNotifyConfig
) => {
  try {
    const extCol = collection(db, COLLECTIONS.EXTINGUISHERS);
    const snap = await getDocs(extCol);

    if (snap.empty) {
      console.log('Firestore is empty. Syncing local dataset to Cloud Firestore...');
      if (currentExtinguishers.length > 0 || currentRecords.length > 0 || currentBuildings.length > 0) {
        await uploadAllLocalDataToCloud(
          currentExtinguishers,
          currentRecords,
          currentBuildings,
          currentLogs,
          currentProf,
          currentLine
        );
      }
    }
  } catch (err) {
    console.warn('Error during Firestore sync/seed check:', err);
  }
};
