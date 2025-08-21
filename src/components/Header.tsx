import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white lg:px-36">
      <div>
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image src="/logo.png" alt="logo-image" width={45} height={49} />
          <div className="hidden md:block">NeuroBridge</div>
        </Link>
      </div>
      <nav className="flex gap-6 text-gray-700 font-medium">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          홈
        </Link>
        <Link
          href="/mesurement"
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
      </nav>
    </header>
  );
};

export default Header;
