import { useState } from "react";

export default function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select text manually
    }
  }

  return (
    <div className="card w-full">
      <div className="label mb-1">{label}</div>
      <div className="flex gap-2">
        <input className="input w-full" value={value} readOnly />
        <button className="btn btn-primary" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="text-xs text-neutral-500 mt-1">
        Share this link—people can join instantly (no passphrase required).
      </div>
    </div>
  );
}
