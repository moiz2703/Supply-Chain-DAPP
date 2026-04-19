import React, { useState } from "react";
import { STATUS_LABELS, STATUS_COLORS, ROLES, ROLE_COLORS, shortenAddress, formatTimestamp } from "../utils/contract";
import { toast } from "react-hot-toast";

export default function ProductHistory({ contract }) {
  const [productId, setProductId] = useState("");
  const [history, setHistory]     = useState([]);
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  const loadHistory = async () => {
    if (!contract || !productId) return;
    setLoading(true);
    setSearched(false);
    try {
      const p = await contract.getProduct(Number(productId));
      setProduct({
        id: Number(p.id),
        name: p.name,
        description: p.description,
        currentOwner: p.currentOwner,
        status: Number(p.status),
      });
      const h = await contract.getProductHistory(Number(productId));
      setHistory(h.map(e => ({
        from: e.from,
        to: e.to,
        status: Number(e.status),
        timestamp: e.timestamp,
        note: e.note,
      })));
      setSearched(true);
    } catch (e) {
      toast.error("Product not found or error fetching history.");
      setProduct(null);
      setHistory([]);
      setSearched(true);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-title">🔍 Product Audit Trail</div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <input
            className="form-input"
            type="number"
            min="1"
            placeholder="Enter Product ID (e.g. 1)"
            value={productId}
            onChange={e => { setProductId(e.target.value); setSearched(false); }}
            onKeyDown={e => e.key === "Enter" && loadHistory()}
          />
          <button
            className="btn btn-primary"
            onClick={loadHistory}
            disabled={!productId || loading}
            style={{ whiteSpace: "nowrap" }}
          >
            {loading ? <><span className="spinner" />Loading</> : "Get History"}
          </button>
        </div>

        {/* Product Summary */}
        {product && (
          <div style={{
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 3, letterSpacing: 1 }}>PRODUCT #{product.id}</div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>{product.name}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{product.description}</div>
              </div>
              <span
                className="status-badge"
                style={{
                  background: STATUS_COLORS[product.status] + "22",
                  color: STATUS_COLORS[product.status],
                  border: `1px solid ${STATUS_COLORS[product.status]}55`,
                  flexShrink: 0
                }}
              >
                {STATUS_LABELS[product.status]}
              </span>
            </div>
          </div>
        )}

        {/* Timeline */}
        {searched && history.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🕵️</span>
            <h3>No History Found</h3>
            <p>Check the product ID and try again.</p>
          </div>
        )}

        {history.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: 1 }}>
              {history.length} event{history.length > 1 ? "s" : ""} recorded
            </div>
            <div className="timeline">
              {history.map((entry, i) => (
                <div className="timeline-item" key={i}>
                  <div
                    className="timeline-dot"
                    style={{ background: STATUS_COLORS[entry.status] }}
                  />
                  <div className="timeline-time">{formatTimestamp(entry.timestamp)}</div>
                  <div className="timeline-note">
                    <span
                      className="status-badge"
                      style={{
                        background: STATUS_COLORS[entry.status] + "22",
                        color: STATUS_COLORS[entry.status],
                        border: `1px solid ${STATUS_COLORS[entry.status]}55`,
                        marginRight: 8
                      }}
                    >
                      {STATUS_LABELS[entry.status]}
                    </span>
                    {entry.note}
                  </div>
                  <div className="timeline-addresses">
                    {entry.from !== "0x0000000000000000000000000000000000000000" && (
                      <span>From: <span style={{ color: "var(--text)" }}>{shortenAddress(entry.from)}</span></span>
                    )}
                    {entry.from !== "0x0000000000000000000000000000000000000000" && (
                      <span style={{ color: "var(--border2)" }}>→</span>
                    )}
                    <span>To: <span style={{ color: "var(--accent)" }}>{shortenAddress(entry.to)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}