# 🎉 Yash's Bachelor 2025 - Brutal Awards

A mobile-first voting game for bachelor parties!

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update MongoDB URL in `.env`:**
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📱 Pages

- `/` - Home page with players list
- `/name` - Welcome message page
- `/game` - Voting game
- `/results` - Results with twist reveals
- `/scoreboard` - Player scores
- `/admin` - Admin dashboard

## ⚙️ Admin Dashboard

Access `/admin` to:
- Edit game config (title, date, message)
- Add/remove players
- View questions
- Reset all votes

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MongoDB** - Database
- **Framer Motion** - Animations

## 📁 Project Structure

```
brutal-awards/
├── app/
│   ├── api/          # API routes
│   ├── game/         # Game page
│   ├── results/      # Results page
│   ├── scoreboard/   # Scoreboard
│   ├── admin/        # Admin dashboard
│   └── name/         # Welcome message
├── components/       # React components
├── lib/              # Database & utilities
├── types/            # TypeScript types
└── scripts/          # Seed script
```

Enjoy the chaos! 🎉
# yash-bachelors
