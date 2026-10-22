import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = (await req.json()) as {
      to: string;
      subject: string;
      body: string;
    };

    if (!to || !subject || !body) {
      return NextResponse.json(
        { ok: false, error: 'Eksik alan: to, subject, body gereklidir' },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return NextResponse.json(
        { ok: false, error: `SMTP çevre değişkenleri eksik: host=${host ? 'OK' : 'YOK'}, user=${user ? 'OK' : 'YOK'}, pass=${pass ? 'OK' : 'YOK'}` },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      text: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
