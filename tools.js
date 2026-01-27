document.addEventListener('DOMContentLoaded', () => {
  // Tools page only guard
  const isToolsPage =
    window.location.pathname.endsWith('tools.html') ||
    document.getElementById('toolSubdomain') ||
    document.querySelector('.tools-page');

  if (!isToolsPage) return;

  // ==========================
  // PROXY BASE (SEMUA VIA WORKER)
  // ==========================
  const PROXY_BASE = "https://tools-api.rindraabi.my.id/api";

  const API = {
    subdomain: `${PROXY_BASE}/subdomain`,
    hosting:   `${PROXY_BASE}/hosting`,
    portscan:  `${PROXY_BASE}/portscan`,
    whois:     `${PROXY_BASE}/whois`,
  };

  // ==========================
  // Helpers UI
  // ==========================
  const setStatus = (el, msg) => {
    if (!el) return;
    el.textContent = msg || '';
  };

  const showResult = (preEl, data) => {
    if (!preEl) return;
    preEl.style.display = 'block';
    preEl.textContent = (typeof data === 'string') ? data : JSON.stringify(data, null, 2);
  };

  const clearResult = (preEl, statusEl) => {
    if (preEl) {
      preEl.textContent = '';
      preEl.style.display = 'none';
    }
    setStatus(statusEl, '');
  };

  const safeFetchJSON = async (url, statusEl) => {
    setStatus(statusEl, 'Loading...');
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'accept': 'application/json' },
      });

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); }
      catch { json = { raw: text }; }

      if (!res.ok) {
        setStatus(statusEl, `Error ${res.status}`);
        return { ok: false, status: res.status, data: json };
      }

      setStatus(statusEl, 'Done');
      return { ok: true, status: res.status, data: json };
    } catch (e) {
      setStatus(statusEl, 'Failed');
      return { ok: false, status: 0, data: { error: String(e) } };
    }
  };

  // ==========================
  // 1) Subdomain Finder
  // ==========================
  const subDomain  = document.getElementById('subdomainDomain');
  const subRun     = document.getElementById('btnSubdomainRun');
  const subClear   = document.getElementById('btnSubdomainClear');
  const subStatus  = document.getElementById('subdomainStatus');
  const subResult  = document.getElementById('subdomainResult');

  subRun?.addEventListener('click', async () => {
    const domain = (subDomain?.value || '').trim();
    if (!domain) return setStatus(subStatus, 'Isi domain dulu');

    const url = `${API.subdomain}?domain=${encodeURIComponent(domain)}`;
    const out = await safeFetchJSON(url, subStatus);

    // Kalau sukses dan format sesuai contoh (result array), rapihin jadi list subdomain unik
    if (out.ok && out.data && Array.isArray(out.data.result)) {
      const uniq = new Set();

      out.data.result.forEach((r) => {
        if (r?.name_value) {
          String(r.name_value).split('\n').forEach((x) => {
            const v = x.trim();
            if (v) uniq.add(v);
          });
        }
        if (r?.common_name) {
          const cn = String(r.common_name).trim();
          if (cn) uniq.add(cn);
        }
      });

      showResult(subResult, {
        success: out.data.success ?? true,
        domain,
        count: uniq.size,
        subdomains: Array.from(uniq).sort(),
        meta: {
          timestamp: out.data.timestamp,
          responseTime: out.data.responseTime,
        },
      });
      return;
    }

    // fallback tampilkan apa adanya
    showResult(subResult, out.data);
  });

  subClear?.addEventListener('click', () => {
    if (subDomain) subDomain.value = '';
    clearResult(subResult, subStatus);
  });

  // ==========================
  // 2) Check Hosting
  // ==========================
  const hostingDomain = document.getElementById('hostingDomain');
  const hostingRun    = document.getElementById('btnHostingRun');
  const hostingClear  = document.getElementById('btnHostingClear');
  const hostingStatus = document.getElementById('hostingStatus');
  const hostingResult = document.getElementById('hostingResult');

  hostingRun?.addEventListener('click', async () => {
    const domain = (hostingDomain?.value || '').trim();
    if (!domain) return setStatus(hostingStatus, 'Isi domain dulu');

    const url = `${API.hosting}?domain=${encodeURIComponent(domain)}`;
    const out = await safeFetchJSON(url, hostingStatus);
    showResult(hostingResult, out.data);
  });

  hostingClear?.addEventListener('click', () => {
    if (hostingDomain) hostingDomain.value = '';
    clearResult(hostingResult, hostingStatus);
  });

  // ==========================
  // 3) Port Scanner
  // ==========================
  const portscanHost   = document.getElementById('portscanHost');
  const portscanPorts  = document.getElementById('portscanPorts');
  const portscanType   = document.getElementById('portscanType');
  const portscanRun    = document.getElementById('btnPortscanRun');
  const portscanClear  = document.getElementById('btnPortscanClear');
  const portscanStatus = document.getElementById('portscanStatus');
  const portscanResult = document.getElementById('portscanResult');

  portscanRun?.addEventListener('click', async () => {
    const host = (portscanHost?.value || '').trim();
    const ports = (portscanPorts?.value || 'top100').trim();
    const type = (portscanType?.value || 'quick').trim();

    if (!host) return setStatus(portscanStatus, 'Isi host/IP dulu');

    const url =
      `${API.portscan}?host=${encodeURIComponent(host)}` +
      `&ports=${encodeURIComponent(ports)}` +
      `&scan_type=${encodeURIComponent(type)}`;

    const out = await safeFetchJSON(url, portscanStatus);
    showResult(portscanResult, out.data);
  });

  portscanClear?.addEventListener('click', () => {
    if (portscanHost) portscanHost.value = '';
    if (portscanPorts) portscanPorts.value = 'top100';
    if (portscanType) portscanType.value = 'quick';
    clearResult(portscanResult, portscanStatus);
  });

  // ==========================
  // 4) WHOIS
  // ==========================
  const whoisDomain = document.getElementById('whoisDomain');
  const whoisRun    = document.getElementById('btnWhoisRun');
  const whoisClear  = document.getElementById('btnWhoisClear');
  const whoisStatus = document.getElementById('whoisStatus');
  const whoisResult = document.getElementById('whoisResult');

  whoisRun?.addEventListener('click', async () => {
    const domain = (whoisDomain?.value || '').trim();
    if (!domain) return setStatus(whoisStatus, 'Isi domain/IP dulu');

    const url = `${API.whois}?domain=${encodeURIComponent(domain)}`;
    const out = await safeFetchJSON(url, whoisStatus);
    showResult(whoisResult, out.data);
  });

  whoisClear?.addEventListener('click', () => {
    if (whoisDomain) whoisDomain.value = '';
    clearResult(whoisResult, whoisStatus);
  });
});
