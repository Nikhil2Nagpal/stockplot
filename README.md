# StockPilot - Product Inventory Management System

StockPilot is a full-stack web application designed for efficient product inventory management. It provides core features like search, filtering, inline editing, CSV import/export, and inventory change history tracking.

## Live Demo

*   **Frontend:** [Link to your deployed frontend on Vercel/Netlify]
*   **Backend:** [The backend is integrated into the Next.js app via API Routes]

## Features

*   **Dashboard:** A comprehensive table view of all products.
*   **Search & Filter:** Instantly search for products by name or filter by category.
*   **Inline Editing:** Quickly edit product details directly in the table.
*   **Add & Delete Products:** Easily add new products or remove existing ones.
*   **CSV Management:** Bulk import products from a CSV file and export your entire inventory to CSV.
*   **Inventory History:** View a detailed log of stock changes for any product in a slide-in panel.
*   **Status Indicators:** At-a-glance product status (`In Stock` / `Out of Stock`) with color-coded badges.
*   **Responsive Design:** Fully functional and visually appealing on both desktop and mobile devices.
*   **Notifications:** User-friendly toast notifications for actions like import, export, and updates.

## Technical Stack

*   **Frontend:** Next.js (React)
*   **Backend:** Next.js API Routes (Node.js runtime)
*   **Database:** SQLite
*   **Styling:** Tailwind CSS with shadcn/ui components
*   **CSV Parsing:** PapaParse

## Project Structure

```
stockpilot/
├── db/                     # SQLite database file will be created here
├── public/                 # Public assets
├── src/
│   ├── app/
│   │   ├── _components/    # React components for the inventory page
│   │   ├── api/            # Backend API route handlers
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main entry point (Server Component)
│   ├── lib/
│   │   ├── db.ts           # SQLite database connection and initialization
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # Utility functions
│   ├── components/
│   │   └── ui/             # Reusable UI components (shadcn/ui)
├── package.json
└── tailwind.config.ts
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stockpilot.git
cd stockpilot
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Initialize the Database

The application uses an SQLite database. The database file and tables will be created automatically when you first run the application. It will also be seeded with some initial sample data. The database file `stockpilot.db` will be created in the project's root directory.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:9002`.

## API Endpoints

The backend is implemented using Next.js API Routes.

*   `GET /api/products`: Get a list of all products.
    *   Query Params: `category` (e.g., `/api/products?category=Electronics`)
*   `GET /api/products/search`: Search for products by name.
    *   Query Params: `name` (e.g., `/api/products/search?name=Laptop`)
*   `GET /api/products/export`: Export all products as a CSV file.
*   `POST /api/products/import`: Import products from a CSV file (expects `multipart/form-data`).
*   `GET /api/products/:id/history`: Get inventory change history for a specific product.
*   `PUT /api/products/:id`: Update a product.
*   `DELETE /api/products/:id`: Delete a product.

## Deployment

### Frontend & Backend (Vercel)

The entire application (frontend and backend) can be deployed seamlessly to Vercel, as it's a monolithic Next.js application.

1.  Push your code to a public GitHub repository.
2.  Go to [Vercel](https://vercel.com/new) and import your repository.
3.  Vercel will automatically detect that it's a Next.js project and configure the build settings.
4.  Click "Deploy".

**Note on Database:** Vercel has an ephemeral filesystem. For a production deployment, the SQLite database should be replaced with a managed database service (e.g., Turso, Neon, PlanetScale) that works well in serverless environments. The current SQLite setup is suitable for development and this assignment's requirements.
