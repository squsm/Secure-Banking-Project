# 🏦 NovBank — Full Stack MERN Banking App

A fully functional banking application built with **MongoDB, Express, React, and Node.js (MERN stack)**.

---

## 📁 Project Structure

```
banking-app/
├── backend/                  ← Node.js + Express Server
│   ├── models/
│   │   ├── User.js           ← MongoDB User schema
│   │   └── Transaction.js    ← MongoDB Transaction schema
│   ├── routes/
│   │   ├── authRoutes.js     ← Register, Login, /me
│   │   ├── accountRoutes.js  ← Deposit, Withdraw, Transfer
│   │   └── transactionRoutes.js ← History, Stats
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT token verification
│   ├── .env                  ← Environment variables
│   ├── server.js             ← Express app entry point
│   └── package.json
│
├── frontend/                 ← React App
│   ├── public/
│   │   └── index.html        ← Single HTML file React mounts into
│   └── src/
│       ├── context/
│       │   └── AuthContext.js ← Global auth state (React Context)
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── Dashboard.js  ← Balance, charts, quick actions
│       │   ├── TransferPage.js
│       │   └── TransactionsPage.js
│       ├── components/
│       │   └── Layout.js     ← Sidebar + Outlet
│       ├── utils/
│       │   └── api.js        ← Axios API calls
│       ├── App.js            ← React Router setup
│       ├── index.js          ← React entry point
│       └── index.css         ← Global styles
│
├── package.json              ← Root (runs both servers)
└── README.md
```

---

## 🛠 How the MERN Stack Works Together

### 🟢 MongoDB
**What it is:** A NoSQL database that stores data as JSON-like documents.

**In this project:**
- Stores `User` documents (name, email, hashed password, balance, account number)
- Stores `Transaction` documents (amount, type, description, balanceAfter)
- We connect to it via **Mongoose** (an ODM that gives us schemas and models)

```js
// Example: Finding a user by email
const user = await User.findOne({ email: "john@example.com" });
```

---

### 🟡 Express.js
**What it is:** A minimal web framework for Node.js that handles HTTP requests.

**In this project:**
- Defines our REST API routes (`POST /api/auth/login`, `GET /api/transactions`, etc.)
- Uses **middleware** like `express.json()` (parse request bodies) and our custom `protect` middleware (verify JWT tokens)
- Groups related routes into separate files using `express.Router()`

```js
// Example route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // ... validate and respond
  res.json({ token: "..." });
});
```

---

### 🟠 React
**What it is:** A JavaScript library for building interactive UIs as reusable components.

**In this project:**
- `useState` — local component state (form inputs, loading, errors)
- `useEffect` — fetch data when a component loads
- `useContext` — share auth state across all components without prop drilling
- `React Router DOM` — client-side navigation without page reloads
- `Recharts` — charting library for balance history graph

```jsx
// Example component with hooks
const [balance, setBalance] = useState(0);
useEffect(() => {
  getBalance().then(({ data }) => setBalance(data.balance));
}, []); // runs once on mount
```

---

### 🔵 Node.js
**What it is:** A JavaScript runtime that lets us run JS on the server (outside the browser).

**In this project:**
- Powers the entire backend server
- Uses `npm` for package management
- Runs our Express app, connects to MongoDB, handles file I/O

---

## 🚀 Setup & Running

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally **OR** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster

### 1. Install Dependencies

```bash
# From the root banking-app/ folder:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure MongoDB

**Option A — Local MongoDB:**
Make sure MongoDB is running (`mongod`). The default `.env` already points to `localhost`.

**Option B — MongoDB Atlas (Cloud):**
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string (looks like `mongodb+srv://...`)
3. Replace `MONGO_URI` in `backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/novbank
```

### 3. Run the App

**Option A — Run both together from root:**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 — Backend
cd backend
npm run dev      # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start        # runs on http://localhost:3000
```

### 4. Open in Browser
Visit: **http://localhost:3000**

Register a new account → you'll start with a **$5,000 demo balance** ✓

---

## 🔐 Features

| Feature | Description |
|---|---|
| Register / Login | JWT-based authentication with bcrypt password hashing |
| Dashboard | Live balance, stats, balance history chart |
| Deposit | Add funds to your checking account |
| Withdraw | Remove funds with category tagging |
| Transfer | Send money to other NovBank accounts by account number |
| Transactions | Full history with search & filter |
| Protected Routes | Auth middleware on all sensitive API endpoints |

---

## 🔑 Key Technologies

| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM (schemas & models) |
| `jsonwebtoken` | Create & verify JWT tokens |
| `bcryptjs` | Hash passwords securely |
| `dotenv` | Load environment variables |
| `cors` | Allow frontend to call backend |
| `react` | UI component library |
| `react-router-dom` | Client-side routing (SPA) |
| `axios` | HTTP client for API calls |
| `recharts` | Charts & data visualization |
| `concurrently` | Run backend + frontend together |

---

## 🔒 Security Notes

- Passwords are **never stored in plain text** — bcrypt hashes them
- JWT tokens expire after 7 days
- All account/transaction routes require a valid JWT token
- The `select: false` on the password field prevents accidental exposure

---

*Built as a learning project demonstrating the complete MERN stack.*
