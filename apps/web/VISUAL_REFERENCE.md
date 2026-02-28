# 🎨 Visual Design Reference - TaskFlow Premium UI

## Color Palette Showcase

### Primary Purple
```
Hex: #7C3AED
RGB: (124, 62, 237)
HSL: 261° 88% 59%
Usage: Primary buttons, active states, icons, accents
```

### Primary Purple - Hover
```
Hex: #6D28D9
RGB: (109, 40, 217)
HSL: 268° 81% 51%
Usage: Button hover state, interactive elements
```

### Primary Purple - Active
```
Hex: #5B21B6
RGB: (91, 33, 182)
HSL: 270° 81% 42%
Usage: Button active state, deep interactions
```

### Dark Background
```
Hex: #000000
RGB: (0, 0, 0)
HSL: 0° 0% 0%
Texture: Carbon fiber overlay at 15% opacity
Glow: Radial gradient from #7C3AED at 30% opacity
```

### Surface Colors
```
Dark Surface: #1F2937 (Gray 800)
Medium Surface: #374151 (Gray 700)
Light Surface: #4B5563 (Gray 600)
Subtle Border: #6B7280 (Gray 500)
```

---

## Component Examples

### Button Variations

#### Primary Button
```
┌─────────────────────────────────────┐
│  Get Started Free                   │
│  ────────────────────────────────   │
│  Gradient: #7C3AED → #6D28D9       │
│  Glow: 0 0 20px rgba(124,62,237,0.5)
│  Hover: scale 1.03                 │
│  Tap: scale 0.97                   │
└─────────────────────────────────────┘
```

#### Secondary Button
```
┌─────────────────────────────────────┐
│  Sign In                           │
│  ────────────────────────────────   │
│  Background: #374151 (Gray 700)    │
│  Border: Gray 600                  │
│  Hover: #4B5563 (Gray 600)        │
└─────────────────────────────────────┘
```

#### Danger Button (Delete)
```
┌─────────────────────────────────────┐
│  Delete Collection                  │
│  ────────────────────────────────   │
│  Background: Primary Gradient       │
│  Used for: Destructive actions      │
│  Color: Primary (not red)          │
└─────────────────────────────────────┘
```

---

### Input Field

```
Label: Email Address
┌─────────────────────────────────────┐
│ example@domain.com                  │ ← Focus ring: Primary
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Border: Gray 600 → Primary on focus │
│ Background: Gray 700 with 50% opacity
└─────────────────────────────────────┘

Error State:
┌─────────────────────────────────────┐
│ ✗ Please enter a valid email       │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ Error text: Primary color          │
│ Background: Primary/20 opacity      │
└─────────────────────────────────────┘
```

---

### Card Component

```
Normal State:
┌─────────────────────────────────────┐
│ Personal Tasks                      │
│ Create and manage your own tasks... │
│  ────────────────────────────────   │
│ Background: Gray 800 (50% opacity) │
│ Border: Gray 700 (50% opacity)     │
│ Elevation: shadow-lg                │
└─────────────────────────────────────┘

Hover State (scale 1.02):
┌─────────────────────────────────────┐
│ ▓ Slightly Scaled Up ▓              │
│ ────────────────────────────────   │
│ Background fades to: Gray 800/70   │
│ Shadow: shadow-xl                  │
│ Animation: smooth spring physics   │
└─────────────────────────────────────┘
```

---

### Navbar Design

```
Navbar (Not Scrolled):
┌─────────────────────────────────────────────┐
│ TaskFlow                        Sign In Sign Up│
│ T=purple                                      │
│ Background: transparent                      │
│ Backdrop: No blur (clear)                   │
└─────────────────────────────────────────────┘

Navbar (Scrolled):
┌─────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓ BLURRED BACKDROP ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ TaskFlow                        Sign In Sign Up│
│ Background: black/80                        │
│ Backdrop: blur (16px)                       │
└─────────────────────────────────────────────┘
```

---

### Sidebar Navigation

```
Mobile (Closed):
Screen ──────
          │ ☰ │
          └───┘

Mobile (Open with Animation):
┌──────────────────────────┐
│ ▓ SIDEBAR SLIDES IN ▓   │
│ ┌────────────────────┐  │
│ │ TaskFlow           │  │
│ │ • Personal Tasks   │  │
│ │ • Groups           │  │
│ │ • Profile          │  │
│ └────────────────────┘  │
│ ◖ Dark Overlay Visible  │
└──────────────────────────┘
Animation: Spring(s:250, d:30)

Desktop (Always Visible):
┌──────────────┬──────────────────────────┐
│ TaskFlow     │                          │
│ •Personal    │     Main Content         │
│ •Groups      │                          │
│ •Profile     │                          │
└──────────────┴──────────────────────────┘
```

---

### Task Card

```
Normal State:
┌─────────────────────────────────────────┐
│ [✓] Complete setup documentation       │
│     tag:High  by:john  Due:2026-02-28 │
│ ────────────────────────────────────── │
│ Completed by: You, sarah                │
└─────────────────────────────────────────┘

Hover State (scale 1.02):
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ SCALED UP ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ [✓] Complete setup documentation       │
│     tag:High  by:john  Due:2026-02-28 │
│ ────────────────────────────────────── │
│ Completed by: You, sarah                │
│ [Edit] [Delete] ──► Buttons visible    │
└─────────────────────────────────────────┘

Button Colors:
  Edit: Blue gradient
  Delete: Primary Purple
  Completed: Emerald/Teal
```

