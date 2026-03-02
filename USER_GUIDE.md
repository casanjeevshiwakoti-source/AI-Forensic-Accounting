# AI Forensic Accounting Platform — User Guide

This guide walks you through the **AI Forensic Accounting Platform** from login to export, with clear emphasis on workflows, data requirements, and best practices.


---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Authentication](#3-authentication)
4. [End-to-End Workflow](#4-end-to-end-workflow)
5. [Data Ingestion](#5-data-ingestion)
6. [Analysis & Detection](#6-analysis--detection)
7. [Dashboard & Cases](#7-dashboard--cases)
8. [Case Detail & Evidence](#8-case-detail--evidence)
9. [Reports & Export](#9-reports--export)
10. [Settings & Thresholds](#10-settings--thresholds)
11. [CSV Format Reference](#11-csv-format-reference)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Overview

The **AI Forensic Accounting Platform** is a CSV-based forensic investigation tool that:

- **Ingests** vendor, AP invoice, payment, and general ledger data via CSV uploads.
- **Analyzes** data with configurable rules to detect fraud-related patterns.
- **Generates** investigation cases with risk scores, exposure amounts, and evidence (timeline, entities, transactions).
- **Exports** audit-ready reports and evidence for further review or compliance.

**Important:** All processing runs in your browser. Data is stored locally (IndexedDB and localStorage). No data is sent to external servers.

---

## 2. Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or compatible package manager

### Install and Run

```bash
# From the project root
npm install
npm run dev
```

The app runs at **http://localhost:5173** (or the URL shown in the terminal). Open it in a modern browser (Chrome, Firefox, Edge, Safari).

### Build for Production

```bash
npm run build
npm run preview   # Optional: preview production build locally
```

---

## 3. Authentication

- **All app routes except `/login` require sign-in.** If you are not logged in, you are redirected to the login page.
- After signing in, you are redirected to the **Dashboard**.

### Demo Credentials

| Username | Password | Purpose |
|----------|----------|---------|
| **admin** | **admin123** | Full access |
| **demo**  | **demo123**  | Demo / testing |

**Emphasis:** These are demo credentials only. For production, replace with real authentication and secure storage.

### Sign Out

- Use the **logout** (door) icon in the **sidebar** (bottom-left, next to your profile). You will be redirected to `/login`.

---

## 4. End-to-End Workflow

High-level flow:

```
Login → Data Ingestion (upload or load sample) → Analyze Data → Dashboard / Cases → Case Detail → Export
```

| Step | Where | What to do |
|------|--------|------------|
| 1 | **Data Ingestion** | Upload CSV files **or** click **Load Sample Data** |
| 2 | **Data Ingestion** | Click **Analyze Data** (after at least one successful upload) |
| 3 | **Dashboard** | Review metrics and case queue |
| 4 | **Cases** | Filter, search, open cases, change status, assign |
| 5 | **Case Detail** | Review timeline, entity graph, evidence table, notes |
| 6 | **Reports** | Generate and download Audit / Executive / Evidence reports |
| 7 | **Settings** | Optionally adjust detection thresholds, then re-run analysis |

**Emphasis:** Nothing appears on the Dashboard or in Cases until you have **uploaded (or loaded) data** and clicked **Analyze Data**.

---

## 5. Data Ingestion

**Path:** Sidebar → **Data Ingestion** (`/ingestion`)

### Two Ways to Get Data

1. **Load Sample Data** (quick start)  
   - One click loads all four data types (Vendor Master, AP Invoices, Payments, GL Entries) with built-in forensic red flags.  
   - **Analysis runs automatically** after load.  
   - Use this to explore the app and see example cases.

2. **Upload Your Own CSVs**  
   - Use the **Upload as:** dropdown to choose the data type **before** selecting or dropping a file.  
   - Supported types: **Vendor Master**, **AP Invoices**, **Payments**, **General Ledger**.  
   - Drag-and-drop or **Browse Files**; only **.csv** is accepted.  
   - **Max file size:** 500 MB (documented in UI).

### Upload Rules

- **Select the correct data type** for each file. Wrong type → schema validation errors.
- **One file per type per “session”:** uploading a new file of the same type **replaces** that type’s data (e.g. a second Vendor Master upload overwrites the first).
- Files are validated on upload. If **Schema Error** appears, check the **CSV Format Reference** below and fix missing/renamed columns.

### After Upload

- Each file shows **Ready** (green) or **Schema Error** (red). If there are errors, the card lists **missing or invalid columns** and suggests using sample templates.
- **Data Quality Score** (right panel) shows 90/100 when data is present and highlights schema mapping, suspicious patterns, and data integrity.

### Clear and Re-run

- **Clear All Data** — Removes all uploads and processed data, cases, and reports. Use to start over.
- **Analyze Data** — Runs the detection engine on current **processed** data (from your uploads or sample). Click this after uploading **at least one file** if you did not use **Load Sample Data**.

**Emphasis:** For manual uploads you must click **Analyze Data** after uploading; for **Load Sample Data**, analysis runs automatically.

---

## 6. Analysis & Detection

When you click **Analyze Data**, the platform runs rule-based checks on the loaded data and creates **cases** when patterns are found. Detection uses **configurable thresholds** (see [Settings & Thresholds](#10-settings--thresholds)).

### Detection Patterns

| Pattern | Description | Typical risk |
|--------|-------------|--------------|
| **Threshold evasion** | Invoices just below $5k, $10k, or $25k approval limits | Critical |
| **Self-approval** | Same user in `created_by_user_id` and `approved_by_user_id` | High |
| **Shell vendor risk** | Vendors with `risk_flag_internal = Y` | Critical |
| **Duplicate bank accounts** | Same `bank_account_last4` across multiple vendors | High |
| **Weekend payments** | Payments on Saturday or Sunday | Medium |
| **Off-hours GL entries** | Journal entries outside business hours (e.g. before 6 AM or after 10 PM) | Medium |
| **Round dollar pattern** | Invoices with round amounts (e.g. multiples of $1,000) meeting count threshold | Low |

Cases get a **risk score** (0–100), **risk level** (critical / high / medium / low), **exposure amount**, and **evidence** (timeline, transactions, entities) built from your CSV data.

**Emphasis:** Changing thresholds in Settings only affects the **next** run of **Analyze Data**. Re-run analysis after changing thresholds to regenerate cases.

---

## 7. Dashboard & Cases

### Dashboard (`/dashboard`)

- **When no data is loaded:** Prompts to go to **Data Ingestion** or **Quick Start with Sample Data**.
- **When data is loaded:**  
  - **Risk metrics:** Active cases, total exposure, critical alerts, records analyzed.  
  - **Case queue:** Top 5 cases; click a row to open **Case Detail**.  
  - **Recent activity** and **Cases by Risk Level** breakdown.

Shortcuts: **View All Cases**, **Export Report** (to Reports).

### Cases (`/cases`)

- **Table:** Case ID, title, risk (with score), exposure, status, assignee, created date.
- **Filters:** **All Status** / Open / Review / Escalated / Closed; **All Risks** / Critical / High / Medium / Low.
- **Search:** By case title, ID, or type.
- **Pagination:** Page size 10, 25, 50, or 100.
- **Row actions (⋮):**  
  - View Case  
  - Change Status (open, review, escalated, closed)  
  - Assign To (user list)  
  - Export Case (JSON)
- **New Case:** Create a **manual** case (title, description, type, risk level, assignee). Manual cases do not have auto-generated evidence from CSV data.
- **Export List:** CSV of case list (selected rows or current filtered list).

**Emphasis:** Case IDs are generated as `CS-2024-XXX`. Status and assignee are stored in memory/local persistence only.

---

## 8. Case Detail & Evidence

**Path:** **Cases** → click a Case ID, or open from Dashboard case queue → `/cases/:caseId`

### Header

- Case **title**, **risk score**, **description**, **type**, **status**, **assignee**, **total exposure**.
- **Export Report** — Downloads a JSON report for this case (case + timeline + transactions + entities + export timestamp).

### Tabs

1. **Timeline**  
   Chronological events (invoices, payments, approvals, GL entries, alerts) and **Key Entities** (vendors, users) with risk badges.

2. **Entity Graph**  
   Visual graph of entities (vendors, users, invoices, payments, GL) linked to the case.

3. **Evidence**  
   **Transaction Evidence** table: date, type, reference, vendor, amount, user, flags.  
   - **Export CSV** — Downloads the evidence table as CSV.

4. **Notes**  
   Add **case notes** (author, content, timestamp). Stored per case in app state/local persistence.

**Emphasis:** Evidence and timeline are built from your **uploaded CSV data**. If a case was created from analysis, the evidence reflects the records that triggered that case type.

---

## 9. Reports & Export

**Path:** Sidebar → **Reports** (`/reports`)

### When No Data Is Loaded

- Message: “Upload and process your financial data first.”  
- Button: **Upload Data** → Data Ingestion.

### Report Templates (when data is loaded)

| Template | Description | When available |
|----------|-------------|-----------------|
| **Audit Ready Report** | Case summary, evidence trail, timestamps, investigator notes | When there are cases |
| **Executive Summary** | High-level risk exposure, detection rates, key findings | When there are cases |
| **Evidence Bundle** | Full export of linked data (vendors, invoices, payments, GL) | When any of those datasets exist |

Click **Generate & Download** to get a **JSON** file named by type and date.

### Recent Exports

- Table of generated reports (name, type, generated by, date, size).  
- **Download** (icon) re-downloads that report’s JSON (if not expired).

### Other Export Points

- **Case Detail** → **Export Report** → case-level JSON.  
- **Case Detail** → **Evidence** tab → **Export CSV** → evidence table CSV.  
- **Cases** → row menu → **Export Case** → single-case JSON.  
- **Cases** → **Export List** → cases list CSV.

**Emphasis:** All exports are generated in the browser; no server-side report generation.

---

## 10. Settings & Thresholds

**Path:** Sidebar → **Settings** (`/settings`)

### Integrations (UI only)

- Placeholders for SAP ERP, Oracle NetSuite, API Access. Buttons (Configure / Connect / Manage Keys) are not wired to backend; the app currently works only with **CSV upload** and **Load Sample Data**.

### Model Governance — Detection Thresholds

These values drive **Analyze Data**. They are stored in **localStorage** and persist across sessions.

| Setting | Meaning | Default (examples) |
|--------|---------|---------------------|
| **Threshold Evasion ($5k limit)** | Min–max amount to flag “just under $5k” | 4900 – 5000 |
| **Threshold Evasion ($10k limit)** | Min–max for “just under $10k” | 9800 – 10000 |
| **Threshold Evasion ($25k limit)** | Min–max for “just under $25k” | 24800 – 25000 |
| **Off-Hours (GL)** | Hours considered “business hours” (e.g. 6 AM – 10 PM) | 6 – 22 |
| **Round Dollar (min amount)** | Minimum invoice amount to consider for round-dollar rule | 1000 |
| **Round Dollar (min count)** | Minimum number of such invoices to create a case | 4 |

**Emphasis:** After changing any threshold, go back to **Data Ingestion** and click **Analyze Data** again to regenerate cases with the new rules.

### Data Retention

- Toggle “Auto-delete raw CSV uploads” is present in UI only; behavior is not implemented. Processed data and state are still persisted in IndexedDB as designed.

---

## 11. CSV Format Reference

Use this when preparing or troubleshooting CSV files. **Column names are matched case-insensitively** and many have **aliases** (e.g. `vendor_id` or `vendorId`). Required columns must be present or the file will show **Schema Error**.

### Vendor Master

| Column | Required | Description / aliases |
|--------|----------|----------------------|
| vendor_id | Yes | Unique vendor ID (aliases: vendorId, Vendor ID, etc.) |
| vendor_name | Yes | Display name (aliases: vendorName, name, etc.) |
| bank_account_last4 | No | Last 4 digits of bank account |
| risk_flag_internal | No | Internal risk flag: **Y** or **N** (shell vendor detection) |
| created_by_user_id | No | User who created (aliases: createdByUserId, created_by) |

### AP Invoices

| Column | Required | Description / aliases |
|--------|----------|----------------------|
| invoice_id | Yes | Unique invoice ID (aliases: invoiceId, invoice_number, etc.) |
| vendor_id | Yes | Vendor reference |
| amount | Yes | Invoice amount (numeric) |
| invoice_date | No | Invoice date (aliases: invoiceDate, posting_date) |
| created_by_user_id | No | Creator user |
| approved_by_user_id | No | Approver user (needed for self-approval detection) |

### Payments

| Column | Required | Description / aliases |
|--------|----------|----------------------|
| payment_id | Yes | Unique payment ID |
| vendor_id | Yes | Vendor reference |
| amount | Yes | Payment amount |
| payment_date | Yes | Payment date (aliases: paymentDate, date) |
| created_by_user_id | No | User who created |

### General Ledger

| Column | Required | Description / aliases |
|--------|----------|----------------------|
| gl_entry_id | Yes | Unique GL entry ID (aliases: glEntryId, entry_id) |
| posting_date | Yes | Posting date (aliases: postingDate, date) |
| debit_amount | No | Debit amount |
| credit_amount | No | Credit amount |
| created_by_user_id | No | User who created |

### File Rules

- **Delimiter:** Comma (`,`).  
- **Header row:** First row must contain column names.  
- **Encoding:** UTF-8; BOM is stripped automatically.  
- **Quotes:** Use double quotes for fields that contain commas or newlines.

**Emphasis:** Download the **Sample Data** CSVs from Data Ingestion and use them as templates to avoid schema errors.

---

## 12. Troubleshooting

| Issue | What to check |
|-------|----------------|
| **Login fails** | Use **admin** / **admin123** or **demo** / **demo123**. Username is case-insensitive. |
| **Dashboard empty / “No Data Loaded”** | Load sample data or upload at least one CSV, then click **Analyze Data**. |
| **Cases list empty after upload** | Click **Analyze Data** on the Data Ingestion page. |
| **Upload shows “Schema Error”** | Ensure required columns exist; names can use documented aliases. Download sample CSVs and compare headers. Use comma delimiter and a header row. |
| **No cases for a pattern** | Adjust **Settings → Model Governance** thresholds (e.g. threshold ranges, off-hours, round-dollar count), then run **Analyze Data** again. |
| **Evidence or timeline empty on case** | Case may be manual (no CSV-derived evidence). Auto-generated cases should have evidence from the records that triggered the case. |
| **Data gone after refresh** | State is stored in IndexedDB and localStorage. Clearing site data or using private/incognito can wipe it. Use **Clear All Data** only when you intend to reset. |

---

## Quick Reference

- **Login:** `/login` — admin / admin123 or demo / demo123  
- **Upload / analyze:** Data Ingestion → upload or Load Sample Data → **Analyze Data**  
- **View results:** Dashboard → Cases → Case Detail  
- **Export:** Case Detail (Export Report, Evidence CSV), Cases (Export List / Export Case), Reports (Generate & Download)  
- **Thresholds:** Settings → Model Governance → edit → then **Analyze Data** again  

For technical stack and run instructions, see the main **README.md**.
