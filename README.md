# MemeMuseum 🏛️

**MemeMuseum** is a web application dedicated to meme culture, where users can share, discover, rate, and discuss memes through a digital gallery.

The project is built with a React frontend and a Node.js REST API, using SQLite for persistent data storage.

Created and maintained by [Gio0B](https://github.com/Gio0B) as a personal portfolio project.

## Features

- **User Authentication** – Register and log in with a personal account.
- **Meme Gallery** – Browse a collection of memes in a responsive gallery.
- **Meme Upload** – Upload images with a title and custom tags.
- **Voting System** – Upvote or downvote memes, with the ability to change or remove your vote.
- **Comments** – Add and delete comments on memes.
- **Tag Filtering** – Find memes using their associated tags.
- **Sorting** – Browse memes by publication date or score.
- **Pagination** – Navigate the gallery with 9 memes per page.
- **Meme of the Day** – Discover a featured meme selected from the collection.
- **Content Management** – Users can delete their own memes and comments.

## Technologies

| Technology | Purpose |
|---|---|
| React 19 | Frontend user interface |
| Vite 8 | Frontend development server and build tool |
| JavaScript (ES Modules) | Frontend development |
| Node.js | Backend runtime |
| Express 5 | REST API and server-side routing |
| SQLite | Relational database |
| sqlite3 | SQLite database driver |
| JWT | User authentication |
| bcrypt | Password hashing |
| Multer | Image upload handling |
| Playwright | End-to-end testing |

## Project Structure

```text
MemeMuseum/
├── package.json             # Root-level project commands
├── backend/
│   ├── src/
│   │   ├── config/          # Application configuration
│   │   ├── controllers/     # Request handling and business logic
│   │   ├── db/              # Database initialization
│   │   ├── middleware/      # Authentication and file uploads
│   │   ├── models/          # Database queries
│   │   ├── routes/          # REST API routes
│   │   └── app.js           # Express application
│   ├── uploads/             # Uploaded meme images
│   ├── server.js            # Backend entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── test/
│   ├── tests/               # Playwright test cases
│   ├── helpers.js
│   ├── playwright.config.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (included with Node.js)
- Git (optional, for cloning the repository)

### 1. Clone the repository

```bash
git clone https://github.com/Gio0B/MemeMuseum.git
cd MemeMuseum
```

### 2. Install backend dependencies

From the project root, install all dependencies with one command:

```bash
npm run setup
```

Alternatively, install the backend dependencies separately:

```bash
cd backend
npm install
```

### 3. Start the backend

From the `backend` directory, run:

```bash
npm run dev
```

The backend API will be available at:

```text
http://localhost:3000
```

### 4. Install frontend dependencies

Open a second terminal in the project root:

```bash
cd frontend
npm install
```

### 5. Start the frontend

Run:

```bash
npm run dev
```

Vite will start the development server, normally available at:

```text
http://localhost:5173
```

Open the URL in your browser to access MemeMuseum.

## Database

MemeMuseum uses SQLite for data persistence.

The database file (`database.sqlite`) is located in the backend directory. Database tables are automatically initialized when the backend starts.

Local databases, environment files, uploaded images, and test results are intentionally excluded from Git. The repository contains `backend/.env.example` as a safe configuration template and keeps the empty upload directory through `backend/uploads/.gitkeep`.

The application stores:

- User accounts and hashed passwords.
- Meme information and image paths.
- Tags and their associations with memes.
- User votes.
- Comments.

Uploaded images are stored in the `backend/uploads/` directory.

If the database does not exist, SQLite creates it automatically.

## Configuration

The backend supports the following environment variables:

| Variable | Default value | Description |
|---|---|---|
| `PORT` | `3000` | Backend server port |
| `JWT_SECRET` | `password_di_prova` | JWT signing secret |

The default JWT secret is intended for development only. Set a strong secret through the environment when deploying the application.

## Testing

The project includes an end-to-end test suite built with **Playwright**.

The tests cover key application features, including:

- User registration and authentication.
- Meme retrieval and filtering.
- Voting functionality.
- Comments.
- Meme of the Day.
- Pagination.

Test files are located in `test/tests/`.

The suite is self-contained: when it starts from an empty local database, it creates the temporary users and minimal test content it needs. These generated files remain ignored by Git.

---

## License

This project is intended for educational and portfolio purposes.
