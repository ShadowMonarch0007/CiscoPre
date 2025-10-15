import { Group } from "../models/Groups.js";
import { computeBalances, computeSettlements, splitExpenseInt } from "../services/compute.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** POST /api/groups  { name, accessCode? } */
export async function createGroup(req, res, next) {
  try {
    const { name, accessCode } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const accessHash = accessCode ? await bcrypt.hash(accessCode, SALT_ROUNDS) : null;
    const group = await Group.create({ name, accessHash, members: [], expenses: [] });
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

/** POST /api/groups/open  { name, accessCode? }  -> returns group if allowed */
export async function openGroupByName(req, res, next) {
  try {
    const { name, accessCode } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const group = await Group.findOne({ nameLower: name.toLowerCase() });
    if (!group) return res.status(404).json({ error: "Group not found" });

    // if protected, verify accessCode
    if (group.accessHash) {
      if (!accessCode) return res.status(401).json({ error: "Passphrase required" });
      const ok = await bcrypt.compare(accessCode, group.accessHash);
      if (!ok) return res.status(403).json({ error: "Invalid passphrase" });
    }

    res.json(group);
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

    const paid = {};
    const owed = {};
    group.members.forEach(m => { paid[m._id] = 0; owed[m._id] = 0; });

    for (const e of group.expenses) {
      // who paid
      paid[String(e.payerId)] = (paid[String(e.payerId)] || 0) + e.amount;

      // per-expense fair shares
      if (e.participants?.length) {
        const shares = splitExpenseInt(e.amount, e.participants);
        e.participants.forEach((p, idx) => {
          owed[String(p.memberId)] = (owed[String(p.memberId)] || 0) + shares[idx];
        });
      }
    }

    res.json({ members: group.members, balances, paid, owed, totals });
  } catch (e) {
    next(e);
  }
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
