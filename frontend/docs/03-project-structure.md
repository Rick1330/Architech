# Project Structure

The Architech Studio frontend follows a standard Next.js App Router structure, organized by feature and domain for clarity and maintainability.

```
/
├── docs/                     # All project documentation in Markdown.
├── public/                   # Static assets.
├── src/
│   ├── app/                  # Next.js App Router pages and layouts.
│   │   ├── page.tsx          # Main application page component.
│   │   ├── layout.tsx        # Root layout for the application.
│   │   ├── globals.css       # Global styles and Tailwind CSS layers.
│   │   └── actions.ts        # Next.js Server Actions for AI flows.
│   │
│   ├── ai/                   # Genkit AI integration.
│   │   ├── flows/            # Definitions for AI-powered flows.
│   │   ├── genkit.ts         # Genkit global configuration.
│   │   └── dev.ts            # Entrypoint for the Genkit development server.
│   │
│   ├── components/           # Reusable React components.
│   │   ├── ui/               # Core UI components from ShadCN.
│   │   └── *.tsx             # Application-specific components (e.g., Header, Sidebar).
│   │
│   ├── contexts/             # React Context for global state.
│   │   └── app-context.tsx   # Core application state, reducer, and provider.
│   │
│   ├── hooks/                # Custom React hooks.
│   │   └── use-toast.ts      # Hook for displaying toast notifications.
│   │
│   └── lib/                  # Core libraries, utilities, and type definitions.
│       ├── api-client.ts     # Axios and WebSocket client configuration.
│       ├── data.ts           # Static data (e.g., component palette definitions).
│       ├── types.ts          # Global TypeScript type definitions.
│       └── utils.ts          # Utility functions.
│
├── .env                      # Environment variables (untracked by Git).
├── next.config.ts            # Next.js configuration.
├── tailwind.config.ts        # Tailwind CSS configuration.
└── tsconfig.json             # TypeScript compiler configuration.
```

## Key Directories Explained

-   **`src/app`**: This is the heart of the Next.js application, containing the main page (`page.tsx`) and the root layout (`layout.tsx`). The global stylesheet (`globals.css`) defines the application's theme and color variables. `actions.ts` exposes server-side Genkit flows to the client securely.

-   **`src/ai`**: This directory encapsulates all logic related to the AI Design Assistant. It uses Genkit to define prompts and flows that interact with Google's Gemini models.

-   **`src/components`**: Contains all React components. The `ui` subdirectory holds the ShadCN UI components, while other files represent larger, feature-specific components like the `DesignCanvas` or `PropertyPanel`.

-   **`src/contexts`**: Home to the application's global state management. `app-context.tsx` is the most critical file here, defining the application's state shape, reducer logic, and the context provider that makes state available to the entire component tree.

-   **`src/hooks`**: Custom React hooks are stored here. For example, `use-toast.ts` provides a clean interface for triggering notifications.

-   **`src/lib`**: A collection of shared utilities, configurations, and definitions. `api-client.ts` configures the clients for backend communication, `types.ts` provides TypeScript definitions for data structures shared across the app, and `data.ts` holds static application data.
