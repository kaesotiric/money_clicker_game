---
title: Player Clicker
author: Kate Nabo (nabok@myumanitoba.ca)
date: Summer 2026
---
# Overview
- This is a money clicker game built for a second year course COMP-2452 at University of Manitoba

# Phase 3 Implementation Notes
---
- Implemented the RoboBuy feature, it selects the upgrade based on the data it was trained and
waits until it has enough to purchase that upgrade or building. Next transitions to the
next state based on probability
- RoboBuy is automatically toggled to off when user refreshes
- Made changes to `money-view` and `create-upgrade-view` and added all 10 new buttons to purchase them
- Changes to `money-controller` to toggle the RoboBuy
- You can find the training file in `src/training` and the RoboBuy class in `src/model`

# Markov Chain
To generate the Markov model, You can run the following on the command line or here:

```bash
npm install -D tsx
npm run train
```
It reads from: `src/training/training.csv`
and generates: `src/training/model.json`

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
