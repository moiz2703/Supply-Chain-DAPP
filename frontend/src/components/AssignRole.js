import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ROLES, ROLE_COLORS, ROLE_NUMBERS, shortenAddress } from "../utils/contract";

export default function AssignRole({ contract, account, isAdmin }) {
  const [address, setAddress]   = useState("");
  const [role, setRole]         = useState("1");
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkedRole, setCheckedRole] = useState(null);

  const checkRole = async () => {
    if (!contract || !address.startsWith("0x")) return toast.error("Enter a valid address.");
    setChecking(true);
    try {
      const r = await contract.getRole(address.trim());
      setCheckedRole(Number(r));
    } catch (e) {
      toast.error("Failed to fetch role.");
    }
    setChecking(false);
  };

  const handleAssign = async () => {
    if (!contract) return toast.error("Connect wallet first.");
    if (!isAdmin) return toast.error("Only admin can assign roles.");
    if (!address.startsWith("0x")) return toast.error("Invalid address.");

    setLoading(true);
    try {
      const tx = await contract.assignRole(address.trim(), Number(role));
      toast.loading("Assigning role...", { id: "assign" });
      await tx.wait();
      toast.dismiss("assign");
      toast.success(`Role "${ROLES[Number(role)]}" assigned to ${shortenAddress(address)}`);
      setCheckedRole(Number(role));
    } catch (e) {
      toast.dismiss("assign");
      const msg = e?.reason || e?.message || "Transaction failed";
      toast.error(msg.includes("Only admin") ? "Only admin can assign roles." : msg);
    }
    setLoading(false);
  };

  const ROLE_OPTIONS = [
    { value: "1", label: "Manufacturer" },
    { value: "2", label: "Distributor" },
    { value: "3", label: "Retailer" },
    { value: "4", label: "Customer" },
  ];

  return (
    <div>
      {!isAdmin && (
        <div className="alert alert-warning" style={{ maxWidth: 640, marginBottom: "1.5rem" }}>
          🔒 Only the <strong>admin</strong> can assign roles. Connect with the deployer wallet to access this page.
        </div>
      )}

      {/* Check Role Card */}
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">🔍 Check Any Address Role</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            className="form-input"
            type="text"
            placeholder="0x... (any Ethereum address)"
            value={address}
            onChange={e => { setAddress(e.target.value); setCheckedRole(null); }}
          />
          <button
            className="btn btn-secondary"
            onClick={checkRole}
            disabled={!address || checking}
            style={{ whiteSpace: "nowrap" }}
          >
            {checking ? <><span className="spinner" />Checking</> : "Check Role"}
          </button>
        </div>

        {checkedRole !== null && (
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--text2)", fontSize: 13 }}>Current role:</span>
            <span
              className="role-badge"
              style={{ background: ROLE_COLORS[checkedRole] }}
            >
              {ROLES[checkedRole]}
            </span>
          </div>
        )}
      </div>

      {/* Assign Role Card */}
      <div className="card" style={{ maxWidth: 640, opacity: isAdmin ? 1 : 0.5, pointerEvents: isAdmin ? "auto" : "none" }}>
        <div className="card-title">🛡 Assign Role (Admin Only)</div>

        <div className="form-group">
          <label className="form-label">Wallet Address</label>
          <input
            className="form-input"
            type="text"
            placeholder="0x..."
            value={address}
            onChange={e => { setAddress(e.target.value); setCheckedRole(null); }}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role to Assign</label>
          <select
            className="form-select"
            value={role}
            onChange={e => setRole(e.target.value)}
            disabled={loading}
          >
            {ROLE_OPTIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAssign}
          disabled={loading || !address || !isAdmin}
          style={{ width: "100%" }}
        >
          {loading ? <><span className="spinner" />Assigning...</> : `Assign ${ROLES[Number(role)]} Role`}
        </button>
      </div>

      {/* Role Guide */}
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">📋 Role Reference</div>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Can Do</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="role-badge" style={{ background: ROLE_COLORS[1] }}>Manufacturer</span></td>
              <td style={{ fontSize: 13, color: "var(--text2)" }}>Register products, Transfer to Distributor</td>
            </tr>
            <tr>
              <td><span className="role-badge" style={{ background: ROLE_COLORS[2] }}>Distributor</span></td>
              <td style={{ fontSize: 13, color: "var(--text2)" }}>Transfer products to Retailer</td>
            </tr>
            <tr>
              <td><span className="role-badge" style={{ background: ROLE_COLORS[3] }}>Retailer</span></td>
              <td style={{ fontSize: 13, color: "var(--text2)" }}>Transfer products to Customer</td>
            </tr>
            <tr>
              <td><span className="role-badge" style={{ background: ROLE_COLORS[4] }}>Customer</span></td>
              <td style={{ fontSize: 13, color: "var(--text2)" }}>Receive and view products</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}