import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ROLES, STATUS_LABELS, STATUS_COLORS, shortenAddress } from "../utils/contract";

export default function TransferOwnership({ contract, account, userRole }) {
  const [productId, setProductId]   = useState("");
  const [toAddress, setToAddress]   = useState("");
  const [note, setNote]             = useState("");
  const [loading, setLoading]       = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [checking, setChecking]     = useState(false);

  const checkProduct = async () => {
    if (!contract || !productId) return;
    setChecking(true);
    try {
      const p = await contract.getProduct(Number(productId));
      setProductInfo({
        id: Number(p.id),
        name: p.name,
        description: p.description,
        currentOwner: p.currentOwner,
        status: Number(p.status),
      });
    } catch (e) {
      toast.error("Product not found.");
      setProductInfo(null);
    }
    setChecking(false);
  };

  const handleTransfer = async () => {
    if (!contract) return toast.error("Connect wallet first.");
    if (!productId) return toast.error("Enter a product ID.");
    if (!toAddress.trim() || !toAddress.startsWith("0x")) return toast.error("Enter a valid address.");
    if (!note.trim()) return toast.error("Add a transfer note.");

    setLoading(true);
    try {
      const tx = await contract.transferOwnership(Number(productId), toAddress.trim(), note.trim());
      toast.loading("Waiting for confirmation...", { id: "transfer" });
      await tx.wait();
      toast.dismiss("transfer");
      toast.success("Ownership transferred successfully!");
      setProductId(""); setToAddress(""); setNote(""); setProductInfo(null);
    } catch (e) {
      toast.dismiss("transfer");
      const msg = e?.reason || e?.message || "";
      if (msg.includes("not the current owner")) toast.error("You are not the current owner of this product.");
      else if (msg.includes("Manufacturer can only")) toast.error("Manufacturer can only transfer to Distributor.");
      else if (msg.includes("Distributor can only")) toast.error("Distributor can only transfer to Retailer.");
      else if (msg.includes("Retailer can only")) toast.error("Retailer can only transfer to Customer.");
      else toast.error(msg || "Transfer failed.");
    }
    setLoading(false);
  };

  const isOwner = productInfo?.currentOwner?.toLowerCase() === account?.toLowerCase();

  const NEXT_ROLE = { 1: "Distributor", 2: "Retailer", 3: "Customer" };

  return (
    <div>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-title">🔄 Transfer Product Ownership</div>

        <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
          Chain: <strong>Manufacturer → Distributor → Retailer → Customer</strong>
          <br />
          {userRole >= 1 && userRole <= 3
            ? `As ${ROLES[userRole]}, you can transfer to a ${NEXT_ROLE[userRole]}.`
            : "Only Manufacturers, Distributors, and Retailers can transfer products."}
        </div>

        {/* Lookup */}
        <div className="form-group">
          <label className="form-label">Product ID</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={productId}
              onChange={e => { setProductId(e.target.value); setProductInfo(null); }}
              disabled={loading}
            />
            <button
              className="btn btn-secondary"
              onClick={checkProduct}
              disabled={!productId || checking}
              style={{ whiteSpace: "nowrap" }}
            >
              {checking ? <><span className="spinner" />Checking</> : "Check"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        {productInfo && (
          <div style={{
            background: "var(--bg3)",
            border: `1px solid ${isOwner ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.25rem",
            fontSize: 13
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <strong style={{ fontFamily: "var(--display)" }}>{productInfo.name}</strong>
              <span
                className="status-badge"
                style={{
                  background: STATUS_COLORS[productInfo.status] + "22",
                  color: STATUS_COLORS[productInfo.status],
                  border: `1px solid ${STATUS_COLORS[productInfo.status]}55`
                }}
              >
                {STATUS_LABELS[productInfo.status]}
              </span>
            </div>
            <div style={{ color: "var(--text2)", marginBottom: "0.4rem" }}>{productInfo.description}</div>
            <div style={{ color: "var(--text2)" }}>
              Owner: <span style={{ color: isOwner ? "var(--accent)" : "var(--text)" }}>
                {isOwner ? "👤 You" : shortenAddress(productInfo.currentOwner)}
              </span>
            </div>
            {!isOwner && (
              <div className="alert alert-warning" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                You are not the current owner. You cannot transfer this product.
              </div>
            )}
          </div>
        )}

        {/* Transfer Form */}
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input
            className="form-input"
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Transfer Note</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Shipped to regional distributor in Lahore"
            value={note}
            onChange={e => setNote(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleTransfer}
          disabled={loading || !productId || !toAddress || !note || (productInfo && !isOwner)}
          style={{ width: "100%" }}
        >
          {loading ? <><span className="spinner" />Transferring...</> : "Transfer Ownership"}
        </button>
      </div>
    </div>
  );
}