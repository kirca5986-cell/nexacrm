'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Wrench,
  CheckCircle2,
  Clock,
  CircleDot,
  FileText,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import {
  getJobs,
  getReports,
  saveJobs,
  saveReports,
  completeJob,
  nextReportNumber,
} from '@/lib/storage';
import { ENGINEER } from '@/lib/config';
import { useStorageSync } from '@/hooks/use-storage';
import { formatDateTR } from '@/lib/calculations';
import { MACHINE_MAP } from '@/lib/machines';
import {
  getInspectionTemplate,
  buildInspectionItems,
  buildLoadTests,
  buildWallThicknessDefaults,
} from '@/lib/report-templates';
import type { FieldJob, Report } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const STATUS_META: Record<string, { color: string; icon: React.ReactNode }> = {
  Planlandı: { color: 'bg-slate-200 text-slate-700', icon: <Clock className="h-3 w-3" /> },
  'Devam Ediyor': { color: 'bg-blue-100 text-blue-700', icon: <CircleDot className="h-3 w-3" /> },
  Tamamlandı: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function SahaIsleriPage() {
  const router = useRouter();
  const jobs = useStorageSync(getJobs);
  const reports = useStorageSync(getReports);
  const [completeJobId, setCompleteJobId] = useState<string | null>(null);
  const [editTimeJobId, setEditTimeJobId] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState('09:00');
  const [jobForm, setJobForm] = useState({
    serialNo: '',
    contractId: '',
  });

  const jobToComplete = jobs.find((j) => j.id === completeJobId);

  function handleSaveTime(e: React.FormEvent) {
    e.preventDefault();
    if (!editTimeJobId) return;
    const updated = jobs.map((j) =>
      j.id === editTimeJobId ? { ...j, plannedTime: editTimeValue } : j
    );
    saveJobs(updated);
    setEditTimeJobId(null);
  }

  function startComplete(job: FieldJob) {
    setCompleteJobId(job.id);
    setJobForm({
      serialNo: job.serialNo || '',
      contractId: '',
    });
  }

  function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!jobToComplete) return;
    const machine = MACHINE_MAP[
      Object.keys(MACHINE_MAP).find(
        (id) => MACHINE_MAP[id].name === jobToComplete.machineTypeName
      ) || ''
    ];
    if (!machine) return;

    const tpl = getInspectionTemplate(machine);
    const wll = machine.category === 'basincli-kaplar' ? 0 : 5;
    const designPressure = machine.category === 'basincli-kaplar' ? 10 : null;

    const updatedJobs = jobs.map((j) =>
      j.id === jobToComplete.id
        ? {
            ...j,
            serialNo: jobForm.serialNo,
            assignedEngineer: ENGINEER.name,
            engineerRegNo: ENGINEER.regNo,
          }
        : j
    );
    saveJobs(updatedJobs);

    const reportNumber = nextReportNumber();
    const today = new Date().toISOString().slice(0, 10);
    const nextDate = new Date(
      Date.now() + tpl.nextInspectionMonths * 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    const report: Report = {
      id: `rep-${Date.now()}`,
      number: reportNumber,
      jobId: jobToComplete.id,
      workOrderNumber: jobToComplete.workOrderNumber,
      customerId: jobToComplete.customerId,
      customerName: jobToComplete.customerName,
      machineTypeId: machine.id,
      machineTypeName: machine.name,
      kkCode: machine.kkCode,
      krCode: machine.krCode,
      reportTitle: machine.reportTitle,
      serialNo: jobForm.serialNo,
      chassisNo: machine.category === 'kendinden-tahrikli' ? jobForm.serialNo : '-',
      isgKatipContractId: jobForm.contractId.trim(),
      ekipnetRegNo: ENGINEER.ekipnetNo,
      engineerName: ENGINEER.name,
      engineerRegNo: ENGINEER.regNo,
      inspectionDate: today,
      nextInspectionDate: nextDate,
      wll,
      designPressure,
      inspectionItems: buildInspectionItems(tpl),
      loadTests: buildLoadTests(tpl, wll),
      wallThickness: tpl.wallThicknessCheck ? buildWallThicknessDefaults() : [],
      safetyValveSetPressure: tpl.safetyValveCheck && designPressure ? designPressure : null,
      manometerCalibrated: tpl.manometerCheck,
      finalResult: 'UYGUN',
      status: 'Hazırlanıyor',
      createdAt: Date.now(),
      approvedAt: null,
    };

    saveReports([report, ...reports]);
    completeJob(jobToComplete.id, report.id);
    setCompleteJobId(null);
    router.push(`/raporlar?id=${report.id}&duzenle=1`);
  }

  const sorted = [...jobs].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Saha İşleri & Takvim"
        subtitle="İş emirleri, planlanan muayene tarihleri ve saha ekipleri"
        icon={<CalendarDays className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-3">
        {sorted.map((j) => {
          const meta = STATUS_META[j.status];
          const report = reports.find((r) => r.id === j.reportId);
          return (
            <Card key={j.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{j.workOrderNumber}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {j.kkCode}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {j.machineTypeName} • {j.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Planlanan Tarih &amp; Saat</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDateTR(j.plannedDate)}
                      {j.plannedTime ? (
                        <span className="ml-1.5 text-amber-700">{j.plannedTime}</span>
                      ) : null}
                    </p>
                    {j.status !== 'Tamamlandı' && (
                      <button
                        type="button"
                        onClick={() => { setEditTimeJobId(j.id); setEditTimeValue(j.plannedTime || '09:00'); }}
                        className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-600"
                      >
                        <Pencil className="h-3 w-3" /> Saat Gir
                      </button>
                    )}
                  </div>
                  <Badge className={meta.color}>
                    {meta.icon}
                    <span className="ml-1">{j.status}</span>
                  </Badge>
                  {j.status === 'Tamamlandı' && report ? (
                    <Link href={`/raporlar?id=${report.id}`}>
                      <Button size="sm" variant="outline">
                        <FileText className="mr-1 h-4 w-4" /> Raporu Gör
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => startComplete(j)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Tamamla & Rapor Bas
                    </Button>
                  )}
                </div>
              </div>
              {(j.assignedEngineer || j.serialNo) && (
                <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
                  {j.assignedEngineer && (
                    <span>
                      Mühendis: <strong>{j.assignedEngineer}</strong> (Sicil: {j.engineerRegNo})
                    </span>
                  )}
                  {j.serialNo && <span className="ml-4">Seri No: {j.serialNo}</span>}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Time edit dialog */}
      <Dialog open={!!editTimeJobId} onOpenChange={(v) => !v && setEditTimeJobId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Muayene Saatini Gir</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTime} className="space-y-4">
            <div>
              <Label>Planlanan Saat</Label>
              <input
                type="time"
                value={editTimeValue}
                onChange={(e) => setEditTimeValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTimeJobId(null)}>
                İptal
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Completion dialog */}
      <Dialog open={!!completeJobId} onOpenChange={(v) => !v && setCompleteJobId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Saha İşini Tamamla — Rapor Oluştur</DialogTitle>
          </DialogHeader>
          {jobToComplete && (
            <form onSubmit={handleComplete} className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-semibold">{jobToComplete.machineTypeName}</p>
                <p className="text-xs text-slate-500">
                  {jobToComplete.customerName} • {jobToComplete.kkCode}
                </p>
              </div>
              <div>
                <Label>Ekipman Seri / Şasi No *</Label>
                <Input
                  value={jobForm.serialNo}
                  onChange={(e) => setJobForm({ ...jobForm, serialNo: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Denetleyen Mühendis</p>
                  <p className="font-semibold text-slate-800">{ENGINEER.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Sicil No</p>
                  <p className="font-semibold text-slate-800">{ENGINEER.regNo}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Ekipnet Kayıt No</p>
                  <p className="font-semibold text-slate-800">{ENGINEER.ekipnetNo}</p>
                </div>
              </div>
              <div>
                <Label>İSG-KATİP Sözleşme ID *</Label>
                <Input
                  value={jobForm.contractId}
                  onChange={(e) => setJobForm({ ...jobForm, contractId: e.target.value })}
                  placeholder="e-Devlet üzerinden alınan sözleşme numarası"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Müşteri ile kontrol elemanı arasındaki sözleşme numarasını e-Devlet’ten girin.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Onaylandığında {jobToComplete.kkCode} kriterlerine uygun resmi ÇSGB raporu
                otomatik oluşturulacak ve WhatsApp bildirimi gönderilecektir.
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCompleteJobId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Tamamla & Rapor Bas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
