"use client";

import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { address, connectWallet, logout } = useWallet();

  const isPoolPage = pathname.startsWith("/profile/pool");

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#0a0a0f] text-white">

      {/* LEFT */}
      <div className="flex gap-6">
        <button onClick={() => router.push("/")}>
          Главная
        </button>

        <button onClick={() => router.push("/profile")}>
          Профиль
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex gap-4 items-center">

        {address ? (
          <>
            <span className="text-gray-400 text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>

            {/* ❌ скрываем logout только на странице пула */}
            {!isPoolPage && (
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300"
              >
                Выйти
              </button>
            )}
          </>
        ) : (
          <button
            onClick={connectWallet}   // 🔥 ВОТ ЭТО ГЛАВНОЕ ИСПРАВЛЕНИЕ
            className="text-purple-400 hover:text-purple-300"
          >
            Подключить кошелек
          </button>
        )}

      </div>

    </header>
  );
}