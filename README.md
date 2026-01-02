# Evolution Bulk Sender

A modern, beautiful WhatsApp bulk messaging application built with React + Vite, designed to work with [Evolution API](https://github.com/EvolutionAPI/evolution-api).

![Evolution Bulk Sender](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

- 📱 **Instance Management** - Create and manage multiple WhatsApp connections
- 📤 **Bulk Messaging** - Send messages to thousands of contacts
- 📎 **Media Support** - Attach images, videos, and documents
- ⏱️ **Custom Delays** - Set random delays between messages
- 📊 **Real-time Logs** - Monitor sending progress live
- 🎨 **Modern UI** - Beautiful glassmorphism design with animations

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## 🐳 Docker Deployment

### Option 1: Run Everything with Docker Compose (Recommended)

This will start both the Bulk Sender app and Evolution API:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Bulk Sender: http://localhost:3000
- Evolution API: http://localhost:8080

### Option 2: Build & Run Only the Bulk Sender

```bash
# Build the image
docker build -t evolution-bulk-sender .

# Run the container
docker run -d -p 3000:80 --name bulk-sender evolution-bulk-sender
```

### Environment Variables (for docker-compose)

Create a `.env` file:

```env
EVOLUTION_API_KEY=your-secure-api-key-here
```

## ⚙️ Configuration

1. Open the app and go to **Settings**
2. Enter your Evolution API URL (e.g., `http://localhost:8080`)
3. Enter your Evolution API Key
4. Click **Save Configuration**

## 📁 Project Structure

```
evolution-bulk-sender/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── services/
│   │   └── api.js       # Evolution API service
│   └── main.jsx         # Entry point
├── Dockerfile           # Docker build file
├── docker-compose.yml   # Docker Compose configuration
├── nginx.conf           # Nginx configuration for production
└── package.json
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 7
- **Styling:** CSS with Glassmorphism
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Server:** Nginx (production)

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
