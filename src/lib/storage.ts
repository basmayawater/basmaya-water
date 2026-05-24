export interface HistoryRecord {
  id: string;
  date: string;
  time: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  totalAmount: number;
}

const STORAGE_KEY = "basmaya_water_history";

export function getHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return [];
  }
}

export function saveRecord(record: Omit<HistoryRecord, "id" | "date" | "time">): HistoryRecord {
  const now = new Date();
  const newRecord: HistoryRecord = {
    id: Date.now().toString(),
    date: now.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: now.toLocaleTimeString("ar-IQ", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    ...record,
  };

  const history = getHistory();
  history.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

export function deleteRecord(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
