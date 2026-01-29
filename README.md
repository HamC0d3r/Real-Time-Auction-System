# Graduation Project Documentation

This repository contains the source code and documentation for our graduation project. All team members must adhere to the following structure and workflow protocols to ensure code stability and avoid file conflicts.

## 📂 Directory Structure

The project is organized to separate concerns and facilitate testing:

* **`design/`**: Contains reference design materials.
    * `assets/`: Exported static assets (SVG, PNG) used in the code.
    * `ui-links.md`: A text file containing links to the design prototypes (Figma/Adobe XD). **Do not upload raw design binary files here.**
* **`docs/`**: Technical documentation.
    * `architecture/`: System diagrams (ERD, Class Diagrams, Architecture).
    * `setup.md`: Guide for setting up the development environment locally.
* **`src/`**: The actual source code of the application.
    * `Backend/`: API and server-side code.
    * `Frontend/`: UI code (Web/Mobile).
* **`tests/`**: Unit and Integration tests. These are kept separate from `src` to streamline the deployment process.

---

## ⚙️ Workflow Protocol

We follow a strict **Branching Strategy** to protect the main codebase.

### Core Rules:
1.  **`main` Branch:** Contains only stable, production-ready code. **Direct pushes to `main` are strictly forbidden.**
2.  **Feature Branches:** Every task must be done on a separate branch named `feature/` or `fix/`.
    * *Example:* `feature/login-page` or `fix/user-auth-error`.

### Daily Routine:
1.  Update your local repo: `git pull origin main`
2.  Create a new branch: `git checkout -b feature/your-task-name`
3.  Commit and push: `git push origin feature/your-task-name`
4.  Open a **Pull Request (PR)** on GitHub to merge into `main`.
5.  **Code Review:** Another team member must review and approve the PR before merging.

---

## 📋 Task Management (Issues & Projects)

No code should be written without a corresponding **Issue**.

1.  **Project Board:** Go to the **Projects** tab at the top of the repository to view the Kanban board.
    * **Todo:** Pending tasks.
    * **In Progress:** Tasks currently being worked on.
    * **Done:** Completed and merged tasks.
2.  **Issues:** Go to the **Issues** tab to find task details.
    * Find the Issue assigned to you in the **Assignees** field.
    * Reference the Issue ID (e.g., `#12`) in your commit messages or PRs (e.g., `Completed login screen closes #12`).

---

## 🚀 Getting Started

To install dependencies and run the project for the first time, you must read and follow the setup guide:
[👉 docs/setup.md](./docs/setup.md)