import React, { useState, useEffect, useCallback } from "react";
import { STATUS_LABELS, STATUS_COLORS, ROLES, ROLE_COLORS, shortenAddress } from "../utils/contract";

export default function Dashboard({ contract, account }) {
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myRole, setMyRole] = useState(0);

  const loadData = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const total = await contract.getTotalProducts();
      const count = Number(total);
      setTotalProducts(count);

      const role = await contract.getRole(account);
      setMyRole(Number(role));

      const all = [];
      for (let i = 1; i <= count; i++) {
        try {
          const p = await contract.getProduct(i);
          all.push({
            id: Number(p.id),
            name: p.name,
            description: p.description,
            currentOwner: p.currentOwner,
            status: Number(p.status),
          });
        } catch (_) {}
      }
      setProducts(all);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [contract, account]);

  useEffect(() => { loadData(); }, [loadData]);

  const manufactured = products.filter(p => p.status === 0).length;
  const inTransit    = products.filter(p => p.status === 1).length;
  const delivered    = products.filter(p => p.status === 2).length;
  const myProducts   = products.filter(p => p.currentOwner?.toLowerCase() === account?.toLowerCase()).length;

  return (
    <div>
      <div className="card">
        <div className="card-title">📊 Overview</div>
        <div className="grid-4">
          <div className="stat-card">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--amber)" }}>{manufactured}</div>
            <div className="stat-label">Manufactured</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--blue)" }}>{inTransit}</div>
            <div className="stat-label">In Transit</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--green)" }}>{delivered}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div className="card-title" style={{ marginBottom: 0 }}>📦 All Products</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="pill">You own: {myProducts}</span>
            <button className="btn btn-secondary" onClick={loadData} disabled={loading} style={{ padding: "6px 14px", fontSize: "12px" }}>
              {loading ? <><span className="spinner" />Loading</> : "↻ Refresh"}
            </button>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className="empty-state">
            <span className="spinner" style={{ width: 24, height: 24 }} />
            <p style={{ marginTop: "1rem" }}>Loading products from blockchain...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>No Products Yet</h3>
            <p>Products registered on the blockchain will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Current Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><span className="pill">#{p.id}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--text)" }}>{p.name}</td>
                    <td style={{ color: "var(--text2)" }}>{p.description}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          color: p.currentOwner?.toLowerCase() === account?.toLowerCase()
                            ? "var(--accent)"
                            : "var(--text2)"
                        }}
                      >
                        {p.currentOwner?.toLowerCase() === account?.toLowerCase()
                          ? "👤 You"
                          : shortenAddress(p.currentOwner)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: STATUS_COLORS[p.status] + "22",
                          color: STATUS_COLORS[p.status],
                          border: `1px solid ${STATUS_COLORS[p.status]}55`
                        }}
                      >
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}