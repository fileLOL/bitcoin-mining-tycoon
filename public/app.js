(()=>{'use strict';
const WALLET_DEFAULT='bc1q6p2ugwymlzvm7mrzpy2axh8czm2h9n496082ag';

const TUTORIAL_STEPS=[
  {icon:'₿',title:'Benvingut/da a Mining Tycoon!',text:'Ets el CEO d\'una granja de mineria de Bitcoin. El teu objectiu: construir un imperi miner i guanyar la major quantitat de Bitcoin virtual possible.'},
  {icon:'▦',title:'La teva granja',text:'Al centre veuràs la graella de la teva instal·lació. Cada cel·la buida és un espai on pots construir equips. Comença amb 24 cel·les i podràs ampliar-les.'},
  {icon:'▰',title:'Construcció d\'equips',text:'Al panell "Construcció" trobaràs els equips disponibles: ASICs per minar, refrigeració per controlar la temperatura, unitats elèctriques per subministrar energia, i més. Tria un equip i clica una cel·la lliure per col·locar-lo.'},
  {icon:'ϟ',title:'Equilibri energètic',text:'Cada ASIC consumeix energia i genera calor. Necessites unitats elèctriques per donar-los potència i refrigeració per evitar sobreescalfament. Si la temperatura puja massa, l\'eficiència baixa!'},
  {icon:'⌬',title:'Recerca i expansió',text:'Inverteix en recerca per millorar tots els teus equips. Amplia les instal·lacions per tenir més espai. Cada inversió et fa més competitiu.'},
  {icon:'⚑',title:'Missions i assoliments',text:'Completa missions per guanyar recompenses extra. Desbloqueja assoliments per obtenir bonus permanents en els ingressos. Hi ha 20 assoliments per descobrir!'},
  {icon:'◈',title:'Mercat i prestigi',text:'El preu del BTC fluctua i afecta els teus ingressos. Quan arribis al nivell 15, podràs fer "Prestigi": reiniciar amb bonus permanents per créixer més ràpid.'},
  {icon:'☁',title:'Guarda al núvol',text:'La teva partida es guarda automàticament al núvol gràcies a Google Auth. Així podràs continuar jugant des de qualsevol dispositiu. Comencem!'}
];

const ITEMS={
  asic:{name:'ASIC Miner',icon:'▰',cost:1800,hash:110,power:3.2,heat:8,income:46,desc:'Alta potència de càlcul'},
  cooling:{name:'Refrigeració',icon:'❄',cost:950,cool:22,power:.5,heat:-12,income:0,desc:'Redueix la temperatura'},
  power:{name:'Unitat elèctrica',icon:'ϟ',cost:1300,grid:12,power:.3,heat:1,income:0,desc:'Aporta 12 kW de capacitat'},
  server:{name:'Servidor de gestió',icon:'▤',cost:750,xp:12,power:.4,heat:1,income:8,desc:'Automatitza la granja'},
  transformer:{name:'Transformador',icon:'⏚',cost:2200,effReduction:.15,power:.2,heat:1,income:0,desc:'Redueix consum elèctric 15%'},
  overclock:{name:'Servidor overclock',icon:'⚡',cost:3500,hashBoost:55,power:1.8,heat:15,income:0,desc:'+55 TH/s però molta calor'},
  battery:{name:'Bateria',icon:'▮',cost:1600,power:.1,heat:0,income:3,desc:'Emmagatzema energia (+₿3/min bonus)'},
  security:{name:'Servidor seguretat',icon:'⛨',cost:1100,power:.3,heat:1,income:0,desc:'Redueix efectes negatius 20%'}
};

const RESEARCH=[
  {id:'efficiency',name:'Firmware optimitzat',cost:2500,desc:'+20% ingressos dels ASICs',effect:'income',value:1.2},
  {id:'cooling2',name:'Refrigeració líquida',cost:4000,desc:'Refrigeració 50% més eficient',effect:'cool',value:1.5},
  {id:'energy',name:'Gestió energètica IA',cost:5000,desc:'Redueix cost energètic 25%',effect:'energy',value:.75},
  {id:'chips',name:'Xips nova generació',cost:9000,desc:'+35% hashrate ASICs',effect:'hash',value:1.35}
];

const EXPANSIONS=[
  {id:1,name:'Magatzem industrial',cost:7000,slots:6,desc:'Desbloqueja 6 cel·les.'},
  {id:2,name:'Centre de dades',cost:18000,slots:6,desc:'6 cel·les més.'},
  {id:3,name:'Complex de mineria',cost:42000,slots:6,desc:'Últimes 6 cel·les.'}
];

const ACHIEVEMENTS=[
  {id:'first_miner',name:'Primer miner',desc:'Col·loca el primer ASIC',icon:'⛏',bonus:1,check:s=>s.buildings.some(b=>b.type==='asic')},
  {id:'five_miners',name:'Petita granja',desc:'5 miners ASIC',icon:'▰',bonus:2,check:s=>s.buildings.filter(b=>b.type==='asic').length>=5},
  {id:'fifteen_miners',name:'Granja mitjana',desc:'15 miners ASIC',icon:'▰',bonus:3,check:s=>s.buildings.filter(b=>b.type==='asic').length>=15},
  {id:'thirty_miners',name:'Macro granja',desc:'30 miners ASIC',icon:'🏭',bonus:5,check:s=>s.buildings.filter(b=>b.type==='asic').length>=30},
  {id:'level5',name:'Directorell',desc:'Arriba al nivell 5',icon:'★',bonus:1,check:s=>s.level>=5},
  {id:'level10',name:'Magnat',desc:'Arriba al nivell 10',icon:'★★',bonus:2,check:s=>s.level>=10},
  {id:'level20',name:'Emperador',desc:'Arriba al nivell 20',icon:'★★★',bonus:5,check:s=>s.level>=20},
  {id:'first_research',name:'Investigador',desc:'Completa la primera recerca',icon:'⌬',bonus:1,check:s=>s.research.length>=1},
  {id:'all_research',name:'Científic cap',desc:'Completa totes les recerques',icon:'⌬',bonus:3,check:s=>s.research.length>=4},
  {id:'first_expansion',name:'Primera ampliació',desc:'Compra la primera expansió',icon:'▤',bonus:2,check:s=>s.expansion>=1},
  {id:'max_expansion',name:'Metròpoli',desc:'Expansió màxima',icon:'🏢',bonus:5,check:s=>s.expansion>=3},
  {id:'earn_10k',name:'Primers mil',desc:'Guanya 10.000 BTC totals',icon:'💰',bonus:2,check:s=>s.totalIncome>=10000},
  {id:'earn_100k',name:'Cent mil',desc:'Guanya 100.000 BTC totals',icon:'💎',bonus:3,check:s=>s.totalIncome>=100000},
  {id:'earn_1m',name:'Milionari',desc:'Guanya 1.000.000 BTC totals',icon:'👑',bonus:5,check:s=>s.totalIncome>=1000000},
  {id:'cool_streak',name:'Sang freda',desc:'Temp < 40°C amb 10+ miners',icon:'❄',bonus:2,check:s=>s.buildings.filter(b=>b.type==='asic').length>=10},
  {id:'full_efficiency',name:'Eficiència perfecta',desc:'100% eficiència amb 10+ miners',icon:'⚡',bonus:2,check:s=>s.buildings.filter(b=>b.type==='asic').length>=10},
  {id:'first_prestige',name:'Reenaixement',desc:'Fes el primer prestigi',icon:'◉',bonus:10,check:s=>s.prestigeCount>=1},
  {id:'three_prestige',name:'Cicle etern',desc:'Fes 3 prestigis',icon:'◉',bonus:20,check:s=>s.prestigeCount>=3},
  {id:'all_buildings',name:'Diversificat',desc:'Col·loca tots els tipus d\'edificis',icon:'▦',bonus:3,check:s=>Object.keys(ITEMS).every(k=>s.buildings.some(b=>b.type===k))},
  {id:'speed_demon',name:'Velocitat màxima',desc:'Arriba a 1000 TH/s',icon:'🚀',bonus:5,check:s=>false}
];

const PRESTIGE_SHOP=[
  {id:'p_income',name:'Ingressos +10%',desc:'+10% ingressos permanents',cost:5,type:'income',value:.1},
  {id:'p_hash',name:'Hashrate +10%',desc:'+10% hashrate permanent',cost:8,type:'hash',value:.1},
  {id:'p_energy',name:'Energia -10%',desc:'-10% consum permanent',cost:6,type:'energy',value:.1},
  {id:'p_cool',name:'Refrigeració +15%',desc:'+15% refrigeració permanent',cost:7,type:'cool',value:.15},
  {id:'p_start',name:'Capital inicial +5k',desc:'Comença amb ₿5.000 extra',cost:3,type:'startCash',value:5000},
  {id:'p_xp',name:'XP +25%',desc:'+25% XP guanyada',cost:4,type:'xp',value:.25},
  {id:'p_events',name:'Sort als events',desc:'Més events positius',cost:10,type:'luck',value:.1},
  {id:'p_missions',name:'Missions facils',desc:'Missions més fàcils i recompenses x1.5',cost:8,type:'missions',value:1.5}
];

const EVENT_TEMPLATES=[
  {id:'hash_boost',name:'Batalla de blocs!',desc:'Hashrate x2 durant 30 segons!',icon:'⚡',duration:5,type:'positive',effect:'hashMulti',value:2},
  {id:'heatwave',name:'Onada de calor!',desc:'Temperatura base +15°C durant 1 minut.',icon:'🔥',duration:10,type:'negative',effect:'tempAdd',value:15},
  {id:'bug_bounty',name:'Bug bounty!',desc:'Has trobat un error! Guanyes ₿500!',icon:'🐛',duration:0,type:'positive',effect:'cashAdd',value:500},
  {id:'power_outage',name:'Fallada elèctrica!',desc:'Un miner s\'ha desactivat 60 segons.',icon:'💥',duration:10,type:'negative',effect:'disableRandom',value:1},
  {id:'btc_pump',name:'Bitcoin pump!',desc:'Preu BTC +50% durant 1 minut!',icon:'📈',duration:10,type:'positive',effect:'priceMulti',value:1.5},
  {id:'good_rep',name:'Bona reputació!',desc:'Ingressos +100% durant 15 segons!',icon:'⭐',duration:3,type:'positive',effect:'incomeMulti',value:2},
  {id:'subsidy',name:'Subvenció energètica!',desc:'Cost elèctric zero durant 1 minut!',icon:'🏛',duration:10,type:'positive',effect:'freeEnergy',value:1},
  {id:'theft',name:'Intent de robatori!',desc:'Perds un 5% del capital.',icon:'🦹',duration:0,type:'negative',effect:'cashPercent',value:-.05},
  {id:'discovery',name:'Descobriment tecnològic!',desc:'XP x2 durant 2 minuts!',icon:'🔬',duration:20,type:'positive',effect:'xpMulti',value:2},
  {id:'viral',name:'Post viral!',desc:'Donació de ₿1000 de la comunitat!',icon:'🌐',duration:0,type:'positive',effect:'cashAdd',value:1000}
];

let state,selectedType='asic',selectedCell=null,toastTimer,activeEvents=[],marketHistory=[],currentMissionRefresh=0,lastEventTick=0,missionRefreshCooldown=0,tickStartTime=0;
let currentUser=null,authToken=null,authEnabled=false,googleClient=null,saveTimer=null;

function fresh(){return{cash:12500,totalIncome:0,totalCost:0,xp:0,level:1,slots:24,expansion:0,buildings:[],research:[],wallet:WALLET_DEFAULT,minutes:0,achievements:[],prestigeCount:0,goldCoins:0,prestigeUpgrades:[],missions:[],missionSeed:Date.now(),stats:{totalBuildingsPlaced:0,totalBuildingsSold:0,totalEvents:0,totalPrestiges:0,bestIncome:0,bestHashrate:0,playTime:0,lastSave:Date.now(),totalMissionsCompleted:0},disabledCells:[],tutorialCompleted:false}}

function localLoad(){try{const s=JSON.parse(localStorage.getItem('bmt-save'));if(s&&typeof s.cash==='number'&&Array.isArray(s.buildings)){const f=fresh();const merged={...f,...s,stats:{...f.stats,...(s.stats||{})}};merged.slots=Math.max(24,Math.min(42,s.slots||24));if(!Array.isArray(merged.achievements))merged.achievements=[];if(!Array.isArray(merged.missions))merged.missions=[];if(!Array.isArray(merged.prestigeUpgrades))merged.prestigeUpgrades=[];if(!Array.isArray(merged.disabledCells))merged.disabledCells=[];return merged}}catch(e){}return fresh()}

async function serverLoad(){
  if(!authToken)return localLoad();
  try{
    const r=await fetch('/api/load',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:authToken})});
    const d=await r.json();
    if(d.data){const s=d.data;const f=fresh();const merged={...f,...s,stats:{...f.stats,...(s.stats||{})}};merged.slots=Math.max(24,Math.min(42,s.slots||24));if(!Array.isArray(merged.achievements))merged.achievements=[];if(!Array.isArray(merged.missions))merged.missions=[];if(!Array.isArray(merged.prestigeUpgrades))merged.prestigeUpgrades=[];if(!Array.isArray(merged.disabledCells))merged.disabledCells=[];return merged}
  }catch(e){}
  return localLoad();
}

