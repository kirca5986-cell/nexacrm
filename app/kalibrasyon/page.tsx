'use client';

import { useState } from 'react';
import {
  Gauge,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Wrench,
} from 'lucide-react';
import { getCalibration, saveCalibration } from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatDateTR } from '@/lib/calculations';
import type { CalibrationDevice } from '@/lib/types';
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
  DialogTrigger,
} from '@/components/ui/dialog';

const STATUS_META: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  Geçerli: {
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: 'Geçerli',
  },
  Yaklaşıyor: {
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className="h-3 w-3" />,
    label: 'Yaklaşıyor',
  },
  Gecikmiş: {
    color: 'bg-red-100 text-red-700',
    icon: <AlertTriangle className="h-3 w-3" />,
    label: 'Gecikmiş',
  },
};

function computeStatus(nextDate: string): 'Geçerli' | 'Yaklaşıyor' | 'Gecikmiş' {
  const diff = new Date(nextDate).getTime() - Date.now();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Gecikmiş';
  if (days < 30) return 'Yaklaşıyor';
  return 'Geçerli';
}

export default function KalibrasyonPage() {
  const devices = useStorageSync(getCalibration);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    serialNo: '',
    manufacturer: '',
    calibrationDate: '',
    nextCalibrationDate: '',
    location: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.nextCalibrationDate) return;
    const dev: CalibrationDevice = {
      id: `cal-${Date.now()}`,
      ...form,
      status: computeStatus(form.nextCalibrationDate),
    };
    saveCalibration([dev, ...devices]);
    setForm({
      name: '',
      serialNo: '',
      manufacturer: '',
      calibrationDate: '',
      nextCalibrationDate: '',
      location: '',
    });
    setOpen(false);
  }

  function handleDelete(id: string) {
    saveCalibration(devices.filter((d) => d.id !== id));
  }

  const overdue = devices.filter((d) => d.status === 'Gecikmiş').length;
  const upcoming = devices.filter((d) => d.status === 'Yaklaşıyor').length;
  const valid = devices.filter((d) => d.status === 'Geçerli').length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Cihaz Kalibrasyon"
        subtitle="Muayene ekipmanlarının kalibrasyon takibi ve mevzuat uyumluluğu"
        icon={<Gauge className="h-6 w-6" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Yeni Cihaz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kalibrasyon Cihazı</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label>Cihaz Adı *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Seri No</Label>
                    <Input
                      value={form.serialNo}
                      onChange={(e) => setForm({ ...form, serialNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Üretici</Label>
                    <Input
                      value={form.manufacturer}
                      onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Kalibrasyon Tarihi</Label>
                    <Input
                      type="date"
                      value={form.calibrationDate}
                      onChange={(e) => setForm({ ...form, calibrationDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sıradaki Kalibrasyon *</Label>
                    <Input
                      type="date"
                      value={form.nextCalibrationDate}
                      onChange={(e) => setForm({ ...form, nextCalibrationDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Lokasyon</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit">Kaydet</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">{overdue}</p>
                <p className="text-xs text-red-600">Gecikmiş Cihaz</p>
              </div>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{upcoming}</p>
                <p className="text-xs text-amber-600">Yaklaşan Süre</p>
              </div>
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{valid}</p>
                <p className="text-xs text-emerald-600">Geçerli Cihaz</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Device table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Cihaz</th>
                  <th className="px-4 py-3 text-left">Seri No</th>
                  <th className="px-4 py-3 text-left">Üretici</th>
                  <th className="px-4 py-3 text-left">Kalibrasyon</th>
                  <th className="px-4 py-3 text-left">Sıradaki</th>
                  <th className="px-4 py-3 text-left">Lokasyon</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((d) => {
                  const meta = STATUS_META[d.status];
                  return (
                    <tr key={d.id} className={d.status === 'Gecikmiş' ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.serialNo}</td>
                      <td className="px-4 py-3 text-slate-600">{d.manufacturer}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTR(d.calibrationDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTR(d.nextCalibrationDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{d.location}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={meta.color}>
                          {meta.icon}
                          <span className="ml-1">{meta.label}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(d.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
