# TechM4India Enterprise ERP — Client Handover & Testing Guide

Welcome to the **TechM4India Enterprise ERP Workspace**. This document is designed for executive leadership, stakeholders, and department managers to test and explore all features of the newly revamped ERP platform.

---

## 1. Quick Access Information

| Resource | Link / Value |
| :--- | :--- |
| **Live ERP Portal** | [https://techm4india-website.vercel.app/login](https://techm4india-website.vercel.app/login) |
| **Public Website** | [https://techm4india-website.vercel.app](https://techm4india-website.vercel.app) |
| **Universal Demo Password** | `TechM4India!2026` |
| **Recommended Browser** | Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari |

> **Pro Tip**: If you have opened the website previously, press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) once on the login page to ensure your browser has the newest update.

---

## 2. How to Sign In (3 Simple Steps)

1. Open **[https://techm4india-website.vercel.app/login](https://techm4india-website.vercel.app/login)** in your browser.
2. Enter any demo email from the table below (for example, `admin@techm4india.com` or `ceo@techm4india.com`).
3. Enter the password: **`TechM4India!2026`** and click **"Sign In to ERP"**.

You will be redirected straight to your role's personalized dashboard.

---

## 3. The "Switch Persona" Feature (Test All Roles In Seconds)

You do **not** need to log out and log back in to test different employees and roles.

Once signed into the ERP:
1. Look at the top-right header bar.
2. Click the button that says **`⚡ Switch Persona`**.
3. A menu will appear showing all **20 enterprise roles** (Founder, HR Manager, Finance, Sales, etc.).
4. Click on any persona to immediately switch views. The navigation sidebar and permissions will instantly adapt to that exact role.

---

## 4. Key Testing Scenarios (What to Test)

Here are the 5 most important workflows to try:

### Test 1: Executive Command Center & KPIs
- **Best Role to Use**: `ceo@techm4india.com` or `admin@techm4india.com`
- **Where to go**: Click **"Dashboard"** in the left sidebar (`/erp/dashboard` or `/erp/founder/dashboard`).
- **What to look for**:
  - Live revenue metrics, learner enrollment charts, and operational health indicators.
  - Notice the Singapore Cloud Database status pill in the top bar showing live synchronization.

### Test 2: Employee Directory & Adding Team Members
- **Best Role to Use**: `hrmanager@techm4india.com`
- **Where to go**: Click **"Employees"** in the sidebar (`/erp/employees`).
- **What to do**:
  - Browse through the directory of 20 pre-seeded corporate team members across Engineering, Solutions, Schools, and Space divisions.
  - Click **"+ Add Team Member"** in the top right to open the structured employee onboarding form.

### Test 3: CRM Pipeline & Deal Management
- **Best Role to Use**: `salesmanager@techm4india.com` or `salesexecutive@techm4india.com`
- **Where to go**: Click **"CRM Pipeline"** (`/erp/leads`).
- **What to do**:
  - Review the active institutional deals, lead stages (Lead, Contacted, Proposal, Won), and values in Indian Rupees (₹).
  - Click **"+ Add Lead"** to test creating a prospective client lead.

### Test 4: Financial Operations & Budget Tracking
- **Best Role to Use**: `financemanager@techm4india.com`
- **Where to go**: Click **"Finance"** (`/erp/finance`).
- **What to do**:
  - View invoices, disbursement queues, and GST accounting registers.
  - Try switching to `financeexecutive@techm4india.com` using the **`⚡ Switch Persona`** button to see how executive approval buttons are restricted for operational staff.

### Test 5: Partner Institutions & Academic Programs
- **Best Role to Use**: `academichead@techm4india.com` or `institutionadmin@techm4india.com`
- **Where to go**: Click **"Institutions"** (`/erp/institutions`) and **"Programs"** (`/erp/learning`).
- **What to do**:
  - Inspect partner universities and schools, student counts, and program renewal health scores.

---

## 5. Complete Demo Accounts Directory

Every account uses the password: **`TechM4India!2026`**

| Scope | Role Title | Demo Email | Name & Designation |
| :--- | :--- | :--- | :--- |
| **System** | **Super Admin** | `admin@techm4india.com` | Kavita Sharma (Chief Technology & Systems Officer) |
| **Executive** | **Founder / CEO** | `ceo@techm4india.com` | Arjun Rao (Founder & CEO) |
| **Executive** | **Director** | `director@techm4india.com` | Dr. Vikram Malhotra (Executive Director) |
| **Operations** | **Division Head** | `divisionhead@techm4india.com` | Priya Nair (Vice President & Division Head) |
| **HR** | **HR Manager** | `hrmanager@techm4india.com` | Ananya Deshmukh (Lead Human Resources Manager) |
| **HR** | **HR Executive** | `hrexecutive@techm4india.com` | Rohan Gupta (HR Operations Executive) |
| **Finance** | **Finance Manager** | `financemanager@techm4india.com` | Rajesh Kulkarni (Financial Controller & Manager) |
| **Finance** | **Finance Executive** | `financeexecutive@techm4india.com` | Sneha Patil (Senior Finance Executive) |
| **CRM** | **Sales Manager** | `salesmanager@techm4india.com` | Amitabh Sen (Head of Institutional Partnerships) |
| **CRM** | **Sales Executive** | `salesexecutive@techm4india.com` | Kavya Reddy (Enterprise Account Executive) |
| **Marketing** | **Marketing Manager** | `marketingmanager@techm4india.com` | Deepak Verma (Head of Growth & Communications) |
| **Engineering** | **Project Manager** | `projectmanager@techm4india.com` | Neha Sundaram (Senior Technical Project Manager) |
| **Academics** | **Faculty / Trainer** | `faculty@techm4india.com` | Prof. Suresh Iyer (Lead STEM Curriculum Specialist) |
| **Students** | **Student** | `student@techm4india.com` | Aarav Patel (Aerospace Engineering Scholar) |
| **Partners** | **Institution Admin** | `institutionadmin@techm4india.com` | Dr. Sunita Kapoor (Dean of Academic Collaborations) |
| **Content** | **Content Manager** | `contentmanager@techm4india.com` | Tanvi Joshi (Digital Learning & Media Lead) |
| **IT** | **IT Admin** | `itadmin@techm4india.com` | Karthik Raman (Systems Infrastructure Engineer) |
| **Vendors** | **Vendor Partner** | `vendor@techm4india.com` | Harish Mehta (Authorized Hardware Supplier) |
| **Staff** | **Employee (General)**| `employee@techm4india.com` | Aryan TechM4India (Robotics Engineer) |
| **Audit** | **Viewer (Auditor)** | `viewer@techm4india.com` | Aditi Rao (Compliance & Quality Assurance) |

---

## 6. What Was Polished & Improved

- **Modern SaaS UI**: Overhauled from basic forms to an executive workspace inspired by Linear and Stripe Dashboard designs.
- **Enterprise Data Density**: High-contrast typography, clear tabular alignments, and currency formatting in ₹ (INR).
- **Clean Official Login**: 100% professional sign-in interface without test banners, dev selector buttons, or exposed passwords.
- **Persistent Cloud Database**: Connected to PostgreSQL 16 on Render (Singapore), ensuring data persists across test sessions.
- **Seamless Performance**: Automatic API routing through Vercel edge proxy for instant response times with zero network errors.

---

## 7. Need Help or Have Feedback?

If you encounter any questions or would like to request customizations:
- **Technical Contact**: Engineering Team (`tech@techm4india.com`)
- **Portal Link**: [https://techm4india-website.vercel.app/login](https://techm4india-website.vercel.app/login)
