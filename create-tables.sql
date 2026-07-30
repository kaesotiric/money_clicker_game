
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


-- UPGRADES
create table if not exists upgrades
(
    id serial primary key,
    upgrade_name varchar(255) not null,
    upgrade_level integer not null default 0,
    upgrade_production integer not null,
    buypower_cost integer not null,
    player integer not null,


    foreign key (player)
    references player(id)
    on delete cascade,

    -- A player cannot have two upgrades of the same type
    unique (player, upgrade_name));


-- BUILDINGS
create table if not exists buildings
(
    -- Reuses the ID of the corresponding Upgrade
    id integer primary key,
    interval_speed integer not null,

    foreign key (id)
    references upgrades(id)
    on delete cascade
    );


-- kate  hashed_password_for_kate