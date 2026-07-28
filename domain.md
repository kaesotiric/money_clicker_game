---
title: Domain Model for my Money Clicker!
author: Kate Nabo (nabok@myumanitoba.ca)
date: Summer 2026
---
# Domain Model

```mermaid

classDiagram

class Player {
    - string name
    - double currClick
    - double clickBuyPower
    - List~Upgrade~ upgrades 
    - ~Account account
    + click() void
    + calculateCurrClick(upgrades) double
    + purchaseUpgrade(Upgrade) void
    + updateCurrClick(amount) void
    }
    note for Player "Class Invariants:
    <ul>
    <li>currClick>=1</li>
    <li>clickBuyPower>=0</li>
    <li>upgrades!=null</li>
    <li>for each item in upgrades != null</li>
    </ul>"

    class Account{
        - ~String username
        - String password
        - ~Player player
        + buildAccount()
        
    }
    note for Account "Class Invariants:
    <ul>
    <li>username is not empty</li>
    <li>password is not empty</li>
    </ul>"
  
     class Upgrade {
         -~id integer
         - Player player
         - UpgradeType name
         - int level
         - double production
         - double buyPowerCost
         + increaseLevel() void
         + calculateProduction(level) double
         + calculateCost(level) double

     }
     class UpgradeType {
        <<Enumeration>>
         FinancialAdvisor
         Employer
         RoyalMint
         Banker
 }
    note for Upgrade "Class Invariants:
    <ul>
    <li>name!=null</li>
    <li>level>=0</li>
    <li>production>0</li>
    <li>buyPowerCost>0</li>
    </ul>"
    
    
    Player "1" o--* "*" Upgrade
    Account "1" o--* "1" Player : account owns player
%%    Player --> UpgradeType
    Upgrade --* UpgradeType
%%    Upgrade "1" o--* "1" Building
    
    
    class Building{
        - ~id integer
        - intervalSpeed double
        + calculateProduction(level) * double 
        + calculateCost(level) * double
        + autoClick() void
 }
    Upgrade<|-- Building : inherits
%%    Building--|> Upgrade
    note for Building "Class Invariants:
    <ul>
    <li>intervalSpeed>=1</li>
    </ul>"
````


## Changes since phase 1
* Upgrades class becomes the superclass which is extended by the Buildings class
* Deleted the Employer and FinancialAdvisor classes as they will just be both instances of Upgrades. 
* All types of upgrades/buildings are in the enum called UpgradeType
* username field in Account must be unique so constraints are added
* id field in Upgrades must be unique so constraints are added
* id field in Buildings must be unique so constraints are added


