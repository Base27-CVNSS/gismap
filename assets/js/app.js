(() => {
  const REG = window.GISMAP_REGISTRY || [];
  const MAE = window.MAE_SYSTEMS || [];
  const TYPE_LABEL = {WEBGIS:"WebGIS",GEOSPATIAL:"Không gian / SDI",MONITORING:"Giám sát",DATABASE:"CSDL",PORTAL:"Portal"};
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const host = url => { try { return new URL(url).hostname; } catch(e) { return url || ""; } };
  let group="all", q="", localKind="all", maeCat="all", maeType="all", maeQ="";

  function regRows(){
    const t=q.trim().toLocaleLowerCase("vi");
    return REG.filter(e => (group==="all" || e.group===group) &&
      (!t || [e.name,e.id,e.kind].join(" ").toLocaleLowerCase("vi").includes(t)));
  }
  function entityCard(e){
    const detailed=e.status==="detailed";
    const links=e.links||[];
    const stateLabel=detailed?"HỒ SƠ CHI TIẾT":e.status==="verified"?"ĐÃ XÁC MINH":e.status==="linked"?"CÓ DỮ LIỆU":"CHỜ CẬP NHẬT";
    const stateClass=detailed?"is-detailed":e.status==="verified"?"is-verified":e.status==="linked"?"is-linked":"";
    return '<article class="entity-card '+stateClass+'" data-entity="'+esc(e.id)+'" tabindex="0" role="button">'+
      '<div class="entity-top"><span class="entity-id">'+esc(e.id)+'</span><span class="entity-state">'+stateLabel+'</span></div>'+
      '<h3>'+esc(e.name)+'</h3>'+
      '<div class="entity-foot"><span>'+esc(e.kind)+'</span><span>'+(detailed?'24 hệ thống':links.length+' link')+'</span></div></article>';
  }
  function bindCards(){
    $$(".entity-card").forEach(el=>{
      const open=()=>openEntity(el.dataset.entity);
      el.addEventListener("click",open);
      el.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();open();}});
    });
  }
  function renderRegistry(){
    const rows=regRows();
    $("#globalCount").textContent=rows.length;
    ["ministry","agency","locality"].forEach(g=>{
      const sec=$('[data-section="'+g+'"]');
      if(sec) sec.classList.toggle("hidden-section",group!=="all"&&group!==g);
    });
    $("#ministryGrid").innerHTML=rows.filter(e=>e.group==="ministry").map(entityCard).join("");
    $("#agencyGrid").innerHTML=rows.filter(e=>e.group==="agency").map(entityCard).join("");
    $("#localityGrid").innerHTML=rows.filter(e=>e.group==="locality"&&(localKind==="all"||e.kind===localKind)).map(entityCard).join("");
    bindCards();
  }
  function openEntity(id){
    const e=REG.find(x=>x.id===id); if(!e) return;
    if(e.detailKey==="MAE"){ $("#maeProfile").scrollIntoView({behavior:"smooth",block:"start"}); return; }
    const links=e.links||[];
    if(links.length){
      $("#dialogBody").innerHTML='<div class="dialog-body"><div class="dialog-kicker">'+esc(e.id)+' · '+esc(e.kind)+'</div>'+
        '<h2>'+esc(e.name)+'</h2>'+
        '<p class="dialog-desc">'+(e.status==="verified"?'Nguồn công khai đã được đối chiếu với thông tin chính thức.':'Đã có nguồn công khai trong registry; một số metadata vẫn chờ kiểm chứng sâu.')+'</p>'+
        links.map(l=>'<div class="source-card"><div class="source-card__top"><span class="type-badge '+esc((l.type||"").toLowerCase())+'">'+esc(TYPE_LABEL[l.type]||l.type||"LINK")+'</span><span class="source-state '+esc(l.status||"linked")+'">'+(l.status==="verified"?'ĐÃ XÁC MINH':'CÓ DỮ LIỆU')+'</span></div><h3>'+esc(l.title)+'</h3><div class="dialog-meta"><div><span>Đơn vị quản lý</span><b>'+esc(l.manager||"—")+'</b></div><div><span>Tên miền</span><b>'+esc(host(l.url))+'</b></div><div><span>Nguồn ghi nhận</span><b>'+esc(l.source||"—")+'</b></div><div><span>Kiểm tra</span><b>'+esc(l.lastChecked||"—")+'</b></div></div><p class="source-note">'+esc(l.note||"")+'</p><div class="dialog-actions"><a href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">Mở hệ thống ↗</a>'+(l.sourceUrl&&l.sourceUrl!==l.url?'<a class="secondary-link" href="'+esc(l.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Nguồn xác minh ↗</a>':'')+'</div></div>').join("")+
        '</div>';
    } else {
      $("#dialogBody").innerHTML='<div class="dialog-body"><div class="dialog-kicker">'+esc(e.id)+' · '+esc(e.kind)+'</div>'+
        '<h2>'+esc(e.name)+'</h2>'+
        '<p class="dialog-desc">Đầu mối đã được tạo trong registry quốc gia. Liên kết WebGIS, portal, API và metadata chi tiết sẽ được bổ sung ở các đợt cập nhật sau.</p>'+
        '<div class="placeholder-note"><b>Trạng thái:</b> Chờ cập nhật dữ liệu.<br><b>Schema sẵn có:</b> tên hệ thống · URL · loại dịch vụ · nguồn · trạng thái · ngày kiểm tra.</div>'+
        '<div class="dialog-actions" style="margin-top:16px"><button type="button" id="placeholderClose">Đóng</button></div></div>';
    }
    $("#detailDialog").showModal();
    const close=$("#placeholderClose"); if(close) close.addEventListener("click",()=>$("#detailDialog").close());
  }

  function maeRows(){
    const t=maeQ.trim().toLocaleLowerCase("vi");
    return MAE.filter(x => (maeCat==="all"||x.cat===maeCat) &&
      (maeType==="all"||x.type===maeType) &&
      (!t || [x.name,x.desc,x.cat,x.type,host(x.url)].join(" ").toLocaleLowerCase("vi").includes(t)));
  }
  function renderMaeChips(){
    const counts={}; MAE.forEach(x=>counts[x.cat]=(counts[x.cat]||0)+1);
    const arr=[{k:"all",l:"Tất cả",n:MAE.length}].concat(Object.keys(counts).sort((a,b)=>a.localeCompare(b,"vi")).map(k=>({k:k,l:k,n:counts[k]})));
    $("#maeChips").innerHTML=arr.map(x=>'<button class="chip '+(x.k===maeCat?'active':'')+'" data-mae-cat="'+esc(x.k)+'">'+esc(x.l)+' · '+x.n+'</button>').join("");
    $$("[data-mae-cat]").forEach(b=>b.addEventListener("click",()=>{maeCat=b.dataset.maeCat;renderMaeChips();renderMae();}));
  }
  function renderMae(){
    const rows=maeRows();
    $("#maeCount").textContent=rows.length;
    $("#maeLogoGrid").innerHTML=rows.map(x=>'<article class="logo-cell" data-mae="'+esc(x.id)+'" tabindex="0" role="button">'+
      '<img src="'+esc(x.img)+'" alt="'+esc(x.name)+'" loading="lazy" onerror="this.remove()">'+
      '<span class="logo-cell__num">'+esc(x.id)+'</span><span class="logo-cell__type">'+esc(TYPE_LABEL[x.type]||x.type)+'</span></article>').join("");
    $("#maeRegister").innerHTML='<div class="register-head"><div>Mã</div><div>Hệ thống</div><div>Lĩnh vực</div><div>Loại</div><div>Trạng thái</div></div>'+
      rows.map(x=>'<div class="register-row" data-mae="'+esc(x.id)+'" tabindex="0" role="button">'+
      '<div class="reg-id">'+esc(x.id)+'</div><div class="reg-title"><b>'+esc(x.name)+'</b><span>'+esc(host(x.url))+'</span></div>'+
      '<div class="reg-field">'+esc(x.cat)+'</div><div><span class="type-badge '+esc(x.type.toLowerCase())+'">'+esc(TYPE_LABEL[x.type]||x.type)+'</span></div>'+
      '<div class="reg-status">Seed data</div></div>').join("");
    $$("[data-mae]").forEach(el=>{
      const open=()=>openMae(el.dataset.mae);
      el.addEventListener("click",open);
      el.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();open();}});
    });
  }
  function openMae(id){
    const x=MAE.find(a=>a.id===id); if(!x) return;
    $("#dialogBody").innerHTML='<div class="dialog-banner"><img src="'+esc(x.img)+'" alt=""></div><div class="dialog-body">'+
      '<div class="dialog-kicker">'+esc(x.id)+' · '+esc(TYPE_LABEL[x.type]||x.type)+' · SEED DATA</div><h2>'+esc(x.name)+'</h2>'+
      '<p class="dialog-desc">'+esc(x.desc)+'</p><div class="dialog-meta">'+
      '<div><span>Lĩnh vực</span><b>'+esc(x.cat)+'</b></div><div><span>Tên miền</span><b>'+esc(host(x.url))+'</b></div>'+
      '<div><span>Kiểm chứng</span><b>Chưa xác minh đồng loạt</b></div></div>'+
      '<div class="dialog-actions"><button type="button" id="maeClose">Đóng</button><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Mở nguồn ↗</a></div></div>';
    $("#detailDialog").showModal();
    $("#maeClose").addEventListener("click",()=>$("#detailDialog").close());
  }

  $("#globalSearch").addEventListener("input",e=>{q=e.target.value;renderRegistry();});
  $("#clearGlobal").addEventListener("click",()=>{$("#globalSearch").value="";q="";renderRegistry();});
  $$("[data-group]").forEach(b=>b.addEventListener("click",()=>{$$("[data-group]").forEach(x=>x.classList.remove("active"));b.classList.add("active");group=b.dataset.group;renderRegistry();}));
  $$("[data-local-kind]").forEach(b=>b.addEventListener("click",()=>{$$("[data-local-kind]").forEach(x=>x.classList.remove("active"));b.classList.add("active");localKind=b.dataset.localKind;renderRegistry();}));
  $$("[data-jump]").forEach(b=>b.addEventListener("click",()=>$("#"+b.dataset.jump).scrollIntoView({behavior:"smooth",block:"start"})));
  $("#maeSearch").addEventListener("input",e=>{maeQ=e.target.value;renderMae();});
  $("#maeType").addEventListener("change",e=>{maeType=e.target.value;renderMae();});
  $("#dialogClose").addEventListener("click",()=>$("#detailDialog").close());
  $("#detailDialog").addEventListener("click",e=>{if(e.target===$("#detailDialog"))$("#detailDialog").close();});

  document.addEventListener("keydown",e=>{
    const tag=(document.activeElement&&document.activeElement.tagName)||"";
    const typing=["INPUT","TEXTAREA","SELECT"].includes(tag);
    if(e.key==="/"&&!typing){
      e.preventDefault();
      $("#globalSearch").focus();
      $("#globalSearch").select();
    }
    if(e.key==="Escape"){
      if($("#detailDialog").open){ $("#detailDialog").close(); return; }
      if(document.activeElement===$("#globalSearch")&&$("#globalSearch").value){
        $("#globalSearch").value=""; q=""; renderRegistry();
      }else if(document.activeElement===$("#maeSearch")&&$("#maeSearch").value){
        $("#maeSearch").value=""; maeQ=""; renderMae();
      }
    }
  });

  if("IntersectionObserver" in window){
    const navById={ministries:"ministries",agencies:"agencies",localities:"localities"};
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible) return;
      $("[data-jump]").forEach(btn=>btn.classList.toggle("active",btn.dataset.jump===navById[visible.target.id]));
    },{rootMargin:"-90px 0px -55% 0px",threshold:[0,.15,.35]});
    ["ministries","agencies","localities"].forEach(id=>{const el=$("#"+id);if(el)observer.observe(el);});
  }

  $("#maeSystems").textContent=String(MAE.length).padStart(2,"0");
  $("#maeCats").textContent=String(new Set(MAE.map(x=>x.cat)).size).padStart(2,"0");
  $("#maeGeo").textContent=String(MAE.filter(x=>["WEBGIS","GEOSPATIAL","MONITORING"].includes(x.type)).length).padStart(2,"0");
  renderRegistry(); renderMaeChips(); renderMae();
})();