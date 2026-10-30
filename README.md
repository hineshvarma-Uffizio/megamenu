# Uffizio Mega Menu Redesign (3-Column + 1 Featured Card Layout)

This project contains a modern, production-ready, fully responsive **Mega Menu Redesign** for [Uffizio](https://uffizio.com/).

## 📁 File Structure
- `index.html` - Semantic HTML5 with Tailwind CSS layout, accessible markup, and hero section for live scroll/backdrop testing.
- `styles.css` - Custom CSS animations, hover-intent transitions, mobile scrollbars, and backdrop blur.
- `script.js` - JavaScript handling hover intent (debounce), keyboard accessibility (ESC to close, ARIA states), and mobile accordion/drawer.

## 🚀 Key Features Implemented
1. **3-Column + 1 Featured Card Layout**:
   - **Column 1: Fleet & Assets** (Trakzee, Elexee EV, Smart Waste, Trakzee Mini / GSM)
   - **Column 2: Commute & Transit** (Smartbus, Rosterz, SmartTranzit)
   - **Column 3: Workforce & IoT** (Taskeye, Enarzee, Gridzee, Petzee)
   - **Column 4: Featured Promo Cards** (1,500+ Compatible GPS Devices + White-Label Partner Program CTA)
2. **Microcopy & Visual Badges**:
   - Every product has its own custom icon and 1-line descriptive subtext.
   - Badges like `Popular`, `EV Tech`, and `Safety First` highlight core strengths.
3. **Hover-Intent with Debounce**:
   - Accidental mouse slips won't instantly shut the menu (180ms grace window).
4. **Mobile Drawer & Accordion**:
   - Seamlessly collapses into a touch-friendly slide-down drawer with collapsible accordions on screens under 1024px.
5. **Accessibility**:
   - `aria-expanded` and `aria-haspopup` dynamic states.
   - Full dismissal via the `Escape` key.
   - Backdrop overlay to keep user focus on the navigation.

## 🖥️ How to Preview
Simply open `index.html` directly in any web browser, or launch a quick HTTP server:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.
