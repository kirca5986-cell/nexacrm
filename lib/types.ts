export type MachineCategoryId =
  | 'krenler'
  | 'kendinden-tahrikli'
  | 'basincli-kaplar'
  | 'platformlar';

export interface MachineType {
  id: string;
  name: string;
  category: MachineCategoryId;
  kkCode: string;
  krCode: string;
  reportTitle: string;
  icon: string;
}

export interface Customer {
  id: string;
  companyName: string;
  taxNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  isgKatipContractId: string;
  createdAt: number;
}

export type OfferStatus = 'Taslak' | 'Gönderildi' | 'Onaylandı' | 'Reddedildi';

export interface OfferItem {
  machineTypeId: string;
  machineTypeName: string;
  kkCode: string;
  quantity: number;
  unitPrice: number;
}

export interface Offer {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  items: OfferItem[];
  totalAmount: number;
  status: OfferStatus;
  createdAt: number;
  approvedAt: number | null;
}

export type JobStatus = 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı';

export interface FieldJob {
  id: string;
  workOrderNumber: string;
  offerId: string;
  offerNumber: string;
  customerId: string;
  customerName: string;
  machineTypeName: string;
  kkCode: string;
  serialNo: string;
  plannedDate: string;
  plannedTime: string;
  assignedEngineer: string;
  engineerRegNo: string;
  status: JobStatus;
  createdAt: number;
  completedAt: number | null;
  reportId: string | null;
}

export type ReportStatus = 'Hazırlanıyor' | 'Onaylandı' | 'E-İmza Bekleniyor' | 'E-İmzalı';

export interface ReportInspectionItem {
  name: string;
  result: 'Uygun' | 'Uygun Değil' | 'Uygulanamaz';
  note: string;
}

export interface ReportLoadTest {
  testType: string;
  loadFactor: number;
  calculatedLoad: number;
  wll: number;
  result: 'Geçti' | 'Kaldı';
}

export interface Report {
  id: string;
  number: string;
  jobId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  machineTypeId: string;
  machineTypeName: string;
  kkCode: string;
  krCode: string;
  reportTitle: string;
  serialNo: string;
  chassisNo: string;
  isgKatipContractId: string;
  ekipnetRegNo: string;
  engineerName: string;
  engineerRegNo: string;
  inspectionDate: string;
  nextInspectionDate: string;
  wll: number;
  designPressure: number | null;
  inspectionItems: ReportInspectionItem[];
  loadTests: ReportLoadTest[];
  wallThickness: { location: string; nominal: number; measured: number; result: 'Kabul' | 'Red' }[];
  safetyValveSetPressure: number | null;
  manometerCalibrated: boolean;
  finalResult: 'UYGUN' | 'UYGUN DEĞİL';
  status: ReportStatus;
  createdAt: number;
  approvedAt: number | null;
  eSignature?: {
    status: 'bekliyor' | 'imzalandi';
    method: string;
    signedAt: number | null;
    certificateSerial: string;
    signerName: string;
  };
}

export interface CalibrationDevice {
  id: string;
  name: string;
  serialNo: string;
  manufacturer: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  status: 'Geçerli' | 'Yaklaşıyor' | 'Gecikmiş';
  location: string;
}

export type WhatsAppStage =
  | 'Aşama 0: Nexa Hoş Geldiniz Bildirimi'
  | 'Aşama 1: Teklif Onay Bildirimi'
  | 'Aşama 2: İş Emri Oluşturuldu'
  | 'Aşama 3: Rapor Teslim Bildirimi';

export interface WhatsAppLog {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  stage: WhatsAppStage;
  message: string;
  sentAt: number;
  delivered: boolean;
}

export type InvoiceStatus = 'Kesildi' | 'Gönderildi' | 'Ödendi';

export interface Invoice {
  id: string;
  number: string;
  offerId: string;
  offerNumber: string;
  customerId: string;
  customerName: string;
  taxNumber: string;
  items: OfferItem[];
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: number;
  sentAt: number | null;
  paidAt: number | null;
}

export type EmailStage =
  | 'Teklif Onayı'
  | 'E-Fatura'
  | 'Rapor Teslimi'
  | 'Karşılama';

export interface EmailLog {
  id: string;
  to: string;
  customerId: string;
  customerName: string;
  subject: string;
  body: string;
  stage: EmailStage;
  sentAt: number;
  delivered: boolean;
}
