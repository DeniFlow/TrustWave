"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

type WalletContextType = {
  address: string | null;
  signer: any;
  connectWallet: () => Promise<void>;
  logout: () => void;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  signer: null,
  connectWallet: async () => {},
  logout: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  // ✅ ПОДКЛЮЧЕНИЕ КОШЕЛЬКА (ИСПРАВЛЕНО)
  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        alert("MetaMask не установлен");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);

      // 🔥 ВАЖНО: именно это открывает MetaMask
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);

    } catch (err) {
      console.error("Ошибка подключения:", err);
    }
  };

  // ✅ ВЫХОД
  const logout = () => {
    setAddress(null);
    setSigner(null);
  };

  // ✅ СЛУШАЕМ СМЕНУ АККАУНТА В METAMASK
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handler = (accounts: string[]) => {
      if (accounts.length === 0) {
        logout();
      } else {
        setAddress(accounts[0]);
      }
    };

    ethereum.on("accountsChanged", handler);

    return () => {
      ethereum.removeListener("accountsChanged", handler);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, signer, connectWallet, logout }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);