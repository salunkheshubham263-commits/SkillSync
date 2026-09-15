CREATE TABLE users (
    user_id serial PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    age INT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    complete_profile BOOLEAN DEFAULT FALSE
);

SELECT * FROM users;
SELECT * FROM users WHERE user_id != 1;
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

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id),
    profile_image VARCHAR(255),
    college VARCHAR(150) NOT NULL,
    courses VARCHAR(100) NOT NULL,
    courses_year SMALLINT,
    city VARCHAR(100),
    bio text,
    github_username VARCHAR(200),
    github_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from profiles;
-- TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;

CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_skills (
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from user_skills;

-- TRUNCATE TABLE user_skills RESTART IDENTITY CASCADE;

INSERT INTO skills (skill_name)
VALUES
('C'),
('C++'),
('C#'),
('Java'),
('Python'),
('JavaScript'),
('TypeScript'),
('PHP'),
('Go'),
('Rust'),
('Swift'),
('Kotlin'),
('Dart'),
('R'),
('MATLAB'),
('SQL'),
('HTML'),
('CSS'),
('SASS'),
('Bootstrap'),
('Tailwind CSS'),
('Material UI'),
('React'),
('Next.js'),
('Vue.js'),
('Angular'),
('Redux'),
('React Router'),
('Framer Motion'),
('Three.js'),
('Chart.js'),
('Vite'),
('Webpack'),
('Node.js'),
('Express.js'),
('NestJS'),
('Django'),
('Flask'),
('FastAPI'),
('Laravel'),
('Spring Boot'),
('ASP.NET'),
('GraphQL'),
('REST API'),
('Socket.IO'),
('Prisma'),
('JWT'),
('OAuth'),
('MongoDB'),
('MySQL'),
('PostgreSQL'),
('SQLite'),
('Redis'),
('Firebase'),
('Supabase'),
('Oracle Database'),
('SQL Server'),
('MariaDB'),
('Git'),
('GitHub'),
('GitLab'),
('Docker'),
('Kubernetes'),
('Linux'),
('AWS'),
('Azure'),
('Google Cloud'),
('Nginx'),
('CI/CD'),
('GitHub Actions'),
('Vercel'),
('Netlify'),
('Render'),
('DigitalOcean'),
('React Native'),
('Flutter'),
('Android Development'),
('iOS Development'),
('Figma'),
('Adobe XD'),
('Photoshop'),
('Illustrator'),
('Canva'),
('Blender'),
('Adobe Premiere Pro'),
('Adobe After Effects'),
('Wireframing'),
('Prototyping'),
('User Interface Design'),
('User Experience Design'),
('Responsive Design'),
('Graphic Design'),
('Machine Learning'),
('Deep Learning'),
('TensorFlow'),
('PyTorch'),
('Scikit-learn'),
('OpenCV'),
('Pandas'),
('NumPy'),
('Data Analysis'),
('Data Visualization'),
('Power BI'),
('Tableau'),
('Microsoft Excel'),
('Excel VBA'),
('Generative AI'),
('Prompt Engineering'),
('LangChain'),
('OpenAI API'),
('Hugging Face'),
('Computer Vision'),
('Natural Language Processing'),
('Ethical Hacking'),
('Penetration Testing'),
('Network Security'),
('OWASP'),
('Burp Suite'),
('Wireshark'),
('Kali Linux'),
('Metasploit'),
('Cryptography'),
('Jest'),
('Mocha'),
('Cypress'),
('Selenium'),
('Playwright'),
('JUnit'),
('Postman'),
('Agile'),
('Scrum'),
('Jira'),
('Notion'),
('Trello'),
('Microsoft Word'),
('Microsoft PowerPoint'),
('Google Docs'),
('Google Sheets'),
('SEO'),
('SEM'),
('Google Analytics'),
('Google Ads'),
('Meta Ads'),
('Content Writing'),
('Copywriting'),
('Technical Writing'),
('Email Marketing'),
('Social Media Marketing'),
('Digital Marketing'),
('Market Research'),
('Business Analysis'),
('Project Management'),
('Product Management'),
('Accounting'),
('Bookkeeping'),
('GST'),
('Tally'),
('Financial Analysis'),
('Recruitment'),
('Payroll'),
('Employee Relations'),
('Cisco Packet Tracer'),
('CCNA'),
('TCP/IP'),
('Arduino'),
('Raspberry Pi'),
('Embedded C'),
('ESP32'),
('IoT'),
('Blockchain'),
('Unity'),
('Unreal Engine'),
('DaVinci Resolve'),
('CapCut'),
('Video Editing'),
('Communication'),
('Leadership'),
('Teamwork'),
('Problem Solving'),
('Critical Thinking'),
('Time Management'),
('Public Speaking'),
('Adaptability'),
('Creativity'),
('Decision Making'),
('Conflict Resolution'),
('Negotiation'),
('Mentoring'),
('Research'),
('Presentation Skills'),
('Technical Documentation'),
('Open Source Contribution'),
('Code Review'),
('Debugging'),
('API Integration'),
('Microservices'),
('System Design'),
('Software Architecture');

select * from skills;

CREATE TABLE github_accounts (
    github_id BIGINT PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    github_username VARCHAR(100),
    profile_url TEXT,
    avatar_url TEXT,
    access_token TEXT,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM github_accounts;
-- TRUNCATE TABLE github_accounts RESTART IDENTITY CASCADE;

create table connections (
    connection_id serial primary key,
    sender_id int not null references users(user_id) on delete cascade,
    receiver_id int not null references users(user_id) on delete cascade,
    status varchar(20) not null default 'pending',
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    check (sender_id <> receiver_id),
    check (status in ('pending', 'accepted', 'rejected', 'blocked'))
);

-- 1. Remove existing duplicates
WITH ranked_connections AS (
    SELECT
        connection_id,
        ROW_NUMBER() OVER (
            PARTITION BY
                CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
                CASE WHEN sender_id > receiver_id THEN sender_id ELSE receiver_id END
            ORDER BY
                updated_at DESC,
                connection_id DESC
        ) AS row_num
    FROM connections
)
DELETE FROM connections
WHERE connection_id IN (
    SELECT connection_id
    FROM ranked_connections
    WHERE row_num > 1
);

CREATE UNIQUE INDEX unique_connection_pair
ON connections (
    (CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END),
    (CASE WHEN sender_id > receiver_id THEN sender_id ELSE receiver_id END)
);
SELECT * FROM connections;
DELETE FROM connections where connection_id = 6;
-- TRUNCATE TABLE connections RESTART IDENTITY CASCADE;

create table notifications (
    notification_id serial primary key,
    user_id int not null references users(user_id) on delete cascade,
    sender_id int not null references users(user_id) on delete cascade,
    connection_id int references connections(connection_id) on delete cascade,
    type varchar(20) not null,
    message text not null,
    is_read boolean default false,
    created_at timestamp default current_timestamp
);

select * from notifications;

-- TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;

CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('github', 'local')),
    github_repo_url TEXT,
    github_repo_id BIGINT,
    project_file VARCHAR(255),
    live_demo_url TEXT,
    category VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    cover_image VARCHAR(255),
    under_development BOOLEAN NOT NULL DEFAULT FALSE,
    looking_for_contributors BOOLEAN NOT NULL DEFAULT FALSE,
    contribution_type VARCHAR(20) CHECK (contribution_type IN ('paid', 'unpaid')),
    payment_type VARCHAR(20) CHECK (payment_type IN ('fixed', 'milestone')),
    fixed_task TEXT,
    fixed_payment_amount NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'in_development' CHECK (status IN ('in_development', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((source = 'github' AND github_repo_url IS NOT NULL) OR (source = 'local' AND project_file IS NOT NULL)),
    CHECK ((under_development = FALSE AND looking_for_contributors = FALSE) OR under_development = TRUE),
    CHECK ((looking_for_contributors = FALSE AND contribution_type IS NULL AND payment_type IS NULL) OR looking_for_contributors = TRUE),
    CHECK ((contribution_type = 'paid' AND payment_type IS NOT NULL) OR contribution_type = 'unpaid' OR contribution_type IS NULL),
    CHECK ((payment_type = 'fixed' AND fixed_task IS NOT NULL AND fixed_payment_amount IS NOT NULL AND fixed_payment_amount >= 0) OR payment_type = 'milestone' OR payment_type IS NULL),
    CHECK ((under_development = TRUE AND looking_for_contributors = TRUE) OR fixed_task IS NULL),
    CHECK ((under_development = TRUE AND looking_for_contributors = TRUE) OR fixed_payment_amount IS NULL)
);

select * from projects;

--TRUNCATE TABLE projects RESTART IDENTITY CASCADE;

CREATE TABLE technologies (
    technology_id SERIAL PRIMARY KEY,
    technology_name VARCHAR(100) UNIQUE NOT NULL
);

select * from technologies;

--TRUNCATE TABLE technologies RESTART IDENTITY CASCADE;

CREATE TABLE project_technologies (
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    technology_id INT NOT NULL REFERENCES technologies(technology_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, technology_id)
);

SELECT * FROM project_technologies;

--Truncate table project_technologies restart identity cascade;

CREATE TABLE project_milestones (
    milestone_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    task TEXT NOT NULL,
    payment_amount NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_progress', 'submitted', 'under_review', 'completed', 'disputed', 'cancelled')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'payment_pending', 'paid', 'disputed', 'refunded', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (payment_amount IS NULL OR payment_amount >= 0)
);

select * FROM project_milestones;

--Truncate table project_milestones restart identity cascade;

CREATE TABLE contribution_requests (
    contribution_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    owner_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    contributor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'completed', 'closed', 'disputed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (owner_id <> contributor_id)
);

select * FROM contribution_requests;

--Truncate table contribution_requests restart identity cascade;

CREATE TABLE project_contributors (
    project_contributor_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    contribution_id INT REFERENCES contribution_requests(contribution_id) ON DELETE SET NULL,
    role VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE (project_id, user_id)
);

select * FROM project_contributors;

--Truncate table project_contributors restart identity cascade;

CREATE TABLE payment_agreements (
    agreement_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    milestone_id INT REFERENCES project_milestones(milestone_id) ON DELETE CASCADE,
    contributor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    agreed_amount NUMERIC(12,2) NOT NULL CHECK (agreed_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'disputed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP
);

select * FROM payment_agreements;

--Truncate table payment_agreements restart identity cascade;

CREATE TABLE payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    agreement_id INT NOT NULL REFERENCES payment_agreements(agreement_id) ON DELETE CASCADE,
    payer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

select * FROM payment_transactions;

--Truncate table payment_transactions restart identity cascade;

CREATE TABLE audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    project_id INT REFERENCES projects(project_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * FROM audit_logs;

--Truncate table audit_logs restart identity cascade;

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_contribution_requests_project_id ON contribution_requests(project_id);
CREATE INDEX idx_contribution_requests_contributor_id ON contribution_requests(contributor_id);
CREATE INDEX idx_contribution_requests_owner_id ON contribution_requests(owner_id);
CREATE INDEX idx_project_contributors_project_id ON project_contributors(project_id);
CREATE INDEX idx_project_contributors_user_id ON project_contributors(user_id);
CREATE INDEX idx_payment_agreements_project_id ON payment_agreements(project_id);
CREATE INDEX idx_payment_agreements_contributor_id ON payment_agreements(contributor_id);
CREATE INDEX idx_payment_transactions_agreement_id ON payment_transactions(agreement_id);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

ALTER TABLE project_milestones
ADD CONSTRAINT milestone_payment_check
CHECK (
    payment_amount IS NULL
    OR payment_amount >= 0
);

ALTER TABLE projects
ADD CONSTRAINT projects_status_development_check
CHECK (
    (under_development = TRUE AND status = 'in_development')
    OR
    (under_development = FALSE AND status = 'completed')
);