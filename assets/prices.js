/* ===== Price list — Google Sheets driven (with safe fallback) ===== */
(function(){
  var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTChWnZFPIbp6gmOfuOumceHVuF6q46RPywv_SD3alWf-nekAUh3oxjDDSq22mwE9JYHRgwjMy5aS8i/pub?output=csv';

  var CATEGORY_META = {
    'כרטיסי ביקור':       {icon:'🪪', sub:'לא כולל עריכה גרפית — מקובץ מוכן'},
    'פנקסים':             {icon:'🧾', sub:'מקור + 2 העתקים, 25 סטים בפנקס'},
    'פליירים':            {icon:'📄', sub:'A4 / A5, צד אחד או משני צדדים'},
    'גלויות (15/10 ס״מ)': {icon:'✉️', sub:'צד אחד או משני צדדים'},
    'חותמות גומי':        {icon:'🔖', sub:'לפי שטח החתמה'},
    'ועוד מגוון שירותים': {icon:'✨', sub:'לפרטים ולהצעת מחיר — צרו קשר'}
  };

  var DEFAULTS = [
    {category:'כרטיסי ביקור', items:[
      {name:'200 כרטיסים, צד אחד', price:'140 ש״ח'},
      {name:'500 כרטיסים, צד אחד', price:'220 ש״ח'},
      {name:'1000 כרטיסים, צד אחד', price:'320 ש״ח'},
      {name:'תוספת לצד שני', price:'30 ש״ח'}
    ]},
    {category:'פנקסים', items:[
      {name:'2 פנקסים', price:'124 ש״ח'},
      {name:'4 פנקסים', price:'155 ש״ח'},
      {name:'6 פנקסים', price:'185 ש״ח'},
      {name:'10 פנקסים', price:'240 ש״ח'},
      {name:'20 פנקסים', price:'390 ש״ח'},
      {name:'6 בדף, ראשון / נוסף', price:'162 / 27 ש״ח'}
    ]},
    {category:'פליירים', items:[
      {name:'100 פליירים A4, צד אחד', price:'158 ש״ח'},
      {name:'כל 100 נוספים A4', price:'72 / 108 ש״ח'},
      {name:'100 פליירים A5, צד אחד', price:'110 ש״ח'},
      {name:'כל 100 נוספים A5', price:'35 ש״ח'}
    ]},
    {category:'גלויות (15/10 ס״מ)', items:[
      {name:'100 גלויות, צד אחד', price:'120 ש״ח'},
      {name:'תוספת לצד שני', price:'10 ש״ח'},
      {name:'כל 100 נוספות', price:'35 ש״ח'}
    ]},
    {category:'חותמות גומי', items:[
      {name:'P-20 — 14/38 מ״מ', price:'70 ש״ח'},
      {name:'P-30 — 18/47 מ״מ', price:'80 ש״ח'},
      {name:'P-40 — 23/59 מ״מ', price:'100 ש״ח'}
    ]},
    {category:'ועוד מגוון שירותים', items:[
      {name:'מדבקות', price:'לפי הזמנה'},
      {name:'חוברות', price:'לפי הזמנה'},
      {name:'ספרים', price:'לפי הזמנה'},
      {name:'מעטפות', price:'לפי הזמנה'}
    ]}
  ];

  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function render(data){
    var grid = document.getElementById('servicesGrid');
    if(!grid || !data || !data.length) return;
    var html='';
    data.forEach(function(cat){
      var meta = CATEGORY_META[cat.category] || {icon:'🖨️', sub:''};
      html += '<div class="service-card glass">';
      html += '<div class="icon">'+esc(meta.icon)+'</div>';
      html += '<h3>'+esc(cat.category)+'</h3>';
      if(meta.sub) html += '<div class="sub">'+esc(meta.sub)+'</div>';
      html += '<ul>';
      cat.items.forEach(function(it){
        html += '<li><span>'+esc(it.name)+'</span><b>'+esc(it.price)+'</b></li>';
      });
      html += '</ul></div>';
    });
    grid.innerHTML = html;
  }

  function parseCSV(text){
    var rows=[],row=[],field='',inQ=false,c;
    for(var i=0;i<text.length;i++){
      c=text[i];
      if(inQ){
        if(c==='"'){ if(text[i+1]==='"'){field+='"';i++;} else inQ=false; }
        else field+=c;
      } else {
        if(c==='"') inQ=true;
        else if(c===','){ row.push(field); field=''; }
        else if(c==='\n'){ row.push(field); rows.push(row); row=[]; field=''; }
        else if(c!=='\r') field+=c;
      }
    }
    if(field.length||row.length){ row.push(field); rows.push(row); }
    return rows;
  }

  function fromCSV(text){
    var rows = parseCSV(text).filter(function(r){return r.some(function(x){return x.trim();});});
    if(rows.length<2) return [];
    var out=[],map={};
    for(var i=1;i<rows.length;i++){
      var cat=(rows[i][0]||'').trim(), item=(rows[i][1]||'').trim(), price=(rows[i][2]||'').trim();
      if(!cat||!item) continue;
      if(!map[cat]){ map[cat]={category:cat,items:[]}; out.push(map[cat]); }
      map[cat].items.push({name:item,price:price});
    }
    return out;
  }

  if(!document.getElementById('servicesGrid')) return;

  render(DEFAULTS);

  if(SHEET_CSV_URL){
    fetch(SHEET_CSV_URL,{cache:'no-store'})
      .then(function(r){ if(!r.ok) throw 0; return r.text(); })
      .then(function(t){ var d=fromCSV(t); if(d.length) render(d); })
      .catch(function(){ /* keep defaults */ });
  }
})();
