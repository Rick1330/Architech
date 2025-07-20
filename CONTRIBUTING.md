# Contributing to Architech

We welcome contributions to Architech! Whether it's a bug report, a new feature, or an improvement to the documentation, your help is greatly appreciated. By contributing, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### 1. Reporting Bugs

If you find a bug, please open an issue on our GitHub repository. Before opening a new issue, please check if a similar issue already exists. When reporting a bug, include:

*   A clear and concise description of the bug.
*   Steps to reproduce the behavior.
*   Expected behavior.
*   Screenshots or error messages, if applicable.
*   Your operating system and browser version.

### 2. Suggesting Enhancements

We are always open to suggestions for new features or improvements. You can open an issue to propose an enhancement. Please include:

*   A clear and concise description of the proposed enhancement.
*   Why this enhancement would be valuable to Architech.
*   Any potential design considerations or alternatives.

### 3. Contributing Code

We follow a standard GitHub flow for contributions. Please follow these steps:

1.  **Fork the Repository:** Fork the `architech` repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/architech.git
    cd architech
    ```
3.  **Create a New Branch:** Create a new branch for your feature or bug fix. Use a descriptive name (e.g., `feature/add-ai-feedback`, `bugfix/fix-simulation-crash`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Set up Development Environment:** Follow the instructions in `docs/dev-environment-setup.md` to set up your local development environment.
5.  **Make Your Changes:** Implement your changes, ensuring they adhere to our coding standards and best practices.
6.  **Write Tests:** Write unit and integration tests for your changes. Ensure all existing tests pass.
7.  **Update Documentation:** If your changes affect any existing functionality or introduce new features, update the relevant documentation (e.g., `docs/feature-breakdown.md`, `docs/architecture-design.md`).
8.  **Commit Your Changes:** Write clear, concise commit messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification (e.g., `feat: add new component type`, `fix: resolve simulation bug`).
    ```bash
    git add .
    git commit -m 


"feat: your commit message"
    ```
9.  **Push to Your Fork:**
    ```bash
    git push origin feature/your-feature-name
    ```
10. **Create a Pull Request:** Open a pull request from your forked repository to the `main` branch of the official Architech repository. Provide a clear description of your changes and reference any related issues.

### 4. Contributing to Documentation

Improvements to documentation are highly valued. If you find a typo, an unclear explanation, or want to add more details, please open a pull request with your changes. Ensure your changes are clear, concise, and follow the existing documentation style.

## Code Style and Standards

*   **Frontend:** Adhere to [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) configurations.
*   **Backend (Python):** Adhere to [Black](https://github.com/psf/black) for code formatting and [Flake8](https://flake8.pycqa.org/en/latest/) for linting.
*   **Backend (Go):** Adhere to `go fmt` and `go vet` standards.
*   **Markdown:** Follow a consistent Markdown style, using clear headings, code blocks, and lists.

## Testing Guidelines

*   **Unit Tests:** Every new feature or bug fix should be accompanied by comprehensive unit tests.
*   **Integration Tests:** Critical integrations between services should have integration tests.
*   **End-to-End Tests:** For major features, consider adding end-to-end tests.
*   **Test Coverage:** Aim for high test coverage, but prioritize meaningful tests over simply increasing coverage percentage.

## Community Guidelines

*   **Be Respectful:** Treat all community members with respect and professionalism.
*   **Be Welcoming:** Help new contributors and foster an inclusive environment.
*   **Be Constructive:** Provide constructive feedback and engage in healthy discussions.

Thank you for contributing to Architech!

---

**Author:** Elshaday Mengesha

**Date:** 2025-07-17


