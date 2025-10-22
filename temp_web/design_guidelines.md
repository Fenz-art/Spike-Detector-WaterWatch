# Waterborne Disease AI Spike Detection System - Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design) with Healthcare Specialization
**Justification**: Information-dense dashboards requiring clarity, trust, and data visualization excellence. Drawing inspiration from Johns Hopkins COVID tracker, Epic MyChart, and Linear's data presentation while maintaining medical professionalism.

**Key Design Principles**:
- Medical Trust: Professional, clean interfaces that inspire confidence
- Data Clarity: Information hierarchy prioritizing critical alerts and trends
- Responsive Urgency: Visual system that escalates alert severity through color
- Accessible Analytics: Complex data made digestible through thoughtful visualization

## Core Design Elements

### A. Color Palette

**Primary Colors (Light Mode)**:
- Medical Blue: 210 85% 45% - Primary actions, headers, trust elements
- Clean White: 0 0% 100% - Backgrounds, cards
- Soft Gray: 220 15% 96% - Secondary backgrounds

**Primary Colors (Dark Mode)**:
- Deep Navy: 215 25% 12% - Main background
- Slate Blue: 215 20% 18% - Card backgrounds
- Light Text: 210 15% 90% - Primary text

**Alert System Colors** (Both Modes):
- Critical Red: 0 75% 55% - Spike detected, urgent alerts
- Warning Amber: 38 92% 50% - Elevated cases, attention needed
- Success Green: 145 65% 45% - Normal levels, safe zones
- Info Cyan: 195 85% 50% - Data insights, notifications

**Accent Colors**:
- Vibrant Teal: 175 70% 45% - CTAs, interactive elements
- Medical Green: 160 60% 48% - Positive outcomes, confirmations

### B. Typography

**Font Families** (via Google Fonts CDN):
- Primary: 'Inter' - Clean, modern sans-serif for UI and data
- Headings: 'Poppins' - Bold, commanding for hero sections and dashboard titles
- Mono: 'Roboto Mono' - Data tables, case numbers, statistics

**Type Scale**:
- Hero Display: 3.5rem/4rem (desktop), 2.5rem (mobile), font-weight 700
- Section Headers: 2.5rem, font-weight 600
- Card Titles: 1.5rem, font-weight 500
- Body Text: 1rem, font-weight 400, line-height 1.6
- Data Labels: 0.875rem, font-weight 500
- Small Text: 0.75rem, font-weight 400

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 (cards), p-8 (sections)
- Section spacing: py-16 (mobile), py-24 (desktop)
- Grid gaps: gap-6 (standard), gap-8 (feature grids)

**Container Widths**:
- Landing pages: max-w-7xl
- Dashboards: Full-width with max-w-screen-2xl
- Forms: max-w-2xl

### D. Component Library

**Navigation**:
- Top navbar: Sticky, backdrop-blur, shadow on scroll
- Logo left, navigation center, role indicator + logout right
- Mobile: Hamburger menu with slide-in drawer

**Landing Page Components**:

*Hero Section* (100vh):
- Full-screen animated background with Particles.js (medical molecules/network pattern in teal/blue)
- Centered headline: "AI-Powered Waterborne Disease Surveillance"
- Subheadline explaining real-time spike detection
- Dual CTAs: "Hospital Login" (solid teal) + "Municipal Dashboard" (outline white with blur background)
- Animated statistics bar: "X Cases Monitored | Y Alerts Sent | Z Lives Protected"

*Features Section* (3-column grid):
- Icon cards with hover lift effect (AOS fade-up)
- Icons: Font Awesome medical/chart icons
- Features: Real-time Detection, ML Prediction, Instant Alerts, Data Visualization, Role-Based Access, Geographic Mapping

*How It Works* (Timeline/Steps):
- Alternating left-right layout
- Step numbers in medical blue circles
- Connected with dotted lines (pulse animation)

