import { Group } from "../models/Group.js";
import { computeBalances, computeSettlements } from "../services/compute.js";
import mongoose from "mongoose";

/** POST /api/groups { name } */
export async function createGroup(req, res, next) {
  try {
    const group = await Group.create({ name: req.body.name, members: [], expenses: [] });
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

/** GET /api/groups/:id */
export async function getGroup(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (e) {
    next(e);
  }
}

/** POST /api/groups/:id/members { name } */
export async function addMember(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members.push({ name: req.body.name });
    await group.save();
    res.status(201).json(group.members.at(-1));
  } catch (e) {
    next(e);
  }
}

/** POST /api/groups/:id/expenses { description, amount, payerId, participants[] } */
export async function addExpense(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // basic checks: payer exists, participants belong to group
    const memberIds = new Set(group.members.map(m => String(m._id)));
    if (!memberIds.has(String(req.body.payerId)))
      return res.status(400).json({ error: "Invalid payerId" });

    for (const p of req.body.participants) {
      if (!memberIds.has(String(p.memberId)))
        return res.status(400).json({ error: `Invalid participant memberId: ${p.memberId}` });
    }

    group.expenses.push({
      description: req.body.description,
      amount: req.body.amount,
      payerId: new mongoose.Types.ObjectId(req.body.payerId),
      participants: req.body.participants.map(p => ({
        memberId: new mongoose.Types.ObjectId(p.memberId),
        shareRatio: p.shareRatio ?? 1,
      })),
    });

    await group.save();
    res.status(201).json(group.expenses.at(-1));
  } catch (e) {
    next(e);
  }
}

/** GET /api/groups/:id/summary -> balances & totals */
export async function getSummary(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const balances = computeBalances(group);
    const totals = {
      totalExpenses: group.expenses.reduce((a, e) => a + e.amount, 0),
      members: group.members.length
    };

    // also return per-member paid and owed (derived) for UI niceness
    const paid = {};
    const owed = {};
    group.members.forEach(m => { paid[m._id] = 0; owed[m._id] = 0; });

    for (const e of group.expenses) {
      paid[String(e.payerId)] += e.amount;
      // recompute fair shares just for per-expense owed
      const shares = e.participants.length
        ? computePerExpenseShares(e)
        : [];
      e.participants.forEach((p, idx) => {
        owed[String(p.memberId)] += shares[idx];
      });
    }

    res.json({ members: group.members, balances, paid, owed, totals });
  } catch (e) {
    next(e);
  }
}

function computePerExpenseShares(expense) {
  const { splitExpenseInt } = awaitImportCompute(); // lazy import for reuse
  const participants = expense.participants;
  return splitExpenseInt(expense.amount, participants);
}

async function awaitImportCompute() {
  // dynamic import to avoid circular deps in some bundlers
  const mod = await import("../services/compute.js");
  return mod;
}

/** GET /api/groups/:id/settlements -> [{ from, to, amount }] */
export async function getSettlements(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const balances = computeBalances(group);
    const settlements = computeSettlements(balances);
    res.json({ settlements });
  } catch (e) {
    next(e);
  }
}
