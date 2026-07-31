# Hawrisha Bazaar 🧦

A modern, full-stack multi-vendor e-commerce platform built as a clean, scalable monorepo comprising a customer-facing e-commerce storefront, an administrative and vendor control dashboard, and a Node.js/Express REST API backend with a MySQL database.

---

## 📁 Monorepo Structure

```text
hawrisha-bazaar/
│
├── website/              # Customer-facing e-commerce storefront (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── dashboard/            # Admin & Vendor control dashboard (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/              # Node.js + Express REST API server & MySQL connection
│   ├── config/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── .gitignore            # Root Git ignore rules
├── package.json          # Root Monorepo configuration
└── README.md             # Project documentation
```

---

## 🛠️ Technologies Used

- **Frontend (Website & Dashboard)**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend API**: Node.js, Express.js, MySQL2 (with connection pooling), CORS, Multer (file uploads)
- **Database**: MySQL 8.0 with automated schema initialization and seeders
- **Monorepo Architecture**: NPM Workspaces

---

## ⚙️ Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShangaBashir/Hawrisha-baaar.git
   cd Hawrisha-baaar
   ```

2. **Install dependencies for all applications**:
   ```bash
   npm install
   ```

---

## 🔐 Environment Variable Setup

### 1. Backend (`/backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update the parameters:
```env
PORT=5001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=hawrisha_db
EMAIL_USER=hawrishaa@gmail.com
EMAIL_PASS=your_email_password
```

### 2. Website (`/website/.env`)
Copy `website/.env.example` to `website/.env`:
```env
VITE_API_URL=http://localhost:5001
```

### 3. Dashboard (`/dashboard/.env`)
Copy `dashboard/.env.example` to `dashboard/.env`:
```env
VITE_API_URL=http://localhost:5001
```

---

## 🚀 How to Run the Applications

### 1. Run the Backend API
```bash
# Run backend server directly
npm run dev:backend

# Or navigate to backend folder:
cd backend
npm start
```
The backend server runs on `http://localhost:5001` and automatically initializes the database schema and seed data.

### 2. Run the Customer Website
```bash
# From the root directory:
npm run dev:website

# Or navigate to website folder:
cd website
npm run dev
```
The storefront runs on `http://localhost:5173`.

### 3. Run the Admin/Store Dashboard
```bash
# From the root directory:
npm run dev:dashboard

# Or navigate to dashboard folder:
cd dashboard
npm run dev
```
The dashboard runs on `http://localhost:5174`.

---

## 🔌 API Connection Information

Both the **Website** (`http://localhost:5173`) and **Dashboard** (`http://localhost:5174`) connect seamlessly to the **Backend API** on `http://localhost:5001`. Vite dev proxies are configured to route `/api` requests directly to `http://localhost:5001/api`.

### Healthcheck Endpoint
Verify backend status at:
`GET http://localhost:5001/api/health`
Response: `{"status":"OK","message":"Backend service is online"}`
