import HTML from "../public/index.html";

const PASSWORD = "ptown2026"; // Case-insensitive
const AUTH_COOKIE_NAME = "ptown_auth";
const AUTH_TOKEN = "ptown_auth_token_2026";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // Login endpoint - no auth required
    if (pathname === "/api/login" && method === "POST") {
      return handleLogin(request);
    }

    // Check authentication for all other routes
    if (!isAuthenticated(request)) {
      return serveLoginPage();
    }

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
    if (pathname === "/api/hotel-prices" && method === "GET") {
      const checkin = url.searchParams.get("checkin");
      const checkout = url.searchParams.get("checkout");
      return handleHotelPrices(checkin, checkout, env.DB);
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

function isAuthenticated(request) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === AUTH_COOKIE_NAME && value === AUTH_TOKEN) {
      return true;
    }
  }
  return false;
}

async function handleLogin(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password && password.toLowerCase() === PASSWORD) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `${AUTH_COOKIE_NAME}=${AUTH_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
        },
      });
    }

    return json({ success: false, error: "Invalid password" }, 401);
  } catch (e) {
    return json({ success: false, error: "Invalid request" }, 400);
  }
}

function serveLoginPage() {
  const loginHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Provincetown Trip Planner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0c1d36;
      --navy-mid: #162d4f;
      --atlantic: #1e4976;
      --atlantic-light: #2a6cb0;
      --sand: #f4ede4;
      --sand-mid: #ebe2d5;
      --sand-dark: #d9cebf;
      --coral: #d4654a;
      --coral-soft: #e8826b;
      --coral-glow: #f4a08c;
      --text: #1a1a1a;
      --text-mid: #4a4540;
      --white: #ffffff;
      --card: #fffcf8;
      --radius: 14px;
      --radius-sm: 8px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(160deg, var(--navy) 0%, var(--atlantic) 45%, var(--coral) 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      -webkit-font-smoothing: antialiased;
    }

    .login-container {
      background: var(--card);
      border-radius: var(--radius);
      padding: 3rem 2.5rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 2rem;
      color: var(--navy);
      margin-bottom: 0.5rem;
      letter-spacing: -0.5px;
    }

    .login-header h1 em {
      font-style: italic;
      color: var(--coral);
    }

    .login-header p {
      font-size: 0.9rem;
      color: var(--text-mid);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-mid);
      letter-spacing: 0.2px;
    }

    .form-group input {
      padding: 0.85rem 1.1rem;
      border: 1.5px solid var(--sand-dark);
      border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      background: var(--white);
      color: var(--text);
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--atlantic-light);
    }

    .login-button {
      padding: 0.9rem 1.5rem;
      background: var(--navy);
      color: var(--white);
      border: none;
      border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      letter-spacing: 0.3px;
      margin-top: 0.5rem;
    }

    .login-button:hover {
      background: var(--atlantic);
    }

    .login-button:disabled {
      background: var(--sand-dark);
      cursor: not-allowed;
    }

    .error-message {
      color: var(--coral);
      font-size: 0.85rem;
      text-align: center;
      display: none;
      margin-top: -0.5rem;
    }

    .error-message.show {
      display: block;
    }

    @media (max-width: 500px) {
      .login-container {
        padding: 2rem 1.5rem;
      }

      .login-header h1 {
        font-size: 1.6rem;
      }
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <h1>Provincetown<br><em>Trip Planner</em></h1>
      <p>Please enter the password to continue</p>
    </div>
    <form class="login-form" id="loginForm">
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="off" autofocus>
      </div>
      <div class="error-message" id="errorMessage">Incorrect password. Please try again.</div>
      <button type="submit" class="login-button" id="loginButton">Enter</button>
    </form>
  </div>

  <script>
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const password = passwordInput.value;
      errorMessage.classList.remove('show');
      loginButton.disabled = true;
      loginButton.textContent = 'Checking...';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = '/';
        } else {
          errorMessage.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
      } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Enter';
      }
    });
  </script>
</body>
</html>`;

  return new Response(loginHTML, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}

