# Urban Spoon — Fine Dining Restaurant (MERN Stack)

Welcome to **Urban Spoon**, a modern, responsive full-stack MERN restaurant web application. Urban Spoon allows users to explore categorized gourmet menus, learn about the restaurant's culinary philosophy, view contact timings and location details, submit table inquiries stored in MongoDB Atlas, and view real-time reservation inquiries via a dedicated admin portal.

---

## 📸 Overview & Features

### 🌟 Level 1 — Basic Website Layout
- **Branding & Layout**: Clean, elegant dark aesthetic with warm gold/amber accents.
- **Header & Navigation**: Sticky navbar with active route highlighting, brand logo, and responsive mobile hamburger menu.
- **Hero Section**: Dramatic gourmet food visual with smooth zoom animation, restaurant tagline, and interactive CTAs.
- **Welcome & Story**: Introduction highlighting culinary artistry, farm-fresh ingredients, and chef features.
- **Footer**: Full address, opening hours, navigation links, and social links.

### 🍽️ Level 2 — Menu & Categorization
- **Curated Menu**: 18 signature dishes across 4 categories (**Starters**, **Main Course**, **Desserts**, **Beverages**).
- **Dish Details**: Name, pricing in INR (₹), detailed ingredient descriptions, category badges, and emoji icons.
- **About Section**: High-resolution restaurant interior visuals, key milestones (6+ years, 50+ dishes, 10k+ guests), and cuisine tags.
- **Responsive Menu Grid**: 3-column desktop layout that cleanly scales to 2 columns on tablets and single-column on mobile.

### 📍 Level 3 — Contact & Opening Timings
- **Contact Info**: Interactive cards for Address, Phone, and Email with quick-action links.
- **Opening Hours**: Full weekly schedule with dynamic **"Today"** highlighting.
- **Location Section**: Embedded map frame with floating pin marker and interactive hover inspection.
- **Design Tokens**: Standardized CSS variables for smooth transitions, border radii, shadows, and accessible contrast.

### 📝 Level 4 — Table Inquiry & MongoDB Atlas Persistence
- **Table Inquiry Form**: Reservation form capturing:
  - **Full Name** (string, required)
  - **Phone Number** (string, required, validated format)
  - **Preferred Date** (date picker, min date tomorrow)
  - **Number of Guests** (numeric, 1–20 guests)
- **Validation**: Strict validation on both Client and Express API.
- **RESTful API**: `POST /api/inquiries` creates records persisted in **MongoDB Atlas** cloud database with Mongoose schema validation.
- **Confirmation Summary**: Animated success screen displaying all submitted reservation details with an option to book another table.

### ⚡ Level 5 — Advanced UI, Filtering & Admin Portal
- **Menu Filtering & Instant Search**: Live category filter buttons + keyword search across dishes and descriptions with count indicators.
- **Admin Dashboard (`/admin`)**: Real-time table inquiry management interface with search, refresh trigger, formatted dates, and status summaries directly connected to MongoDB Atlas.
- **UI/UX Polish**: Glassmorphism, smooth hover elevations, interactive button states, and micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Vanilla CSS3 (Custom Design System & Tokens) |
| **Backend** | Node.js, Express.js, Mongoose ODM, CORS, Dotenv |
| **Database** | **MongoDB Atlas** (Remote Cloud Database Cluster) |
| **Frontend Hosting** | **Vercel** (Production SPA with client-side rewrites) |
| **Backend Hosting** | **Render** (Production Cloud Web Service) |
| **Fonts & Icons** | Google Fonts (*Playfair Display*, *Inter*), Custom SVG Icons |

---

## 📂 Project Architecture

