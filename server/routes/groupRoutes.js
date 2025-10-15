import { Router } from "express";
import {
  createGroup,
  getGroup,
  addMember,
  addExpense,
  getSummary,
  getSettlements
} from "../controllers/groupControllers.js";

import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

const addMemberSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ name: z.string().min(1) }),
});

const addExpenseSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    description: z.string().min(1),
    amount: z.number().int().positive(), // in paise
    payerId: z.string().min(1),
    participants: z
      .array(
        z.object({
          memberId: z.string().min(1),
          shareRatio: z.number().positive().optional().default(1),
        })
      )
      .min(1),
  }),
});

router.post("/", validate(createGroupSchema), createGroup);
router.get("/:id", getGroup);
router.post("/:id/members", validate(addMemberSchema), addMember);
router.post("/:id/expenses", validate(addExpenseSchema), addExpense);

router.get("/:id/summary", getSummary);
router.get("/:id/settlements", getSettlements);

export default router;
