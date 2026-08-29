import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Printer, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Gauge, 
  QrCode, 
  Smartphone, 
  Cloud, 
  Bell, 
  Map, 
  FileText, 
  UserCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  ExternalLink,
  Flame,
  Camera,
  Layers,
  Lock,
  Eye,
  Sliders,
  Download,
  UploadCloud,
  CheckCheck,
  Award,
  Sparkles,
  RefreshCw,
  XCircle,
  FileCheck2,
  Calendar,
  Building,
  Target,
  Compass,
  Zap,
  Activity,
  Droplets,
  Wind,
  Check
} from 'lucide-react';
import { Language, TabType } from '../types';

interface ManualViewProps {
  lang: Language;
  onNavigateTab: (tab: TabType) => void;
  onOpenQrScanner: () => void;
  onOpenFacilityMap: () => void;
  onOpenNewInspection: () => void;
}

type ManualSectionTab = 'sop' | 'types-anatomy' | 'nfpa-criteria' | 'quiz' | 'system-features' | 'troubleshoot';

export const ManualView: React.FC<ManualViewProps> = ({
  lang,
  onNavigateTab,
  onOpenQrScanner,
  onOpenFacilityMap,
  onOpenNewInspection,
}) => {
  const isTh = lang === 'th';
  const [currentTab, setCurrentTab] = useState<ManualSectionTab>('sop');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Checklist / Accordion States
  const [expandedSection, setExpandedSection] = useState<string | null>('gauge');
  const [selectedFireClass, setSelectedFireClass] = useState<'A' | 'B' | 'C' | 'D' | 'K'>('A');
  const [selectedExtType, setSelectedExtType] = useState<string>('dry-chemical');

  // Quiz State for Inspector Assessment
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // 7 Checkpoints Data
  const checkPoints = [
    {
      id: 'gauge',
      num: 1,
      nameTh: 'เกจวัดแรงดัน (Pressure Gauge / Indicator)',
      nameEn: 'Pressure Gauge & Indicator',
      standardTh: 'เข็มชี้อยู่ในแถบสีเขียวตรงกลาง (Green Zone ~195 PSI)',
      standardEn: 'Needle strictly in the operable green zone (~195 PSI)',
      passCriteriaTh: 'เข็มชี้ตรงกลางช่องสีเขียว กระจกหน้าปัดใส ไม่มีรอยร้าว ไม่มีหยดน้ำหรือฝ้าเกาะ',
      passCriteriaEn: 'Needle centered in green zone, glass face clear with no condensation or cracks',
      failCriteriaTh: 'เข็มตกอยู่แถบสีแดงซ้าย (Recharge/แรงดันตก) หรือเลยไปแถบขวา (Overcharge/แรงดันเกิน)',
      failCriteriaEn: 'Needle in red undercharged or overcharged zone',
      specialRuleTh: 'หมายเหตุ: ถังประเภทก๊าซคาร์บอนไดออกไซด์ (CO2) ไม่มีเกจวัดแรงดัน ให้ใช้วิธี "ชั่งน้ำหนักรวม (Gross Weight)" ถ้าน้ำหนักหายเกิน 10% ให้ส่งอัดบรรจุใหม่ทันที',
      specialRuleEn: 'CO2 units have no pressure gauge. Inspect by Gross Weight. Loss >10% requires immediate recharge.',
      actionTh: 'หากเข็มตก ให้ทำเครื่องหมาย "ไม่ผ่าน" ระบบจะแจ้งช่างซ่อมบำรุงเปลี่ยนถังสำรองทันที',
      actionEn: 'Tag as Failed; system flags immediate replacement.',
      icon: Gauge,
      color: 'emerald'
    },
    {
      id: 'pin-seal',
      num: 2,
      nameTh: 'สลักนิรภัยและซีลล็อก (Pull Pin & Tamper Seal)',
      nameEn: 'Safety Pull Pin & Tamper Seal',
      standardTh: 'สลักโลหะเสียบแน่นหนา พร้อมสายรัดพลาสติกซีลนิรภัยล็อกครบสมบูรณ์',
      standardEn: 'Metal pull pin inserted with unbroken plastic tamper seal wire',
      passCriteriaTh: 'สายรัดพลาสติก (Plastic Seal) อยู่ในสภาพสมบูรณ์ ไม่ขาด สลักไม่หลวมหลุด',
      passCriteriaEn: 'Plastic lock wire intact, not broken, pin firmly locks trigger lever',
      failCriteriaTh: 'ซีลพลาสติกขาด สลักหลุดหาย หรือมีรอยตัด บ่งบอกว่าอาจเคยถูกกดฉีดใช้งานแล้ว',
      failCriteriaEn: 'Seal wire broken, missing pin, indicating possible unauthorized discharge',
      specialRuleTh: 'ห้ามใช้ลวดเหล็กหรือเชือกเหนียวผูกแทนซีลพลาสติก เพราะผู้ใช้งานจะไม่สามารถกระตุกสลักออกได้ในยามฉุกเฉิน',
      specialRuleEn: 'Never replace tamper seal with strong wire; user cannot pull pin during emergency.',
      actionTh: 'ส่งฝ่ายเทคนิคเข้าตรวจสอบปริมาณสารเคมีและเปลี่ยนซีลล็อกมาตรฐานตัวใหม่',
      actionEn: 'Send for chemical weight verification and re-seal.',
      icon: Lock,
      color: 'blue'
    },
    {
      id: 'hose-nozzle',
      num: 3,
      nameTh: 'สายฉีดและหัวฉีด (Discharge Hose & Nozzle / Horn)',
      nameEn: 'Discharge Hose & Nozzle / Horn',
      standardTh: 'สายยางยืดหยุ่นดี ไม่แตกลายงา รูหัวฉีดโล่ง ไร้สิ่งอุดตัน',
      standardEn: 'Flexible rubber hose, no dry rot, nozzle orifice clean and unobstructed',
      passCriteriaTh: 'สายไม่กรอบ ไม่แตกหัก ข้อต่อเกลียวขันแน่น รูหัวฉีดไม่มีรังแมลงหรือเศษดินอุด',
      passCriteriaEn: 'Hose pliable, couplings tight, horn/nozzle free of insect nests or debris',
      failCriteriaTh: 'สายแตกลายงา หลุดลุ่ย ข้อต่อหลวม หรือมีเศษสิ่งแปลกปลอมอุดตันในรูจ่าย',
      failCriteriaEn: 'Hose cracked, dry rotted, loose clamp, or nozzle orifice blocked',
      specialRuleTh: 'สำหรับถัง CO2 ลำโพงฉีด (Discharge Horn) ต้องไม่แตกหัก เพราะก๊าซ CO2 พ่นออกมาเย็นจัด (-78°C) ป้องกันมือพองจากความเย็น (Cold Burn)',
      specialRuleEn: 'For CO2, ensure plastic horn is undamaged to prevent extreme frostbite (-78°C).',
      actionTh: 'เปลี่ยนสายฉีดชุดใหม่ทันที ไม่แนะนำให้ใช้เทปพันสายไฟซ่อมแซม',
      actionEn: 'Replace hose assembly immediately.',
      icon: Layers,
      color: 'cyan'
    },
    {
      id: 'cylinder-body',
      num: 4,
      nameTh: 'สภาพตัวถังภายนอก (Cylinder & Physical Shell)',
      nameEn: 'Cylinder Body & Shell Integrity',
      standardTh: 'ตัวถังโลหะเรียบเนียน ไร้รอยบุบ ไม่ผุกร่อน สีไม่ลอกร่อน',
      standardEn: 'Sound structural integrity, zero deep dents, no rust pitting or weld repairs',
      passCriteriaTh: 'ผิวสีเคลือบสม่ำเสมอ ไม่มีสนิมกินเนื้อเหล็ก ฐานรองถังมั่นคง',
      passCriteriaEn: 'Uniform paint, no corrosion, foot ring stable and level',
      failCriteriaTh: 'ถังบุบจากการกระแทก มีสนิมกัดกร่อนลึก หรือมีรอยเชื่อมแต่งแปลงสภาพ',
      failCriteriaEn: 'Visible dents, corrosion pitting, scorched shell, or unauthorized welding',
      specialRuleTh: 'ตามมาตรฐาน NFPA 10 ห้ามซ่อมแซมตัวถังรับแรงดันด้วยการเชื่อมเด็ดขาด ต้องส่งทดสอบ Hydrostatic Test หรือปลดระวาง',
      specialRuleEn: 'Welding on pressure vessels is strictly prohibited by NFPA 10.',
      actionTh: 'ปลดระวางและส่งเปลี่ยนถังใหม่เพื่อความปลอดภัยของผู้ใช้งาน',
      actionEn: 'Decommission cylinder and replace with certified unit.',
      icon: Flame,
      color: 'amber'
    },
    {
      id: 'operating-label',
      num: 5,
      nameTh: 'ป้ายวิธีใช้งานและฉลากรับรอง (Operating Instructions & Label)',
      nameEn: 'Operating Label & Class Markings',
      standardTh: 'ป้ายข้อความวิธีใช้งานและประเภทเพลิง (A B C) คมชัด หันออกด้านนอก',
      standardEn: 'Clear legible instructions and fire class symbols facing frontward',
      passCriteriaTh: 'อ่านตัวอักษรและภาพสัญลักษณ์วิธีใช้ชัดเจน มองเห็นได้ในระยะ 1-2 เมตร',
      passCriteriaEn: 'Instructions legible from normal viewing distance, class pictograms visible',
      failCriteriaTh: 'ป้ายฉลากขาด หาย หลุดลอก สีซีดจางจนอ่านประเภทเพลิงและวิธีใช้ไม่ออก',
      failCriteriaEn: 'Label defaced, peeled, illegible, or facing against the wall',
      specialRuleTh: 'ต้องมีสัญลักษณ์ระบุประเภทเพลิง (Class A/B/C/D/K) ให้ผู้ใช้งานทราบว่าใช้ดับไฟประเภทใดได้บ้าง',
      specialRuleEn: 'Must clearly show classification symbols to prevent fatal misuse.',
      actionTh: 'ติดป้ายสติกเกอร์คู่มือและสัญลักษณ์ประเภทเพลิงทดแทนให้ชัดเจน',
      actionEn: 'Affix new certified instructional decal.',
      icon: Eye,
      color: 'purple'
    },
    {
      id: 'location-access',
      num: 6,
      nameTh: 'ตำแหน่งติดตั้งและสิ่งกีดขวาง (Mounting & Accessibility)',
      nameEn: 'Mounting Height & Free Access',
      standardTh: 'แขวนสูง 1.00 - 1.50 ม. ไร้สิ่งของวางกีดขวาง เข้าถึงได้ทันทีใน 3 วินาที',
      standardEn: 'Mounted 1.0-1.5m above floor, unobstructed clearance within 1 meter',
      passCriteriaTh: 'ติดตั้งบนขายึดที่มั่นคง ไม่มีลังสินค้า โต๊ะ หรือสิ่งของวางบังทางเข้าถึง',
      passCriteriaEn: 'Securely bracketed, 100% free access path, visible from hallway',
      failCriteriaTh: 'วางกองบนพื้นโดยไม่มีฐานรอง หรือมีสิ่งของวางซ้อนทับจนหยิบใช้ไม่ได้',
      failCriteriaEn: 'Placed on floor unmounted, obstructed by boxes or locked behind cabinets',
      specialRuleTh: 'กฎกระทรวงฯ กำหนดให้ติดตั้งสูงจากพื้นถึงคันบีบไม่เกิน 1.50 เมตร และระยะห่างระหว่างจุดติดตั้งไม่เกิน 20 เมตร',
      specialRuleEn: 'Ministry regulations mandate max height 1.50m and max travel distance 20m.',
      actionTh: 'ย้ายสิ่งของกีดขวางออกทันที และติดตั้งขายึดผนังให้ได้ระดับความสูงมาตรฐาน',
      actionEn: 'Clear obstructions immediately and adjust wall mount bracket.',
      icon: Target,
      color: 'red'
    },
    {
      id: 'tag-date',
      num: 7,
      nameTh: 'ป้ายบันทึกการตรวจและวันหมดอายุ (Inspection Tag & Expiry)',
      nameEn: 'Inspection Tag & Maintenance Records',
      standardTh: 'มีป้ายแท็กบันทึกประวัติการตรวจรายเดือน และวันครบกำหนดชัดเจน',
      standardEn: 'Valid monthly inspection stamp, digital QR link, and upcoming due date',
      passCriteriaTh: 'มีตราประทับตรวจเช็กในรอบ 30 วัน พร้อมลายมือชื่อ/รหัสผู้ตรวจดิจิทัล',
      passCriteriaEn: 'Audited within last 30 days with verified inspector badge / digital signature',
      failCriteriaTh: 'ไม่มีป้ายแท็ก หรือขาดการตรวจเช็กเกินกว่า 30 วันตามรอบกำหนด',
      failCriteriaEn: 'Missing tag, illegible stamp, or inspection overdue (>30 days)',
      specialRuleTh: 'ระบบ RT-Fire Safety PRO จะทำการบันทึกประวัติดิจิทัลและออกป้าย QR Tag อัตโนมัติทุกครั้งที่กดบันทึก',
      specialRuleEn: 'The system auto-generates digital inspection records and QR update stamps.',
      actionTh: 'ทำการตรวจเช็กให้ครบ 7 ข้อ และกดบันทึกผลการตรวจผ่านแอปพลิเคชันทันที',
      actionEn: 'Complete inspection and submit record via mobile app.',
      icon: FileCheck2,
      color: 'emerald'
    }
  ];

  // Fire Classes Information
  const fireClasses = [
    {
      class: 'A',
      nameTh: 'ประเภท A (เพลิงจากเชื้อเพลิงธรรมดา)',
      nameEn: 'Class A: Ordinary Combustibles',
      materialsTh: 'ไม้, กระดาษ, ผ้า, ยาง, พลาสติก',
      materialsEn: 'Wood, paper, cloth, rubber, trash, plastics',
      color: 'bg-emerald-600',
      suitableExtTh: 'ผงเคมีแห้ง (Dry Chemical ABC), น้ำยาเหลวระเหยสารสะอาด, น้ำ/เคมีสูตรน้ำ',
      suitableExtEn: 'ABC Dry Chemical, Clean Agent, Water/Wet Chemical',
      dangerTh: 'ห้ามใช้ถัง CO2 ขนาดเล็กกับกองไม้ขนาดใหญ่เพราะอาจดับไม่สนิทและปะทุซ้ำ',
      dangerEn: 'CO2 may cause re-ignition in deep-seated Class A fires.',
      symbol: 'สามเหลี่ยมสีเขียว (Green Triangle)'
    },
    {
      class: 'B',
      nameTh: 'ประเภท B (เพลิงจากของเหลวและก๊าซไวไฟ)',
      nameEn: 'Class B: Flammable Liquids & Gases',
      materialsTh: 'น้ำมันเชื้อเพลิง, ทินเนอร์, สี, แอลกอฮอล์, ก๊าซหุงต้ม (LPG)',
      materialsEn: 'Gasoline, oil, grease, paint, solvents, LPG, methane',
      color: 'bg-red-600',
      suitableExtTh: 'ก๊าซ CO2, ผงเคมีแห้ง (ABC / BC), โฟมดับเพลิง (AFFF), สารสะอาด',
      suitableExtEn: 'CO2, Dry Chemical (ABC/BC), AFFF Foam, Clean Agent',
      dangerTh: '⚠️ ห้ามใช้น้ำฉีดเด็ดขาด! น้ำจะทำให้น้ำมันลอยตัวและกระจายเปลวไฟลุกลามอย่างรวดเร็ว',
      dangerEn: '⚠️ NEVER USE WATER! Water spreads burning liquid rapidly.',
      symbol: 'สี่เหลี่ยมสีแดง (Red Square)'
    },
    {
      class: 'C',
      nameTh: 'ประเภท C (เพลิงจากอุปกรณ์ไฟฟ้าที่มีกระแส)',
      nameEn: 'Class C: Energized Electrical Equipment',
      materialsTh: 'ตู้ควบคุมไฟฟ้า (MDB), หม้อแปลง, เซิร์ฟเวอร์, สายไฟ, เครื่องใช้ไฟฟ้า',
      materialsEn: 'Motors, transformers, servers, computers, control panels',
      color: 'bg-blue-600',
      suitableExtTh: 'ก๊าซ CO2, สารสะอาด BF2000 / Halotron / HFC-227ea, ผงเคมีแห้ง ABC',
      suitableExtEn: 'CO2, Clean Agent (Halotron/HFC), Dry Chemical ABC',
      dangerTh: '⚠️ ห้ามใช้น้ำหรือโฟมฉีดเด็ดขาด! เพราะเป็นตัวนำไฟฟ้าทำให้เกิดไฟดูดผู้ฉีดถึงแก่ชีวิต',
      dangerEn: '⚠️ NEVER USE WATER/FOAM! Conductive liquids cause fatal electrocution.',
      symbol: 'วงกลมสีน้ำเงิน (Blue Circle)'
    },
    {
      class: 'D',
      nameTh: 'ประเภท D (เพลิงจากโลหะติดไฟ)',
      nameEn: 'Class D: Combustible Metals',
      materialsTh: 'แมกนีเซียม, ไทเทเนียม, โพแทสเซียม, โซเดียม, ลิเธียม',
      materialsEn: 'Magnesium, titanium, zirconium, sodium, potassium, lithium',
      color: 'bg-amber-600',
      suitableExtTh: 'ผงเคมีพิเศษ Class D (Sodium Chloride based / Copper based Dry Powder)',
      suitableExtEn: 'Special Class D Dry Powder Agent only',
      dangerTh: '⚠️ ห้ามใช้น้ำ โฟม หรือ CO2 เด็ดขาด! จะเกิดปฏิกิริยาระเบิดรุนแรง',
      dangerEn: '⚠️ NEVER USE WATER OR CO2! Causes catastrophic violent chemical explosion.',
      symbol: 'ดาวห้าแฉกสีเหลือง (Yellow Star)'
    },
    {
      class: 'K',
      nameTh: 'ประเภท K (เพลิงจากน้ำมันปรุงอาหารในครัว)',
      nameEn: 'Class K: Commercial Kitchen Cooking Oils',
      materialsTh: 'น้ำมันพืช, ไขมันสัตว์, เนย, หม้อทอดกระทะลึกในครัวเชิงพาณิชย์',
      materialsEn: 'Vegetable oils, animal fats, commercial deep fat fryers',
      color: 'bg-purple-600',
      suitableExtTh: 'เคมีสูตรน้ำ Class K (Wet Chemical Potassium Acetate)',
      suitableExtEn: 'Wet Chemical Class K (Potassium Acetate base)',
      dangerTh: '⚠️ ห้ามสาดน้ำลงกระทะน้ำมันเดือด จะเกิดปรากฏการณ์ลูกไฟระเบิด (Oil Splatter Flashover)',
      dangerEn: '⚠️ NEVER POUR WATER ON HOT OIL! Causes explosive vapor expansion (Boilover).',
      symbol: 'หกเหลี่ยมสีดำ/ม่วง (Purple Hexagon)'
    }
  ];

  // Extinguisher Types Data
  const extinguisherTypes = [
    {
      id: 'dry-chemical',
      nameTh: 'ถังผงเคมีแห้ง (Dry Chemical Powder - ABC)',
      nameEn: 'Dry Chemical Powder (ABC)',
      colorCode: 'ถังสีแดง (Red Body)',
      pressureType: 'ความดันสะสม (Stored Pressure ~195 PSI มีเกจวัด)',
      targetClasses: ['A', 'B', 'C'],
      advantagesTh: 'ราคาประหยัด ดับไฟได้หลากหลายประเภท (ไม้ น้ำมัน ไฟฟ้า) มีประสิทธิภาพสูง',
      advantagesEn: 'Cost-effective, versatile across classes A, B, and C.',
      disadvantagesTh: 'มีคราบฝุ่นผงเคมีสีเหลือง/ขาวตกค้าง ไม่เหมาะกับห้อง Server หรือเครื่องมือแพทย์',
      disadvantagesEn: 'Leaves powdery corrosive residue; avoid in cleanrooms and server farms.',
      inspectionFocusTh: 'ตรวจเข็มเกจสีเขียว และเขย่า/คว่ำถังทุก 6 เดือนเพื่อป้องกันผงเคมีจับตัวเป็นก้อน',
      inspectionFocusEn: 'Verify gauge needle; invert tank biannually to prevent powder compaction.'
    },
    {
      id: 'co2',
      nameTh: 'ถังคาร์บอนไดออกไซด์ (Carbon Dioxide - CO2)',
      nameEn: 'Carbon Dioxide (CO2)',
      colorCode: 'ถังสีแดง หัวฉีดเป็นกระบอกลำโพงกรวย (Cone Horn)',
      pressureType: 'ก๊าซแรงดันสูงมาก (~850-1,000 PSI **ไม่มีเกจวัดแรงดัน**)',
      targetClasses: ['B', 'C'],
      advantagesTh: 'สะอาด 100% ไม่ทิ้งคราบตกค้าง ไม่นำไฟฟ้า เหมาะกับตู้ไฟ เซิร์ฟเวอร์ และอุปกรณ์อิเล็กทรอนิกส์',
      advantagesEn: '100% residue-free, non-conductive, ideal for electrical and computer server rooms.',
      disadvantagesTh: 'ไม่มีเกจวัด (ต้องชั่งน้ำหนักตรวจ) ระยะฉีดสั้น และลดปริมาณออกซิเจนในห้องปิด',
      disadvantagesEn: 'No pressure gauge (audit by weight), short discharge range, asphyxiation hazard.',
      inspectionFocusTh: 'ตรวจชั่งน้ำหนักรวม (Gross Weight) และตรวจลำโพงฉีดต้องไม่แตกร้าว',
      inspectionFocusEn: 'Weigh cylinder periodically. Loss >10% of tare weight requires recharge.'
    },
    {
      id: 'clean-agent',
      nameTh: 'ถังน้ำยาเหลวระเหย สารสะอาด (Clean Agent / BF2000 / Halotron / HFC-227ea)',
      nameEn: 'Clean Agent (Halotron / FM-200 / Novec)',
      colorCode: 'ถังสีเขียว (Green Body) หรือ ถังสีฟ้า',
      pressureType: 'ความดันสะสม (~100-195 PSI มีเกจวัด)',
      targetClasses: ['A', 'B', 'C'],
      advantagesTh: 'สะอาด ดับไฟเร็ว ไม่ทิ้งคราบ ไม่กัดกร่อนชิ้นส่วนอิเล็กทรอนิกส์ เป็นมิตรต่อสิ่งแวดล้อม',
      advantagesEn: 'Zero residue, non-conductive, non-corrosive to sensitive microchips.',
      disadvantagesTh: 'ราคาน้ำยาสูงกว่าผงเคมีแห้ง',
      disadvantagesEn: 'Higher initial and refill cost.',
      inspectionFocusTh: 'ตรวจเกจวัดแรงดันในแถบสีเขียว และซีลล็อกสลักนิรภัย',
      inspectionFocusEn: 'Inspect pressure gauge in green zone and tamper seal.'
    },
    {
      id: 'foam',
      nameTh: 'ถังโฟมดับเพลิง (AFFF Foam)',
      nameEn: 'Aqueous Film-Forming Foam (AFFF)',
      colorCode: 'ถังสีสเตนเลส (Stainless Steel) หรือ ถังสีเขียวอ่อน',
      pressureType: 'ความดันสะสม (~100 PSI มีเกจวัด)',
      targetClasses: ['A', 'B'],
      advantagesTh: 'สร้างฟิล์มโฟมคลุมผิวน้ำมัน ตัดออกซิเจนและป้องกันการปะทุซ้ำได้อย่างยอดเยี่ยม',
      advantagesEn: 'Forms vapor-sealing aqueous blanket over flammable liquids preventing flashback.',
      disadvantagesTh: '⚠️ ห้ามใช้กับเพลิง Class C (ไฟฟ้า) เด็ดขาด เนื่องจากน้ำและโฟมเป็นสื่อนำไฟฟ้า',
      disadvantagesEn: '⚠️ NEVER use on electrical Class C fires due to shock hazard.',
      inspectionFocusTh: 'ตรวจแรงดันเกจวัด และตรวจสอบหัวฉีดโฟมแบบมีรูอากาศดูดอากาศเข้า (Aerating Nozzle)',
      inspectionFocusEn: 'Check pressure gauge and specialized air-aspirating nozzle orifices.'
    },
    {
      id: 'wet-chemical',
      nameTh: 'ถังเคมีสูตรน้ำ ดับเพลิงในครัว (Wet Chemical Class K)',
      nameEn: 'Wet Chemical (Class K)',
      colorCode: 'ถังสีสเตนเลสเงา (Stainless) หัวฉีดเป็นก้านยาว (Wand Nozzle)',
      pressureType: 'ความดันสะสม (~100 PSI มีเกจวัด)',
      targetClasses: ['A', 'K'],
      advantagesTh: 'ทำปฏิกิริยาสะปอนนิฟิเคชัน (Saponification) เปลี่ยนน้ำมันร้อนเป็นสบู่ฟองหนา ดับไฟและลดอุณหภูมิ',
      advantagesEn: 'Saponification reaction turns hot burning cooking oils into thick cooling soap foam.',
      disadvantagesTh: 'ออกแบบเฉพาะสำหรับงานครัว ไม่เหมาะกับงานเพลิงไฟฟ้าแรงดันสูง',
      disadvantagesEn: 'Engineered specifically for commercial kitchens and fryer vats.',
      inspectionFocusTh: 'ตรวจระดับแรงดันในเกจวัด และความสะอาดของก้านหัวฉีดละอองฝอย',
      inspectionFocusEn: 'Verify pressure gauge and ensure fine-spray mist wand is clean.'
    }
  ];

  // Quiz Questions for Inspector Training
  const quizQuestions = [
    {
      id: 1,
      qTh: '1. ถังดับเพลิงชนิดก๊าซคาร์บอนไดออกไซด์ (CO2) ตรวจสอบความพร้อมอย่างไร เมื่อไม่มีเกจวัดแรงดัน?',
      qEn: '1. How do you inspect a CO2 extinguisher that lacks a pressure gauge?',
      optionsTh: [
        'A. เคาะฟังเสียงสะท้อนที่ตัวถัง',
        'B. ชั่งน้ำหนักรวม (Gross Weight) และเทียบกับน้ำหนักมาตรฐานบนคอถัง (ลดเกิน 10% ถือว่าไม่ผ่าน)',
        'C. ลองกดฉีดพ่นดูเล็กน้อย',
        'D. ใช้มือลูบดูความเย็นของผิวถัง'
      ],
      optionsEn: [
        'A. Tap the cylinder to hear acoustic resonance',
        'B. Weigh the gross weight; loss >10% of tare capacity fails inspection',
        'C. Discharge a short burst to test',
        'D. Feel shell temperature with bare hands'
      ],
      correctIndex: 1,
      explanationTh: 'ถูกต้อง! ถัง CO2 บรรจุก๊าซแรงดันสูงสถานะของเหลว จึงไม่มีเกจวัด ต้องชั่งน้ำหนักรวมตาม NFPA 10 หากน้ำหนักลดลงเกิน 10% ต้องส่งอัดบรรจุใหม่ทันที',
      explanationEn: 'Correct! CO2 stored as liquid under high pressure (~850 PSI) must be verified by gross weight.'
    },
    {
      id: 2,
      qTh: '2. ตามกฎกระทรวงและ NFPA 10 ระยะความสูงในการติดตั้งถังดับเพลิงจากพื้นถึงคันบีบต้องไม่เกินกี่เมตร?',
      qEn: '2. What is the maximum allowable mounting height from floor to operating lever?',
      optionsTh: [
        'A. ไม่เกิน 1.00 เมตร',
        'B. ไม่เกิน 1.50 เมตร',
        'C. ไม่เกิน 2.00 เมตร',
        'D. วางบนพื้นตรงไหนก็ได้'
      ],
      optionsEn: [
        'A. Up to 1.00 meter',
        'B. Up to 1.50 meters',
        'C. Up to 2.00 meters',
        'D. Freely placed on floor'
      ],
      correctIndex: 1,
      explanationTh: 'ถูกต้อง! สำหรับถังน้ำหนักรวมไม่เกิน 40 ปอนด์ (18 กก.) ต้องติดตั้งให้ส่วนบนสุด/คันบีบสูงจากพื้นไม่เกิน 1.50 เมตร เพื่อให้ผู้ใช้งานทุกสรีระสามารถปลดมาใช้ได้สะดวก',
      explanationEn: 'Correct! Units ≤40 lbs must be mounted with top of handle ≤1.50m (5 ft) above floor.'
    },
    {
      id: 3,
      qTh: '3. หากเกิดเพลิงไหม้ตู้สวิตช์บอร์ดไฟฟ้า (Class C) ถังดับเพลิงชนิดใด "ห้ามนำมาใช้เด็ดขาด"?',
      qEn: '3. In an active electrical fire (Class C), which extinguisher type is STRICTLY PROHIBITED?',
      optionsTh: [
        'A. ก๊าซ CO2',
        'B. น้ำยาเหลวระเหยสารสะอาด (Clean Agent)',
        'C. ถังโฟมดับเพลิง (AFFF Foam) หรือถังน้ำ',
        'D. ผงเคมีแห้ง (Dry Chemical ABC)'
      ],
      optionsEn: [
        'A. Carbon Dioxide (CO2)',
        'B. Clean Agent',
        'C. AFFF Foam / Water Extinguisher',
        'D. ABC Dry Chemical'
      ],
      correctIndex: 2,
      explanationTh: 'ถูกต้อง! น้ำและโฟมดับเพลิงเป็นตัวนำกระแสไฟฟ้า (Conductive) หากฉีดใส่กระแสไฟฟ้าจะเกิดไฟดูดย้อนกลับมายังผู้ฉีดจนถึงแก่ชีวิตได้',
      explanationEn: 'Correct! Water and foam conduct high-voltage electricity, causing fatal electrocution.'
    },
    {
      id: 4,
      qTh: '4. หลักการใช้ถังดับเพลิงมาตรฐานสากล 4 ขั้นตอน (P.A.S.S.) ย่อมาจากอะไร?',
      qEn: '4. What does the universal P.A.S.S. fire fighting acronym stand for?',
      optionsTh: [
        'A. Power, Aim, Stop, Safety',
        'B. Pull (ดึงสลัก), Aim (เล็งฐานไฟ), Squeeze (บีบคันบังคับ), Sweep (ส่ายปลายสายไปมา)',
        'C. Push, Alert, Start, Secure',
        'D. Protect, Alarm, Shoot, Stand'
      ],
      optionsEn: [
        'A. Power, Aim, Stop, Safety',
        'B. Pull pin, Aim at base, Squeeze lever, Sweep side-to-side',
        'C. Push, Alert, Start, Secure',
        'D. Protect, Alarm, Shoot, Stand'
      ],
      correctIndex: 1,
      explanationTh: 'ถูกต้อง! P-Pull (ดึงสลักนิรภัย), A-Aim (เล็งไปที่ฐานของเปลวไฟ ไม่ใช่ยอดไฟ), S-Squeeze (บีบคันบีบ), S-Sweep (ส่ายหัวฉีดไปมาในแนวระนาบ)',
      explanationEn: 'Correct! Pull the pin, Aim at the base of fire, Squeeze the handle, Sweep side-to-side.'
    },
    {
      id: 5,
      qTh: '5. เมื่อตรวจพบถังดับเพลิงที่มีเข็มเกจวัดแรงดันตกไปอยู่ในแถบสีแดง (Recharge) เจ้าหน้าที่ต้องทำอย่างไรในแอป?',
      qEn: '5. When an extinguisher gauge is in the red recharge zone, what should the inspector do in the app?',
      optionsTh: [
        'A. ปล่อยผ่านไปก่อนเพราะยังมีสารเคมีอยู่',
        'B. ถ่ายภาพเข็มเกจ เลือกผลตรวจ "ไม่ผ่าน" (Failed) และกดส่งบันทึกเพื่อให้ระบบแจ้งเตือนทีมซ่อมบำรุง',
        'C. ปรับเปลี่ยนตำแหน่งถังไปไว้ในห้องอื่น',
        'D. ลบถังออกจากระบบ'
      ],
      optionsEn: [
        'A. Pass it since powder remains inside',
        'B. Take photo of gauge, select "Failed", and submit record for maintenance alert',
        'C. Move unit to another room',
        'D. Delete unit from database'
      ],
      correctIndex: 1,
      explanationTh: 'ถูกต้อง! การเลือก "ไม่ผ่าน" พร้อมแนบรูปถ่ายหลักฐาน จะเปลี่ยนสถานะถังเป็นสีแดงทันที และส่งสัญญาณแจ้งเตือนเข้ากลุ่ม LINE และแดชบอร์ดเพื่อให้จัดถังสำรองมาเปลี่ยน',
      explanationEn: 'Correct! Flagging as Failed with photo evidence triggers immediate cloud alerts and ticket dispatch.'
    }
  ];

  // Calculate Quiz Score
  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <div id="manual-view-container" className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Header Banner & Executive Action Bar */}
      <div className="bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#0f172a] text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/25 text-red-300 text-xs font-bold border border-red-500/40">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>{isTh ? 'คู่มือการปฏิบัติงานมาตรฐานสากล (SOP Manual)' : 'Standard Operating Procedure (SOP)'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                <span>NFPA 10 & กฎกระทรวง พ.ศ. 2555</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {isTh ? 'คู่มือการใช้งาน & มาตรฐานความปลอดภัยอัคคีภัย' : 'Fire Safety Operations & System Manual'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isTh 
                ? 'แนวทางปฏิบัติงานฉบับสมบูรณ์สำหรับเจ้าหน้าที่ตรวจสอบความปลอดภัย (จป.วิชาชีพ / ช่างซ่อมบำรุง / Safety Officer) ครอบคลุมเกณฑ์ตรวจ 7 จุดตาม NFPA 10, กายวิภาคถังดับเพลิง, ประเภทเพลิง A-B-C-D-K, ระบบสแกน QR Code, คลาวด์ซิงค์สองทาง และการทดสอบวัดความรู้'
                : 'Comprehensive operational manual and technical reference for fire safety auditors, covering NFPA 10 inspection protocols, fire classifications, QR code automation, and safety certification.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="manual-print-action-btn"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm"
              title={isTh ? 'สั่งพิมพ์คู่มือหรือบันทึกเป็น PDF' : 'Print manual or save to PDF'}
            >
              <Printer className="w-4 h-4 text-red-400" />
              <span>{isTh ? 'พิมพ์คู่มือ / PDF' : 'Print / Export PDF'}</span>
            </button>

            <button
              id="manual-start-inspection-header-btn"
              onClick={onOpenNewInspection}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] active:bg-[#8a0a13] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-red-900/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTh ? 'เริ่มตรวจอุปกรณ์ทันที' : 'Start Inspection'}</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="manual-search-query-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTh ? 'ค้นหาในคู่มือ: เกจวัด, CO2, ถังโฟม, สลัก, LINE, PASS, ผังอาคาร...' : 'Search guide: gauge, CO2, foam, pull pin, LINE, PASS, blueprint...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-xs sm:text-sm text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTh ? 'ฉบับปรับปรุงมาตรฐานล่าสุด (Full Digital Edition)' : 'Standard v2.5 Online Edition'}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'sop', labelTh: '1. ขั้นตอนปฏิบัติงาน (SOP)', labelEn: '1. Inspection SOP', icon: BookOpen },
          { id: 'nfpa-criteria', labelTh: '2. เกณฑ์ตรวจ 7 จุด (NFPA 10)', labelEn: '2. 7-Point NFPA 10', icon: ShieldCheck },
          { id: 'types-anatomy', labelTh: '3. ชนิดถัง & ประเภทเพลิง', labelEn: '3. Extinguishers & Fire Classes', icon: Flame },
          { id: 'system-features', labelTh: '4. ฟังก์ชันระบบ & คลาวด์', labelEn: '4. System Features & Cloud', icon: Smartphone },
          { id: 'troubleshoot', labelTh: '5. แก้ปัญหา & ข้อควรระวัง', labelEn: '5. Diagnostics & FAQ', icon: HelpCircle },
          { id: 'quiz', labelTh: '6. แบบทดสอบวัดความรู้', labelEn: '6. Inspector Quiz', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`manual-tab-btn-${tab.id}`}
              onClick={() => setCurrentTab(tab.id as ManualSectionTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-[#d32f2f] text-white shadow-sm shadow-red-900/20' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{isTh ? tab.labelTh : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT MODULES */}

      {/* TAB 1: SOP WORKFLOW (ขั้นตอนปฏิบัติงานมาตรฐาน) */}
      {currentTab === 'sop' && (
        <div className="space-y-6">
          
          {/* Executive Flowcard */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#d32f2f]" />
                  <span>{isTh ? 'ขั้นตอนปฏิบัติงานมาตรฐานการตรวจสอบประจำเดือน (Standard Operating Procedure)' : 'Monthly Fire Extinguisher Inspection SOP'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {isTh ? 'กำหนดเวลา: ตรวจสอบทุกๆ 30 วัน ตามประกาศกระทรวงอุตสาหกรรมและกระทรวงแรงงาน' : 'Mandatory interval: Every 30 days per ministerial safety regulations'}
                </p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
                SOP-SAFE-001
              </span>
            </div>

            {/* 4 Steps Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Step 1 */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 relative group hover:border-red-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  01
                </div>
                <h4 className="font-bold text-sm text-gray-900">{isTh ? 'เข้าถึงจุดติดตั้ง & สแกน QR' : 'Location & QR Scan'}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isTh 
                    ? 'เดินเข้าหาถังตามแผนผังอาคาร เปิดปุ่ม "สแกน QR" ในระบบแล้วส่องกล้องไปที่สติกเกอร์ประจำถัง ระบบจะดึงรหัส ตำแหน่ง และชนิดน้ำยาขึ้นมาทันที'
                    : 'Locate extinguisher via blueprint. Tap "Scan QR" and align mobile camera with unit sticker to auto-load unit details.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isTh ? 'ใช้กล้องมือถือได้ทุกรุ่น' : 'Mobile camera supported'}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 relative group hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  02
                </div>
                <h4 className="font-bold text-sm text-gray-900">{isTh ? 'ตรวจสภาพ 7 จุด (NFPA 10)' : '7-Point Physical Audit'}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isTh 
                    ? 'ตรวจเกจวัดแรงดัน, สลักและซีลนิรภัย, สายฉีด, สภาพตัวถัง, ป้ายแนะนำ, ความสูงติดตั้ง (1.0-1.5 ม.), และสิ่งกีดขวางในระยะ 1 เมตร'
                    : 'Audit pressure gauge, pull pin, tamper wire, hose, shell integrity, nameplate, mounting height, and access clearance.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTh ? 'เกณฑ์มาตรฐานสากล' : 'NFPA 10 Standard'}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 relative group hover:border-amber-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  03
                </div>
                <h4 className="font-bold text-sm text-gray-900">{isTh ? 'ถ่ายภาพหลักฐาน & กรอกผล' : 'Photo Evidence & Log'}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isTh 
                    ? 'ถ่ายภาพหน้าปัดเกจหรือสภาพถังหน้างานจริง ระบุค่า PSI ประเมินผล ผ่าน (Normal) หรือ ไม่ผ่าน (Failed) พร้อมบันทึกข้อบกพร่อง'
                    : 'Capture real-time photo of pressure gauge, log PSI, evaluate Pass/Fail, and note defect remarks if any.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTh ? 'แนบหลักฐานแบบดิจิทัล' : 'Tamper-proof digital log'}</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 relative group hover:border-emerald-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  04
                </div>
                <h4 className="font-bold text-sm text-gray-900">{isTh ? 'ซิงค์ Cloud & แจ้งเตือน LINE' : 'Cloud Sync & LINE Alerts'}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isTh 
                    ? 'กดบันทึก ข้อมูลจะซิงค์ขึ้น Cloud Firestore ทันที ระบบจะอัปเดตป้ายตรวจดิจิทัล และส่งแจ้งเตือนเข้ากลุ่ม LINE หากพบถังชำรุด'
                    : 'Submit inspection. Records live-sync to Firestore, update next due date, and dispatch LINE alerts on defects.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-gray-500 flex items-center gap-1 font-semibold">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTh ? 'อัปเดตเรียลไทม์ 100%' : '100% Real-time sync'}</span>
                </div>
              </div>

            </div>

            {/* Universal Fire Extinguisher Usage (P.A.S.S. Guide) */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>{isTh ? 'หลักการใช้ถังดับเพลิงเบื้องต้นเมื่อเกิดเหตุฉุกเฉิน (P.A.S.S. Technique)' : 'Emergency Fire Fighting Technique: P.A.S.S.'}</span>
                </h4>
                <span className="text-xs font-semibold text-gray-500">{isTh ? 'ยืนเหนือลม ระยะห่าง 2-3 เมตร' : 'Stand windward 2-3m away'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl space-y-1.5">
                  <div className="font-black text-lg text-red-700">P - Pull</div>
                  <div className="font-bold text-xs text-gray-900">{isTh ? 'ดึงสลักนิรภัย' : 'Pull the Pin'}</div>
                  <p className="text-[11px] text-gray-600">{isTh ? 'กระตุกสลักล็อกออกจากคันบีบ โดยดึงให้สายรัดพลาสติกซีลขาดออก' : 'Pull the safety pin to break the tamper seal and unlock handle.'}</p>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                  <div className="font-black text-lg text-amber-700">A - Aim</div>
                  <div className="font-bold text-xs text-gray-900">{isTh ? 'เล็งไปที่ฐานของไฟ' : 'Aim at Base of Fire'}</div>
                  <p className="text-[11px] text-gray-600">{isTh ? 'จับปลายสายฉีด เล็งไปยังจุดกำเนิดเปลวเพลิงด้านล่าง ไม่ใช่ที่ยอดเปลวไฟ' : 'Point nozzle directly at the fuel base of the fire, not the flames.'}</p>
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="font-black text-lg text-blue-700">S - Squeeze</div>
                  <div className="font-bold text-xs text-gray-900">{isTh ? 'บีบคันบังคับ' : 'Squeeze the Lever'}</div>
                  <p className="text-[11px] text-gray-600">{isTh ? 'บีบคันบีบด้านบนให้สุด เพื่อเปิดวาล์วฉีดพ่นสารเคมีดับเพลิงออกมาอย่างต่อเนื่อง' : 'Squeeze operating lever firmly to release extinguishing agent.'}</p>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="font-black text-lg text-emerald-700">S - Sweep</div>
                  <div className="font-bold text-xs text-gray-900">{isTh ? 'ส่ายสายฉีดไปมา' : 'Sweep Side-to-Side'}</div>
                  <p className="text-[11px] text-gray-600">{isTh ? 'กวาดสายฉีดจากซ้ายไปขวาให้ทั่วฐานเปลวเพลิงจนกระทั่งไฟดับสนิท' : 'Sweep nozzle back and forth across the base until fire is fully out.'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Legal Regulations & Frequency Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>{isTh ? 'ข้อกำหนดทางกฎหมายและรอบการทดสอบทางวิศวกรรม (Legal Compliance)' : 'Statutory Maintenance & Hydrostatic Testing'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isTh ? 'ตรวจเช็กรายเดือน (Monthly Inspection)' : 'Monthly Visual Inspection'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isTh 
                    ? 'ตรวจสภาพทั่วไป 7 จุด ทุกๆ 30 วัน โดยเจ้าหน้าที่ความปลอดภัยหรือตัวแทนที่ได้รับการแต่งตั้ง'
                    : 'Conducted every 30 days to verify physical readiness and accessibility.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>{isTh ? 'ตรวจบำรุงรักษาประจำปี (Annual Maintenance)' : 'Annual Maintenance'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isTh 
                    ? 'ตรวจสอบละเอียด ถอดตรวจกลไกวาล์ว น้ำหนักสารเคมี และประเมินอายุการใช้งานโดยบริษัทผู้เชี่ยวชาญ'
                    : 'Thorough examination of mechanical parts, seals, and extinguishing agent.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{isTh ? 'ทดสอบไฮโดรสแตติก (Hydrostatic Test)' : 'Hydrostatic Pressure Test'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isTh 
                    ? 'ทดสอบแรงดันน้ำของตัวถังเหล็ก: ถัง CO2 และถังโฟมทุก 5 ปี / ถังผงเคมีแห้ง Stored Pressure ทุก 12 ปี'
                    : 'Pressure vessel test: CO2/Foam every 5 years; Dry Chemical every 12 years.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: NFPA 10 7-POINT CRITERIA (เกณฑ์ตรวจ 7 จุด) */}
      {currentTab === 'nfpa-criteria' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isTh ? 'เกณฑ์มาตรฐานการตรวจสอบ 7 จุดตาม NFPA 10' : 'NFPA 10 7-Point Inspection Breakdown'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {isTh ? 'คลิกที่แต่ละหัวข้อเพื่อดูเกณฑ์ "ผ่าน", เกณฑ์ "ไม่ผ่าน" และแนวทางการแก้ไขข้อบกพร่อง' : 'Click on each checkpoint to expand detailed pass/fail criteria'}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                7 Checkpoints
              </span>
            </div>

            {/* Checkpoint Detailed Accordions */}
            <div className="space-y-3">
              {checkPoints.map((cp) => {
                const isExpanded = expandedSection === cp.id;
                const Icon = cp.icon;
                return (
                  <div 
                    key={cp.id} 
                    id={`checkpoint-card-${cp.id}`}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isExpanded ? 'border-red-300 bg-slate-50/50 shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : cp.id)}
                      className="w-full p-4 flex items-center justify-between text-left gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {cp.num}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {isTh ? cp.nameTh : cp.nameEn}
                          </h4>
                          <p className="text-xs text-emerald-700 font-semibold truncate mt-0.5">
                            {isTh ? cp.standardTh : cp.standardEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isExpanded ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isExpanded ? (isTh ? 'ย่อข้อมูล' : 'Collapse') : (isTh ? 'ดูรายละเอียด' : 'Expand')}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 pt-0 space-y-4 text-xs text-gray-700 border-t border-gray-200/80 bg-white">
                        
                        {/* Pass vs Fail Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                          
                          {/* Pass Criteria */}
                          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{isTh ? 'เกณฑ์ที่ถือว่า "ผ่าน" (Normal / Pass):' : 'Pass Criteria:'}</span>
                            </div>
                            <p className="text-emerald-900 leading-relaxed pl-5">
                              {isTh ? cp.passCriteriaTh : cp.passCriteriaEn}
                            </p>
                          </div>

                          {/* Fail Criteria */}
                          <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 text-red-800 font-bold">
                              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{isTh ? 'เกณฑ์ที่ถือว่า "ไม่ผ่าน" (Defect / Fail):' : 'Fail Criteria:'}</span>
                            </div>
                            <p className="text-red-900 leading-relaxed pl-5">
                              {isTh ? cp.failCriteriaTh : cp.failCriteriaEn}
                            </p>
                          </div>

                        </div>

                        {/* Special Rule & Action */}
                        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{isTh ? 'ข้อสังเกตและกฎเกณฑ์พิเศษ (NFPA 10 Note):' : 'Special Standard Note:'}</span>
                          </div>
                          <p className="leading-relaxed text-[11px] pl-5">
                            {isTh ? cp.specialRuleTh : cp.specialRuleEn}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{isTh ? 'การดำเนินการแก้ไข:' : 'Action Required:'}</span>
                            <span className="text-gray-600">{isTh ? cp.actionTh : cp.actionEn}</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TYPES & ANATOMY (ชนิดถัง & ประเภทเพลิง) */}
      {currentTab === 'types-anatomy' && (
        <div className="space-y-6">
          
          {/* Fire Class Selector & Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>{isTh ? 'การจำแนกประเภทเพลิง 5 คลาส (Classes of Fire A, B, C, D, K)' : 'Fire Classifications Matrix'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isTh ? 'เลือกสารดับเพลิงให้ตรงกับประเภทเชื้อเพลิงเพื่อความปลอดภัยสูงสุด' : 'Match extinguishing agent to appropriate fuel class'}
                </p>
              </div>
            </div>

            {/* Fire Class Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(['A', 'B', 'C', 'D', 'K'] as const).map((cls) => {
                const isSelected = selectedFireClass === cls;
                return (
                  <button
                    key={cls}
                    id={`fire-class-tab-${cls}`}
                    onClick={() => setSelectedFireClass(cls)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected 
                        ? 'border-red-600 bg-red-50 shadow-xs' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xl font-black text-gray-900">Class {cls}</div>
                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                      {cls === 'A' ? (isTh ? 'เชื้อเพลิงธรรมดา' : 'Solid Combustibles') :
                       cls === 'B' ? (isTh ? 'ของเหลว/ก๊าซไวไฟ' : 'Flammable Liquid') :
                       cls === 'C' ? (isTh ? 'อุปกรณ์ไฟฟ้า' : 'Electrical') :
                       cls === 'D' ? (isTh ? 'โลหะติดไฟ' : 'Metals') :
                       (isTh ? 'น้ำมันครัวร้อน' : 'Kitchen Oil')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Fire Class Card */}
            {(() => {
              const fc = fireClasses.find(f => f.class === selectedFireClass)!;
              return (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl ${fc.color} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
                        {fc.class}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-gray-900">{isTh ? fc.nameTh : fc.nameEn}</h4>
                        <p className="text-xs text-gray-500">{isTh ? fc.symbol : fc.symbol}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1">
                      <span className="font-bold text-gray-900">{isTh ? 'วัสดุเชื้อเพลิง:' : 'Fuel Materials:'}</span>
                      <p className="text-gray-600">{isTh ? fc.materialsTh : fc.materialsEn}</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                      <span className="font-bold text-emerald-900">{isTh ? 'ชนิดถังดับเพลิงที่เหมาะสม:' : 'Recommended Extinguishers:'}</span>
                      <p className="text-emerald-800 font-semibold">{isTh ? fc.suitableExtTh : fc.suitableExtEn}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{isTh ? fc.dangerTh : fc.dangerEn}</span>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* 5 Extinguisher Types Technical Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span>{isTh ? 'เปรียบเทียบชนิดสารดับเพลิง 5 ชนิดหลัก (Extinguisher Types Breakdown)' : '5 Main Extinguisher Types & Operating Characteristics'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extinguisherTypes.map((ext) => (
                <div 
                  key={ext.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{isTh ? ext.nameTh : ext.nameEn}</h4>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {ext.targetClasses.map(tc => (
                        <span key={tc} className="px-2 py-0.5 bg-slate-800 text-white rounded font-bold text-[10px]">
                          Class {tc}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-slate-200">
                      <div>
                        <strong className="text-gray-900">{isTh ? 'ลักษณะถัง:' : 'Color/Body:'}</strong> {ext.colorCode}
                      </div>
                      <div>
                        <strong className="text-gray-900">{isTh ? 'ระบบแรงดัน:' : 'Pressure:'}</strong> {ext.pressureType}
                      </div>
                      <div className="text-emerald-700">
                        <strong>✓ {isTh ? 'จุดเด่น:' : 'Advantage:'}</strong> {isTh ? ext.advantagesTh : ext.advantagesEn}
                      </div>
                      <div className="text-amber-800">
                        <strong>⚠ {isTh ? 'ข้อจำกัด:' : 'Limitation:'}</strong> {isTh ? ext.disadvantagesTh : ext.disadvantagesEn}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900">
                    <strong>🔍 {isTh ? 'จุดเน้นตรวจ:' : 'Audit Focus:'}</strong> {isTh ? ext.inspectionFocusTh : ext.inspectionFocusEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: SYSTEM FEATURES & CLOUD (ฟังก์ชันระบบ & คลาวด์) */}
      {currentTab === 'system-features' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span>{isTh ? 'คู่มือการใช้งานระบบดิจิทัล & การเชื่อมต่อคลาวด์' : 'System Features & Cloud Operation'}</span>
            </h3>

            {/* Feature 1: QR Scanning */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-gray-900 text-sm">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span>{isTh ? '1. การสแกน QR Code & การพิมพ์สติกเกอร์ประจำถัง' : '1. QR Code Workflow & Sticker Printing'}</span>
                </div>
                <button
                  onClick={onOpenQrScanner}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                >
                  {isTh ? 'ทดสอบเปิดกล้อง' : 'Open Camera'}
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isTh 
                  ? 'ถังดับเพลิงทุกถังในระบบจะมีรหัส QR Code เฉพาะตัว (Unique QR Identifier) เจ้าหน้าที่สามารถกดพิมพ์ป้ายสติกเกอร์จากแท็บ "รายการอุปกรณ์" เพื่อนำไปติดที่ถัง เมื่อใช้กล้องมือถือสแกน ระบบจะเปิดหน้าตรวจเช็กของถังนั้นทันทีโดยไม่ต้องค้นหารหัสเอง'
                  : 'Every extinguisher possesses a unique QR identifier. Printing labels and affixing them on physical tanks enables zero-click inspection forms on mobile.'}
              </p>
            </div>

            {/* Feature 2: Real-time Cloud Sync */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-gray-900 text-sm">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <span>{isTh ? '2. การเชื่อมต่อฐานข้อมูล Google Cloud Firestore แบบเรียลไทม์ 2 ทาง' : '2. Real-time Bidirectional Firestore Sync'}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isTh 
                  ? 'ระบบทำงานบน Cloud Firestore Live Listener เมื่อเจ้าหน้าที่ตรวจเช็กถังผ่านมือถือ ข้อมูลจะวิ่งเข้าฐานข้อมูล Cloud และเด้งแสดงผลบนหน้าจอคอมพิวเตอร์ของผู้บริหารทันทีใน 1 วินาที โดยไม่ต้องกดปุ่มรีเฟรช'
                  : 'Operating on Firestore live listeners, inspection updates from field mobile units stream into desktop monitoring consoles in sub-second latency.'}
              </p>
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🟢 Cloud Sync: {isTh ? 'เชื่อมต่อฐานข้อมูลสมบูรณ์' : 'Connected & Live'}</span>
                </div>
                <span className="text-[11px] text-slate-400">Database: ai-studio-firesafepro</span>
              </div>
            </div>

            {/* Feature 3: LINE Notify */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-gray-900 text-sm">
                  <Bell className="w-5 h-5 text-green-600" />
                  <span>{isTh ? '3. การตั้งค่าแจ้งเตือน LINE Notify & Webhook อัตโนมัติ' : '3. LINE Notification Setup & Webhook Dispatch'}</span>
                </div>
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                >
                  {isTh ? 'ไปที่หน้าตั้งค่า LINE' : 'Configure LINE'}
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isTh 
                  ? 'สามารถนำ LINE Notify Token หรือ Webhook URL มาใส่ในหน้าตั้งค่าระบบ เมื่อเจ้าหน้าที่ตรวจพบถังชำรุด (แรงดันตก หรือ ซีลขาด) ระบบจะส่งข้อความแจ้งเตือนพร้อมรูปถ่ายและพิกัดเข้ากลุ่ม LINE ของทีมช่างซ่อมบำรุงทันที'
                  : 'Link your LINE Token or Webhook. Any failed inspection instantly broadcasts an alert packet with defect photos directly to maintenance channels.'}
              </p>
            </div>

            {/* Feature 4: Interactive Facility Map */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-gray-900 text-sm">
                  <Map className="w-5 h-5 text-red-600" />
                  <span>{isTh ? '4. แผนผังอาคารดิจิทัล & แผนที่พิกัดถัง (Floor Plan Blueprint)' : '4. Interactive Facility Floor Plan Map'}</span>
                </div>
                <button
                  onClick={onOpenFacilityMap}
                  className="px-3 py-1.5 bg-[#d32f2f] hover:bg-[#af101a] text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                >
                  {isTh ? 'เปิดแผนผัง' : 'Open Map'}
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isTh 
                  ? 'ดูตำแหน่งที่ตั้งถังดับเพลิงตามผังแปลนอาคารแต่ละชั้น พร้อมหมุดสีตามสถานะความพร้อม (เขียว=พร้อมใช้, เหลือง=ใกล้ครบกำหนด 30 วัน, แดง=ชำรุด/หมดอายุ) ช่วยให้ค้นหาถังหน้างานได้อย่างรวดเร็ว'
                  : 'Visual floor blueprints render color-coded pins showing exact locations and readiness states across all buildings and levels.'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: TROUBLESHOOTING & FAQ (แก้ปัญหา & คำถามที่พบบ่อย) */}
      {currentTab === 'troubleshoot' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>{isTh ? 'คำถามที่พบบ่อย & ตารางวิเคราะห์แก้ไขปัญหา (Troubleshooting Matrix)' : 'Troubleshooting Matrix & Common FAQ'}</span>
            </h3>

            <div className="space-y-3">
              {[
                {
                  qTh: '1. กล้องมือถือไม่เปิดขึ้นมาเมื่อกดสแกน QR Code หรือถ่ายรูป?',
                  qEn: '1. Camera fails to open on mobile browser?',
                  aTh: 'เกิดจากการยังไม่ได้ให้สิทธิ์เข้าถึงกล้อง (Camera Permission) วิธีแก้ไข: ให้กดที่ไอคอนแม่กุญแจ (Lock Icon) ที่แถบ URL ของเบราว์เซอร์ (Safari หรือ Chrome) แล้วเลือก "อนุญาตการเข้าถึงกล้อง (Allow Camera)" จากนั้นรีเฟรชหน้าเว็บ 1 ครั้ง',
                  aEn: 'Ensure browser camera permission is granted. Tap the lock icon in the URL bar and enable Camera access, then reload.'
                },
                {
                  qTh: '2. ตรวจพบถังชำรุด (แรงดันตก หรือ ซีลขาด) ต้องดำเนินการอย่างไร?',
                  qEn: '2. Defective extinguisher discovered during audit?',
                  aTh: 'ให้เลือกผลการตรวจเป็น "ไม่ผ่าน (Failed)" และถ่ายภาพจุดชำรุดเป็นหลักฐาน พร้อมระบุหมายเหตุ ระบบจะเปลี่ยนสีถังเป็นสีแดงทันที และส่งสัญญาณแจ้งเตือนเข้ากลุ่ม LINE ของทีมช่าง ให้เจ้าหน้าที่นำถังสำรอง (Spare Unit) มาแขวนสลับเปลี่ยนทันที',
                  aEn: 'Flag record as Failed, snap defect photo, and submit. The system sends emergency maintenance alerts to replace the unit with a spare.'
                },
                {
                  qTh: '3. เมื่อตรวจบนมือถือแล้ว ข้อมูลบนคอมพิวเตอร์ไม่อัปเดตทำอย่างไร?',
                  qEn: '3. Mobile inspection updates not reflecting on desktop?',
                  aTh: 'ตรวจดูแถบเมนูด้านบนของคอมพิวเตอร์ว่าแสดง 🟢 Cloud Sync หรือไม่ หากขึ้นสถานะสีเขียวให้กดรีเฟรชเบราว์เซอร์ (F5 / Reload) บนคอมพิวเตอร์ 1 ครั้ง เนื่องจากอาจเกิดจากแท็บเบราว์เซอร์เข้าสู่โหมดพักหน้าจอ (Tab Sleep)',
                  aEn: 'Verify the 🟢 Cloud Sync badge in top bar. If green, simply refresh (F5) the desktop browser window.'
                },
                {
                  qTh: '4. ถังดับเพลิงชนิดผงเคมีแห้ง ควรบำรุงรักษาอย่างไรเพื่อไม่ให้ผงเคมีแข็งตัว?',
                  qEn: '4. How to prevent dry chemical powder from caking inside cylinder?',
                  aTh: 'ตามมาตรฐานการบำรุงรักษา ควรปลดถังลงมาคว่ำหงายสลับด้าน (Invert Cylinder) ทุกๆ 6 เดือน และฟังเสียงผงเคมีไหล เพื่อป้องกันผงเคมีแห้งจับตัวเป็นก้อนแข็งที่ก้นถังเนื่องจากแรงโน้มถ่วงและความชื้น',
                  aEn: 'Invert cylinder biannually and listen for free powder movement to prevent compaction.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 flex items-start gap-2">
                    <span className="text-red-600 font-bold shrink-0">Q:</span>
                    <span>{isTh ? faq.qTh : faq.qEn}</span>
                  </h4>
                  <p className="text-xs text-gray-600 pl-5 leading-relaxed">
                    <strong className="text-emerald-700">A: </strong>
                    {isTh ? faq.aTh : faq.aEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INSPECTOR KNOWLEDGE QUIZ (แบบทดสอบความรู้เจ้าหน้าที่) */}
      {currentTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{isTh ? 'แบบทดสอบประเมินความรู้เจ้าหน้าที่ตรวจสอบ (Inspector Safety Quiz)' : 'Safety Auditor Knowledge Evaluation'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {isTh ? 'ทดสอบความรู้มาตรฐาน NFPA 10 และการระงับอัคคีภัย 5 ข้อ เพื่อทบทวนความเข้าใจ' : '5-Question assessment on NFPA 10 criteria and emergency response protocols'}
                </p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{isTh ? `คะแนนที่ได้: ${calculateScore()} / ${quizQuestions.length}` : `Score: ${calculateScore()} / ${quizQuestions.length}`}</span>
                </div>
              )}
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => {
                const selectedAns = quizAnswers[q.id];
                const isAnswered = selectedAns !== undefined;
                const isCorrect = isAnswered && selectedAns === q.correctIndex;

                return (
                  <div 
                    key={q.id}
                    id={`quiz-question-card-${q.id}`}
                    className={`p-5 rounded-2xl border space-y-3 transition-all ${
                      quizSubmitted 
                        ? isCorrect 
                          ? 'border-emerald-300 bg-emerald-50/40' 
                          : 'border-red-300 bg-red-50/40'
                        : 'border-gray-200 bg-slate-50/60'
                    }`}
                  >
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      {isTh ? q.qTh : q.qEn}
                    </h4>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(isTh ? q.optionsTh : q.optionsEn).map((opt, optIdx) => {
                        const isThisSelected = selectedAns === optIdx;
                        let optionStyle = 'border-gray-200 bg-white text-gray-700 hover:border-gray-300';
                        
                        if (isThisSelected) {
                          optionStyle = 'border-red-600 bg-red-50 text-red-900 font-bold shadow-xs';
                        }

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'border-emerald-600 bg-emerald-100 text-emerald-900 font-bold';
                          } else if (isThisSelected && !isCorrect) {
                            optionStyle = 'border-red-600 bg-red-100 text-red-900 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {quizSubmitted && (
                      <div className="pt-2 text-xs text-gray-700 border-t border-gray-200/80">
                        <p className={isCorrect ? 'text-emerald-800' : 'text-red-800'}>
                          <strong>{isTh ? 'เฉลยและคำอธิบาย:' : 'Explanation:'} </strong>
                          {isTh ? q.explanationTh : q.explanationEn}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit & Reset Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              {!quizSubmitted ? (
                <button
                  id="quiz-submit-answers-btn"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="px-6 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                  {isTh ? 'ส่งคำตอบและตรวจผลประเมิน' : 'Submit & Check Answers'}
                </button>
              ) : (
                <button
                  id="quiz-reset-btn"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isTh ? 'ทำแบบทดสอบใหม่อีกครั้ง' : 'Retake Quiz'}</span>
                </button>
              )}

              <span className="text-xs text-gray-500">
                {Object.keys(quizAnswers).length} / {quizQuestions.length} {isTh ? 'ข้อที่ตอบแล้ว' : 'answered'}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Footer Support & Metadata */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          RT-Fire Safety PRO — Professional Digital Inspection & Safety Compliance System
        </p>
        <p className="text-[11px]">
          Compliant with NFPA 10 (Standard for Portable Fire Extinguishers) & Ministry of Labour Fire Prevention Regulations B.E. 2555
        </p>
      </div>

    </div>
  );
};
