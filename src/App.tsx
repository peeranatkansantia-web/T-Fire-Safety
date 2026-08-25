import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExtinguishersView } from './components/ExtinguishersView';
import { RecordsView } from './components/RecordsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import { NewInspectionModal } from './components/modals/NewInspectionModal';
import { NewUnitModal } from './components/modals/NewUnitModal';
import { QrModal } from './components/modals/QrModal';
import { FacilityMapModal } from './components/modals/FacilityMapModal';
import { ReportExportModal } from './components/modals/ReportExportModal';
import { UnitDetailModal } from './components/modals/UnitDetailModal';
import { BuildingModal } from './components/modals/BuildingModal';

import { 
  TabType, 
  Language, 
  ExtinguisherUnit, 
  InspectionRecord, 
  ActivityLog, 
  BuildingCompliance, 
  LineNotifyConfig,
  UserProfile
} from './types';

import { 
  initialProfile, 
  initialExtinguishers, 
  initialInspectionRecords, 
  initialBuildingCompliance, 
  initialActivityLogs 
} from './data/mockData';

import {
  subscribeToExtinguishers,
  saveExtinguisherToFirebase,
  deleteExtinguisherFromFirebase,
  subscribeToInspections,
  addInspectionToFirebase,
  deleteInspectionFromFirebase,
  subscribeToBuildings,
  saveBuildingToFirebase,
  deleteBuildingFromFirebase,
  subscribeToActivityLogs,
  addActivityLogToFirebase,
  subscribeToAppSettings,
  saveAppSettingsToFirebase,
  seedInitialDataIfEmpty,
} from './firebase';

