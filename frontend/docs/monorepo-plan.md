# Monorepo Migration Plan

This document outlines the plan for migrating the Architech frontend and backend applications to a monorepo.

## Folder Structure

The following folder structure is proposed for the monorepo:

```
/
├── apps
│   ├── frontend
│   └── backend
├── packages
│   └── shared
└── .github
    └── workflows
        └── ci.yml
```

-   `apps/frontend`: This directory will contain the frontend application.
-   `apps/backend`: This directory will contain the backend application.
-   `packages/shared`: This directory will contain any shared code, such as types, utils, and components.

## Moving the Backend Code

The backend code can be moved into the monorepo using the following steps:

1.  Create a new directory `apps/backend`.
2.  Clone the backend repository into a temporary directory.
3.  Move the backend code from the temporary directory to the `apps/backend` directory.
4.  Remove the `.git` directory from the `apps/backend` directory.
5.  Commit the changes to the monorepo.

To keep the Git history of the backend repository, you can use the `git subtree` command.

## Separating Dependencies and CI Responsibilities

Each application will have its own `package.json` file, which will define its dependencies. This will allow us to install the dependencies for each application separately.

The CI pipeline will be configured to only run the jobs for the application that has been changed. This can be done using the `paths` filter in the `on` trigger of the workflow.

For example, the frontend jobs will only run if there are changes in the `apps/frontend` directory, and the backend jobs will only run if there are changes in the `apps/backend` directory.

## General Advice

### Monorepo Tooling

To optimize the monorepo, it is recommended to use a tool like [Turborepo](https://turborepo.org/) or [Nx](https://nx.dev/). These tools provide features like caching, parallel execution, and dependency graph visualization, which can help to improve the performance and maintainability of the monorepo.

### Shared Code

To avoid code duplication, it is recommended to extract any shared code to a `packages/shared` directory. This can include things like types, utils, and components.

### Git Strategies

When merging the frontend and backend repositories into a monorepo, it is important to have a clear Git strategy. It is recommended to use a feature branch workflow, where each new feature is developed in a separate branch.

When merging branches, it is recommended to use squash and merge to keep the Git history clean.

### CI Speed

As the monorepo grows, the CI speed may become a concern. To maintain CI speed, it is recommended to use a tool like Turborepo or Nx to cache the results of previous builds.

It is also recommended to use parallel execution to run multiple jobs at the same time.
