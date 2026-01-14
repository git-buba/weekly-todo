# Mobile Testing Guide

## 📱 Mobile Optimization Checklist

### Viewport & Layout Testing

#### Breakpoints to Test
- [ ] **320px** - iPhone SE (smallest)
- [ ] **375px** - iPhone 12/13/14
- [ ] **390px** - iPhone 12 Pro
- [ ] **414px** - iPhone Plus models
- [ ] **768px** - iPad Mini
- [ ] **820px** - iPad Air
- [ ] **1024px** - iPad Pro

#### Orientation Testing
- [ ] Portrait mode on all devices
- [ ] Landscape mode on all devices
- [ ] Rotation handling (no layout breaks)

### Touch Interactions

#### Touch Target Sizes
✅ **All interactive elements meet 44x44px minimum**
- [ ] Buttons (New Task, navigation)
- [ ] Task cards (tap to open)
- [ ] Drag handles
- [ ] Dropdown selectors
- [ ] Theme toggle
- [ ] Dialog close buttons

#### Gesture Support
- [ ] **Tap**: Open task details
- [ ] **Long Press**: Initiate drag (Kanban)
- [ ] **Swipe**: Natural scrolling
- [ ] **Pinch**: Zoom support maintained
- [ ] **Double Tap**: No accidental zooms

### Page-Specific Testing

## Landing Page (/)

### Mobile (< 640px)
- [ ] Hero text readable without zoom
- [ ] CTA buttons stack vertically
- [ ] Feature cards single column
- [ ] Footer items stack
- [ ] All text legible at default size

### Tablet (640px - 1024px)
- [ ] 2-column feature grid
- [ ] Proper spacing maintained
- [ ] Images scale appropriately

---

## TODO Page (/todo)

### Mobile (< 640px)
- [ ] Page header stacks vertically
- [ ] "New Task" button full width
- [ ] Week selector + view toggle in separate rows
- [ ] **Kanban View**:
  - [ ] Columns stack vertically OR
  - [ ] Horizontal scroll with snap points
  - [ ] Drag handles visible and tappable
  - [ ] Drop zones clearly indicated
- [ ] **List View**:
  - [ ] Single column layout
  - [ ] Task cards comfortable padding
  - [ ] Priority badges readable

### Tablet (640px - 1024px)
- [ ] 2 Kanban columns visible
- [ ] Side-by-side controls
- [ ] Comfortable touch targets

### Drag & Drop on Touch
- [ ] Drag handle appears on tap and hold
- [ ] Task follows finger movement
- [ ] Visual feedback during drag
- [ ] Drop zones highlight on hover
- [ ] Successful drop confirmation
- [ ] Failed drop returns to origin

---

## Weekly Report (/todo/report)

### Mobile (< 640px)
- [ ] Week navigation buttons stack or condense
- [ ] Daily cards single column
- [ ] Scroll through all 7 days
- [ ] Stats grid 2x2 layout
- [ ] Incomplete section readable
- [ ] Tasks don't overflow containers

### Tablet (640px - 1024px)
- [ ] 2-3 daily cards per row
- [ ] 4-column stats grid
- [ ] Comfortable spacing

### Desktop (> 1024px)
- [ ] All 7 daily cards in single row
- [ ] Proper visual hierarchy
- [ ] No horizontal scroll needed

---

## Task Dialog (Create/Edit)

### Mobile
- [ ] Dialog doesn't exceed viewport height
- [ ] Scrollable content area
- [ ] Keyboard doesn't hide form fields
- [ ] Date picker readable and usable
- [ ] Tag input accessible
- [ ] Cancel/Submit buttons always visible
- [ ] Close on backdrop tap (mobile convention)

### Form Fields
- [ ] Text input large enough to tap
- [ ] Dropdowns open properly
- [ ] Calendar picker mobile-friendly
- [ ] Tag badges tappable for removal
- [ ] Character counter visible

---

## Navigation & Header

### Mobile
- [ ] Logo + title visible or logo only
- [ ] Navigation items condensed
- [ ] Theme toggle accessible
- [ ] Sticky header stays visible on scroll
- [ ] No text cutoff

### Tablet
- [ ] Full navigation visible
- [ ] Proper spacing between items

---

## Performance on Mobile

### Loading Times
- [ ] Initial load < 3s on 3G
- [ ] Task operations < 100ms
- [ ] Smooth 60fps animations
- [ ] No jank during scroll
- [ ] Drag operations smooth

### Network Handling
- [ ] Works offline (localStorage)
- [ ] No network errors
- [ ] Loading states appropriate

---

## Accessibility on Mobile

### Screen Reader (VoiceOver/TalkBack)
- [ ] All elements announced correctly
- [ ] Navigation order logical
- [ ] Interactive elements identified
- [ ] Status updates announced
- [ ] Form validation errors read aloud

