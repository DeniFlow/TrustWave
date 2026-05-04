"use client";

import { useEffect, useState } from "react";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export default function ProfilePage() {
  const [address, setAddress] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [newNickname, setNewNickname] = useState<string>("");
  const [createdPools, setCreatedPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  //  подключение кошелька
  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask не установлен");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  };

  //  загрузка профиля
  const loadProfile = async () => {
    try {
      const { provider, address } = await connectWallet();
      setAddress(address);

      const contract = getContract(provider);

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
      console.error("Ошибка загрузки профиля:", e);
    }
  };

  //  смена ника
  const changeNickname = async () => {
    if (!newNickname.trim()) return;

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.setNickname(newNickname);
      await tx.wait();

      setNewNickname("");
      await loadProfile();
    } catch (e) {
      console.error(e);
      alert("Ошибка смены ника");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="p-6 font-sans max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Профиль</h1>

      {!address ? (
        <p>Подключение...</p>
      ) : (
        <>
          {/*  Инфа о пользователе */}
          <div className="border p-4 rounded-lg bg-white shadow mb-6">
            <p><b>Адрес:</b> {address}</p>
            <p><b>Ник:</b> {nickname || "—"}</p>

            <div className="mt-4 flex gap-2">
              <input
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="Новый ник"
                className="border px-3 py-1 rounded w-full"
              />
              <button
                onClick={changeNickname}
                className="bg-indigo-600 text-white px-4 rounded"
              >
                Сменить
              </button>
            </div>
          </div>

          {/*  Пулы */}
          <h2 className="text-2xl font-semibold mb-4">Ваши пулы</h2>

          {createdPools.length === 0 ? (
            <p className="text-gray-500">Нет созданных пулов</p>
          ) : (
            createdPools.map((p, i) => (
              <div key={i} className="border p-4 rounded-lg mb-4 bg-white shadow">
                <p className="text-xl font-bold">{p[2]}</p>

                <p>ID: {Number(p[1])}</p>

                <p>
                  Цель: {ethers.formatEther(p[3])} ETH
                </p>

                <p>
                  Собрано: {ethers.formatEther(p[4])} ETH
                </p>

                <p>
                   Доступно к выводу:{" "}
                  <b>{ethers.formatEther(p[5])} ETH</b>
                </p>

                <p>
                  Мин. донат: {ethers.formatEther(p[6])} ETH
                </p>

                <p>
                  Статус:{" "}
                  {p[7] ? (
                    <span className="text-green-600">Активен</span>
                  ) : (
                    <span className="text-red-600">Отключен</span>
                  )}
                </p>

                {/*  КНОПКА ПОДРОБНЕЕ */}
                <button
                  onClick={() =>
                    (window.location.href = `/profile/pool/${Number(p[1])}`)
                  }
                  className="mt-3 bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Подробнее
                </button>
              </div>
            ))
          )}

          {/* создать пул */}
          <button
            onClick={() => (window.location.href = "/create")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Создать пул
          </button>

          {/* назад */}
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 bg-gray-800 text-white px-4 py-2 rounded"
          >
            Назад
          </button>
        </>
      )}
    </main>
  );
}