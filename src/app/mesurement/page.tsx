"use client";
import HandTracker from "@/components/HandTracker";

import { useCallback, useMemo, useState } from "react";

type AssessmentLevel = "정상" | "주의" | "위험";

const classify = (count: number): AssessmentLevel => {
  if (count >= 70) return "정상";
  if (count >= 55) return "주의"; // 관심 -> 주의 단계로 표현
  return "위험"; // 55회 이하
};

const makeLocalSummary = (
  count: number,
  seconds: number,
  level: AssessmentLevel
) => {
  const rate = (count / seconds).toFixed(2);
  const base = `측정 시간 동안 주먹을 ${count}회 쥐었습니다 (초당 ${rate}회). 결과는 \"${level}\" 범주입니다.`;
  if (level === "정상") {
    return (
      base +
      " 전반적으로 손 운동 빈도와 리듬이 충분히 유지되고 있어, 현재로서는 특이 소견이 낮습니다. 다만 일시적 피로, 카메라 각도, 조명 등 환경 요인에 따라 수치가 달라질 수 있으니 주기적으로 재측정을 권장합니다."
    );
  }
  if (level === "주의") {
    return (
      base +
      " 평균 권장 빈도에 약간 못 미치거나 변동성이 관찰될 수 있습니다. 최근 수면, 스트레스, 약물 복용 여부 등을 확인하고, 동일 조건에서 재측정해 일관성을 확인하세요. 증상이 지속되거나 손의 떨림/경직 등 다른 이상이 동반되면 전문의 상담을 권합니다."
    );
  }
  return (
    base +
    " 권장 기준에 현저히 미달하는 결과입니다. 측정 환경 문제를 먼저 점검(카메라 위치/밝기, 프레임 누락 등)한 뒤 재측정하시고, 동일 결과가 반복되면 신경과 전문 진료를 검토해 주세요."
  );
};

const Measurement = () => {
  const [seconds] = useState<number>(30);
  const [count, setCount] = useState<number | null>(null);
  const [level, setLevel] = useState<AssessmentLevel | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleComplete = useCallback(
    async (finalCount: number, durationSec?: number) => {
      const s = durationSec ?? seconds;
      setCount(finalCount);
      const l = classify(finalCount);
      setLevel(l);
      setLoading(true);

      // 1) 로컬 요약 즉시 표시 (빠른 피드백)
      const local = makeLocalSummary(finalCount, s, l);
      setSummary(local);

      // 2) (선택) 서버의 GPT API와 연동 시도. 실패해도 로컬 요약을 유지.
      try {
        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: finalCount, seconds: s, level: l }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.message && typeof data.message === "string") {
            setSummary(data.message);
          }
        }
      } catch (_) {
        // API가 아직 없거나 실패한 경우: 로컬 요약 유지
      } finally {
        setLoading(false);
      }
    },
    [seconds]
  );

  const headerText = useMemo(() => {
    if (level === "정상") return "정상 결과";
    if (level === "주의") return "주의 필요";
    if (level === "위험") return "위험: 추가 확인 권장";
    return "손동작 측정";
  }, [level]);

  const headerClass = useMemo(() => {
    if (level === "정상") return "text-emerald-600";
    if (level === "주의") return "text-amber-600";
    if (level === "위험") return "text-red-600";
    return "";
  }, [level]);

  const reset = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold ${headerClass}`}>{headerText}</h1>
        <p className="text-lg text-gray-600 mt-2">
          웹캠을 켜고 카메라에 손바닥을 보여주세요. 주먹 쥐기 테스트를
          진행합니다.
        </p>
      </div>

      {/* HandTracker 컴포넌트가 완료 시 (count, durationSec)를 콜백으로 넘겨준다고 가정 */}
      <HandTracker onComplete={handleComplete} targetSeconds={seconds} />

      {/* 결과 패널 */}
      {count !== null && (
        <section className="mt-8 max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">측정 결과</h2>
              <p className="text-sm text-gray-500 mt-1">
                분류 기준: 60회 이상=정상, 30~59회=주의, 10회 이하=위험
              </p>
            </div>
            <button
              onClick={reset}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              다시 측정
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 rounded border">
              <div className="text-xs text-gray-500">총 횟수</div>
              <div className="text-xl font-bold">{count}회</div>
            </div>
            <div className="p-4 rounded border">
              <div className="text-xs text-gray-500">측정 시간</div>
              <div className="text-xl font-bold">{seconds}초</div>
            </div>
            <div className="p-4 rounded border">
              <div className="text-xs text-gray-500">분류</div>
              <div className="text-xl font-bold">{level}</div>
            </div>
          </div>
          <div className="mt-6 whitespace-pre-line leading-7">
            {loading ? "분석 중…" : summary}
          </div>
        </section>
      )}
    </main>
  );
};

export default Measurement;
