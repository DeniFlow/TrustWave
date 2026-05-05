import { ethers } from "ethers";

const getEthereum = () => {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum;
};

export const connectWallet = async () => {
  const ethereum = getEthereum();

  if (!ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  if (typeof window !== "undefined") {
    localStorage.setItem("tw_address", address);
  }

  return { provider, signer, address };
};

export const restoreSession = async () => {
  if (typeof window === "undefined") return null;

  const ethereum = getEthereum();
  if (!ethereum) return null;

  const saved = localStorage.getItem("tw_address");
  if (!saved) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  if (address.toLowerCase() !== saved.toLowerCase()) return null;

  return { provider, signer, address };
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tw_address");
  }
};