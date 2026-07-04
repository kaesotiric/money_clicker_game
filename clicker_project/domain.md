---
title: Domain Model for my Money Clicker!
author: Kate Nabo (nabok@myumanitoba.ca)
date: Winter 2026
---
# Domain Model

```mermaid

classDiagram

class Player {
    - String name
    - double currClick
    - double clickBuyPower
    - List~Upgrade~ upgrades
    + click() void
    + calculateCurrClick(upgrades) double
    + purchaseUpgrade(Upgrade) void
    + updateCurrClick(amount) void
    }
    
    note for Player "Class Invariants:
    <ul>
    <li>name!=null</li>
    <li>currClick>=1</li>
    <li>clickBuyPower>=0</li>
    <li>upgrades!=null</li>
    <li>for each item in upgrades != null</li>
    </ul>"

     class Upgrade {
         <<abstract>>
         - String name
         - int level
         - double production
         - double buyPowerCost
         + increaseLevel() void
         + calculateProduction(level)* double
         + calculateCost(level)* double

     }
    note for Upgrade "Class Invariants:
    <ul>
    <li>name!=null</li>
    <li>level>=0</li>
    <li>production>0</li>
    <li>buyPowerCost>0</li>
    </ul>"
    
     note for FinancialAdvisor  "will extend/inherit from the Upgrade class and overrides all abstract methods"
     
     class FinancialAdvisor {
         + calculateProduction(level) double
         + calculateCost(level) double
         
     }
     
     note for Employer "will extend/inherit from the Upgrade class and overrides all abstract methods"
     class Employer {
        + calculateProduction(level) double
        + calculateCost(level) double
        
     }
    Player --* Upgrade
    Upgrade <|-- FinancialAdvisor
    Upgrade <|-- Employer
    
```
