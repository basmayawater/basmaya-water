import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const DISMISSED_KEY = "pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isRunningStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Don't show if already installed or not on mobile
    if (isRunningStandalone() || !isMobile()) return;
    // Don't show if user already dismissed
    if (localStorage.getItem(DISMISSED_KEY) === "1") return;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIos(ios);

    if (ios) {
      // iOS: no beforeinstallprompt — show manual guidance after a short delay
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }

    // Android Chrome / Samsung Internet
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Hide once the app is installed
  useEffect(() => {
    const handler = () => setVisible(false);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setPrompt(null);
  }

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      role="banner"
      data-testid="install-banner"
      className="fixed bottom-0 inset-x-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-0 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 px-4 py-3 flex items-center gap-3"
        style={{ boxShadow: "0 -4px 24px 0 rgba(30,64,175,0.12)" }}>

        {/* Icon */}
        <div className="bg-blue-600 rounded-xl w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <span className="text-xl leading-none">💧</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-gray-900 leading-tight">ثبّت التطبيق</p>
          {isIos ? (
            <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
              اضغط <span className="font-bold">مشاركة</span> ثم «إضافة إلى الشاشة الرئيسية»
            </p>
          ) : (
            <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
              أضف الحاسبة لشاشتك الرئيسية
            </p>
          )}
        </div>

        {/* Install button (Android only) */}
        {!isIos && (
          <button
            data-testid="button-install"
            onClick={install}
            className="flex-shrink-0 bg-blue-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl active:scale-95 transition-transform flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            تثبيت
          </button>
        )}

        {/* Dismiss */}
        <button
          data-testid="button-dismiss-install"
          onClick={dismiss}
          aria-label="إغلاق"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
