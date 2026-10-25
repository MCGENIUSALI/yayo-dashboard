-- Authentication: accounts, external identities, server-side sessions,
-- single-use e-mail tokens, shared rate-limit counters and security events.
-- Secrets are never stored in clear: sessions and tokens are keyed by the
-- SHA-256 of a 256-bit random value, passwords are Argon2id hashes.

CREATE TABLE users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text NOT NULL UNIQUE CHECK (email = lower(email) AND length(email) BETWEEN 3 AND 254),
  email_verified_at   timestamptz,
  name                text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  password_hash       text,
  roles               text[] NOT NULL DEFAULT ARRAY['seller']::text[] CHECK (roles <@ ARRAY['seller', 'admin']::text[] AND cardinality(roles) > 0),
  status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  password_changed_at timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Google accounts are matched on the stable `sub` claim, never on the e-mail.
CREATE TABLE user_identities (
  provider   text NOT NULL CHECK (provider IN ('google')),
  subject    text NOT NULL,
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, subject),
  UNIQUE (user_id, provider)
);

CREATE TABLE sessions (
  id                   text PRIMARY KEY,               -- sha256(token), the token only lives in the cookie
  public_id            uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(), -- reference shown to the owner (revoke button)
  user_id              uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  auth_method          text NOT NULL CHECK (auth_method IN ('password', 'google')),
  persistent           boolean NOT NULL,
  idle_timeout_seconds integer NOT NULL CHECK (idle_timeout_seconds > 0),
  created_at           timestamptz NOT NULL DEFAULT now(),
  last_seen_at         timestamptz NOT NULL DEFAULT now(),
  expires_at           timestamptz NOT NULL,
  revoked_at           timestamptz,
  user_agent           text CHECK (length(user_agent) <= 256)
);
CREATE INDEX sessions_active_user_idx ON sessions (user_id) WHERE revoked_at IS NULL;

CREATE TABLE auth_tokens (
  id         text PRIMARY KEY,                         -- sha256(token)
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose    text NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at    timestamptz
);
CREATE INDEX auth_tokens_user_purpose_idx ON auth_tokens (user_id, purpose);

-- Fixed-window counters shared by every serverless instance.
CREATE TABLE auth_rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count        integer NOT NULL
);

CREATE TABLE auth_events (
  id         bigserial PRIMARY KEY,
  user_id    uuid REFERENCES users (id) ON DELETE SET NULL,
  event      text NOT NULL,
  ip_hash    text,
  detail     jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_events_user_idx ON auth_events (user_id, created_at DESC);
