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
# Phase 1 Implementation Submission 2 Changes
---
- Below are the changes made according to the grader's feedback. 
- Used TS' set and get properties
- Updated code to not have multiple return statements
- Made methods that are only used by its class to be private using #
- 
---
# Changes
---
- Implemented a money clicker game as described above using the MVC Architecture 
- Each classes in View, Model, and Controller work together with the help of the listener to put together the game
- Implemented class invariants for the model classes
- Testing of model classes
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


# Domain Model and Flow diagrams
---
* You can find my domain model in `domain.md`.
* You can find my flow diagrams in `flows.md`.
---