async function serverSave(){
  if(!authToken){localStorage.setItem('bmt-save',JSON.stringify(state));return}
  try{
    state.stats.lastSave=Date.now();
    $('save-status').textContent='⏳ DESANT...';
    $('save-status').classList.add('save-saving');
    await fetch('/api/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:authToken,data:state})});
    $('save-status').textContent='● DESAT AL NÚVOL';
    $('save-status').classList.remove('save-saving');
    localStorage.setItem('bmt-save',JSON.stringify(state));
  }catch(e){$('save-status').textContent='! ERROR EN DESAR';$('save-status').classList.remove('save-saving')}
}

function localSave(){try{state.stats.lastSave=Date.now();localStorage.setItem('bmt-save',JSON.stringify(state));$('save-status').textContent='● DESAT'}catch(e){$('save-status').textContent='! ERROR EN DESAR'}}

state=localLoad();

function $(id){return document.getElementById(id)}
function fmt(n){return'₿ '+Math.floor(n).toLocaleString('ca-ES')}
function notify(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800)}

function spawnFloatingNumber(amount,x,y){const el=document.createElement('div');el.className='floating-number';el.textContent=amount>0?'+₿'+Math.floor(amount):'-₿'+Math.abs(Math.floor(amount));el.style.left=x+'px';el.style.top=y+'px';el.style.color=amount>0?'#58e0d1':'#ff7777';$('particles-container').appendChild(el);setTimeout(()=>el.remove(),1500)}

