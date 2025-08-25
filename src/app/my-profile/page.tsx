"use client";
import Calendar from "@/components/Calendar";
import { useEffect, useState } from "react";

const MyProfile = () => {
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    birth: "",
  });
  const [lastResult, setLastResult] = useState<null | {
    id?: string;
    takenAt?: string; // ISO date-time string
    score?: number;
    label?: string;
    summary?: string;
  }>(null);
  const [lastLoading, setLastLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        setUserInfo({
          email: data.email,
          name: data.name,
          birth: data.birth,
        });
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
    fetchUserInfo();
    async function fetchLastMeasurement() {
      try {
        const res = await fetch("/api/measurements/last");
        if (!res.ok) throw new Error("Failed to fetch last measurement");
        const data = await res.json();
        // Expecting shape like { id, takenAt, score, label, summary }
        setLastResult(data);
      } catch (err) {
        console.error("Error fetching last measurement:", err);
        setLastResult(null);
      } finally {
        setLastLoading(false);
      }
    }
    fetchLastMeasurement();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <h1 className="mb-4 text-xl font-semibold">마이프로필</h1>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">사용자 정보</h2>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>
            <span className="font-medium">이메일:</span> {userInfo.email || "-"}
          </p>
          <p>
            <span className="font-medium">이름:</span> {userInfo.name || "-"}
          </p>
          <p>
            <span className="font-medium">생년월일:</span>{" "}
            {userInfo.birth || "-"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="rounded-lg mt-4 bg-white p-4 shadow-sm h-[450px]">
          <Calendar size="md" className="w-full" />
        </div>
        {/* 마지막 측정 결과 카드 */}
        <div className="rounded-lg mt-4 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">마지막 측정 결과</h2>
          {lastLoading ? (
            <p className="text-sm text-gray-500">불러오는 중…</p>
          ) : lastResult ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">측정일:</span>{" "}
                {lastResult.takenAt
                  ? new Date(lastResult.takenAt).toLocaleString()
                  : "-"}
              </p>
              <p>
                <span className="font-medium">점수:</span>{" "}
                {typeof lastResult.score === "number" ? lastResult.score : "-"}
              </p>
              {lastResult.label && (
                <p>
                  <span className="font-medium">판정:</span> {lastResult.label}
                </p>
              )}
              {lastResult.summary && (
                <p className="text-gray-600 whitespace-pre-line">
                  {lastResult.summary}
                </p>
              )}
              {lastResult.id && (
                <p className="text-xs text-gray-400">ID: {lastResult.id}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">아직 측정 기록이 없어요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
