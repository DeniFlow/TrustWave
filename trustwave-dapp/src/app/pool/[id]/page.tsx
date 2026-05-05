"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContract } from "@/lib/contract";
import { connectWallet } from "@/lib/connectWallet";
import { ethers } from "ethers";

const FEE_PERCENT = 2n;

export default function PublicPoolPage() {
  const params = useParams();
  const id = Number(params.id);

  const [pool, setPool] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPool = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const p = await contract.getPool(id);

    setPool({
      id: Number(p[1]),
      name: p[2],
      goal: p[3],
      totalDonated: p[4],
      raised: p[5],
      minDonation: p[6],
      isActive: p[7],
    });
  };

  useEffect(() => {
    if (!Number.isNaN(id)) loadPool();
  }, [id]);

  const parsedAmount = donationAmount ? BigInt(donationAmount) : 0n;

  const fee = (parsedAmount * FEE_PERCENT) / 100n;
  const toPool = parsedAmount - fee;

  const donate = async () => {
    if (parsedAmount <= 0n)
      return alert("Введите сумму в WEI");

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.donate(pool.id, message, {
        value: parsedAmount,
      });

      await tx.wait();

      setDonationAmount("");
      setMessage("");
      await loadPool();
    } finally {
      setLoading(false);
    }
  };

  if (!pool)
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-6 text-center">
          {pool.name}
        </h1>

        {/* INFO */}
        <div className="bg-[#11111a] border border-gray-800 p-6 rounded-xl">

          <p><b>ID:</b> {pool.id}</p>
          <p><b>Цель:</b> {pool.goal.toString()} WEI</p>
          <p><b>Собрано:</b> {pool.totalDonated.toString()} WEI</p>
          <p><b>Мин. донат:</b> {pool.minDonation.toString()} WEI</p>

          <p className="mt-3 text-gray-300">
            Комиссия: <b>2%</b>
          </p>

        </div>

        {/* CALCULATION */}
        {parsedAmount > 0n && (
          <div className="mt-4 bg-[#11111a] border border-gray-800 p-4 rounded-xl text-sm">
            <p>Комиссия: {fee} WEI</p>
            <p>Зачислится в пул: {toPool} WEI</p>
          </div>
        )}

        {/* DONATE */}
        {pool.isActive && (
          <div className="mt-8 bg-[#11111a] border border-gray-800 p-6 rounded-xl">

            <input
              placeholder="Сумма в WEI"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full mb-3 px-4 py-2 bg-black border border-gray-700 rounded"
            />

            <textarea
              placeholder="Сообщение"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mb-3 px-4 py-2 bg-black border border-gray-700 rounded"
            />

            <button
              onClick={donate}
              disabled={loading}
              className="w-full py-3 bg-green-600 rounded font-semibold"
            >
              {loading ? "Отправка..." : "Донатить"}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}