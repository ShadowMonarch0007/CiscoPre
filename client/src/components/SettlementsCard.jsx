function rupees(paise) {
  return "₹ " + (paise / 100).toFixed(2)
}

export default function SettlementsCard({ settlements, membersMap }) {
  return (
    <div className="card">
      <div className="font-semibold mb-2">Settle up</div>
      {(!settlements || settlements.length === 0) ? (
        <div className="text-sm text-neutral-500">No settlements needed.</div>
      ) : (
        <ul className="space-y-2">
          {settlements.map((s, idx) => (
            <li key={idx} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div>
                <b>{membersMap[s.from] || s.from}</b> → <b>{membersMap[s.to] || s.to}</b>
              </div>
              <div>{rupees(s.amount)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