---

### Icon Styling

```
Before (Red):
🔴 User Icon: #EF4444
🔴 Settings Icon: #EF4444
🔴 Delete Icon: #EF4444

After (Primary Purple):
🟣 User Icon: #7C3AED
🟣 Settings Icon: #7C3AED
🟣 Delete Icon: #7C3AED

Icon Backgrounds:
┌──────┐
│ 🟣   │ Background: Primary/20 opacity
│      │ Border: Primary/30 opacity
└──────┘
```

---

### Animation Timings

```
Page Transitions:
  Initial:  opacity: 0, y: 10px
  Animate:  opacity: 1, y: 0px
  Exit:     opacity: 0, y: -10px
  Duration: 0.3s

Button Interactions:
  Hover:     scale: 1.03
  Tap:       scale: 0.97
  Duration:  spring physics
  Physics:   stiffness: 300, damping: 20

Card Hover:
  Scale:     1.02
  Duration:  spring physics
  Physics:   stiffness: 250, damping: 30

Sidebar Animation:
  From:      x: -300 (off screen)
  To:        x: 0 (visible)
  Duration:  spring physics
  Physics:   stiffness: 250, damping: 30
```

---

### Hero Section Layout

```
┌────────────────────────────────────────────┐
│                                            │
│ Manage Tasks                               │
│ Together                   ← Primary color │
│ (Animated: fade + slide up)               │
│                                            │
│ Premium task management platform...       │
│ (Animated: fade + slide up, delay 0.4s)  │
│                                            │
│ [Get Started Free]  [Sign In]            │
│  (Primary Gradient)  (Secondary)          │
│ (Fade in, delay 0.6s with stagger)       │
│                                            │
└────────────────────────────────────────────┘
```

---

### Features Grid

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🟣 Personal  │  │ 🟣 Team      │  │ 🟣 Real-     │
│   Tasks      │  │   Collab     │  │   time       │
│              │  │              │  │              │
│ Create and   │  │ Work with    │  │ See changes  │
│ manage...    │  │ your team... │  │ instantly... │
│              │  │              │  │              │
│ On Hover:    │  │ On Hover:    │  │ On Hover:    │
│ ↑ scale 1.02 │  │ ↑ scale 1.02 │  │ ↑ scale 1.02 │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

### Statistics Card

```
┌─────────────────────────────────────────┐
│                                         │
│ Total Tasks Created                     │
│ ─────────────────────────────────────   │
│             47                          │
│ ─────────────────────────────────────   │
│ Gradient: Primary → Primary Hover      │
│ Background: Primary/10 opacity         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Responsive Breakpoints

```
Mobile (< 768px):
┌──────────────────┐
│ TaskFlow     ☰   │  Navbar: Hamburger menu
│ ──────────────── │
│ Content Area     │
│                  │  Main: Full width
│ ──────────────── │
│ Sidebar: Drawer  │  Sidebar: Hidden, slides in
└──────────────────┘

Tablet (768px - 1024px):
┌──────────────────────┐
│ TaskFlow       Log   │  Navbar: Full width
│ ────────────────────│
│ Sidebar  │ Content   │
│          │           │  Sidebar: Visible always
│          │           │
└──────────────────────┘

Desktop (> 1024px):
┌────────────────────────────────┐
│ TaskFlow         Sign In Log    │  Navbar: Full controls
│ ─────────────────────────────── │
│ Sidebar │   Main Content Area   │
│         │                       │  Sidebar: Sticky
│         │                       │  Content: Wide
└────────────────────────────────┘
```

---

## Accessibility Features

```
Color Contrast:
πFragment on #000000: Primary (#7C3AED)
Contrast Ratio: 4.5:1 ✓ WCAG AA

Focus States:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Focused Button with purple ring │
│ Ring: 2px solid primary color   │
│ Offset: 2px                     │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keyboard Navigation:
Tab → Cycles through interactive elements
Enter → Activates buttons
Space → Toggles checkboxes
Arrow Keys → Navigate lists

Motion Preferences:
respects: prefers-reduced-motion
Fallback: Instant transitions
```

---

## Browser Rendering

```
GPU-Accelerated Animations:
✅ transform (scale, translate)
✅ opacity (fade)
❌ background-color (use opacity instead)
❌ width/height (use transform scale)

Result: Smooth 60 FPS animations
```

---

## Design System Variables

```css
/* Primary Colors */
--primary: #7C3AED;
--primary-hover: #6D28D9;
--primary-active: #5B21B6;

/* Backgrounds */
--bg-black: #000000;
--bg-surface: #1F2937;
--bg-elevated: #374151;

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;

/* Status */
--status-success: #10B981;
--status-warning: #F59E0B;
--status-error: #7C3AED; /* Primary instead of red */
```

---

**This visual reference guide maintains design consistency across the TaskFlow application.**

**Version**: 1.0  
**Status**: Complete ✨
