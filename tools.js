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
    vcc:       `${PROXY_BASE}/vcc`,
    nik:       `${PROXY_BASE}/nik`,
    mahasiswa: `${PROXY_BASE}/mahasiswa`,
    iplocation: `${PROXY_BASE}/iplocation`,
    web2zip:   `${PROXY_BASE}/web2zip`,
    pajak:     `${PROXY_BASE}/cekpajak/jabar`,
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
    if (typeof data === 'string') {
      preEl.textContent = data;
    } else if (data instanceof HTMLElement) {
      preEl.innerHTML = '';
      preEl.appendChild(data);
    } else {
      preEl.textContent = JSON.stringify(data, null, 2);
    }
  };

  const clearResult = (preEl, statusEl) => {
    if (preEl) {
      preEl.textContent = '';
      preEl.style.display = 'none';
      preEl.innerHTML = '';
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

  // ==========================
  // 5) VCC Generator
  // ==========================
  const vccType    = document.getElementById('vccType');
  const vccRun     = document.getElementById('btnVccRun');
  const vccClear   = document.getElementById('btnVccClear');
  const vccStatus  = document.getElementById('vccStatus');
  const vccResult  = document.getElementById('vccResult');

  vccRun?.addEventListener('click', async () => {
    const type = (vccType?.value || 'visa').trim().toLowerCase();
    const url = `${API.vcc}?type=${encodeURIComponent(type)}`;
    
    setStatus(vccStatus, 'Generating...');
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate VCC');
      }
      
      if (data.success && Array.isArray(data.result)) {
        renderVccCards(data.result, type);
        setStatus(vccStatus, `Generated ${data.result.length} ${type.toUpperCase()} cards`);
      } else {
        vccResult.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        vccResult.style.display = 'block';
        setStatus(vccStatus, 'Done');
      }
    } catch (error) {
      vccResult.innerHTML = `<div style="color: #ef4444;">Error: ${error.message}</div>`;
      vccResult.style.display = 'block';
      setStatus(vccStatus, 'Failed');
    }
  });

  vccClear?.addEventListener('click', () => {
    vccResult.innerHTML = '';
    vccResult.style.display = 'none';
    setStatus(vccStatus, '');
  });

  function renderVccCards(cards, type) {
    let html = '<div class="vcc-grid">';
    
    cards.forEach((card, index) => {
      html += `
        <div class="vcc-card">
          <h4>${card.type || type.toUpperCase()} #${index + 1}</h4>
          <div class="vcc-field">
            <span>Name:</span>
            <span>${card.name || 'N/A'}</span>
          </div>
          <div class="vcc-field">
            <span>Number:</span>
            <span>${formatCardNumber(card.number)}</span>
          </div>
          <div class="vcc-field">
            <span>CVV:</span>
            <span>${card.cvv || 'N/A'}</span>
          </div>
          <div class="vcc-field">
            <span>Expiry:</span>
            <span>${card.expiry || 'N/A'}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // Add download buttons
    html += `
      <div class="download-buttons">
        <button class="btn-secondary" onclick="downloadVccAsJSON()">
          <i class="fa-solid fa-download"></i> Download JSON
        </button>
        <button class="btn-secondary" onclick="downloadVccAsTXT()">
          <i class="fa-solid fa-file-lines"></i> Download TXT
        </button>
      </div>
    `;
    
    vccResult.innerHTML = html;
    vccResult.style.display = 'block';
    
    // Store cards globally for download
    window.currentVccCards = cards;
  }

  function formatCardNumber(number) {
    if (!number) return 'N/A';
    const clean = number.replace(/\s/g, '');
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  }

  // Global functions for download
  window.downloadVccAsJSON = function() {
    if (!window.currentVccCards || !window.currentVccCards.length) return;
    
    const dataStr = JSON.stringify(window.currentVccCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vcc_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  window.downloadVccAsTXT = function() {
    if (!window.currentVccCards || !window.currentVccCards.length) return;
    
    let txt = 'Virtual Credit Card List\n';
    txt += 'Generated: ' + new Date().toLocaleString() + '\n';
    txt += '='.repeat(50) + '\n\n';
    
    window.currentVccCards.forEach((card, index) => {
      txt += `Card #${index + 1}\n`;
      txt += `Type: ${card.type}\n`;
      txt += `Name: ${card.name}\n`;
      txt += `Number: ${card.number}\n`;
      txt += `CVV: ${card.cvv}\n`;
      txt += `Expiry: ${card.expiry}\n`;
      txt += '-'.repeat(30) + '\n';
    });
    
    const dataBlob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vcc_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================
  // 6) NIK Checker
  // ==========================
  const nikNumber = document.getElementById('nikNumber');
  const nikRun    = document.getElementById('btnNikRun');
  const nikClear  = document.getElementById('btnNikClear');
  const nikStatus = document.getElementById('nikStatus');
  const nikResult = document.getElementById('nikResult');

  nikRun?.addEventListener('click', async () => {
    const nik = (nikNumber?.value || '').trim();
    if (!nik) return setStatus(nikStatus, 'Isi NIK dulu');
    if (!/^\d{16}$/.test(nik)) return setStatus(nikStatus, 'NIK harus 16 digit angka');

    const url = `${API.nik}?nik=${encodeURIComponent(nik)}`;
    const out = await safeFetchJSON(url, nikStatus);
    
    // Format output untuk NIK checker
    if (out.ok && out.data && out.data.status === 'success') {
      const data = out.data;
      const formatted = {
        NIK: data.nik,
        Valid: data.valid ? '✅ Valid' : '❌ Invalid',
        Message: data.message,
        'Data Informasi': {
          'Provinsi': data.data?.nama_provinsi || 'N/A',
          'Kode Provinsi': data.data?.kode_provinsi || 'N/A',
          'Pulau': data.data?.pulau || 'N/A',
          'Zona Waktu': data.data?.zona_waktu || 'N/A',
          'Tanggal Lahir': data.data?.tanggal_lahir || 'N/A',
          'Jenis Kelamin': data.data?.jenis_kelamin || 'N/A',
          'Usia': data.data?.usia_lengkap ? 
            `${data.data.usia_lengkap.tahun} tahun ${data.data.usia_lengkap.bulan} bulan ${data.data.usia_lengkap.hari} hari` : 'N/A',
          'Kategori Usia': data.data?.kategori_usia || 'N/A',
          'Zodiak': data.data?.zodiak?.nama || 'N/A',
          'Shio': data.data?.shio?.nama || 'N/A',
          'Weton': data.data?.weton ? 
            `${data.data.weton.hari} ${data.data.weton.pasaran}` : 'N/A',
        }
      };
      showResult(nikResult, formatted);
    } else {
      showResult(nikResult, out.data);
    }
  });

  nikClear?.addEventListener('click', () => {
    if (nikNumber) nikNumber.value = '';
    clearResult(nikResult, nikStatus);
  });

  // Auto-format NIK input
  nikNumber?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    e.target.value = value;
  });

  // ==========================
  // 7) Search Mahasiswa
  // ==========================
  const mahasiswaQuery = document.getElementById('mahasiswaQuery');
  const mahasiswaRun   = document.getElementById('btnMahasiswaRun');
  const mahasiswaClear = document.getElementById('btnMahasiswaClear');
  const mahasiswaStatus = document.getElementById('mahasiswaStatus');
  const mahasiswaResult = document.getElementById('mahasiswaResult');

  mahasiswaRun?.addEventListener('click', async () => {
    const query = (mahasiswaQuery?.value || '').trim();
    if (!query) return setStatus(mahasiswaStatus, 'Isi query dulu');

    const url = `${API.mahasiswa}?query=${encodeURIComponent(query)}`;
    const out = await safeFetchJSON(url, mahasiswaStatus);
    showResult(mahasiswaResult, out.data);
  });

  mahasiswaClear?.addEventListener('click', () => {
    if (mahasiswaQuery) mahasiswaQuery.value = '';
    clearResult(mahasiswaResult, mahasiswaStatus);
  });

  // ==========================
  // 8) IP Location
  // ==========================
  const iplocationIp = document.getElementById('iplocationIp');
  const iplocationRun = document.getElementById('btnIplocationRun');
  const iplocationClear = document.getElementById('btnIplocationClear');
  const iplocationStatus = document.getElementById('iplocationStatus');
  const iplocationResult = document.getElementById('iplocationResult');

  iplocationRun?.addEventListener('click', async () => {
    const ip = (iplocationIp?.value || '').trim();
    if (!ip) return setStatus(iplocationStatus, 'Isi IP dulu');

    // Validasi IP format sederhana
    const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) {
      return setStatus(iplocationStatus, 'Format IP tidak valid');
    }

    const url = `${API.iplocation}?ip=${encodeURIComponent(ip)}`;
    const out = await safeFetchJSON(url, iplocationStatus);
    
    // Format output untuk IP location
    if (out.ok && out.data) {
      const data = out.data;
      if (data.success || data.ip) {
        const formatted = {
          'IP Address': data.ip || ip,
          'Kota': data.city || 'N/A',
          'Wilayah': data.region || 'N/A',
          'Negara': data.country || 'N/A',
          'Kode Negara': data.country_code || 'N/A',
          'Koordinat': data.loc ? `${data.loc}` : 'N/A',
          'Zona Waktu': data.timezone || 'N/A',
          'ISP/Provider': data.org || 'N/A',
          'Hostname': data.hostname || 'N/A',
        };
        showResult(iplocationResult, formatted);
      } else {
        showResult(iplocationResult, out.data);
      }
    } else {
      showResult(iplocationResult, out.data);
    }
  });

  iplocationClear?.addEventListener('click', () => {
    if (iplocationIp) iplocationIp.value = '';
    clearResult(iplocationResult, iplocationStatus);
  });

  // ==========================
  // 9) Web to ZIP
  // ==========================
  const web2zipUrl = document.getElementById('web2zipUrl');
  const web2zipRun = document.getElementById('btnWeb2zipRun');
  const web2zipClear = document.getElementById('btnWeb2zipClear');
  const web2zipStatus = document.getElementById('web2zipStatus');
  const web2zipResult = document.getElementById('web2zipResult');

  web2zipRun?.addEventListener('click', async () => {
    const urlInput = (web2zipUrl?.value || '').trim();
    if (!urlInput) return setStatus(web2zipStatus, 'Isi URL dulu');

    // Validasi URL sederhana
    try {
      new URL(urlInput);
    } catch {
      return setStatus(web2zipStatus, 'URL tidak valid');
    }

    const url = `${API.web2zip}?url=${encodeURIComponent(urlInput)}`;
    const out = await safeFetchJSON(url, web2zipStatus);
    
    // Jika response berisi link download
    if (out.ok && out.data) {
      if (out.data.download_url || out.data.zip_url) {
        const downloadUrl = out.data.download_url || out.data.zip_url;
        const downloadBtn = document.createElement('div');
        downloadBtn.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p style="color: #a855f7; margin-bottom: 15px;">Website berhasil dikonversi ke ZIP!</p>
            <a href="${downloadUrl}" target="_blank" class="btn" style="display: inline-flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-download"></i> Download ZIP
            </a>
            <p style="margin-top: 10px; color: #94a3b8; font-size: 12px;">
              Size: ${out.data.size || 'Unknown'} | Files: ${out.data.file_count || 'Unknown'}
            </p>
          </div>
        `;
        showResult(web2zipResult, downloadBtn);
      } else {
        showResult(web2zipResult, out.data);
      }
    } else {
      showResult(web2zipResult, out.data);
    }
  });

  web2zipClear?.addEventListener('click', () => {
    if (web2zipUrl) web2zipUrl.value = '';
    clearResult(web2zipResult, web2zipStatus);
  });

  // ==========================
  // 10) Cek Pajak Jabar
  // ==========================
  const pajakPlat = document.getElementById('pajakPlat');
  const pajakRun = document.getElementById('btnPajakRun');
  const pajakClear = document.getElementById('btnPajakClear');
  const pajakStatus = document.getElementById('pajakStatus');
  const pajakResult = document.getElementById('pajakResult');

  pajakRun?.addEventListener('click', async () => {
    const plat = (pajakPlat?.value || '').trim().toUpperCase();
    if (!plat) return setStatus(pajakStatus, 'Isi plat nomor dulu');

    const url = `${API.pajak}?plat=${encodeURIComponent(plat)}`;
    const out = await safeFetchJSON(url, pajakStatus);
    
    // Format output untuk cek pajak
    if (out.ok && out.data) {
      if (out.data.success || out.data.nomor_polisi) {
        const data = out.data;
        const formatted = {
          'Nomor Polisi': data.nomor_polisi || plat,
          'Nama Pemilik': data.nama_pemilik || 'N/A',
          'Alamat': data.alamat || 'N/A',
          'Merk/Type': data.merk_type || 'N/A',
          'Tahun Pembuatan': data.tahun_pembuatan || 'N/A',
          'Warna': data.warna || 'N/A',
          'Status Pajak': data.status_pajak || 'N/A',
          'Tenggat Pajak': data.tenggat_pajak || 'N/A',
          'Jumlah Pajak': data.jumlah_pajak || 'N/A',
          'Denda': data.denda || '0',
          'Total Bayar': data.total_bayar || 'N/A',
        };
        showResult(pajakResult, formatted);
      } else {
        showResult(pajakResult, out.data);
      }
    } else {
      showResult(pajakResult, out.data);
    }
  });

  pajakClear?.addEventListener('click', () => {
    if (pajakPlat) pajakPlat.value = '';
    clearResult(pajakResult, pajakStatus);
  });

});
