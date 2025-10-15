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

export default function ExpensesCard({ expenses = [], membersMap }) {
  if (!Array.isArray(expenses)) expenses = expenses?.expenses || [];

  return (
    <div className="card">
      <div className="font-semibold mb-2">Expenses</div>

      {expenses.length === 0 ? (
        <div className="text-sm text-neutral-500">No expenses recorded yet.</div>
      ) : (
        <ul className="space-y-2">
          {expenses.map((exp) => {
            const key = exp._id || exp.description;
            const payer = membersMap?.[exp.payerId] || "Unknown payer";
            const total = rupees(exp.amount);
            const totalRatio = exp.participants.reduce((sum, p) => sum + (p.shareRatio || 1), 0);

            return (
              <li key={key} className="border rounded-xl px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{exp.description}</div>
                    <div className="text-xs text-neutral-600">
                      Paid by <span className="font-medium">{payer}</span> · Total: {total}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">{when(exp.createdAt)}</div>
                </div>

                {exp.participants?.length > 0 && (
                  <ul className="mt-2 text-xs text-neutral-700 space-y-1 pl-2 border-l border-neutral-200">
                    {exp.participants.map((p) => {
                      const participantName = membersMap?.[p.memberId] || "Member";
                      const share = exp.amount * (p.shareRatio / totalRatio);
                      return (
                        <li key={p.memberId}>
                          {participantName} — share ratio: {p.shareRatio} → share: {rupees(share)}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

