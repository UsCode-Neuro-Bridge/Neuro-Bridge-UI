"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

// '게임'의 전체 상태를 관리합니다.
type GameState = "loading" | "countdown" | "measuring" | "finished";

type Props = {
  onComplete?: (count: number, durationSec?: number) => void;
  targetSeconds?: number;
};

const HandTracker = ({ onComplete, targetSeconds = 30 }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const reportedRef = useRef(false);

  // ------------------- 상태 관리 -------------------
  const [gameState, setGameState] = useState<GameState>("loading");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(targetSeconds);
  const [punchCount, setPunchCount] = useState(0);
  const isFistState = useRef(false); // 주먹 상태를 기억 (true: 주먹, false: 편손)

  // ===== 추가된 부분 =====
  // 애니메이션 루프가 최신 gameState를 참조할 수 있도록 ref를 사용합니다.
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  // =======================

  // 1. MediaPipe 및 웹캠 초기 설정
  useEffect(() => {
    async function setup() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
      handLandmarkerRef.current = handLandmarker;
      console.log("✅ MediaPipe is ready.");

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            videoRef.current?.play();
            predictWebcam(); // 감지 루프 시작
            setGameState("countdown"); // 모든 준비 완료 -> 카운트다운 시작
            console.log("✅ Webcam is ready. Starting countdown...");
          };
        }
      }
    }
    setup();

    return () => {
      // 컴포넌트 정리
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      handLandmarkerRef.current?.close();
    };
  }, []);

  // 2. 카운트다운 로직
  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown <= 0) {
      setGameState("measuring"); // 카운트다운 끝 -> 측정 시작
      console.log("🚀 Measurement started!");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  // 3. 30초 측정 타이머 로직
  useEffect(() => {
    if (gameState !== "measuring") return;

    if (timeLeft <= 0) {
      setGameState("finished"); // 시간 종료 -> 측정 완료
      console.log("🎉 Measurement finished!");
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState !== "finished") return;
    if (reportedRef.current) return;
    reportedRef.current = true;
    const elapsed = Math.max(0, targetSeconds - timeLeft);
    onComplete?.(punchCount, elapsed || targetSeconds);
  }, [gameState, punchCount, timeLeft, targetSeconds, onComplete]);

  // 4. 실시간 감지 및 그리기 함수
  const predictWebcam = () => {
    if (
      handLandmarkerRef.current &&
      videoRef.current?.readyState === 4 // 비디오가 완전히 재생 가능한지 확인
    ) {
      const results = handLandmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );
      const canvas = canvasRef.current!;
      const canvasCtx = canvas.getContext("2d")!;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.translate(canvas.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvasCtx.restore();

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const drawingUtils = new DrawingUtils(canvasCtx);
        const mirroredLandmarks = landmarks.map((lm) => ({
          ...lm,
          x: 1 - lm.x,
        }));
        drawingUtils.drawConnectors(
          mirroredLandmarks,
          HandLandmarker.HAND_CONNECTIONS,
          { color: "#00FF00", lineWidth: 5 }
        );
        drawingUtils.drawLandmarks(mirroredLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });

        // '측정 중' 상태일 때만 주먹 감지 로직 실행
        // ===== 수정된 부분 =====
        // React state 대신 ref를 사용하여 최신 상태를 확인합니다.
        if (gameStateRef.current === "measuring") {
          // =======================
          const fingerStates = [
            landmarks[8].y > landmarks[6].y, // 검지
            landmarks[12].y > landmarks[10].y, // 중지
            landmarks[16].y > landmarks[14].y, // 약지
            landmarks[20].y > landmarks[18].y, // 소지
          ];

          const isFistClosed = fingerStates.every((state) => state === true);
          const openFingerCount = fingerStates.filter(
            (state) => state === false
          ).length;
          const isHandOpen = openFingerCount >= 3;

          if (!isFistState.current && isFistClosed) {
            setPunchCount((prev) => prev + 1);
            isFistState.current = true;
            console.log("👊 Fist detected! Count:", punchCount + 1);
          } else if (isFistState.current && isHandOpen) {
            isFistState.current = false;
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* 비디오는 숨기고 캔버스에 모든 것을 그림 */}
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
      <canvas
        ref={canvasRef}
        className="w-full aspect-video rounded-lg bg-gray-900" // 로딩 중 배경
        width={1280}
        height={720}
      />

      {/* 상태별 UI 렌더링 */}
      {gameState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold z-20 bg-black bg-opacity-75 text-white rounded-lg">
          카메라와 모델을 준비 중입니다...
        </div>
      )}

      {gameState === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold z-20 bg-black bg-opacity-50 text-white rounded-lg">
          {countdown > 0 ? countdown : "시작!"}
        </div>
      )}

      {gameState === "measuring" && (
        <>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded">
            주먹을 최대한 많이 쥐었다 폈다 하세요! ({timeLeft}초)
          </div>
          <div className="absolute top-4 right-4 text-xl font-bold text-white bg-black bg-opacity-50 px-3 py-1 rounded">
            횟수: {punchCount}
          </div>
          <div className="absolute bottom-4 left-0 w-full px-4">
            <div className="bg-gray-300 h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-4 transition-all duration-500"
                style={{ width: `${(timeLeft / targetSeconds) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {gameState === "finished" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-3xl font-bold z-20 bg-black bg-opacity-75 text-white rounded-lg">
          <p>측정 완료!</p>
          <p className="mt-2">총 횟수: {punchCount}</p>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
