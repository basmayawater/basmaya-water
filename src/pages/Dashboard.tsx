import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Droplets,
  Gauge,
  Wallet,
  Waves,
  CheckCircle,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { CalculationResult, formatCurrency } from "@/lib/calculator";

function buildShareText(result: CalculationResult): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return [
    "💧 *حاسبة ماء بسماية*",
    `📅 التاريخ: ${dateStr}`,
    "─────────────────",
    `📖 القراءة السابقة:  ${result.previousReading} م³`,
    `📖 القراءة الحالية:   ${result.currentReading} م³`,
    `🔵 الاستهلاك:         ${result.consumption} م³`,
    "─────────────────",
    `💦 أجرة الماء:        ${formatCurrency(result.waterCost)}`,
    `🔧 أجرة المجاري:     ${formatCurrency(result.sewerCost)}`,
    "─────────────────",
    `💰 *المجموع الكلي:   ${formatCurrency(result.totalAmount)}*`,
    "─────────────────",
    "⚠️ هذه تقديرات غير رسمية لأغراض المعلومات فقط.",
  ].join("\n");
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const dataRaw = params.get("data");
  const result: CalculationResult | null = dataRaw
    ? (() => {
        try {
          return JSON.parse(decodeURIComponent(dataRaw)) as CalculationResult;
        } catch {
          return null;
        }
      })()
    : null;

  if (!result) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">لا توجد بيانات للعرض</p>
          <button
            onClick={() => setLocation("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
          >
            العودة للحاسبة
          </button>
        </div>
      </div>
    );
  }

  const shareText = buildShareText(result);

  async function handleNativeShare() {
    setShareError("");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "حاسبة ماء بسماية",
          text: shareText,
        });
      } catch (err) {
        // User cancelled — not an error
        if (err instanceof Error && err.name !== "AbortError") {
          setShareError("تعذّر المشاركة. حاول نسخ النص.");
        }
      }
    } else {
      // Desktop fallback — copy to clipboard
      handleCopy();
    }
  }

  function handleWhatsApp() {
    setShareError("");
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    setShareError("");
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError("تعذّر النسخ. يرجى النسخ يدوياً.");
    }
  }

  const summaryCards = [
    {
      icon: Gauge,
      label: "القراءة الحالية",
      value: `${result.currentReading} م³`,
      bg: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    {
      icon: Droplets,
      label: "الاستهلاك",
      value: `${result.consumption} م³`,
      bg: "from-sky-500 to-sky-600",
      iconBg: "bg-sky-400/30",
    },
    {
      icon: Waves,
      label: "أجرة الماء",
      value: formatCurrency(result.waterCost),
      bg: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-400/30",
    },
    {
      icon: Wallet,
      label: "أجرة المجاري",
      value: formatCurrency(result.sewerCost),
      bg: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-400/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-l from-blue-700 to-blue-600 text-white px-5 pb-8 rounded-b-[2rem] shadow-xl safe-top">
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/")}
            className="bg-white/20 rounded-xl p-2 hover:bg-white/30 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold leading-tight">نظرة عامة على الاستهلاك</h1>
            <p className="text-blue-200 text-sm mt-0.5">تفاصيل فاتورة الماء</p>
          </div>
          {/* Share icon in header */}
          <button
            data-testid="button-share-header"
            onClick={handleNativeShare}
            className="bg-white/20 rounded-xl p-2 hover:bg-white/30 transition-colors"
            aria-label="مشاركة"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Total highlight in header */}
        <div className="mt-5 bg-white/15 rounded-2xl p-4 border border-white/20">
          <p className="text-blue-200 text-sm font-medium mb-1">المبلغ الإجمالي</p>
          <p className="text-4xl font-extrabold tracking-wide" data-testid="text-total-amount">
            {formatCurrency(result.totalAmount)}
          </p>
          <p className="text-blue-200 text-xs mt-1">ماء + مجاري</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-5 max-w-md mx-auto w-full">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${card.bg} rounded-3xl p-4 text-white shadow-lg`}
                style={{ boxShadow: "0 6px 20px 0 rgba(30,64,175,0.18)" }}
              >
                <div className={`${card.iconBg} rounded-xl w-10 h-10 flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-xs font-medium mb-1">{card.label}</p>
                <p className="text-lg font-extrabold leading-tight" data-testid={`text-${card.label}`}>
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div
          className="bg-white rounded-3xl shadow-lg p-5 border border-blue-50"
          style={{ boxShadow: "0 8px 32px 0 rgba(30,64,175,0.10)" }}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">تفاصيل الحساب</h2>

          <div className="space-y-3">
            {result.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-blue-50 last:border-0"
                data-testid={`breakdown-item-${index}`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">
                      {item.units} م³ × {item.rate.toLocaleString("ar-IQ")} د.ع
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
                  {formatCurrency(item.cost)}
                </span>
              </div>
            ))}
          </div>

          {/* Sewer note */}
          <div className="mt-4 bg-violet-50 rounded-2xl p-3 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-violet-500" />
              <p className="text-xs font-bold text-violet-700">ملاحظة المجاري</p>
            </div>
            <p className="text-xs text-violet-600 leading-relaxed">
              أجرة المجاري تساوي أجرة الماء دائماً.
              أجرة الماء: {formatCurrency(result.waterCost)} = أجرة المجاري: {formatCurrency(result.sewerCost)}
            </p>
          </div>
        </div>

        {/* Summary Table */}
        <div
          className="bg-white rounded-3xl shadow-lg p-5 border border-blue-50"
          style={{ boxShadow: "0 8px 32px 0 rgba(30,64,175,0.10)" }}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">ملخص الفاتورة</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">القراءة السابقة</span>
              <span className="font-bold text-gray-800" data-testid="text-prev-reading">
                {result.previousReading} م³
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">القراءة الحالية</span>
              <span className="font-bold text-gray-800" data-testid="text-curr-reading">
                {result.currentReading} م³
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">الاستهلاك</span>
              <span className="font-bold text-blue-700">{result.consumption} م³</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">أجرة الماء</span>
              <span className="font-bold text-indigo-700">{formatCurrency(result.waterCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">أجرة المجاري</span>
              <span className="font-bold text-violet-700">{formatCurrency(result.sewerCost)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-600 rounded-2xl px-4 mt-2">
              <span className="text-sm font-bold text-blue-100">المجموع الكلي</span>
              <span className="font-extrabold text-white text-lg">{formatCurrency(result.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Share Card */}
        <div
          className="bg-white rounded-3xl shadow-lg p-5 border border-blue-50"
          style={{ boxShadow: "0 8px 32px 0 rgba(30,64,175,0.10)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">مشاركة الفاتورة</h2>
          </div>

          {/* Preview of share text */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <pre
              className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans text-right"
              data-testid="text-share-preview"
              dir="rtl"
            >
              {shareText}
            </pre>
          </div>

          {shareError && (
            <p className="text-red-500 text-xs text-center mb-3 font-medium">{shareError}</p>
          )}

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Native Share / Copy on desktop */}
            <button
              data-testid="button-share-native"
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-bold text-xs py-3 px-2 rounded-2xl transition-all duration-200 border border-blue-100"
            >
              <Share2 className="w-5 h-5" />
              <span>مشاركة</span>
            </button>

            {/* WhatsApp */}
            <button
              data-testid="button-share-whatsapp"
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100 active:scale-95 text-green-700 font-bold text-xs py-3 px-2 rounded-2xl transition-all duration-200 border border-green-100"
            >
              {/* WhatsApp icon using SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>واتساب</span>
            </button>

            {/* Copy to clipboard */}
            <button
              data-testid="button-share-copy"
              onClick={handleCopy}
              className={`flex flex-col items-center gap-1.5 active:scale-95 font-bold text-xs py-3 px-2 rounded-2xl transition-all duration-200 border ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          data-testid="button-back-bottom"
          onClick={() => setLocation("/")}
          className="w-full bg-white text-blue-700 font-extrabold text-base py-4 rounded-2xl border-2 border-blue-200 shadow hover:bg-blue-50 active:scale-95 transition-all duration-200"
        >
          العودة للحاسبة
        </button>
      </main>
    </div>
  );
}