function spawnParticles(count,x,y,color){for(let i=0;i<count;i++){const el=document.createElement('div');el.className='particle';el.style.left=x+'px';el.style.top=y+'px';el.style.backgroundColor=color;const angle=Math.random()*Math.PI*2;const speed=50+Math.random()*100;const dx=Math.cos(angle)*speed;const dy=Math.sin(angle)*speed;el.style.setProperty('--dx',dx+'px');el.style.setProperty('--dy',dy+'px');$('particles-container').appendChild(el);setTimeout(()=>el.remove(),800)}}

function getPrestigeBonus(type){let v=0;for(const uid of state.prestigeUpgrades){const item=PRESTIGE_SHOP.find(p=>p.id===uid);if(item&&item.type===type)v+=item.value}return v}

function calcStats(){let hash=0,power=0,grid=6,cool=0,heat=0,baseIncome=0,assets=0,rigs=0;for(const b of state.buildings){if(state.disabledCells.includes(b.slot))continue;const it=ITEMS[b.type];if(!it)continue;assets+=it.cost;if(b.type==='asic'){rigs++;hash+=it.hash;power+=it.power;heat+=it.heat;baseIncome+=it.income}else if(b.type==='cooling'){cool+=it.cool;power+=it.power;heat+=it.heat}else if(b.type==='power'){grid+=it.grid;power+=it.power}else if(b.type==='transformer'){power+=it.power;heat+=it.heat}else if(b.type==='overclock'){hash+=it.hashBoost;power+=it.power;heat+=it.heat}else if(b.type==='battery'){power+=it.power;baseIncome+=it.income}else if(b.type==='security'){power+=it.power;heat+=it.heat}}
const pr=PRESTIGE_SHOP;let r=id=>RESEARCH.find(x=>x.id===id);
if(state.research.includes('chips'))hash*=(r('chips').value+getPrestigeBonus('hash'));
if(state.research.includes('efficiency'))baseIncome*=(r('efficiency').value+getPrestigeBonus('income'));
if(state.research.includes('cooling2'))cool*=(r('cooling2').value+getPrestigeBonus('cool'));
let powerMulti=1;const transformerCount=state.buildings.filter(b=>b.type==='transformer').length;powerMulti-=transformerCount*.15;powerMulti=Math.max(.5,powerMulti);powerMulti*=(1-getPrestigeBonus('energy'));power*=powerMulti;
for(const ev of activeEvents){if(ev.effect==='hashMulti')hash*=ev.value;if(ev.effect==='tempAdd')heat+=ev.value;if(ev.effect==='incomeMulti')baseIncome*=ev.value;if(ev.effect==='priceMulti'){}}
const efficiency=power>grid?Math.max(.35,grid/power):1;let temp=Math.max(24,24+heat-cool);const thermal=temp>70?Math.max(.4,1-(temp-70)/80):1;let energyCost=power*(state.research.includes('energy')?.75:1)*.32;for(const ev of activeEvents){if(ev.effect==='freeEnergy')energyCost=0}
const securityCount=state.buildings.filter(b=>b.type==='security').length;const securityReduction=1-securityCount*.2;
const marketPrice=getMarketPrice();let income=baseIncome*efficiency*thermal*marketPrice;income*=(1+getPrestigeBonus('income'));income*=(1+state.achievements.length*.01);
return{hash:hash*efficiency,power,grid,cool,heat,temp,efficiency:efficiency*thermal,income,energyCost,net:income-energyCost,assets,rigs,occupied:state.buildings.length,securityReduction:Math.max(.2,securityReduction)}}

