/**
 * Core logic for expense splitting.
 * Store amounts in paise (integer). Ensure sums of shares == expense amount.
 */

// Distribute integer remainders deterministically so shares sum exactly to total.
function distributeRemainder(shares, total) {
  const sum = shares.reduce((a, b) => a + b, 0);
  let diff = total - sum; // could be positive (need to add) or negative (need to subtract)
  const out = [...shares];

  // Assign +/- 1 paise to earliest participants until diff is zero
  let i = 0;
  while (diff !== 0) {
    const step = diff > 0 ? 1 : -1;
    out[i] += step;
    diff -= step;
    i = (i + 1) % out.length;
  }
  return out;
}

/**
 * Given an expense with participants and ratios, return array of owed integer shares
 * preserving total exactly (in paise).
 */
export function splitExpenseInt(totalPaise, participants) {
  // participants: [{ memberId, shareRatio }]
  const weightSum = participants.reduce((a, p) => a + (p.shareRatio || 1), 0);
  if (weightSum <= 0) throw new Error("Invalid share weights");

  const raw = participants.map(p =>
    Math.floor((totalPaise * (p.shareRatio || 1)) / weightSum)
  );

  const fixed = distributeRemainder(raw, totalPaise);
  return fixed; // int paise per participant aligned with participants order
}

/**
 * Compute per-member net balances for a group document.
 * balance[memberId] = paymentsMade - fairShareOwed
 * Positive => others owe them; Negative => they owe others.
 */
export function computeBalances(groupDoc) {
  const memberIds = groupDoc.members.map(m => String(m._id));
  const balance = {};
  memberIds.forEach(id => (balance[id] = 0));

  for (const e of groupDoc.expenses) {
    const participants = e.participants;
    if (!participants || participants.length === 0) continue;

    // Fair shares
    const shares = splitExpenseInt(e.amount, participants);

    // Subtract fair share from each participant
    participants.forEach((p, idx) => {
      const pid = String(p.memberId);
      if (balance[pid] === undefined) balance[pid] = 0;
      balance[pid] -= shares[idx];
    });

    // Add full amount to payer
    const payerId = String(e.payerId);
    if (balance[payerId] === undefined) balance[payerId] = 0;
    balance[payerId] += e.amount;
  }

  // Invariant: sum of balances == 0
  // (You can assert here in tests)
  return balance;
}

/**
 * Min-Cash-Flow style settlement suggestions from net balances.
 * Returns array of { from, to, amount } in paise.
 */
export function computeSettlements(balance) {
  const creditors = [];
  const debtors = [];

  for (const [id, val] of Object.entries(balance)) {
    if (val > 0) creditors.push({ id, amt: val });
    else if (val < 0) debtors.push({ id, amt: -val }); // store as positive need-to-pay
  }

  // Greedy pair largest creditor/debtor
  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);

  const res = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const give = Math.min(creditors[i].amt, debtors[j].amt);
    res.push({ from: debtors[j].id, to: creditors[i].id, amount: give });

    creditors[i].amt -= give;
    debtors[j].amt -= give;

    if (creditors[i].amt === 0) i++;
    if (debtors[j].amt === 0) j++;
  }

  return res;
}
