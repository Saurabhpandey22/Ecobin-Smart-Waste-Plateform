# Contributing to EcoBin 🌱

Thank you for your interest in contributing to **EcoBin — Smart Waste Management Platform**! We welcome contributions to make our cities cleaner and smarter.

## 📋 Code of Conduct
Please ensure a respectful and inclusive environment for everyone. Constructive feedback, kindness, and collaboration are expected.

## 🛠️ Getting Started
1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Ecobin-Smart-Waste-Plateform.git
   cd Ecobin-Smart-Waste-Plateform
   ```
3. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📦 Setting Up Development Environment

### Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing Your Changes
Before pushing, ensure both frontend and backend build without errors:
```bash
# In frontend directory
npm run build

# In backend directory
node -c server.js
```

## 🚀 Submitting a Pull Request
1. Commit your changes with a clear conventional commit message:
   ```bash
   git commit -m "feat(map): add custom bin status markers"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request against the `main` branch with a description of the changes.

Thank you for contributing to **Swachh Bharat**! 🇮🇳
