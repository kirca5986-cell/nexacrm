'use client';

import { useState, useMemo } from 'react';
import { FileText, Plus, CheckCircle2, XCircle, Clock, Trash2, Calculator, Calendar, Clock3 } from 'lucide-react';
import {
  getOffers,
  getCustomers,
  saveOffers,
  approveOffer,
} from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatCurrencyTRY, formatDateTimeTR } from '@/lib/calculations';
import { MACHINES, MACHINE_MAP } from '@/lib/machines';
import type { Offer, OfferItem } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_META: Record<string, { color: string; icon: React.ReactNode }> = {
  Taslak: { color: 'bg-slate-200 text-slate-700', icon: <Clock className="h-3 w-3" /> },
  Gönderildi: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  Onaylandı: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" /> },
  Reddedildi: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
};

export default function TekliflerPage() {
  const offers = useStorageSync(getOffers);
  const customers = useStorageSync(getCustomers);
  const [open, setOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<OfferItem[]>([]);
  const [selMachine, setSelMachine] = useState('');
  const [qty, setQty] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [approveTarget, setApproveTarget] = useState<Offer | null>(null);
  const [approveDate, setApproveDate] = useState('');
  const [approveTime, setApproveTime] = useState('');

  const total = useMemo(
    () => items.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
    [items]
  );

  function addItem() {
    const m = MACHINE_MAP[selMachine];
    if (!m) return;
    setItems([
      ...items,
      {
        machineTypeId: m.id,
        machineTypeName: m.name,
        kkCode: m.kkCode,
        quantity: parseInt(qty) || 1,
        unitPrice: parseInt(unitPrice) || 0,
      },
    ]);
    setSelMachine('');
    setQty('1');
    setUnitPrice('');
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer || items.length === 0) return;
    const offer: Offer = {
      id: `off-${Date.now()}`,
      number: `TKF-2026-${String(offers.length + 7).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.companyName,
      items,
      totalAmount: total,
      status: 'Taslak',
      createdAt: Date.now(),
      approvedAt: null,
    };
    saveOffers([offer, ...offers]);
    setOpen(false);
    setItems([]);
    setSelectedCustomerId('');
  }

  function handleApprove() {
    if (!approveTarget || !approveDate) return;
    approveOffer(approveTarget.id, approveDate, approveTime);
    setApproveTarget(null);
    setApproveDate('');
    setApproveTime('');
  }

  function openApproveDialog(o: Offer) {
    const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setApproveTarget(o);
    setApproveDate(defaultDate);
    setApproveTime('10:00');
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Teklif Yönetimi"
        subtitle="ÇSGB periyodik kontrol teklifleri ve onay süreci"
        icon={<FileText className="h-6 w-6" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Yeni Teklif
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Teklif Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Müşteri Seçiniz *</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName} — {c.isgKatipContractId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label className="mb-2 block">Kalem Ekle (Yetki Kapsamındaki 11 Makine)</Label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Select value={selMachine} onValueChange={setSelMachine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Makine türü" />
                        </SelectTrigger>
                        <SelectContent>
                          {MACHINES.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.kkCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="Adet"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        placeholder="Birim Fiyat ₺"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" size="sm" onClick={addItem} className="w-full">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-xs">
                        <tr>
                          <th className="px-3 py-2 text-left">Makine</th>
                          <th className="px-3 py-2 text-center">Kod</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-right">Birim</th>
                          <th className="px-3 py-2 text-right">Tutar</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{it.machineTypeName}</td>
                            <td className="px-3 py-2 text-center font-mono text-xs">{it.kkCode}</td>
                            <td className="px-3 py-2 text-center">{it.quantity}</td>
                            <td className="px-3 py-2 text-right">{formatCurrencyTRY(it.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {formatCurrencyTRY(it.quantity * it.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(i)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex items-center justify-between bg-amber-50 px-3 py-2 font-bold">
                      <span>Genel Toplam</span>
                      <span className="text-amber-700">{formatCurrencyTRY(total)}</span>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={items.length === 0 || !selectedCustomerId}>
                    Teklif Oluştur
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 lg:px-8 pb-8 space-y-4">
        {offers.map((o) => {
          const meta = STATUS_META[o.status];
          return (
            <Card key={o.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{o.number}</p>
                    <p className="text-xs text-slate-500">{o.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={meta.color}>
                    {meta.icon}
                    <span className="ml-1">{o.status}</span>
                  </Badge>
                  {o.status !== 'Onaylandı' && o.status !== 'Reddedildi' && (
                    <Button
                      size="sm"
                      onClick={() => openApproveDialog(o)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Onayla
                    </Button>
                  )}
                  <span className="text-lg font-bold text-amber-700">
                    {formatCurrencyTRY(o.totalAmount)}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-2 text-left">Makine Türü</th>
                      <th className="px-5 py-2 text-left">Bakanlık Kodu</th>
                      <th className="px-5 py-2 text-center">Adet</th>
                      <th className="px-5 py-2 text-right">Birim Fiyat</th>
                      <th className="px-5 py-2 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.items.map((it, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-5 py-2.5 font-medium text-slate-700">{it.machineTypeName}</td>
                        <td className="px-5 py-2.5">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {it.kkCode}
                          </Badge>
                        </td>
                        <td className="px-5 py-2.5 text-center">{it.quantity}</td>
                        <td className="px-5 py-2.5 text-right">{formatCurrencyTRY(it.unitPrice)}</td>
                        <td className="px-5 py-2.5 text-right font-semibold">
                          {formatCurrencyTRY(it.quantity * it.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-400">
                Oluşturulma: {formatDateTimeTR(o.createdAt)}
                {o.approvedAt && ` • Onay: ${formatDateTimeTR(o.approvedAt)}`}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!approveTarget} onOpenChange={(v) => !v && setApproveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Teklifi Onayla — {approveTarget?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-semibold">{approveTarget?.customerName}</p>
              <p className="text-xs mt-1">
                Bu teklifteki {approveTarget?.items.reduce((s, it) => s + it.quantity, 0)} adet ekipman için saha iş emri oluşturulacaktır. Aşağıda tüm ekipmanlar için ortak muayene tarih ve saati belirleyin.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-500" /> Muayene Tarihi *
                </Label>
                <Input
                  type="date"
                  value={approveDate}
                  onChange={(e) => setApproveDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-slate-500" /> Muayene Saati
                </Label>
                <Input
                  type="time"
                  value={approveTime}
                  onChange={(e) => setApproveTime(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Müşteriye gönderilecek WhatsApp mesajında bu tarih ve saat bilgisi yer alacaktır. Tarihi istediğiniz zaman saha işleri sayfasından güncelleyebilirsiniz.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              İptal
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!approveDate}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Onayla ve İş Emri Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
