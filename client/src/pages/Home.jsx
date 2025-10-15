import { useEffect, useState } from "react";
import { createGroup, openGroup, openByInvite } from "../api/client";

export default function Home({ onEnterGroup }) {
  // create flow
  const [name, setName] = useState("Trip to Goa");
  const [createPass, setCreatePass] = useState(""); // optional

  // open by name+pass
  const [openName, setOpenName] = useState("");
  const [openPass, setOpenPass] = useState("");

  // open by invite token
  const [inviteToken, setInviteToken] = useState("");

  // Auto-join if URL has ?invite=TOKEN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite");
    if (token) {
      openByInvite(token)
        .then((g) => onEnterGroup(g._id))
        .catch(() => {
          // ignore error; keep page visible
        });
    }
  }, [onEnterGroup]);

  async function handleCreate(e) {
    e.preventDefault();
    const group = await createGroup(name, createPass || undefined);
    onEnterGroup(group._id);
  }

  async function handleOpenByName(e) {
    e.preventDefault();
    if (!openName.trim()) return;
    const group = await openGroup(openName.trim(), openPass || undefined);
    onEnterGroup(group._id);
  }

  async function handleOpenByInvite(e) {
    e.preventDefault();
    if (!inviteToken.trim()) return;
    const group = await openByInvite(inviteToken.trim());
    onEnterGroup(group._id);
  }

  return (
    <div className="grid-2">
      {/* Create */}
      <form onSubmit={handleCreate} className="card space-y-3">
        <div className="label">Create a new group</div>
        <input
          className="input w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
        />
        <input
          className="input w-full"
          value={createPass}
          onChange={(e) => setCreatePass(e.target.value)}
          placeholder="(Optional) Passphrase"
        />
        <button className="btn btn-primary" type="submit">
          Create group
        </button>
        <div className="text-xs text-neutral-500">
          You can protect a group with a simple passphrase.
        </div>
      </form>

      <div className="space-y-4">
        {/* Open by name */}
        <form onSubmit={handleOpenByName} className="card space-y-3">
          <div className="label">Open existing group (Name + Passphrase)</div>
          <input
            className="input w-full"
            value={openName}
            onChange={(e) => setOpenName(e.target.value)}
            placeholder="Group name"
          />
          <input
            className="input w-full"
            value={openPass}
            onChange={(e) => setOpenPass(e.target.value)}
            placeholder="Passphrase (if set)"
          />
          <button className="btn btn-secondary" type="submit">
            Open
          </button>
        </form>

        {/* Open by invite token */}
        <form onSubmit={handleOpenByInvite} className="card space-y-3">
          <div className="label">Join via invite token</div>
          <input
            className="input w-full"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            placeholder="Paste token (e.g. AB23CD45)"
          />
          <button className="btn btn-secondary" type="submit">
            Join
          </button>
          <div className="text-xs text-neutral-500">
            Or just open the link someone shared with <code>?invite=TOKEN</code>.
          </div>
        </form>
      </div>
    </div>
  );
}