export function App() {
  const [lang, setLang] = useState<Language>('th');
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('firesafe_profile');
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  const [extinguishers, setExtinguishers] = useState<ExtinguisherUnit[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_extinguishers');
      return saved ? JSON.parse(saved) : initialExtinguishers;
    } catch {
      return initialExtinguishers;
    }
  });
  const [records, setRecords] = useState<InspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_records');
      return saved ? JSON.parse(saved) : initialInspectionRecords;
    } catch {
      return initialInspectionRecords;
    }
  });
  const [buildings, setBuildings] = useState<BuildingCompliance[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_buildings');
      return saved ? JSON.parse(saved) : initialBuildingCompliance;
    } catch {
      return initialBuildingCompliance;
    }
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_activity_logs');
      return saved ? JSON.parse(saved) : initialActivityLogs;
    } catch {
      return initialActivityLogs;
    }
  });
  const [lineConfig, setLineConfig] = useState<LineNotifyConfig>(() => {
    try {
      const saved = localStorage.getItem('firesafe_line_config');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        channelAccessToken: '',
        targetGroupName: 'RT-Fire Safety Officer Group',
        alertOnFailed: true,
        alertOnMaintenance: true,
        alertOnExpiring: true,
      };
    } catch {
      return {
        enabled: true,
        channelAccessToken: '',
        targetGroupName: 'RT-Fire Safety Officer Group',
        alertOnFailed: true,
        alertOnMaintenance: true,
        alertOnExpiring: true,
      };
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase Real-time Firestore Subscriptions
  useEffect(() => {
    // Seed standard dataset if Firestore database is fresh & empty
    seedInitialDataIfEmpty(
      initialExtinguishers,
      initialInspectionRecords,
      initialBuildingCompliance,
      initialActivityLogs,
      initialProfile,
      lineConfig
    );

    const unsubExt = subscribeToExtinguishers(
      (units) => {
        if (units && units.length > 0) {
          setExtinguishers(units);
        }
        setFirebaseConnected(true);
      },
      (err) => {
        console.warn('Firestore Extinguishers error:', err);
        setFirebaseConnected(false);
      }
    );

    const unsubInsp = subscribeToInspections(
      (recs) => {
        if (recs && recs.length > 0) {
          setRecords(recs);
        }
      },
      () => setFirebaseConnected(false)
    );

    const unsubBld = subscribeToBuildings(
      (blds) => {
        if (blds && blds.length > 0) {
          setBuildings(blds);
        }
      },
      () => setFirebaseConnected(false)
    );

    const unsubLogs = subscribeToActivityLogs(
      (logs) => {
        if (logs && logs.length > 0) {
          setActivityLogs(logs);
        }
      },
      () => setFirebaseConnected(false)
    );

    const unsubSettings = subscribeToAppSettings(
      (settings) => {
        if (settings.profile) {
          setProfile(settings.profile);
          try {
            localStorage.setItem('firesafe_profile', JSON.stringify(settings.profile));
          } catch (e) {
            console.error(e);
          }
        }
        if (settings.lineConfig) {
          setLineConfig(settings.lineConfig);
          try {
            localStorage.setItem('firesafe_line_config', JSON.stringify(settings.lineConfig));
          } catch (e) {
            console.error(e);
          }
        }
      }
    );

    return () => {
      unsubExt();
      unsubInsp();
      unsubBld();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  // Offline Cache Persist
  useEffect(() => {
    try {
      localStorage.setItem('firesafe_extinguishers', JSON.stringify(extinguishers));
    } catch (e) {
      console.error(e);
    }
  }, [extinguishers]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_records', JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_buildings', JSON.stringify(buildings));
    } catch (e) {
      console.error(e);
    }
  }, [buildings]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_activity_logs', JSON.stringify(activityLogs));
    } catch (e) {
      console.error(e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_line_config', JSON.stringify(lineConfig));
    } catch (e) {
      console.error(e);
    }
  }, [lineConfig]);

  const handleUpdateProfile = (newProfileOrFn: React.SetStateAction<UserProfile>) => {
    setProfile(prev => {
      const nextProfile = typeof newProfileOrFn === 'function' ? newProfileOrFn(prev) : newProfileOrFn;
      try {
        localStorage.setItem('firesafe_profile', JSON.stringify(nextProfile));
      } catch (e) {
        console.error(e);
      }
      saveAppSettingsToFirebase({ profile: nextProfile, lineConfig }).catch(console.error);
      return nextProfile;
    });
  };

  const handleUpdateLineConfig = (newLineOrFn: React.SetStateAction<LineNotifyConfig>) => {
    setLineConfig(prev => {
      const nextLine = typeof newLineOrFn === 'function' ? newLineOrFn(prev) : newLineOrFn;
      try {
        localStorage.setItem('firesafe_line_config', JSON.stringify(nextLine));
      } catch (e) {
        console.error(e);
      }
      saveAppSettingsToFirebase({ profile, lineConfig: nextLine }).catch(console.error);
      return nextLine;
    });
  };

  // Complete System Backup & Restore Handlers
  const handleExportFullBackup = () => {
    const fullBackup = {
      version: '1.2.0',
      appName: 'RT-Fire Safety',
      timestamp: new Date().toISOString(),
      profile,
      extinguishers,
      records,
      buildings,
      activityLogs,
      lineConfig,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RT_Fire_Safety_Complete_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFullBackup = async (importedData: any) => {
    if (importedData.extinguishers && Array.isArray(importedData.extinguishers)) {
      setExtinguishers(importedData.extinguishers);
      for (const unit of importedData.extinguishers) {
        saveExtinguisherToFirebase(unit).catch(console.error);
      }
    }
    if (importedData.records && Array.isArray(importedData.records)) {
      setRecords(importedData.records);
      for (const rec of importedData.records) {
        addInspectionToFirebase(rec).catch(console.error);
      }
    }
    if (importedData.buildings && Array.isArray(importedData.buildings)) {
      setBuildings(importedData.buildings);
      for (const bld of importedData.buildings) {
        saveBuildingToFirebase(bld).catch(console.error);
      }
    }
    if (importedData.profile) {
      setProfile(importedData.profile);
    }
    if (importedData.activityLogs && Array.isArray(importedData.activityLogs)) {
      setActivityLogs(importedData.activityLogs);
      for (const log of importedData.activityLogs) {
        addActivityLogToFirebase(log).catch(console.error);
      }
    }
    if (importedData.lineConfig) {
      setLineConfig(importedData.lineConfig);
    }
    saveAppSettingsToFirebase({
      profile: importedData.profile || profile,
      lineConfig: importedData.lineConfig || lineConfig,
    }).catch(console.error);
  };

  const handleResetDemoData = async () => {
    setExtinguishers(initialExtinguishers);
    setRecords(initialInspectionRecords);
    setBuildings(initialBuildingCompliance);
    setActivityLogs(initialActivityLogs);
    setProfile(initialProfile);
    await seedInitialDataIfEmpty(
      initialExtinguishers,
      initialInspectionRecords,
      initialBuildingCompliance,
      initialActivityLogs,
      initialProfile,
      lineConfig
    );
  };

  const handleManualSyncFirestore = async () => {
    for (const unit of extinguishers) {
      await saveExtinguisherToFirebase(unit);
    }
    for (const rec of records) {
      await addInspectionToFirebase(rec);
    }
    for (const bld of buildings) {
      await saveBuildingToFirebase(bld);
    }
    await saveAppSettingsToFirebase({ profile, lineConfig });
  };

  // Modals state
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false);
  const [inspectionUnitId, setInspectionUnitId] = useState<string | undefined>(undefined);
  const [isNewUnitOpen, setIsNewUnitOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrUnit, setQrUnit] = useState<ExtinguisherUnit | null>(null);
  const [qrMode, setQrMode] = useState<'view' | 'scanner'>('view');
  const [isFacilityMapOpen, setIsFacilityMapOpen] = useState(false);
  const [isReportExportOpen, setIsReportExportOpen] = useState(false);
  const [isUnitDetailOpen, setIsUnitDetailOpen] = useState(false);
  const [selectedUnitDetail, setSelectedUnitDetail] = useState<ExtinguisherUnit | null>(null);

  // Auto-detect unit from URL query (?unit=FE-2041 or ?inspect=FE-2041 or hash #unit=FE-2041)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const unitId = urlParams.get('unit') || urlParams.get('id') || urlParams.get('inspect') || urlParams.get('extinguisher');
      const isInspect = urlParams.get('action') === 'inspect' || !!urlParams.get('inspect');
      
      let targetId = unitId;
      if (!targetId && window.location.hash) {
        const hashMatch = window.location.hash.match(/(?:unit|inspect|id)[=:/-]?([A-Za-z0-9-_]+)/i);
        if (hashMatch) targetId = hashMatch[1];
      }

      if (targetId && extinguishers.length > 0) {
        const found = extinguishers.find(u => 
          u.id.toLowerCase() === targetId!.toLowerCase() || 
          u.assetId.toLowerCase() === targetId!.toLowerCase() ||
          (u.customQrData && u.customQrData.toLowerCase() === targetId!.toLowerCase())
        );

        if (found) {
          setSelectedUnitDetail(found);
          if (isInspect) {
            setInspectionUnitId(found.id);
            setIsNewInspectionOpen(true);
          } else {
            setIsUnitDetailOpen(true);
          }
        }
      }
    } catch (e) {
      console.error('URL parse error:', e);
    }
  }, [extinguishers]);

  // Building Modal State
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingCompliance | null>(null);

  // Handlers
  const handleAddRecord = (newRecord: InspectionRecord) => {
    setRecords([newRecord, ...records]);
    addInspectionToFirebase(newRecord).catch(console.error);

    // Update target extinguisher status
    setExtinguishers(prev => prev.map(unit => {
      if (unit.id === newRecord.extinguisherId) {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const updatedUnit: ExtinguisherUnit = {
          ...unit,
          lastInspectionDate: todayStr,
          nextDueDate: nextMonth.toISOString().slice(0, 10),
          status: newRecord.status === 'passed' ? 'normal' : 'critical'
        };
        saveExtinguisherToFirebase(updatedUnit).catch(console.error);
        return updatedUnit;
      }
      return unit;
    }));

    // Add activity log
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId: newRecord.extinguisherId,
      title: `Unit ${newRecord.extinguisherId} inspected by ${newRecord.inspectorName}. Outcome: ${newRecord.status.toUpperCase()}.`,
      titleTh: `อุปกรณ์ ${newRecord.extinguisherId} ตรวจสอบโดย ${newRecord.inspectorNameTh} ผลการตรวจ: ${newRecord.status === 'passed' ? 'ผ่าน' : 'ไม่ผ่าน'}`,
      location: profile.department,
      locationTh: profile.departmentTh,
      severity: newRecord.status === 'passed' ? 'normal' : 'error',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  const handleAddUnit = (newUnit: ExtinguisherUnit) => {
    setExtinguishers([newUnit, ...extinguishers]);
    saveExtinguisherToFirebase(newUnit).catch(console.error);
    
    // Auto-create building compliance record if building doesn't exist yet
    const exists = buildings.some(b => b.nameTh === newUnit.buildingTh || b.name === newUnit.building);
    if (!exists && newUnit.buildingTh) {
      const newBld: BuildingCompliance = {
        id: `BLD-${Date.now()}`,
        name: newUnit.building,
        nameTh: newUnit.buildingTh,
        location: profile.department,
        locationTh: profile.departmentTh,
        assetsCount: 1,
        inspectedCount: 1,
        riskLevel: 'low',
        complianceRate: 100,
        floorPlans: [newUnit.floor || 'GF']
      };
      setBuildings(prev => [...prev, newBld]);
      saveBuildingToFirebase(newBld).catch(console.error);
    }

    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId: newUnit.id,
      title: `New unit ${newUnit.id} registered into ${newUnit.building}.`,
      titleTh: `ลงทะเบียนอุปกรณ์ถังดับเพลิงใหม่ ${newUnit.id} ใน ${newUnit.buildingTh}`,
      location: newUnit.building,
      locationTh: newUnit.buildingTh,
      severity: 'normal',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  const handleUpdateUnit = (updatedUnit: ExtinguisherUnit) => {
    setExtinguishers(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    setSelectedUnitDetail(updatedUnit);
    saveExtinguisherToFirebase(updatedUnit).catch(console.error);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId: updatedUnit.id,
      title: `Updated details and location for unit ${updatedUnit.id}.`,
      titleTh: `อัปเดตข้อมูลสถานที่และรายละเอียดอุปกรณ์ ${updatedUnit.id} (${updatedUnit.buildingTh})`,
      location: updatedUnit.building,
      locationTh: updatedUnit.buildingTh,
      severity: 'normal',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  const handleDeleteUnit = (unitId: string) => {
    setExtinguishers(prev => prev.filter(u => u.id !== unitId));
    setIsUnitDetailOpen(false);
    setSelectedUnitDetail(null);
    deleteExtinguisherFromFirebase(unitId).catch(console.error);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId,
      title: `Removed unit ${unitId} from inventory.`,
      titleTh: `ลบอุปกรณ์ถังดับเพลิง ${unitId} ออกจากระบบ`,
      location: 'Inventory',
      locationTh: 'คลังอุปกรณ์',
      severity: 'warning',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  // Building Handlers
  const handleOpenAddBuilding = () => {
    setEditingBuilding(null);
    setIsBuildingModalOpen(true);
  };

  const handleOpenEditBuilding = (bld: BuildingCompliance) => {
    setEditingBuilding(bld);
    setIsBuildingModalOpen(true);
  };

  const handleSaveBuilding = (savedBld: BuildingCompliance) => {
    setBuildings(prev => {
      const idx = prev.findIndex(b => b.id === savedBld.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedBld;
        return next;
      }
      return [...prev, savedBld];
    });
    saveBuildingToFirebase(savedBld).catch(console.error);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId: savedBld.id,
      title: `Building / Zone saved: ${savedBld.name}`,
      titleTh: `บันทึกข้อมูลอาคาร/โซน: ${savedBld.nameTh} (${savedBld.locationTh})`,
      location: savedBld.name,
      locationTh: savedBld.nameTh,
      severity: 'normal',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  const handleDeleteBuilding = (bldId: string) => {
    setBuildings(prev => prev.filter(b => b.id !== bldId));
    deleteBuildingFromFirebase(bldId).catch(console.error);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
    deleteInspectionFromFirebase(recordId).catch(console.error);
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      timestampTh: 'เมื่อสักครู่นี้',
      unitId: recordId,
      title: `Deleted inspection log ${recordId}.`,
      titleTh: `ลบบันทึกประวัติการตรวจเช็ก ${recordId} ออกจากระบบ`,
      location: profile.department,
      locationTh: profile.departmentTh,
      severity: 'warning',
    };
    setActivityLogs([newLog, ...activityLogs]);
    addActivityLogToFirebase(newLog).catch(console.error);
  };

  const handleOpenQrCode = (unit: ExtinguisherUnit) => {
    setQrUnit(unit);
    setQrMode('view');
    setIsQrModalOpen(true);
  };

  const handleOpenQrScanner = () => {
    setQrUnit(extinguishers[0] || null);
    setQrMode('scanner');
    setIsQrModalOpen(true);
  };

  const handleQrScanSuccess = (unitId: string, action?: 'inspect' | 'detail') => {
    const found = extinguishers.find(u => 
      u.id.toLowerCase() === unitId.toLowerCase() || 
      u.assetId.toLowerCase() === unitId.toLowerCase() ||
      (u.customQrData && u.customQrData.toLowerCase() === unitId.toLowerCase())
    );

    if (found) {
      if (action === 'inspect') {
        setInspectionUnitId(found.id);
        setIsNewInspectionOpen(true);
      } else {
        setSelectedUnitDetail(found);
        setIsUnitDetailOpen(true);
      }
    } else if (extinguishers.length > 0) {
      setSelectedUnitDetail(extinguishers[0]);
      setIsUnitDetailOpen(true);
    }
  };

  const handleViewUnitDetail = (unit: ExtinguisherUnit) => {
    setSelectedUnitDetail(unit);
    setIsUnitDetailOpen(true);
  };

  return (
    <div id="firesafe-app-root" className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex flex-col font-sans">
      
      {/* Header */}
      <Header
        lang={lang}
        setLang={setLang}
        profile={profile}
        onOpenNewInspection={() => setIsNewInspectionOpen(true)}
        onOpenNewUnit={() => setIsNewUnitOpen(true)}
        onOpenQrScanner={handleOpenQrScanner}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        extinguishers={extinguishers}
        activityLogs={activityLogs}
        onViewUnitDetail={handleViewUnitDetail}
        firebaseConnected={firebaseConnected}
      />

      {/* Body Content with Left Sidebar */}
      <div className="flex-1 flex pb-16 md:pb-0">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          lang={lang}
          onOpenFacilityMap={() => setIsFacilityMapOpen(true)}
          extinguishersCount={extinguishers.length}
        />

        {/* Main Workspace View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {currentTab === 'dashboard' && (
            <DashboardView
              lang={lang}
              extinguishers={extinguishers}
              records={records}
              onOpenNewInspection={() => setIsNewInspectionOpen(true)}
              onOpenNewUnit={() => setIsNewUnitOpen(true)}
              onOpenFacilityMap={() => setIsFacilityMapOpen(true)}
              onViewUnitDetail={handleViewUnitDetail}
              onOpenQrCode={handleOpenQrCode}
              onDeleteUnit={handleDeleteUnit}
            />
          )}

          {currentTab === 'extinguishers' && (
            <ExtinguishersView
              lang={lang}
              extinguishers={extinguishers}
              activityLogs={activityLogs}
              buildings={buildings}
              onOpenNewUnit={() => setIsNewUnitOpen(true)}
              onOpenFacilityMap={() => setIsFacilityMapOpen(true)}
              onViewUnitDetail={handleViewUnitDetail}
              onOpenQrCode={handleOpenQrCode}
              onDeleteUnit={handleDeleteUnit}
            />
          )}

          {currentTab === 'records' && (
            <RecordsView
              lang={lang}
              records={records}
              onOpenNewInspection={() => setIsNewInspectionOpen(true)}
              onOpenExportModal={() => setIsReportExportOpen(true)}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              lang={lang}
              buildings={buildings}
              extinguishers={extinguishers}
              records={records}
              onOpenExportModal={() => setIsReportExportOpen(true)}
              onOpenAddBuilding={handleOpenAddBuilding}
              onEditBuilding={handleOpenEditBuilding}
              onDeleteBuilding={handleDeleteBuilding}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              lang={lang}
              profile={profile}
              setProfile={handleUpdateProfile}
              lineConfig={lineConfig}
              setLineConfig={handleUpdateLineConfig}
              onExportFullBackup={handleExportFullBackup}
              onImportFullBackup={handleImportFullBackup}
              onResetDemoData={handleResetDemoData}
              extinguishersCount={extinguishers.length}
              recordsCount={records.length}
              firebaseConnected={firebaseConnected}
              onSyncFirestore={handleManualSyncFirestore}
            />
          )}

        </main>

      </div>

      {/* Global Interactive Modals */}
      <NewInspectionModal
        isOpen={isNewInspectionOpen}
        onClose={() => {
          setIsNewInspectionOpen(false);
          setInspectionUnitId(undefined);
        }}
        lang={lang}
        extinguishers={extinguishers}
        onAddRecord={handleAddRecord}
        initialUnitId={inspectionUnitId}
      />

      <NewUnitModal
        isOpen={isNewUnitOpen}
        onClose={() => setIsNewUnitOpen(false)}
        lang={lang}
        buildings={buildings}
        onAddUnit={handleAddUnit}
      />

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        lang={lang}
        unit={qrUnit}
        extinguishers={extinguishers}
        mode={qrMode}
        onScanSuccess={handleQrScanSuccess}
        onUpdateUnit={handleUpdateUnit}
      />

      <FacilityMapModal
        isOpen={isFacilityMapOpen}
        onClose={() => setIsFacilityMapOpen(false)}
        lang={lang}
        extinguishers={extinguishers}
        onSelectUnit={handleViewUnitDetail}
        onUpdateUnit={handleUpdateUnit}
      />

      <ReportExportModal
        isOpen={isReportExportOpen}
        onClose={() => setIsReportExportOpen(false)}
        lang={lang}
        extinguishers={extinguishers}
        buildings={buildings}
        profile={profile}
      />

      <UnitDetailModal
        isOpen={isUnitDetailOpen}
        onClose={() => setIsUnitDetailOpen(false)}
        lang={lang}
        unit={selectedUnitDetail}
        onOpenQr={handleOpenQrCode}
        onOpenNewInspection={() => {
          if (selectedUnitDetail) {
            setInspectionUnitId(selectedUnitDetail.id);
          }
          setIsNewInspectionOpen(true);
        }}
        onUpdateUnit={handleUpdateUnit}
        onDeleteUnit={handleDeleteUnit}
      />

      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        lang={lang}
        editingBuilding={editingBuilding}
        onSaveBuilding={handleSaveBuilding}
        onDeleteBuilding={handleDeleteBuilding}
      />

    </div>
  );
}

export default App;
