# Qindil Project - Frontend UI Components

This repository contains the frontend implementation for the Qindil project, focusing on reusable UI components built with Next.js, TypeScript, and Tailwind CSS.

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Select.tsx
│   │   │   └── ... (other components)
│   │   └── styles/
│   │       └── globals.css
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── ... (other config files)
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── services/
│   └── ... (other backend files)
└── ... (other project files)
```

## UI Components

The project includes the following reusable UI components:

- **Button**: A versatile button component with primary/secondary variants, different sizes, loading states, and icon support
- **Input**: Text input component with label, helper text, error states, and icon support
- **Select**: Dropdown selection component with customizable options
- **Checkbox**: Boolean input component with label and error states
- **Card**: Component for displaying teacher profiles with various information
- **Modal**: Dialog component with customizable content, title, and footer
- **Avatar**: User profile image component with status indicators
- **Badge**: Status indicator component with various variants and sizes

## Brand Colors

The project uses a custom color palette defined in Tailwind configuration:

- `golden-glow`: Primary brand color (#F9B142)
- `aguirre-sky`: Secondary brand color (#7EAAC9)
- `warm-beige`: Neutral color (#F5E6CA)
- `sunrise-orange`: Accent color (#F98E54)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

The project uses Jest and React Testing Library for component testing:

```bash
npm test
```

## Accessibility

All components are built with accessibility in mind, including:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Reduced motion support
- RTL language support

## Contributing

Please refer to the task lists in the `tasks/` directory for ongoing implementation tasks and guidelines.