import { useState } from "react";
import { createGroup, openGroup } from "../api/client";

export default function Home({ onEnterGroup }) {
  // create flow
  const [name, setName] = useState("Trip to Goa");
  const [createPass, setCreatePass] = useState(""); // optional

  // open flow
  const [openName, setOpenName] = useState("");
  const [openPass, setOpenPass] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    const group = await createGroup(name, createPass || undefined);
    onEnterGroup(group._id);
  }

  async function handleOpen(e) {
    e.preventDefault();
    if (!openName.trim()) return;
    const group = await openGroup(openName.trim(), openPass || undefined);
    onEnterGroup(group._id);
  }

  return (
    <div className="grid-2">
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
          Tip: Add a passphrase if you want only invited folks to open this group.
        </div>
      </form>

      <form onSubmit={handleOpen} className="card space-y-3">
        <div className="label">Open existing group by name</div>
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
        <div className="text-xs text-neutral-500">
          Case-insensitive name. If group has a passphrase, you must enter it.
        </div>
      </form>
    </div>
  );
}
