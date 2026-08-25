import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Eye, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  Info,
  Image as ImageIcon,
  Layers,
  MousePointer,
  Move
} from 'lucide-react';
import { ExtinguisherUnit, CustomMapPin, CustomFloorPlan, Language } from '../../types';

interface FacilityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  extinguishers: ExtinguisherUnit[];
  onSelectUnit: (unit: ExtinguisherUnit) => void;
  onUpdateUnit?: (unit: ExtinguisherUnit) => void;
}

const DEFAULT_MAPS: CustomFloorPlan[] = [];

const COLOR_OPTIONS = [
  { id: 'red', nameTh: 'สีแดง (ฉุกเฉิน/ดับเพลิง)', nameEn: 'Red (Emergency)', bgClass: 'bg-red-600 ring-red-300', hex: '#dc2626' },
  { id: 'emerald', nameTh: 'สีเขียว (ปกติ/ปลอดภัย)', nameEn: 'Green (Normal)', bgClass: 'bg-emerald-500 ring-emerald-300', hex: '#10b981' },
  { id: 'amber', nameTh: 'สีเหลือง/ส้ม (แจ้งเตือน)', nameEn: 'Yellow (Warning)', bgClass: 'bg-amber-500 ring-amber-300', hex: '#f59e0b' },
  { id: 'blue', nameTh: 'สีน้ำเงิน (อุปกรณ์น้ำ)', nameEn: 'Blue (Water/Service)', bgClass: 'bg-blue-600 ring-blue-300', hex: '#2563eb' },
  { id: 'purple', nameTh: 'สีม่วง (จุดตรวจพิเศษ)', nameEn: 'Purple (Inspection)', bgClass: 'bg-purple-600 ring-purple-300', hex: '#9333ea' },
  { id: 'cyan', nameTh: 'สีฟ้า (ปุ่มกดเตือนภัย)', nameEn: 'Cyan (Alarm)', bgClass: 'bg-cyan-500 ring-cyan-300', hex: '#06b6d4' },
  { id: 'pink', nameTh: 'สีชมพู (ปฐมพยาบาล)', nameEn: 'Pink (First Aid)', bgClass: 'bg-pink-500 ring-pink-300', hex: '#ec4899' },
];