function getMarketPrice(){if(marketHistory.length===0)return 1;return marketHistory[marketHistory.length-1]}
function updateMarket(){const last=marketHistory.length>0?marketHistory[marketHistory.length-1]:1;const volatility=.05;const change=(Math.random()-.5)*2*volatility;let newPrice=last*(1+change);newPrice=Math.max(.3,Math.min(3,newPrice));marketHistory.push(newPrice);if(marketHistory.length>50)marketHistory.shift()}
function drawMarketChart(){const canvas=$('market-chart');if(!canvas)return;const ctx=canvas.getContext('2d');const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a1822';ctx.fillRect(0,0,w,h);
if(marketHistory.length<2)return;const min=Math.min(...marketHistory);const max=Math.max(...marketHistory);const range=max-min||1;const step=w/(marketHistory.length-1);
ctx.strokeStyle=marketHistory[marketHistory.length-1]>=marketHistory[0]?'#58e0d1':'#ff7777';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<marketHistory.length;i++){const x=i*step;const y=h-((marketHistory[i]-min)/range)*(h-20)-10;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
ctx.strokeStyle='#1a3a4a';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();ctx.setLineDash([]);
$('market-price').textContent='₿ '+marketHistory[marketHistory.length-1].toFixed(2);$('market-high').textContent='₿ '+max.toFixed(2);$('market-low').textContent='₿ '+min.toFixed(2);
const last2=marketHistory.slice(-5);const trend=last2[last2.length-1]-last2[0];$('market-trend').textContent=trend>0.05?'PUJANT':trend<-0.05?'BAIXANT':'ESTABLE';$('market-trend').className='badge'+(trend>0.05?' green':trend<-0.05?' red':'');
const volatilityRange=max-min;$('market-vol').textContent=volatilityRange>.5?'ALTA':volatilityRange>.2?'MITJA':'BAIXA'}

function generateMissions(){const pool=[
  {type:'place_miners',desc:'Col·loca {n} miners ASIC',gen:()=>{const n=3+Math.floor(Math.random()*5);return{type:'place_miners',target:n,desc:`Col·loca ${n} miners ASIC`,reward:n*200,icon:'▰'}}},
  {type:'earn_btc',desc:'Guanya ₿{n} en ingressos',gen:()=>{const n=1000+Math.floor(Math.random()*5000);return{type:'earn_btc',target:n,current:state.totalIncome,desc:`Guanya ₿${n} totals`,reward:Math.floor(n*.1),icon:'💰'}}},
  {type:'reach_hash',desc:'Arriba a {n} TH/s',gen:()=>{const n=200+Math.floor(Math.random()*800);return{type:'reach_hash',target:n,desc:`Arriba a ${n} TH/s`,reward:n*2,icon:'⚡'}}},
  {type:'reach_level',desc:'Arriba al nivell {n}',gen:()=>{const n=state.level+2+Math.floor(Math.random()*3);return{type:'reach_level',target:n,desc:`Arriba al nivell ${n}`,reward:n*300,icon:'★'}}},
  {type:'buy_research',desc:'Compra {n} recerca',gen:()=>{const n=1+Math.floor(Math.random()*2);return{type:'buy_research',target:n,desc:`Compra ${n} recerca/es`,reward:n*500,icon:'⌬'}}},
  {type:'place_cooling',desc:'Col·loca {n} refrigeracions',gen:()=>{const n=2+Math.floor(Math.random()*3);return{type:'place_cooling',target:n,desc:`Col·loca ${n} refrigeracions`,reward:n*150,icon:'❄'}}},
  {type:'reach_temp',desc:'Baixa la temperatura a {n}°C',gen:()=>{const n=25+Math.floor(Math.random()*5);return{type:'reach_temp',target:n,desc:`Baixa la temp. a ${n}°C o menys`,reward:800,icon:'🌡'}}}
];
const shuffled=pool.sort(()=>Math.random()-.5);state.missions=[];for(let i=0;i<3&&i<shuffled.length;i++){const m=shuffled[i].gen();const rewardMulti=1+getPrestigeBonus('missions');m.reward=Math.floor(m.reward*rewardMulti);m.completed=false;state.missions.push(m)}missionRefreshCooldown=30}

function checkMissions(){if(!state.missions)return;for(const m of state.missions){if(m.completed)continue;let done=false;switch(m.type){case'place_miners':done=state.buildings.filter(b=>b.type==='asic').length>=m.target;break;case'earn_btc':done=state.totalIncome>=m.target;break;case'reach_hash':const s=calcStats();done=s.hash>=m.target;break;case'reach_level':done=state.level>=m.target;break;case'buy_research':done=state.research.length>=m.target;break;case'place_cooling':done=state.buildings.filter(b=>b.type==='cooling').length>=m.target;break;case'reach_temp':const s2=calcStats();done=s2.temp<=m.target;break}
if(done){m.completed=true;state.cash+=m.reward;state.stats.totalMissionsCompleted++;notify(`Missió completada! +₿${m.reward}`);spawnParticles(15,window.innerWidth/2,window.innerHeight/2,'#ffc96a')}}}

