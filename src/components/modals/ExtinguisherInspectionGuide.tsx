import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Gauge, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Flame, 
  Sparkles, 
  Layers, 
  Scale, 
  MapPin, 
  FileCheck,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ExtinguisherType, Language } from '../../types';

interface ExtinguisherInspectionGuideProps {
  lang: Language;
  selectedType?: ExtinguisherType;
  onSelectCheckpoint?: (checkpointId: string) => void;
  activeCheckpointId?: string;
  onApplyChecklistQuickFill?: (allPass: boolean) => void;
}

export interface CheckpointInfo {
  id: string;
  number: number;
  titleTh: string;
  titleEn: string;
  icon: React.ReactNode;
  standardTh: string;
  standardEn: string;
  howToInspectTh: string[];
  howToInspectEn: string[];
  defectTh: string[];
  defectEn: string[];
  hotspot: { x: number; y: number; label: string };
  nfpaClause: string;
  frequency: string;
}

export const ExtinguisherInspectionGuide: React.FC<ExtinguisherInspectionGuideProps> = ({
  lang,
  selectedType = 'dry_chemical',
  onSelectCheckpoint,
  activeCheckpointId,
}) => {
  const isTh = lang === 'th';
  const [activeTab, setActiveTab] = useState<'diagram' | 'type_info'>('diagram');
  const [selectedPoint, setSelectedPoint] = useState<string>(activeCheckpointId || 'gauge');
  const [currentExtinguisherType, setCurrentExtinguisherType] = useState<ExtinguisherType>(selectedType);

  // Sync if selectedType prop changes
  React.useEffect(() => {
    if (selectedType) {
      setCurrentExtinguisherType(selectedType);
    }
  }, [selectedType]);

  const checkpoints: CheckpointInfo[] = [
    {
      id: 'gauge',
      number: 1,
      titleTh: 'เกจวัดแรงดัน (Pressure Gauge)',
      titleEn: 'Pressure Gauge & Indicator',
      icon: <Gauge className="w-4 h-4 text-emerald-600" />,
      hotspot: { x: 50, y: 19, label: '1. Pressure Gauge' },
      standardTh: 'เข็มชี้ต้องอยู่ในแถบสีเขียว (Green Zone, 195 PSI ±10%) แสดงว่าแรงดันขับดันพร้อมใช้งานเต็มประสิทธิภาพ',
      standardEn: 'Indicator needle must be centered within the green operable zone (195 PSI).',
      howToInspectTh: [
        'มองตรงระนาบหน้าปัดเกจวัดแรงดัน',
        'ตรวจสอบว่าเข็มชี้ไม่อยู่ในแถบสีแดงซ้าย (Recharge) หรือขวา (Overcharged)',
        'หน้าปัดเกจต้องใสสะอาด กระจกไม่แตกร้าวหรือมีหยดน้ำฝ้าอยู่ข้างใน',
        '*หมายเหตุ: ถัง CO2 ไม่มีเกจวัด ให้ใช้วิธีตรวจชั่งน้ำหนักแทน (Weight Inspection)'
      ],
      howToInspectEn: [
        'View the gauge face directly at eye level',
        'Ensure the indicator needle is strictly inside the Green operable zone',
        'Verify the transparent lens is clear, unbroken, and free of condensation',
        '*Note: CO2 extinguishers do not have gauges; inspect by weighing.'
      ],
      defectTh: [
        'เข็มตกแถบสีแดงซ้าย (Undercharged / แรงดันรั่วไหล)',
        'เข็มเกินแถบสีแดงขวา (Overcharged / แรงดันเกินอันตราย)',
        'กระจกเกจแตกร้าว เข็มค้าง หรือหน้าปัดบิดเบี้ยว'
      ],
      defectEn: [
        'Needle in left red zone (Loss of pressure / Leakage)',
        'Needle in right red zone (Over-pressurized / Hazard)',
        'Broken face glass, stuck indicator needle, or corrosion'
      ],
      nfpaClause: 'NFPA 10 §7.2.2.3',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'pin_seal',
      number: 2,
      titleTh: 'สลักนิรภัยและซีลล็อก (Pin & Tamper Seal)',
      titleEn: 'Safety Pin & Tamper Seal',
      icon: <Lock className="w-4 h-4 text-blue-600" />,
      hotspot: { x: 38, y: 15, label: '2. Safety Pin & Seal' },
      standardTh: 'สลักโลหะต้องเสียบขัดคันบีบอย่างถูกต้อง และผูกรัดด้วยซีลพลาสติกนิรภัย (Plastic Seal) ในสภาพสมบูรณ์ ไม่ขาด',
      standardEn: 'Safety pull-pin must be inserted through lever with tamper seal intact and unbroken.',
      howToInspectTh: [
        'ตรวจดูสลักโลหะ (Pull Pin) เสียบขัดระหว่างคันบีบกับคันหิ้ว',
        'ตรวจสอบสายรัดซีลนิรภัยพลาสติก (Tamper Seal) ยังรัดสนิทแน่นหนา',
        'ซีลต้องไม่ถูกตัด ไม่ยืดหย่อน และไม่เป็นรอยไหม้หรือเปราะหัก'
      ],
      howToInspectEn: [
        'Verify the safety pull-pin is securely fitted preventing accidental discharge',
        'Check the plastic tamper indicator wire is sealed intact without cuts',
        'Ensure the pin pulls out smoothly only when intentional force is applied'
      ],
      defectTh: [
        'สลักนิรภัยหลุดหาย หรือถูกดัดแปลงด้วยลวดธรรมดา',
        'ซีลพลาสติกขาด หลุดหาย หรือถูกแกะใช้งานแล้ว',
        'สลักขึ้นสนิมจนติดแน่น ดึงไม่ออกในภาวะฉุกเฉิน'
      ],
      defectEn: [
        'Missing pull pin or makeshift replacement with wire',
        'Broken, cut, or missing tamper seal (possible prior discharge)',
        'Corroded or jammed pull pin that prevents rapid release'
      ],
      nfpaClause: 'NFPA 10 §7.2.2.2',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'hose_nozzle',
      number: 3,
      titleTh: 'สายฉีดและหัวฉีด (Hose & Nozzle / Horn)',
      titleEn: 'Discharge Hose & Nozzle / Horn',
      icon: <Layers className="w-4 h-4 text-cyan-600" />,
      hotspot: { x: 74, y: 46, label: '3. Hose & Nozzle' },
      standardTh: 'สายยางส่งน้ำยาต้องยืดหยุ่นดี ไม่แตกลายงา หัวฉีด (Nozzle) หรือกรวยฉีด CO2 สะอาด ปราศจากสิ่งอุดตัน',
      standardEn: 'Discharge hose and nozzle/horn must be unobstructed, flexible, and free from cracks or dry rot.',
      howToInspectTh: [
        'ตรวจดูตามความยาวของสายยางว่าไม่มีรอยแตก บวม หรือกรอบแข็ง',
        'ส่องดูภายในรูหัวฉีด (Nozzle) ต้องไม่มีแมลง เศษฝุ่น หรือรังผึ้งเข้าไปอุด',
        'ข้อต่อสายยางขันแน่นกับตัวถัง ไม่หลวมคลอน และมีสายรัดเก็บหัวฉีดเรียบร้อย',
        'สำหรับถัง CO2 ตรวจกรวยพลาสติก (Horn) ไม่แตกหัก และด้ามจับฉนวนอยู่ครบ'
      ],
      howToInspectEn: [
        'Flex the hose gently to inspect for weather cracking or dry rot',
        'Look inside nozzle bore to confirm zero insect nests, mud, or debris blockages',
        'Ensure the threaded brass/steel coupling is tightly secured to valve body',
        'For CO2: verify the non-conductive discharge horn has no cracks or chips'
      ],
      defectTh: [
        'สายยางแห้งกรอบ แตกลายงา หรือบวมพอง',
        'รูหัวฉีดมีดิน เศษผง หรือแมลงทำรังอุดตัน',
        'กรวยฉีด CO2 แตกหัก หรือเกลียวข้อต่อหลุดหลวม'
      ],
      defectEn: [
        'Cracked, brittle, cut, or severely deteriorated rubber hose',
        'Foreign debris or insect nests obstructing the nozzle bore',
        'Cracked or broken discharge horn on CO2 models'
      ],
      nfpaClause: 'NFPA 10 §7.2.2.4',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'cylinder',
      number: 4,
      titleTh: 'สภาพตัวถังและสีเคลือบ (Cylinder Body & Paint)',
      titleEn: 'Cylinder Body, Rust & Dents',
      icon: <ShieldCheck className="w-4 h-4 text-red-600" />,
      hotspot: { x: 50, y: 55, label: '4. Cylinder Body' },
      standardTh: 'ตัวถังเหล็กกล้าไร้รอยต่อ สีแดงสดใส สะอาด ปราศจากรอยบุบ รอยสนิม หรือการกัดกร่อนจากสารเคมี',
      standardEn: 'Cylinder exterior must show clean uniform coating with zero dents, deep rust, or chemical corrosion.',
      howToInspectTh: [
        'หมุนตรวจรอบตัวถัง 360 องศา ทั้งด้านหน้า ด้านหลัง และก้นถัง',
        'ตรวจสอบรอยบุบ (Dents), รอยขูดขีดลึก, รอยบวม, หรือรอยแตกร้าว',
        'ตรวจดูก้นถังและขอบล่างซึ่งเป็นจุดสะสมความชื้น ไม่ให้มีสนิมขุมกัดกร่อน',
        'ตัวถังต้องไม่ผ่านการเชื่อม ซ่อมแซม หรือดัดแปลงโครงสร้างโดยพลการ'
      ],
      howToInspectEn: [
        'Inspect cylinder shell 360 degrees including bottom skirt seam',
        'Check for structural dents, deep gouges, chemical pitting, or bulges',
        'Inspect bottom chime carefully where moisture easily causes severe rust',
        'Verify no unauthorized welding or field structural modifications exist'
      ],
      defectTh: [
        'ตัวถังมีรอยบุบ ยุบ หรือบวมพองผิดรูป',
        'มีสนิมขุม (Rust pitting) กัดกร่อนลึก หรือก้นถังผุกร่อน',
        'สีหลุดลอกเป็นบริเวณกว้างจนเห็นเนื้อเหล็กขึ้นสนิม'
      ],
      defectEn: [
        'Structural dents, gouges, or swelling indicating metal fatigue',
        'Heavy rust pitting or severe corrosion at bottom foot ring',
        'Extensive paint peeling exposing bare oxidized metal'
      ],
      nfpaClause: 'NFPA 10 §7.2.2.1',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'agent_weight',
      number: 5,
      titleTh: 'การคว่ำถัง/ชั่งน้ำหนัก (Agent & Weight Check)',
      titleEn: 'Agent Settling & Gross Weight',
      icon: <Scale className="w-4 h-4 text-amber-600" />,
      hotspot: { x: 50, y: 76, label: '5. Agent & Weight' },
      standardTh: 'ถังเคมีแห้งต้องไม่จับตัวเป็นก้อนแข็ง และถัง CO2/สารสะอาดต้องมีน้ำหนักรวมตรงตามป้ายระบุ (ไม่ลดลงเกิน 10%)',
      standardEn: 'Chemical powder must remain loose; CO2 / gas agent weight must not drop >10% of rated gross weight.',
      howToInspectTh: [
        'ถังผงเคมีแห้ง (Dry Chemical): ให้ยกถังคว่ำลงแล้วหงายขึ้นช้าๆ 2-3 ครั้ง จะรู้สึกถึงผงเคมีไหลตัวอย่างอิสระ ไม่จับเป็นก้อนแข็งที่ก้นถัง',
        'ถัง CO2: ต้องใช้เครื่องชั่งน้ำหนัก ตรวจสอบ Gross Weight รวม ต้องไม่ลดลงเกิน 10% ของน้ำหนักสุทธิบนตัวถัง',
        'ถังโฟม/น้ำยา: สังเกตระดับความเต็มและน้ำหนักรวมของสาร'
      ],
      howToInspectEn: [
        'Dry Powder: Gently invert the cylinder 2-3 times to feel powder flow and prevent hard cake settling',
        'CO2 Cylinders: Weigh extinguisher on scale; total gross weight must be within 10% of stamped weight on valve',
        'Clean Agent / Foam: Verify fullness by weight or level marker if equipped'
      ],
      defectTh: [
        'ผงเคมีจับตัวเป็นก้อนแข็ง (Caking) เมื่อคว่ำถังแล้วไม่มีการไหล',
        'น้ำหนักถัง CO2 ลดลงเกิน 10% แสดงว่าก๊าซรั่วซึมหมดแล้ว',
        'ถังมีน้ำหนักเบาผิดปกติคล้ายถังเปล่า'
      ],
      defectEn: [
        'Hard caked powder block settled at bottom of dry chemical unit',
        'CO2 gross weight drop exceeding 10% indicating total gas loss',
        'Abnormally lightweight cylinder indicating discharge or loss'
      ],
      nfpaClause: 'NFPA 10 §7.3.2.1',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'location_access',
      number: 6,
      titleTh: 'ตำแหน่งติดตั้งและการเข้าถึง (Location & Clearance)',
      titleEn: 'Mounting Location & Accessibility',
      icon: <MapPin className="w-4 h-4 text-emerald-600" />,
      hotspot: { x: 18, y: 35, label: '6. Mount & Clearance' },
      standardTh: 'ติดตั้งในตำแหน่งที่มองเห็นชัดเจน แขวนสูงจากพื้นไม่เกิน 1.5 เมตร ไม่มีสิ่งกีดขวางในระยะ 1 เมตรโดยรอบ',
      standardEn: 'Extinguisher must be mounted visibly, max 1.5m above floor, with at least 1-meter clear access corridor.',
      howToInspectTh: [
        'ตรวจสอบว่าไม่มีตู้ กล่องสินค้า หรือขยะวางบดบังตัวถัง',
        'ตัวถังต้องแขวนอยู่บนขอยึดผนัง (Bracket) หรือตั้งในตู้ดับเพลิงอย่างมั่นคง',
        'ระยะความสูงของคันบีบต้องไม่เกิน 1.5 เมตร จากระดับพื้นทางเดิน',
        'มีป้ายชี้ตำแหน่ง (Fire Extinguisher Sign) มองเห็นได้ชัดเจนจากระยะไกล'
      ],
      howToInspectEn: [
        'Confirm clear access path without stacked boxes, carts, or furniture obstacles',
        'Verify secure mounting on wall bracket or clean fire cabinet enclosure',
        'Handle height must not exceed 1.5 meters (5 ft) above floor level',
        'Location sign must be clean, unobstructed, and legible from across the corridor'
      ],
      defectTh: [
        'มีสิ่งของวางกองบังหรือปิดทางเข้าถึงถังดับเพลิง',
        'ถังวางอยู่กับพื้นโดยไม่มีขอยึด หรือแขวนสูงเกินกว่าจะหยิบได้สะดวก',
        'ป้ายชี้บ่งตำแหน่งหลุดหายหรือซีดจางมองไม่เห็น'
      ],
      defectEn: [
        'Corridor blocked by stored supplies, furniture, or equipment',
        'Unit resting unmounted on floor or mounted dangerously high (>1.5m)',
        'Missing, faded, or obstructed extinguisher location signage'
      ],
      nfpaClause: 'NFPA 10 §6.1.3',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    },
    {
      id: 'inspection_tag',
      number: 7,
      titleTh: 'ป้ายบันทึกและวันครบกำหนด (Inspection Tag & Due Date)',
      titleEn: 'Inspection Tag & Service History',
      icon: <FileCheck className="w-4 h-4 text-purple-600" />,
      hotspot: { x: 50, y: 33, label: '7. Inspection Tag' },
      standardTh: 'ป้ายตรวจเช็ก (Inspection Tag) ผูกติดกับถังชัดเจน มีการเซ็นชื่อและระบุวันที่ตรวจทุกเดือน และไม่เกินกำหนดทดสอบแรงดัน (Hydrotest)',
      standardEn: 'Service tag securely attached with legible monthly inspector sign-offs and valid hydro-test date.',
      howToInspectTh: [
        'ตรวจดูป้ายบันทึกว่ามีประวัติการตรวจเช็กประจำเดือนครบถ้วน',
        'ตรวจสอบวันหมดอายุของสารดับเพลิง และวันครบกำหนดทดสอบแรงดัน (Hydrostatic Test ทุก 5 ปี)',
        'สแกน QR Code ประจำถังเพื่อซิงค์ข้อมูลลงระบบ RT-Fire Safety'
      ],
      howToInspectEn: [
        'Check service tag for unbroken monthly maintenance stamps and initials',
        'Verify hydro-test date stamped on cylinder shoulder (every 5-12 years)',
        'Scan QR code badge to synchronize field record with RT-Fire Safety Cloud'
      ],
      defectTh: [
        'ป้ายบันทึกสูญหาย ฉีกขาด หรือตัวหนังสือลบเลือนจนอ่านไม่ออก',
        'ขาดการตรวจเช็กเกินกว่า 30 วัน',
        'ถังหมดอายุ หรือเกินกำหนดทดสอบแรงดัน Hydrotest'
      ],
      defectEn: [
        'Missing, unreadable, or illegible maintenance tag',
        'Inspection overdue for more than 30 consecutive calendar days',
        'Cylinder expired past mandatory hydrostatic re-test interval'
      ],
      nfpaClause: 'NFPA 10 §7.2.4',
      frequency: isTh ? 'ทุกเดือน (Monthly)' : 'Monthly'
    }
  ];

  const currentPoint = checkpoints.find(c => c.id === selectedPoint) || checkpoints[0];

  const handlePointClick = (id: string) => {
    setSelectedPoint(id);
    if (onSelectCheckpoint) {
      onSelectCheckpoint(id);
    }
  };

  const typeGuides = [
    {
      type: 'dry_chemical' as ExtinguisherType,
      nameTh: 'ผงเคมีแห้ง (Dry Chemical Powder - ABC)',
      nameEn: 'ABC Dry Chemical Powder',
      color: 'text-red-700 bg-red-50 border-red-200',
      badgeColor: 'bg-red-600',
      classes: 'Class A, B, C (เชื้อเพลิงทั่วไป, น้ำมัน, ไฟฟ้า)',
      gaugeType: 'มีเกจวัด (Normal 195 PSI)',
      specialInspectionTh: 'ต้องทำการคว่ำ-หงายถัง 2-3 ครั้งทุกเดือน เพื่อไม่ให้ผงเคมีจับตัวเป็นก้อนแข็งที่ก้นถัง',
      specialInspectionEn: 'Must invert cylinder 2-3 times monthly to loosen dry powder settling.',
      icon: '🔴'
    },
    {
      type: 'co2' as ExtinguisherType,
      nameTh: 'ก๊าซคาร์บอนไดออกไซด์ (CO2)',
      nameEn: 'Carbon Dioxide (CO2)',
      color: 'text-gray-800 bg-gray-100 border-gray-300',
      badgeColor: 'bg-gray-800',
      classes: 'Class B, C (น้ำมัน, แก๊ส, อุปกรณ์ไฟฟ้า/คอมพิวเตอร์)',
      gaugeType: 'ไม่มีเกจวัด (ใช้วิธีชั่งน้ำหนัก)',
      specialInspectionTh: 'ไม่มีเกจวัดแรงดัน! ต้องชั่งน้ำหนักรวม (Gross Weight) น้ำหนักต้องไม่หายเกิน 10% และตรวจกรวยฉีดพลาสติกไม่แตกร้าว',
      specialInspectionEn: 'No pressure gauge! Must be weighed; replace if gross weight drops >10%. Inspect discharge horn.',
      icon: '⚫'
    },
    {
      type: 'foam' as ExtinguisherType,
      nameTh: 'โฟมดับเพลิง (AFFF Foam)',
      nameEn: 'AFFF Aqueous Film Forming Foam',
      color: 'text-blue-800 bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-600',
      classes: 'Class A, B (ไม้, กระดาษ, น้ำมันเชื้อเพลิง, ทินเนอร์)',
      gaugeType: 'มีเกจวัด (Normal 100-150 PSI)',
      specialInspectionTh: 'ห้ามนำไปฉีดไฟคลาส C (ไฟฟ้า) เด็ดขาด! ตรวจสอบเกจวัดแรงดันและหัวฉีดชนิดมีรูดูดอากาศ',
      specialInspectionEn: 'NEVER use on Class C electrical fires! Verify gauge and specialized foam aeration nozzle.',
      icon: '🔵'
    },
    {
      type: 'clean_agent' as ExtinguisherType,
      nameTh: 'สารสะอาดระเหย (Clean Agent / Halotron / HFC-227ea)',
      nameEn: 'Clean Agent Gas',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-600',
      classes: 'Class A, B, C (ห้องเซิร์ฟเวอร์, ดาต้าเซ็นเตอร์, เครื่องมือแพทย์)',
      gaugeType: 'มีเกจวัด (Normal 125-195 PSI)',
      specialInspectionTh: 'ไม่ทิ้งคราบสกปรก เหมาะกับห้อง Server ตรวจเกจวัดแรงดันและข้อต่อสายฉีดให้สนิท',
      specialInspectionEn: 'Leaves zero residue. Ideal for data centers. Verify gauge pressure and sealed valve integrity.',
      icon: '🟢'
    },
    {
      type: 'wet_chemical' as ExtinguisherType,
      nameTh: 'เคมีเปียก (Wet Chemical - Class K)',
      nameEn: 'Wet Chemical (Class K)',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-600',
      classes: 'Class K (น้ำมันทำอาหาร, ไขมันสัตว์, ห้องครัวร้านอาหาร)',
      gaugeType: 'มีเกจวัด (Normal 100 PSI)',
      specialInspectionTh: 'สำหรับห้องครัว/น้ำมันพืชร้อนจัด ตรวจปลายก้านฉีดสเปรย์ฝอยละเอียดและสายส่งน้ำยา',
      specialInspectionEn: 'Specifically for hot cooking oils. Inspect soft-mist discharge applicator and wand.',
      icon: '🟡'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      
      {/* Sub-Header Navigation */}
      <div className="p-3 bg-gradient-to-r from-red-700 via-[#d32f2f] to-red-800 text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-wide">
              {isTh ? 'คู่มือและวิธีตรวจสอบถังดับเพลิง (Inspection Guide)' : 'Fire Extinguisher Inspection Manual'}
            </h4>
            <p className="text-[11px] text-red-100 font-medium">
              {isTh ? 'ตามมาตรฐาน NFPA 10 และ วสท. (National Fire Protection Standard)' : 'Compliant with NFPA 10 Standard Criteria'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'diagram' ? 'bg-white text-gray-900 shadow-xs' : 'text-red-100 hover:text-white'
            }`}
          >
            {isTh ? '📐 ภาพชิ้นส่วนและจุดตรวจ (7 จุด)' : 'Interactive Diagram'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('type_info')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'type_info' ? 'bg-white text-gray-900 shadow-xs' : 'text-red-100 hover:text-white'
            }`}
          >
            {isTh ? '🔥 ประเภทถังและวิธีเฉพาะ' : 'Extinguisher Types'}
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Diagram and Checkpoints */}
      {activeTab === 'diagram' && (
        <div className="p-4 space-y-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left Column: Visual Fire Extinguisher Diagram with Hotspots */}
            <div className="lg:col-span-5 bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200 flex flex-col items-center justify-center relative select-none">
              
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#d32f2f]" />
                  {isTh ? 'คลิกที่จุดวงกลมเพื่อดูคำอธิบาย' : 'Click hotspot to view details'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full border border-red-200">
                  {currentExtinguisherType.toUpperCase()}
                </span>
              </div>

              {/* Realistic SVG Extinguisher Artwork */}
              <div className="relative w-56 h-[340px] flex items-center justify-center">
                <svg viewBox="0 0 200 360" className="w-full h-full drop-shadow-md">
                  <defs>
                    <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#991b1b" />
                      <stop offset="25%" stopColor="#dc2626" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="80%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <linearGradient id="co2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1f2937" />
                      <stop offset="50%" stopColor="#374151" />
                      <stop offset="100%" stopColor="#111827" />
                    </linearGradient>
                    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                    <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>

                  {/* Wall Bracket & Mounting Hook (Point 6) */}
                  <rect x="25" y="110" width="16" height="30" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 33 115 L 55 125 L 33 135 Z" fill="#94a3b8" />

                  {/* Valve Body (Brass/Metal) */}
                  <path d="M 85 85 L 115 85 L 110 65 L 90 65 Z" fill="url(#metalGrad)" stroke="#334155" strokeWidth="1.5" />
                  <rect x="92" y="55" width="16" height="12" rx="2" fill="url(#brassGrad)" stroke="#78350f" strokeWidth="1" />

                  {/* Operating Lever (Top) & Carry Handle (Bottom) */}
                  <path d="M 90 60 L 50 48 Q 45 46 50 42 L 120 54 Z" fill="url(#metalGrad)" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M 90 68 L 45 68 Q 40 75 45 80 L 90 76 Z" fill="url(#metalGrad)" stroke="#1e293b" strokeWidth="1.5" />

                  {/* Safety Pin & Tamper Seal (Point 2) */}
                  <circle cx="78" cy="62" r="7" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  <line x1="78" y1="62" x2="95" y2="62" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="73" y="65" width="10" height="14" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />

                  {/* Pressure Gauge (Point 1) - If not CO2 */}
                  {currentExtinguisherType !== 'co2' ? (
                    <g>
                      <circle cx="108" cy="68" r="11" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                      {/* Red left, Green center, Red right zones */}
                      <path d="M 100 68 A 8 8 0 0 1 104 62" fill="none" stroke="#ef4444" strokeWidth="2" />
                      <path d="M 104 62 A 8 8 0 0 1 112 62" fill="none" stroke="#22c55e" strokeWidth="2" />
                      <path d="M 112 62 A 8 8 0 0 1 116 68" fill="none" stroke="#ef4444" strokeWidth="2" />
                      {/* Needle pointing in green zone */}
                      <line x1="108" y1="68" x2="108" y2="61" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="108" cy="68" r="2" fill="#0f172a" />
                    </g>
                  ) : (
                    /* CO2 Valve Release Wheel/Lever */
                    <rect x="105" y="62" width="12" height="12" rx="3" fill="#1e293b" stroke="#000" />
                  )}

                  {/* Cylinder Neck & Top Dome */}
                  <path d="M 70 100 Q 100 82 130 100 L 130 280 Q 100 295 70 280 Z" 
                    fill={currentExtinguisherType === 'co2' ? 'url(#co2Grad)' : 'url(#cylinderGrad)'} 
                    stroke="#1e293b" strokeWidth="2" 
                  />

                  {/* Base Ring / Stand */}
                  <rect x="68" y="275" width="64" height="20" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

                  {/* Cylinder Label & Instruction Badge (Point 7) */}
                  <rect x="74" y="130" width="52" height="110" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="76" y="133" width="48" height="18" rx="2" fill="#d32f2f" />
                  <text x="100" y="146" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    {currentExtinguisherType === 'co2' ? 'CO2' : 'ABC POWDER'}
                  </text>
                  {/* NFPA pictogram boxes */}
                  <rect x="78" y="156" width="12" height="12" rx="2" fill="#3b82f6" />
                  <text x="84" y="165" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">A</text>
                  <rect x="94" y="156" width="12" height="12" rx="2" fill="#ef4444" />
                  <text x="100" y="165" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">B</text>
                  <rect x="110" y="156" width="12" height="12" rx="2" fill="#10b981" />
                  <text x="116" y="165" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">C</text>

                  <line x1="78" y1="174" x2="122" y2="174" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="78" y1="180" x2="115" y2="180" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="78" y1="186" x2="120" y2="186" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Hanging Inspection Tag */}
                  <path d="M 85 85 L 80 120 L 95 120 Z" fill="none" stroke="#64748b" strokeWidth="1" />
                  <rect x="76" y="196" width="48" height="38" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                  <text x="100" y="208" textAnchor="middle" fill="#854d0e" fontSize="7" fontWeight="bold">INSPECTED</text>
                  <text x="100" y="222" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="bold" fontFamily="monospace">PASS ✓</text>

                  {/* Discharge Hose & Nozzle / CO2 Horn (Point 3) */}
                  {currentExtinguisherType === 'co2' ? (
                    /* Big CO2 Discharge Horn */
                    <g>
                      <path d="M 115 80 Q 155 90 155 120 L 155 160" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 148 160 L 162 160 L 175 220 L 135 220 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                      <rect x="146" y="160" width="18" height="20" rx="3" fill="#475569" />
                    </g>
                  ) : (
                    /* Standard Flexible Hose with nozzle clip */
                    <g>
                      <path d="M 112 80 Q 158 95 152 160 Q 148 220 150 250" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                      <rect x="145" y="240" width="10" height="25" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
                      {/* Clip bracket */}
                      <rect x="127" y="180" width="8" height="12" rx="2" fill="#64748b" />
                    </g>
                  )}
                </svg>

                {/* Interactive Hotspot Buttons overlay */}
                {checkpoints.map((cp) => {
                  const isSelected = selectedPoint === cp.id;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => handlePointClick(cp.id)}
                      style={{
                        left: `${cp.hotspot.x}%`,
                        top: `${cp.hotspot.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs transition-all shadow-md cursor-pointer ${
                        isSelected 
                          ? 'bg-[#d32f2f] text-white scale-125 ring-4 ring-red-400/50 z-20 animate-pulse' 
                          : 'bg-white text-gray-800 border-2 border-[#d32f2f] hover:bg-red-50 hover:scale-110 z-10'
                      }`}
                      title={isTh ? cp.titleTh : cp.titleEn}
                    >
                      {cp.number}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Detailed Step-by-Step Explanation for Selected Hotspot */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Checkpoint selector buttons list */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {checkpoints.map((cp) => {
                  const isSelected = selectedPoint === cp.id;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => handlePointClick(cp.id)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all border ${
                        isSelected
                          ? 'bg-[#d32f2f] text-white border-[#af101a] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isSelected ? 'bg-white text-[#d32f2f]' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {cp.number}
                      </span>
                      <span>{isTh ? cp.titleTh.split(' ')[0] : cp.titleEn.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Checkpoint Detail Card */}
              <div className="bg-white p-4 rounded-2xl border-2 border-red-100 shadow-xs space-y-3 animate-in fade-in duration-200">
                
                {/* Checkpoint Header */}
                <div className="flex items-start justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-50 text-[#d32f2f] rounded-xl">
                      {currentPoint.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-100 text-[#d32f2f] font-extrabold text-[10px] rounded-md">
                          จุดตรวจที่ {currentPoint.number}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {currentPoint.nfpaClause}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-sm text-gray-900 mt-0.5">
                        {isTh ? currentPoint.titleTh : currentPoint.titleEn}
                      </h5>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg border border-emerald-200">
                    {currentPoint.frequency}
                  </span>
                </div>

                {/* Standard Acceptance Criterion */}
                <div className="bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-xl">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isTh ? 'เกณฑ์มาตรฐานที่ถูกต้อง (Acceptance Criteria):' : 'Standard Criteria:'}</span>
                  </p>
                  <p className="text-xs text-emerald-800 font-medium pl-5 leading-relaxed">
                    {isTh ? currentPoint.standardTh : currentPoint.standardEn}
                  </p>
                </div>

                {/* How to inspect instructions */}
                <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{isTh ? 'วิธีและขั้นตอนการตรวจสอบ (How to Inspect):' : 'Inspection Steps:'}</span>
                  </p>
                  <ul className="text-xs text-blue-950 space-y-1 pl-5 list-disc leading-relaxed">
                    {(isTh ? currentPoint.howToInspectTh : currentPoint.howToInspectEn).map((step, idx) => (
                      <li key={idx} className="font-medium">{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Critical Defects / Failure Indicators */}
                <div className="bg-red-50/60 border border-red-100 p-3 rounded-xl">
                  <p className="text-xs font-bold text-red-900 flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{isTh ? 'ข้อบกพร่องที่ต้องสั่งซ่อม/เปลี่ยนทันที (Critical Defects):' : 'Failure Indicators:'}</span>
                  </p>
                  <ul className="text-xs text-red-950 space-y-1 pl-5 list-disc leading-relaxed">
                    {(isTh ? currentPoint.defectTh : currentPoint.defectEn).map((defect, idx) => (
                      <li key={idx} className="font-medium">{defect}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Extinguisher Types & Fire Classes Guide */}
      {activeTab === 'type_info' && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-600 font-medium">
            {isTh 
              ? 'แต่ละประเภทถังดับเพลิงมีคุณสมบัติ การตรวจเช็ก และการใช้งานดับเพลิงต่างชนิดกัน โปรดศึกษาข้อกำหนดเฉพาะของแต่ละประเภท:' 
              : 'Different extinguisher types have distinct inspection requirements and extinguishing agents:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {typeGuides.map((item) => (
              <div 
                key={item.type} 
                className={`p-3.5 rounded-2xl border transition-all ${item.color} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <h5 className="font-extrabold text-xs text-gray-900">
                        {isTh ? item.nameTh : item.nameEn}
                      </h5>
                      <span className="text-[10px] font-mono text-gray-500">{item.gaugeType}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                    {item.type.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1 pt-1 border-t border-gray-200/60">
                  <p className="font-bold text-gray-800">
                    🔥 {isTh ? 'ประเภทเพลิงที่ดับได้:' : 'Fire Classes:'}{' '}
                    <span className="font-normal text-gray-700">{item.classes}</span>
                  </p>
                  <p className="font-bold text-gray-800">
                    🔍 {isTh ? 'ข้อสังเกตการตรวจเช็ก:' : 'Special Inspection:'}{' '}
                    <span className="font-normal text-gray-700">
                      {isTh ? item.specialInspectionTh : item.specialInspectionEn}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isTh ? 'หลักการตรวจสอบความปลอดภัยสากล PASS' : 'P.A.S.S. Quick Operating Technique'}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {isTh 
                  ? 'P (Pull - ดึงสลัก) ➔ A (Aim - เล็งไปที่ฐานของไฟ) ➔ S (Squeeze - บีบคันบีบ) ➔ S (Sweep - ส่ายหัวฉีดไปมาซ้ายขวา)'
                  : 'P (Pull the pin) ➔ A (Aim at base of fire) ➔ S (Squeeze handle) ➔ S (Sweep side to side)'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
