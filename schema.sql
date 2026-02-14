CREATE TABLE IF NOT EXISTS availability (
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (name, date)
);
