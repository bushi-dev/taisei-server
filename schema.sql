-- wrangler d1 execute test --local --file=./schema.sql
CREATE TABLE TAKARA (
  ip TEXT NOT NULL PRIMARY KEY,
  takara TEXT NOT NULL
);