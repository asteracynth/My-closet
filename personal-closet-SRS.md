# Software Requirements Specification (SRS)
## Personal Closet – Wardrobe Management Web Application

**Version:** 1.0  
**Date:** 2026-05-12  
**Tech Stack:** React (JavaScript) + Tailwind CSS  
**Storage:** IndexedDB (images + data, no backend required)  
**Auth:** Local password protection (bcrypt hash stored in IndexedDB)

---

## 1. Project Overview

Build a **responsive single-page web application (SPA)** that helps users manage their personal wardrobe. Users can catalog clothing and accessories with real photos, organize items by category, track usage, and view statistics. The app works fully offline in the browser using IndexedDB for persistent storage.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (JavaScript, no TypeScript) |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Storage | IndexedDB via `idb` library |
| Image handling | Browser FileReader API → store as base64 in IndexedDB |
| Auth | SHA-256 password hash stored in IndexedDB |
| Charts | Recharts |
| Icons | Lucide React |
| Build tool | Vite |

---

## 3. Authentication

### 3.1 First-time Setup
- On first launch, detect no password is set → redirect to `/setup` page
- User sets a password (min 8 characters)
- Hash password with SHA-256 and store hash in IndexedDB key `auth.passwordHash`
- Redirect to login page

### 3.2 Login
- Route: `/login`
- Input: password field + "Unlock" button
- Hash input → compare with stored hash
- On success: set `sessionStorage.isAuthenticated = true` → redirect to `/`
- On failure: show error "Incorrect password", allow retry (no lockout needed)
- On page refresh: check `sessionStorage.isAuthenticated`, redirect to `/login` if missing

### 3.3 Logout
- Clear `sessionStorage.isAuthenticated`
- Redirect to `/login`

### 3.4 Change Password
- In Settings page
- Require current password to confirm before updating

---

## 4. Data Models

### 4.1 ClothingItem
```
{
  id: string (UUID),
  name: string,
  category: string,           // See category list below
  subcategory: string,
  color: string[],            // Array of color hex codes, max 3
  brand: string,
  material: string,
  season: string[],           // ['spring', 'summer', 'autumn', 'winter']
  occasion: string[],         // ['casual', 'work', 'formal', 'sport', 'party']
  size: string,
  price: number,
  purchaseDate: string,       // ISO date string
  tags: string[],             // Free-form user tags
  notes: string,
  imageBase64: string,        // Primary image stored as base64
  status: string,             // 'active' | 'donated' | 'sold' | 'damaged'
  wearCount: number,
  lastWornDate: string,       // ISO date string
  createdAt: string,          // ISO date string
  updatedAt: string           // ISO date string
}
```

### 4.2 Category List (predefined)
```
- Tops (Áo trên)
- Bottoms (Quần)
- Dresses & Skirts (Váy/Đầm)
- Outerwear (Áo khoác)
- Shoes (Giày dép)
- Bags (Túi xách)
- Accessories (Phụ kiện)
- Sportswear (Đồ thể thao)
- Sleepwear (Đồ ngủ)
- Underwear (Đồ lót)
```

### 4.3 Outfit
```
{
  id: string (UUID),
  name: string,
  itemIds: string[],          // Array of ClothingItem IDs
  occasion: string,
  season: string,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```

### 4.4 WearLog
```
{
  id: string (UUID),
  date: string,               // ISO date string (YYYY-MM-DD)
  itemIds: string[],          // Individual items worn
  outfitId: string | null,    // Optional: linked to saved outfit
  notes: string,
  createdAt: string
}
```

---

## 5. Application Routes

```
/login              → Login page
/setup              → First-time password setup
/                   → Dashboard (redirect to /closet if no stats)
/closet             → Closet grid view (main screen)
/closet/add         → Add new item form
/closet/:id         → Item detail view
/closet/:id/edit    → Edit item form
/outfits            → Outfit list view
/outfits/add        → Create new outfit
/outfits/:id        → Outfit detail
/log                → Wear log calendar
/log/add            → Log today's wear
/stats              → Statistics dashboard
/settings           → App settings
```

All routes except `/login` and `/setup` require authentication. Wrap in a `<ProtectedRoute>` component.

---

## 6. Pages & Features

---

### 6.1 Dashboard (`/`)
- Summary cards:
  - Total items (active only)
  - Outfits created
  - Items worn this month
  - Items never worn (wearCount === 0)
- Quick action buttons: Add Item, Log Today's Outfit
- "Recently added" section: last 5 items (image grid)
- "Worn today" section: today's wear log if exists

---

### 6.2 Closet Page (`/closet`)

#### 6.2.1 Display
- **Grid view** (default): 2 columns on mobile, 3–4 on tablet, 5–6 on desktop
- **List view**: table format with image thumbnail + key info
- Toggle button to switch views
- Each item card shows: photo, name, category, color dots, wear count

#### 6.2.2 Search & Filter
- Search bar: searches name, brand, tags (real-time, debounced 300ms)
- Filter panel (collapsible on mobile):
  - Category (multi-select checkboxes)
  - Season (multi-select)
  - Occasion (multi-select)
  - Status (active / donated / sold / damaged)
  - Color picker filter
