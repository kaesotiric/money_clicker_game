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
    buypower integer not null,
    curr_click integer not null,
    account varchar(255) not null unique,

    foreign key (account)
    references account(username)
    on delete cascade
    );

-- UPGRADE TYPE
-- Must be created before upgrades
create table if not exists upgrade_type
(
    name varchar(255) primary key,
    buypower_cost integer not null,
    upgrade_production integer not null
    );

-- UPGRADES
create table if not exists upgrades
(
    id serial primary key,
    upgrade_name varchar(255) not null,
    upgrade_level integer not null,
    upgrade_production integer not null,
    buypower_cost integer not null,
    player integer not null,

    foreign key (upgrade_name)
    references upgrade_type(name),

    foreign key (player)
    references player(id)
    on delete cascade,

    unique (player, upgrade_name)
    );

create unique index if not exists
    upgrades_player_upgrade_name_unique
    on upgrades(player, upgrade_name);

-- BUILDINGS

create table if not exists buildings
(
    id integer primary key,
    interval_speed integer not null,

    foreign key (id)
    references upgrades(id)
    on delete cascade
    );

-- TEST ACCOUNTS
insert into account(username, password)
values
    ('kate', 'hashed_password_for_kate'),
    ('alex', 'hashed_password_for_alex'),
    ('sam', 'hashed_password_for_sam')
    on conflict (username) do update
                                  set password = excluded.password;
-- Add one player for each account
insert into player(playername, buypower, curr_click, account)
values
    ('Kate', 1000, 20, 'kate'),
    ('Alex', 500, 10, 'alex'),
    ('Sam', 250, 5, 'sam')
    on conflict (account) do update
                                 set
                                     playername = excluded.playername,
                                 buypower = excluded.buypower,
                                 curr_click = excluded.curr_click;
insert into upgrade_type(
    name,
    buypower_cost,
    upgrade_production
)
values
    ('Financial Advisor', 50, 20),
    ('Employer', 100, 20)
    on conflict (name) do nothing;


insert into upgrades(
    upgrade_name,
    upgrade_level,
    upgrade_production,
    buypower_cost,
    player
)
select
    upgrade_data.upgrade_name,
    upgrade_data.upgrade_level,
    upgrade_data.upgrade_production,
    upgrade_data.buypower_cost,
    player.id
from (
         values
             ('kate', 'Financial Advisor', 2, 50, 50),
             ('kate', 'Employer',          1, 20, 100),

             ('alex', 'Financial Advisor', 3, 50, 50),
             ('alex', 'Employer',          2, 20, 100),

             ('sam',  'Financial Advisor', 1, 50, 50),
             ('sam',  'Employer',          0, 20, 100)
     ) as upgrade_data(
                       account_username,
                       upgrade_name,
                       upgrade_level,
                       upgrade_production,
                       buypower_cost
    )
         join player
              on player.account = upgrade_data.account_username

    on conflict (player, upgrade_name) do update
                                              set
                                                  upgrade_level = excluded.upgrade_level,
                                              upgrade_production = excluded.upgrade_production,
                                              buypower_cost = excluded.buypower_cost;