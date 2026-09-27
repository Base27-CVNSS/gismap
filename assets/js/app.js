(() => {
  const DATA = window.MAE_SYSTEMS || [];
  const TYPE_LABEL = {WEBGIS:"WebGIS",GEOSPATIAL:"Không gian / SDI",MONITORING:"Giám sát",DATABASE:"CSDL",PORTAL:"Portal"};
  let activeCat = "all";
  let activeType = "all";
  let keyword = "";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const grid = $("#logoGrid");
  const register = $("#register");
  const chips = $("#chips");
  const search = $("#search");
  const dialog = $("#detailDialog");

  const esc = (v="") => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const host = url => { try { return new URL(url).hostname; } catch { return url; } };

  function filtered(){
    const q = keyword.trim().toLocaleLowerCase("vi");
    return DATA.filter(item => {
      const catOk = activeCat === "all" || item.cat === activeCat;
      const typeOk = activeType === "all" || item.type === activeType;
      const text = [item.name,item.desc,item.cat,item.type,host(item.url)].join(" ").toLocaleLowerCase("vi");
      return catOk && typeOk && (!q || text.includes(q));
    });
  }

  function renderChips(){
    const counts = {};
    DATA.forEach(d => counts[d.cat]=(counts[d.cat]||0)+1);
    const list = [{key:"all",label:"Tất cả",n:DATA.length},...Object.keys(counts).sort((a,b)=>a.localeCompare(b,"vi")).map(k=>({key:k,label:k,n:counts[k]}))];
    chips.innerHTML = list.map(x=>`<button type="button" class="chip ${x.key===activeCat?"active":""}" data-cat="${esc(x.key)}">${esc(x.label)} · ${x.n}</button>`).join("");
    $$(".chip").forEach(btn=>btn.addEventListener("click",()=>{activeCat=btn.dataset.cat;renderChips();render();}));
  }

  function render(){
    const rows = filtered();
    $("#count").textContent = rows.length;
    $("#empty").hidden = rows.length !== 0;

    grid.innerHTML = rows.map(item=>`
      <article class="logo-cell" data-id="${item.id}" tabindex="0" role="button" aria-label="${esc(item.name)}" title="${esc(item.name)}">
        <img src="${esc(item.img)}" alt="${esc(item.name)}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove()">
        <span class="logo-cell__num">${item.id}</span>
        <span class="logo-cell__type">${esc(TYPE_LABEL[item.type]||item.type)}</span>
      </article>`).join("");

    register.innerHTML = `
      <div class="register-head"><div>Mã</div><div>Hệ thống</div><div>Lĩnh vực</div><div>Loại</div><div>Trạng thái</div></div>
      ${rows.map(item=>`
        <div class="register-row" data-id="${item.id}" tabindex="0" role="button">
          <div class="reg-id">${item.id}</div>
          <div class="reg-title"><b>${esc(item.name)}</b><span>${esc(host(item.url))}</span></div>
          <div class="reg-field">${esc(item.cat)}</div>
          <div><span class="type-badge ${item.type.toLowerCase()}">${esc(TYPE_LABEL[item.type]||item.type)}</span></div>
          <div class="reg-status"><i></i>Chưa kiểm chứng</div>
        </div>`).join("")}`;

    $$("[data-id]").forEach(el=>{
      const open=()=>openDetail(el.dataset.id);
      el.addEventListener("click",open);
      el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    });
  }

  function openDetail(id){
    const item = DATA.find(x=>x.id===id);
    if(!item) return;
    $("#dialogBody").innerHTML = `
      <div class="dialog-banner"><img src="${esc(item.img)}" alt="" onerror="this.remove()"></div>
      <div class="dialog-body">
        <div class="dialog-tags"><span class="dialog-tag">${item.id}</span><span class="dialog-tag">${esc(TYPE_LABEL[item.type]||item.type)}</span><span class="dialog-tag">SEED DATA</span></div>
        <h2>${esc(item.name)}</h2>
        <p class="dialog-desc">${esc(item.desc)}</p>
        <div class="dialog-meta">
          <div><span>Lĩnh vực</span><b>${esc(item.cat)}</b></div>
          <div><span>Tên miền</span><b>${esc(host(item.url))}</b></div>
          <div><span>Kiểm chứng</span><b>Chưa thực hiện</b></div>
          <div><span>Nguồn</span><b>Danh mục khởi tạo</b></div>
        </div>
        <div class="dialog-actions">
          <button type="button" onclick="document.getElementById('detailDialog').close()">Đóng</button>
          <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Mở nguồn ↗</a>
        </div>
      </div>`;
    dialog.showModal();
  }

  search.addEventListener("input",e=>{keyword=e.target.value;search.parentElement.classList.toggle("has-value",!!keyword);render();});
  $("#clearSearch").addEventListener("click",()=>{keyword="";search.value="";search.parentElement.classList.remove("has-value");search.focus();render();});
  $("#typeFilter").addEventListener("change",e=>{activeType=e.target.value;render();});
  $("#dialogClose").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog) dialog.close();});
  document.addEventListener("keydown",e=>{if(e.key==="/" && document.activeElement!==search){e.preventDefault();search.focus();}});

  const geo = DATA.filter(x=>["WEBGIS","GEOSPATIAL","MONITORING"].includes(x.type)).length;
  $("#statSystems").textContent=String(DATA.length).padStart(2,"0");
  $("#statCats").textContent=String(new Set(DATA.map(x=>x.cat)).size).padStart(2,"0");
  $("#statGeo").textContent=String(geo).padStart(2,"0");
  $("#statVerified").textContent="00";

  renderChips();
  render();
})();