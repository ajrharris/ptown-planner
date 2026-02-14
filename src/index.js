import HTML from "../public/index.html";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // API routes
    if (pathname === "/api/availability" && method === "GET") {
      return handleGetAvailability(env.DB);
    }
    if (pathname === "/api/people" && method === "GET") {
      return handleGetPeople(env.DB);
    }
    if (pathname === "/api/toggle" && method === "POST") {
      return handleToggle(request, env.DB);
    }
    if (pathname === "/api/availability" && method === "POST") {
      return handleSetAvailability(request, env.DB);
    }

    // Serve the HTML app for everything else
    return new Response(HTML, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetAvailability(db) {
  const { results } = await db
    .prepare("SELECT name, date FROM availability ORDER BY name, date")
    .all();
  const grouped = {};
  for (const row of results) {
    if (!grouped[row.name]) grouped[row.name] = [];
    grouped[row.name].push(row.date);
  }
  return json(grouped);
}

async function handleGetPeople(db) {
  const { results } = await db
    .prepare("SELECT DISTINCT name FROM availability ORDER BY name")
    .all();
  return json(results.map((r) => r.name));
}

async function handleToggle(request, db) {
  const body = await request.json();
  const { name, date } = body;
  if (!name || !date) {
    return json({ error: "name and date required" }, 400);
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    return json({ error: "name cannot be empty" }, 400);
  }

  const existing = await db
    .prepare("SELECT 1 FROM availability WHERE name = ? AND date = ?")
    .bind(trimmedName, date)
    .first();

  if (existing) {
    await db
      .prepare("DELETE FROM availability WHERE name = ? AND date = ?")
      .bind(trimmedName, date)
      .run();
    return json({ toggled: false });
  } else {
    await db
      .prepare("INSERT OR IGNORE INTO availability (name, date) VALUES (?, ?)")
      .bind(trimmedName, date)
      .run();
    return json({ toggled: true });
  }
}

async function handleSetAvailability(request, db) {
  const body = await request.json();
  const { name, dates } = body;
  if (!name) {
    return json({ error: "name required" }, 400);
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    return json({ error: "name cannot be empty" }, 400);
  }

  const stmts = [
    db.prepare("DELETE FROM availability WHERE name = ?").bind(trimmedName),
  ];
  for (const d of dates || []) {
    stmts.push(
      db
        .prepare("INSERT INTO availability (name, date) VALUES (?, ?)")
        .bind(trimmedName, d)
    );
  }
  await db.batch(stmts);
  return json({ ok: true });
}