### Font Scaling
- [ ] Layout doesn't break at 200% text size
- [ ] Content remains readable
- [ ] Buttons don't shrink below minimum size

### High Contrast Mode
- [ ] Text visible in high contrast
- [ ] Borders/outlines present
- [ ] Icons distinguishable

---

## Browser Testing

### iOS Safari
- [ ] All features work
- [ ] No PWA prompts (unless enabled)
- [ ] Swipe gestures don't conflict
- [ ] Touch events properly handled
- [ ] Scrolling smooth (no rubber band issues)

### Chrome Mobile (Android)
- [ ] All features work
- [ ] Material Design conventions respected
- [ ] Back button behavior correct
- [ ] No bottom bar conflicts

### Firefox Mobile
- [ ] All features work
- [ ] Proper rendering
- [ ] Touch events work

---

## Common Mobile Issues to Check

### Layout Issues
- [ ] No horizontal scroll when unwanted
- [ ] Content doesn't overflow viewport
- [ ] Fixed positioning works correctly
- [ ] Sticky elements behave properly
- [ ] No cut-off text or buttons

### Input Issues
- [ ] Keyboard shows for text inputs
- [ ] Keyboard type correct (text/number/email)
- [ ] Zoom disabled on focus (if desired)
- [ ] Autocomplete works
- [ ] Autocorrect appropriate

### Touch Issues
- [ ] No ghost clicks
- [ ] No touch delay (300ms)
- [ ] Touch ripple effects present
- [ ] Hover states don't stick after tap
- [ ] Double-tap zoom disabled on buttons

### Performance Issues
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Quick tap responses
- [ ] No layout thrashing
- [ ] Efficient re-renders

---

## Testing Tools

### Browser DevTools
```bash
# Chrome DevTools
1. F12 or Cmd+Option+I
2. Click device toolbar icon (Cmd+Shift+M)
3. Select device from dropdown
4. Test in responsive mode
```

### Real Device Testing
**Recommended Devices**:
- iPhone (latest iOS)
- iPhone SE (small screen)
- Android phone (latest)
- iPad
- Android tablet

### Emulators/Simulators
- iOS Simulator (Xcode)
- Android Emulator (Android Studio)
- BrowserStack for cross-device testing

### Lighthouse Mobile Audit
```bash
npm run build
npm start
# Open Chrome DevTools > Lighthouse
# Select "Mobile" device
# Run audit
```

**Target Scores**:
- Performance: > 90
- Accessibility: 100
- Best Practices: > 90
- SEO: > 90

---

## Quick Mobile Test Script

### 5-Minute Mobile Test
1. **Open on mobile device** (or DevTools mobile view)
2. **Landing page**: Tap "Get Started"
3. **Create task**: Tap "New Task", fill form, submit
4. **Drag task**: Long press task, drag to another column
5. **View modes**: Toggle Kanban ↔ List
6. **Week filter**: Select "This Week"
7. **Report**: Navigate to weekly report
8. **Theme**: Toggle dark mode
9. **Navigation**: Use back button, navigate between pages
10. **Logout**: Clear cache, reload (test fresh start)

### Issues Found?
Document with:
- Device model
- OS version
- Browser version
- Screen size
- Steps to reproduce
- Expected vs actual behavior
- Screenshot/video if possible

---

## Mobile Optimization Features Implemented

### ✅ Completed
- Responsive grid layouts (mobile-first)
- Touch-friendly button sizes (44x44px minimum)
- Drag & drop with touch support
- Mobile-optimized dialogs
- Collapsible navigation
- Smooth animations
- Fast tap response
- Proper viewport meta tags
- Theme persistence
- localStorage for offline use

### 🚧 Future Enhancements
- Service worker (PWA)
- Offline mode indicator
- Swipe gestures for task actions
- Pull-to-refresh
- Bottom sheet on mobile
- Haptic feedback
- Install prompt
- Share functionality

---

## Troubleshooting Mobile Issues

### Drag & Drop Not Working on Touch
- Check touch event listeners
- Verify activation distance (8px)
- Test long press duration
- Check z-index conflicts

### Layout Breaking on Small Screens
- Review breakpoint definitions
- Check for fixed widths
- Verify overflow handling
- Test with DevTools mobile view

### Keyboard Covering Inputs
- Ensure proper viewport height handling
- Test with keyboard open
- Verify scroll behavior
- Check input focus behavior

### Slow Performance
- Check for memory leaks
- Optimize re-renders
- Review animation performance
- Test on low-end device

---

## Success Criteria

Mobile optimization is successful when:
- ✅ All features work on mobile as well as desktop
- ✅ Touch interactions feel natural and responsive
- ✅ Layout never breaks on any screen size
- ✅ Performance is smooth (60fps)
- ✅ Accessibility standards met on mobile
- ✅ Users can complete all tasks with touch only
- ✅ App feels like a native mobile experience

---

**Last Updated**: Phase 9 - Mobile Optimization Complete
