document.addEventListener('DOMContentLoaded', () => {
  // Tools page only
  const isToolsPage = window.location.pathname.endsWith('tools.html') || document.getElementById('toolSubdomain');
  if (!isToolsPage) return;

  // ==========================
  //  Obfuscation helpers
  //  (Bukan security, hanya "umpetin" dari tampilan source)
  // ==========================
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const unb64 = (s) => decodeURIComponent(escape(atob(s)));

  // Endpoint disimpan base64
  // Kamu bisa ganti/gabung sesuai kebutuhan
  const API = {
    subdomain: unb64("aHR0cHM6Ly9hcGkubmVrb2xhYnMud2ViLmlkL3Rvb2xzL2ZpbmRlci9zdWJkb21haW4tZmluZGVy"),
    hosting:   unb64("aHR0cHM6Ly9hcGkucnl6dW1pLnZpcC9hcGkvdG9vbC9jaGVjay1ob3N0aW5n"),
    portscan:  unb64("aHR0cHM6Ly9hcGkuZ2ltaXRhLmlkL2FwaS90b29scy9wb3J0c2Nhbg=="),
    whois:     unb64("aHR0cHM6Ly9hcGkuZ2ltaXRhLmlkL2FwaS90b29scy93aG9pcw=="),
  };

  const setStatus = (el, msg) => { if (el) el.textContent = msg || ''; };
  const showResult = (preEl, data) => {
    if (!preEl) return;
    preEl.style.display = 'block';
    preEl.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  };
  const clearResult = (preEl, statusEl) => {
    if (preEl) { preEl.textContent = ''; preEl.style.display = 'none'; }
    setStatus(statusEl, '');
  };

  const safeFetchJSON = async (url, statusEl) => {
    setStatus(statusEl, 'Loading...');
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'accept': 'application/json' } });
      const text = await res.text();

      let json;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }

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
  //  1) Subdomain Finder
  // ==========================
  const subDomain = document.getElementById('subdomainDomain');
  const subRun = document.getElementById('btnSubdomainRun');
  const subClear = document.getElementById('btnSubdomainClear');
  const subStatus = document.getElementById('subdomainStatus');
  const subResult = document.getElementById('subdomainResult');

  subRun?.addEventListener('click', async () => {
    const domain = (subDomain?.value || '').trim();
    if (!domain) return setStatus(subStatus, 'Isi domain dulu');

    const url = `${API.subdomain}?domain=${encodeURIComponent(domain)}`;
    const out = await safeFetchJSON(url, subStatus);

    // Optional: rapihin output jadi list unik name_value + common_name
    if (out.ok && out.data && out.data.result && Array.isArray(out.data.result)) {
      const uniq = new Set();
      out.data.result.forEach(r => {
        if (r?.name_value) {
          // name_value kadang multi-line
          String(r.name_value).split('\n').forEach(x => {
            const v = x.trim();
            if (v) uniq.add(v);
          });
        } else if (r?.common_name) {
          uniq.add(String(r.common_name).trim());
        }
      });
      showResult(subResult, {
        success: out.data.success ?? true,
        domain,
        count: uniq.size,
        subdomains: Array.from(uniq).sort(),
        meta: {
          timestamp: out.data.timestamp,
          responseTime: out.data.responseTime
        }
      });
      return;
    }

    showResult(subResult, out.data);
  });

  subClear?.addEventListener('click', () => {
    if (subDomain) subDomain.value = '';
    clearResult(subResult, subStatus);
  });

  // ==========================
  //  2) Check Hosting
  // ==========================
  const hostingDomain = document.getElementById('hostingDomain');
  const hostingRun = document.getElementById('btnHostingRun');
  const hostingClear = document.getElementById('btnHostingClear');
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
  //  3) Port Scanner
  // ==========================
  const portscanHost = document.getElementById('portscanHost');
  const portscanPorts = document.getElementById('portscanPorts');
  const portscanType = document.getElementById('portscanType');
  const portscanRun = document.getElementById('btnPortscanRun');
  const portscanClear = document.getElementById('btnPortscanClear');
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
  //  4) WHOIS
  // ==========================
  const whoisDomain = document.getElementById('whoisDomain');
  const whoisRun = document.getElementById('btnWhoisRun');
  const whoisClear = document.getElementById('btnWhoisClear');
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
