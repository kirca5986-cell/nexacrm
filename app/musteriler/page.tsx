'use client';

import { useState } from 'react';
import { Users, Plus, Building2, Phone, MapPin, Hash, Trash2, Mail, Pencil } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, saveCustomers } from '@/lib/storage';
import { useStorageSync } from '@/hooks/use-storage';
import { formatDateTimeTR } from '@/lib/calculations';
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

type FormState = {
  id: string;
  companyName: string;
  taxNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  isgKatipContractId: string;
};

const EMPTY_FORM: FormState = {
  id: '',
  companyName: '',
  taxNumber: '',
  contactPerson: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  isgKatipContractId: '',
};

export default function MusterilerPage() {
  const customers = useStorageSync(getCustomers);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(id: string) {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({
      id: c.id,
      companyName: c.companyName,
      taxNumber: c.taxNumber,
      contactPerson: c.contactPerson,
      phone: c.phone,
      email: c.email,
      city: c.city,
      address: c.address,
      isgKatipContractId: c.isgKatipContractId,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName) return;
    if (editingId) {
      const existing = customers.find((c) => c.id === editingId);
      updateCustomer({
        ...form,
        id: editingId,
        createdAt: existing?.createdAt ?? Date.now(),
      });
    } else {
      addCustomer({
        id: `cust-${Date.now()}`,
        companyName: form.companyName,
        taxNumber: form.taxNumber,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        city: form.city,
        address: form.address,
        isgKatipContractId: form.isgKatipContractId,
        createdAt: Date.now(),
      });
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOpen(false);
  }

  function handleDelete(id: string) {
    saveCustomers(customers.filter((c) => c.id !== id));
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Müşteri Havuzu"
        subtitle="Tüm işveren firmalar ve İSG-KATİP sözleşmeleri"
        icon={<Users className="h-6 w-6" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
                onClick={openNew}
              >
                <Plus className="mr-2 h-4 w-4" /> Yeni Müşteri
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Müşteri Kaydı'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Firma Ünvanı *</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Vergi Numarası</Label>
                    <Input
                      value={form.taxNumber}
                      onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>İSG-KATİP Sözleşme ID</Label>
                    <Input
                      value={form.isgKatipContractId}
                      onChange={(e) => setForm({ ...form, isgKatipContractId: e.target.value })}
                      placeholder="İmzalandıktan sonra giriniz (opsiyonel)"
                    />
                  </div>
                  <div>
                    <Label>Yetkili Kişi</Label>
                    <Input
                      value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <Label>E-posta Adresi</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ornek@firma.com.tr"
                    />
                  </div>
                  <div>
                    <Label>Şehir</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Adres</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    {editingId ? 'Değişiklikleri Kaydet' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 lg:px-8 pb-8">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Firma Ünvanı</th>
                  <th className="px-4 py-3 text-left">İSG-KATİP</th>
                  <th className="px-4 py-3 text-left">Yetkili</th>
                  <th className="px-4 py-3 text-left">Telefon</th>
                  <th className="px-4 py-3 text-left">E-posta</th>
                  <th className="px-4 py-3 text-left">Şehir</th>
                  <th className="px-4 py-3 text-left">Kayıt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{c.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.isgKatipContractId ? (
                        <Badge variant="secondary" className="font-mono">
                          {c.isgKatipContractId}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Sözleşme Bekliyor
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.contactPerson}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {c.email || <span className="text-amber-500">E-posta eklenmedi</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {c.city}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDateTimeTR(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(c.id)}
                          className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
