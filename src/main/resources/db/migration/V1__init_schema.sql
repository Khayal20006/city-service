-- =====================================================================
-- City Services Complaint Portal
-- Initial schema
-- =====================================================================

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password      VARCHAR(100) NOT NULL,
    full_name     VARCHAR(120),
    phone_number  VARCHAR(20),
    role          VARCHAR(30)  NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email),
    CONSTRAINT ck_users_role     CHECK (role IN ('CITIZEN', 'ADMIN', 'DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE'))
);

CREATE TABLE categories (
    id                       BIGSERIAL PRIMARY KEY,
    name                     VARCHAR(100) NOT NULL,
    description              VARCHAR(500),
    department_name          VARCHAR(150) NOT NULL,
    contact_email            VARCHAR(150),
    estimated_resolution_hours INTEGER      NOT NULL DEFAULT 72,
    active                   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_categories_name UNIQUE (name)
);

CREATE TABLE complaints (
    id              BIGSERIAL PRIMARY KEY,
    reference_code  VARCHAR(30)  NOT NULL,
    title           VARCHAR(120) NOT NULL,
    description     VARCHAR(4000) NOT NULL,
    image_url       VARCHAR(500),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    district        VARCHAR(80),
    address         VARCHAR(300),
    priority        VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    resolution_note VARCHAR(1000),
    resolved_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT       NOT NULL DEFAULT 0,
    user_id         BIGINT       NOT NULL,
    category_id     BIGINT       NOT NULL,
    assigned_to_id  BIGINT,
    CONSTRAINT fk_complaints_user        FOREIGN KEY (user_id)        REFERENCES users (id),
    CONSTRAINT fk_complaints_category    FOREIGN KEY (category_id)    REFERENCES categories (id),
    CONSTRAINT fk_complaints_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users (id),
    CONSTRAINT uk_complaints_reference   UNIQUE (reference_code),
    CONSTRAINT ck_complaints_priority    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT ck_complaints_status      CHECK (status   IN ('PENDING', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT ck_complaints_latitude    CHECK (latitude  BETWEEN  -90 AND  90),
    CONSTRAINT ck_complaints_longitude   CHECK (longitude BETWEEN -180 AND 180)
);

CREATE INDEX idx_complaints_status    ON complaints (status);
CREATE INDEX idx_complaints_category  ON complaints (category_id);
CREATE INDEX idx_complaints_user      ON complaints (user_id);
CREATE INDEX idx_complaints_created   ON complaints (created_at DESC);
CREATE INDEX idx_complaints_district  ON complaints (district);

CREATE TABLE complaint_comments (
    id              BIGSERIAL PRIMARY KEY,
    message         VARCHAR(2000) NOT NULL,
    previous_status VARCHAR(30),
    new_status      VARCHAR(30),
    internal        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    complaint_id    BIGINT NOT NULL,
    author_id       BIGINT,
    CONSTRAINT fk_comments_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author    FOREIGN KEY (author_id)    REFERENCES users (id)
);

CREATE INDEX idx_comments_complaint ON complaint_comments (complaint_id, created_at);