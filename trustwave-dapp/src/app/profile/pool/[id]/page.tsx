"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";

export default function OwnerPoolPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [address, setAddress] = useState<string | null>(null);
  const [pool, setPool] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [shareLink, setShareLink] = useState("");

  const [newMinDonation, setNewMinDonation] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD =================

  const loadPool = async () => {
    try {
      const wallet = await connectWallet();

      if (!wallet?.provider || !wallet?.address) {
        setAddress(null);
        setPool(null);
        setDonations([]);
        return;
      }

      setAddress(wallet.address);

      const contract = getContract(wallet.provider);
      const p = await contract.getPool(id);

      const poolData = {
        owner: p[0],
        id: Number(p[1]),
        name: p[2],
        goal: p[3],
        totalDonated: p[4],
        raised: p[5],
        minDonation: p[6],
        isActive: p[7],
        donationsCount: Number(p[8]),
      };

      setPool(poolData);
      setShareLink(`${window.location.origin}/pool/${poolData.id}`);

      const dons = [];

      for (let i = 0; i < poolData.donationsCount; i++) {
        const d = await contract.getDonation(id, i);

        dons.push({
          nickname: d[1],
          message: d[2],
          amount: d[3],
        });
      }

      setDonations(dons);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) loadPool();
  }, [id]);

  // ================= ACTIONS =================

  const toggleActive = async () => {
    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.togglePoolActive(
        pool.id,
        !pool.isActive
      );

      await tx.wait();
      await loadPool();
    } finally {
      setLoading(false);
    }
  };

  const changeMinDonation = async () => {
    if (!newMinDonation) return alert("Введите WEI");

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.setMinDonation(
        pool.id,
        BigInt(newMinDonation)
      );

      await tx.wait();

      setNewMinDonation("");
      await loadPool();
    } finally {
      setLoading(false);
    }
  };

  // ================= GUARD =================

  if (!address) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        Кошелек не подключен
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  const percent =
    Number(pool.goal) > 0
      ? Math.min(
          (Number(pool.totalDonated) / Number(pool.goal)) * 100,
          100
        )
      : 0;

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{pool.name}</h1>

        <button
          onClick={() => router.push("/profile")}
          className="text-gray-400 hover:text-white"
        >
          ← Назад
        </button>
      </div>

      {/* INFO */}
      <div className="bg-[#11111a] border border-gray-800 p-6 rounded-xl">

        <p>ID: {pool.id}</p>

        <p>Цель: {pool.goal} WEI</p>
        <p>Собрано: {pool.totalDonated} WEI</p>
        <p>Доступно: {pool.raised} WEI</p>

        <p>Мин. донат: {pool.minDonation} WEI</p>

        <p className="mt-2">
          Статус:{" "}
          {pool.isActive ? (
            <span className="text-green-500">Активен</span>
          ) : (
            <span className="text-red-500">Отключён</span>
          )}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">

          <button
            onClick={toggleActive}
            className="bg-yellow-600 px-4 py-2 rounded"
          >
            {pool.isActive ? "Отключить" : "Активировать"}
          </button>

          <button
            onClick={() =>
              router.push(`/profile/pool/${pool.id}/withdraw`)
            }
            className="bg-green-600 px-4 py-2 rounded"
          >
            Вывести
          </button>

        </div>

      </div>

      {/* MIN DONATION (ВЫШЕ SHARE) */}
      <div className="mt-6 flex gap-2">

        <input
          value={newMinDonation}
          onChange={(e) => setNewMinDonation(e.target.value)}
          placeholder="Мин. донат (WEI)"
          className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded"
        />

        <button
          onClick={changeMinDonation}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Изменить
        </button>

      </div>

      {/* SHARE */}
      <div className="mt-6 bg-[#11111a] border border-gray-800 p-4 rounded-xl">

        <p className="text-sm text-gray-400 mb-2">
          Публичная ссылка
        </p>

        <div className="flex gap-2">

          <input
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded"
          />

          <button
            onClick={() =>
              navigator.clipboard.writeText(shareLink)
            }
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Копировать
          </button>

        </div>

      </div>

      {/* PROGRESS */}
      <div className="mt-6">
        <div className="w-full bg-gray-800 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-sm mt-1">{percent.toFixed(2)}%</p>
      </div>

      {/* DONATIONS */}
      <h2 className="text-xl font-bold mt-8 mb-4">
        Донаты
      </h2>

      <div className="space-y-3">

        {donations.length === 0 ? (
          <p className="text-gray-400">Нет донатов</p>
        ) : (
          donations.map((d, i) => (
            <div
              key={i}
              className="bg-[#11111a] border border-gray-800 p-4 rounded-xl"
            >

              <p className="text-purple-300 font-semibold text-lg">
                {d.nickname || "Аноним"}
              </p>

              <p className="text-green-400 font-bold text-lg mt-1">
                {d.amount} WEI
              </p>

              <p className="text-xl mt-3 text-white">
                {d.message || "—"}
              </p>

            </div>
          ))
        )}

      </div>

    </div>
  );
}