"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";

const FEE_PERCENT = 2n;

export default function Withdraw() {
  const params = useParams();
  const poolId = Number(params.id);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedAmount = amount ? BigInt(amount) : 0n;

  const fee = (parsedAmount * FEE_PERCENT) / 100n;
  const received = parsedAmount - fee;

  const withdraw = async () => {
    if (parsedAmount <= 0n)
      return alert("Введите сумму в WEI");

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.withdrawFromPool(
        parsedAmount,
        poolId
      );

      await tx.wait();

      alert("Успешно!");
      window.location.href = `/profile/pool/${poolId}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">

      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Вывод средств
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Пул #{poolId}
        </p>

        <input
          placeholder="Сумма в WEI"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
        />

        {/* INFO BLOCK */}
        {parsedAmount > 0n && (
          <div className="mb-4 text-sm text-gray-300">
            <p>Комиссия: {fee} WEI (2%)</p>
            <p>Вы получите: {received} WEI</p>
          </div>
        )}

        <button
          onClick={withdraw}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-yellow-600 font-semibold"
        >
          {loading ? "Выполняется..." : "Вывести"}
        </button>

      </div>

    </div>
  );
}