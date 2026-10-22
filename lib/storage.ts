import type {
  Customer,
  Offer,
  FieldJob,
  Report,
  CalibrationDevice,
  WhatsAppLog,
  Invoice,
  EmailLog,
} from './types';
import { seedData } from './seed';
import { ENGINEER, WHATSAPP_SIGNATURE, COMPANY_EMAIL } from './config';

const KEYS = {
  customers: 'nexa_customers',
  offers: 'nexa_offers',
  jobs: 'nexa_jobs',
  reports: 'nexa_reports',
  calibration: 'nexa_calibration',
  whatsapp: 'nexa_whatsapp',
  invoices: 'nexa_invoices',
  emails: 'nexa_emails',
  meta: 'nexa_meta',
  initialized: 'nexa_initialized_v1',
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  notify();
}

export function ensureSeed() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.initialized)) return;
  const seed = seedData();
  write(KEYS.customers, seed.customers);
  write(KEYS.offers, seed.offers);
  write(KEYS.jobs, seed.jobs);
  write(KEYS.reports, seed.reports);
  write(KEYS.calibration, seed.calibration);
  write(KEYS.whatsapp, seed.whatsapp);
  localStorage.setItem(KEYS.initialized, '1');
}

export function resetAllData() {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(KEYS.initialized);
  ensureSeed();
}

export function getCustomers(): Customer[] {
  return read<Customer[]>(KEYS.customers, []);
}
export function saveCustomers(c: Customer[]) {
  write(KEYS.customers, c);
}

export function getOffers(): Offer[] {
  return read<Offer[]>(KEYS.offers, []);
}
export function saveOffers(o: Offer[]) {
  write(KEYS.offers, o);
}

export function getJobs(): FieldJob[] {
  return read<FieldJob[]>(KEYS.jobs, []);
}
export function saveJobs(j: FieldJob[]) {
  write(KEYS.jobs, j);
}

export function getReports(): Report[] {
  return read<Report[]>(KEYS.reports, []);
}
export function saveReports(r: Report[]) {
  write(KEYS.reports, r);
}

export function updateReport(updated: Report) {
  const reports = getReports();
  const idx = reports.findIndex((r) => r.id === updated.id);
  if (idx >= 0) {
    reports[idx] = updated;
  } else {
    reports.unshift(updated);
  }
  saveReports(reports);
}

export function approveReport(reportId: string) {
  const reports = getReports();
  const report = reports.find((r) => r.id === reportId);
  if (!report || report.status === 'Onaylandı' || report.status === 'E-İmzalı') return;
  const hasFail = report.inspectionItems.some((i) => i.result === 'Uygun Değil');
  report.status = 'E-İmza Bekleniyor';
  report.approvedAt = Date.now();
  report.finalResult = hasFail ? 'UYGUN DEĞİL' : 'UYGUN';
  report.eSignature = {
    status: 'bekliyor',
    method: 'AKİS (Nitelikli Elektronik Sertifika)',
    signedAt: null,
    certificateSerial: '',
    signerName: ENGINEER.name,
  };
  saveReports(reports);
}

export function signReport(reportId: string, certificateSerial: string, signerName?: string) {
  const reports = getReports();
  const report = reports.find((r) => r.id === reportId);
  if (!report || !report.eSignature || report.eSignature.status === 'imzalandi') return;
  report.eSignature = {
    status: 'imzalandi',
    method: 'AKİS (Nitelikli Elektronik Sertifika)',
    signedAt: Date.now(),
    certificateSerial,
    signerName: signerName || ENGINEER.name,
  };
  report.status = 'E-İmzalı';
  saveReports(reports);
}

export function getCalibration(): CalibrationDevice[] {
  return read<CalibrationDevice[]>(KEYS.calibration, []);
}
export function saveCalibration(c: CalibrationDevice[]) {
  write(KEYS.calibration, c);
}

export function getWhatsAppLogs(): WhatsAppLog[] {
  return read<WhatsAppLog[]>(KEYS.whatsapp, []);
}
export function saveWhatsAppLogs(w: WhatsAppLog[]) {
  write(KEYS.whatsapp, w);
}

export function getInvoices(): Invoice[] {
  return read<Invoice[]>(KEYS.invoices, []);
}
export function saveInvoices(i: Invoice[]) {
  write(KEYS.invoices, i);
}

export function getEmails(): EmailLog[] {
  return read<EmailLog[]>(KEYS.emails, []);
}
export function saveEmails(e: EmailLog[]) {
  write(KEYS.emails, e);
}

let reportCounter = 100;
export function nextReportNumber(): string {
  const reports = getReports();
  const max = reports.reduce((m, r) => {
    const n = parseInt(r.number.replace(/\D/g, '').slice(-4), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 100);
  reportCounter = Math.max(reportCounter, max + 1);
  return `NEX-2026-${String(reportCounter).padStart(4, '0')}`;
}

let invoiceCounter = 1;
export function nextInvoiceNumber(): string {
  const invoices = getInvoices();
  const max = invoices.reduce((m, inv) => {
    const n = parseInt(inv.number.replace(/\D/g, '').slice(-4), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1);
  invoiceCounter = Math.max(invoiceCounter, max + 1);
  return `NEX-EF-${String(invoiceCounter).padStart(4, '0')}`;
}

export function addWhatsAppLog(log: Omit<WhatsAppLog, 'id' | 'sentAt' | 'delivered'>) {
  const logs = getWhatsAppLogs();
  logs.unshift({
    ...log,
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sentAt: Date.now(),
    delivered: true,
  });
  saveWhatsAppLogs(logs);
}

export function addEmailLog(log: Omit<EmailLog, 'id' | 'sentAt' | 'delivered'>) {
  const emailId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const logs = getEmails();
  logs.unshift({
    ...log,
    id: emailId,
    sentAt: Date.now(),
    delivered: false,
  });
  saveEmails(logs);

  // Arka planda gerçek e-posta gönderimi (Zoho SMTP API rotası)
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: log.to, subject: log.subject, body: log.body }),
  })
    .then((res) => {
      const updated = getEmails();
      const idx = updated.findIndex((e) => e.id === emailId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], delivered: res.ok };
        saveEmails(updated);
      }
    })
    .catch(() => {
      const updated = getEmails();
      const idx = updated.findIndex((e) => e.id === emailId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], delivered: false };
        saveEmails(updated);
      }
    });
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

export function updateCustomer(updated: Customer) {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.id === updated.id);
  if (idx === -1) return;
  customers[idx] = { ...customers[idx], ...updated };
  saveCustomers(customers);
}

export function addCustomer(c: Customer) {
  const customers = getCustomers();
  customers.unshift(c);
  saveCustomers(customers);
  addWhatsAppLog({
    customerId: c.id,
    customerName: c.companyName,
    phone: c.phone,
    stage: 'Aşama 0: Nexa Hoş Geldiniz Bildirimi',
    message: (c.isgKatipContractId
      ? `Sayın ${c.contactPerson}, Nexa Periyodik Kontrol firması olarak ${c.companyName} firmamızı müşteri havuzumuza ekledik. İSG-KATİP sözleşme ID: ${c.isgKatipContractId}. Periyodik kontrol süreçlerinizde yanınızdayız.`
      : `Sayın ${c.contactPerson}, Nexa Periyodik Kontrol firması olarak ${c.companyName} firmamızı müşteri havuzumuza ekledik. Periyodik kontrol süreçlerinizde yanınızdayız. Not: İSG-KATİP sözleşmeniz henüz girilmemiştir. Teklif onayından sonra e-Devlet üzerinden İSG-KATİP modülünden periyodik kontrol sözleşmesini imzalamanız gerekecektir.`) + WHATSAPP_SIGNATURE,
  });
}