function checkAchievements(){for(const a of ACHIEVEMENTS){if(state.achievements.includes(a.id))continue;if(a.check(state)){state.achievements.push(a.id);notify(`Assoliment: ${a.name}! (+${a.bonus}% ingressos)`);spawnParticles(20,window.innerWidth/2,window.innerHeight/2,'#58e0d1')}}}

function tryTriggerEvent(){const ticksSinceLast=state.minutes-lastEventTick;const securityReduction=calcStats().securityReduction;if(ticksSinceLast<15)return;if(Math.random()>.3)return;
lastEventTick=state.minutes;state.stats.totalEvents++;
const posEvents=EVENT_TEMPLATES.filter(e=>e.type==='positive');const negEvents=EVENT_TEMPLATES.filter(e=>e.type==='negative');const luckBonus=getPrestigeBonus('luck');const pool=Math.random()<.6+luckBonus?posEvents:negEvents;
const template=pool[Math.floor(Math.random()*pool.length)];if(template.effect==='cashPercent'&&Math.random()<securityReduction){notify('El servidor de seguretat ha bloquejat el robatori!');return}
const event={...template,ticksLeft:template.duration};activeEvents.push(event);
if(template.effect==='cashAdd'){state.cash+=template.value;event.ticksLeft=0}
if(template.effect==='disableRandom'){const asics=state.buildings.filter(b=>b.type==='asic');if(asics.length>0){const victim=asics[Math.floor(Math.random()*asics.length)];state.disabledCells.push(victim.slot);setTimeout(()=>{state.disabledCells=state.disabledCells.filter(c=>c!==victim.slot);drawGrid();render()},60000)}}
if(template.effect==='cashPercent'){const loss=Math.floor(state.cash*Math.abs(template.value)*securityReduction);state.cash-=loss;event.ticksLeft=0}
showEventModal(event)}

function showEventModal(ev){$('event-icon').textContent=ev.icon;$('event-title').textContent=ev.name;$('event-desc').textContent=ev.desc;$('event-timer').textContent=ev.duration>0?`Durada: ${ev.duration*6}s`:'Efecte instantani';$('event-modal').classList.remove('hidden')}

function drawGrid(){const grid=$('farm-grid');grid.innerHTML='';for(let i=0;i<42;i++){const cell=document.createElement('button');cell.className='cell'+(i>=state.slots?' locked':'');cell.type='button';cell.setAttribute('aria-label',`Cel·la ${i+1}`);const b=state.buildings.find(x=>x.slot===i);const isDisabled=state.disabledCells.includes(i);if(b){cell.classList.add('occupied');if(isDisabled)cell.classList.add('disabled');if(selectedCell===i)cell.classList.add('selected');const it=ITEMS[b.type];cell.innerHTML=`<span class="glow"></span><span class="glyph">${it.icon}</span><span class="cell-label">${it.name}</span>`;cell.title=it.name+' — selecciona per veure detalls'}else if(i>=state.slots){cell.classList.add('locked');cell.innerHTML='<span class="glyph">🔒</span>'}else{cell.innerHTML='<span style="font-size:17px;color:#79a59d">＋</span>';cell.title='Col·loca '+ITEMS[selectedType].name}
cell.addEventListener('click',()=>{if(i>=state.slots){notify('Desbloqueja més espai a Expansió.');return}const existing=state.buildings.find(x=>x.slot===i);if(existing){selectedCell=i;drawGrid();showSelected(existing);return}place(i)});grid.appendChild(cell)}$('occupied').textContent=`${state.buildings.length} / ${state.slots} CEL·LES OCUPADES`;$('build-count').textContent=`${state.buildings.length}/${state.slots}`}

function place(slot){const it=ITEMS[selectedType];if(state.cash<it.cost){notify('No tens prou capital virtual.');return}if(state.buildings.length>=state.slots){notify('La granja és plena: amplia les instal·lacions.');return}
state.cash-=it.cost;state.totalCost+=it.cost;state.buildings.push({slot,type:selectedType,boughtAt:Date.now()});selectedCell=slot;let xpGain=it.xp||Math.max(8,Math.round(it.cost/100));xpGain*=(1+getPrestigeBonus('xp'));state.xp+=xpGain;state.stats.totalBuildingsPlaced++;levelCheck();drawGrid();render();showSelected(state.buildings.find(x=>x.slot===slot));serverSave();notify(`${it.name} instal·lat!`);
const cellEl=document.querySelectorAll('.cell')[slot];if(cellEl){const rect=cellEl.getBoundingClientRect();spawnParticles(8,rect.left+rect.width/2,rect.top+rect.height/2,'#58e0d1')}}

function showSelected(b){const box=$('selected-card');const it=ITEMS[b.type];box.classList.remove('hidden');const refund=Math.floor(it.cost*.55);box.innerHTML=`<h3>${it.icon} ${it.name}</h3><p>${it.desc}</p><p>Cost original: ${fmt(it.cost)}</p>${it.hash?`<p>Hashrate: ${it.hash} TH/s · Consum: ${it.power} kW</p>`:''}${it.cool?`<p>Refrigeració: ${it.cool} punts</p>`:''}<button id="sell-building">Vendre per ${fmt(refund)}</button>`;$('sell-building').onclick=()=>{state.cash+=refund;state.buildings=state.buildings.filter(x=>x.slot!==b.slot);state.totalCost=Math.max(0,state.totalCost-refund);state.stats.totalBuildingsSold++;selectedCell=null;box.classList.add('hidden');drawGrid();render();serverSave();notify('Equip venut per recuperar part del capital.')}}

function renderBuild(){const root=$('build-items');root.innerHTML='';for(const[key,it]of Object.entries(ITEMS)){const el=document.createElement('button');el.className='build-item'+(selectedType===key?' chosen':'');el.innerHTML=`<span class="item-icon">${it.icon}</span><span class="item-copy"><strong>${it.name}</strong><span>${it.desc}</span></span><span class="item-cost">${fmt(it.cost)}</span>`;el.onclick=()=>{selectedType=key;renderBuild();notify(`Seleccionat: ${it.name}. Tria una cel·la lliure.`)};root.appendChild(el)}}

