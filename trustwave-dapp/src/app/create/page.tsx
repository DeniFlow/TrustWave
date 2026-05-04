"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";

export default function CreatePool() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [minDonate, setMinDonate] = useState("");
  const [loading, setLoading] = useState(false);

  const createPool = async () => {
    if (!name || !goal || !minDonate) {
      return alert("Заполни все поля (в Wei)");
    }

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      // ✅ теперь напрямую в Wei
      const goalWei = BigInt(goal);
      const minWei = BigInt(minDonate);

      const tx = await contract.addDonationPool(
        name,
        goalWei,
        minWei
      );

      await tx.wait();

      alert("✅ Пул создан!");
      window.location.href = "/";
    } catch (err: any) {
      console.error(err);
      alert("❌ Ошибка: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Создание пула донатов
        </h1>

        <input
          placeholder="Название пула"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md"
        />

        <input
          placeholder="Цель (Wei)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md"
        />

        <input
          placeholder="Минимальный донат (Wei)"
          value={minDonate}
          onChange={(e) => setMinDonate(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md"
        />

        <button
          onClick={createPool}
          disabled={loading}
          className={`w-full py-2 text-white rounded-lg ${
            loading ? "bg-gray-500" : "bg-blue-600"
          }`}
        >
          {loading ? "Создание..." : "Создать пул"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 text-sm text-gray-600"
        >
          ← Назад
        </button>
      </div>
    </main>
  );
}