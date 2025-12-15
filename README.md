# 🛡️ Next-Gen RBAC System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

> **A production-grade, secure, and scalable Role-Based Access Control (RBAC) system built for the modern web.**

<div align="center">
  <a href="https://your-live-preview-link.com">
    <img src="https://img.shields.io/badge/🚀_Live_Preview-View_Demo-2ea44f?style=for-the-badge&logo=vercel" alt="Live Preview" />
  </a>
</div>

---

## 🚀 Overview

The **RBAC System** is a comprehensive reference implementation for managing user identities, roles, and permissions in a secure web environment. Built on the cutting-edge **Next.js 15** framework, it leverages **Server Actions**, **MongoDB**, and **NextAuth.js** to deliver a robust and type-safe experience.

Whether you're building an enterprise dashboard or a SaaS platform, this project provides the foundational security architecture needed to scale with confidence.

### 🌟 Key Features

*   **🔐 Granular RBAC**: Define complex role hierarchies and granular permissions (e.g., `read:posts`, `delete:users`) with a schema-driven engine.
*   **🛡️ Enterprise Security**: Fortified with middleware protection, bcrypt password hashing, and secure session management.
*   **🎨 Modern UI/UX**: A stunning, responsive interface built with **Shadcn UI** and **Tailwind CSS**, featuring a polished dark mode.
*   **⚡ High Performance**: Optimized server-side rendering (SSR) and static generation for lightning-fast page loads.
*   **📱 Fully Responsive**: Seamless experience across desktop, tablet, and mobile devices.
*   **📝 Content Management**: Integrated posting system with public and private views, tailored to user permission levels.

---

## 📸 Screenshots

### User Management
*Efficiently manage users, assign roles, and control access levels.*
![User Management Screenshot](/public/images/usermanagement.png)

### Permission Management
*Define and configure granular permissions for enhanced security.*
![Permission Management Screenshot](/public/images/permissonsmanagemnet.png)

### Posts Management
*Create, view, and manage content with ease, tailored to user roles.*
![Posts Management Screenshot](/public/images/postsmanagemnet.png)

### Role Management
*Intuitively create roles and assign permissions using our drag-and-drop style interface.*
![Role Management Screenshot](/public/images/rolesmanagement.png)

### Secure Authentication
*Beautiful, centered, and validated login and registration pages.*
![Login Page Screenshot](/public/images/signin.png)

### Registration
*Seamless user onboarding with validation.*
![Registration Page Screenshot](/public/images/signup.png)

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5 Beta / Auth.js)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js** (v18.17 or later)
*   **MongoDB** (Local instance or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/rbac-system.git
    cd rbac-system
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database Connection
    MONGODB_URI=mongodb://localhost:27017/rbac-db

    # NextAuth Configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-super-secret-key-change-this

    # Optional: Initial Admin Setup (if applicable)
    # FIRST_ADMIN_EMAIL=admin@example.com
    # FIRST_ADMIN_PASSWORD=securepassword
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Access the application**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── (auth)/         # Public auth routes (login, register)
│   ├── admin/          # Protected admin routes (users, roles)
│   ├── dashboard/      # User dashboard & private posts
│   └── api/            # Backend API routes
├── components/         # React components
│   ├── ui/             # Reusable Shadcn UI components
│   └── dashboard/      # Dashboard-specific components
├── lib/                # Utility functions & DB connection
├── models/             # Mongoose database models
└── types/              # TypeScript type definitions
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <b>Umer Javed</b>
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/umerrjaved/">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0077b5?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="https://portfolio-umer-pro.vercel.app/">
    <img src="https://img.shields.io/badge/Portfolio-Visit-ff69b4?style=for-the-badge&logo=kofi" alt="Portfolio" />
  </a>
</p>
