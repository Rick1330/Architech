# Deployment and Testing

This guide covers the process of building the application for production and the recommended testing strategy.

## Building for Production

To create a production-ready build of the application, run the following command:

```bash
npm run build
```

This command will:
1.  Compile the TypeScript and React code.
2.  Optimize all assets (JavaScript, CSS, images).
3.  Generate a static, production-optimized build in the `.next` directory.

## Deployment

The generated build is a standard Next.js application and can be deployed to any hosting provider that supports Node.js or static site hosting.

### Example: Deploying to a Generic Server (e.g., Nginx)

1.  **Build the application:** Run `npm run build`.
2.  **Copy the build output:** Transfer the contents of the `.next` directory, `public` directory, and `package.json` to your server.
3.  **Install production dependencies:** On the server, run `npm install --production`.
4.  **Start the application:** Use a process manager like `pm2` to run the Next.js server.
    ```bash
    pm2 start npm --name "architech-studio" -- start
    ```
5.  **Configure a reverse proxy (Nginx):** Set up Nginx to proxy requests to the running Next.js application (which typically runs on port 3000 by default).

> **Note:** Since this project is fully decoupled from Firebase for its backend, no Firebase-specific hosting or cloud functions are required for deployment.

## Testing Strategy

While the current project does not have an established test suite, the following strategy is recommended for ensuring code quality and stability.

### Unit Tests

-   **Tooling:** [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
-   **Scope:** Test individual components and utility functions in isolation.
-   **Examples:**
    -   Verify that a component renders correctly given a specific set of props.
    -   Test that a utility function (`getComponentColor`) returns the expected output for a given input.
    -   Mock `AppContext` to test how a component behaves with different global states.

### Integration Tests

-   **Tooling:** React Testing Library, simulating more complex user flows.
-   **Scope:** Test the interaction between multiple components.
-   **Examples:**
    -   Simulate a user dragging a component from the `ComponentPalette` to the `DesignCanvas` and verify that the correct action is dispatched.
    -   Test the full flow of selecting a component, changing its properties in the `PropertyPanel`, and saving the changes.

### End-to-End (E2E) Tests

-   **Tooling:** A framework like [Cypress](https://www.cypress.io/) or [Playwright](https://playwright.dev/).
-   **Scope:** Simulate complete user workflows across the entire application in a real browser.
-   **Examples:**
    -   A test that loads the application, creates a new project, builds a simple two-service architecture, saves it, and verifies the result.
    -   A test that starts and stops a simulation and checks that the UI updates correctly.
