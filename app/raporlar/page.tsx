'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpenCheck,
  Search,
  Calculator,
  Gauge,
  FileBarChart,
  ShieldCheck,
} from 'lucide-react';
import { getReports } from '@/lib/storage';
import { useStorageSync, useIsClient } from '@/hooks/use-storage';
import { formatDateTR } from '@/lib/calculations';
import { calculateLiftingTests, calculatePressureTest } from '@/lib/calculations';
import { ReportEditor } from '@/components/report-editor';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function RaporlarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Yükleniyor...</div>}>
      <RaporlarContent />
    </Suspense>
  );
}

function RaporlarContent() {
  const reports = useStorageSync(getReports);
  const isClient = useIsClient();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const [query, setQuery] = useState('');
  const [wllInput, setWllInput] = useState('10');
  const [pressureInput, setPressureInput] = useState('10');

  const selectedReport = reports.find((r) => r.id === selectedId);

  const liftCalc = useMemo(
    () => calculateLiftingTests(parseFloat(wllInput) || 0),
    [wllInput]
  );
  const pressCalc = useMemo(
    () => calculatePressureTest(parseFloat(pressureInput) || 0),
    [pressureInput]
  );

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.number.toLowerCase().includes(query.toLowerCase()) ||
          r.customerName.toLowerCase().includes(query.toLowerCase()) ||
          r.machineTypeName.toLowerCase().includes(query.toLowerCase()) ||
          r.kkCode.toLowerCase().includes(query.toLowerCase())
      ),
    [reports, query]
  );

  if (isClient && selectedReport) {
    return <ReportEditor report={selectedReport} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ÇSGB Rapor Dünyası"
        subtitle="Resmi bakanlık formatında periyodik kontrol raporları ve teknik hesaplama motorları"
        icon={<BookOpenCheck className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Calculation Engines */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-300 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Calculator className="h-4 w-4 text-amber-600" />
              Kaldırma Makineleri Yük Testi Hesaplama Motoru
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              TS 10116 standardına göre Statik (WLL×1.25) ve Dinamik (WLL×1.1) deney yükleri
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>Güvenli Çalışma Yükü (WLL / Ton)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={wllInput}
                  onChange={(e) => setWllInput(e.target.value)}
                />
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs text-slate-500">WLL</p>
                <p className="text-lg font-bold text-slate-800">{liftCalc.wll} t</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <p className="text-xs text-amber-700">Statik (×1.25)</p>
                <p className="text-lg font-bold text-amber-800">{liftCalc.staticLoad} t</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3">
                <p className="text-xs text-emerald-700">Dinamik (×1.1)</p>
                <p className="text-lg font-bold text-emerald-800">{liftCalc.dynamicLoad} t</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">{liftCalc.standard}</p>
          </Card>

          <Card className="border-slate-300 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Gauge className="h-4 w-4 text-blue-600" />
              Basınçlı Kaplar Hidrostatik Test Hesaplama Motoru
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              PED 2014/68/EU direktifine göre Asgari Hidrostatik Test Basıncı (×1.43)
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>Tasarım Basıncı (Bar)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={pressureInput}
                  onChange={(e) => setPressureInput(e.target.value)}
                />
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs text-slate-500">Tasarım Basıncı</p>
                <p className="text-lg font-bold text-slate-800">{pressCalc.designPressure} bar</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <p className="text-xs text-blue-700">Hidrostatik Test (×1.43)</p>
                <p className="text-lg font-bold text-blue-800">{pressCalc.hydrostaticTestPressure} bar</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">{pressCalc.directive}</p>
          </Card>
        </div>

        {/* Report search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rapor No, firma, makine veya bakanlık kodu ile ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Report list */}
        <div className="grid gap-4 md:grid-cols-2">
          {isClient &&
            filtered.map((r) => (
              <Card key={r.id} className="card-hover overflow-hidden">
                <div className="flex items-start justify-between border-b bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 text-white">
                  <div>
                    <p className="text-xs text-slate-300">Resmi Rapor Numarası</p>
                    <p className="font-bold tracking-wide">{r.number}</p>
                  </div>
                  {r.status === 'E-İmzalı' ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  ) : r.status === 'E-İmza Bekleniyor' ? (
                    <Badge className="bg-amber-500 text-white">E-İmza Bekliyor</Badge>
                  ) : r.status === 'Onaylandı' ? (
                    <ShieldCheck className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Badge className="bg-amber-500 text-white">Hazırlanıyor</Badge>
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{r.machineTypeName}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {r.kkCode}/{r.krCode}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{r.customerName}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Muayene:</span> {formatDateTR(r.inspectionDate)}
                    </div>
                    <div>
                      <span className="text-slate-400">Sıradaki:</span> {formatDateTR(r.nextInspectionDate)}
                    </div>
                    <div>
                      <span className="text-slate-400">Seri No:</span> {r.serialNo}
                    </div>
                    <div>
                      <span className="text-slate-400">Sözleşme:</span> {r.isgKatipContractId}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {r.status === 'E-İmzalı' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        E-İmzalı: {r.finalResult}
                      </Badge>
                    ) : r.status === 'E-İmza Bekleniyor' ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        E-İmza Bekliyor
                      </Badge>
                    ) : r.status === 'Onaylandı' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Sonuç: {r.finalResult}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Düzenleme Bekliyor
                      </Badge>
                    )}
                    <a href={`/raporlar?id=${r.id}`}>
                      <Button size="sm" className="bg-slate-800 hover:bg-slate-900">
                        <FileBarChart className="mr-1 h-4 w-4" />
                        {r.status === 'E-İmzalı' || r.status === 'Onaylandı' || r.status === 'E-İmza Bekleniyor' ? 'Raporu Gör' : 'Raporu Düzenle'}
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          {isClient && filtered.length === 0 && (
            <Card className="col-span-full p-10 text-center text-slate-500">
              Aramanıza uygun rapor bulunamadı.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
