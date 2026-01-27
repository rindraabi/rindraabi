export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS
    const origin = request.headers.get("Origin") || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Accept",
      "Access-Control-Max-Age": "86400",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: /api/portscan?host=...&ports=...&scan_type=...
    if (url.pathname === "/api/portscan") {
      const host = url.searchParams.get("host") || "";
      const ports = url.searchParams.get("ports") || "top100";
      const scan_type = url.searchParams.get("scan_type") || "quick";

      const upstream = new URL("https://api.gimita.id/api/tools/portscan");
      upstream.searchParams.set("host", host);
      upstream.searchParams.set("ports", ports);
      upstream.searchParams.set("scan_type", scan_type);

      return proxyJSON(upstream.toString(), corsHeaders);
    }

    // Route: /api/whois?domain=...
    if (url.pathname === "/api/whois") {
      const domain = url.searchParams.get("domain") || "";

      const upstream = new URL("https://api.gimita.id/api/tools/whois");
      upstream.searchParams.set("domain", domain);

      return proxyJSON(upstream.toString(), corsHeaders);
    }

    // Default info
    return new Response(
      JSON.stringify({
        ok: true,
        routes: ["/api/portscan", "/api/whois"],
      }),
      { headers: { "content-type": "application/json", ...corsHeaders } }
    );
  },
};

async function proxyJSON(upstreamUrl, corsHeaders) {
  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: { "accept": "application/json" },
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders,
    },
  });
}
