import React, { useState } from 'react';
import Modal from './Modal';

const CreatePoolModal = ({ isOpen, onClose, onCreatePool }) => {
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolAmount, setNewPoolAmount] = useState('');

  const handleSubmit = () => {
    if (!newPoolName.trim() || !newPoolAmount.trim()) {
      alert("Пожалуйста, заполните все поля!");
      return;
    }
    
    onCreatePool({
      name: newPoolName,
      amount: newPoolAmount,
      currency: 'ETH'
    });
    
    // Очищаем форму
    setNewPoolName('');
    setNewPoolAmount('');
    onClose();
  };

  const handleClose = () => {
    setNewPoolName('');
    setNewPoolAmount('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создание донатпула">
      <div className="space-y-6">
        {/* Поле для названия */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Название донатпула
          </label>
          <input 
            type="text" 
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            placeholder="Например: Пул на новый стримерский компьютер"
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
            autoFocus
          />
        </div>
        
        {/* Поле для суммы */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Целевая сумма (ETH)
          </label>
          <input 
            type="number" 
            value={newPoolAmount}
            onChange={(e) => setNewPoolAmount(e.target.value)}
            placeholder="Введите сумму в ETH"
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
            min="0"
            step="0.01"
          />
          <p className="text-gray-500 text-sm mt-1">Минимальная сумма: 0.01 ETH</p>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-300"
          >
            Создать
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 border border-gray-700"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePoolModal;