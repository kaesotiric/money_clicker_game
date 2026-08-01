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
# Phase 2 Implementation Notes
---
# Accessing the REPL
- The PGlite REPL is on the top left of the screen during account log in/creation and is near the bottom of the page after.
- Select Show/Hide REPL to open it

# Account and login
- Enter a username and password
- Select **Create Account** to make a new account
- Select **Log In** to load an existing account
- The player’s buy power, click amount, upgrades and buildings are loaded from the database
- Passwords are nto stored as plain text, salt is used for each pass and are hashed using PBKDF2 with SHA-256
- During login, the entered password is hashed again and compared with the saved hash

# Buildings and persistence
- Buildings are special upgrades that automatically produce buy power after being purchased
- Each building has a level, production amount, cost and interval speed
- The auto-clicker uses a timer to add buy power at the building’s set interval
- Purchasing the building the first time will start the autoclicker and will go on forever till user is logged out
- Building levels, costs, production and interval speeds are saved in the database
- When a player logs in, their saved buildings are loaded and purchased auto clickers restart
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
