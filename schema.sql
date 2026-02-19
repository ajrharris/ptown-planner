CREATE TABLE IF NOT EXISTS availability (
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (name, date)
);

CREATE TABLE IF NOT EXISTS hotel_price_cache (
  cache_key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  fetched_at INTEGER NOT NULL
);
