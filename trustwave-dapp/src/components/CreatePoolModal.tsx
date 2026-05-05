"use client";

import React, { useState } from "react";
import Modal from "./Modal";

const CreatePoolModal = ({ isOpen, onClose, onCreatePool }) => {
  const [name, setName] = useState("");
  const [goalWei, setGoalWei] = useState("");
  const [minWei, setMinWei] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!name || !goalWei || !minWei) {
        alert("Заполните все поля");
        return;
      }

      const goal = BigInt(goalWei);
      const min = BigInt(minWei);

      if (goal <= 0n || min <= 0n) {
        alert("WEI должен быть больше 0");
        return;
      }

      if (min > goal) {
        alert("Мин. донат не может быть больше цели");
        return;
      }

      setLoading(true);

      await onCreatePool({
        name,
        goalInWei: goal,
        minValueDonateInWei: min,
      });

      setName("");
      setGoalWei("");
      setMinWei("");

      onClose();
    } catch (e) {
      console.error(e);
      alert("Ошибка создания пула");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создание донатпула">
      <div className="space-y-4">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
          className="w-full px-3 py-2 bg-gray-800 text-white rounded"
        />

        <input
          value={goalWei}
          onChange={(e) => setGoalWei(e.target.value)}
          placeholder="Цель (WEI)"
          className="w-full px-3 py-2 bg-gray-800 text-white rounded"
        />

        <input
          value={minWei}
          onChange={(e) => setMinWei(e.target.value)}
          placeholder="Мин. донат (WEI)"
          className="w-full px-3 py-2 bg-gray-800 text-white rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 py-2 rounded font-semibold"
        >
          {loading ? "Создание..." : "Создать"}
        </button>

      </div>
    </Modal>
  );
};

export default CreatePoolModal;