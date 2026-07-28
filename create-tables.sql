
-- Accounts
create table if not exists account
(
    username varchar(255) primary key,
    password varchar(255) not null
);

create table if not exists player(
    id serial primary key,
    playername varchar(255) not null,
    buypower integer not null,
    curr_click integer not null,
    account varchar(255) not null unique,
    foreign key(account) references account(username)
        on delete cascade

);
create table if not exists upgrades(
    id serial primary key,
    upgrade_name varchar(255) not null,
    upgrade_level integer not null,
    upgrade_production integer not null,
    buypower_cost integer not null,
    player integer not null,
    foreign key (player) references player(id)
        on delete cascade
);

create table if not exists buildings(
    id integer primary key,
    interval_speed integer not null,
    foreign key(id) references upgrades(id)

);

-- Add test accounts
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

