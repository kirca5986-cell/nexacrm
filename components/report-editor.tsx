'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Printer,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Save,
  PenTool,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { Report, ReportInspectionItem } from '@/lib/types';
import { updateReport, approveReport, signReport } from '@/lib/storage';
import { ENGINEER } from '@/lib/config';
import { useESignature } from '@/hooks/use-esignature';
import { A4ReportView } from '@/components/a4-report';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ReportEditor({ report }: { report: Report }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Report>({ ...report });
  const isApproved = report.status === 'Onaylandı' || report.status === 'E-İmza Bekleniyor' || report.status === 'E-İmzalı';
  const missingContract = !draft.isgKatipContractId.trim();
  const isESigned = report.eSignature?.status === 'imzalandi';
  const { status: esignStatus, errorMsg: esignError, signReport: doSign } = useESignature();
  const [esignSuccess, setEsignSuccess] = useState(false);

  async function handleESign() {
    try {
      const result = await doSign({
        reportNumber: report.number,
        customerName: report.customerName,
        machineTypeName: report.machineTypeName,
        inspectionDate: report.inspectionDate,
        finalResult: report.finalResult,
        kkCode: report.kkCode,
        krCode: report.krCode,
        engineerName: report.engineerName,
        engineerRegNo: report.engineerRegNo,
        isgKatipContractId: report.isgKatipContractId,
      });
      signReport(report.id, result.certificateSerial, result.signerName);
      setEsignSuccess(true);
      router.refresh();
    } catch {
      // error state is shown via esignStatus + esignError from the hook
    }
  }

  function updateItem(idx: number, patch: Partial<ReportInspectionItem>) {
    const items = [...draft.inspectionItems];
    items[idx] = { ...items[idx], ...patch };
    setDraft({ ...draft, inspectionItems: items });
  }

  function updateWallThickness(idx: number, measured: number) {
    const wt = [...draft.wallThickness];
    const nominal = wt[idx].nominal;
    wt[idx] = {
      ...wt[idx],
      measured,
      result: measured >= nominal * 0.9 ? 'Kabul' : 'Red',
    };
    setDraft({ ...draft, wallThickness: wt });
  }

  function updateLoadTestResult(idx: number, result: 'Geçti' | 'Kaldı') {
    const lt = [...draft.loadTests];
    lt[idx] = { ...lt[idx], result };
    setDraft({ ...draft, loadTests: lt });
  }

  function handleSave() {
    updateReport(draft);
  }

  function handleApprove() {
    if (missingContract) return;
    updateReport(draft);
    approveReport(draft.id);
    router.push('/raporlar');
  }

  if (isApproved) {
    return (
      <div className="animate-fade-in">
        <div className="no-print flex items-center justify-between px-6 py-4 lg:px-8">
          <Button variant="outline" size="sm" onClick={() => router.push('/raporlar')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Rapor Listesine Dön
          </Button>
          <Button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900">
            <Printer className="mr-2 h-4 w-4" /> A4 Yazdır
          </Button>
        </div>

        {/* E-İmza status banner */}
        <div className="px-6 lg:px-8 pb-4">
          {isESigned || esignSuccess ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div className="flex-1">
                <p className="font-bold text-emerald-900">Rapor Başarıyla E-İmzalandı</p>
                <p className="text-sm text-emerald-700">
                  İmza yöntemi: {report.eSignature?.method ?? 'AKİS (Nitelikli Elektronik Sertifika)'} •
                  Sertifika Seri No: {report.eSignature?.certificateSerial} •
                  İmzalayan: {report.eSignature?.signerName ?? ENGINEER.name}
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">E-İmzalı</Badge>
            </div>
          ) : esignStatus === 'error' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border-2 border-red-300 bg-red-50 p-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <p className="font-bold text-red-900">E-İmza Bağlantısı Kurulamadı</p>
                  <p className="text-sm text-red-700">{esignError}</p>
                </div>
              </div>
              <Button onClick={handleESign} className="bg-amber-600 hover:bg-amber-700">
                <PenTool className="mr-2 h-4 w-4" /> Tekrar Dene
              </Button>
            </div>
          ) : esignStatus === 'connecting' || esignStatus === 'connected' || esignStatus === 'signing' ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-bold text-blue-900">
                  {esignStatus === 'connecting' && 'E-İmza TR Uygulamasına Bağlanılıyor...'}
                  {esignStatus === 'connected' && 'Bağlantı Kuruldu — İmza İsteği Gönderiliyor...'}
                  {esignStatus === 'signing' && 'AKİS Kart PIN Kodunu Girin — İmza Bekleniyor...'}
                </p>
                <p className="text-sm text-blue-700">
                  {esignStatus === 'signing'
                    ? 'Lütfen E-İmza TR uygulamasında AKİS kartınızın PIN kodunu girerek imzalamayı onaylayın.'
                    : 'Bilgisayarınızdaki E-İmza TR uygulamasına bağlanmaya çalışılıyor (localhost:8543 / localhost:14500 / localhost:9000).'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <Clock className="h-6 w-6 text-amber-600" />
              <div className="flex-1">
                <p className="font-bold text-amber-900">E-İmza Bekleniyor — AKİS Kart İle İmzalanmalı</p>
                <p className="text-sm text-amber-700">
                  Bakanlık e-imza zorunluluğu gereği rapor nitifikli elektronik sertifika ile imzalanmalıdır.
                  "AKİS ile E-İmzala" butonuna bastığınızda bilgisayarınızdaki E-İmza TR uygulamasına otomatik
                  bağlanılır. AKİS kartınızın takılı ve E-İmza TR uygulamasının açık olduğundan emin olun.
                </p>
              </div>
              <Button
                onClick={handleESign}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <PenTool className="mr-2 h-4 w-4" /> AKİS ile E-İmzala
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center px-4 pb-10">
          <A4ReportView report={report} />
        </div>
      </div>
    );
  }

  const hasFail = draft.inspectionItems.some((i) => i.result === 'Uygun Değil');

  return (
    <div className="animate-fade-in">
      <div className="no-print flex items-center justify-between px-6 py-4 lg:px-8">
        <Button variant="outline" size="sm" onClick={() => router.push('/raporlar')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Rapor Listesine Dön
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Taslağı Kaydet
          </Button>
          <Button
            onClick={handleApprove}
            className="bg-emerald-600 text-base font-bold hover:bg-emerald-700"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" /> RAPORU RESMİ OLARAK ONAYLA VE YAYINLA
          </Button>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status banner */}
          <div className="flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            <div className="flex-1">
              <p className="font-bold text-amber-900">Rapor Hazırlanıyor — Sahada Düzenleme Modu</p>
              <p className="text-sm text-amber-700">
                {report.number} — Her kontrol kriterinin sonucunu ve notunu sahada düzenleyin,
                ardından "Raporu Resmi Olarak Onayla ve Yayınla" butonuna basın.
              </p>
            </div>
            <Badge className="bg-amber-200 text-amber-800">Hazırlanıyor</Badge>
          </div>

          {/* Report header info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <InfoField label="Rapor No" value={report.number} />
              <InfoField label="Bakanlık Kodu" value={`${report.kkCode}/${report.krCode}`} />
              <InfoField label="Makine" value={report.machineTypeName} />
              <InfoField label="Firma" value={report.customerName} />
              <InfoField label="Seri No" value={report.serialNo} />
              <InfoField label="Ekipnet Kayıt No" value={report.ekipnetRegNo} />
              <InfoField label="Mühendis" value={`${ENGINEER.name} (${ENGINEER.regNo})`} />
              <div className="md:col-span-2">
                <Label>İSG-KATİP Sözleşme ID</Label>
                <Input
                  value={draft.isgKatipContractId}
                  onChange={(e) => setDraft({ ...draft, isgKatipContractId: e.target.value })}
                  placeholder="e-Devlet üzerinden alınan sözleşme numarası (zorunlu)"
                  className={missingContract ? 'border-red-400' : ''}
                />
                {missingContract && (
                  <p className="mt-1 text-xs text-red-600">
                    Raporu onaylamak için İSG-KATİP sözleşme ID zorunludur. Müşteri e-Devlet’ten imzaladıktan sonra giriniz.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Editable inspection items */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
              Periyodik Kontrol Kriterleri — {report.kkCode}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-xs text-white">
                    <th className="border border-slate-300 px-3 py-2 text-left">No</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Kontrol Kriteri</th>
                    <th className="border border-slate-300 px-3 py-2 text-center w-44">Sonuç</th>
                    <th className="border border-slate-300 px-3 py-2 text-left w-56">Mühendis Notu / Ölçüm Değeri</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.inspectionItems.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 text-sm odd:bg-slate-50/50">
                      <td className="border border-slate-200 px-3 py-2 text-center text-slate-500">{i + 1}</td>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-700">{item.name}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <Select
                          value={item.result}
                          onValueChange={(v) => updateItem(i, { result: v as ReportInspectionItem['result'] })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Uygun" className="text-emerald-700">Uygun</SelectItem>
                            <SelectItem value="Uygun Değil" className="text-red-700">Uygun Değil</SelectItem>
                            <SelectItem value="Uygulanamaz" className="text-slate-500">Uygulanamaz</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-slate-200 px-3 py-2">
                        <Input
                          value={item.note}
                          onChange={(e) => updateItem(i, { note: e.target.value })}
                          placeholder="Ölçüm değeri / tespit..."
                          className="h-8 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Editable load tests */}
          {draft.loadTests.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-base font-bold text-slate-800">Yük Testleri — TS 10116</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-xs text-white">
                    <th className="border border-slate-300 px-3 py-2 text-left">Deney Türü</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Katsayı</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">WLL (t)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Hesaplanan Yük (t)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center w-36">Sonuç</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.loadTests.map((t, i) => (
                    <tr key={i} className="border-b border-slate-100 text-sm odd:bg-slate-50/50">
                      <td className="border border-slate-200 px-3 py-2 font-medium">{t.testType}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">×{t.loadFactor}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{t.wll}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-bold">{t.calculatedLoad}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <Select
                          value={t.result}
                          onValueChange={(v) => updateLoadTestResult(i, v as 'Geçti' | 'Kaldı')}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geçti" className="text-emerald-700">Geçti</SelectItem>
                            <SelectItem value="Kaldı" className="text-red-700">Kaldı</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Editable wall thickness */}
          {draft.wallThickness.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-base font-bold text-slate-800">
                Ultrasonik Et Kalınlığı Ölçüm Tablosu (UT)
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-xs text-white">
                    <th className="border border-slate-300 px-3 py-2 text-left">Ölçüm Noktası</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Nominal (mm)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center w-36">Ölçülen (mm)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Sonuç</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.wallThickness.map((w, i) => (
                    <tr key={i} className="border-b border-slate-100 text-sm odd:bg-slate-50/50">
                      <td className="border border-slate-200 px-3 py-2">{w.location}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{w.nominal.toFixed(1)}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={w.measured}
                          onChange={(e) => updateWallThickness(i, parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs text-center"
                        />
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-bold">
                        <span className={w.result === 'Kabul' ? 'text-emerald-700' : 'text-red-700'}>
                          {w.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <Label>Emniyet Valfi Açma Basıncı Set Değeri (Bar)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={draft.safetyValveSetPressure ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        safetyValveSetPressure: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div className="flex items-end gap-2">
                  <input
                    type="checkbox"
                    id="manometer"
                    checked={draft.manometerCalibrated}
                    onChange={(e) => setDraft({ ...draft, manometerCalibrated: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="manometer">Manometre Kalibrasyonu Geçerli</Label>
                </div>
              </div>
            </div>
          )}

          {/* Final result preview + approve */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">Genel Değerlendirme (Otomatik)</p>
                <p className="text-xl font-black">
                  PERİYODİK KONTROL SONUCU:{' '}
                  <span className={hasFail ? 'text-red-700' : 'text-emerald-700'}>
                    UYGUN DEĞİL
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasFail
                    ? 'En az bir kriter "Uygun Değil" olarak işaretlendiği için rapor otomatik olarak UYGUN DEĞİL olarak onaylanacaktır.'
                    : 'Tüm kriterler uygun. Rapor UYGUN olarak onaylanacaktır.'}
                </p>
              </div>
              <Lock className="h-10 w-10 text-slate-300" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Taslağı Kaydet
            </Button>
            <Button
              onClick={handleApprove}
              disabled={missingContract}
              className="bg-emerald-600 text-base font-bold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> RAPORU RESMİ OLARAK ONAYLA VE YAYINLA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
