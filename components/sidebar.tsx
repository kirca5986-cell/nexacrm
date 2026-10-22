'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  BookOpenCheck,
  Gauge,
  MessageCircle,
  Mail,
  Receipt,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { href: '/musteriler', label: 'Müşteri Havuzu', icon: Users },
  { href: '/teklifler', label: 'Teklif Yönetimi', icon: FileText },
  { href: '/saha-isleri', label: 'Saha İşleri & Takvim', icon: CalendarDays },
  { href: '/raporlar', label: 'ÇSGB Rapor Dünyası', icon: BookOpenCheck },
  { href: '/kalibrasyon', label: 'Cihaz Kalibrasyon', icon: Gauge },
  { href: '/efatura', label: 'E-Fatura Yönetimi', icon: Receipt },
  { href: '/whatsapp', label: 'WhatsApp Otomasyon Takip', icon: MessageCircle },
  { href: '/eposta', label: 'E-Posta Bildirimleri', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg"
        aria-label="Menüyü Aç"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">NEXA</div>
              <div className="text-xs text-slate-400">Periyodik Kontrol</div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Menüyü Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 shadow-inner ring-1 ring-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4">
          <div className="rounded-lg bg-slate-800/50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>ÇSGB Yetkili — Makine Müh.</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Kaldırma-İletme & Basınçlı Kapar
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
