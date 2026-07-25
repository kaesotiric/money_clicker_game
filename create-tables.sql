-- Accounts
create table if not exist account
(
    username varchar(255) not null unique,
    password varchar(255) not null
);


create table Player
(
    Account not null unique,
    currClick  varchar(255) not null,
    buyPower varchar(255) not null,
    foreign key (Account) references account (username)
        on delete cascade
)