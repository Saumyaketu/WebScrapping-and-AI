# AI-Powered Content Improver & Web Scraper


A Full-Stack application that automates content research. It scrapes blog articles from a target website, uses **Google Gemini AI** to enhance and rewrite the content, and displays the "Original vs. Enhanced" versions on a modern dashboard.

##  Live Demo
- **Frontend Dashboard:** [Click Here to View Live App](https://your-project-name.vercel.app)

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Fast, interactive dashboard for viewing content. |
| **Styling** | Tailwind CSS | Modern, responsive UI design. |
| **Backend** | Laravel 11 (PHP) | REST API to serve data and manage the database. |
| **Database** | PostgreSQL | Cloud-hosted relational database (Render). |
| **Scraper** | Laravel Dusk | Browser automation to scrape dynamic content. |
| **AI Engine** | Node.js + Google Gemini | Background worker that processes text using LLMs. |

---

## Architecture & Workflow

1.  **Scraping:** The Laravel Dusk scraper visits `beyondchats.com`, extracts blog content, and saves it to the PostgreSQL database.
2.  **AI Processing:** A Node.js worker listens for new articles, sends the text to **Google Gemini AI** for enhancement, and updates the database with the improved version.
3.  **Presentation:** The React Frontend fetches the data via API and displays a side-by-side comparison (Original Draft vs. AI Enhanced).

```mermaid
graph TD
    User["User / Client"] -->|View Dashboard| Frontend["React Frontend (Vercel)"]
    Frontend -->|Fetch Articles API| Backend["Laravel Backend API (Render)"]

    subgraph "Data Processing Pipeline"
        Backend <-->|Read/Write Data| DB[("PostgreSQL Database")]

        Scraper["Laravel Dusk Scraper"] -->|1. Scrape Content| TargetWeb["BeyondChats Blog"]
        Scraper -->|2. Store Raw Data| DB

        Worker["Node.js AI Worker"] -->|3. Poll for New Articles| Backend
        Worker -->|4. Send Text| AI["Google Gemini AI"]
        AI -->|5. Return Enhanced Content| Worker
        Worker -->|6. Update Article| Backend
    end
```
---

## Project Structure
```text
my-submission-repo/
│
├── beyondchats_task/       # Laravel Backend (API & Scraper)
│   ├── app/
│   ├── routes/
│   └── ...
│
├── frontend/               # React Frontend (Dashboard)
│   ├── src/
│   ├── package.json
│   └── ...
│
├── ai_worker/              # Node.js Worker (AI Logic)
│   ├── worker.js
│   ├── package.json
│   └── ...
│
├── README.md               # Project Documentation
└── Screenshots             # Images of DashBoard

```
---

## Getting Started (Run Locally)

### Prerequisites
* Node.js & npm
* PHP & Composer
* PostgreSQL (or use the cloud connection)

### Clone the Repository
```bash
git clone https://github.com/Saumyaketu/WebScrapping-and-AI
cd WebScrapping-and-AI
```
### 1. Backend Setup (Laravel)
```bash
cd beyondchats_task
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

### 3. AI Worker Setup

```bash
cd ai_worker
npm install
node worker.js
```

---

## Environment Variables

To run this project, you need to configure the following variables in your `.env` files:

**Backend (`beyondchats_task/.env`):**

```ini
DB_CONNECTION=pgsql
DB_HOST=your-render-hostname.oregon-postgres.render.com
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

**Frontend (`frontend/.env`):**

```ini
VITE_API_URL=your_api_url
```

**AI Worker (`ai_worker/.env`):**

```ini
GEMINI_API_KEY=your_google_gemini_api_key
API_URL=your_api_url
```

---

## Screenshots

![Dashboard Preview 1](Screenshots/img1.png)
![Dashboard Preview 2](Screenshots/img2.png)

---

## Author

**Saumyaketu**

* [GitHub Profile](https://www.google.com/search?q=https://github.com/Saumyaketu)
* [LinkedIn](https://www.linkedin.com/in/saumyaketu)

---
