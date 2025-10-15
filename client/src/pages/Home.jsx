import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup, openGroup, openByInvite } from "../api/client";

export default function Home() {
  const navigate = useNavigate();

  const [name, setName] = useState("Trip to Goa");
  const [createPass, setCreatePass] = useState("");
  const [openName, setOpenName] = useState("");
  const [openPass, setOpenPass] = useState("");
  const [inviteToken, setInviteToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite");
    if (token) {
      openByInvite(token)
        .then((g) => navigate(`/group/${g._id}`))
        .catch(() => {});
    }
  }, [navigate]);

  async function handleCreate(e) {
    e.preventDefault();
    const group = await createGroup(name, createPass || undefined);
    navigate(`/group/${group._id}`);
  }

  async function handleOpenByName(e) {
    e.preventDefault();
    if (!openName.trim()) return;
    const group = await openGroup(openName.trim(), openPass || undefined);
    navigate(`/group/${group._id}`);
  }

  async function handleOpenByInvite(e) {
    e.preventDefault();
    if (!inviteToken.trim()) return;
    const group = await openByInvite(inviteToken.trim());
    navigate(`/group/${group._id}`);
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

        {/* Open by invite */}
        <form onSubmit={handleOpenByInvite} className="card space-y-3">
          <div className="label">Join via invite token</div>
          <input
            className="input w-full"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            placeholder="Paste invite token"
          />
          <button className="btn btn-secondary" type="submit">
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
