"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export default function OwnerPoolPage() {
  const params = useParams();
  const id = Number(params.id);

  const [pool, setPool] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [shareLink, setShareLink] = useState("");

  const [newMinDonation, setNewMinDonation] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPool = async () => {
    try {
      const { provider } = await connectWallet();
      const contract = getContract(provider);

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

      // загрузка донатов
      const dons = [];
      for (let i = 0; i < poolData.donationsCount; i++) {
        const d = await contract.getDonation(id, i);

        dons.push({
          donor: d[0],
          nickname: d[1],
          message: d[2],
          amount: d[3],
          timestamp: d[4],
        });
      }

      setDonations(dons);
    } catch (err) {
      console.error("Ошибка при загрузке пула:", err);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) loadPool();
  }, [id]);

  useEffect(() => {
    if (pool) {
      setShareLink(`${window.location.origin}/pool/${pool.id}`);
    }
  }, [pool]);

  // переключение активности
  const toggleActive = async () => {
    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.togglePoolActive(pool.id, !pool.isActive);
      await tx.wait();

      await loadPool();
    } catch (e) {
      console.error(e);
      alert("Ошибка при смене статуса");
    } finally {
      setLoading(false);
    }
  };

  // смена минимального доната
  const changeMinDonation = async () => {
    if (!newMinDonation) return alert("Введите сумму в WEI");

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.setMinDonation(
        pool.id,
        BigInt(newMinDonation) //  работаем в WEI
      );

      await tx.wait();

      setNewMinDonation("");
      await loadPool();
    } catch (e) {
      console.error(e);
      alert("Ошибка при изменении минимального доната");
    } finally {
      setLoading(false);
    }
  };

  if (!pool) return <p className="p-6">Загрузка пула...</p>;

  const percent =
    Number(pool.goal) > 0
      ? Math.min((Number(pool.totalDonated) / Number(pool.goal)) * 100, 100)
      : 0;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{pool.name}</h1>

      <p><b>Цель:</b> {ethers.formatEther(pool.goal)} ETH</p>
      <p><b>Собрано всего:</b> {ethers.formatEther(pool.totalDonated)} ETH</p>
      <p><b>Доступно к выводу:</b> {ethers.formatEther(pool.raised)} ETH</p>
      <p><b>Минимальный донат:</b> {ethers.formatEther(pool.minDonation)} ETH</p>

      <p>
        <b>Статус:</b>{" "}
        {pool.isActive ? (
          <span className="text-green-600">Активен</span>
        ) : (
          <span className="text-red-600">Отключён</span>
        )}
      </p>

      {/*  КНОПКИ УПРАВЛЕНИЯ */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={toggleActive}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {pool.isActive ? "Отключить пул" : "Активировать пул"}
        </button>
      </div>

      {/* 💰 смена минимального доната */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Новый минимум (WEI)"
          value={newMinDonation}
          onChange={(e) => setNewMinDonation(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={changeMinDonation}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Изменить
        </button>
      </div>

      <button
        onClick={() => (window.location.href = `/profile/pool/${pool.id}/withdraw`)}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Вывести средства
      </button>

      {/* Progress */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded h-3">
          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm mt-1">{percent.toFixed(2)}%</p>
      </div>

      {/* Share */}
      {shareLink && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <p className="font-semibold mb-1">Публичная ссылка:</p>

          <div className="flex gap-2 items-center">
            <p className="break-all text-gray-700">{shareLink}</p>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                alert("Ссылка скопирована!");
              }}
            >
              Копировать
            </button>
          </div>
        </div>
      )}

      {/* Донаты */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Донаты</h2>

      {donations.length === 0 ? (
        <p>Пока донатов нет.</p>
      ) : (
        donations.map((d, i) => (
          <div key={i} className="border rounded p-3 mb-2 bg-white shadow-sm">
            <p><b>Адрес:</b> {d.donor}</p>
            <p><b>Ник:</b> {d.nickname || "—"}</p>
            <p><b>Сумма:</b> {ethers.formatEther(d.amount)} ETH</p>
            <p><b>Сообщение:</b> {d.message || "—"}</p>
          </div>
        ))
      )}

      <button
        onClick={() => (window.location.href = "/profile")}
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded"
      >
        ← Назад в профиль
      </button>
    </main>
  );
}