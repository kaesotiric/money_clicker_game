---
title: Player Clicker
author: Kate Nabo (nabok@myumanitoba.ca)
date: Summer 2026
---

# Overview
---
A money clicker game inspired by the cookie clicker. Click on a button that says `Click Me!` 
and `Money` should increment by 1. Viewing available upgrades could be done by clicking the button `Upgrade Store`
From there, choose from two upgrades to purchase, `Financial Advisor` and `Employer`.
Each upgrades cost more as the level increases, but so does the amount of money you make everytime you click! 
---

# Phase 3 Implementation Notes
---
- You can find my UI Assessment in `ui-assessment.md`.
- Catalog in my ddl has been added 10 items. 5 new buildings and 5 upgrades.
- No major changes to domain model or flow chart, but I made changes to the enum class to account for the 10 newly added items
---

# Running
---
This project is a Node.js project using Vite. You can run it on the command
line using `npx`:

```bash
npm install
npx vite
```
And then open your web browser and go to the address printed out by Vite.
---

# Testing
---
The test harness is implemented using Vitest. You can run it on the command line using
```bash
npx vitest
```
To check the test coverage, simply run the command 

```bash
npx vitest run --coverage
```
---


# Domain Model, Flow diagrams and DDL statements
---
* You can find my domain model in `domain.md`.
* You can find my flow diagrams in `flows.md`.
* You can find my DDL in `create-tables.sql`.
---
