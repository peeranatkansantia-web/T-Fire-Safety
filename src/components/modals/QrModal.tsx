import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Link, 
  Save, 
  ExternalLink, 
  Upload, 
  ImageIcon, 
  Download,
  Flame,
  Check,
  Search,
  ArrowRight,
  Sliders,
  Layers,
  FileCheck,
  Play,
  Volume2,
  VolumeX,
  Smartphone,
  Calendar,
  Clock,
  MapPin,
  History,
  AlertTriangle,
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { ExtinguisherUnit, InspectionRecord, Language } from '../../types';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  unit: ExtinguisherUnit | null;
  extinguishers?: ExtinguisherUnit[];
  records?: InspectionRecord[];
  onScanSuccess?: (unitId: string, action?: 'inspect' | 'detail') => void;
  onUpdateUnit?: (updatedUnit: ExtinguisherUnit) => void;
  mode?: 'view' | 'scanner';
}

// Synthesized audio feedback tone on successful scan
const playScanChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Ignore audio context autoplay restrictions
  }
};

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  lang,
  unit,
  extinguishers = [],
  records = [],
  onScanSuccess,
  onUpdateUnit,
  mode = 'view',
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';
  const [activeTab, setActiveTab] = useState<'view' | 'batch' | 'scanner'>(mode === 'scanner' ? 'scanner' : 'view');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [scannedInput, setScannedInput] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fileScanError, setFileScanError] = useState('');
  const [detectedUnit, setDetectedUnit] = useState<ExtinguisherUnit | null>(null);
  const [detectedRawText, setDetectedRawText] = useState<string>('');
  const [autoAction, setAutoAction] = useState<'inspect' | 'detail' | 'ask'>('ask');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Batch print filter state
  const [batchBuilding, setBatchBuilding] = useState<string>('all');
  const [batchQrDataUrls, setBatchQrDataUrls] = useState<Record<string, string>>({});
  const [batchLoading, setBatchLoading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const activeUnit = extinguishers.find(u => u.id === selectedUnitId) || unit || extinguishers[0] || null;

  // Active unit inspection history
  const activeUnitRecords = useMemo(() => {
    if (!activeUnit) return [];
    return records.filter(r => r.extinguisherId === activeUnit.id);
  }, [records, activeUnit]);

  // Detected unit inspection history (in scanner tab)
  const detectedUnitRecords = useMemo(() => {
    if (!detectedUnit) return [];
    return records.filter(r => r.extinguisherId === detectedUnit.id);
  }, [records, detectedUnit]);

  // Custom QR Payload state
  const [customQrPayload, setCustomQrPayload] = useState<string>('');
  const [payloadType, setPayloadType] = useState<'url' | 'id' | 'summary' | 'custom'>('url');

  // Sync mode, selected unit, and default payload when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode === 'scanner' ? 'scanner' : 'view');
      setDetectedUnit(null);
      setDetectedRawText('');
      setFileScanError('');
      if (unit) {
        setSelectedUnitId(unit.id);
      } else if (extinguishers.length > 0) {
        setSelectedUnitId(extinguishers[0].id);
      }
    }
  }, [isOpen, mode, unit, extinguishers]);

  // Construct absolute universal URL
  const getUniversalUrl = (unitId: string) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?unit=${encodeURIComponent(unitId)}&action=inspect`;
  };

  // Set default payload for active unit
  useEffect(() => {
    if (activeUnit) {
      if (activeUnit.customQrData) {
        setCustomQrPayload(activeUnit.customQrData);
        setPayloadType('custom');
      } else {
        setCustomQrPayload(getUniversalUrl(activeUnit.id));
        setPayloadType('url');
      }
      setSavedSuccess(false);
    }
  }, [activeUnit]);

  // Generate local QR Code Data URL dynamically
  useEffect(() => {
    if (!activeUnit) return;
    const fallbackUrl = getUniversalUrl(activeUnit.id);
    const dataToEncode = customQrPayload.trim() || fallbackUrl;

    QRCode.toDataURL(dataToEncode, {
      width: 450,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [customQrPayload, activeUnit]);

  // Generate Batch QR codes when batch tab is active
  const filteredBatchUnits = useMemo(() => {
    if (batchBuilding === 'all') return extinguishers;
    return extinguishers.filter(u => (u.buildingTh || u.building) === batchBuilding);
  }, [extinguishers, batchBuilding]);

  useEffect(() => {
    if (activeTab === 'batch' && filteredBatchUnits.length > 0) {
      setBatchLoading(true);
      const promises = filteredBatchUnits.map(async (u) => {
        const payload = u.customQrData || getUniversalUrl(u.id);
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#111827',
            light: '#ffffff'
          }
        });
        return { id: u.id, dataUrl };
      });

      Promise.all(promises)
        .then(results => {
          const map: Record<string, string> = {};
          results.forEach(r => { map[r.id] = r.dataUrl; });
          setBatchQrDataUrls(map);
          setBatchLoading(false);
        })
        .catch(err => {
          console.error('Batch QR error:', err);
          setBatchLoading(false);
        });
    }
  }, [activeTab, filteredBatchUnits]);

  // Robust unit parser from QR text/URL/JSON/Prefixes
  const parseUnitFromText = (rawText: string): ExtinguisherUnit | null => {
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    let targetId = '';

    // 1. Check URL pattern: ?unit=... or ?id=... or ?inspect=... or ?extinguisher=...
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        targetId = 
          url.searchParams.get('unit') || 
          url.searchParams.get('id') || 
          url.searchParams.get('inspect') || 
          url.searchParams.get('extinguisher') ||
          url.searchParams.get('tag') ||
          url.searchParams.get('code') ||
          '';

        if (!targetId && url.hash) {
          const match = url.hash.match(/(?:unit|inspect|id|extinguisher)[=:/-]?([A-Za-z0-9-_]+)/i);
          if (match) targetId = match[1];
        }
      }
    } catch {
      // Ignore URL parse error
    }

    // 2. Check JSON pattern e.g. {"unitId":"FE-2041"}
    if (!targetId && trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        targetId = parsed.unitId || parsed.id || parsed.assetId || parsed.extinguisherId || '';
      } catch {
        // Ignore JSON error
      }
    }

    // 3. Check FIRESAFE- prefix
    if (!targetId && /^FIRESAFE[-_:]/i.test(trimmed)) {
      targetId = trimmed.replace(/^FIRESAFE[-_:]/i, '').trim();
    }

    // 4. Check "ID: FE-xxxx" or "Unit: FE-xxxx"
    if (!targetId) {
      const match = trimmed.match(/\b(?:ID|UNIT|ASSET|TAG):\s*([A-Za-z0-9-_]+)/i);
      if (match) targetId = match[1];
    }

    // 5. Direct exact or lowercase match with extinguishers list (by ID, AssetTag, or customQrData)
    if (!targetId) {
      const direct = extinguishers.find(u => 
        u.id.toLowerCase() === trimmed.toLowerCase() ||
        u.assetId.toLowerCase() === trimmed.toLowerCase() ||
        (u.customQrData && u.customQrData.toLowerCase() === trimmed.toLowerCase())
      );
      if (direct) return direct;
      targetId = trimmed;
    }

    // 6. Find unit by ID, Asset ID, or partial number match (e.g. "2041" matching "FE-2041")
    const cleanTarget = targetId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = extinguishers.find(u => {
      const cleanId = u.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanAsset = u.assetId.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        u.id.toLowerCase() === targetId.toLowerCase() || 
        u.assetId.toLowerCase() === targetId.toLowerCase() ||
        (u.customQrData && u.customQrData.toLowerCase() === trimmed.toLowerCase()) ||
        cleanId === cleanTarget ||
        cleanAsset === cleanTarget ||
        (cleanTarget.length >= 3 && cleanId.includes(cleanTarget))
      );
    });

    return found || null;
  };

  // Process decoded scan result
  const handleScanResult = (decodedText: string) => {
    const trimmed = decodedText.trim();
    setDetectedRawText(trimmed);

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      setScannedUrl(trimmed);
    } else {
      setScannedUrl('');
    }

    const matched = parseUnitFromText(trimmed);
    if (matched) {
      setDetectedUnit(matched);
      if (soundEnabled) playScanChime();
      if (navigator.vibrate) {
        try { navigator.vibrate(120); } catch {}
      }

      // If auto-action is enabled, proceed automatically after a short visual delay
      if (autoAction !== 'ask') {
        setTimeout(() => {
          handleProceedWithUnit(autoAction, matched);
        }, 400);
      }
    } else {
      setDetectedUnit(null);
    }
  };

  // Camera QR Scanner Lifecycle
  useEffect(() => {
    let isMounted = true;

    if (isOpen && activeTab === 'scanner') {
      const timer = setTimeout(async () => {
        const readerEl = document.getElementById('qr-reader-container');
        if (!readerEl || !isMounted) return;

        try {
          // Stop any previous instance
          if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }

          const qrScanner = new Html5Qrcode('qr-reader-container');
          html5QrCodeRef.current = qrScanner;

          const config = {
            fps: 15,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minDim = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minDim * 0.72);
              return { width: Math.max(200, size), height: Math.max(200, size) };
            }
          };

          const onScanSuccessCallback = (decodedText: string) => {
            handleScanResult(decodedText);
          };

          // Try environment camera first, then fallback to any available camera
          try {
            await qrScanner.start({ facingMode: 'environment' }, config, onScanSuccessCallback, () => {});
            if (isMounted) {
              setIsCameraActive(true);
              setCameraError('');
            }
          } catch {
            // Fallback: list cameras and pick first available
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const cameraId = cameras[cameras.length - 1].id;
              await qrScanner.start(cameraId, config, onScanSuccessCallback, () => {});
              if (isMounted) {
                setIsCameraActive(true);
                setCameraError('');
              }
            } else {
              throw new Error('No camera found');
            }
          }
        } catch (err: any) {
          console.warn('QR camera start warning:', err);
          if (isMounted) {
            setIsCameraActive(false);
            setCameraError(
              isTh 
                ? 'ไม่สามารถเปิดกล้องได้ (โปรดอนุญาตสิทธิ์กล้องในเบราว์เซอร์ หรือใช้วิธีอัปโหลดรูปภาพ/พิมพ์รหัสด้านล่าง)' 
                : 'Camera inaccessible. Please grant permission or use photo upload/manual search below.'
            );
          }
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5QrCodeRef.current) {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current = null;
        }
      };
    }
  }, [isOpen, activeTab, autoAction]);

  // Image File Scanner
  const handleImageFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileScanError('');
    try {
      const scanner = new Html5Qrcode('qr-file-scanner-dummy');
      const decoded = await scanner.scanFile(file, false);
      if (decoded) {
        handleScanResult(decoded);
      }
    } catch (err) {
      console.error('File QR scan error:', err);
      setFileScanError(isTh ? 'ไม่พบ QR Code ในภาพ หรือภาพไม่ชัดเจน โปรดลองใหม่อีกครั้ง' : 'No QR Code detected in image. Please try another image.');
    }
  };

  // Manual search submit
  const handleManualSearch = () => {
    if (!scannedInput.trim()) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      handleScanResult(scannedInput);
    }, 200);
  };

  const handleApplyPreset = (type: 'url' | 'id' | 'summary') => {
    if (!activeUnit) return;
    setPayloadType(type);

    if (type === 'url') {
      setCustomQrPayload(getUniversalUrl(activeUnit.id));
    } else if (type === 'id') {
      setCustomQrPayload(activeUnit.id);
    } else if (type === 'summary') {
      setCustomQrPayload(
        `FIRESAFE:${activeUnit.id}|${activeUnit.assetId}|${activeUnit.buildingTh || activeUnit.building}|${activeUnit.type.toUpperCase()}`
      );
    }
  };

  const handleCopyPayload = () => {
    if (customQrPayload) {
      navigator.clipboard.writeText(customQrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePayloadToUnit = () => {
    if (activeUnit && onUpdateUnit) {
      onUpdateUnit({
        ...activeUnit,
        customQrData: customQrPayload.trim() || undefined
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !activeUnit) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Code_${activeUnit.id}_${activeUnit.assetId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleProceedWithUnit = (action: 'inspect' | 'detail', targetUnit = detectedUnit) => {
    if (!targetUnit) return;
    if (onScanSuccess) {
      onScanSuccess(targetUnit.id, action);
    }
    onClose();
  };

  // Direct test button: simulates instant scan and launch
  const handleTestQrAction = (action: 'inspect' | 'detail') => {
    if (!activeUnit) return;
    if (soundEnabled) playScanChime();
    if (onScanSuccess) {
      onScanSuccess(activeUnit.id, action);
    }
    onClose();
  };

  // Buildings list for batch filter
  const uniqueBuildings = useMemo(() => {
    const set = new Set<string>();
    extinguishers.forEach(u => {
      const b = u.buildingTh || u.building;
      if (b) set.add(b);
    });
    return Array.from(set);
  }, [extinguishers]);

  return (
    <div id="qr-modal-backdrop" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Hidden dummy div for file scanner */}
      <div id="qr-file-scanner-dummy" className="hidden"></div>

      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-2xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                {isTh ? 'ศูนย์จัดการและสแกนป้าย QR Code' : 'QR Badge & Scanner Center'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'สร้างป้ายติดถังดับเพลิง, พิมพ์สติกเกอร์รวม, และสแกนตรวจทันที' : 'Create inspection badges, batch print, and live scan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-2xl my-3 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'view' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? '1. ป้าย QR เดี่ยว' : '1. Single Badge'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'batch' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? '2. พิมพ์รวมทุกถัง' : '2. Batch Print Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scanner' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4 text-[#d32f2f]" />
            <span>{isTh ? '3. สแกน QR Code' : '3. Camera Scanner'}</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">

          {/* TAB 1: SINGLE BADGE CREATOR & PRINT */}
          {activeTab === 'view' && activeUnit && (
            <div className="space-y-4">
              
              {/* Extinguisher Selector Bar */}
              {extinguishers.length > 1 && (
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-left">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isTh ? 'เลือกอุปกรณ์ถังดับเพลิงที่ต้องการสร้างป้าย:' : 'Select Extinguisher Asset:'}
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                  >
                    {extinguishers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.id} ({u.assetId}) — {isTh ? u.buildingTh || u.building : u.building} [{u.type.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Printable Tag Visual Canvas */}
              <div 
                id="printable-qr-badge" 
                className="bg-white p-5 rounded-2xl border-2 border-dashed border-red-300 shadow-sm text-center relative overflow-hidden"
              >
                {/* Header Band */}
                <div className="bg-[#d32f2f] text-white py-1 px-4 rounded-xl flex items-center justify-between font-extrabold text-xs tracking-wider mb-3">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>RT-FIRE SAFETY INSPECTION TAG</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                    NFPA 10 COMPLIANT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  
                  {/* QR Image Box */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-40 h-40 bg-white p-2.5 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`QR Code ${activeUnit.id}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <RefreshCw className="w-6 h-6 animate-spin text-[#d32f2f]" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold mt-2 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-[#d32f2f]" />
                      {isTh ? 'สแกนด้วยมือถือเพื่อบันทึกผลตรวจ' : 'Scan with mobile camera to audit'}
                    </span>
                  </div>

                  {/* Equipment Specifications Box */}
                  <div className="text-left space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit Identifier</span>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight">{activeUnit.id}</h4>
                      <p className="text-xs font-mono font-bold text-[#d32f2f]">{activeUnit.assetId}</p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isTh ? 'ประเภทถัง:' : 'Type:'}</span>
                        <span className="font-bold uppercase text-gray-900">{activeUnit.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isTh ? 'อาคาร:' : 'Building:'}</span>
                        <span className="font-bold text-gray-900">{isTh ? activeUnit.buildingTh || activeUnit.building : activeUnit.building}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isTh ? 'ตำแหน่ง/ห้อง:' : 'Location:'}</span>
                        <span className="font-bold text-gray-900">{isTh ? activeUnit.roomLocationTh || activeUnit.roomLocation : activeUnit.roomLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isTh ? 'กำหนดตรวจถัดไป:' : 'Next Due:'}</span>
                        <span className="font-bold text-emerald-700">{activeUnit.nextDueDate}</span>
                      </div>
                    </div>

                    {/* NFPA Annual Grid Mini Checklist (Simulated on Physical Tag) */}
                    <div className="pt-1">
                      <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{isTh ? 'ตารางตรวจเช็กรายเดือน (12 Months Audit):' : 'Monthly Audit Matrix:'}</span>
                      <div className="grid grid-cols-6 gap-1 text-[9px] font-bold text-center">
                        {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((m, i) => (
                          <div key={i} className="border border-gray-300 p-0.5 rounded bg-white text-gray-600">
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Instant Scan Verification Simulator */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">
                        {isTh ? 'ทดสอบการทำงานของ QR Code นี้ทันที' : 'Instant QR Test & Launch'}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        {isTh ? 'ทดลองจำลองการสแกนเพื่อเปิดแบบฟอร์มตรวจเช็ก 7 จุดของถังนี้' : 'Simulate scan to verify direct inspection linkage'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleTestQrAction('inspect')}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isTh ? 'ทดสอบตรวจเช็ก' : 'Test Inspect'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestQrAction('detail')}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      <span>{isTh ? 'ดูข้อมูล' : 'Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Equipment Specifications & Inspection History Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#d32f2f]" />
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {isTh ? 'ข้อมูลจำเพาะประจำถัง & ประวัติการตรวจสอบ' : 'Equipment Specifications & Inspection Log'}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeUnit.status === 'normal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    activeUnit.status === 'due_soon' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {activeUnit.status === 'normal' ? (isTh ? '✅ สภาพปกติ พร้อมใช้' : 'Normal / Ready') :
                     activeUnit.status === 'due_soon' ? (isTh ? '⚠️ ใกล้กำหนดตรวจ' : 'Due Soon') :
                     (isTh ? '🚨 หมดอายุ / ส่งซ่อม' : 'Expired / Maintenance')}
                  </span>
                </div>

                {/* 4 Key Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTh ? 'ประเภทถัง / สาร' : 'Extinguisher Type'}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900 uppercase block mt-0.5">
                      {activeUnit.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTh ? 'ตำแหน่งติดตั้ง' : 'Installation Location'}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900 truncate block mt-0.5" title={isTh ? `${activeUnit.buildingTh || activeUnit.building} (${activeUnit.roomLocationTh || activeUnit.roomLocation})` : `${activeUnit.building} (${activeUnit.roomLocation})`}>
                      {isTh ? activeUnit.buildingTh || activeUnit.building : activeUnit.building} (ชั้น {activeUnit.floor})
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTh ? 'ตรวจล่าสุด' : 'Last Inspection'}
                    </span>
                    <span className="font-bold text-xs text-slate-800 block mt-0.5">
                      {activeUnit.lastInspectionDate || '-'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTh ? 'กำหนดตรวจถัดไป' : 'Next Due Date'}
                    </span>
                    <span className="font-extrabold text-xs text-[#d32f2f] block mt-0.5">
                      {activeUnit.nextDueDate || '-'}
                    </span>
                  </div>
                </div>

                {/* Past Inspection History Log for this Extinguisher */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#d32f2f]" />
                      <span>{isTh ? `ประวัติการตรวจสอบย้อนหลัง (${activeUnitRecords.length} รายการ):` : `Inspection History (${activeUnitRecords.length} records):`}</span>
                    </span>
                    {activeUnitRecords.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {isTh ? 'บันทึกครบถ้วนตามมาตรฐาน' : 'Verified'}
                      </span>
                    )}
                  </div>

                  {activeUnitRecords.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                      <FileText className="w-4 h-4 mx-auto mb-1 opacity-50" />
                      <p>{isTh ? 'ยังไม่มีประวัติการบันทึกตรวจเช็กสำหรับถังนี้' : 'No previous inspection history recorded for this unit'}</p>
                      <button
                        type="button"
                        onClick={() => handleTestQrAction('inspect')}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#d32f2f] hover:underline"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isTh ? '+ เริ่มบันทึกการตรวจเช็กครั้งแรก' : '+ Log First Inspection'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {activeUnitRecords.slice(0, 5).map((rec) => (
                        <div key={rec.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{rec.date}</span>
                              <span className="text-[10px] text-slate-400">{rec.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 truncate">
                              👮‍♂️ {isTh ? rec.inspectorNameTh || rec.inspectorName : rec.inspectorName} ({rec.inspectorBadge})
                              {rec.notes && ` • "${isTh ? rec.notesTh || rec.notes : rec.notes}"`}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              rec.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              rec.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {rec.status === 'passed' ? (isTh ? 'ผ่าน (Pass)' : 'Passed') :
                               rec.status === 'failed' ? (isTh ? 'ไม่ผ่าน' : 'Failed') : (isTh ? 'ส่งซ่อม' : 'Maintenance')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct 1-Click Action for Staff */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-[10px] text-slate-500">
                    💡 {isTh ? 'กดปุ่มเพื่อเริ่มตรวจ 7 จุดของถังนี้ได้ทันทีโดยไม่ต้องค้นหา' : 'Launch direct 7-point audit for this asset'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTestQrAction('inspect')}
                    className="w-full sm:w-auto px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isTh ? '⚡ บันทึกการตรวจ 7 จุดของถังนี้ทันที' : 'Inspect This Unit Now'}</span>
                  </button>
                </div>
              </div>

              {/* QR Payload Settings & Presets */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#d32f2f]" />
                    <span>{isTh ? 'ข้อมูลที่ฝังใน QR Code (Payload)' : 'QR Code Content / Embedded URL'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="text-[10px] font-bold text-gray-600 hover:text-[#d32f2f] bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (isTh ? 'คัดลอกแล้ว' : 'Copied!') : (isTh ? 'คัดลอก' : 'Copy')}</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={customQrPayload}
                  onChange={(e) => {
                    setCustomQrPayload(e.target.value);
                    setPayloadType('custom');
                  }}
                  placeholder="https://... or FE-2041"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                />

                {/* Quick Presets */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-gray-500 mb-1.5">{isTh ? 'เลือกรูปแบบที่ต้องการฝังใน QR Code:' : 'Quick Presets:'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('url')}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all ${
                        payloadType === 'url' 
                          ? 'bg-red-50 border-[#d32f2f] text-[#d32f2f]' 
                          : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="block">🌐 {isTh ? 'ลิงก์เว็บตรง (แนะนำ)' : 'Direct Web URL'}</span>
                      <span className="text-[10px] font-normal text-gray-500 block truncate">
                        สแกนเปิดหน้าตรวจเช็กอัตโนมัติ
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('id')}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all ${
                        payloadType === 'id' 
                          ? 'bg-red-50 border-[#d32f2f] text-[#d32f2f]' 
                          : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="block">🏷️ {isTh ? 'รหัสถังเท่านั้น' : 'ID Code Only'}</span>
                      <span className="text-[10px] font-normal text-gray-500 block truncate">
                        {activeUnit.id}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('summary')}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all ${
                        payloadType === 'summary' 
                          ? 'bg-red-50 border-[#d32f2f] text-[#d32f2f]' 
                          : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="block">📋 {isTh ? 'Smart FireSafe Tag' : 'Smart Tag'}</span>
                      <span className="text-[10px] font-normal text-gray-500 block truncate">
                        FIRESAFE:{activeUnit.id}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Save custom payload to unit */}
                {onUpdateUnit && (
                  <div className="pt-2 flex items-center justify-between border-t border-gray-200/80">
                    <span className="text-[10px] text-gray-500">
                      {savedSuccess ? (isTh ? '✅ บันทึกรูปแบบนี้ลงถังนี้แล้ว' : 'Saved to unit!') : (isTh ? 'บันทึกรูปแบบนี้ไว้เป็นค่าเริ่มต้นของถังนี้' : 'Remember format for this unit')}
                    </span>
                    <button
                      type="button"
                      onClick={handleSavePayloadToUnit}
                      className="px-3 py-1 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isTh ? 'บันทึกลงถัง' : 'Save to Unit'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Print & Download */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-[#d32f2f]" />
                  <span>{isTh ? 'บันทึกรูป QR (.PNG)' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isTh ? 'พิมพ์ป้ายติดถัง (Print)' : 'Print Badge'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: BATCH PRINT ALL EXTINQUISHER BADGES */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              
              {/* Filter and Print Toolbar */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isTh ? 'กรองตามอาคารที่ต้องการพิมพ์:' : 'Filter Building for Batch Print:'}
                  </label>
                  <select
                    value={batchBuilding}
                    onChange={(e) => setBatchBuilding(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                  >
                    <option value="all">{isTh ? `🏢 พิมพ์ทุกอาคารทั้งหมด (${extinguishers.length} ถัง)` : `All Buildings (${extinguishers.length} units)`}</option>
                    {uniqueBuildings.map(b => (
                      <option key={b} value={b}>
                        🏢 {b} ({extinguishers.filter(u => (u.buildingTh || u.building) === b).length} ถัง)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isTh ? `พิมพ์ทั้งหมด (${filteredBatchUnits.length} ป้าย)` : `Print All (${filteredBatchUnits.length})`}</span>
                  </button>
                </div>
              </div>

              {/* Batch Badges Grid Container (Optimized for A4 Print) */}
              <div id="printable-batch-badges" className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs text-gray-500 font-bold">
                  <span>{isTh ? `ตัวอย่างป้ายที่จะพิมพ์ (${filteredBatchUnits.length} ถัง):` : `Badges Preview (${filteredBatchUnits.length} units):`}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Format: A4 Label Sheet Grid</span>
                </div>

                {batchLoading ? (
                  <div className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#d32f2f] mx-auto mb-2" />
                    <p className="text-xs font-bold">{isTh ? 'กำลังสร้างรหัส QR Code สำหรับทุกถัง...' : 'Generating batch QR codes...'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredBatchUnits.map((u) => {
                      const qrUrl = batchQrDataUrls[u.id];
                      return (
                        <div 
                          key={u.id} 
                          className="bg-white p-3.5 rounded-2xl border-2 border-gray-200 shadow-2xs flex flex-col justify-between text-left space-y-2 break-inside-avoid"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                            <div className="flex items-center gap-1.5 text-[#d32f2f] font-extrabold text-xs">
                              <Flame className="w-3.5 h-3.5" />
                              <span>FIRE INSPECTION TAG</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded uppercase">
                              {u.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 h-24 bg-white p-1 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                              {qrUrl ? (
                                <img src={qrUrl} alt={u.id} className="w-full h-full object-contain" />
                              ) : (
                                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                              )}
                            </div>

                            <div className="space-y-1 text-[11px] leading-tight min-w-0">
                              <p className="text-base font-black text-gray-900 truncate">{u.id}</p>
                              <p className="font-mono text-gray-500 truncate">{u.assetId}</p>
                              <p className="text-gray-700 font-bold truncate">
                                {isTh ? u.buildingTh || u.building : u.building}
                              </p>
                              <p className="text-gray-500 text-[10px] truncate">
                                {isTh ? u.roomLocationTh || u.roomLocation : u.roomLocation}
                              </p>
                              <p className="text-[10px] text-emerald-700 font-bold">
                                Due: {u.nextDueDate}
                              </p>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400">
                            <span>Scan with phone camera to audit</span>
                            <span className="font-mono font-bold text-gray-600">RT-Fire Safety</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: LIVE CAMERA & PHOTO SCANNER */}
          {activeTab === 'scanner' && (
            <div className="space-y-3.5 py-1">
              
              {/* Controls Bar: Sound Toggle & Auto-Action */}
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-gray-700 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-[#d32f2f]" />
                    <span>{isTh ? 'เมื่อสแกนพบ:' : 'On Scan:'}</span>
                  </label>
                  <select
                    value={autoAction}
                    onChange={(e) => setAutoAction(e.target.value as any)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800"
                  >
                    <option value="ask">{isTh ? 'แสดงข้อมูลให้ยืนยัน' : 'Ask Confirmation'}</option>
                    <option value="inspect">{isTh ? '⚡ เปิดแบบฟอร์มตรวจเช็กทันที' : '⚡ Auto-Open Inspection'}</option>
                    <option value="detail">{isTh ? '📋 เปิดดูรายละเอียดถังทันที' : '📋 Auto-Open Details'}</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                    soundEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-gray-200 text-gray-400'
                  }`}
                  title={soundEnabled ? 'เสียงแจ้งเตือนเปิดอยู่' : 'ปิดเสียงแจ้งเตือน'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">{soundEnabled ? (isTh ? 'เปิดเสียง' : 'Sound On') : (isTh ? 'ปิดเสียง' : 'Muted')}</span>
                </button>
              </div>

              {/* Live Camera Viewfinder Box */}
              <div className="w-full min-h-[240px] max-h-[320px] bg-gray-950 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border-2 border-[#d32f2f]/40 shadow-inner">
                <div id="qr-reader-container" className="w-full h-full min-h-[240px]"></div>

                {/* Animated Scanner Laser Overlay (when camera active) */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-52 h-52 border-2 border-red-500/80 rounded-2xl relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-lg"></div>
                      <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
                    </div>
                  </div>
                )}

                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gray-950/95 z-10 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#d32f2f]/20 flex items-center justify-center text-[#d32f2f] mb-1">
                      <Camera className="w-6 h-6 animate-bounce" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isTh ? 'กำลังเปิดกล้องสแกน QR Code...' : 'Starting Live QR Scanner...'}
                    </p>
                    {cameraError && (
                      <div className="text-[11px] text-amber-200 bg-amber-950/80 p-2.5 rounded-xl border border-amber-800 max-w-xs text-left">
                        <AlertCircle className="w-4 h-4 text-amber-400 mb-1" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detected Unit Card (Instant Action Popup) */}
              {detectedUnit && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl animate-in zoom-in-95 space-y-3 shadow-md text-left">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-base text-emerald-950">{detectedUnit.id}</span>
                          <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {detectedUnit.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                          📍 {isTh ? detectedUnit.buildingTh || detectedUnit.building : detectedUnit.building} ({isTh ? detectedUnit.roomLocationTh || detectedUnit.roomLocation : detectedUnit.roomLocation}) ชั้น {detectedUnit.floor}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      {detectedUnit.assetId}
                    </span>
                  </div>

                  {/* Scanned Unit Details: Expiry, Inspection history count, and status */}
                  <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">{isTh ? 'กำหนดตรวจรอบนี้' : 'Due Date'}</span>
                      <span className="font-extrabold text-[#d32f2f] text-xs block">{detectedUnit.nextDueDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">{isTh ? 'ตรวจล่าสุด' : 'Last Inspection'}</span>
                      <span className="font-bold text-gray-700 text-xs block">{detectedUnit.lastInspectionDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">{isTh ? 'ประวัติตรวจย้อนหลัง' : 'History Logs'}</span>
                      <span className="font-extrabold text-emerald-700 text-xs block">
                        {detectedUnitRecords.length} {isTh ? 'ครั้ง' : 'records'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Inspection History Preview */}
                  {detectedUnitRecords.length > 0 && (
                    <div className="bg-white/70 p-2 rounded-lg border border-emerald-200 text-[11px] text-gray-700">
                      <span className="font-bold text-emerald-950 block mb-0.5">
                        🕒 {isTh ? 'ผลตรวจล่าสุด:' : 'Latest Inspection Result:'}
                      </span>
                      <p className="truncate text-gray-600">
                        {detectedUnitRecords[0].date} โดย {isTh ? detectedUnitRecords[0].inspectorNameTh || detectedUnitRecords[0].inspectorName : detectedUnitRecords[0].inspectorName} — 
                        <strong className={detectedUnitRecords[0].status === 'passed' ? 'text-emerald-700' : 'text-red-700'}>
                          {detectedUnitRecords[0].status === 'passed' ? ' ผ่านเกณฑ์ (Passed)' : ' พบข้อบกพร่อง'}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleProceedWithUnit('inspect')}
                      className="py-2.5 px-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isTh ? '⚡ เริ่มตรวจ 7 จุดทันที' : 'Inspect Now (7-Point)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleProceedWithUnit('detail')}
                      className="py-2.5 px-3 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{isTh ? 'ดูประวัติ & ข้อมูลเต็ม' : 'View History & Specs'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Detected Non-matching Raw Text */}
              {detectedRawText && !detectedUnit && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-left space-y-1 text-xs animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{isTh ? 'สแกนพบข้อความ แต่ไม่ตรงกับรหัสถังในระบบ:' : 'Scanned text (Not matched to registered units):'}</span>
                  </div>
                  <p className="font-mono text-[11px] bg-white p-2 rounded-lg border border-amber-200 text-gray-800 break-all">
                    {detectedRawText}
                  </p>
                </div>
              )}

              {/* Upload QR Image file */}
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors">
                  <ImageIcon className="w-4 h-4 text-[#d32f2f]" />
                  <span>{isTh ? '📁 สแกนจากรูปภาพ / แคปหน้าจอ' : 'Scan from Photo File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileScan}
                  />
                </label>
              </div>

              {fileScanError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{fileScanError}</span>
                </div>
              )}

              {/* Manual Search & Paste Link Input */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-left">
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>{isTh ? 'ค้นหาด้วยรหัสถัง หรือ วางลิงก์ QR' : 'Search by ID or Paste Link'}</span>
                  <span className="text-[10px] text-gray-400 font-normal">e.g. FE-2041 or 2041</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedInput}
                    onChange={(e) => setScannedInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                    placeholder="FE-2041 or https://..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                  />
                  <button
                    type="button"
                    onClick={handleManualSearch}
                    disabled={scanning || !scannedInput.trim()}
                    className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>{isTh ? 'ค้นหา' : 'Search'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Test Unit Selector */}
              {extinguishers.length > 0 && (
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isTh ? 'เลือกถังในระบบเพื่อทดสอบด่วน:' : 'Quick Select Extinguisher:'}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {extinguishers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleScanResult(u.id)}
                        className="p-2.5 bg-white hover:bg-red-50 hover:border-red-200 border border-gray-200 rounded-xl text-left transition-all shadow-2xs group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-gray-900 group-hover:text-[#d32f2f]">{u.id}</span>
                          <span className={`w-2 h-2 rounded-full ${u.status === 'normal' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {isTh ? u.buildingTh || u.building : u.building} - {isTh ? u.roomLocationTh || u.roomLocation : u.roomLocation}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
