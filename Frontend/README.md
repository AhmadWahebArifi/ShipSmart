# ShipSmart Frontend

React frontend application for ShipSmart logistics management system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   The app will automatically open at http://localhost:3000

## 📁 Project Structure

```
Frontend/
├── index.html              # HTML template (Vite entry point)
├── src/
│   ├── App.jsx             # Main App component
│   ├── App.css             # App styles (minimal, uses TailwindCSS)
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles (TailwindCSS directives)
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3.4
- **Routing:** React Router DOM
- **HTTP Client:** Axios

## 📝 Available Scripts

- `npm run dev` - Start development server (runs on port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔌 API Configuration

The app is configured to proxy API requests to the backend at `http://localhost:5000`. This is set in `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

Make sure the backend server is running before starting the frontend.

## 📝 Next Steps

1. Set up React Router for navigation
2. Create components for different pages
3. Implement authentication context
4. Create API service layer
5. Add form validation
6. Implement state management (if needed)

