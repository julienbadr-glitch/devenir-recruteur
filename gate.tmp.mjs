import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://localhost:4173/opportunite.html"); await p.waitForURL(/connexion/); console.log("redir:", p.url());
await p.screenshot({ path: "/tmp/claude-0/connexion.png" });
await p.route(/supabase\.co\/auth\/v1\/token/, r => r.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error_code:"invalid_credentials", msg:"Invalid login credentials" }) }));
await p.fill("#email", "x@y.fr"); await p.fill("#password", "mauvais"); await p.click("#go"); await p.waitForTimeout(800);
console.log("err:", await p.textContent("#err")); await b.close();
