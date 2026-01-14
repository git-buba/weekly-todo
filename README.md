# Weekly TODO - Task Management by Week

A modern, responsive weekly TODO management application built with Next.js 15, TypeScript, and shadcn/ui. Manage your tasks efficiently with ISO 8601 week-based filtering, drag-and-drop Kanban board, and comprehensive weekly reports.

## 🌟 Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Multiple Views**: Toggle between Kanban board and List view
- **Week-Based Filtering**: ISO 8601 standard (Monday-Sunday)
  - This Week / Last Week / Next Week / All
  - Incomplete tasks always visible
  - Completed tasks filtered by completion week
- **Drag & Drop**: Intuitive task management with dnd-kit
- **Weekly Reports**: Comprehensive productivity tracking
  - Daily breakdown (7 cards Mon-Sun)
  - Weekly statistics
  - Incomplete tasks overview

### Task Properties
- **Content**: Rich task descriptions (3-500 characters)
- **Status**: Upcoming / In Progress / Completed / On Hold
- **Priority**: Low / Medium / High / Urgent (color-coded)
- **Deadline**: Optional date picker with smart formatting
- **Tags**: Multiple tags with easy management
- **Timestamps**: Automatic creation and completion tracking

### UI/UX Features
- **Light/Dark Theme**: System-aware with manual toggle
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG AA compliant
- **Touch-Friendly**: Optimized for mobile and tablets
- **Keyboard Navigation**: Full keyboard support
- **Toast Notifications**: User feedback for all actions

## 📱 Mobile Optimization

### Touch Interactions
- **Minimum Touch Target**: 44x44px for all interactive elements
- **Drag & Drop**: Smooth touch drag with 8px activation distance
- **Swipe Gestures**: Natural mobile navigation
- **Keyboard Avoidance**: Forms don't hide under mobile keyboard

### Responsive Breakpoints
```css
Mobile:  < 640px   (1 column layouts, stacked navigation)
Tablet:  640-1024px (2-3 column grids)
Desktop: > 1024px   (Full 4-column Kanban, 7-day report)
```

### Mobile-Specific Features
- Horizontal scroll for Kanban board on small screens
- Single-column task list on mobile
- Stacked weekly report cards
- Collapsible navigation on mobile
- Full-screen dialogs on small screens
- Touch-optimized drag handles

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd weekly-todo

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Technology Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui

### Key Libraries
- **State Management**: Zustand 5.0 (with localStorage persistence)
- **Drag & Drop**: @dnd-kit 6.1
- **Theme**: next-themes 0.4
- **Icons**: lucide-react
- **Date Handling**: date-fns 4.1

### Data Storage
- **Current**: localStorage (client-side)
- **Future**: Supabase (PostgreSQL) with storage adapter abstraction

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── todo/              # TODO management
│   │   ├── page.tsx       # Main TODO page
│   │   └── report/        # Weekly reports
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (header, theme toggle)
│   ├── todo/              # Task management components
│   └── report/            # Report page components
├── lib/
│   ├── date-utils.ts      # ISO 8601 week calculations
│   └── filter-utils.ts    # Task filtering logic
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
│   ├── task-store.ts      # Task state management
│   └── filter-store.ts    # Filter state management
├── types/                 # TypeScript type definitions
│   ├── task.ts            # Task and report types
│   └── filter.ts          # Filter types
└── services/
    └── storage/           # Storage abstraction layer
        ├── storage-adapter.ts
        └── local-storage.ts
