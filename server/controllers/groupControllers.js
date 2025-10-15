import { Group } from "../models/Groups.js";
import { computeBalances, computeSettlements, splitExpenseInt } from "../services/compute.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const SALT_ROUNDS = 10;
const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10); // no confusing chars (O/0, I/1)

/** POST /api/groups  { name, accessCode? } */
export async function createGroup(req, res, next) {
  try {
    const { name, accessCode } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const accessHash = accessCode ? await bcrypt.hash(accessCode, SALT_ROUNDS) : null;

    // generate unique invite token
    let token = nano();
    // basic collision loop (rare)
    while (await Group.findOne({ inviteToken: token })) token = nano();

    const group = await Group.create({
      name,
      accessHash,
      inviteToken: token,
      members: [],
      expenses: [],
      logs: []
    });

    // logs
    group.logs.push({ type: "group_created", message: `Group "${group.name}" created`, meta: null });
    group.logs.push({
      type: "invite_token_generated",
      message: `Invite token generated`,
      meta: { inviteToken: token }
    });
    await group.save();

    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

/** POST /api/groups/open  { name, accessCode? } */
export async function openGroupByName(req, res, next) {
  try {
    const { name, accessCode } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const group = await Group.findOne({ nameLower: name.toLowerCase() });
    if (!group) return res.status(404).json({ error: "Group not found" });

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

/** GET /api/groups/open-link/:token  -> open by invite token (bypasses passphrase) */
export async function openGroupByInviteToken(req, res, next) {
  try {
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token });
    if (!group) return res.status(404).json({ error: "Invalid invite token" });
    res.json(group);
  } catch (e) {
    next(e);
  }
}

/** GET /api/groups/:id/invite -> { token } */
export async function getInviteToken(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ token: group.inviteToken });
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
    const newMember = group.members.at(-1);

    group.logs.push({
      type: "member_added",
      message: `Added member "${req.body.name}"`,
      meta: { memberId: newMember._id.toString() }
    });

    await group.save();
    res.status(201).json(newMember);
  } catch (e) {
    next(e);
  }
}

/** POST /api/groups/:id/expenses { description, amount, payerId, participants[] } */
export async function addExpense(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const memberIds = new Set(group.members.map((m) => String(m._id)));
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
      participants: req.body.participants.map((p) => ({
        memberId: new mongoose.Types.ObjectId(p.memberId),
        shareRatio: p.shareRatio ?? 1
      }))
    });
    const exp = group.expenses.at(-1);

    const payerName =
      group.members.find((m) => String(m._id) === String(req.body.payerId))?.name || "Unknown";
    group.logs.push({
      type: "expense_added",
      message: `Expense "${req.body.description}" of ₹ ${(req.body.amount / 100).toFixed(2)} added by ${payerName}`,
      meta: {
        expenseId: exp._id.toString(),
        amountPaise: req.body.amount,
        payerId: req.body.payerId,
        participants: req.body.participants.map((p) => ({
          memberId: String(p.memberId),
          shareRatio: p.shareRatio ?? 1
        }))
      }
    });

    await group.save();
    res.status(201).json(exp);
  } catch (e) {
    next(e);
  }
}

/** GET /api/groups/:id/summary */
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
    group.members.forEach((m) => {
      paid[m._id] = 0;
      owed[m._id] = 0;
    });

    for (const e of group.expenses) {
      paid[String(e.payerId)] = (paid[String(e.payerId)] || 0) + e.amount;
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

/** GET /api/groups/:id/settlements */
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

export async function getExpenses(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ expenses: group.expenses });
  } catch (e) {
    next(e);
  }
}

/** GET /api/groups/:id/logs */
export async function getLogs(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const logs = [...(group.logs || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ logs });
  } catch (e) {
    next(e);
  }
}
