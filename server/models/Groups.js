import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: true }
);

const expenseShareSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    shareRatio: { type: Number, default: 1 },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true }, // store in paise (integer)
    payerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    participants: { type: [expenseShareSchema], required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameLower: { type: String, required: true, index: true }, // case-insensitive lookup
    accessHash: { type: String, default: null }, // bcrypt hash of passphrase (nullable)
    members: { type: [memberSchema], default: [] },
    expenses: { type: [expenseSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// keep nameLower in sync
groupSchema.pre("validate", function(next) {
  if (this.name) this.nameLower = this.name.toLowerCase();
  next();
});

export const Group = mongoose.model("Group", groupSchema);
