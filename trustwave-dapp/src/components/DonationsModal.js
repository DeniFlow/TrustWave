import React from 'react';
import Modal from './Modal';

const DonationsModal = ({ 
  isOpen, 
  onClose, 
  donationsList,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onSearch
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="История донатов">
      {/* Панель сортировки и поиска */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Сортировать по:</span>
          <div className="flex gap-2">
            <button 
              onClick={() => onSortByChange('date')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors border ${sortBy === 'date' ? 'bg-purple-600 border-purple-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
            >
              Дате
            </button>
            <button 
              onClick={() => onSortByChange('amount')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors border ${sortBy === 'amount' ? 'bg-purple-600 border-purple-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
            >
              Сумме
            </button>
            <button 
              onClick={() => onSortByChange('from')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors border ${sortBy === 'from' ? 'bg-purple-600 border-purple-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
            >
              Отправителю
            </button>
          </div>
        </div>
        
        <button 
          onClick={onSortOrderChange}
          className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors border border-gray-700"
        >
          {sortOrder === 'desc' ? '↓ По убыванию' : '↑ По возрастанию'}
        </button>
        
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="🔍 Поиск по имени или сообщению..."
            className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Список донатов */}
      <div className="space-y-3">
        {donationsList.map((donation) => (
          <div key={donation.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">👤 {donation.from}</span>
                  <span className="text-xs text-gray-500">{donation.date}</span>
                </div>
                <p className="text-gray-300 mt-1">"{donation.message}"</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-bold text-lg">
                  +{donation.amount} {donation.currency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default DonationsModal;