export function approveOffer(offerId: string, plannedDate: string, plannedTime: string) {
  const offers = getOffers();
  const offer = offers.find((o) => o.id === offerId);
  if (!offer || offer.status === 'Onaylandı') return;
  offer.status = 'Onaylandı';
  offer.approvedAt = Date.now();
  saveOffers(offers);

  const jobs = getJobs();
  offer.items.forEach((item, idx) => {
    for (let q = 0; q < item.quantity; q++) {
      jobs.unshift({
        id: `job-${Date.now()}-${idx}-${q}-${Math.random().toString(36).slice(2, 6)}`,
        workOrderNumber: `IS-${String(jobs.length + 1).padStart(5, '0')}`,
        offerId: offer.id,
        offerNumber: offer.number,
        customerId: offer.customerId,
        customerName: offer.customerName,
        machineTypeName: item.machineTypeName,
        kkCode: item.kkCode,
        serialNo: '',
        plannedDate,
        plannedTime,
        assignedEngineer: ENGINEER.name,
        engineerRegNo: ENGINEER.regNo,
        status: 'Planlandı',
        createdAt: Date.now(),
        completedAt: null,
        reportId: null,
      });
    }
  });
  saveJobs(jobs);

  const dateObj = new Date(plannedDate + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = plannedTime ? ` saat ${plannedTime}` : '';

  addWhatsAppLog({
    customerId: offer.customerId,
    customerName: offer.customerName,
    phone: '',
    stage: 'Aşama 1: Teklif Onay Bildirimi',
    message: `Sayın Yetkili, ${offer.number} numaralı teklifiniz onaylanmıştır. Saha iş emri oluşturulmuştur. Planlanan muayene tarihi: ${dateStr}${timeStr}. ÖNEMLİ: Muayene öncesinde e-Devlet üzerinden İSG-KATİP modülüne girerek periyodik kontrol sözleşmesini imzalamanız gerekmektedir. Sözleşme imzalanmadan rapor düzenlenemez.` + WHATSAPP_SIGNATURE,
  });

  createInvoiceForOffer(offer);

  sendStageEmail(offer.customerId, 'Teklif Onayı', `${offer.number} Numaralı Teklifiniz Onaylanmıştır`,
    `Sayın Yetkili,\n\n${offer.number} numaralı teklifiniz onaylanmıştır. Saha iş emri oluşturulmuştur. Planlanan muayene tarihi: ${dateStr}${timeStr}.\n\nÖNEMLİ: Muayene öncesinde e-Devlet üzerinden İSG-KATİP modülüne girerek periyodik kontrol sözleşmesini imzalamanız gerekmektedir. Sözleşme imzalanmadan rapor düzenlenemez.\n\nMuayene sonrası düzenlenecek resmi periyodik kontrol raporu AKİS nitelikli elektronik sertifika ile e-imzalanarak tarafınıza iletilecektir.${WHATSAPP_SIGNATURE}`);
}

function createInvoiceForOffer(offer: Offer) {
  const customer = getCustomerById(offer.customerId);
  const invoice: Invoice = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    number: nextInvoiceNumber(),
    offerId: offer.id,
    offerNumber: offer.number,
    customerId: offer.customerId,
    customerName: offer.customerName,
    taxNumber: customer?.taxNumber || '',
    items: offer.items,
    totalAmount: offer.totalAmount,
    status: 'Kesildi',
    createdAt: Date.now(),
    sentAt: null,
    paidAt: null,
  };
  const invoices = getInvoices();
  invoices.unshift(invoice);
  saveInvoices(invoices);

  sendStageEmail(offer.customerId, 'E-Fatura', `${invoice.number} Numaralı E-Faturanız`,
    `Sayın Yetkili,\n\n${offer.number} numaralı teklifiniz için ${invoice.number} numaralı e-fatura kesilmiştir.\n\nFatura tutarı: ${offer.totalAmount.toLocaleString('tr-TR')} ₺\n\nFaturanız e-Fatura sistemi üzerinden tarafınıza iletilmiştir. Ödeme bilgileri için lütfen muhasebe departmanımızla iletişime geçiniz.${WHATSAPP_SIGNATURE}`);
}

export function markInvoiceSent(invoiceId: string) {
  const invoices = getInvoices();
  const inv = invoices.find((i) => i.id === invoiceId);
  if (!inv) return;
  inv.status = 'Gönderildi';
  inv.sentAt = Date.now();
  saveInvoices(invoices);
}

export function markInvoicePaid(invoiceId: string) {
  const invoices = getInvoices();
  const inv = invoices.find((i) => i.id === invoiceId);
  if (!inv) return;
  inv.status = 'Ödendi';
  inv.paidAt = Date.now();
  saveInvoices(invoices);
}

function sendStageEmail(customerId: string, stage: EmailStageSubject, subject: string, body: string) {
  const customer = getCustomerById(customerId);
  if (!customer) return;
  const to = customerEmail(customerId);
  addEmailLog({
    to,
    customerId,
    customerName: customer.companyName,
    subject,
    body,
    stage: stage as any,
  });
}

type EmailStageSubject = 'Teklif Onayı' | 'E-Fatura' | 'Rapor Teslimi' | 'Karşılama';

function customerEmail(customerId: string): string {
  const customer = getCustomerById(customerId);
  if (customer?.email && customer.email.trim()) return customer.email.trim();
  return `musteri-${customerId}@${COMPANY_EMAIL.split('@')[1]}`;
}

export function completeJob(jobId: string, reportId: string) {
  const jobs = getJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;
  job.status = 'Tamamlandı';
  job.completedAt = Date.now();
  job.reportId = reportId;
  saveJobs(jobs);

  const dateStr = job.plannedDate
    ? new Date(job.plannedDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';
  const timeStr = job.plannedTime ? ` saat ${job.plannedTime}` : '';
  const dateTimeStr = dateStr ? ` Muayene tarihi: ${dateStr}${timeStr}.` : '';

  addWhatsAppLog({
    customerId: job.customerId,
    customerName: job.customerName,
    phone: '',
    stage: 'Aşama 3: Rapor Teslim Bildirimi',
    message: `${job.customerName} firması için ${job.machineTypeName} periyodik kontrol raporu hazırlanmıştır.${dateTimeStr} Rapor detayları ÇSGB Rapor Dünyası panelinizde mevcuttur.` + WHATSAPP_SIGNATURE,
  });

  sendStageEmail(job.customerId, 'Rapor Teslimi', `${job.machineTypeName} Periyodik Kontrol Raporu Hazırlanmıştır`,
    `Sayın Yetkili,\n\n${job.customerName} firması için ${job.machineTypeName} periyodik kontrol raporu hazırlanmıştır.${dateTimeStr}\n\nRapor detayları ÇSGB Rapor Dünyası panelinizde mevcuttur. Rapor, AKİS nitifikli elektronik sertifika ile e-imzalanmıştır.${WHATSAPP_SIGNATURE}`);
}
