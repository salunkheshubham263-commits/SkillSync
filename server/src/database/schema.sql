CREATE TABLE users (
    user_id serial PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    age INT NOT NULL,
    password TEXT NOT NULL,
    bio TEXT,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE
);

SELECT * FROM users;

-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- DROP TABLE users;

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL REFERENCES users(user_id),

    refresh_token_hash TEXT NOT NULL,

    ip_address VARCHAR(45),

    user_agent TEXT,

    is_revoked BOOLEAN DEFAULT FALSE,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from sessions;

-- TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;

CREATE TABLE otps (
    email VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    otpHash TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from otps;

-- TRUNCATE TABLE otps RESTART IDENTITY CASCADE;