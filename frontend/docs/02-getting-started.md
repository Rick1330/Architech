# Getting Started

This guide provides everything you need to set up, run, and configure the Architech Studio frontend on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (this guide uses npm)

## Installation

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd architech-studio
    ```

2.  **Install Dependencies:**
    Install all the required project dependencies using npm.
    ```bash
    npm install
    ```

## Environment Configuration

The application requires environment variables to connect to its backend services. These variables are managed in a `.env` file at the root of the project.

1.  **Create the `.env` file:**
    Create a new file named `.env` in the project's root directory.

2.  **Add Configuration Variables:**
    Copy the following content into your `.env` file. These URLs point to the default local addresses for the external backend services.

    ```env
    # URL for the main backend API Gateway
    NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

    # WebSocket URL for the real-time simulation engine
    NEXT_PUBLIC_SIMULATION_WS_URL=ws://localhost:8081
    ```

    > **Important:** The `NEXT_PUBLIC_` prefix is a Next.js convention. It is required to expose these variables to the browser-side code.

## Running the Development Server

Once the dependencies are installed and the environment is configured, you can start the local development server.

```bash
npm run dev
```

The application will start, and you can access it in your web browser at **`http://localhost:9002`**. The server supports hot-reloading, so any changes you make to the code will be reflected in the browser automatically.
