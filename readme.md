# 💰 Expense Splitter (MERN)

A full-stack **Splitwise-like Expense Sharing Application** built using the **MERN stack** (MongoDB, Express, React, Node.js).  
It allows users to create groups, add members and expenses, and view who owes whom — all without authentication.  
Users can also join groups using **invite links** or via **group name + passphrase**.

---

## 🚀 Features

### Core Functionality
- **Create Groups** with optional passphrase protection  
- **Join Groups** using:
  - Group Name + Passphrase, or
  - Unique **Invite Link** (auto-join)
- **Add Members** dynamically to each group  
- **Add Expenses** shared among selected participants (supports unequal split ratios)  
- **Automatic Expense Balancing** using a **Greedy Settlement Algorithm**
- **Transaction Logs** for every member and expense added  
- **Real-time Group Summary** showing:
  - Total expenses
  - Each member’s total paid
  - Each member’s fair share
  - Net balance (+ve means they’re owed, −ve means they owe others)
- **Minimal Settlements View** (who pays whom)

### Additional Features
- **Invite Link Copy** with one-click sharing  
- **React Router DOM Integration** for clean routing:
  - `/` → Home page (create/join group)
  - `/group/:id` → Group dashboard
- **Responsive UI** using **TailwindCSS**
- **Activity Logs** per group for transparency
- **Greedy Algorithm** implementation for debt minimization

---

## 🧠 Algorithm Logic (in short)

Each expense is split among participants by ratio:

```
share = (participant_ratio / total_ratio) * expense_amount
```

Then:

```
net_balance = total_paid - total_owed
```

Finally, a **greedy settlement** algorithm pairs debtors and creditors to minimize transactions.

**Example:**

| Member | Paid | Owes | Net |
|:--------|------:|------:|------:|
| A | ₹240 | ₹173.3 | +₹66.7 |
| B | ₹160 | ₹173.3 | −₹13.3 |
| C | ₹100 | ₹153.3 | −₹53.3 |

✅ Settlements:
- C → A ₹53.3  
- B → A ₹13.3  

---

## 🧮 Sample Expense List (added manually for testing)

Below is the **demo dataset** used during testing to verify correct splitting and settlements.

| # | Description | Payer | Amount (₹) | Participants (ratio) | Outcome |
|:--:|:-------------|:-------|------------:|----------------------|:----------|
| 1 | Dinner at Café | A | 240 | A:1, B:1, C:2 | Split 60, 60, 120 |
| 2 | Movie Tickets | B | 160 | A:1, B:1 | Split 80, 80 |
| 3 | Snacks | C | 100 | A:1, B:1, C:1 | Split 33.3 each |
| 4 | Taxi Fare | A | 200 | A:2, B:1, C:1 | Split 100, 50, 50 |
| 5 | Drinks | B | 120 | A:1, C:1 | Split 60, 60 |
| 6 | Ice Cream | C | 60 | A:1, B:1, C:1 | Split 20 each |

**Final Summary:**

| Member | Paid | Owed | Net |
|:--------|------:|------:|------:|
| A | ₹440 | ₹353.3 | +₹86.7 |
| B | ₹280 | ₹333.3 | −₹53.3 |
| C | ₹160 | ₹193.3 | −₹33.3 |

✅ Settlements:
- B → A ₹53.3  
- C → A ₹33.3  

---

## 🏗️ Architecture Overview

### Backend (Node.js + Express)
```
/api/groups
├── POST / (create group)
├── POST /open (join via name/passphrase)
├── GET /open-link/:token (join via invite link)
├── GET /:id (get group)
├── POST /:id/members (add member)
├── POST /:id/expenses (add expense)
├── GET /:id/summary (get balances)
├── GET /:id/settlements (get settlements)
└── GET /:id/logs (get transaction logs)
```

### Frontend (React + Vite + Tailwind)
```
src/
├── App.jsx             # Routes setup (Home / Group)
├── pages/
│   ├── Home.jsx        # Create / Join / Invite forms
│   └── GroupPage.jsx   # Full group dashboard
├── components/
│   ├── MembersCard.jsx
│   ├── AddMemberForm.jsx
│   ├── AddExpenseForm.jsx
│   ├── SummaryCard.jsx
│   ├── SettlementsCard.jsx
│   ├── LogsCard.jsx
│   └── CopyField.jsx
└── api/
    └── client.js       # API wrappers for backend routes
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React, Vite, TailwindCSS, React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Auth (MVP)** | Group name + passphrase (no user login) |
| **AI Companion** | ChatGPT (for design, debugging, algorithm validation) |

---

## 🧩 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1️⃣ Clone and Install
```bash
git clone https://github.com/yourusername/expense-splitter.git
cd expense-splitter
```

### 2️⃣ Setup Backend
```bash
cd server
npm install
npm run server
```

### 3️⃣ Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:4000`

---

## 🧠 AI Assistance Log

During the development of the application, AI was used as a companion for architectural
guidance, debugging, and design decision validation.  
All implementation—from database setup to frontend integration—was done independently,
while AI helped explore better approaches and validate technical feasibility.

### Key Prompt Areas:
- Understanding structural logic behind expense-sharing platforms like Splitwise.
- Evaluating whether authentication could be omitted using group name + password.
- Suggestions for scalable REST APIs and transaction log handling.
- Debugging integration issues such as import mismatches and router inconsistencies.
- Guidance on adding invite links and route-based navigation using React Router DOM.

---

## 📘 Design Summary

- **Backend:** Node.js, Express, Mongoose, Bcrypt, NanoID  
- **Frontend:** React + Tailwind + Vite + React Router + Framer Motion
- **Database:** MongoDB  
- **Routing:**  
  - `/` — Home (create/join groups)  
  - `/group/:id` — Group dashboard (members, expenses, logs)

---

## 🧮 Expense Logic Recap

The system computes:
```
Each member's share = (shareRatio / totalRatio) × expenseAmount
```
then:
```
netBalance = totalPaid - totalOwed
```
and finally pairs creditors & debtors using a greedy settlement algorithm  
(minimizing the number of transactions).

---

## 🧾 Example Output (Console Log)

```bash
Expense Summary:
A → Net: +₹86.7
B → Net: -₹53.3
C → Net: -₹33.3

Suggested Settlements:
B pays A ₹53.3
C pays A ₹33.3
All debts settled ✅
```

---

## 🧠 Conceptual Mapping

This project demonstrates:
- Use of **Greedy Algorithms** for debt minimization
- Clean **REST API design** and **React-based SPA integration**
- Practical application of **Splitwise logic**
- Full-stack understanding (DB → API → UI)

---

## 👨‍💻 Developer

**Author:** Aditya Chandra
**Under:** Cisco Pre-Interview Project  
**Assistance:** AI Companion (ChatGPT) for design & debugging
