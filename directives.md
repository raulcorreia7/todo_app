# Luxury Todo App - Design & Behavior Directives

## 1. Core Ethos

The application should evoke a feeling of **luxury, premium quality, and sophisticated simplicity**. Every interaction should be deliberate, polished, and rewarding. The design should be clean and modern, with a focus on creating a calming yet inspiring user experience.

## 2. Visual Design Language

### 2.1. Aesthetic Principles
*   **Glass-Morphism:** A cornerstone of the design. Elements should have a translucent, frosted-glass appearance created with `backdrop-filter: blur()`, semi-transparent backgrounds, and subtle borders.
*   **Glowing Accents:** Strategic use of soft, ambient glows. These should not be harsh but rather subtle luminous highlights on interactive elements, borders, or as part of the background effects. Use CSS variables like `--glow-color` and `--shadow-color` for theming.
*   **Subtle Shadows:** Employ soft, diffused shadows to create depth and hierarchy without being obtrusive. Shadows should complement the glass effect and glow.
*   **Negative Space:** Ample use of white space (or rather, "theme space") to reduce clutter and enhance readability and focus.
*   **Refined Color Palettes:** Each theme should have a carefully curated color palette that feels harmonious and luxurious. Colors should transition smoothly and have good contrast for readability.

### 2.2. Typography
*   **Elegant Fonts:** Use high-quality, legible fonts (e.g., Inter, Playfair Display, SF Pro Display).
*   **Clear Hierarchy:** Establish a clear visual hierarchy through font size, weight, and spacing.
*   **Smooth Transitions:** Font changes should be smooth and animated.

### 2.3. Iconography
*   **Consistent Style:** Use a consistent icon style (Lucide icons are currently in use).
*   **Meaningful & Simple:** Icons should be intuitive and not overly complex.

## 3. Interaction & Animation Design

### 3.1. Micro-Interactions
*   **Purpose:** Every micro-interaction should provide feedback, delight, and reinforce the sense of quality.
*   **Subtlety is Key:** Interactions must be understated. Avoid jarring or overly aggressive animations.
*   **Types of Interactions:**
    *   **Hover States:** Gentle scale (`transform: scale(1.02-1.05)`), soft glow enhancement, or a subtle color shift.
    *   **Active/Click States:** A slight `scale(0.95-0.98)` to simulate a physical press.
    *   **Focus States:** A clear, glowing outline (`box-shadow`) for keyboard navigation.
    *   **Selection States:** A more pronounced glow or a gentle "pulse" to indicate an active choice (e.g., selected theme or font).
    *   **Loading/Transitions:** Smooth, elegant transitions between states (e.g., when panels open/close or themes change).

### 3.2. Animation Principles
*   **Easing:** Use sophisticated easing functions (e.g., `cubic-bezier(0.4, 0, 0.2, 1)`) for natural-feeling motion.
*   **Performance:** Prioritize performance by using `transform` and `opacity` for animations to leverage GPU acceleration.
*   **Meaningful:** Animations should have a purpose – to guide the user, provide feedback, or enhance the aesthetic. They should not be purely decorative or distracting.

## 4. Audio Design

### 4.1. Philosophy
*   **Subtle & Dopamine-Inducing:** Audio feedback should be a gentle reward for user interaction, designed to create a sense of satisfaction and premium quality.
*   **Non-Intrusive:** Sounds should be soft and never jarring or overwhelming. They should complement the visual experience without competing for attention.
*   **Contextual:** Different actions should have distinct, yet thematically consistent, sounds.

### 4.2. Sound Application
*   **UI Interactions:**
    *   **Theme Change:** A soft, elegant "royal reveal" chime (existing `palette` sound).
    *   **Font Change:** A gentle, high-pitched bell or a soft "whoosh".
    *   **Button Clicks:** Subtle "blip" or "click" sounds.
    *   **Panel Open/Close:** A soft "whoosh" or gentle chime.
*   **Task Interactions:**
    *   **Add Task:** A delicate "crystal drop" sound.
    *   **Complete Task:** A satisfying, gentle "golden chime".
    *   **Delete Task:** A soft "velvet swipe".
*   **Volume Control:** A very subtle "blip" when adjusting the volume slider.

### 4.3. Technical Considerations
*   Use the Web Audio API for high-quality sound generation.
*   All sounds should be mixed to an appropriate master volume.
*   Provide a global mute/unmute toggle.

## 5. Component-Specific Guidelines

### 5.1. Settings Panel
*   **Feel:** Luxurious, premium, glass, glowing.
*   **Header:** Sticky with a glass effect and a subtle glowing bottom border.
*   **Theme Swatches:** Glass-morphism with a soft glow. On hover/active, a gentle scale and enhanced glow. Active state should be clearly visible.
*   **Font Buttons:** Glass-morphism with subtle borders and glow on interaction.
*   **Sound Toggle:** A premium-styled toggle switch with a gentle glow when active.
*   **Volume Slider:** A large, touch-friendly slider with a glass-morphism track, a glowing thumb, and a smooth-fill animation. Subtle audio feedback on adjustment.
*   **Overall:** The panel should feel like a cohesive, high-end control center.

### 5.2. Task List
*   **Task Entry:** Smooth "luxuryTaskEntry" animation.
*   **Task Completion:** A satisfying "successGlow" animation.
*   **Interactive Elements:** Buttons for edit, delete, and complete should have subtle hover and active states.

### 5.3. General UI
*   **Buttons:** Consistent styling with glass-morphism, subtle borders, and a glow on hover. Include a gentle shimmer effect on hover.
*   **Inputs:** Glass-morphism with a focus glow.
*   **Modals/Overlays:** Backdrop blur, smooth fade-in/scale animations.

## 6. Responsiveness & Accessibility

### 6.1. Responsiveness
*   **Mobile-First:** Design for mobile devices first, then scale up.
*   **Touch Targets:** Ensure all interactive elements have adequate `min-height` and `min-width` for easy tapping.
*   **Fluid Layouts:** Use flexible units (rem, %, vh/vw) for a fluid experience.
*   **Adaptive Spacing:** Adjust padding, margins, and font sizes for different screen sizes.

### 6.2. Accessibility (a11y)
*   **Keyboard Navigation:** All interactive elements must be fully accessible via keyboard.
*   **Screen Readers:** Use appropriate ARIA labels, roles, and states.
*   **Color Contrast:** Ensure text and interactive elements meet WCAG contrast ratio standards.
*   **Focus Indicators:** Provide clear and visible focus styles.
*   **Reduced Motion:** Respect `prefers-reduced-motion` by providing minimal or no animations.

## 7. Performance & Technical Quality

*   **Optimized Code:** Write clean, maintainable, and efficient code.
*   **Fast Load Times:** Optimize assets and code for fast initial loading.
*   **Smooth Performance:** Ensure all animations and interactions run at 60fps.
*   **Cross-Browser Compatibility:** Test and ensure a consistent experience across modern browsers.

---
*This document will be updated as the application evolves and new design patterns are established.*
