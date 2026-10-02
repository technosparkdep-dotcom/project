# ⚡ TechnoSpark — College Department Tech Club Website

A complete, multi-page static website for the TechnoSpark college tech club.

## 📁 Project Structure

```
technospark/
├── index.html          ← Homepage
├── css/
│   └── style.css       ← All styles (one file)
├── js/
│   └── main.js         ← All interactivity (one file)
└── pages/
    ├── about.html      ← About page
    ├── events.html     ← Events & Workshops
    ├── team.html       ← Core Committee & Domain Leads
    └── contact.html    ← Contact form + FAQ
```

## 🚀 How to Run in VS Code

1. Open the `technospark/` folder in VS Code
2. Install the **Live Server** extension (Ritwick Dey)
3. Right-click `index.html` → **Open with Live Server**
4. The site opens at `http://127.0.0.1:5500`

## ✏️ How to Customise

> **Now editable from the Admin page.** Events, team, text, contact details, footer and
> images are managed in `pages/admin.html` (see `../SETUP.md`). The manual HTML steps
> below still work as the offline fallback text.


### Change club name / details
- Search & replace "TechnoSpark" across all `.html` files
- Update email, location, and club hours in `contact.html`

### Change colours
Edit these variables at the top of `css/style.css`:
```css
:root {
  --navy:    #0A0E1A;   /* background */
  --cyan:    #00D4FF;   /* primary accent */
  --magenta: #FF006E;   /* secondary accent */
  --slate:   #C8D6E5;   /* body text */
}
```

### Add/remove team members
Copy a `.team-card` block in `pages/team.html` and update:
- Initials inside `.member-avatar`
- Name, role, department
- Gradient colours on the avatar

### Add events
Copy an `.event-card` block in `pages/events.html` and update:
- Date (day + month)
- Title, location, time, description
- Tag class: `tag-upcoming`, `tag-open`, or `tag-past`

### Add your social links
Replace all `href="#"` on social links with real URLs.

## 🎨 Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| Navy | #0A0E1A | Page background |
| Card | #111827 | Card / section backgrounds |
| Cyan | #00D4FF | Primary accent, links |
| Magenta | #FF006E | Secondary accent, badges |
| Slate | #C8D6E5 | Body text |

**Fonts:** Orbitron (display) + Inter (body) — loaded from Google Fonts

## 📬 Contact Form

The form is currently **client-side only** (simulates a submit delay then shows success).
To make it functional, integrate with:
- **Formspree** (`action="https://formspree.io/f/YOUR_ID"`)
- **EmailJS** (free tier)
- Any backend API endpoint

## 🌐 Deployment

Works on any static hosting:
- **GitHub Pages** — push to a repo, enable Pages in Settings
- **Netlify** — drag & drop the folder on netlify.com
- **Vercel** — `vercel deploy` from the project root
