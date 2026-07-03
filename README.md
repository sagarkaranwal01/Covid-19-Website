# Pulse Response — COVID-19 Website

A 6-page COVID-19 information & response portal: Home, Gallery, Register, Login, Contact, Donate.

## Stack
- Frontend: HTML, CSS, JavaScript (vanilla, no framework)
- Backend: Node.js + Express
- Database: SQLite, via Node's built-in `node:sqlite` module (no native compilation needed)
- Passwords hashed with bcryptjs; sessions handled with express-session

## Run it

```
npm install
npm start
```

Then open http://localhost:3000 in your browser.

The database file `covid.db` is created automatically on first run, with three tables:
- `users` — registrations / login accounts
- `contacts` — messages submitted on the Contact page
- `donations` — entries submitted on the Donate page

## Project structure
```
server.js               Express server, API routes, database setup
public/
  index.html             Home page
  gallery.html            Gallery (filterable grid + lightbox)
  register.html           Registration form  -> POST /api/register
  login.html               Login form          -> POST /api/login
  contact.html              Contact form        -> POST /api/contact
  donate.html                Donation form       -> POST /api/donate
  css/style.css             Shared design system (tokens, layout, components)
  js/
    main.js                 Shared nav + session-aware header behavior
    gallery.js               Gallery filtering + lightbox
    register.js               Registration form logic
    login.js                   Login form logic
    contact.js                  Contact form logic
    donate.js                    Donation form logic + live totals
```

## API reference
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | /api/register | `{ full_name, email, password }` | Creates account, starts session |
| POST | /api/login | `{ email, password }` | Verifies password hash, starts session |
| POST | /api/logout | — | Ends session |
| GET | /api/session | — | Returns current login state, used by the nav |
| POST | /api/contact | `{ name, email, subject, message }` | Stores message in `contacts` |
| POST | /api/donate | `{ name, email, amount, fund, message }` | Stores donation, returns updated total |
| GET | /api/donate/stats | — | Returns total raised + donor count |

## Notes
- The donation form is a demo — no real payment processor is connected.
- Passwords are never stored in plain text (bcrypt hash only).
- All pages share one CSS file and one design system so styling stays consistent.
