# Kinophile

A Letterboxd-style movie social platform built with React, Node.js, Express, and MongoDB.

## Features

- Track films you've watched
- Rate films with half-star ratings
- Write reviews with spoiler flags
- Build and share film lists
- Follow other users and see their activity
- Watchlist for films you want to see
- Film diary — monthly view of your watched films
- Search films via TMDb API
- Browse by genre
- Dark mode

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Context API
**Backend:** Node.js, Express, MongoDB, Mongoose
**Auth:** JWT, bcrypt, Google OAuth (Passport.js)
**Storage:** Cloudinary
**Movie Data:** TMDb API

## Getting Started

### Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` for required variables.