import { useState } from "react"

export default function AddMemberForm({ onAdd }) {
  const [name, setName] = useState("")

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim())
    setName("")
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="font-semibold">Add member</div>
      <input className="input w-full" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Alice" />
      <button className="btn btn-primary" type="submit">Add</button>
    </form>
  )
}
