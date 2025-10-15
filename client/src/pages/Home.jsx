import { useState } from "react"
import { createGroup, getGroup } from "../api/client"

export default function Home({ onEnterGroup }) {
  const [name, setName] = useState("Trip to Goa")
  const [openId, setOpenId] = useState("")

  async function handleCreate(e) {
    e.preventDefault()
    const group = await createGroup(name)
    onEnterGroup(group._id)
  }

  async function handleOpen(e) {
    e.preventDefault()
    if (!openId.trim()) return
    const g = await getGroup(openId.trim())
    if (g && g._id) onEnterGroup(g._id)
  }

  return (
    <div className="grid-2">
      <form onSubmit={handleCreate} className="card space-y-3">
        <div className="label">Create a new group</div>
        <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="Group name" />
        <button className="btn btn-primary" type="submit">Create group</button>
      </form>

      <form onSubmit={handleOpen} className="card space-y-3">
        <div className="label">Open existing group by ID</div>
        <input className="input w-full" value={openId} onChange={e=>setOpenId(e.target.value)} placeholder="Group ID" />
        <button className="btn btn-secondary" type="submit">Open</button>
      </form>
    </div>
  )
}
