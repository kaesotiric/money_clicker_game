---
title: Domain Model for my Money Clicker!
author: Kate Nabo (nabok@myumanitoba.ca)
date: Summer 2026
---

# Domain Model

```mermaid
classDiagram

class Account {
    - ~String username
    - String password
    - Player player
    + buildAccount()
    +createAccount(username, password) Promise
    +login(username, password) Promise
    +getPlayer() Player
    +getUsername() string
}

note for Account "Class Invariants:
<ul>
<li>username != null</li>
<li>username is unique</li>
<li>password != null</li>
<li>an Account may have zero or one Player</li>
</ul>"


class Player {
    - ~integer id
    - String playerName
    - int buyPower
    - int currClick
    - ~Account account
    - List~Upgrade~ upgrades
    + click() void
    + calculateCurrClick(upgrades) int
    + purchaseUpgrade(Upgrade) void
    + updateCurrClick(amount) void
}

note for Player "Class Invariants:
<ul>
<li>id is unique</li>
<li>playerName != null</li>
<li>buyPower is not null</li>
<li>currClick is not null</li>
<li>account != null</li>
<li>account is unique</li>
<li>upgrades != null</li>
<li>for each item in upgrades, item != null</li>
</ul>"

    class UpgradeType {
        <<enumeration>>
        FinancialAdvisor
        Employer
        FreelanceContract
        SideBusiness
        InvestmentPortfolio
        PropertyEmpire
        TechStartup
        RoyalMint
        Banker
        ATMNetwork
        InvestmentFirm
        TechCompany
        BankHeadquarters
        GlobalCorporation
    }
    
class Upgrade {
    - ~integer id
    - UpgradeType upgradeName
    - int upgradeLevel
    - int upgradeProduction
    - int buyPowerCost
    - Player player
    + increaseLevel() void
    + calculateProduction(level) int
    + calculateCost(level) int
}

note for Upgrade "Class Invariants:
<ul>
<li>id is unique</li>
<li>upgradeName != null</li>
<li>upgradeLevel is not null</li>
<li>upgradeProduction is not null</li>
<li>buyPowerCost is not null</li>
<li>player != null</li>
<li>the combination of player and upgradeName is unique</li>
</ul>"


class Building {
    - ~integer id
    - int intervalSpeed
    + startAutoClicker(addBuyPower) void
    - autoClick(addBuyPower) void
    + getIntervalSpeed() number
}

note for Building "Class Invariants:
<ul>
<li>id is unique</li>
<li>id must reference an existing Upgrade id</li>
<li>intervalSpeed is not null</li>
<li>every Building belongs to one existing Upgrade</li>
<li>an Upgrade may have zero or one Building record</li>
</ul>"


Account "1" o--* "1" Player : owns
Player "1" o--* "*" Upgrade : owns
Upgrade "1" o--* "1" Building : may have building data

Upgrade <|-- Building : inherits
Upgrade --> UpgradeType : uses
Building --> UpgradeType : uses
```



