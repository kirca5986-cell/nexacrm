'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, ShieldCheck } from 'lucide-react';
import type { Report } from '@/lib/types';

function buildQRData(report: Report): string {
  const lines = [
    `NEXA ÇSGB E-DOĞRULAMA`,
    `Resmi Rapor No: ${report.number}`,
    `Bakanlık Kodu: ${report.kkCode} / ${report.krCode}`,
    `İSG-KATİP Sözleşme: ${report.isgKatipContractId}`,
    `Ekipnet Kayıt No: ${report.ekipnetRegNo}`,
    `Denetleyen Mühendis: ${report.engineerName}`,
    `Mühendis Sicil No: ${report.engineerRegNo}`,
    `Muayene Tarihi: ${report.inspectionDate}`,
    `Sonuç: ${report.finalResult}`,
    `Doğrulama Durumu: DOĞRULANDI`,
  ];
  return lines.join('\n');
}

function qrImageUrl(data: string, size: number): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&ecc=M`;
}

export function QRBadge({ report }: { report: Report }) {
  const qrData = buildQRData(report);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="group flex flex-col items-center gap-1 rounded-lg border-2 border-slate-800 bg-white p-2 transition-all hover:border-amber-500 hover:shadow-lg"
          title="NEXA ÇSGB E-Doğrulama Karekodu"
        >
          <img
            src={qrImageUrl(qrData, 140)}
            alt="NEXA ÇSGB E-Doğrulama Karekodu"
            width={140}
            height={140}
            className="h-[140px] w-[140px] transition-transform group-hover:scale-105"
          />
          <span className="text-[7px] font-bold uppercase tracking-wide text-slate-700">
            NEXA ÇSGB
          </span>
          <span className="text-[7px] font-semibold text-amber-600">E-Doğrulama</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold">NEXA ÇSGB E-Doğrulama</h2>
          </div>
          <img
            src={qrImageUrl(qrData, 320)}
            alt="NEXA ÇSGB E-Doğrulama Karekodu"
            width={320}
            height={320}
            className="rounded-lg border-2 border-slate-800"
          />
          <div className="w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <Row label="Resmi Rapor No" value={report.number} />
            <Row label="Bakanlık Kodu" value={`${report.kkCode} / ${report.krCode}`} />
            <Row label="İSG-KATİP Sözleşme" value={report.isgKatipContractId} />
            <Row label="Ekipnet Kayıt No" value={report.ekipnetRegNo} />
            <Row label="Müşteri" value={report.customerName} />
            <Row label="Ekipman" value={report.machineTypeName} />
            <Row label="Mühendis" value={report.engineerName} />
            <Row label="Mühendis Sicil" value={report.engineerRegNo} />
            <Row label="Muayene Tarihi" value={report.inspectionDate} />
            <Row label="Sonuç" value={report.finalResult} />
            <Row
              label="Doğrulama Durumu"
              value={
                <span className="font-bold text-emerald-600">DOĞRULANDI</span>
              }
            />
          </div>
          <div className="w-full rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Karekod İçeriği
            </p>
            <p className="mt-1 break-all font-mono text-[10px] text-slate-700">
              {qrData}
            </p>
          </div>
          <p className="text-center text-xs text-slate-500">
            Bu belge T.C. Çalışma ve Sosyal Güvenlik Bakanlığı İş Sağlığı ve Güvenliği
            Genel Müdürlüğü talimatlarına uygun olarak Nexa Periyodik Kontrol tarafından
            düzenlenmiştir. Karekodu telefon kamerasıyla okutarak rapor doğrulaması yapabilirsiniz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-1.5 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
