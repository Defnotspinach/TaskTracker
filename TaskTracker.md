# Frontend Requirements

## Authentication

### Sign Up Page

The registration page should contain the following fields:

- Name
- Email
- Password

Requirements:

- Validate all required fields.
- Validate email format.
- Enforce a minimum password length.
- Display clear validation messages.
- Redirect the user to the Sign In page (or automatically log them in) after successful registration.

---

### Sign In Page

The login page should contain:

- Email
- Password

Requirements:

- Validate required fields.
- Display an error message for invalid credentials.
- Redirect authenticated users to the Dashboard or Task page after successful login.

---

## Authentication & Session

Authentication should use JSON Web Tokens (JWT).

Requirements:

- Store the JWT after a successful login.
- Persist the user's session across page refreshes.
- Automatically attach the JWT to every protected API request using Axios interceptors.
- Restore the authenticated user when the application reloads.
- Clear the JWT and user state when logging out.
- Redirect the user to the Sign In page after logout.

---

## Protected Routes

The following pages must only be accessible to authenticated users:

- Dashboard
- Tasks
- Categories
- Profile
- Settings

If a visitor is not signed in:

- Redirect them to the Sign In page.
- Prevent access to protected routes.
- Do not render protected content before authentication is verified.

---

# Task Management

## Task List

Display only the tasks created by the currently logged-in user.

Each task should display:

- Title
- Status
- Category
- Due Date

The task list should support:

- Responsive layout
- Empty state
- Loading state
- Error state

---

## Search

Allow users to search tasks by:

- Task Title

Requirements:

- Search updates the list as the user types.
- Search should be case-insensitive.

---

## Filters

Allow users to filter tasks by:

- Status
- Category

Users should be able to combine multiple filters.

Example:

- Status = In Progress
- Category = Work

---

## Create Task

Provide a form for creating new tasks.

Fields:

- Title
- Description
- Category
- Status
- Priority
- Due Date

Requirements:

- Validate required fields.
- Show loading state while saving.
- Display success or error feedback.
- Automatically refresh the task list after creation.

---

## Edit Task

Users should be able to edit any task they own.

Requirements:

- Pre-fill the form with existing data.
- Save changes without refreshing the page.
- Display success or error feedback.

---

## Delete Task

Users should be able to delete their own tasks.

Requirements:

- Display a confirmation dialog before deletion.
- Cancel should leave the task unchanged.
- Confirm should permanently delete the task.
- Refresh the task list after successful deletion.

Example confirmation:

> Are you sure you want to delete this task? This action cannot be undone.

---

# Category Management

Provide a simple category management page.

Users should be able to:

- View all categories
- Create a new category
- Rename an existing category
- Delete a category

Requirements:

- Categories belong only to the logged-in user.
- Prevent duplicate category names for the same user.
- Show loading and error states.

---

# Loading States

The application should provide loading indicators whenever data is being fetched or submitted.

Examples:

- Loading tasks...
- Creating task...
- Updating task...
- Loading categories...
- Signing in...

Avoid displaying blank screens while waiting for data.

---

# Error States

Display friendly and informative error messages when something goes wrong.

Examples:

- Failed to load tasks.
- Unable to save task.
- Invalid email or password.
- Network error. Please try again.

Provide retry actions where appropriate.

---

# User Experience

The interface should prioritize simplicity and ease of use.

Requirements:

- Responsive on desktop, tablet, and mobile.
- Clean and consistent layout.
- Easy-to-read typography.
- Accessible buttons and form controls.
- Clear navigation.
- Minimal clicks to complete common actions.
- Fast and intuitive interactions.
- Consistent spacing, colors, and component styling using Tailwind CSS.

The overall experience should feel modern, lightweight, and easy to understand for first-time users.