export const FacilityMapModal: React.FC<FacilityMapModalProps> = ({
  isOpen,
  onClose,
  lang,
  extinguishers,
  onSelectUnit,
  onUpdateUnit,
}) => {
  if (!isOpen) return null;

  const isTh = lang === 'th';
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  // Dragging Pin State & Refs
  const [draggingPin, setDraggingPin] = useState<{ type: 'unit' | 'custom'; id: string } | null>(null);
  const wasDraggedRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Persistence in localStorage
  const [floorPlans, setFloorPlans] = useState<CustomFloorPlan[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_custom_floorplans');
      return saved ? JSON.parse(saved) : DEFAULT_MAPS;
    } catch {
      return DEFAULT_MAPS;
    }
  });

  const [activePlanId, setActivePlanId] = useState<string>(floorPlans[0]?.id || 'plan-default');

  const [customPins, setCustomPins] = useState<CustomMapPin[]>(() => {
    try {
      const saved = localStorage.getItem('firesafe_custom_mappins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dragging pin handlers
  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'unit' | 'custom',
    item: ExtinguisherUnit | CustomMapPin
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPosRef.current = { x: clientX, y: clientY };
    wasDraggedRef.current = false;
    setDraggingPin({ type, id: item.id });
    setSelectedPin({ type, item });
  };

  useEffect(() => {
    if (!draggingPin) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!mapCanvasRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (dragStartPosRef.current) {
        const dist = Math.hypot(clientX - dragStartPosRef.current.x, clientY - dragStartPosRef.current.y);
        if (dist > 3) {
          wasDraggedRef.current = true;
        }
      }

      const rect = mapCanvasRef.current.getBoundingClientRect();
      let xPct = Math.round(((clientX - rect.left) / rect.width) * 100);
      let yPct = Math.round(((clientY - rect.top) / rect.height) * 100);

      xPct = Math.max(2, Math.min(98, xPct));
      yPct = Math.max(2, Math.min(98, yPct));

      if (draggingPin.type === 'unit') {
        const unit = extinguishers.find(u => u.id === draggingPin.id);
        if (unit && onUpdateUnit) {
          onUpdateUnit({
            ...unit,
            xPos: xPct,
            yPos: yPct,
          });
        }
      } else if (draggingPin.type === 'custom') {
        setCustomPins(prev =>
          prev.map(p => (p.id === draggingPin.id ? { ...p, xPos: xPct, yPos: yPct } : p))
        );
      }
    };

    const handleUp = () => {
      setDraggingPin(null);
      setTimeout(() => {
        wasDraggedRef.current = false;
      }, 50);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggingPin, extinguishers, onUpdateUnit]);

  // State controls
  const [mode, setMode] = useState<'view' | 'add'>('view');
  const [selectedPin, setSelectedPin] = useState<{ type: 'unit' | 'custom'; item: ExtinguisherUnit | CustomMapPin } | null>(
    extinguishers[0] ? { type: 'unit', item: extinguishers[0] } : null
  );

  // New Pin Form Modal State
  const [isPinFormOpen, setIsPinFormOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [pinFormData, setPinFormData] = useState({
    title: '',
    description: '',
    color: 'red',
    iconType: 'flame' as 'flame' | 'shield' | 'alert' | 'check' | 'map_pin' | 'info',
    unitId: '',
  });

  // Upload Floor Plan Modal State
  const [isUploadPlanOpen, setIsUploadPlanOpen] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    imageUrl: '',
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('firesafe_custom_floorplans', JSON.stringify(floorPlans));
    } catch (e) {
      console.error(e);
    }
  }, [floorPlans]);

  useEffect(() => {
    try {
      localStorage.setItem('firesafe_custom_mappins', JSON.stringify(customPins));
    } catch (e) {
      console.error(e);
    }
  }, [customPins]);

  const activePlan = floorPlans.find(p => p.id === activePlanId) || floorPlans[0] || null;

  const handleDeleteFloorPlan = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setFloorPlans(prev => {
      const filtered = prev.filter(p => p.id !== planId);
      if (activePlanId === planId) {
        setActivePlanId(filtered[0]?.id || '');
      }
      return filtered;
    });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-500 ring-emerald-300';
      case 'due_soon': return 'bg-amber-500 ring-amber-300';
      case 'expired':
      case 'critical': return 'bg-red-600 ring-red-300 animate-bounce';
      default: return 'bg-gray-500 ring-gray-300';
    }
  };

  const getColorClass = (colorId: string) => {
    const found = COLOR_OPTIONS.find(c => c.id === colorId);
    return found ? found.bgClass : 'bg-red-600 ring-red-300';
  };

  // Handle clicking on map image to place a new pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (wasDraggedRef.current) return;
    if (mode !== 'add') return;
    if (!mapCanvasRef.current) return;

    const rect = mapCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round(Math.max(2, Math.min(98, (clickX / rect.width) * 100)));
    const yPercent = Math.round(Math.max(2, Math.min(98, (clickY / rect.height) * 100)));

    setTempCoords({ x: xPercent, y: yPercent });
    setEditingPinId(null);
    setPinFormData({
      title: isTh ? 'หมุดจุดระบุใหม่' : 'New Custom Marker',
      description: isTh ? `ตำแหน่ง X: ${xPercent}%, Y: ${yPercent}%` : `Location X: ${xPercent}%, Y: ${yPercent}%`,
      color: 'red',
      iconType: 'flame',
      unitId: '',
    });
    setIsPinFormOpen(true);
  };

  // Handle saving new or edited pin
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinFormData.title.trim()) return;

    if (editingPinId) {
      setCustomPins(prev => prev.map(p => p.id === editingPinId ? {
        ...p,
        title: pinFormData.title,
        description: pinFormData.description,
        color: pinFormData.color,
        iconType: pinFormData.iconType,
        unitId: pinFormData.unitId || undefined,
      } : p));
    } else {
      const newPin: CustomMapPin = {
        id: `PIN-${Date.now()}`,
        title: pinFormData.title,
        description: pinFormData.description,
        xPos: tempCoords.x,
        yPos: tempCoords.y,
        color: pinFormData.color,
        iconType: pinFormData.iconType,
        unitId: pinFormData.unitId || undefined,
      };
      setCustomPins(prev => [...prev, newPin]);
      setSelectedPin({ type: 'custom', item: newPin });
    }

    setIsPinFormOpen(false);
  };

  // Handle editing custom pin
  const handleEditPin = (pin: CustomMapPin) => {
    setEditingPinId(pin.id);
    setTempCoords({ x: pin.xPos, y: pin.yPos });
    setPinFormData({
      title: pin.title,
      description: pin.description || '',
      color: pin.color || 'red',
      iconType: pin.iconType || 'flame',
      unitId: pin.unitId || '',
    });
    setIsPinFormOpen(true);
  };

  // Handle deleting custom pin
  const handleDeletePin = (pinId: string) => {
    setCustomPins(prev => prev.filter(p => p.id !== pinId));
    if (selectedPin?.type === 'custom' && (selectedPin.item as CustomMapPin).id === pinId) {
      setSelectedPin(null);
    }
  };

  // Handle Floor Plan File Upload
  const handlePlanFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPlanFormData(prev => ({
            ...prev,
            imageUrl: reader.result as string,
            name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save new Floor Plan
  const handleSaveFloorPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.imageUrl || !planFormData.name) return;

    const newPlan: CustomFloorPlan = {
      id: `plan-${Date.now()}`,
      name: planFormData.name,
      imageUrl: planFormData.imageUrl,
    };

    setFloorPlans(prev => [...prev, newPlan]);
    setActivePlanId(newPlan.id);
    setIsUploadPlanOpen(false);
    setPlanFormData({ name: '', imageUrl: '' });
  };

  // Render Icon component based on string
  const renderPinIcon = (iconType?: string) => {
    switch (iconType) {
      case 'shield': return <Shield className="w-3.5 h-3.5 fill-current" />;
      case 'alert': return <AlertTriangle className="w-3.5 h-3.5 fill-current" />;
      case 'check': return <CheckCircle2 className="w-3.5 h-3.5 fill-current" />;
      case 'map_pin': return <MapPin className="w-3.5 h-3.5 fill-current" />;
      case 'info': return <Info className="w-3.5 h-3.5 fill-current" />;
      default: return <Flame className="w-3.5 h-3.5 fill-current" />;
    }
  };

  return (
    <div id="facility-map-modal-backdrop" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-[#d32f2f] rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {isTh ? 'แผนผังอาคารและจัดการพิกัดหมุดอุปกรณ์' : 'Facility Floor Plans & Custom Map Pins'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'สามารถอัปโหลดผังอาคารเอง และคลิกบนผังเพื่อเพิ่มหมุดสีระบุตำแหน่งได้ตามต้องการ' : 'Upload custom floor plans and click anywhere on map to add custom colored pins'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadPlanOpen(true)}
              className="px-3.5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isTh ? '+ เพิ่มรูปผังอาคาร' : '+ Add Floor Plan Image'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title={isTh ? 'ปิดหน้าต่าง' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Bar: Floor Plan Switcher & Add Pin Toggle */}
        <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 shrink-0">
          
          {/* Plan Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-[#d32f2f]" />
              {isTh ? 'ผังอาคาร:' : 'Map:'}
            </span>
            {floorPlans.map((plan) => (
              <div
                key={plan.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activePlanId === plan.id
                    ? 'bg-[#d32f2f] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActivePlanId(plan.id)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{plan.name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteFloorPlan(e, plan.id)}
                  title={isTh ? 'ลบผังนี้' : 'Delete plan'}
                  className={`p-0.5 rounded-md hover:bg-black/20 transition-colors ${
                    activePlanId === plan.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <button
              onClick={() => setIsUploadPlanOpen(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isTh ? '+ อัปโหลดผังอาคารเอง' : '+ Add Custom Plan'}</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl shrink-0 text-xs font-bold">
            <button
              onClick={() => setMode('view')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                mode === 'view' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTh ? 'ดูหมุด' : 'View Pins'}</span>
            </button>

            <button
              onClick={() => setMode('add')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                mode === 'add' ? 'bg-[#d32f2f] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isTh ? '+ คลิกบนผังเพื่อเพิ่มหมุด' : '+ Click Map to Add Pin'}</span>
            </button>
          </div>

        </div>

        {/* Interactive Map Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-3 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Blueprint Canvas */}
          <div className="lg:col-span-2 relative bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 min-h-[380px] flex items-center justify-center group shadow-inner select-none">
            
            {/* Click Container */}
            <div
              ref={mapCanvasRef}
              onClick={handleMapClick}
              className={`relative w-full h-full flex items-center justify-center cursor-crosshair overflow-hidden`}
            >
              {/* Floor Plan Image or Upload Prompt */}
              {activePlan?.imageUrl ? (
                <>
                  <img
                    src={activePlan.imageUrl}
                    alt={activePlan.name}
                    className="w-full h-full object-contain max-h-[500px] opacity-90 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Mode Instruction Overlay Banner */}
                  {mode === 'add' ? (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#d32f2f]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse pointer-events-none flex items-center gap-2 z-30">
                      <Plus className="w-4 h-4" />
                      <span>{isTh ? 'คลิกที่ตำแหน่งใดก็ได้บนแผนผัง เพื่อปักหมุดใหม่' : 'Click anywhere on floor plan to place a new marker'}</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold shadow-lg pointer-events-none flex items-center gap-1.5 z-30 border border-gray-700">
                      <Move className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTh ? 'สามารถคลิกลากหมุดจุดถังดับเพลิงเพื่อย้ายตำแหน่งได้' : 'Drag any marker to reposition'}</span>
                    </div>
                  )}

                  {/* 1. Inventory Extinguisher Pins */}
                  {extinguishers.map((unit) => {
                    const isSelected = selectedPin?.type === 'unit' && (selectedPin.item as ExtinguisherUnit).id === unit.id;
                    const x = unit.xPos || 50;
                    const y = unit.yPos || 50;
                    const isDraggingThis = draggingPin?.type === 'unit' && draggingPin.id === unit.id;

                    return (
                      <div
                        key={`unit-${unit.id}`}
                        onMouseDown={(e) => handleStartDrag(e, 'unit', unit)}
                        onTouchStart={(e) => handleStartDrag(e, 'unit', unit)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!wasDraggedRef.current) {
                            setSelectedPin({ type: 'unit', item: unit });
                          }
                        }}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin focus:outline-none z-20 cursor-grab active:cursor-grabbing select-none ${
                          isDraggingThis ? 'z-40 scale-125' : ''
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full ${getStatusColorClass(unit.status)} ring-4 text-white flex items-center justify-center font-extrabold text-xs shadow-xl transition-transform ${
                          isSelected ? 'scale-125 ring-white' : 'hover:scale-110'
                        }`}>
                          <Flame className="w-4.5 h-4.5 fill-current" />
                        </span>

                        <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur-md text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none z-30 border border-gray-700 text-center">
                          <p className="font-bold text-red-400 flex items-center justify-center gap-1">
                            {unit.id} <span className="text-[9px] text-gray-400 font-normal">(ลากเพื่อย้าย)</span>
                          </p>
                          <p className="text-gray-300">{isTh ? unit.buildingTh : unit.building}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* 2. Custom User-Added Colored Pins */}
                  {customPins.map((pin) => {
                    const isSelected = selectedPin?.type === 'custom' && (selectedPin.item as CustomMapPin).id === pin.id;
                    const bgClass = getColorClass(pin.color);
                    const isDraggingThis = draggingPin?.type === 'custom' && draggingPin.id === pin.id;

                    return (
                      <div
                        key={`custom-${pin.id}`}
                        onMouseDown={(e) => handleStartDrag(e, 'custom', pin)}
                        onTouchStart={(e) => handleStartDrag(e, 'custom', pin)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!wasDraggedRef.current) {
                            setSelectedPin({ type: 'custom', item: pin });
                          }
                        }}
                        style={{ left: `${pin.xPos}%`, top: `${pin.yPos}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin focus:outline-none z-20 cursor-grab active:cursor-grabbing select-none ${
                          isDraggingThis ? 'z-40 scale-125' : ''
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full ${bgClass} ring-4 text-white flex items-center justify-center font-extrabold text-xs shadow-xl transition-transform ${
                          isSelected ? 'scale-125 ring-white' : 'hover:scale-110'
                        }`}>
                          {renderPinIcon(pin.iconType)}
                        </span>

                        <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur-md text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none z-30 border border-gray-700 text-center">
                          <p className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                            📍 {pin.title} <span className="text-[9px] text-gray-400 font-normal">(ลากเพื่อย้าย)</span>
                          </p>
                          {pin.description && <p className="text-gray-300">{pin.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto cursor-default select-none"
                >
                  <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="w-8 h-8 text-[#d32f2f]" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-100">
                      {isTh ? 'ยังไม่ได้เพิ่มรูปผังอาคาร' : 'No Floor Plan Image Uploaded'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                      {isTh ? 'กดปุ่มอัปโหลดด้านล่างเพื่อเพิ่มรูปภาพผังอาคารของคุณ สำหรับใช้ปักหมุดตำแหน่งถังดับเพลิง' : 'Click the upload button below to add your floor plan image for mapping fire extinguishers.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadPlanOpen(true)}
                    className="px-5 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isTh ? '+ อัปโหลดรูปผังอาคาร' : '+ Upload Floor Plan'}</span>
                  </button>
                </div>
              )}

            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] text-white border border-gray-700 flex flex-wrap items-center gap-3 z-20">
              <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> {isTh ? 'ถังดับเพลิง/ฉุกเฉิน' : 'Fire Extinguisher'}</span>
              <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {isTh ? 'ปลอดภัย' : 'Normal'}</span>
              <span className="flex items-center gap-1.5 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> {isTh ? 'จุดตรวจพิเศษ' : 'Custom Pin'}</span>
            </div>

          </div>

          {/* Selected Item / Pin Details Panel */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between">
            {selectedPin ? (
              <div className="space-y-4">
                
                {selectedPin.type === 'unit' ? (
                  // Extinguisher Unit details
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {isTh ? 'อุปกรณ์ดับเพลิงในคลัง' : 'Inventory Extinguisher'}
                      </span>
                      <h4 className="font-extrabold text-2xl text-gray-900">{(selectedPin.item as ExtinguisherUnit).id}</h4>
                      <p className="text-xs text-gray-500 font-mono">{(selectedPin.item as ExtinguisherUnit).assetId}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold">{isTh ? 'ตำแหน่งสถานที่' : 'Location'}</p>
                        <p className="font-bold text-gray-800">{isTh ? (selectedPin.item as ExtinguisherUnit).buildingTh : (selectedPin.item as ExtinguisherUnit).building}</p>
                        <p className="text-gray-500">{isTh ? (selectedPin.item as ExtinguisherUnit).roomLocationTh : (selectedPin.item as ExtinguisherUnit).roomLocation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">{isTh ? 'ประเภท' : 'Type'}</p>
                          <p className="font-bold text-gray-800 uppercase">{(selectedPin.item as ExtinguisherUnit).type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">{isTh ? 'กำหนดตรวจ' : 'Due Date'}</p>
                          <p className="font-bold text-[#d32f2f]">{(selectedPin.item as ExtinguisherUnit).nextDueDate}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectUnit(selectedPin.item as ExtinguisherUnit);
                        onClose();
                      }}
                      className="w-full py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isTh ? 'เปิดดูรายละเอียดฉบับเต็ม' : 'Full Specifications'}</span>
                    </button>
                  </div>
                ) : (
                  // Custom Pin details
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getColorClass((selectedPin.item as CustomMapPin).color)} inline-block`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {isTh ? 'หมุดกำหนดเอง' : 'Custom Added Pin'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xl text-gray-900 mt-1">{(selectedPin.item as CustomMapPin).title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{(selectedPin.item as CustomMapPin).description || (isTh ? 'ไม่มีรายละเอียดเพิ่มเติม' : 'No description')}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1 font-mono text-gray-600">
                      <p><span className="font-bold text-gray-800">Coordinate:</span> X: {(selectedPin.item as CustomMapPin).xPos}%, Y: {(selectedPin.item as CustomMapPin).yPos}%</p>
                      {(selectedPin.item as CustomMapPin).unitId && (
                        <p><span className="font-bold text-gray-800">Linked Asset:</span> {(selectedPin.item as CustomMapPin).unitId}</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEditPin(selectedPin.item as CustomMapPin)}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isTh ? 'แก้ไขหมุด' : 'Edit Pin'}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePin((selectedPin.item as CustomMapPin).id)}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isTh ? 'ลบ' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium">
                  {isTh ? 'คลิกเลือกหมุดบนแผนผังเพื่อดู หรือคลิกเพิ่มหมุดใหม่' : 'Click a marker on map to view or click map to add pin'}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal 1: Add/Edit Custom Pin Form Dialog */}
      {isPinFormOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#d32f2f]" />
                <span>{editingPinId ? (isTh ? 'แก้ไขข้อมูลหมุด' : 'Edit Pin') : (isTh ? 'กำหนดหมุดใหม่บนแผนผัง' : 'Add Custom Map Pin')}</span>
              </h4>
              <button onClick={() => setIsPinFormOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'ชื่อหมุด / จุดติดตั้ง' : 'Pin Title / Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={pinFormData.title}
                  onChange={(e) => setPinFormData({ ...pinFormData, title: e.target.value })}
                  placeholder="เช่น ตู้สายฉีดน้ำดับเพลิง, ถัง CO2 หน้าลิฟต์"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'เลือกสีของหมุด' : 'Pin Color'} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPinFormData({ ...pinFormData, color: c.id })}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-[11px] font-bold ${
                        pinFormData.color === c.id
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.bgClass}`} />
                      <span className="capitalize">{c.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'รายละเอียดตำแหน่ง' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={pinFormData.description}
                  onChange={(e) => setPinFormData({ ...pinFormData, description: e.target.value })}
                  placeholder="รายละเอียด หรือคำเตือนการตรวจเช็ก..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'เชื่อมโยงกับถังดับเพลิงในคลัง (ถ้ามี)' : 'Link to Extinguisher Unit (Optional)'}
                </label>
                <select
                  value={pinFormData.unitId}
                  onChange={(e) => setPinFormData({ ...pinFormData, unitId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
                >
                  <option value="">{isTh ? '-- ไม่เชื่อมโยง --' : '-- None --'}</option>
                  {extinguishers.map(u => (
                    <option key={u.id} value={u.id}>{u.id} - {u.buildingTh}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] font-bold text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isTh ? 'บันทึกหมุด' : 'Save Pin'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Custom Floor Plan Dialog */}
      {isUploadPlanOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#d32f2f]" />
                <span>{isTh ? 'อัปโหลด / เพิ่มแผนผังอาคารใหม่' : 'Upload Custom Floor Plan'}</span>
              </h4>
              <button onClick={() => setIsUploadPlanOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFloorPlan} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'ชื่อแผนผัง / ชื่ออาคาร-ชั้น' : 'Floor Plan Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="เช่น ผังอาคารอำนวยการ ชั้น 1"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'เลือกไฟล์ภาพแผนผังจากเครื่อง' : 'Upload Image File'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePlanFileUpload}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isTh ? 'หรือใส่ URL รูปภาพแผนผัง' : 'Or Image URL'}
                </label>
                <input
                  type="text"
                  value={planFormData.imageUrl}
                  onChange={(e) => setPlanFormData({ ...planFormData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30 font-mono text-[11px]"
                />
              </div>

              {planFormData.imageUrl && (
                <div className="p-2 bg-gray-100 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-500 mb-1">{isTh ? 'ตัวอย่างแผนผัง:' : 'Preview:'}</p>
                  <img src={planFormData.imageUrl} alt="Preview" className="max-h-32 w-full object-contain rounded-lg" />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadPlanOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!planFormData.imageUrl || !planFormData.name}
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] disabled:opacity-50 font-bold text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isTh ? 'บันทึกผังอาคาร' : 'Save Plan'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