async function handleGetAvailability(db) {
  const { results } = await db
    .prepare("SELECT name, date, status FROM availability ORDER BY name, date")
    .all();
  const grouped = {};
  for (const row of results) {
    if (!grouped[row.name]) grouped[row.name] = {};
    grouped[row.name][row.date] = row.status || 'confirmed';
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
    .prepare("SELECT status FROM availability WHERE name = ? AND date = ?")
    .bind(trimmedName, date)
    .first();

  let newStatus;
  if (!existing) {
    // Not available -> Confirmed
    newStatus = 'confirmed';
    await db
      .prepare("INSERT INTO availability (name, date, status) VALUES (?, ?, ?)")
      .bind(trimmedName, date, newStatus)
      .run();
  } else if (existing.status === 'confirmed') {
    // Confirmed -> Tentative
    newStatus = 'tentative';
    await db
      .prepare("UPDATE availability SET status = ? WHERE name = ? AND date = ?")
      .bind(newStatus, trimmedName, date)
      .run();
  } else {
    // Tentative -> Not available (delete)
    newStatus = null;
    await db
      .prepare("DELETE FROM availability WHERE name = ? AND date = ?")
      .bind(trimmedName, date)
      .run();
  }

  return json({ status: newStatus });
}

async function handleSetAvailability(request, db) {
  const body = await request.json();
  const { name, availability } = body;
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
  for (const [date, status] of Object.entries(availability || {})) {
    stmts.push(
      db
        .prepare("INSERT INTO availability (name, date, status) VALUES (?, ?, ?)")
        .bind(trimmedName, date, status)
    );
  }
  await db.batch(stmts);
  return json({ ok: true });
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function handleHotelPrices(checkin, checkout, db) {
  if (!checkin || !checkout) {
    return json({ error: "checkin and checkout required" }, 400);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin) || !/^\d{4}-\d{2}-\d{2}$/.test(checkout)) {
    return json({ error: "dates must be YYYY-MM-DD" }, 400);
  }

  const cacheKey = `prices_${checkin}_${checkout}`;

  // Ensure cache table exists
  try {
    await db.prepare(
      "CREATE TABLE IF NOT EXISTS hotel_price_cache (cache_key TEXT PRIMARY KEY, data TEXT NOT NULL, fetched_at INTEGER NOT NULL)"
    ).run();
  } catch (e) {
    // Table likely already exists
  }

  // Check cache
  try {
    const cached = await db
      .prepare("SELECT data, fetched_at FROM hotel_price_cache WHERE cache_key = ?")
      .bind(cacheKey)
      .first();

    if (cached && (Date.now() - cached.fetched_at) < CACHE_TTL_MS) {
      return json(JSON.parse(cached.data));
    }
  } catch (e) {
    // Cache miss, continue to fetch
  }

  // Fetch fresh prices
  try {
    const prices = await fetchHotelPrices(checkin, checkout);

    // Store in cache
    try {
      await db
        .prepare("INSERT OR REPLACE INTO hotel_price_cache (cache_key, data, fetched_at) VALUES (?, ?, ?)")
        .bind(cacheKey, JSON.stringify(prices), Date.now())
        .run();
    } catch (e) {
      // Cache write failed, that's okay
    }

    return json(prices);
  } catch (error) {
    return json([]);
  }
}

async function fetchHotelPrices(checkin, checkout) {
  const searchUrl = `https://www.booking.com/searchresults.html?ss=Provincetown%2C+Massachusetts%2C+United+States&checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&selected_currency=USD`;

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cf: { cacheTtl: 3600 },
  });

  if (!response.ok) return [];

  const html = await response.text();
  return parseHotelPrices(html, checkin, checkout);
}

function parseHotelPrices(html, checkin, checkout) {
  const results = [];

  // Strategy 1: Parse JSON-LD structured data (most reliable)
  const jsonLdBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  for (const block of jsonLdBlocks) {
    try {
      const jsonStr = block.replace(/<script type="application\/ld\+json">/, "").replace(/<\/script>/, "");
      const data = JSON.parse(jsonStr);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Hotel" && item.name) {
          let price = null;
          if (item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            price = parseFloat(offer.price || offer.lowPrice || 0) || null;
          }
          if (item.name && price) {
            results.push({
              name: item.name,
              price: price,
              currency: (item.offers && (Array.isArray(item.offers) ? item.offers[0] : item.offers).priceCurrency) || "USD",
              rating: item.starRating || item.aggregateRating?.ratingValue || null,
              reviewScore: item.aggregateRating?.ratingValue || null,
            });
          }
        }
      }
    } catch (e) {
      // Skip malformed JSON-LD
    }
  }

  // Strategy 2: Parse property cards from HTML (fallback)
  if (results.length === 0) {
    // Look for price patterns near hotel name patterns
    // Booking.com often includes data in attributes like data-price or aria-label with price
    const priceBlocks = html.match(/data-testid="property-card"[\s\S]*?(?=data-testid="property-card"|$)/g) || [];
    for (const block of priceBlocks) {
      const nameMatch = block.match(/data-testid="title"[^>]*>([^<]+)/);
      const priceMatch = block.match(/data-testid="price-and-discounted-price"[^>]*>[\s\S]*?\$([\d,]+)/) ||
                          block.match(/\bUS\$\s*([\d,]+)/) ||
                          block.match(/\$\s*([\d,]+)/);
      if (nameMatch && priceMatch) {
        results.push({
          name: nameMatch[1].trim(),
          price: parseFloat(priceMatch[1].replace(/,/g, "")),
          currency: "USD",
          rating: null,
          reviewScore: null,
        });
      }
    }
  }

  // Strategy 3: Broader regex scan for any hotel-price pairs
  if (results.length === 0) {
    // Try to find any price mentions in the page
    const allPrices = [];
    const priceRegex = /(?:US)?\$\s*([\d,]+)/g;
    let match;
    while ((match = priceRegex.exec(html)) !== null) {
      const price = parseFloat(match[1].replace(/,/g, ""));
      if (price >= 50 && price <= 5000) {
        allPrices.push(price);
      }
    }
    // If we found reasonable prices, return them as a general price range
    if (allPrices.length > 0) {
      allPrices.sort((a, b) => a - b);
      results.push({
        name: "_price_range",
        price: allPrices[0],
        priceMax: allPrices[allPrices.length - 1],
        currency: "USD",
        count: allPrices.length,
      });
    }
  }

  // Calculate per-night price if the stay is multiple nights
  const nights = Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)));
  for (const r of results) {
    if (r.price && nights > 1) {
      r.pricePerNight = Math.round(r.price / nights);
      r.totalPrice = r.price;
      r.nights = nights;
    } else {
      r.pricePerNight = r.price;
      r.nights = nights;
    }
  }

  return results;
}
