// src/app/api/tests/dates/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to"); // YYYY-MM-DD
  const userId = searchParams.get("userId");

  // TODO: 실제로는 DB에서 userId + 날짜 범위로 조회
  // 데모: 해당 월의 홀수 날짜에 체크
  if (!from || !to) return NextResponse.json([], { status: 200 });

  const [y, m] = from.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate(); // m은 1~12 형태라고 가정
  const demo = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter((d) => d % 2 === 1)
    .map(
      (d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );

  return NextResponse.json(demo);
}
