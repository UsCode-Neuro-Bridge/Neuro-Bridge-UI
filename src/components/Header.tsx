"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react"; // useState, useEffect import

const Header = () => {
  // 로그인 상태를 관리하는 state.
  // 실제 애플리케이션에서는 이 부분을 Context, Zustand 같은 전역 상태나
  // 쿠키, 세션 등을 확인하는 로직으로 대체해야 합니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트가 처음 로딩될 때 로그인 상태를 확인하는 로직 (예시)
  // 지금은 localStorage를 사용하지만, 실제로는 서버에 유효한 토큰이 있는지 확인해야 합니다.
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 실제로는 로그아웃 API 호출 및 토큰/세션 제거 로직이 필요합니다.
    localStorage.removeItem("user-token");
    setIsLoggedIn(false);
    // 필요하다면 로그인 페이지로 이동
    // window.location.href = '/login';
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white lg:px-36 shadow-sm">
      <div>
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image src="/logo.png" alt="logo-image" width={45} height={49} />
          <div className="hidden md:block font-bold text-lg text-gray-800">
            NeuroBridge
          </div>
        </Link>
      </div>
      <nav className="flex items-center gap-6 text-gray-700 font-medium">
        {isLoggedIn ? (
          // ✅ 로그인 했을 때 보여줄 메뉴
          <>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              홈
            </Link>
            <Link
              href="/mesurement" // 'mesurement' -> 'measurement' 오타 수정
              className="hover:text-blue-600 transition-colors"
            >
              측정
            </Link>
            <Link
              href="/calendar"
              className="hover:text-blue-600 transition-colors"
            >
              달력
            </Link>
            <Link
              href="/my-profile"
              className="hover:text-blue-600 transition-colors"
            >
              마이프로필
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          // ❌ 로그인 안 했을 때 보여줄 메뉴
          <>
            <Link
              href="/signin"
              className="hover:text-blue-600 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
