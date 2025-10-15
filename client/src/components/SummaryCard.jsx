function rupees(paise) {
  if (paise == null) return "-"
  return "₹ " + (paise / 100).toFixed(2)
}

export default function SummaryCard({ members, summary }) {
  if (!summary) return <div className="card">No summary</div>

  const { balances = {}, paid = {}, owed = {}, totals = {} } = summary

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Summary</div>
        <div className="text-sm text-neutral-600">Total: <b>{rupees(totals.totalExpenses)}</b></div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2">Member</th>
              <th className="py-2">Paid</th>
              <th className="py-2">Owes (fair share)</th>
              <th className="py-2">Net</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const id = m._id
              const net = balances[id] || 0
              return (
                <tr key={id} className="border-t">
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">{rupees(paid[id] || 0)}</td>
                  <td className="py-2">{rupees(owed[id] || 0)}</td>
                  <td className={"py-2 " + (net >= 0 ? "text-emerald-700" : "text-rose-700")}>
                    {rupees(net)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-neutral-500 mt-2">Positive net = others owe them. Negative net = they owe others.</div>
    </div>
  )
}