```text
Urban Spoon/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js           # Centralized Axios client with configurable base URL
│   │   ├── assets/              # High-res photography (Hero, About)
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── Navbar.jsx & .css
│   │   │   ├── Hero.jsx & .css
│   │   │   ├── AboutSection.jsx & .css
│   │   │   ├── MenuCard.jsx & .css
│   │   │   ├── MenuFilter.jsx & .css
│   │   │   ├── ContactInfo.jsx & .css
│   │   │   ├── OpeningHours.jsx & .css
│   │   │   ├── MapPlaceholder.jsx & .css
│   │   │   ├── InquiryForm.jsx & .css
│   │   │   ├── ConfirmationSummary.jsx & .css
│   │   │   └── Footer.jsx & .css
│   │   ├── data/
│   │   │   └── menuData.js      # Categorized menu items dataset
│   │   ├── pages/
│   │   │   ├── Home.jsx & .css
│   │   │   ├── Menu.jsx & .css
│   │   │   ├── Contact.jsx & .css
│   │   │   └── Admin.jsx & .css
│   │   ├── App.jsx              # Routing configuration
│   │   ├── index.css            # Global CSS custom properties & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json              # SPA client rewrite rules
│   └── vite.config.js           # Port 3000 & /api proxy to port 5000
│
├── server/                      # Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   └── inquiryController.js # Inquiry CRUD logic with validation
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   └── Inquiry.js           # Mongoose Inquiry Schema
│   ├── routes/
│   │   └── inquiryRoutes.js     # /api/inquiries router
│   ├── .env                     # Server environment variables (Git ignored)
│   ├── .env.example             # Environment template
│   ├── package.json
│   └── server.js                # Express app entrypoint with health & welcome routes
│
├── vercel.json                  # Root Vercel build & deployment configuration
├── package.json                 # Root script runner
├── .gitignore                   # Excludes node_modules, .env, plan.md
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with an active cluster and database user.

---

### 1. Environment Configuration

#### Backend (`server/.env`)
Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_username>:<db_password>@urbanspoon.i9ggaxo.mongodb.net/urbanspoon?retryWrites=true&w=majority&appName=UrbanSpoon
```

#### Frontend (`client/.env` or Vercel Environment Variables)
For local development, Vite proxies `/api` requests directly to `localhost:5000`. For cloud deployment, configure:

```env
VITE_API_BASE_URL=https://<your-backend-service>.onrender.com
```

---

### 2. Running the Application Locally

You can run both client and server:

#### Terminal 1 — Start Express Backend:
```bash
cd server
npm start
```
> Server runs on **http://localhost:5000** and connects to **MongoDB Atlas**.

#### Terminal 2 — Start React Frontend:
```bash
cd client
npm run dev
```
> Frontend runs on **http://localhost:3000**

---

## 📡 API Reference

### Welcome & Health
- `GET /` — API welcome message, service status, and endpoints directory
- `GET /api/health` — Checks server and service health

### Table Inquiries
- `POST /api/inquiries` — Submit a table reservation inquiry (saves directly to MongoDB Atlas)
  - **Body (JSON):**
    ```json
    {
      "name": "Aarav Sharma",
      "phone": "+91 98765 12345",
      "date": "2026-09-15",
      "guests": 4
    }
    ```
  - **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Table inquiry submitted successfully",
      "data": { ... }
    }
    ```

- `GET /api/inquiries` — Retrieve all table inquiries for the Admin Portal (queried from MongoDB Atlas)
  - **Response (200 OK):**
    ```json
    [
      {
        "_id": "6a96...",
        "name": "Aarav Sharma",
        "phone": "+91 98765 12345",
        "date": "2026-09-15T00:00:00.000Z",
        "guests": 4,
        "createdAt": "2026-09-01T13:11:50.737Z"
      }
    ]
    ```

---

## 🧪 Testing Checklist & Verification

- [x] **Home Page**: Hero visuals, responsive navbar, welcome section, about section, footer.
- [x] **Menu Page**: Category filtering, real-time live search, item cards with prices and descriptions.
- [x] **Contact Page**: Contact cards, weekly opening hours with "Today" badge, interactive map, table inquiry form.
- [x] **Table Inquiry**: Client-side validation, backend API validation, **MongoDB Atlas cloud persistence**, confirmation summary card.
- [x] **Admin Portal**: Real-time retrieval of submitted table inquiries from MongoDB Atlas, search filter, formatted dates.
- [x] **Cloud Deployment**: Backend deployed on **Render**, Frontend deployed on **Vercel**, Database hosted on **MongoDB Atlas**.
- [x] **Responsive Layout**: Mobile navigation, adaptive grids, flexbox layouts tested for mobile, tablet, and desktop screens.
