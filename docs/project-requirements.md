# Project Requirements

This document describes what Matrix Life OS should do. It does not describe code structure or implementation details.

## Product Summary

Matrix Life OS is a local-first personal management tool for:

- Tasks.
- Capture notes.
- Goal notes.
- Reflections.

It is for one person managing their own records. It is not a team project manager, cloud productivity suite, or calendar replacement.

## Core Records

### Task

The product must let the user:

- Create a task.
- View tasks on a weekly task board that shows all seven days of one week in the same view.
- Open the weekly task board on the current week by default.
- Switch the weekly task board to previous or next weeks.
- Edit a task.
- Delete a task.
- Mark a task complete.
- Mark a completed task incomplete.
- Keep completed tasks visible on the weekly task board with a distinct completed state.
- Create a task under a specific day on the weekly task board.
- Move a task between days.
- Reorder tasks within the same day.

Every task must belong to a day. Content without a day should be recorded as a capture note instead of a task.

### Capture Note

The product must let the user:

- Create a capture note.
- View capture notes.
- Edit a capture note.
- Delete a capture note.

Capture notes do not need to convert into tasks, goals, or other records.

### Goal Note

The product must let the user:

- Create a goal note.
- View goal notes.
- Edit a goal note.
- Delete a goal note.

Goal notes do not need key results, task links, progress scoring, or completion status.

### Reflection

The product must let the user:

- Create a reflection.
- View reflections.
- View a single reflection.
- Edit a reflection.
- Delete a reflection.
- Assign a reflection to a day.

## Record Relationships

The product does not need links between the four core record types.

- Capture notes do not need to convert into tasks.
- Tasks do not need to link to goal notes.
- Goal notes do not need to contain tasks or key results.
- Reflections do not need to link to tasks or goal notes.

## Product Areas

### Action Area

The Action area must support:

- Capture notes.
- A weekly task board.
- A goal note area.

The task view must make today's tasks easy to identify.

### Review Area

The Review area must support:

- Creating reflections.
- Viewing past reflections.

### System Area

The System area must support:

- Module or feature visibility controls.
- Data status information that a user can understand.
- Version information.
- Short help information.

## Data Requirements

The product must work without an account, cloud sync, or network access.

Core records must still exist after the app is closed and reopened.

The user must be able to understand:

- Whether data is stored locally.
- Where data is stored at a human level.
- What data is saved.

If core records cannot be saved, the product must warn the user.

## Backup And Recovery

Manual backup and recovery are not requirements at this stage.

The product must not advertise backup, export, import, or recovery unless those features are added to this document later.

## Out Of Scope

The following are not requirements at this stage:

- User accounts.
- Cloud sync.
- Collaboration.
- Team workspaces.
- Plugin marketplace.
- Full calendar replacement.
- Full habit coaching system.
- Analytics dashboards.
- Manual backup and restore.

Other record types or modules should not be treated as requirements unless they are added to this document later.

## Acceptance Criteria

The product is acceptable when the user can:

- Manage tasks with the task operations listed above.
- Manage capture notes with the capture note operations listed above.
- Manage goal notes with the goal note operations listed above.
- Manage reflections with the reflection operations listed above.
- Hide or show features through System Area controls.
- See understandable data status information.
- See version information.
- Read short help information.
- Close and reopen the app without losing core records.

The product is not acceptable if:

- It loses core records across restart.
- It requires an account, cloud sync, or network access for core use.
- It advertises backup, export, import, or recovery before those features are added to this document.
