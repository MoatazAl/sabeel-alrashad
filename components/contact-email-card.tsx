"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

type CopyStatus = "idle" | "copied" | "error";

type ContactEmailCardProps = {
  email: string;
};

const defaultSubject = "ملاحظة حول موقع سبيل الرشاد";

function copyWithSelectionFallback(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);

  try {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export function ContactEmailCard({ email }: ContactEmailCardProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`;

  async function copyEmail() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else if (!copyWithSelectionFallback(email)) {
        throw new Error("Clipboard copy failed");
      }

      setCopyStatus("copied");
    } catch {
      try {
        setCopyStatus(copyWithSelectionFallback(email) ? "copied" : "error");
      } catch {
        setCopyStatus("error");
      }
    }
  }

  return (
    <section
      aria-labelledby="contact-email-heading"
      className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="contact-email-heading"
            className="text-lg font-bold text-stone-950"
          >
            البريد الإلكتروني
          </h2>
          <a
            href={`mailto:${email}`}
            dir="ltr"
            lang="en"
            className="mt-1 block select-all break-all rounded text-left text-base font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 sm:text-lg"
          >
            {email}
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={mailtoHref}
          aria-label={`إرسال رسالة إلى ${email}`}
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
        >
          إرسال رسالة
        </a>
        <button
          type="button"
          onClick={copyEmail}
          aria-label={
            copyStatus === "copied"
              ? "تم نسخ البريد"
              : "نسخ عنوان البريد الإلكتروني"
          }
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-bold text-stone-800 transition hover:border-emerald-800 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
        >
          {copyStatus === "copied" ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Copy className="h-5 w-5" aria-hidden="true" />
          )}
          <span aria-live="polite">
            {copyStatus === "copied" ? "تم نسخ البريد" : "نسخ البريد"}
          </span>
        </button>
      </div>

      {copyStatus === "error" ? (
        <p role="status" className="mt-3 text-sm font-medium text-red-700">
          تعذر النسخ تلقائياً، ويمكنك تحديد البريد ونسخه يدوياً.
        </p>
      ) : null}
    </section>
  );
}
