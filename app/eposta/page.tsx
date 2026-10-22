'use client';

import { Mail, Inbox, Send } from 'lucide-react';
import { getEmails } from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatDateTimeTR } from '@/lib/calculations';
import { COMPANY_EMAIL } from '@/lib/config';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EpostaPage() {
  const emails = useStorageSync(getEmails);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="E-Posta Bildirimleri"
        subtitle="Otomatik gönderilen kurumsal e-posta bildirimleri"
        icon={<Mail className="h-6 w-6" />}
      />

      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Sender info */}
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600">
              <Mail className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Kurumsal Gönderici Adresi</p>
              <p className="text-sm text-slate-500">{COMPANY_EMAIL}</p>
              <p className="text-xs text-slate-400">Zoho Mail üzerinden otomatik gönderim</p>
            </div>
          </div>
        </Card>

        {/* Email list */}
        <div className="space-y-3">
          {emails.map((email) => (
            <Card key={email.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white">
                    {email.stage === 'E-Fatura' ? (
                      <Send className="h-4 w-4" />
                    ) : (
                      <Inbox className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{email.subject}</p>
                    <p className="text-xs text-slate-500">
                      Kime: {email.to} • {email.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{email.stage}</Badge>
                  {email.delivered ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Gönderildi</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 text-xs">Gönderilemedi</Badge>
                  )}
                  <span className="text-xs text-slate-400">{formatDateTimeTR(email.sentAt)}</span>
                </div>
              </div>
              <div className="px-5 py-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {email.body}
                </pre>
              </div>
            </Card>
          ))}
          {emails.length === 0 && (
            <Card className="p-10 text-center text-slate-500">
              Henüz gönderilmiş e-posta bildirimi bulunmamaktadır. Teklif onayı, fatura kesimi ve rapor teslimi
              adımlarında otomatik e-posta gönderilecektir.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}