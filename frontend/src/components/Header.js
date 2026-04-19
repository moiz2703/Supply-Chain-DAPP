import React from "react";
import { shortenAddress, ROLES, ROLE_COLORS } from "../utils/contract";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "register",   label: "Register Product" },
  { id: "transfer",   label: "Transfer" },
  { id: "history",    label: "Audit Trail" },
  { id: "assign",     label: "Assign Role" },
];

export default function Header({ account, userRole, isAdmin, activePage, setActivePage, connectWallet, connecting }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <span className="logo-title">Abdul's Supply Chain</span>
          <span className="logo-sub">Polygon Amoy · DApp</span>
        </div>

        {/* Nav */}
        {account && (
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${activePage === item.id ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Wallet */}
        <div className="wallet-info">
          {account ? (
            <>
              <span
                className="role-badge"
                style={{ background: ROLE_COLORS[userRole] }}
              >
                {isAdmin ? "👑 " : ""}{ROLES[userRole]}
              </span>
              <span className="wallet-address">{shortenAddress(account)}</span>
            </>
          ) : (
            <button className="btn-connect" onClick={connectWallet} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}