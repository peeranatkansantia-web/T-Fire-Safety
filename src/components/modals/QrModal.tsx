import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { ExtinguisherUnit, Language } from '../../types';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  unit: ExtinguisherUnit | null;
  extinguishers?: ExtinguisherUnit[];
  onScanSuccess?: (unitId: string, action?: 'inspect' | 'detail') => void;
  onUpdateUnit?: (updatedUnit: ExtinguisherUnit) => void;
  mode?: 'view' | 'scanner';
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  lang,
  unit,
  extinguishers = [],
  onScanSuccess,
  onUpdateUnit,
  mode = 'view',
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';
  const [activeTab, setActiveTab] = useState<'view' | 'scanner'>(mode);
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

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const activeUnit = extinguishers.find(u => u.id === selectedUnitId) || unit || extinguishers[0] || null;

  // Custom QR Payload state
  const [customQrPayload, setCustomQrPayload] = useState<string>('');

  // Sync mode, selected unit, and default payload when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
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

  // Set default payload (Web URL format by default for universal mobile scanning)
  useEffect(() => {
    if (activeUnit) {
      if (activeUnit.customQrData) {
        setCustomQrPayload(activeUnit.customQrData);
      } else {
        const origin = window.location.origin;
        const pathname = window.location.pathname;
        setCustomQrPayload(`${origin}${pathname}?unit=${activeUnit.id}`);
      }
      setSavedSuccess(false);
    }
  }, [activeUnit]);

  // Generate local QR Code Data URL dynamically
  useEffect(() => {
    if (!activeUnit) return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const fallbackUrl = `${origin}${pathname}?unit=${activeUnit.id}`;
    const dataToEncode = customQrPayload.trim() || fallbackUrl;

    QRCode.toDataURL(dataToEncode, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1b1c1c',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [customQrPayload, activeUnit]);

  // Robust unit parser from QR text/URL/JSON
  const parseUnitFromText = (rawText: string): ExtinguisherUnit | null => {
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    let targetId = '';

    // Check URL pattern: ?unit=... or ?id=... or ?inspect=... or hash #unit=...
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        targetId = url.searchParams.get('unit') || url.searchParams.get('id') || url.searchParams.get('inspect') || '';
        if (!targetId && url.hash) {
          const match = url.hash.match(/(?:unit|inspect|id)[=:/-]?([A-Za-z0-9-_]+)/i);
          if (match) targetId = match[1];
        }
      }
    } catch (e) {}

    // Check JSON pattern
    if (!targetId && trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        targetId = parsed.unitId || parsed.id || parsed.assetId || '';
      } catch (e) {}
    }

    // Check FIRESAFE- prefix
    if (!targetId && /^FIRESAFE-/i.test(trimmed)) {
      targetId = trimmed.replace(/^FIRESAFE-/i, '').trim();
    }

    // Check "ID: FE-xxxx"
    if (!targetId) {
      const match = trimmed.match(/\bID:\s*([A-Za-z0-9-_]+)/i);
      if (match) targetId = match[1];
    }

    // Direct match with extinguishers list
    if (!targetId) {
      const direct = extinguishers.find(u => 
        u.id.toLowerCase() === trimmed.toLowerCase() ||
        u.assetId.toLowerCase() === trimmed.toLowerCase() ||
        (u.customQrData && u.customQrData.toLowerCase() === trimmed.toLowerCase())
      );
      if (direct) return direct;
      targetId = trimmed;
    }

    // Find unit by ID or Asset ID
    const found = extinguishers.find(u => 
      u.id.toLowerCase() === targetId.toLowerCase() || 
      u.assetId.toLowerCase() === targetId.toLowerCase() ||
      (u.customQrData && u.customQrData.toLowerCase() === trimmed.toLowerCase())
    );

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
            fps: 10,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minDim = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minDim * 0.75);
              return { width: Math.max(180, size), height: Math.max(180, size) };
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
          } catch (envErr) {
            // Fallback: list cameras and pick first available
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const cameraId = cameras[cameras.length - 1].id; // usually back camera
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
                ? 'ไม่สามารถเปิดกล้องได้ (โปรดอนุญาตสิทธิ์กล้อง หรือใช้ฟังก์ชันอัปโหลดภาพ/พิมพ์รหัสด้านล่าง)' 
                : 'Camera inaccessible. Please grant permission or use file scan/manual search.'
            );
          }
        }
      }, 350);

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
  }, [isOpen, activeTab]);

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
    }, 300);
  };

  const handleApplyPreset = (type: 'url' | 'id' | 'summary') => {
    if (!activeUnit) return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    if (type === 'url') {
      setCustomQrPayload(`${origin}${pathname}?unit=${activeUnit.id}`);
    } else if (type === 'id') {
      setCustomQrPayload(activeUnit.id);
    } else if (type === 'summary') {
      setCustomQrPayload(
        `ID: ${activeUnit.id} | Asset: ${activeUnit.assetId} | Loc: ${activeUnit.buildingTh} | Type: ${activeUnit.type.toUpperCase()} | Due: ${activeUnit.nextDueDate}`
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

  const handleProceedWithUnit = (action: 'inspect' | 'detail') => {
    if (!detectedUnit) return;
    if (onScanSuccess) {
      onScanSuccess(detectedUnit.id, action);
    }
    onClose();
  };

  return (
    <div id="qr-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden dummy div for file scanner */}
      <div id="qr-file-scanner-dummy" className="hidden"></div>

      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[#d32f2f] rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 leading-tight">
                {isTh ? 'ระบบสร้างและสแกนป้าย QR Code' : 'Equipment QR Center'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isTh ? 'สแกนตรวจทันที / สร้างป้ายติดถังดับเพลิง' : 'Live scan or generate printable badges'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl my-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'view' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isTh ? 'สร้างและพิมพ์ป้าย QR' : 'Create & Print Badge'}</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'scanner' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isTh ? 'สแกน QR Code' : 'Camera Scanner'}</span>
          </button>
        </div>

        {activeTab === 'view' && activeUnit ? (
          <div className="space-y-4">

            {/* Extinguisher Selector */}
            {extinguishers.length > 1 && (
              <div className="text-left bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isTh ? 'เลือกอุปกรณ์ถังดับเพลิง:' : 'Select Extinguisher Unit:'}
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                >
                  {extinguishers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.id} ({u.assetId}) - {isTh ? u.buildingTh || u.building : u.building} [{u.type.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Printable Badge Box */}
            <div id="printable-qr-badge" className="bg-gradient-to-b from-red-50/40 via-white to-gray-50 p-5 rounded-2xl border-2 border-dashed border-red-200 shadow-xs text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#d32f2f] font-extrabold text-xs uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>RT-Fire Safety Inspection Tag</span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono font-bold mb-2">{activeUnit.assetId}</p>

              {/* QR Code Canvas/Image */}
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex items-center justify-center relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${activeUnit.id}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#d32f2f]" />
                    <span className="text-xs font-bold">Generating QR...</span>
                  </div>
                )}
              </div>

              <p className="font-extrabold text-2xl text-gray-900 mt-3 tracking-wider">{activeUnit.id}</p>
              <div className="inline-block mt-1 px-3 py-0.5 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                {isTh ? activeUnit.buildingTh || activeUnit.building : activeUnit.building} • {isTh ? activeUnit.roomLocationTh || activeUnit.roomLocation : activeUnit.roomLocation}
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-mono break-all px-2 bg-gray-50 py-1 rounded-lg border border-gray-200">
                <span className="text-gray-400">QR Data: </span>
                <span className="text-[#d32f2f] font-bold">{customQrPayload}</span>
              </p>
            </div>

            {/* Payload Settings & Presets */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#d32f2f]" />
                  <span>{isTh ? 'ข้อมูล/ลิงก์ที่ฝังใน QR Code' : 'Custom QR Code Payload'}</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="text-[10px] font-bold text-gray-600 hover:text-[#d32f2f] bg-white px-2 py-0.5 rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isTh ? 'คัดลอกแล้ว' : 'Copied!') : (isTh ? 'คัดลอก' : 'Copy')}</span>
                </button>
              </div>

              <input
                type="text"
                value={customQrPayload}
                onChange={(e) => setCustomQrPayload(e.target.value)}
                placeholder="https://... or FE-2041"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
              />

              {/* Presets */}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-gray-500 mb-1">{isTh ? 'เลือกรูปแบบด่วน:' : 'Quick Presets:'}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('url')}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-[#d32f2f] hover:border-red-200 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
                  >
                    🌐 {isTh ? 'ลิงก์เว็บตรง (สแกนตรวจทันที)' : 'Direct Web URL (Recommended)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('id')}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
                  >
                    🏷️ {isTh ? 'รหัสถังเท่านั้น (ID Only)' : 'ID Only'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('summary')}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
                  >
                    📋 {isTh ? 'รายละเอียดครบชุด' : 'Full Specs'}
                  </button>
                </div>
              </div>

              {/* Save payload to unit */}
              {onUpdateUnit && (
                <div className="pt-1.5 flex items-center justify-between border-t border-gray-200/80 mt-2">
                  <span className="text-[10px] text-gray-500">
                    {savedSuccess ? (isTh ? '✅ บันทึกรูปแบบนี้ลงถังนี้แล้ว' : 'Saved to unit!') : (isTh ? 'จำรูปแบบนี้ไว้สำหรับถังนี้' : 'Remember for this unit')}
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePayloadToUnit}
                    className="px-2.5 py-1 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isTh ? 'บันทึกลงถัง' : 'Save to Unit'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons: Print & Download */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 text-[#d32f2f]" />
                <span>{isTh ? 'บันทึกรูป QR (.PNG)' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isTh ? 'พิมพ์ป้ายติดถัง' : 'Print Badge'}</span>
              </button>
            </div>

          </div>
        ) : activeTab === 'view' ? (
          <div className="py-8 text-center text-gray-500 font-bold text-xs">
            {isTh ? 'ไม่พบข้อมูลถังดับเพลิงในระบบ' : 'No extinguisher found in system'}
          </div>
        ) : (
          /* Scanner Tab */
          <div className="space-y-3.5 py-1">
            
            {/* Live Camera Box */}
            <div className="w-full min-h-[230px] bg-gray-950 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border-2 border-[#d32f2f]/40 shadow-inner">
              <div id="qr-reader-container" className="w-full h-full min-h-[230px]"></div>

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
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl animate-in zoom-in-95 space-y-2.5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-emerald-950">{detectedUnit.id}</span>
                        <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          {detectedUnit.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium">
                        {isTh ? detectedUnit.buildingTh || detectedUnit.building : detectedUnit.building} ({isTh ? detectedUnit.roomLocationTh || detectedUnit.roomLocation : detectedUnit.roomLocation})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleProceedWithUnit('inspect')}
                    className="py-2 px-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isTh ? 'ตรวจเช็กทันที' : 'Inspect Now'}</span>
                  </button>

                  <button
                    onClick={() => handleProceedWithUnit('detail')}
                    className="py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>{isTh ? 'ดูข้อมูลถัง' : 'View Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                <span className="text-[10px] text-gray-400 font-normal">e.g. FE-2041</span>
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
  );
};
