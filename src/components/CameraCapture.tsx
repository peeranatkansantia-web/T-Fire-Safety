import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Trash2, Upload, CheckCircle2, AlertCircle, Eye, FlipHorizontal } from 'lucide-react';
import { Language } from '../types';

interface CameraCaptureProps {
  lang: Language;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  label?: string;
  sublabel?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  lang,
  photoUrl,
  onPhotoChange,
  label,
  sublabel,
}) => {
  const isTh = lang === 'th';

  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount or mode switch
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopStream();
    setCameraError('');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsStreaming(false);
      setCameraError(
        isTh
          ? 'ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบการอนุญาตสิทธิ์ หรือใช้วิธีอัปโหลดรูปแทน'
          : 'Unable to access camera. Please allow permissions or upload a photo file.'
      );
    }
  };

  const handleSwitchToCamera = () => {
    setMode('camera');
    startCamera(facingMode);
  };

  const handleSwitchToUpload = () => {
    stopStream();
    setMode('upload');
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add watermark overlay
      const now = new Date();
      const timeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} • RT-FIRE SAFETY VERIFIED`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(timeString, 12, canvas.height - 10);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onPhotoChange(dataUrl);
      stopStream();
      setMode('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onPhotoChange(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    onPhotoChange(null);
  };

  return (
    <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 text-xs space-y-3">
      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-gray-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#d32f2f]" />
            <span>{label || (isTh ? 'ภาพถ่ายหลักฐานหน้างาน (Photo Evidence)' : 'Inspection Photo Evidence')}</span>
          </label>
          <p className="text-[10px] text-gray-500">
            {sublabel || (isTh ? 'ถ่ายภาพสภาพถัง เข็มเกจ หรือจุดชำรุดเพื่อแนบในรายงาน' : 'Capture photo of gauge, seal, or defects')}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-white p-0.5 rounded-xl border border-gray-200 shadow-2xs font-bold text-[10px]">
          <button
            type="button"
            onClick={handleSwitchToUpload}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mode === 'upload' ? 'bg-[#d32f2f] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>{isTh ? 'ไฟล์/อัลบั้ม' : 'File'}</span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToCamera}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mode === 'camera' ? 'bg-[#d32f2f] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>{isTh ? 'เปิดกล้องสด' : 'Camera'}</span>
          </button>
        </div>
      </div>

      {/* Hidden canvas for snapshot rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Live Stream View */}
      {mode === 'camera' && (
        <div className="space-y-2">
          <div className="relative w-full h-52 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-gray-300 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Reticle / Focus Frame */}
            <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-md font-mono">
                {isTh ? 'จัดถังดับเพลิงให้อยู่ในกรอบ' : 'Align Extinguisher in Frame'}
              </span>
            </div>

            {/* Toggle Camera (Front/Back) */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl text-xs flex items-center gap-1 backdrop-blur-xs"
              title={isTh ? 'สลับกล้องหน้า-หลัง' : 'Switch Camera'}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          {cameraError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Capture Trigger Button */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSwitchToUpload}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs"
            >
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={!isStreaming}
              className="flex-1 py-2 bg-[#d32f2f] hover:bg-[#af101a] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <Camera className="w-4 h-4" />
              <span>{isTh ? '📸 กดถ่ายภาพทันที' : '📸 Snap Photo'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload & Photo Preview Mode */}
      {mode === 'upload' && (
        <div>
          {photoUrl ? (
            /* Has Photo Attached */
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                <img
                  src={photoUrl}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isTh ? 'แนบภาพถ่ายหลักฐานแล้ว' : 'Photo Attached'}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {isTh ? 'พร้อมส่งออกในรายงานและบันทึกประวัติ' : 'Ready for audit report & LINE'}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title={isTh ? 'ลบภาพนี้' : 'Delete Photo'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* No Photo Yet - Upload prompt */
            <label className="border-2 border-dashed border-gray-300 hover:border-[#d32f2f] bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-red-50/20 group">
              <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 text-[#d32f2f] flex items-center justify-center mb-1.5 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-800 text-xs group-hover:text-[#d32f2f]">
                {isTh ? 'คลิกเพื่อเลือกรูปภาพจากเครื่อง หรือ ลากไฟล์มาวางที่นี่' : 'Click to upload image or drag & drop'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                PNG, JPG, HEIC up to 10MB
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