- Sort options: Date added (newest/oldest), Name (A-Z), Price (high/low), Wear count (most/least)
- Active filters shown as removable chips/badges
- Filter count badge on filter button

#### 6.2.3 Actions
- Click item card → navigate to item detail
- Long-press or right-click → context menu: Edit, Delete, Log Wear
- "Add Item" floating action button (bottom-right on mobile)

---

### 6.3 Add / Edit Item Form (`/closet/add`, `/closet/:id/edit`)

#### Fields (in order):
1. **Photo upload** (required)
   - Click to open file picker (accept image/*)
   - On mobile: offer camera capture option (`capture="environment"`)
   - Preview uploaded image immediately
   - Allow re-upload to replace
   - Compress image to max 800px wide before storing as base64

2. **Name** – text input, required, max 100 chars

3. **Category** – dropdown (predefined list), required

4. **Subcategory** – text input, optional (e.g., "T-shirt", "Blazer")

5. **Color** – color picker, up to 3 colors
   - Show color swatches as visual selector
   - Allow custom hex input

6. **Brand** – text input, optional

7. **Material** – text input, optional (e.g., "Cotton", "Polyester")

8. **Size** – text input (free-form: XS/S/M/L/XL or numeric)

9. **Season** – multi-select checkboxes: Spring, Summer, Autumn, Winter, All-season

10. **Occasion** – multi-select checkboxes: Casual, Work, Formal, Sport, Party

11. **Price** – number input (VND), optional

12. **Purchase Date** – date picker, optional

13. **Tags** – tag input (type + Enter to add, click × to remove)

14. **Notes** – textarea, optional, max 500 chars

15. **Status** – radio buttons: Active (default), Donated, Sold, Damaged

#### Validation:
- Name and Category are required
- Photo is required for new items
- Price must be ≥ 0 if provided
- Show inline error messages below each invalid field
- Disable submit button while validating

#### Submit behavior:
- Show loading spinner on submit button
- On success: navigate to item detail page, show success toast
- On error: show error toast, stay on form

---

### 6.4 Item Detail Page (`/closet/:id`)
- Large photo display (full width on mobile)
- All item info displayed in organized sections
- Action buttons: Edit, Delete, "Log Wear Today", "Add to Outfit"
- Wear history: list of dates this item was worn
- "Worn X times" counter prominently displayed
- Last worn date
- Delete: show confirmation modal before deleting

---

### 6.5 Outfits (`/outfits`)
- Grid of saved outfit cards
- Each card: collage of 4 item photos (2×2 grid), outfit name, occasion
- "Create Outfit" button

#### Create Outfit (`/outfits/add`):
- Name (required)
- Occasion & Season dropdowns
- Item selector: show closet items as scrollable grid, tap to select/deselect
  - Selected items shown with checkmark overlay
  - Selected items summary shown at bottom
- Notes textarea
- Save button

---

### 6.6 Wear Log (`/log`)

#### Calendar view:
- Monthly calendar (default current month)
- Days with logged wears shown with colored dot indicator
- Click a day → show items worn that day in a modal/panel
- "Log Today" button always visible

#### Log Wear (`/log/add`):
- Date picker (default: today)
- Item selector (same as outfit item selector)
- Optionally link to a saved outfit (dropdown)
- Notes
- On save: increment `wearCount` and update `lastWornDate` for each selected item

---

### 6.7 Statistics (`/stats`)

All charts use Recharts. Data calculated from IndexedDB on page load.

#### 6.7.1 Overview Cards
- Total items in wardrobe
- Total estimated value (sum of all active item prices)
- Most worn item (name + wear count)
- Least worn active item (wearCount === 0 or minimum)

#### 6.7.2 Category Distribution
- Pie chart: items per category
- Show legend with count and percentage

#### 6.7.3 Color Distribution
- Horizontal bar chart or color swatch grid
- Top 8 colors by frequency

#### 6.7.4 Wear Frequency
- Bar chart: top 10 most-worn items
- Show item name (truncated) + wear count

#### 6.7.5 Spending Over Time
- Line chart: spending per month (based on purchaseDate + price)
- Only show if price data exists for ≥ 3 items

#### 6.7.6 Season & Occasion
- Two small pie/donut charts side by side
- Season distribution, Occasion distribution

#### 6.7.7 Wardrobe Health
- "Cost per wear" for each item = price / wearCount (skip if wearCount === 0)
- List top 5 best value and worst value items

---

### 6.8 Settings (`/settings`)

- **Change Password**: current password + new password + confirm
- **Export Data**: download all data as JSON file (includes base64 images)
- **Import Data**: upload JSON file to restore backup
- **Clear All Data**: delete everything, show confirmation modal, require password
- **App Info**: version number, storage used (estimate from IndexedDB)

---

## 7. UI/UX Requirements

### 7.1 Responsive Breakpoints
- Mobile: < 640px → single column, bottom nav bar
- Tablet: 640–1024px → 2–3 columns, side nav optional
- Desktop: > 1024px → sidebar navigation, multi-column grid

### 7.2 Navigation
- **Mobile**: Fixed bottom navigation bar with icons: Home, Closet, Outfits, Log, Stats
- **Desktop**: Left sidebar with text labels + icons

### 7.3 Theme
- Color palette: soft pastel tones (lavender, blush pink, sage green, warm white)
- Font: Inter or system-ui
- Rounded corners on all cards (rounded-2xl)
- Subtle shadows on cards (shadow-sm)
- Smooth transitions on hover/focus (transition-all duration-200)

### 7.4 Loading States
- Skeleton loaders for image grids while loading from IndexedDB
- Spinner on all async action buttons
- Empty state illustrations/messages when no data exists

### 7.5 Toast Notifications
- Success toasts: green, auto-dismiss after 3s
- Error toasts: red, auto-dismiss after 5s
- Position: top-right on desktop, top-center on mobile

### 7.6 Modals & Confirmations
- All destructive actions (delete, clear data) require a confirmation modal
- Modals should be dismissible by clicking backdrop or pressing Escape

---

## 8. Storage Architecture

### 8.1 IndexedDB Database
- Database name: `personal-closet-db`
- Version: 1

### 8.2 Object Stores

| Store | Key | Indexes |
|---|---|---|
| `items` | `id` | `category`, `status`, `createdAt` |
| `outfits` | `id` | `createdAt` |
| `wearLogs` | `id` | `date` |
| `settings` | `key` | — |

### 8.3 Settings Keys
- `auth.passwordHash` – SHA-256 hash string
- `app.version` – string

### 8.4 Image Storage Strategy
- Compress image to max 800px width before storing
- Store as base64 string in `items.imageBase64`
- Estimate ~50–200KB per image after compression
- Warn user if total storage exceeds 50MB

---

## 9. Performance Requirements
- Initial load (first paint): < 2 seconds on desktop
- Image compression must happen client-side before storing
- IndexedDB reads for closet grid: < 500ms for up to 500 items
- Search/filter results update: < 300ms (debounced)

---

## 10. Error Handling
- If IndexedDB is unavailable (private browsing): show persistent warning banner, app still renders but cannot save
- If image upload fails: show error toast, allow retry
- If import JSON is invalid format: show descriptive error, do not corrupt existing data
- Wrap all IndexedDB operations in try/catch, log errors to console

---

## 11. Project File Structure

```
personal-closet/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SetupPage.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── closet/
│   │   │   ├── ClosetPage.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── ImageUploader.jsx
│   │   ├── outfits/
│   │   │   ├── OutfitsPage.jsx
│   │   │   ├── OutfitCard.jsx
│   │   │   └── OutfitForm.jsx
│   │   ├── log/
│   │   │   ├── WearLogPage.jsx
│   │   │   └── LogForm.jsx
│   │   ├── stats/
│   │   │   └── StatsPage.jsx
│   │   ├── settings/
│   │   │   └── SettingsPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   └── shared/
│   │       ├── Layout.jsx
│   │       ├── BottomNav.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Toast.jsx
│   │       ├── Modal.jsx
│   │       └── SkeletonCard.jsx
│   ├── hooks/
│   │   ├── useItems.js
│   │   ├── useOutfits.js
│   │   ├── useWearLog.js
│   │   └── useAuth.js
│   ├── db/
│   │   ├── database.js       ← IndexedDB setup with `idb`
│   │   ├── itemsDB.js        ← CRUD for items
│   │   ├── outfitsDB.js      ← CRUD for outfits
│   │   ├── wearLogDB.js      ← CRUD for wear logs
│   │   └── settingsDB.js     ← Auth hash + app settings
│   ├── utils/
│   │   ├── imageUtils.js     ← compress & convert to base64
│   │   ├── hashUtils.js      ← SHA-256 password hashing
│   │   ├── exportUtils.js    ← JSON export/import
│   │   └── statsUtils.js     ← stat calculation helpers
│   ├── constants/
│   │   └── categories.js     ← Category, season, occasion lists
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 12. Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "idb": "^8.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 13. Claude Code Prompt to Start

Use this prompt to initialize the project in Claude Code:

```
Build a Personal Closet web app using React (JavaScript) + Tailwind CSS + Vite.
Follow the SRS document exactly. Start by:

1. Initialize Vite project with React
2. Install all dependencies listed in Section 12
3. Set up Tailwind CSS
4. Create the IndexedDB database layer (src/db/) using the `idb` library
5. Create the auth flow: SetupPage → LoginPage → ProtectedRoute
6. Create the Layout with BottomNav (mobile) and Sidebar (desktop)
7. Implement the Closet page with grid view, search, and filter
8. Implement the Add/Edit Item form with image upload and compression
9. Build remaining pages: Outfits, WearLog, Stats, Settings, Dashboard

Use pastel colors (lavender, blush pink, sage green). 
Use Lucide React for all icons.
Use Recharts for all charts in the Stats page.
All data is stored in IndexedDB – no backend, no API calls.
```
