import { useMemo, useState } from "react"

function toPaise(x) {
  const n = Number(x || 0)
  return Math.round(n * 100)
}

export default function AddExpenseForm({ members, onAdd }) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [payerId, setPayerId] = useState("")
  const [selected, setSelected] = useState({})

  const canSubmit = useMemo(() => {
    const anyChecked = Object.values(selected).some(v => v?.checked)
    return description.trim() && amount && payerId && anyChecked
  }, [description, amount, payerId, selected])

  function toggleMember(id) {
    setSelected(s => ({ ...s, [id]: { checked: !(s[id]?.checked), ratio: s[id]?.ratio || 1 } }))
  }
  function changeRatio(id, val) {
    const v = Math.max(0.01, Number(val || 1))
    setSelected(s => ({ ...s, [id]: { checked: true, ratio: v } }))
  }

  async function submit(e) {
    e.preventDefault()
    const participants = Object.entries(selected)
      .filter(([,v]) => v?.checked)
      .map(([memberId, v]) => ({ memberId, shareRatio: Number(v.ratio || 1) }))

    const payload = { description: description.trim(), amount: toPaise(amount), payerId, participants }
    await onAdd(payload)
    setDescription(""); setAmount(""); setPayerId(""); setSelected({})
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="font-semibold">Add expense</div>
      <div className="grid-2">
        <div>
          <div className="label">Description</div>
          <input className="input w-full" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="e.g., Groceries" />
        </div>
        <div>
          <div className="label">Amount (₹)</div>
          <input type="number" min="0" step="0.01" className="input w-full" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" />
        </div>
      </div>

      <div>
        <div className="label mb-1">Payer</div>
        <select className="input w-full" value={payerId} onChange={(e)=>setPayerId(e.target.value)}>
          <option value="">Select</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>

      <div>
        <div className="label mb-2">Participants & Ratios</div>
        <div className="space-y-2">
          {members.map(m => {
            const sel = selected[m._id] || {}
            return (
              <div key={m._id} className="flex items-center gap-3">
                <input type="checkbox" checked={!!sel.checked} onChange={()=>toggleMember(m._id)} />
                <span className="w-28">{m.name}</span>
                <span className="label">Ratio</span>
                <input type="number" min="0.01" step="0.01" className="input w-24" value={sel.ratio || 1} onChange={(e)=>changeRatio(m._id, e.target.value)} />
              </div>
            )
          })}
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={!canSubmit}>Add expense</button>
    </form>
  )
}
