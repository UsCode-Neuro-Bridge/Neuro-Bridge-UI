"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ko } from "date-fns/locale";

// 서버 응답: ["2025-08-01", "2025-08-03", ...]
async function fetchTestDates(userId: string, fromISO: string, toISO: string) {
  const url = new URL("/api/dates", window.location.origin);
  url.searchParams.set("userId", userId);
  url.searchParams.set("from", fromISO);
  url.searchParams.set("to", toISO);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [] as string[];
  const data = (await res.json()) as string[];
  return Array.isArray(data) ? data : [];
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarPage() {
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [doneDates, setDoneDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  // 사용자 식별 (임시: localStorage)
  useEffect(() => {
    const uid =
      localStorage.getItem("user-id") ||
      localStorage.getItem("user-token") ||
      "anonymous";
    setUserId(uid);
  }, []);

  // 활성 월 범위 계산
  const { fromISO, toISO, monthLabel } = useMemo(() => {
    const s = startOfMonth(month);
    const e = endOfMonth(month);
    return {
      fromISO: toISODate(s),
      toISO: toISODate(e),
      monthLabel: `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
    };
  }, [month]);

  function toISODate(d: Date) {
    return format(d, "yyyy-MM-dd");
  }

  // 월 바뀔 때마다 테스트 날짜 조회 → modifier로 전달
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const isoList = await fetchTestDates(userId, fromISO, toISO);
        if (!alive) return;
        const toDates = isoList
          .map((iso) => {
            const [yy, mm, dd] = iso.split("-").map(Number);
            return new Date(yy, (mm || 1) - 1, dd || 1); // Local time, no TZ drift
          })
          .filter((d) => !Number.isNaN(d.getTime()));
        setDoneDates(toDates);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, fromISO, toISO]);

  return (
    <main className="container mx-auto p-6">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">캘린더</h1>
        <span className="text-sm text-gray-500">
          {loading ? "불러오는 중…" : `조회: ${fromISO} ~ ${toISO}`}
        </span>
      </div>

      <div className="rounded-lg bg-white p-4 flex justify-center ">
        <DayPicker
          locale={ko}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          modifiers={{ done: doneDates }}
          modifiersClassNames={{
            done: "bg-green-100 text-green-800 font-semibold",
          }}
          // 날짜 셀 오른쪽 위에 체크 아이콘 표시
          components={{
            DayContent: ({ date, displayMonth }) => {
              const iso = toISO(date);
              const isInMonth = date.getMonth() === displayMonth.getMonth();
              const isDone = doneDates.some(
                (d) =>
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
              );
              return (
                <div
                  className={`relative w-full h-full ${
                    isInMonth ? "" : "text-gray-400"
                  }`}
                >
                  <span>{date.getDate()}</span>
                  {isDone && (
                    <span
                      className="absolute right-1 top-1 text-green-600"
                      aria-label="테스트 완료"
                      title="테스트 완료"
                    >
                      ✔️
                    </span>
                  )}
                </div>
              );
            },
          }}
        />
      </div>

      <div className="mt-4 flex justify-center items-center gap-3 text-sm text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-green-100 border border-green-300" />{" "}
          테스트 완료
        </span>
        <span className="text-gray-400 ">
          월 이동 시 해당 범위를 자동 조회합니다.
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500 flex justify-center gap-1">
        사용자 <span className="font-mono">{userId}</span>의 테스트 수행 날짜를
        표시합니다.
      </p>
    </main>
  );
}