```

## 🎯 Key Features Explained

### ISO 8601 Week Filtering

The application uses **ISO 8601 week standard**:
- Week starts on **Monday**, ends on **Sunday**
- Week 1 contains the first Thursday of the year
- Properly handles year boundaries

**Critical Business Logic**:
- ✅ Incomplete tasks (Upcoming/In Progress/On Hold) → **Always visible** regardless of week
- ✅ Completed tasks → **Only shown** if `completedAt` is in the selected week

### Drag & Drop Functionality

**Kanban Board Features**:
- Drag tasks between columns to change status
- Reorder tasks within the same column
- Visual feedback during drag (hover effects, drag overlay)
- Keyboard accessible (Space to pick up, Arrow keys to move)
- Touch-friendly with activation distance

**Supported Operations**:
- Cross-column movement (status change)
- Within-column reordering (order change)
- Drop on column header (move to end)
- Drop on specific task (insert at position)

### Weekly Report

**Daily Cards** (7 per week):
- Tasks **created** on that day
- Tasks **completed** on that day
- Highlights today's card
- Shows "No activity" for empty days

**Weekly Statistics**:
- Total tasks (all time)
- Completed this week
- Created this week
- Incomplete tasks count

**Incomplete Section**:
- All Upcoming tasks
- All In Progress tasks (highlighted)
- All On Hold tasks
- Regardless of week filter

## 🎨 Design System

### Colors
- **Primary**: Blue (task actions, highlights)
- **Success**: Green (completed tasks, in progress)
- **Warning**: Orange (high priority, overdue)
- **Destructive**: Red (delete actions, urgent)
- **Muted**: Gray (on hold, disabled states)

### Priority Colors
- **Low**: Blue
- **Medium**: Yellow
- **High**: Orange
- **Urgent**: Red

### Typography
- **Font**: Inter (system fallback)
- **Headings**: Bold, tight tracking
- **Body**: Regular, readable line height
- **Code**: Monospace for technical elements

## 🔐 Data Persistence

### Current: localStorage
- Automatic persistence via Zustand middleware
- Key: `weekly-todo-tasks`
- ~5-10MB storage limit
- Survives page refresh
- Client-side only

### Storage Structure
```typescript
{
  tasks: Task[],           // Array of all tasks
  settings: {
    theme: 'light' | 'dark' | 'system',
    viewMode: 'kanban' | 'list',
    lastViewedWeek: string
  }
}
```

### Future: Supabase
Storage adapter interface enables easy migration:
- PostgreSQL database
- Row-level security
- Real-time subscriptions
- Multi-device sync
- Authentication ready

## ♿ Accessibility

### WCAG AA Compliance
- ✅ Color contrast ratios 4.5:1 for text
- ✅ All interactive elements keyboard accessible
- ✅ ARIA labels and roles properly implemented
- ✅ Focus indicators visible
- ✅ Screen reader friendly

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Escape**: Close dialogs
- **Arrow Keys**: Navigate in drag mode

### Screen Reader Support
- Descriptive labels for all form inputs
- Live regions for dynamic content
- Status announcements
- Alternative text for icons

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create task with all properties
- [ ] Edit task details
- [ ] Delete task with confirmation
- [ ] Drag task between columns
- [ ] Reorder within column
- [ ] Switch Kanban/List views
- [ ] Filter by week (This/Last/Next/All)
- [ ] View weekly report
- [ ] Navigate between weeks
- [ ] Toggle light/dark theme
- [ ] Test on mobile device
- [ ] Test keyboard navigation

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## 📊 Performance

### Bundle Sizes
- Landing page: ~148 KB
- TODO page: ~207 KB (includes dnd-kit)
- Report page: ~156 KB

### Optimizations
- Code splitting by route
- Dynamic imports for heavy components
- Memoized filtered task lists
- Debounced search/filter inputs
- Virtual scrolling ready for large lists

## 🚧 Future Enhancements

### Phase 11: Authentication
- [ ] NextAuth.js integration
- [ ] GitHub OAuth
- [ ] Google OAuth
- [ ] User profiles
- [ ] Data migration from localStorage

### Phase 12: Cloud Sync
- [ ] Supabase integration
- [ ] Real-time multi-device sync
- [ ] Conflict resolution
- [ ] Offline-first architecture

### Phase 13: Advanced Features
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] Subtasks
- [ ] Collaboration (shared lists)
- [ ] Export to PDF/CSV
- [ ] Task analytics dashboard
- [ ] Calendar view
- [ ] Time tracking
- [ ] Email notifications
- [ ] Search functionality

### Phase 14: PWA
- [ ] Service worker
- [ ] Offline support
- [ ] Install prompt
- [ ] Background sync
- [ ] Push notifications

## 🤝 Contributing

This project was built as a demonstration of modern Next.js development practices. Contributions are welcome!

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write meaningful commit messages
- Test on multiple devices
- Maintain accessibility standards

## 📄 License

MIT License - feel free to use this project for learning or as a template for your own applications.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Drag and drop by [dnd-kit](https://dndkit.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**

*A modern approach to weekly task management*