function renderResearch(){const root=$('research-items');root.innerHTML='';for(const r of RESEARCH){const bought=state.research.includes(r.id);const el=document.createElement('div');el.className='list-item';el.innerHTML=`<span class="item-icon">⌬</span><div class="item-copy"><strong>${r.name}</strong><div class="desc">${r.desc}</div><div class="item-cost">${fmt(r.cost)}</div></div><button ${bought||state.cash<r.cost?'disabled':''}>${bought?'INSTAL·LAT':'INVESTIR'}</button>`;el.querySelector('button').onclick=()=>{if(bought||state.cash<r.cost)return;state.cash-=r.cost;state.totalCost+=r.cost;state.research.push(r.id);state.xp+=25;levelCheck();render();serverSave();notify('Recerca completada: '+r.name)};root.appendChild(el)}}

function renderExpansion(){const root=$('expansion-items');root.innerHTML='';for(const e of EXPANSIONS){const bought=state.expansion>=e.id;const el=document.createElement('div');el.className='list-item';el.innerHTML=`<span class="item-icon">▤</span><div class="item-copy"><strong>${e.name}</strong><div class="desc">${e.desc}</div><div class="item-cost">${fmt(e.cost)}</div></div><button ${bought||state.cash<e.cost?'disabled':''}>${bought?'DESBLOQUEJAT':'AMPLIAR'}</button>`;el.querySelector('button').onclick=()=>{if(bought||state.cash<e.cost)return;state.cash-=e.cost;state.totalCost+=e.cost;state.expansion=e.id;state.slots=Math.min(42,24+e.slots*e.id);state.xp+=40;levelCheck();drawGrid();render();serverSave();notify('Nova zona desbloquejada!')};root.appendChild(el)}}

function renderAchievements(){const root=$('achievement-items');root.innerHTML='';let unlocked=0;for(const a of ACHIEVEMENTS){const done=state.achievements.includes(a.id);if(done)unlocked++;const el=document.createElement('div');el.className='achievement-item'+(done?' unlocked':'');el.innerHTML=`<span class="achievement-icon">${a.icon}</span><div class="achievement-info"><strong>${a.name}</strong><span>${a.desc}</span><span class="achievement-bonus">+${a.bonus}% ingressos</span></div><span class="achievement-status">${done?'✓':'🔒'}</span>`;root.appendChild(el)}$('ach-count').textContent=`${unlocked}/${ACHIEVEMENTS.length}`}

function renderMissions(){const root=$('mission-items');root.innerHTML='';if(!state.missions||state.missions.length===0){root.innerHTML='<p class="muted">No hi ha missions. Fes clic a "Noves missions".</p>';return}
for(const m of state.missions){let progress=0;switch(m.type){case'place_miners':progress=state.buildings.filter(b=>b.type==='asic').length/m.target;break;case'earn_btc':progress=state.totalIncome/m.target;break;case'reach_hash':progress=calcStats().hash/m.target;break;case'reach_level':progress=state.level/m.target;break;case'buy_research':progress=state.research.length/m.target;break;case'place_cooling':progress=state.buildings.filter(b=>b.type==='cooling').length/m.target;break;case'reach_temp':const t=calcStats().temp;progress=t<=m.target?1:Math.max(0,(50-t)/(50-m.target));break}
progress=Math.min(1,progress);const el=document.createElement('div');el.className='mission-item'+(m.completed?' completed':'');el.innerHTML=`<div class="mission-header"><span class="mission-icon">${m.icon}</span><span>${m.desc}</span></div><div class="mission-progress"><div class="mission-bar" style="width:${progress*100}%"></div></div><div class="mission-footer"><span>${m.completed?'COMPLETADA':'En curs...'}</span><span>₿${m.reward}</span></div>`;root.appendChild(el)}
const btn=$('refresh-missions');if(missionRefreshCooldown>0){btn.disabled=true;btn.textContent=`⟳ Disponible en ${missionRefreshCooldown*6}s`}else{btn.disabled=false;btn.textContent='⟳ Noves missions (gratis)'}}

function renderMarket(){$('btc-price').textContent='₿ '+getMarketPrice().toFixed(2);drawMarketChart()}

function renderPrestige(){const canPrestige=state.level>=15;const gain=Math.floor(Math.sqrt(state.totalIncome/1000));const totalGold=state.goldCoins+gain;$('prestige-req').textContent=state.level>=15?'✓ Nivell '+state.level:'Nivell 15 (actual: '+state.level+')';$('prestige-gold').textContent=state.goldCoins;$('prestige-gain').textContent='+'+gain;$('prestige-bonus').textContent='+'+(state.achievements.length+state.prestigeUpgrades.length*5)+'%';$('prestige-badge').textContent=state.prestigeCount;$('prestige-btn').disabled=!canPrestige;
const btn=$('prestige-btn');if(canPrestige){btn.onclick=()=>{if(!confirm(`Vols fer prestigi? Guanyaràs ${gain} Satoshis d'Or però perdràs tot el progrés excepte assoliments.`))return;doPrestige(gain)}}
const shop=$('prestige-shop');shop.innerHTML='';for(const p of PRESTIGE_SHOP){const owned=state.prestigeUpgrades.includes(p.id);const el=document.createElement('div');el.className='prestige-shop-item'+(owned?' owned':'');el.innerHTML=`<div><strong>${p.name}</strong><span>${p.desc}</span></div><button ${owned||state.goldCoins<p.cost?'disabled':''}>${owned?'✓':'⬡ '+p.cost}</button>`;if(!owned){el.querySelector('button').onclick=()=>{if(state.goldCoins<p.cost)return;state.goldCoins-=p.cost;state.prestigeUpgrades.push(p.id);renderPrestige();serverSave();notify('Millora de prestigi adquirida!')}}shop.appendChild(el)}}

