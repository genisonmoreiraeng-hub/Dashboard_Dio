
let raw=[], modelChart, cityChart, yearChart;

fetch('dados.json').then(r=>r.json()).then(data=>{
 raw=data;
 fillFilters();
 applyFilters();
});

function unique(col){return [...new Set(raw.map(x=>x[col]))].filter(Boolean);}

function fill(id,col){
 const s=document.getElementById(id);
 unique(col).sort().forEach(v=>{
  const o=document.createElement('option');
  o.value=v;o.textContent=v;s.appendChild(o);
 });
}

function fillFilters(){
 fill('modelo','PorscheModelSanitized');
 fill('ano','ModelYearSanitized');
 fill('cidade','CitySanitized');
 fill('pay','PayMethodSanitized');
 ['modelo','ano','cidade','pay'].forEach(id=>document.getElementById(id).addEventListener('change',applyFilters));
}

function applyFilters(){
 const f={
 modelo:document.getElementById('modelo').value,
 ano:document.getElementById('ano').value,
 cidade:document.getElementById('cidade').value,
 pay:document.getElementById('pay').value
 };
 const d=raw.filter(x=>
 (!f.modelo||x.PorscheModelSanitized==f.modelo)&&
 (!f.ano||String(x.ModelYearSanitized)==f.ano)&&
 (!f.cidade||x.CitySanitized==f.cidade)&&
 (!f.pay||x.PayMethodSanitized==f.pay)
 );
 updateKPIs(d); updateCharts(d); updateInsights(d);
}

function updateKPIs(d){
 document.getElementById('sales').textContent=d.length;
 const rev=d.reduce((a,b)=>a+(+b.SalesPriceSanitized||0),0);
 document.getElementById('revenue').textContent='$'+Math.round(rev).toLocaleString();
 document.getElementById('ticket').textContent='$'+Math.round(rev/Math.max(d.length,1)).toLocaleString();
 const counts={}; d.forEach(x=>counts[x.PorscheModelSanitized]=(counts[x.PorscheModelSanitized]||0)+1);
 document.getElementById('topmodel').textContent=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||'-';
}

function groupCount(d,col){const o={}; d.forEach(x=>o[x[col]]=(o[x[col]]||0)+1); return o;}

function renderChart(inst,id,type,obj){
 if(inst) inst.destroy();
 return new Chart(document.getElementById(id),{type,data:{labels:Object.keys(obj),datasets:[{data:Object.values(obj)}]}});
}

function updateCharts(d){
 modelChart=renderChart(modelChart,'modelChart','bar',groupCount(d,'PorscheModelSanitized'));
 cityChart=renderChart(cityChart,'cityChart','bar',groupCount(d,'CitySanitized'));
 yearChart=renderChart(yearChart,'yearChart','line',groupCount(d,'ModelYearSanitized'));
}

function updateInsights(d){
 const cities=groupCount(d,'CitySanitized');
 const top=Object.keys(cities).sort((a,b)=>cities[b]-cities[a])[0]||'N/A';
 document.getElementById('insights').innerHTML=
 `<div>A cidade com maior volume de vendas é <b>${top}</b>.</div>
 <div>Os modelos mais vendidos refletem a preferência local dos clientes premium.</div>
 <div>Use os filtros para identificar oportunidades regionais de expansão.</div>`;
}
