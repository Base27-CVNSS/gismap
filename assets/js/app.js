(() => {
  const entities = window.GISMAP_ENTITIES || [];
  let scope = "all";
  let stateFilter = "all";
  let query = "";
  let sort = "default";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const grid = $("#entityGrid");
  const empty = $("#emptyState");
  const search = $("#searchInput");
  const dialog = $("#detailDialog");
  const dialogContent = $("#dialogContent");

  const stateOf = e => {
    if (!e.links || !e.links.length) return "pending";
    if (e.links.some(x => x.status === "verified")) return "verified";
    return "linked";
  };

  const stateLabel = s => ({pending:"Chờ URL", linked:"Có link", verified:"Đã kiểm chứng"})[s] || s;
  const scopeLabel = s => ({all:"Tất cả đầu mối", ministry:"14 Bộ", agency:"3 cơ quan ngang Bộ", committee:"8 Ủy ban Quốc gia", locality:"34 tỉnh, thành phố"})[s] || "Registry";

  function filtered(){
    let rows = entities.filter(e => scope === "all" || e.scope === scope);
    rows = rows.filter(e => stateFilter === "all" || stateOf(e) === stateFilter || (stateFilter === "linked" && e.links?.length));
    const q = query.trim().toLocaleLowerCase("vi");
    if(q) rows = rows.filter(e => [e.name,e.id,e.kind,e.level].join(" ").toLocaleLowerCase("vi").includes(q));
    if(sort === "az") rows.sort((a,b)=>a.name.localeCompare(b.name,"vi"));
    if(sort === "links") rows.sort((a,b)=>(b.links?.length||0)-(a.links?.length||0) || a.name.localeCompare(b.name,"vi"));
    return rows;
  }

  function render(){
    const rows = filtered();
    $("#resultCount").textContent = rows.length;
    $("#sectionTitle").textContent = scopeLabel(scope);
    grid.innerHTML = rows.map(e => {
      const state = stateOf(e);
      const n = e.links?.length || 0;
      return `<article class="entity-card" tabindex="0" role="button" data-id="${e.id}" data-state="${state}" aria-label="Mở ${esc(e.name)}">
        <div class="entity-top">
          <span class="entity-id">${esc(e.id)}</span>
          <span class="entity-state"><i class="status-dot ${state}"></i>${stateLabel(state)}</span>
        </div>
        <h3>${esc(e.name)}</h3>
        <div class="entity-meta">
          <span>${esc(e.kind)} · ${esc(e.level)}</span>
          <span class="entity-links">${n.toString().padStart(2,"0")} link</span>
        </div>
      </article>`;
    }).join("");
    empty.hidden = rows.length !== 0;
    $$(".entity-card").forEach(card => {
      const open = () => showDetail(card.dataset.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }});
    });
  }

  function esc(v=""){ return String(v).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  function showDetail(id){
    const e = entities.find(x=>x.id===id);
    if(!e) return;
    const links = e.links || [];
    dialogContent.innerHTML = `
      <div class="dialog-kicker">${esc(e.id)} · ${esc(e.kind)}</div>
      <h2 class="dialog-title">${esc(e.name)}</h2>
      <div class="dialog-sub">${esc(e.level)} · ${links.length} nguồn WebGIS đã ghi nhận</div>
      <div class="dialog-rule"></div>
      ${links.length ? links.map(l=>`
        <div class="link-row">
          <div>
            <h4>${esc(l.title || "WebGIS")}</h4>
            <p>${esc(l.type || "WEBGIS")} · ${esc(l.status || "linked")} · checked ${esc(l.lastChecked || "—")}</p>
          </div>
          <a class="link-open" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">MỞ ↗</a>
        </div>`).join("") :
        `<div class="no-links"><strong>Chưa gắn URL WebGIS.</strong><br>Registry đã sẵn sàng. Khi có link, chỉ cần thêm record vào <code>assets/js/data.js</code> theo schema chuẩn.</div>`}
    `;
    dialog.showModal();
  }

  function updateStats(){
    const linkCount = entities.reduce((n,e)=>n+(e.links?.length||0),0);
    const verifiedLinks = entities.reduce((n,e)=>n+(e.links||[]).filter(l=>l.status==="verified").length,0);
    const linkedEntities = entities.filter(e=>(e.links?.length||0)>0).length;
    $("#metricEntities").textContent = entities.length;
    $("#metricLinks").textContent = linkCount;
    $("#metricVerified").textContent = verifiedLinks;
    $("#metricCoverage").textContent = Math.round(linkedEntities/entities.length*100)+"%";
    $("#countAll").textContent = entities.length;
    $("#countPending").textContent = entities.filter(e=>stateOf(e)==="pending").length;
    $("#countLinked").textContent = entities.filter(e=>(e.links?.length||0)>0).length;
    $("#countVerified").textContent = entities.filter(e=>stateOf(e)==="verified").length;
  }

  $$(".scope-card").forEach(btn => btn.addEventListener("click", () => {
    $$(".scope-card").forEach(x=>x.classList.remove("is-active"));
    btn.classList.add("is-active"); scope = btn.dataset.scope; render();
    document.querySelector("#registry").scrollIntoView({behavior:"smooth",block:"start"});
  }));
  $$(".rail-item").forEach(btn => btn.addEventListener("click", () => {
    $$(".rail-item").forEach(x=>x.classList.remove("is-active"));
    btn.classList.add("is-active"); stateFilter = btn.dataset.filter; render();
  }));
  search.addEventListener("input", e => { query = e.target.value; render(); });
  $("#sortSelect").addEventListener("change", e => { sort = e.target.value; render(); });
  $("#dialogClose").addEventListener("click", ()=>dialog.close());
  dialog.addEventListener("click", e => { if(e.target === dialog) dialog.close(); });
  document.addEventListener("keydown", e => {
    if(e.key === "/" && document.activeElement !== search){ e.preventDefault(); search.focus(); }
  });
  $("#exportBtn").addEventListener("click", () => {
    const payload = JSON.stringify({meta:window.GISMAP_META, entities}, null, 2);
    const blob = new Blob([payload], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "gismap-registry.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  });

  $("#buildDate").textContent = `Baseline ${window.GISMAP_META?.baseline || "2026-09-27"}`;
  updateStats();
  render();
})();