'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  CalendarClock,
  Gauge,
  BookOpenCheck,
  ShieldCheck,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import {
  getCustomers,
  getOffers,
  getJobs,
  getReports,
  getCalibration,
} from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatCurrencyTRY, formatDateTR } from '@/lib/calculations';
import { MACHINES } from '@/lib/machines';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

export default function HomePage() {
  const customers = useStorageSync(getCustomers);
  const offers = useStorageSync(getOffers);
  const jobs = useStorageSync(getJobs);
  const reports = useStorageSync(getReports);
  const calibration = useStorageSync(getCalibration);

  const stats = useMemo(() => {
    const approvedOffers = offers.filter((o) => o.status === 'Onaylandı');
    const approvedRevenue = approvedOffers.reduce((s, o) => s + o.totalAmount, 0);
    const activeJobs = jobs.filter((j) => j.status !== 'Tamamlandı').length;
    const completedJobs = jobs.filter((j) => j.status === 'Tamamlandı').length;
    const overdueCal = calibration.filter((c) => c.status === 'Gecikmiş').length;
    const approvedReports = reports.filter((r) => r.status === 'Onaylandı');
    return {
      customerCount: customers.length,
      offerCount: offers.length,
      approvedRevenue,
      activeJobs,
      completedJobs,
      reportCount: approvedReports.length,
      overdueCal,
      approvedReports,
    };
  }, [customers, offers, jobs, reports, calibration]);

  const machineDist = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.machineTypeName] = (counts[j.machineTypeName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const revenueByMachine = useMemo(() => {
    const rev: Record<string, number> = {};
    offers
      .filter((o) => o.status === 'Onaylandı')
      .forEach((o) => {
        o.items.forEach((it) => {
          rev[it.machineTypeName] = (rev[it.machineTypeName] || 0) + it.quantity * it.unitPrice;
        });
      });
    return Object.entries(rev).map(([name, value]) => ({ name, value }));
  }, [offers]);

  const pieColors = ['#f97316', '#0d9488', '#1e293b', '#facc15', '#dc2626', '#2563eb', '#7c3aed'];

  const upcomingJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status !== 'Tamamlandı')
        .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
        .slice(0, 5),
    [jobs]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ana Sayfa"
        subtitle="Nexa Periyodik Kontrol — Genel Gösterge Paneli"
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Onaylanan Ciro"
            value={formatCurrencyTRY(stats.approvedRevenue)}
            tint="emerald"
          />
          <StatCard
            icon={<Wrench className="h-5 w-5" />}
            label="Aktif İş"
            value={String(stats.activeJobs)}
            tint="amber"
          />
          <StatCard
            icon={<BookOpenCheck className="h-5 w-5" />}
            label="Düzenlenen Rapor Sayısı"
            value={String(stats.reportCount)}
            tint="blue"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Müşteri Havuzu"
            value={String(stats.customerCount)}
            tint="slate"
          />
        </div>

        {/* Alerts */}
        {stats.overdueCal > 0 && (
          <Card className="border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  {stats.overdueCal} adet kalibrasyon cihazının süresi geçmiştir!
                </p>
                <p className="text-xs text-red-700">
                  Cihaz Kalibrasyon bölümünden kontrol ediniz. Geciken cihazlarla rapor
                  düzenlenmesi mevzuata aykırıdır.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Makine Türüne Göre Onaylanan Ciro (₺)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByMachine} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatCurrencyTRY(v)} />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <FileText className="h-4 w-4 text-teal-600" />
              Saha İşleri Dağılımı (Makine Türü)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={machineDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(e: any) => e.value}
                  labelLine={false}
                >
                  {machineDist.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Upcoming jobs + recent reports */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <CalendarClock className="h-4 w-4 text-amber-600" />
              Yaklaşan Saha İşleri
            </h3>
            <div className="space-y-2">
              {upcomingJobs.length === 0 && (
                <p className="text-sm text-slate-500">Planlanmış iş bulunmuyor.</p>
              )}
              {upcomingJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{j.machineTypeName}</p>
                    <p className="text-xs text-slate-500">
                      {j.customerName} • {j.kkCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {formatDateTR(j.plannedDate)}
                    </Badge>
                    <p className="mt-1 text-[10px] text-slate-400">{j.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <BookOpenCheck className="h-4 w-4 text-blue-600" />
              Son Düzenlenen Raporlar
            </h3>
            <div className="space-y-2">
              {stats.approvedReports.length === 0 && (
                <p className="text-sm text-slate-500">Onaylanmış rapor bulunmuyor.</p>
              )}
              {stats.approvedReports.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.number}</p>
                    <p className="text-xs text-slate-500">
                      {r.machineTypeName} • {r.kkCode}/{r.krCode}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> {r.finalResult}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Machine catalog */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Gauge className="h-4 w-4 text-slate-600" />
            Yetki Kapsamındaki 11 Makine — ÇSGB Bakanlık Kodları
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MACHINES.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700">{m.name}</span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {m.kkCode}/{m.krCode}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'emerald' | 'amber' | 'blue' | 'slate';
}) {
  const tints = {
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-indigo-600',
    slate: 'from-slate-600 to-slate-800',
  };
  return (
    <Card className="stat-card relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tints[tint]} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
