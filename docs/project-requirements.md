# Project Requirements

This document defines the intended product scope for Matrix Life OS.

It is a requirements document, not an implementation guide. It does not prescribe frameworks, storage libraries, file structure, or code organization.

## 1. Product Positioning

Matrix Life OS is a local-first personal operating system for organizing daily action, long-term direction, and self-review.

It is not a general notes app, team project manager, calendar replacement, or cloud productivity suite. Its job is to help one person decide what matters, act on it during the week, and preserve meaningful evidence of progress.

## 2. Target User

The target user is an individual who wants a lightweight but opinionated system for:

- Capturing loose thoughts and tasks.
- Turning selected inputs into action.
- Managing weekly execution.
- Keeping goals visible.
- Reflecting on progress.
- Preserving meaningful outcomes locally.

The product should serve repeated personal use, not one-off planning sessions.

## 3. Core Problem

Personal productivity tools often fail because they either collect too much, organize too little, or preserve everything with no judgment.

Matrix Life OS should solve this by separating:

- Capture: get thoughts out of the user's head.
- Support: keep principles, context, and optional personal signals nearby.
- Execution: decide what will actually be done.
- Review: preserve reflections and meaningful completed outcomes.

The product should help users reduce mental clutter without becoming another place to maintain indefinitely.

## 4. Product Principles

### Local First

User data should primarily live on the user's own device.

The product should not require an account, cloud sync, or a remote service for core use.

### Small Surface Area

The product should remain understandable as a three-area system:

- Action
- Review
- System

Features that require deep navigation or broad configuration should be treated skeptically.

### Process Is Temporary, Evidence Is Valuable

The product should not preserve every transient action forever by default.

Long-term storage should emphasize meaningful artifacts:

- Reflections.
- Completed goals or equivalent milestones.
- User-defined principles or self-knowledge.

### Opinionated Flow

The product should encourage a one-way movement from capture to support, execution, and review.

It should avoid becoming a free-form database where every item can mean anything.

### Honest Capability

The product must not advertise a capability unless the user can actually use it.

If a feature is incomplete, experimental, or unavailable, user-facing language should say so or omit it.

## 5. Required Product Areas

### Action Area

The Action area should help the user move from input to execution.

It should include:

- A fast place to capture tasks, ideas, and loose inputs.
- A weekly task view.
- A way to schedule or move work across days.
- A goal or OKR-style area for connecting larger objectives to executable work.
- Supporting context such as principles or calendar-like notes.

The Action area should make today's work easy to identify.

### Review Area

The Review area should help the user preserve learning and meaningful progress.

It should include:

- A daily reflection entry flow.
- A searchable or browsable reflection history.
- A place to review completed objectives or comparable milestones.
- A way to represent ability growth or skill focus, if this remains part of the product direction.

The Review area should make accumulated progress visible without turning every completed task into permanent clutter.

### System Area

The System area should contain low-frequency controls and maintenance surfaces.

It should include:

- Module or feature visibility controls, where applicable.
- Data health or status information.
- Version/update information.
- Product/manual/help information.

The System area should not be the primary place where daily work happens.

## 6. Data And Privacy Requirements

Core product use should work without network access, except for optional update checks or explicitly remote features.

The user should be able to understand:

- Whether their data is local.
- Where their primary data is stored at a human level.
- What data is included in persistence.
- What data is excluded from long-term storage, if any.

The product should avoid silent data loss. If data cannot be saved, the user should receive a clear warning.

## 7. Backup And Recovery Requirements

Backup is a product-level safety requirement, but it must be honest.

If the product offers manual export:

- Exported data must be complete for the stated backup type.
- The export format should be understandable and portable.
- The user should know whether the export is a full backup or a partial/high-value archive.

If the product offers import:

- Import behavior must clearly state whether it merges or replaces existing data.
- Import should not leave the app in a mixed or ambiguous state without telling the user.
- Failed import should not destroy existing data.

If manual backup is not available:

- The product must not instruct users to use an in-app backup workflow.
- Any storage warning must avoid implying unavailable export or cleanup actions.

Automatic local backup or recovery files may exist, but they are not a substitute for a user-understandable manual backup workflow unless that is explicitly documented.

## 8. Module Scope

The product may support optional modules, but optionality should not weaken the core flow.

Core modules should be available without configuration.

Optional modules may include:

- Habits.
- Mood tracking.
- Time blocks.
- Inspiration storage.
- Entertainment or rest planning.

Optional modules should have a clear reason to exist in the capture, support, execution, or review flow. They should not become unrelated trackers.

## 9. Non-Goals

The following are not required for the core product:

- User accounts.
- Cloud sync.
- Collaboration.
- Team workspaces.
- Mobile companion apps.
- Plugin marketplace.
- Arbitrary database/page builder behavior.
- Full calendar replacement.
- Full habit coaching system.
- Analytics dashboards for every stored item.

These may be reconsidered later, but they should not be assumed in MVP scope.

## 10. MVP Acceptance Criteria

The MVP is acceptable when a user can:

- Capture an input quickly.
- Turn a captured input into a task, goal-related action, or supporting note.
- Plan and manage work across a week.
- Maintain at least one active objective or goal.
- Write and later review reflections.
- Preserve completed meaningful outcomes.
- Configure low-frequency system settings.
- Close and reopen the app without losing expected data.
- Understand where data is stored and what backup options do or do not exist.

The MVP is not acceptable if:

- It advertises backup/export/import that the user cannot reach.
- It loses core data across restart.
- It requires cloud access for normal use.
- It preserves every temporary item forever with no cleanup model.
- It has major user-facing copy that contradicts actual capability.

## 11. Future Scope

Future versions may consider:

- A complete manual backup and restore workflow.
- Better recovery diagnostics.
- Stronger import/export validation.
- Search across reflections and archives.
- More explicit weekly review rituals.
- Safer update checks for forks.
- Automated tests around persistence and migration behavior.

Future scope should be added only when it has a clear product reason and does not undermine the small-surface-area principle.

