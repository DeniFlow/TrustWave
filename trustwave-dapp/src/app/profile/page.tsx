"use client";

import { useEffect, useState } from "react";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";
import CreatePoolModal from "../../components/CreatePoolModal";

export default function ProfilePage() {
  const router = useRouter();
  const { address, signer } = useWallet();

  const [nickname, setNickname] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [createdPools, setCreatedPools] = useState<any[]>([]);
  const [isCreatePoolOpen, setIsCreatePoolOpen] = useState(false);

  // ================= LOAD =================

  const loadProfile = async () => {
    if (!address || !signer) {
      setNickname("");
      setCreatedPools([]);
      return;
    }

    try {
      const contract = getContract(signer);

      const user = await contract.getUser(address);
      setNickname(user[0]);

      const poolIds = user[1].map((x: any) => Number(x));

      const pools = [];

      for (let id of poolIds) {
        const p = await contract.getPool(id);
        pools.push(p);
      }

      setCreatedPools(pools);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [address, signer]);

  // ================= CHANGE NICKNAME (FIXED) =================

  const handleChangeNickname = async () => {
    if (!newNickname) return alert("Введите ник");

    try {
      const contract = getContract(signer);

      // ✔️ ВАЖНО: твой контракт использует setNickname
      const tx = await contract.setNickname(newNickname);
      await tx.wait();

      setNewNickname("");
      await loadProfile();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Ошибка смены ника");
    }
  };

  // ================= CREATE =================

  const handleCreateDonationPool = async (data: any) => {
    try {
      const contract = getContract(signer);

      const tx = await contract.addDonationPool(
        data.name,
        data.goalInWei,
        data.minValueDonateInWei
      );

      await tx.wait();

      await loadProfile();
    } catch (e) {
      console.error(e);
    }
  };

  // ================= UI =================

  if (!address) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <h2 className="text-xl">Кошелек не подключен</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* TITLE */}
        <div className="text-center mt-10">
          <h1 className="text-5xl font-bold mb-3">TrustWave</h1>
           <p className="text-gray-400">Ваш профиль на платформе</p> </div>

        {/* PROFILE CARD */}
        <div className="mt-12 max-w-2xl mx-auto bg-[#11111a] border border-gray-800 p-6 rounded-xl">

          <p><b>Адрес:</b> {address}</p>
          <p className="mb-4"><b>Ник:</b> {nickname || "—"}</p>

          <div className="flex gap-2">
            <input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="Новый ник"
              className="flex-1 px-3 py-2 rounded bg-black border border-gray-700"
            />

            <button
              onClick={handleChangeNickname}
              className="px-4 py-2 bg-indigo-600 rounded"
            >
              Сменить
            </button>
          </div>

        </div>

        {/* POOLS */}
        <h2 className="text-2xl font-bold text-center mt-12 mb-6">
          Ваши пулы
        </h2>

        <div className="grid gap-4 max-w-3xl mx-auto">

          {createdPools.length === 0 ? (
            <p className="text-center text-gray-400">
              У вас пока нет донатпулов
            </p>
          ) : (
            createdPools.map((p, i) => (
              <div
                key={i}
                className="bg-[#11111a] border border-gray-800 p-5 rounded-xl"
              >
                <p className="text-xl font-bold mb-1">{p[2]}</p>

                <p className="text-gray-400 text-sm">
                  ID: {Number(p[1])}
                </p>

                {/* ✔️ WEI (как ты хотел) */}
                <p className="mt-2">
                  Цель: <b>{p[3].toString()} WEI</b>
                </p>

                <p>
                  Собрано: <b>{p[4].toString()} WEI</b>
                </p>

                <p className="mt-1">
                  Статус:{" "}
                  {p[7] ? (
                    <span className="text-green-500">Активен</span>
                  ) : (
                    <span className="text-red-500">Отключен</span>
                  )}
                </p>

                <button
                  onClick={() =>
                    router.push(`/profile/pool/${Number(p[1])}`)
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 rounded"
                >
                  Подробнее
                </button>

              </div>
            ))
          )}

        </div>

        {/* CREATE */}
        <div className="mt-16 text-center">

          <button
            onClick={() => setIsCreatePoolOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl font-bold"
          >
            Создать донатпул
          </button>

        </div>

      </div>

      <CreatePoolModal
        isOpen={isCreatePoolOpen}
        onClose={() => setIsCreatePoolOpen(false)}
        onCreatePool={handleCreateDonationPool}
      />

    </div>
  );
}