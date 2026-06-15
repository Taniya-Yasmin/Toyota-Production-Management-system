<div align="center">

# 🏭 PMSP — Production Monitoring & Sign-off Portal

**Enterprise-grade Manufacturing Execution System (MES) for automotive component production lines**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![ISO 9001](https://img.shields.io/badge/Compliance-ISO%209001-orange)](https://www.iso.org/iso-9001-quality-management.html)

</div>

---

## 📋 Overview

PMSP is an **enterprise-grade Manufacturing Execution System** designed for automotive component production facilities. It provides end-to-end visibility and control over day/night shift operations — tracking vehicle component production lines for **Innova**, **BMC**, **Crysta**, and **Etios** models — while enforcing operational compliance, quality gates, and strict data traceability.

> Designed for environments requiring auditability under quality standards such as **ISO 9001**.

---

## ✨ Features

### 🔐 Role-Based Access Control (RBAC)

Four-tier permission model enforced on both frontend routes and backend APIs:

| Role            | Permissions                                                   |
| --------------- | ------------------------------------------------------------- |
| **Admin**       | Full system access, audit trail, configuration                |
| **Manager**     | Production data, history (all), inventory management, exports |
| **Team Leader** | Sheet finalization, stock adjustments, team history           |
| **Operator**    | Data entry only; views own records                            |

---

### 📊 Live Shift Dashboard & KPIs

Real-time metrics computed per shift:

- **Total Received** — raw components allocated to the shift
- **Production Progress %** — live completion rate
- **Production Done** — total successfully assembled units
- **Pending Items** — backlog count with red-flag threshold warnings
- **Draft Auto-Save & Resume** — shift state is preserved on interruption

---

### 📈 Graphical Production Analytics (OEE)

- Interactive **Target vs. Actual Completion** bar charts with hourly granularity
- **OEE (Overall Equipment Effectiveness) Index** gauge for at-a-glance operational health

---

### 🗂️ Manufacturing Lines Logging

Dedicated inline-validated data entry tables per production segment:

| Section           | Models Tracked       | Parts                                     |
| ----------------- | -------------------- | ----------------------------------------- |
| **Sub-Assembly**  | Innova, BMC, Crysta  | Hood, Doors, Fender, structural parts     |
| **Unit Parts**    | All                  | General components                        |
| **Etios Section** | Etios HBK, Etios SDN | Hatchback & Sedan model-specific tracking |

---

### 📦 Safety Stock Inventory Monitoring

- Real-time stock level tracking against configurable safety minimums
- **Low Stock** visual warnings for at-risk component lines
- Authorized roles (Manager / Admin / Team Leader) can adjust quantities and configure thresholds inline

---

### ✍️ Multi-Signature Verification Workflow

Shift reports are digitally locked via sequential signature capture from:

1. **TM** — Team Member
2. **AM** — Assistant Manager
3. **GL** — Group Leader

Signatures are stored as **base64-encoded vector images** and bound to the finalized report.

---

### 🛡️ Immutable Security Audit Trail

Every database transaction is logged to a tamper-proof audit log containing:

- **Timestamp** of the event
- **User identity & role** at the time of action
- **JSON state delta** — exact diff of previous vs. new state

Covers: inserts, target changes, inventory adjustments, and draft updates. Supports **ISO 9001** quality compliance requirements.

---

### 📁 Historical Records Archive

- Tabular view of all shift records
- **Operators** see only their own entries
- **Managers, Leaders, and Admins** can view and filter the full factory history

---

### 📤 Excel / CSV Report Exporter

- Admins and Managers can export historical records as standard **CSV spreadsheets**
- Supports physical auditing workflows and **external ERP synchronization**

---

## 🏗️ Architecture

```
pmsp/
├── client/                  # Frontend (UI)
│   ├── pages/
│   │   ├── Dashboard.jsx    # Live KPI dashboard
│   │   ├── DataEntry.jsx    # Manufacturing line logging
│   │   ├── History.jsx      # Historical records
│   │   ├── Inventory.jsx    # Safety stock monitor
│   │   └── AuditTrail.jsx   # Immutable audit log (Admin/Manager only)
│   └── components/
│       ├── OEEGauge.jsx
│       ├── SignatureCapture.jsx
│       └── RBACGuard.jsx
│
├── server/                  # Backend API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── production.js
│   │   ├── inventory.js
│   │   ├── audit.js
│   │   └── export.js
│   ├── middleware/
│   │   └── rbac.js          # Role enforcement
│   └── models/              # DB schema definitions
│
└── docs/                    # Additional documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- A supported database (PostgreSQL recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/pmsp.git
cd pmsp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials and secrets

# 4. Run database migrations
npm run migrate

# 5. Seed initial roles and admin user
npm run seed

# 6. Start the development server
npm run dev
```

The portal will be available at `http://localhost:3000`.

---

## ⚙️ Configuration

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pmsp

# Auth
JWT_SECRET=your-secret-key
SESSION_EXPIRY=8h

# Shift Config
DAY_SHIFT_START=06:00
NIGHT_SHIFT_START=18:00

# Inventory Warning Threshold (%)
LOW_STOCK_THRESHOLD=20
```

---

## 🔒 Security

- All API routes are protected by **JWT authentication**
- **RBAC middleware** enforces permissions server-side — not just in the UI
- Audit logs are **append-only** with no delete or update endpoints exposed
- Signatures are bound to finalized records and cannot be altered post-submission

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branch naming, PR format, and code standards.

---

## 📬 Contact

For enterprise support or deployment inquiries, open an issue or contact the maintainers via the repository's discussion board.

---

<div align="center">
  <sub>Built for reliability. Designed for traceability. Engineered for the shop floor.</sub>
</div>
