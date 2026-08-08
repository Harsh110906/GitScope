# 🚀 GitScope — AI-Powered GitHub Repository Intelligence & Portfolio Auditor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Edge%20Functions-3ecf8e?logo=supabase)](https://supabase.com/)

**GitScope** is a comprehensive **GitHub Repository Intelligence, Code Quality Auditing, and Developer Portfolio Optimization Platform**. It helps developers, engineering leads, open-source contributors, and hiring managers evaluate repositories through **100-point deterministic scoring**, **heuristic security auditing**, **domain saturation analytics**, and **personalized career growth recommendations**.

---

## ✨ Key Features

- **🔍 Repository Intelligence Deep Dive**: Multi-pillar deterministic quality auditing across 6 core categories (Documentation, Code Organization, Maintenance, Testing/CI-CD, Security, and Contribution Readiness).
- **🔒 Private Pre-Check Evaluator**: On-device project pre-release scoring simulator allowing developers to diagnose readiness before publishing or sharing.
- **🛡️ Heuristic Secret Redaction Pipeline**: Multi-tier detection that redacts sensitive credentials (GitHub PATs, AWS keys, Google API keys, Bearer tokens) before generating review snippets.
- **👤 GitHub Developer Profile Analyzer**: 5-tier developer level grading (*Junior Builder* to *Elite Thought Leader*) and 5-axis radar quality signals.
- **💡 Personalized Project Recommender**: AI-tailored high-impact project ideas designed to address specific developer profile gaps.
- **⚖️ Project Compare Matrix**: Side-by-side comparative quality benchmarking for up to 3 repositories.
- **📑 Granular Evidence Drawers**: Direct file-level evidence badges (`EV-XXX-YY`) validating each score point.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend & Serverless**: Supabase Edge Functions (Deno / TypeScript)
- **Database & Auth**: PostgreSQL 15+ (with Row Level Security, pg_advisory_xact_lock atomic quota claiming), Supabase Auth (GitHub OAuth & Email)
- **APIs**: GitHub REST API v3

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Harsh110906/GitScope.git
   cd GitScope
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
