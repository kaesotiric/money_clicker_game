-- Accounts
create table if not exists account
(
    username varchar(255) primary key,
    password varchar(255) not null
);

create table if not exists player(
    id serial primary key,
    name varchar(255) not null,
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
    upgrade_production double not null,
    buypower_cost double not null,
    player integer not null,
    foreign key (player) references player(id)
        on delete cascade
);

create table if not exists buildings(
    id integer primary key,
    interval_speed integer not null,
    foreign key(id) references upgrades(id)

);
insert into account(username, password)
values ('kate', 'testpass');

insert into player(name, buypower, curr_click, account)
values ('Kate', 1000, 20, 'kate');
-- insert into account(username, password) values('kate', 'testpass');
--     insert into player(buypower,curr_click, account) values(1000, 20, 'kate'));
-- insert into upgrades(upgrade_name, upgrade_level, upgrade_production, buypower_cost, player)
-- values ('Financial Advisor', 0, 15, 20, 1);
-- insert into buildings(id, interval_speed) values(34, 10);


