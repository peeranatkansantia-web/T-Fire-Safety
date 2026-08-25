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
  LineNotifyConfig 
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
};

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
  await setDoc(docRef, { ...unit, updatedAt: new Date().toISOString() }, { merge: true });
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
  await setDoc(docRef, { ...record, createdAt: new Date().toISOString() }, { merge: true });
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
  await setDoc(docRef, building, { merge: true });
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
  await setDoc(docRef, log, { merge: true });
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
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
};

// ---------------------------------------------------------------------------
// Helper: Seed Initial Data if database is empty
// ---------------------------------------------------------------------------

export const seedInitialDataIfEmpty = async (
  initialExtinguishers: ExtinguisherUnit[],
  initialRecords: InspectionRecord[],
  initialBuildings: BuildingCompliance[],
  initialLogs: ActivityLog[],
  initialProf: UserProfile,
  initialLine: LineNotifyConfig
) => {
  try {
    const extCol = collection(db, COLLECTIONS.EXTINGUISHERS);
    const snap = await getDocs(extCol);

    if (snap.empty && initialExtinguishers.length > 0) {
      console.log('Seeding initial fire safety data to Firestore...');
      const batch = writeBatch(db);

      // Seed Extinguishers
      initialExtinguishers.forEach((unit) => {
        const ref = doc(db, COLLECTIONS.EXTINGUISHERS, unit.id);
        batch.set(ref, { ...unit, updatedAt: new Date().toISOString() });
      });

      // Seed Inspections
      initialRecords.forEach((record) => {
        const ref = doc(db, COLLECTIONS.INSPECTIONS, record.id);
        batch.set(ref, { ...record, createdAt: new Date().toISOString() });
      });

      // Seed Buildings
      initialBuildings.forEach((bld) => {
        const ref = doc(db, COLLECTIONS.BUILDINGS, bld.id);
        batch.set(ref, bld);
      });

      // Seed Logs
      initialLogs.forEach((log) => {
        const ref = doc(db, COLLECTIONS.ACTIVITY_LOGS, log.id);
        batch.set(ref, log);
      });

      // Seed Settings only if not existing
      const settingsRef = doc(db, COLLECTIONS.APP_SETTINGS, 'general');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        batch.set(settingsRef, {
          profile: initialProf,
          lineConfig: initialLine,
          updatedAt: new Date().toISOString(),
        });
      }

      await batch.commit();
      console.log('Firestore seed complete!');
    }
  } catch (err) {
    console.warn('Error during Firestore initial seed:', err);
  }
};
