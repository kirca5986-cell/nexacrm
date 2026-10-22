'use client';

import { Receipt, CheckCircle2, Clock, Send, Check } from 'lucide-react';
import {
  getInvoices,
  markInvoiceSent,
  markInvoicePaid,
} from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatCurrencyTRY, formatDateTimeTR } from '@/lib/calculations';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_META: Record<string, { color: string; icon: React.ReactNode }> = {
  Kesildi: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  Gönderildi: { color: 'bg-amber-100 text-amber-700', icon: <Send className="h-3 w-3" /> },
  Ödendi: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function EfaturaPage() {
  const invoices = useStorageSync(getInvoices);

  const totalRevenue = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const paidRevenue = invoices.filter((i) => i.status === 'Ödendi').reduce((s, i) => s + i.totalAmount, 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="E-Fatura Yönetimi"
        subtitle="Teklif onayından sonra otomatik kesilen e-faturalar ve ödeme takibi"
        icon={<Receipt className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Toplam Fatura</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrencyTRY(totalRevenue)}</p>
            <p className="mt-1 text-xs text-slate-400">{invoices.length} adet fatura</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Tahsil Edilen</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrencyTRY(paidRevenue)}</p>
            <p className="mt-1 text-xs text-slate-400">
              {invoices.filter((i) => i.status === 'Ödendi').length} adet ödendi
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Bekleyen Tahsilat</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrencyTRY(pendingRevenue)}</p>
            <p className="mt-1 text-xs text-slate-400">
              {invoices.filter((i) => i.status !== 'Ödendi').length} adet bekliyor
            </p>
          </Card>
        </div>

        {/* Invoice list */}
        <div className="space-y-4">
          {invoices.map((inv) => {
            const meta = STATUS_META[inv.status];
            return (
              <Card key={inv.id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-800 text-white">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{inv.number}</p>
                      <p className="text-xs text-slate-500">
                        {inv.customerName} • VKN: {inv.taxNumber || '—'} • Teklif: {inv.offerNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={meta.color}>
                      {meta.icon}
                      <span className="ml-1">{inv.status}</span>
                    </Badge>
                    {inv.status === 'Kesildi' && (
                      <Button size="sm" onClick={() => markInvoiceSent(inv.id)} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="mr-1 h-4 w-4" /> Gönderildi İşaretle
                      </Button>
                    )}
                    {inv.status === 'Gönderildi' && (
                      <Button size="sm" onClick={() => markInvoicePaid(inv.id)} className="bg-emerald-600 hover:bg-emerald-700">
                        <Check className="mr-1 h-4 w-4" /> Ödeme Alındı
                      </Button>
                    )}
                    <span className="text-lg font-bold text-blue-700">
                      {formatCurrencyTRY(inv.totalAmount)}
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
                      {inv.items.map((it, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-5 py-2.5 font-medium text-slate-700">{it.machineTypeName}</td>
                          <td className="px-5 py-2.5">
                            <Badge variant="secondary" className="font-mono text-[10px]">{it.kkCode}</Badge>
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
                <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-2 text-xs text-slate-400">
                  <span>Kesim: {formatDateTimeTR(inv.createdAt)}</span>
                  {inv.sentAt && <span>Gönderim: {formatDateTimeTR(inv.sentAt)}</span>}
                  {inv.paidAt && <span className="text-emerald-600">Ödeme: {formatDateTimeTR(inv.paidAt)}</span>}
                </div>
              </Card>
            );
          })}
          {invoices.length === 0 && (
            <Card className="p-10 text-center text-slate-500">
              Henüz kesilmiş e-fatura bulunmamaktadır. Teklif onayladığınızda fatura otomatik kesilecektir.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}