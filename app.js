let raw=[],charts={};
fetch('dados.json').then(r=>r.json()).then(d=>{raw=d;init();});
function uniq(c){return [...new Set(raw.map(x=>x[c]))].filter(Boolean)}
function init(){
[['modelo','PorscheModelSanitized'],['ano','ModelYearSanitized'],['cidade','CitySanitized'],['pay','PayMethodSanitized']].forEach(([id,col])=>{
 let s=document.getElementById(id);
 uniq(col).sort().forEach(v=>s.innerHTML+=`<option value="${v}">${v}</option>`);
 s.addEventListener('change',apply);
});
apply();
}
function apply(){
 let d=raw.filter(x=>
 (!modelo.value||x.PorscheModelSanitized==modelo.value)&&
 (!ano.value||String(x.ModelYearSanitized)==ano.value)&&
 (!cidade.value||x.CitySanitized==cidade.value)&&
 (!pay.value||x.PayMethodSanitized==pay.value));
 let rev=d.reduce((a,b)=>a+(+b.SalesPriceSanitized||0),0);
 sales.textContent=d.length;
 revenue.textContent='$'+Math.round(rev).toLocaleString();
 ticket.textContent='$'+Math.round(rev/Math.max(1,d.length)).toLocaleString();
 let m={}; d.forEach(x=>m[x.PorscheModelSanitized]=(m[x.PorscheModelSanitized]||0)+1);
 topmodel.textContent=Object.keys(m).sort((a,b)=>m[b]-m[a])[0]||'-';
 draw('modelChart','bar',m);
 let c={}; d.forEach(x=>c[x.CitySanitized]=(c[x.CitySanitized]||0)+1);
 draw('cityChart','bar',c);
 let y={}; d.forEach(x=>y[x.ModelYearSanitized]=(y[x.ModelYearSanitized]||0)+1);
 draw('yearChart','line',y);
 let topCity=Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||'N/A';
 insights.innerHTML=`<p><b>${topCity}</b> é a cidade líder em vendas.</p>
 <p>O modelo líder atual é <b>${topmodel.textContent}</b>.</p>
 <p>Use os filtros para descobrir preferências regionais e oportunidades comerciais.</p>`;
}
function draw(id,type,obj){
 if(charts[id]) charts[id].destroy();
 charts[id]=new Chart(document.getElementById(id),{
  type:type,
  data:{labels:Object.keys(obj),datasets:[{data:Object.values(obj),borderWidth:2}]},
  options:{responsive:true}
 });
}
