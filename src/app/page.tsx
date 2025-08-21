"use client";

import Header from "@/components/Header";
import Card from "@/components/Card";

import old1 from "@/assets/image/old1.png";
import old2 from "@/assets/image/old2.png";
import old3 from "@/assets/image/old3.png";
import { useState } from "react";
import Modal from "@/components/Modal";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Header />
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-slate-800 mb-6 break-keep">
          간편한 손동작 측정으로 뇌질환 위험,
          <br />
          미리 대비하세요.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto break-keep">
          뉴럴브릿지는 매일 간단한 손동작을 측정하고 기록하여 뇌 건강의 변화를
          추적하고, <br></br>질환의 위험 신호를 조기에 발견할 수 있도록 돕는
          서비스입니다.
        </p>
      </section>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-[100px] justify-center items-center">
          <Card phrase="행동분석이 필요한 부분을 찾습니다." image={old1} />
          <Card
            phrase="테스트를 통해 뇌 건강 신호를 확인합니다."
            image={old2}
          />
          <Card phrase="행동분석 결과를 분석합니다." image={old3} />
        </div>
        <div
          className="flex items-center justify-center cursor-pointer mt-[50px] mb-[40px] w-[300px] md:w-[700px] h-[56px] bg-[#4E3A00] rounded-2xl"
          onClick={toggleMenu}
        >
          <div className="text-[#ffffff]">측정 시작하기</div>
        </div>

        {isOpen && <Modal closeMenu={closeMenu} />}
      </div>
    </div>
  );
}
