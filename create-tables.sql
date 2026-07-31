-- ACCOUNT
CREATE TABLE IF NOT EXISTS account
(
    username varchar(255) PRIMARY KEY,
    password varchar(255) NOT NULL
    );

-- PLAYER
CREATE TABLE IF NOT EXISTS player
(
    id serial PRIMARY KEY,
    playername varchar(255) NOT NULL,
    buypower integer NOT NULL DEFAULT 0,
    curr_click integer NOT NULL DEFAULT 1,
    account varchar(255) NOT NULL UNIQUE,

    FOREIGN KEY (account)
    REFERENCES account(username)
    ON DELETE CASCADE
    );

-- UPGRADE CATALOG
CREATE TABLE IF NOT EXISTS upgrade_catalog
(
    name varchar(255) PRIMARY KEY,
    upgrade_kind varchar(20) NOT NULL,
    base_buypower_cost integer NOT NULL,
    base_production integer NOT NULL,
    base_interval_speed integer
    );

-- UPGRADE INVENTORY
CREATE TABLE IF NOT EXISTS upgrade_inventory
(
    id serial PRIMARY KEY,
    player_id integer NOT NULL,
    upgrade_name varchar(255) NOT NULL,
    upgrade_level integer NOT NULL DEFAULT 0,
    upgrade_production integer NOT NULL,
    buypower_cost integer NOT NULL,

    FOREIGN KEY (player_id)
    REFERENCES player(id)
    ON DELETE CASCADE,

    FOREIGN KEY (upgrade_name)
    REFERENCES upgrade_catalog(name),

    UNIQUE (player_id, upgrade_name)
    );

-- BUILDINGS
CREATE TABLE IF NOT EXISTS buildings
(
    upgrade_id integer PRIMARY KEY,
    interval_speed integer NOT NULL,

    FOREIGN KEY (upgrade_id)
    REFERENCES upgrade_inventory(id)
    ON DELETE CASCADE
    );

INSERT INTO upgrade_catalog
(
    name,
    upgrade_kind,
    base_buypower_cost,
    base_production,
    base_interval_speed
)
VALUES
    ('Financial Advisor', 'UPGRADE', 50, 20, NULL),
    ('Employer',          'UPGRADE', 100, 20, NULL),
    ('Royal Mint',        'BUILDING', 500, 2, 1000),
    ('Banker',            'BUILDING', 1000, 10, 5000)
    ON CONFLICT (name) DO NOTHING;