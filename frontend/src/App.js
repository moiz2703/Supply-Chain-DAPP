import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Toaster, toast } from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ROLES, ROLE_COLORS } from "./utils/contract";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import RegisterProduct from "./components/RegisterProduct";
import TransferOwnership from "./components/TransferOwnership";
import ProductHistory from "./components/ProductHistory";
import AssignRole from "./components/AssignRole";
import "./App.css";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [userRole, setUserRole] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [connecting, setConnecting] = useState(false);

  const loadUserData = useCallback(async (contractInstance, signerAddress) => {
    try {
      const role = await contractInstance.getRole(signerAddress);
      setUserRole(Number(role));
      const admin = await contractInstance.admin();
      setIsAdmin(admin.toLowerCase() === signerAddress.toLowerCase());
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found! Please install it.");
      return;
    }
    setConnecting(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(address);

      await loadUserData(contractInstance, address);
      toast.success("Wallet connected!");
    } catch (e) {
      toast.error("Connection failed: " + (e.message || "Unknown error"));
    }
    setConnecting(false);
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setSigner(null);
        setContract(null);
        setUserRole(0);
        setIsAdmin(false);
      } else {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const address = await web3Signer.getAddress();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(contractInstance);
        setAccount(address);
        await loadUserData(contractInstance, address);
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [loadUserData]);

  const pages = {
    dashboard: <Dashboard contract={contract} account={account} />,
    register: <RegisterProduct contract={contract} account={account} />,
    transfer: <TransferOwnership contract={contract} account={account} userRole={userRole} />,
    history: <ProductHistory contract={contract} />,
    assign: <AssignRole contract={contract} account={account} isAdmin={isAdmin} />,
  };

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Header
        account={account}
        userRole={userRole}
        isAdmin={isAdmin}
        activePage={activePage}
        setActivePage={setActivePage}
        connectWallet={connectWallet}
        connecting={connecting}
      />
      <main className="main-content">
        {!account ? (
          <div className="connect-prompt">
            <div className="connect-card">
              <div className="chain-icon">⛓</div>
              <h2>Abdul's Supply Chain DApp</h2>
              <p>Connect your MetaMask wallet to interact with the supply chain on Polygon Mumbai.</p>
              <button className="btn-connect-large" onClick={connectWallet} disabled={connecting}>
                {connecting ? "Connecting..." : "Connect MetaMask"}
              </button>
              <p className="network-note">⚠ Make sure you are on <strong>Polygon Mumbai</strong> network</p>
            </div>
          </div>
        ) : (
          <div className="page-wrapper">
            <div className="role-banner" style={{ borderColor: ROLE_COLORS[userRole] }}>
              <span>Your Role:</span>
              <span className="role-badge" style={{ background: ROLE_COLORS[userRole] }}>
                {isAdmin ? "👑 Admin + " : ""}{ROLES[userRole]}
              </span>
            </div>
            {pages[activePage]}
          </div>
        )}
      </main>
      <footer className="footer">
        <p>Abdul's Supply Chain DApp &mdash; Built on Polygon Mumbai &mdash; Powered by Solidity & Ethers.js</p>
      </footer>
    </div>
  );
}