function doPrestige(gain){state.goldCoins+=gain;state.prestigeCount++;state.stats.totalPrestiges++;const kept={achievements:state.achievements,goldCoins:state.goldCoins,prestigeCount:state.prestigeCount,prestigeUpgrades:state.prestigeUpgrades,stats:state.stats,missions:state.missions,missionSeed:state.missionSeed,wallet:state.wallet,tutorialCompleted:true};state=fresh();Object.assign(state,kept);state.cash=12500+getPrestigeBonus('startCash');selectedCell=null;selectedType='asic';drawGrid();render();serverSave();notify(`Prestigi! +${gain} Satoshis d'Or`);spawnParticles(30,window.innerWidth/2,window.innerHeight/2,'#ffc96a')}

function renderStats(){const root=$('stats-grid');if(!root)return;const s=calcStats();root.innerHTML=`
<div class="stat-row"><span>Temps jugat</span><b>${Math.floor(state.stats.playTime/60)} min</b></div>
<div class="stat-row"><span>BTC totals guanyats</span><b>${fmt(state.totalIncome)}</b></div>
<div class="stat-row"><span>BTC totals gastats</span><b>${fmt(state.totalCost)}</b></div>
<div class="stat-row"><span>Edificis col·locats</span><b>${state.stats.totalBuildingsPlaced}</b></div>
<div class="stat-row"><span>Edificis venuts</span><b>${state.stats.totalBuildingsSold}</b></div>
<div class="stat-row"><span>Prestigis</span><b>${state.stats.totalPrestiges}</b></div>
<div class="stat-row"><span>Millor ingrés/min</span><b>${fmt(state.stats.bestIncome)}</b></div>
<div class="stat-row"><span>Millor hashrate</span><b>${Math.floor(state.stats.bestHashrate)} TH/s</b></div>
<div class="stat-row"><span>Esdeveniments</span><b>${state.stats.totalEvents}</b></div>
<div class="stat-row"><span>Missions completades</span><b>${state.stats.totalMissionsCompleted}</b></div>
<div class="stat-row"><span>Assoliments</span><b>${state.achievements.length}/${ACHIEVEMENTS.length}</b></div>
<div class="stat-row"><span>Satoshis d'Or</span><b>${state.goldCoins}</b></div>`}

function levelCheck(){while(state.xp>=state.level*100)state.level++}

function render(){const s=calcStats();$('cash').textContent=fmt(state.cash);$('income').textContent=fmt(Math.max(0,s.net));$('hashrate').textContent=s.hash.toLocaleString('ca-ES',{maximumFractionDigits:1})+' TH/s';$('power').textContent=s.power.toLocaleString('ca-ES',{maximumFractionDigits:1})+' kW';$('prod').innerHTML=s.hash.toLocaleString('ca-ES',{maximumFractionDigits:2})+' <small>TH/s</small>';$('energy').innerHTML=s.power.toLocaleString('ca-ES',{maximumFractionDigits:1})+' <small>kW</small>';$('energy-cost').textContent='Cost: '+fmt(s.energyCost)+' / min';$('temp').innerHTML=Math.round(s.temp)+'° <small>C</small>';$('cooling-status').textContent=s.temp>70?'⚠ Temperatura crítica!':s.cool>0?'Refrigeració activa':'Sense refrigeració dedicada';$('efficiency').textContent='EFICIÈNCIA '+Math.round(s.efficiency*100)+'%';$('total-income').textContent=fmt(state.totalIncome);$('total-cost').textContent=fmt(state.totalCost);$('net-income').textContent=fmt(s.net);$('asset-value').textContent=fmt(s.assets);$('level').textContent=state.level;const xpNow=state.xp-(state.level-1)*100;$('xp-label').textContent=`${xpNow} / ${state.level*100} XP`;$('xp-bar').style.width=Math.min(100,xpNow/(state.level*100)*100)+'%';$('level-hint').textContent=state.level===1?'Construeix la teva primera granja.':state.level<4?'El teu negoci creix. Continua optimitzant.':state.level<10?'Ets una referència de la mineria industrial.':'Preparat per al prestigi?';$('scene-title').textContent=state.expansion>=3?'Complex de mineria':state.expansion===2?'Centre de dades':state.expansion===1?'Magatzem industrial':'Garatge miner';$('scene-subtitle').textContent=`${s.rigs} ASICs · ${state.buildings.length} equips · ${state.research.length} recerques · ${state.achievements.length} assoliments`;
if(s.net>state.stats.bestIncome)state.stats.bestIncome=s.net;if(s.hash>state.stats.bestHashrate)state.stats.bestHashrate=s.hash;
if(state.prestigeCount>0){$('badge-prestige').style.display='inline-flex';$('prestige-count-badge').textContent=state.prestigeCount}
renderBuild();renderResearch();renderExpansion();renderAchievements();renderMissions();renderMarket();renderPrestige();renderStats()}

function tick(){tickStartTime=Date.now();const s=calcStats();const earned=Math.max(0,s.net);if(earned>0){state.cash+=earned;state.totalIncome+=s.income;state.totalCost+=s.energyCost}
state.minutes++;state.stats.playTime++;
activeEvents=activeEvents.filter(e=>{e.ticksLeft--;return e.ticksLeft>0});
if(state.minutes%10===0)updateMarket();
tryTriggerEvent();checkAchievements();checkMissions();
if(missionRefreshCooldown>0&&state.minutes%5===0)missionRefreshCooldown--;
if(!state.missions||state.missions.length===0)generateMissions();
if(state.minutes%30===0&&state.missions&&state.missions.every(m=>m.completed))generateMissions();
if(state.minutes%5===0)serverSave();render()}

function animateTickBar(){const elapsed=Date.now()-tickStartTime;const progress=Math.min(100,(elapsed/6000)*100);const fill=$('tick-bar-fill');if(fill)fill.style.width=progress+'%';requestAnimationFrame(animateTickBar)}

