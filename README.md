# GISMAP — Vietnam Public WebGIS OSINT Registry

Static GitHub Pages registry for public WebGIS / geospatial portals published by Vietnamese central agencies and provincial-level localities.

## Baseline structure

- 14 ministries
- 3 ministerial-level agencies
- 8 national committees (project working list; verify legal/organizational status when adding authoritative sources)
- 34 provincial-level localities: 28 provinces + 6 centrally governed cities
- Total registry entities: 59

Central-government baseline follows Resolution 176/2025/QH15. Provincial-level baseline follows Resolution 202/2025/QH15.

## Files

- `index.html` — semantic shell
- `assets/css/app.css` — interface
- `assets/js/data.js` — registry data (edit links here)
- `assets/js/app.js` — search, filters, detail dialog, JSON export

## Add a WebGIS URL

Edit the `links` array of the relevant entity in `assets/js/data.js`:

```js
{
  title: "Tên cổng / WebGIS",
  url: "https://example.gov.vn/webgis",
  type: "WEBGIS",
  status: "verified",
  source: "Trang chính thức / công cụ tìm kiếm / văn bản",
  lastChecked: "2026-09-27",
  note: "Phạm vi, lớp dữ liệu, yêu cầu đăng nhập nếu có"
}
```

Recommended `type` values: `WEBGIS`, `PORTAL`, `DASHBOARD`, `WMS/WFS`, `TILES`, `API`.

Recommended `status` values:
- `discovered` — discovered but not yet opened
- `linked` — reachable, ownership/role not fully checked
- `verified` — reachable and associated with the intended public entity
- `offline` — previously recorded but currently unavailable

## OSINT rules

Store public-source URLs and public metadata only. Do not bypass authentication, access controls, CAPTCHAs, private endpoints, or non-public systems. Record `lastChecked` because public geospatial endpoints change over time.