'use client';

import type { Report } from '@/lib/types';
import { QRBadge } from '@/components/qr-badge';
import { ShieldCheck, Building2, Cog, ClipboardCheck } from 'lucide-react';

export function A4ReportView({ report }: { report: Report }) {
  return (
    <div className="a4-report mx-auto bg-white p-10 text-[11px] text-slate-900 shadow-xl print:shadow-none" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Official Header */}
      <div className="border-b-4 border-slate-900 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600">
              <ShieldCheck className="h-8 w-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                NEXA PERİYODİK KONTROL
              </h1>
              <p className="text-[10px] font-medium text-slate-600">
                Makine Mühendisliği — Kaldırma-İletme Makinaları ve Basınçlı Kapar
              </p>
              <p className="text-[9px] text-slate-500">
                T.C. Çalışma ve Sosyal Güvenlik Bakanlığı Yetkili Periyodik Kontrol Kuruluşu
              </p>
            </div>
          </div>
          {report.status === 'Onaylandı' && <QRBadge report={report} />}
        </div>
      </div>

      {/* Title */}
      <div className="my-4 text-center">
        <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
          {report.reportTitle}
        </h2>
        <p className="text-[10px] font-semibold text-amber-700">
          Bakanlık Kodu: {report.kkCode} — {report.krCode} Kriterlerine Uygun
        </p>
      </div>

      {/* Official Numbers */}
      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 border border-slate-300 bg-slate-50 p-4">
        <Field label="Resmi Rapor Numarası" value={report.number} bold />
        <Field label="Muayene Tarihi" value={report.inspectionDate} bold />
        <Field label="Gelecek Kontrol Tarihi" value={report.nextInspectionDate} bold />
        <Field label="İSG-KATİP Sözleşme ID" value={report.isgKatipContractId} bold />
        <Field label="Ekipnet Kayıt No" value={report.ekipnetRegNo} />
        <Field label="Denetleyen Mühendis Sicil No" value={report.engineerRegNo} />
      </div>

      {/* Customer & Equipment */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="border border-slate-300 p-3">
          <div className="mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1 font-bold">
            <Building2 className="h-3.5 w-3.5" /> İŞVEREN BİLGİLERİ
          </div>
          <Field label="Firma Ünvanı" value={report.customerName} />
          <Field label="İSG-KATİP Sözleşme" value={report.isgKatipContractId} />
        </div>
        <div className="border border-slate-300 p-3">
          <div className="mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1 font-bold">
            <Cog className="h-3.5 w-3.5" /> EKİPMAN BİLGİLERİ
          </div>
          <Field label="Ekipman Türü" value={report.machineTypeName} />
          <Field label="Seri / Şasi No" value={report.serialNo || report.chassisNo} />
          {report.wll > 0 && <Field label="Güvenli Çalışma Yükü (WLL)" value={`${report.wll} Ton`} />}
          {report.designPressure != null && (
            <Field label="Tasarım Basıncı" value={`${report.designPressure} Bar`} />
          )}
        </div>
      </div>

      {/* Inspection Items */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-1.5 border-b-2 border-slate-900 pb-1 text-xs font-bold uppercase">
          <ClipboardCheck className="h-4 w-4" /> Periyodik Kontrol Kriterleri — {report.kkCode}
        </div>
        <table className="w-full border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-800 text-[10px] text-white">
              <th className="border border-slate-400 px-2 py-1.5 text-left">No</th>
              <th className="border border-slate-400 px-2 py-1.5 text-left">Kontrol Kriteri</th>
              <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Sonuç</th>
              <th className="border border-slate-400 px-2 py-1.5 text-left w-40">Not</th>
            </tr>
          </thead>
          <tbody>
            {report.inspectionItems.map((item, i) => (
              <tr key={i} className="text-[10px] odd:bg-slate-50">
                <td className="border border-slate-300 px-2 py-1 text-center">{i + 1}</td>
                <td className="border border-slate-300 px-2 py-1">{item.name}</td>
                <td className="border border-slate-300 px-2 py-1 text-center font-semibold">
                  <span
                    className={
                      item.result === 'Uygun'
                        ? 'text-emerald-700'
                        : item.result === 'Uygun Değil'
                        ? 'text-red-700'
                        : 'text-slate-500'
                    }
                  >
                    {item.result}
                  </span>
                </td>
                <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load Tests */}
      {report.loadTests.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 border-b-2 border-slate-900 pb-1 text-xs font-bold uppercase">
            Yük Testleri — TS 10116
          </div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-800 text-[10px] text-white">
                <th className="border border-slate-400 px-2 py-1.5 text-left">Deney Türü</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Yük Katsayısı</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">WLL (Ton)</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Hesaplanan Yük (Ton)</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {report.loadTests.map((t, i) => (
                <tr key={i} className="text-[10px] odd:bg-slate-50">
                  <td className="border border-slate-300 px-2 py-1 font-medium">{t.testType}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">×{t.loadFactor}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">{t.wll}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center font-bold">{t.calculatedLoad}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <span className={t.result === 'Geçti' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      {t.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wall Thickness */}
      {report.wallThickness.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 border-b-2 border-slate-900 pb-1 text-xs font-bold uppercase">
            Ultrasonik Et Kalınlığı Ölçüm Tablosu (UT)
          </div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-800 text-[10px] text-white">
                <th className="border border-slate-400 px-2 py-1.5 text-left">Ölçüm Noktası</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Nominal Et (mm)</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Ölçülen Et (mm)</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {report.wallThickness.map((w, i) => (
                <tr key={i} className="text-[10px] odd:bg-slate-50">
                  <td className="border border-slate-300 px-2 py-1">{w.location}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">{w.nominal.toFixed(1)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center font-semibold">{w.measured.toFixed(1)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <span className={w.result === 'Kabul' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      {w.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.safetyValveSetPressure != null && (
            <div className="mt-2 border border-slate-300 bg-amber-50 p-2 text-[10px]">
              <strong>Emniyet Valfi Açma Basıncı Set Değeri:</strong>{' '}
              {report.safetyValveSetPressure} Bar — PED 2014/68/EU direktifine uygun.
            </div>
          )}
          {report.manometerCalibrated && (
            <div className="mt-1 border border-slate-300 bg-slate-50 p-2 text-[10px]">
              <strong>Manometre Kalibrasyon:</strong> Geçerli — Karşılaştırma standardı ile doğrulandı.
            </div>
          )}
        </div>
      )}

      {/* Final Result */}
      <div className="mb-4 flex items-center justify-between border-2 border-slate-900 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-600">Genel Değerlendirme</p>
          <p className="text-lg font-black">
            PERİYODİK KONTROL SONUCU:{' '}
            <span className={report.finalResult === 'UYGUN' ? 'text-emerald-700' : 'text-red-700'}>
              {report.finalResult}
            </span>
          </p>
        </div>
        <div className="text-right text-[9px] text-slate-500">
          <p>Sıradaki kontrol: {report.nextInspectionDate}</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-8">
        <div className="text-center">
          {report.eSignature?.status === 'imzalandi' ? (
            <div className="mb-4 rounded border-2 border-emerald-600 bg-emerald-50 p-2">
              <p className="text-[8px] font-bold text-emerald-800">AKİS NİTELİKLİ E-İMZA</p>
              <p className="text-[8px] text-emerald-700">Sertifika: {report.eSignature.certificateSerial}</p>
              <p className="text-[8px] text-emerald-700">
                İmza Tarihi: {report.eSignature.signedAt ? new Date(report.eSignature.signedAt).toLocaleDateString('tr-TR') : '-'}
              </p>
            </div>
          ) : (
            <div className="mb-4 rounded border-2 border-dashed border-amber-400 bg-amber-50 p-2">
              <p className="text-[8px] font-bold text-amber-700">E-İMZA BEKLENİYOR</p>
              <p className="text-[8px] text-amber-600">AKİS kart ile imzalanmamış</p>
            </div>
          )}
          <div className="mb-12 border-b border-slate-400" />
          <p className="text-[10px] font-semibold">Denetleyen Mühendis</p>
          <p className="text-[10px]">{report.engineerName}</p>
          <p className="text-[9px] text-slate-600">Sicil: {report.engineerRegNo}</p>
          <p className="text-[9px] text-slate-600">Ekipnet Kayıt No: {report.ekipnetRegNo}</p>
        </div>
        <div className="text-center">
          <div className="mb-12 border-b border-slate-400" />
          <p className="text-[10px] font-semibold">Nexa Periyodik Kontrol</p>
          <p className="text-[9px] text-slate-600">Yetkili İmza & Kaşe</p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-2 text-center text-[8px] text-slate-400">
        Bu rapor Nexa Periyodik Kontrol CRM sistemi tarafından T.C. ÇSGB İş Sağlığı ve Güvenliği
        Genel Müdürlüğü mevzuatına uygun olarak otomatik düzenlenmiştir. Rapor No: {report.number}
      </div>
    </div>
  );
}

function Field({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-slate-600">{label}:</span>
      <span className={bold ? 'text-[11px] font-bold text-slate-900' : 'text-[10px] font-medium text-slate-800'}>
        {value}
      </span>
    </div>
  );
}
