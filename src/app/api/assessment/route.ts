import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { count, seconds, level, age } = await req.json();

    if (typeof count !== "number" || typeof seconds !== "number" || !level) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    // 앱과 동일한 분류 규칙(안전하게 재확인)
    const band = count >= 70 ? "정상" : count >= 55 ? "주의" : "위험";

    const system = `
당신은 한국어 신경과 상담 도우미입니다. 사용자의 손동작 측정 결과를 바탕으로
친절하고 차분한 설명을 제공합니다. 과장하거나 단정적으로 진단하지 말고,
비의료적 참고 정보임을 분명히 하며, 필요 시 전문의 상담을 권고하세요.
`;

    const user = `
입력 데이터:
- 사용자 나이: ${typeof age === "number" ? `${age}세` : "정보 없음"}
- 측정 시간: ${seconds}초
- 주먹 횟수: ${count}회
- 분류: ${band} (정상: ≥70, 주의: 55~69, 위험: ≤55)

요구사항:
1) 결과의 의미를 쉬운 한국어로 6~10문장 서술
2) 나이를 고려한 톤 조절:
   - 영유아/어린이: 보호자 안내 중심
   - 성인: 자기관리 중심
   - 노년층: 예방/병원 상담 권고 톤
3) 측정 환경(카메라 각도/조명/프레임 드랍)으로 인한 오차 가능성 1~2문장
4) 동일 조건 재측정 팁 2~3가지 (간단, 실천 가능)
5) 현재 분류(${band})에 맞춘 다음 행동 가이드
6) “본 결과는 참고용이며 의료진의 진료를 대체하지 않습니다.” 포함
7) 문장 연결 자연스럽게, 중복 표현 회피
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: "openai_error", detail: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const message = data?.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return NextResponse.json({ error: "no content" }, { status: 502 });
    }

    return NextResponse.json({ message }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
