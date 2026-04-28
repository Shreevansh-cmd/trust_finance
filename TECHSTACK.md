# Project Tech Stack

This document outlines the technologies, frameworks, and libraries used to build this full-stack application.

## 🎨 Frontend

- **React** (`^19.2.5`): Core UI library for building the user interface.
- **Vite** (`^8.0.10`): Next-generation frontend tooling used for fast compilation and local development server.
- **Tailwind CSS** (`^4.2.4`): Utility-first CSS framework for rapid and responsive UI styling.
- **React Router DOM** (`^7.14.2`): Library for role-based routing and navigation between pages (Login, Dashboard, Admin).
- **Framer Motion** (`^12.38.0`): Production-ready animation library used for fluid transitions, micro-interactions, and page load animations.
- **Recharts** (`^3.8.1`): Composable charting library built on React components, used for rendering dynamic financial trends.
- **React Hot Toast** (`^2.6.0`): Notification library for displaying sleek, interactive toast messages.
- **Axios** (`^1.15.2`): Promise-based HTTP client for making API requests to the backend.
- **Lucide React** (`^1.11.0`): Clean and modern SVG icon library used throughout the dashboard and navigation.
- **clsx & tailwind-merge**: Utilities for conditionally joining and merging tailwind class names safely.

## ⚙️ Backend

- **Python**: Core programming language.
- **FastAPI**: Modern, high-performance web framework used for building the RESTful API endpoints.
- **Uvicorn**: Lightning-fast ASGI server implementation used to run the FastAPI application.
- **Pydantic**: Data validation and settings management using Python type annotations.
- **Data Persistence (Architecture)**: 
  - *Current*: Custom in-memory state management (`store.py`) enabling instantaneous simulations and interactions.
  - *Dependencies Included*: `sqlalchemy` for future SQLite/PostgreSQL transition.

## 🛠️ Tools & Environment

- **Node.js / npm**: Package management for the frontend ecosystem.
- **ESLint**: JavaScript linting utility for maintaining code quality.
- **PostCSS**: Tool for transforming CSS with JavaScript plugins.
