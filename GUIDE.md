# 📚 Library Catalogue & Book Search System — Quick Setup Guide

This project is a modern Library Management Web Application powered by a self-balancing **C++ AVL Tree engine** for $O(\log n)$ search/insert/delete operations and a **React frontend** utilizing Vite.

Unlike memory-heavy enterprise projects that require setting up complex MongoDB Atlas database clusters, this project utilizes **C++ File Handling** (`backend/data/books.json`) as a local database engine. This satisfies local persistence requirements while keeping the project 100% portable and easy to run/evaluate.

---

## ⚙️ Project Environment
- Find the `.env` file in the **project root directory** (`.env`).
- Open it with any text editor (like Notepad, TextEdit, or VS Code) to view the configured host/port values.

---

## 🍎 macOS / 🐧 Linux Setup

### 1. Install Libraries
Open your Terminal and run this command to install the required build tools:
- **macOS**:
  ```bash
  brew install cmake node
  ```
- **Linux** (Ubuntu/Debian):
  ```bash
  sudo apt update && sudo apt install -y build-essential cmake nodejs npm
  ```

### 2. Full Autopilot Setup
Run the single automation script in your Terminal to compile the C++ server and launch both applications:
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Steps (Alternative)
- **Start the Backend**:
  ```bash
  chmod +x run-backend.sh
  ./run-backend.sh
  ```
- **Start the Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🪟 Windows Setup

### 1. Requirements
Ensure you have the following installed on your computer:
1. **MinGW GCC Compiler** (Ensure `g++` is added to your environment `PATH`).
2. **Node.js** and **CMake**.

### 2. Full Windows Autopilot setup
Double-click the **`setup-windows.bat`** file in the project root folder. It will:
1. Automatic sanity checks for CMake, Node.js, and GNU G++ compiler.
2. Build the C++ executable using `MinGW Makefiles`.
3. Auto-launch the C++ server and Vite React development server in separate windows.

### 3. Manual Steps (Alternative)
- **Run the C++ Backend**:
  Open PowerShell in the `backend` folder and run:
  ```powershell
  mkdir build
  cd build
  cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
  cmake --build .
  .\library_server.exe
  ```
- **Run the React Frontend**:
  Open Windows Terminal / Terminal in the `frontend` folder and run:
  ```cmd
  npm install
  npm run dev
  ```

---

## 🌐 Application URL
Once both servers are running, browse to:
👉 **[http://localhost:5173](http://localhost:5173)**

The frontend automatically proxies `/api` requests to the locally hosted C++ server on **`port 8080`**.
