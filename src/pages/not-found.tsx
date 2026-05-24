import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl font-extrabold text-blue-200 mb-4">٤٠٤</div>
        <p className="text-gray-600 mb-6 font-semibold">الصفحة غير موجودة</p>
        <button
          onClick={() => setLocation("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold active:scale-95 transition-transform"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
