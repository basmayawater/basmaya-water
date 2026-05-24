import { useState } from "react";
import { useLocation } from "wouter";
import { Droplets, Calculator, Clock } from "lucide-react";
import { calculateWaterBill } from "@/lib/calculator";
import { saveRecord, getHistory, deleteRecord, HistoryRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculator";

export default function CalculatorPage() {
  const [, setLocation] = useLocation();
  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryRecord[]>(() => getHistory());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCalculate() {
    setError("");
    const prev = parseFloat(previousReading);
    const curr = parseFloat(currentReading);

    if (isNaN(prev) || isNaN(curr)) {
      setError("الرجاء إدخال قراءات صحيحة");
      return;
    }
    if (prev < 0 || curr < 0) {
      setError("لا يمكن أن تكون القراءة سالبة");
      return;
    }
    if (curr < prev) {
      setError("القراءة الحالية يجب أن تكون أكبر من القراءة السابقة");
      return;
    }

    const result = calculateWaterBill(prev, curr);
    saveRecord({
      previousReading: prev,
      currentReading: curr,
      consumption: result.consumption,
      totalAmount: result.totalAmount,
    });

    const encoded = encodeURIComponent(JSON.stringify(result));
    setLocation(`/dashboard?data=${encoded}`);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setTimeout(() => {
      deleteRecord(id);
      setHistory(getHistory());
      setDeletingId(null);
    }, 300);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-l from-blue-700 to-blue-600 text-white px-5 pb-8 rounded-b-[2rem] shadow-xl safe-top">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-2xl p-2.5">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-wide">حاسبة ماء بسماية</h1>
            <p className="text-blue-200 text-sm mt-0.5">احسب فاتورة الماء بسهولة</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-5 max-w-md mx-auto w-full">
        {/* Calculator Card */}
        <div
          className="bg-white rounded-3xl shadow-lg p-6 border border-blue-50"
          style={{ boxShadow: "0 8px 32px 0 rgba(30,64,175,0.10)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">إدخال القراءات</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="prev-reading">
                القراءة السابقة
              </label>
              <input
                id="prev-reading"
                data-testid="input-previous-reading"
                type="number"
                inputMode="decimal"
                placeholder="أدخل القراءة السابقة"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-3.5 text-base font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="curr-reading">
                القراءة الحالية
              </label>
              <input
                id="curr-reading"
                data-testid="input-current-reading"
                type="number"
                inputMode="decimal"
                placeholder="أدخل القراءة الحالية"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-3.5 text-base font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              data-testid="button-calculate"
              onClick={handleCalculate}
              className="w-full bg-gradient-to-l from-blue-700 to-blue-500 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 hover:shadow-xl hover:from-blue-800 hover:to-blue-600"
            >
              احسب الآن
            </button>
          </div>
        </div>

        {/* Legal Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
          <p className="text-amber-800 text-xs leading-relaxed font-medium text-center">
            هذا الموقع أداة حسابية غير رسمية مستقلة، والغرض منه تقديم تقديرات تقريبية لاستهلاك وأجور الماء فقط، ولا يمثل أو يرتبط بأي جهة حكومية أو رسمية.
          </p>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-5 border border-blue-50" style={{ boxShadow: "0 8px 32px 0 rgba(30,64,175,0.10)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">آخر سجلات القراءة</h2>
            </div>

            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  data-testid={`history-record-${record.id}`}
                  className={`bg-blue-50 rounded-2xl p-4 border border-blue-100 transition-all duration-300 ${deletingId === record.id ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                        {record.date}
                      </span>
                      <span className="text-xs text-gray-500 mr-2">{record.time}</span>
                    </div>
                    <button
                      data-testid={`button-delete-${record.id}`}
                      onClick={() => handleDelete(record.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold px-2.5 py-1 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      حذف
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">السابقة</span>
                      <p className="font-bold text-gray-800">{record.previousReading} م³</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">الحالية</span>
                      <p className="font-bold text-gray-800">{record.currentReading} م³</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">الاستهلاك</span>
                      <p className="font-bold text-blue-700">{record.consumption} م³</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">المجموع</span>
                      <p className="font-bold text-green-700">{formatCurrency(record.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
