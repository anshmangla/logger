# Daily Logbook

A full-stack web application for logging daily events with photos, timestamps, and notes. Modular, clean, and production-deploy ready.

## Features
- **Authentication:** Two users (alice/password1, bob/password2), session-based login
- **Event Logging:** Title, note, time mode (now/earlier), photo upload, timestamp stored
- **Event Grid:** Filter by user, daily/monthly aggregation, photo thumbnails, responsive design
- **Image Handling:** Images uploaded to backend/uploads/, accessed at /uploads/filename
- **Persistent Storage:** SQLite via SQLAlchemy
- **Modern UI:** React (Vite) + Material UI (MUI)
- **Ready for Docker deployment**

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, Uvicorn, SQLite
- **Frontend:** React (Vite), Material UI (MUI)
- **Storage:** Local SQLite DB, media in backend/uploads

## Setup & Development

### Backend
```
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Install requirements
pip install fastapi uvicorn python-multipart jinja2 aiofiles sqlalchemy
# Run
uvicorn main:app --reload
```
API will be on [http://localhost:8000](http://localhost:8000)

### Frontend
```
cd frontend
npm install
npm run dev
```
App will be at [http://localhost:5173](http://localhost:5173)

> By default, frontend connects to backend at `http://localhost:8000`.

## Usage
- Register events (title, note, when, photo) after logging in.
- See past events using filters, grouped by user or by day/month.
- Click photo thumbnails to see them full size (right-click > open image in new tab).
- To test persistent login: refresh the site after logging in.

## Deployment (Docker)

- Sample Dockerfiles and docker-compose included.
- To build/run both with Docker Compose:
```
docker-compose up --build
```
- Or run backend and frontend containers separately as needed

## Security Note
For demo simplicity, authentication and session security are minimal and not for production: do not use as-is for sensitive data.

## Authors & License
- Created for coding demo purposes.
- MIT License.
