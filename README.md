# Journey to Mars
### Frontend Odyssey Challenge — Interactive Storytelling Experience

> *"The first footprints on Mars will be the most significant marks left by human feet since those on the Moon."* — Carl Sagan

---

##  Live Demo

🔗 **[View Live Experience →](https://YOUR-DEPLOYMENT-LINK-HERE)**

---

##  About

Journey to Mars is an immersive, scroll-driven storytelling website built for the
Frontend Odyssey challenge. It guides the user through five chapters of humanity's
most ambitious mission — from the launch pad on Earth to the surface of Mars.

The experience is designed to feel like a living mission briefing rather than a
static webpage. Every scroll triggers a new animation, every section has its own
visual identity, and all planet visuals are generated in real time — no external
images used anywhere.

---

##  Sections

| # | Section | Highlights |
|---|---------|------------|
| 01 | **Launch Pad** | 3D Earth, live countdown timer, animated launch CTA |
| 02 | **Ascent** | Scroll-driven rocket, mission clock, altitude bar |
| 03 | **Deep Space Traverse** | Animated counters, mission timeline, asteroid particles |
| 04 | **Mars Arrival** | 3D Mars globe, orbital moons, mouse parallax |
| 05 | **Exploration** | Flip cards with real Mars landmark data |

---

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| **Three.js r128** | 3D planet rendering (Earth & Mars) |
| **GSAP 3.12 + ScrollTrigger** | Scroll animations & parallax |
| **HTML5 Canvas API** | Procedural planet texture generation |
| **Vanilla JavaScript** | All interactivity & state |
| **CSS Custom Properties** | Theming & responsive design |
| **Google Fonts** | Orbitron · Space Mono · Rajdhani |

---

##  Challenge Requirements Met

- [x] 5 narrative sections forming a cohesive story
- [x] 2+ scroll effects (parallax, scroll-linked rocket, timeline scrub)
- [x] 3+ interactions (flip cards, countdown, mouse parallax, nav dots)
- [x] 3+ animations (loading sequence, planet rotation, counter roll-up)
- [x] Fully responsive — desktop, tablet, mobile

---

## Project Structure
```
mars-odyssey/
├── index.html      # Full HTML structure & SVG assets
├── style.css       # All styles, animations & responsive rules
├── main.js         # Three.js planets, GSAP scroll, interactions
└── README.md       # You are here
```

---

##  Running Locally

No build tools or npm needed. Just:

1. Clone the repo
```bash
   git clone https://github.com/YOUR_USERNAME/mars-odyssey.git
```
2. Open `index.html` in any modern browser

> Requires an internet connection for CDN libraries (Three.js, GSAP, Google Fonts).

---

## Design Decisions

- **No external images** — Earth and Mars textures are generated entirely via Canvas API,
  including craters, Valles Marineris canyon, polar ice caps, and cloud layers
- **Dark space palette** with rust-orange Mars accents (`#c1440e`) and deep navy backgrounds
- **Orbitron** chosen for its mission-control, technical feel
- **Custom cursor** with a trailing ring to reinforce the space-exploration aesthetic
- **Scanline overlay** adds a subtle CRT/mission-screen texture to the whole experience

---

## Author

**Immadi Naga Sai Vanshika**
- GitHub: [@yourusername](https://github.com/yourusername)
