import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  { _id: true }
);

const expenseShareSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    shareRatio: { type: Number, default: 1 }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true }, // paise (integer)
    payerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    participants: { type: [expenseShareSchema], required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

// Transaction logs
const logSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // 'group_created' | 'member_added' | 'expense_added' | 'invite_token_generated' | ...
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameLower: { type: String, required: true, index: true },
    accessHash: { type: String, default: null }, // bcrypt of passphrase (nullable)
    inviteToken: { type: String, required: true, unique: true }, // NEW
    members: { type: [memberSchema], default: [] },
    expenses: { type: [expenseSchema], default: [] },
    logs: { type: [logSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// keep nameLower synced
groupSchema.pre("validate", function (next) {
  if (this.name) this.nameLower = this.name.toLowerCase();
  next();
});

export const Group = mongoose.model("Group", groupSchema);