*Trust Section*:
- 2-column: Statistics left (large numbers, Chart.js radial charts), testimonials right
- Background: subtle gradient overlay

**Authentication Pages**:
- Centered card (max-w-md) on blurred background
- Role selector: Large toggle buttons (Hospital | Municipal Authority) with active state highlighting
- Form fields: Floating labels, medical blue focus rings
- Password strength indicator (color-coded progress bar)
- Remember me checkbox, forgot password link

**Dashboard Components**:

*Sidebar Navigation* (Hospital & Municipal):
- Collapsed/expanded states
- Icon + label structure
- Active route highlighting in teal

*Dashboard Cards*:
- White/slate backgrounds with subtle shadows
- Rounded corners (rounded-xl)
- Hover: slight scale + shadow increase

*Chart Visualizations*:
- Line Charts: Trend analysis with shaded confidence intervals (Chart.js)
- Heatmap: Geographic disease distribution (D3.js)
- Bar Charts: Comparative case counts
- Alert threshold lines: Dashed red lines showing spike levels

*Alert System*:
- Toast notifications: Top-right, slide-in animation
- Color-coded by severity (red/amber/green borders)
- Persistent alert banner: Top of dashboard when active spike detected
- Alert history table: Sortable, filterable

*Hospital Dashboard Specifics*:
- Drag-drop upload zone: Dashed border, hover state with scale
- File type icons, progress bars
- Recent uploads table with status indicators

*Municipal Dashboard Specifics*:
- Geographic map: Interactive pins showing hospital locations
- Filtering: Date range picker, disease type selector, region dropdown
- Trend comparison: Multiple line overlays
- Export buttons: CSV, PDF reports

**About Us Page**:
- Mission statement: Large centered typography with medical imagery background
- Team grid: 3-4 column cards with photos, names, roles
- Technology stack: Icon grid showing AI, ML, cloud infrastructure
- Impact metrics: Animated counters (AOS)

**Contact Us Page**:
- 2-column layout: Form left (60%), contact info + map right (40%)
- Form: Name, email, role, subject, message
- Animated contact cards: Email, phone, address with icons
- Background: Subtle medical pattern

### E. Animations

**Strategic Use Only**:
- AOS (Animate On Scroll): Fade-up for cards, slide-in for sections
- Page transitions: Subtle fade (200ms)
- Button interactions: Scale on hover (1.02), active press (0.98)
- Chart animations: Smooth data draw-in on load
- Alert entrance: Slide-in from top-right
- Loading states: Skeleton screens with pulse animation
- Particles.js: Background only on hero section

**No Animations On**:
- Dashboard data updates (instant)
- Navigation switches
- Form validation feedback

## Images

**Hero Section**: Large full-screen background image
- Subject: Medical professionals analyzing data on screens OR abstract visualization of disease tracking network
- Treatment: 50% opacity overlay with teal-to-blue gradient
- Placement: Full viewport background behind centered content

**About Us**: Mission section background
- Subject: Healthcare workers collaborating, public health setting
- Treatment: Parallax scroll effect, muted overlay

**Feature Cards**: Icon-based only (no images) using Font Awesome

**Dashboard**: No decorative images - data visualization focus

## Implementation Libraries

**Required CDNs**:
- Bootstrap 5.3 (grid, utilities, components)
- Chart.js 4.x (data visualizations)
- Font Awesome 6.x (icons)
- AOS 2.3 (scroll animations)
- Particles.js (hero background)
- Google Fonts: Inter, Poppins, Roboto Mono

**Critical Quality Standards**:
- All forms include validation states (success/error colors)
- Loading states for all async operations
- Responsive breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Dark mode toggle persists via localStorage
- Accessibility: ARIA labels, keyboard navigation, color contrast WCAG AA

This creates a professional, data-driven healthcare application with strategic visual vibrancy that builds trust while maintaining clarity for critical disease monitoring functions.