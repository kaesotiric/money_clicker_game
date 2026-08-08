
create table if not exists account
(
    username varchar(255) primary key,
    password varchar(255) not null
    );


-- PLAYER
create table if not exists player
(
    id serial primary key,
    playername varchar(255) not null,
    buypower integer not null default 0,
    curr_click integer not null default 1,
    account varchar(255) not null unique,

    foreign key (account)
    references account(username)
    on delete cascade
    );


-- UPGRADE CATALOG
-- Stores the hardcoded starting values for every upgrade
create table if not exists upgrade_catalog
(
    name varchar(255) primary key,
    upgrade_kind varchar(20) not null,
    base_buypower_cost integer not null,
    base_production integer not null,
    base_interval_speed integer
    );


-- UPGRADE INVENTORY
-- Stores each player's actual upgrades
create table if not exists upgrade_inventory
(
    id serial primary key,
    player_id integer not null,
    upgrade_name varchar(255) not null,
    upgrade_level integer not null default 0,
    upgrade_production integer not null,
    buypower_cost integer not null,

    foreign key (player_id)
    references player(id)
    on delete cascade,

    foreign key (upgrade_name)
    references upgrade_catalog(name),

    unique (player_id, upgrade_name)
    );


-- BUILDINGS
-- Stores extra information for inventory items that are buildings
create table if not exists buildings
(
    upgrade_id integer primary key,
    interval_speed integer not null,

    foreign key (upgrade_id)
    references upgrade_inventory(id)
    on delete cascade
    );

insert into upgrade_catalog
(
    name,
    upgrade_kind,
    base_buypower_cost,
    base_production,
    base_interval_speed
)
values
-- Starting upgrades
('Financial Advisor', 'UPGRADE', 50, 20, null),
('Employer', 'UPGRADE', 100, 20, null),
('Royal Mint', 'BUILDING', 500, 2, 1000),
('Banker', 'BUILDING', 1000, 10, 5000),

-- Phase 3 upgrade types
('Freelance Contract', 'UPGRADE', 250, 50, null),
('Side Business', 'UPGRADE', 500, 100, null),
('Investment Portfolio', 'UPGRADE', 1500, 300, null),
('Property Empire', 'UPGRADE', 5000, 1000, null),
('Tech Startup', 'UPGRADE', 15000, 3000, null),

-- Phase 3 building types
('ATM Network', 'BUILDING', 2500, 30, 4000),
('Investment Firm', 'BUILDING', 7500, 60, 3000),
('Tech Company', 'BUILDING', 20000, 150, 2500),
('Bank Headquarters', 'BUILDING', 50000, 400, 2000),
('Global Corporation', 'BUILDING', 100000, 1000, 1000)

on conflict (name) do nothing;



