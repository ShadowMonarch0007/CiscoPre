function rupees(paise) {
  if (typeof paise !== "number") return null;
  return "₹ " + (paise / 100).toFixed(2);
}

function when(dt) {
  try {
    const d = new Date(dt);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function LogsCard({ logs, membersMap }) {
  return (
    <div className="card">
      <div className="font-semibold mb-2">Activity / Transaction Logs</div>
      {!logs || logs.length === 0 ? (
        <div className="text-sm text-neutral-500">No activity yet.</div>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => {
            const key = log._id || `${log.type}-${log.createdAt}`;
            let extra = null;

            if (log.type === "expense_added" && log.meta) {
              const payerName = membersMap?.[log.meta.payerId] || "Someone";
              extra = (
                <div className="text-xs text-neutral-600">
                  Payer: {payerName} · Amount: {rupees(log.meta.amountPaise)}
                </div>
              );
            }

            if (log.type === "member_added" && log.meta) {
              const member = membersMap?.[log.meta.memberId] || "Member";
              extra = (
                <div className="text-xs text-neutral-600">
                  Member ID: {log.meta.memberId} ({member})
                </div>
              );
            }

            return (
              <li key={key} className="border rounded-xl px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{log.message}</div>
                  <div className="text-xs text-neutral-500">{when(log.createdAt)}</div>
                </div>
                {extra}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
