--
-- ACCOUNT
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
    ('Financial Advisor', 'UPGRADE', 50, 20, null),
    ('Employer',          'UPGRADE', 100, 20, null),
    ('Royal Mint',        'BUILDING', 500, 50, 10),
    ('Banker',            'BUILDING', 1000, 100, 5)
    on conflict (name) do nothing;

-- -- ACCOUNT
-- create table if not exists account
-- (
--     username varchar(255) primary key,
--     password varchar(255) not null
--
-- );
-- -- PLAYER
-- create table if not exists player
-- (
--     id serial primary key,
--     playername varchar(255) not null,
--     buypower integer not null default 0,
--     curr_click integer not null default 1,
--     account varchar(255) not null unique,
--
--     foreign key (account)
--     references account(username)
--     on delete cascade
--     );
--
--
-- -- UPGRADES
-- create table if not exists upgrades
-- (
--     id serial primary key,
--     upgrade_name varchar(255) not null,
--     upgrade_level integer not null default 0,
--     upgrade_production integer not null,
--     buypower_cost integer not null,
--     player integer not null,
--
--
--     foreign key (player)
--     references player(id)
--     on delete cascade,
--
--     -- A player cannot have two upgrades of the same type
--     unique (player, upgrade_name));
--
--
-- -- BUILDINGS
-- create table if not exists buildings
-- (
--     -- Reuses the ID of the corresponding Upgrade
--     id integer primary key,
--     interval_speed integer not null,
--
--     foreign key (id)
--     references upgrades(id)
--     on delete cascade
--     );


-- kate  hashed_password_for_kate