function showTutorial(){
  const overlay=$('tutorial-overlay');
  overlay.classList.remove('hidden');
  let step=0;
  function showStep(){
    const s=TUTORIAL_STEPS[step];
    $('tutorial-icon').textContent=s.icon;
    $('tutorial-title').textContent=s.title;
    $('tutorial-text').textContent=s.text;
    const prog=$('tutorial-progress');
    prog.innerHTML='';
    for(let i=0;i<TUTORIAL_STEPS.length;i++){
      const dot=document.createElement('div');
      dot.className='tutorial-progress-dot'+(i===step?' active':i<step?' done':'');
      prog.appendChild(dot);
    }
    $('tutorial-next').textContent=step===TUTORIAL_STEPS.length-1?'COMENÇAR!':'Següent';
  }
  showStep();
  $('tutorial-next').onclick=()=>{
    step++;
    if(step>=TUTORIAL_STEPS.length){
      overlay.classList.add('hidden');
      state.tutorialCompleted=true;
      serverSave();
      return;
    }
    showStep();
  };
  $('tutorial-skip').onclick=()=>{
    overlay.classList.add('hidden');
    state.tutorialCompleted=true;
    serverSave();
  };
}

async function initAuth(){
  try{
    const r=await fetch('/api/auth/config');
    const cfg=await r.json();
    authEnabled=cfg.enabled&&!!cfg.clientId;
  }catch(e){authEnabled=false}

  if(!authEnabled){
    $('auth-overlay').classList.add('hidden');
    $('save-status').textContent='● DESAT (LOCAL)';
    return;
  }

  google.accounts.id.initialize({
    client_id:googleClient,
    callback:handleGoogleCallback
  });

  google.accounts.id.renderButton($('auth-google-btn'),{
    theme:'filled_blue',
    size:'large',
    shape:'pill',
    text:'signin_with',
    width:280
  });
}

async function handleGoogleCallback(response){
  authToken=response.credential;
  try{
    const r=await fetch('/api/auth/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:authToken})});
    const d=await r.json();
    if(d.error){notify('Error d\'autenticació: '+d.error);return}
    currentUser=d.user;
    $('auth-overlay').classList.add('hidden');
    $('user-info').style.display='flex';
    $('user-name').textContent=currentUser.name||'Jugador';
    $('user-avatar').src=currentUser.picture||'';
    $('logout-btn').style.display='inline-block';
    $('save-status').textContent='● DESAT AL NÚVOL';
    state=await serverLoad();
    if(state.stats.lastSave&&state.stats.lastSave>0){
      const elapsed=Date.now()-state.stats.lastSave;
      const offlineMin=Math.min(120,Math.floor(elapsed/6000));
      if(offlineMin>0){
        const s=calcStats();
        const earned=Math.max(0,s.net)*offlineMin*.5;
        if(earned>0){state.cash+=earned;state.totalIncome+=earned;setTimeout(()=>notify(`Mentre eres fora (${offlineMin} min): +₿${Math.floor(earned)}`),1000)}
      }
    }
    if(!state.tutorialCompleted){
      setTimeout(showTutorial,800);
    }
    drawGrid();render();
  }catch(e){notify('Error connectant amb el servidor.')}
}

function handleLogout(){
  currentUser=null;
  authToken=null;
  $('user-info').style.display='none';
  $('logout-btn').style.display='none';
  $('auth-overlay').classList.remove('hidden');
  $('save-status').textContent='● NO CONNECTAT';
  if(typeof google!=='undefined'&&google.accounts)google.accounts.id.disableAutoSelect();
}

$('event-close').onclick=()=>$('event-modal').classList.add('hidden');

document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id==='panel-'+btn.dataset.panel))}));

$('save-wallet').onclick=()=>{const val=$('wallet-address').value.trim();if(!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/.test(val)){notify("L'adreça no té un format reconegut.");return}state.wallet=val;serverSave();notify('Adreça desada.')};$('copy-wallet').onclick=async()=>{try{await navigator.clipboard.writeText($('wallet-address').value);notify('Adreça copiada.')}catch(e){$('wallet-address').select();notify('Selecciona i copia manualment.')}};

$('refresh-missions').onclick=()=>{if(missionRefreshCooldown>0)return;generateMissions();renderMissions();notify('Noves missions disponibles!')};

$('reset').onclick=()=>{if(confirm('Vols reiniciar tota la partida? Aquesta acció esborrarà TOT el progrés.')){
  if(authToken){fetch('/api/delete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:authToken})})}
  localStorage.removeItem('bmt-save');state=fresh();selectedCell=null;selectedType='asic';activeEvents=[];marketHistory=[];$('wallet-address').value=WALLET_DEFAULT;serverSave();drawGrid();render();$('selected-card').classList.add('hidden');notify('Partida reiniciada.')}};

$('logout-btn').onclick=handleLogout;

$('wallet-address').value=state.wallet||WALLET_DEFAULT;
if(!marketHistory.length){for(let i=0;i<20;i++)updateMarket()}
drawGrid();render();

async function startGame(){
  await initAuth();
  if(!authEnabled){
    $('save-status').textContent='● DESAT (LOCAL)';
    if(!state.tutorialCompleted){setTimeout(showTutorial,800)}
    if(state.stats.lastSave){const elapsed=Date.now()-state.stats.lastSave;const offlineMin=Math.min(120,Math.floor(elapsed/6000));if(offlineMin>0){const s=calcStats();const earned=Math.max(0,s.net)*offlineMin*.5;if(earned>0){state.cash+=earned;state.totalIncome+=earned;setTimeout(()=>notify(`Mentre eres fora (${offlineMin} min): +₿${Math.floor(earned)}`),1000)}}}
  }
  setInterval(tick,6000);
  animateTickBar();
  window.addEventListener('beforeunload',()=>{if(authToken)serverSave();else localSave()});
}

startGame();
})();
