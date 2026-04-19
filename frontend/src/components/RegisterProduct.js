import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function RegisterProduct({ contract, account }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRegistered, setLastRegistered] = useState(null);

  const handleRegister = async () => {
    if (!contract) return toast.error("Connect your wallet first.");
    if (!name.trim()) return toast.error("Product name is required.");
    if (!description.trim()) return toast.error("Description is required.");

    setLoading(true);
    try {
      const tx = await contract.registerProduct(name.trim(), description.trim());
      toast.loading("Transaction submitted, waiting for confirmation...", { id: "reg" });
      const receipt = await tx.wait();

      // Try to get product ID from events
      let productId = "?";
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === "ProductRegistered") {
              productId = parsed.args.productId.toString();
            }
          } catch (_) {}
        }
      }

      toast.dismiss("reg");
      toast.success(`Product registered! ID: #${productId}`);
      setLastRegistered({ name: name.trim(), description: description.trim(), id: productId, tx: tx.hash });
      setName("");
      setDescription("");
    } catch (e) {
      toast.dismiss("reg");
      const msg = e?.reason || e?.message || "Transaction failed";
      toast.error(msg.includes("Only Manufacturer") ? "Only Manufacturers can register products." : msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-title">📦 Register New Product</div>

        <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
          ⚠ Only addresses with the <strong>Manufacturer</strong> role can register products.
        </div>

        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Samsung Galaxy S24"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="e.g. 6.7-inch AMOLED smartphone with 200MP camera..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleRegister}
          disabled={loading || !name || !description}
          style={{ width: "100%" }}
        >
          {loading ? <><span className="spinner" />Registering on Blockchain...</> : "Register Product"}
        </button>
      </div>

      {lastRegistered && (
        <div className="card" style={{ maxWidth: 600, borderColor: "var(--green)" }}>
          <div className="card-title">✅ Last Registered</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: 13 }}>
            <div><span style={{ color: "var(--text2)" }}>Product ID: </span><span className="pill">#{lastRegistered.id}</span></div>
            <div><span style={{ color: "var(--text2)" }}>Name: </span><strong>{lastRegistered.name}</strong></div>
            <div><span style={{ color: "var(--text2)" }}>Description: </span>{lastRegistered.description}</div>
            <div>
              <span style={{ color: "var(--text2)" }}>Tx Hash: </span>
              <a
                href={`https://mumbai.polygonscan.com/tx/${lastRegistered.tx}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)", fontSize: 12, wordBreak: "break-all" }}
              >
                {lastRegistered.tx}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}