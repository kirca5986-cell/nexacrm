'use client';

import { useMemo } from 'react';
import {
  MessageCircle,
  Bell,
  CheckCheck,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { getWhatsAppLogs, getCustomers } from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatDateTimeTR } from '@/lib/calculations';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STAGES = [
  'Aşama 0: Nexa Hoş Geldiniz Bildirimi',
  'Aşama 1: Teklif Onay Bildirimi',
  'Aşama 2: İş Emri Oluşturuldu',
  'Aşama 3: Rapor Teslim Bildirimi',
] as const;

const STAGE_META: Record<string, { color: string; icon: React.ReactNode }> = {
  'Aşama 0: Nexa Hoş Geldiniz Bildirimi': {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Bell className="h-4 w-4" />,
  },
  'Aşama 1: Teklif Onay Bildirimi': {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  'Aşama 2: İş Emri Oluşturuldu': {
    color: 'bg-slate-200 text-slate-700 border-slate-300',
    icon: <Send className="h-4 w-4" />,
  },
  'Aşama 3: Rapor Teslim Bildirimi': {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

export default function WhatsAppPage() {
  const logs = useStorageSync(getWhatsAppLogs);
  const customers = useStorageSync(getCustomers);

  const stats = useMemo(() => {
    const byStage: Record<string, number> = {};
    STAGES.forEach((s) => (byStage[s] = 0));
    logs.forEach((l) => {
      byStage[l.stage] = (byStage[l.stage] || 0) + 1;
    });
    return { total: logs.length, byStage };
  }, [logs]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="WhatsApp Otomasyon Takip"
        subtitle="Müşteri bildirim akışı — senkronize otomasyon zinciri"
        icon={<MessageCircle className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Pipeline */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, idx) => {
            const meta = STAGE_META[stage];
            const count = stats.byStage[stage] || 0;
            return (
              <Card key={stage} className={`border p-4 ${meta.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {meta.icon}
                    <span className="text-xs font-bold uppercase">Aşama {idx}</span>
                  </div>
                  <span className="text-2xl font-black">{count}</span>
                </div>
                <p className="mt-2 text-xs leading-snug">
                  {stage.split(': ')[1]}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Sync chain explanation */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Otomatik Senkronizasyon Zinciri</p>
              <p className="mt-1">
                <strong>Adım A:</strong> Yeni müşteri kaydı → Aşama 0 bildirimi otomatik gönderilir.
              </p>
              <p>
                <strong>Adım B:</strong> Teklif onayı → Aşama 1 bildirimi + Saha iş emri + gösterge paneli güncellenir.
              </p>
              <p>
                <strong>Adım C:</strong> Saha işi tamamlandığında → Aşama 3 bildirimi + rapor sayısı artar.
              </p>
            </div>
          </div>
        </Card>

        {/* Total + delivered */}
        <div className="flex items-center gap-4">
          <Card className="flex-1 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Toplam Gönderilen Bildirim</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Send className="h-8 w-8 text-slate-300" />
            </div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Teslim Edilen</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {logs.filter((l) => l.delivered).length}
                </p>
              </div>
              <CheckCheck className="h-8 w-8 text-emerald-400" />
            </div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Aktif Müşteri</p>
                <p className="text-2xl font-bold text-slate-800">{customers.length}</p>
              </div>
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
          </Card>
        </div>

        {/* Log feed */}
        <Card className="overflow-hidden">
          <div className="border-b bg-slate-50 px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Bildirim Akışı (Gerçek Zamanlı)
            </h3>
          </div>
          <div className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
            {logs.length === 0 && (
              <div className="p-10 text-center text-slate-500">Henüz bildirim bulunmuyor.</div>
            )}
            {logs.map((log) => {
              const meta = STAGE_META[log.stage];
              return (
                <div key={log.id} className="flex gap-3 px-5 py-4 hover:bg-slate-50">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {log.customerName}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${meta.color}`}>
                          {log.stage}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                        {formatDateTimeTR(log.sentAt)}
                      </div>
                    </div>
                    <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
