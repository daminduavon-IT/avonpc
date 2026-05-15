# Avon PC Web Platform

An enterprise-grade web application for Avon PC, providing e-commerce capabilities, quoting systems, IT asset management, and a comprehensive administrative dashboard. 

## 🚀 Tech Stack

- **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Backend/Database:** [Firebase](https://firebase.google.com/)
- **State Management & Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 📦 Features

- **Storefront & E-commerce:** Browse products with detailed views, categories, and shopping cart.
- **Quoting System:** Allow customers to request and manage price quotes.
- **User Accounts:** Registration, authentication, and profile management functionality.
- **IT Asset Management:** Track hardware specifications, service history, and lifecycle for various IT assets (laptops, desktops, printers, etc.).
- **Admin Dashboard:** Secure backend interface for managing categories, products, users, and orders.
- **Responsive Design:** Optimized for seamless experience across mobile, tablet, and desktop devices.
- **Theme Support:** Dark/Light mode support.

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd avonpc
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Ensure you have the necessary Firebase configuration and other API keys specified in your `.env` file.

### Development

Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Build for Production

To create a production-ready build:
```bash
npm run build
```
The output will be generated in the `dist` directory. You can preview the production build locally using:
```bash
npm run preview
```

### Linting & Testing

Run ESLint to check for code issues:
```bash
npm run lint
```

Run test suite via Vitest:
```bash
npm run test
```

## 📂 Project Structure

- `/src/components`: Reusable UI components including layout elements, shared widgets, and shadcn UI components.
- `/src/pages`: Top-level page components mapping to routes (e.g., MyAccount, ProductDetail, Index).
- `/src/pages/admin`: Administrative dashboard pages.
- `/src/context`: React Context providers (e.g., QuoteContext) for global application state.
- `/src/lib`: Utility functions, configuration, and Firebase services.
- `/src/hooks`: Custom React hooks used throughout the application.

## 🎨 Design System & Theming

This project adheres to the Avon PC corporate brand guidelines, featuring:
- Primary corporate colors (Navy, Green, Orange, White).
- Clean, professional, and enterprise-grade styling using Tailwind CSS.
- Extensive use of highly accessible Radix UI components configured via `shadcn/ui`.

## 📄 License

Proprietary - All rights reserved by Avon PC.
