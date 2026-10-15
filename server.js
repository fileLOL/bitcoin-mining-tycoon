const http=require('http'),fs=require('fs'),path=require('path');
const {OAuth2Client}=require('google-auth-library');

const root=path.join(__dirname,'public'),port=Number(process.env.PORT||3000);
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID||'';
const SAVES_DIR=path.join(__dirname,'saves');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};

const client=GOOGLE_CLIENT_ID?new OAuth2Client(GOOGLE_CLIENT_ID):null;

if(!fs.existsSync(SAVES_DIR))fs.mkdirSync(SAVES_DIR,{recursive:true});

function readBody(req){return new Promise((res,rej)=>{let d='';req.on('data',c=>d+=c);req.on('end',()=>res(d));req.on('error',rej)})}

function sanitizeFilename(uid){return uid.replace(/[^a-zA-Z0-9_-]/g,'')}

function savePath(uid){return path.join(SAVES_DIR,sanitizeFilename(uid)+'.json')}

function json(res,code,obj){res.writeHead(code,{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':'*'});res.end(JSON.stringify(obj))}

async function verifyGoogleToken(idToken){
  if(!client)throw new Error('Google Auth not configured');
  const ticket=await client.verifyIdToken({idToken,audience:GOOGLE_CLIENT_ID});
  const payload=ticket.getPayload();
  return{sub:payload.sub,name:payload.name,email:payload.email,picture:payload.picture};
}

function handleStatic(req,res){
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  let p=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);
  let f=path.resolve(root,'.'+p);
  if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(b)});
}

async function handleApi(req,res){
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  const p=u.pathname;

  if(p==='/api/health'){return json(res,200,{ok:true,game:'Bitcoin Mining Tycoon',authEnabled:!!client,realBitcoinPayments:false})}

  if(p==='/api/auth/verify'&&req.method==='POST'){
    try{
      const body=JSON.parse(await readBody(req));
      if(!body.idToken)return json(res,400,{error:'Missing idToken'});
      const user=await verifyGoogleToken(body.idToken);
      return json(res,200,{user});
    }catch(e){return json(res,401,{error:'Invalid token',details:e.message})}
  }

  if(p==='/api/auth/config'){
    return json(res,200,{clientId:GOOGLE_CLIENT_ID||'',enabled:!!client});
  }

  if(p==='/api/save'&&req.method==='POST'){
    try{
      const body=JSON.parse(await readBody(req));
      if(!body.idToken||!body.data)return json(res,400,{error:'Missing idToken or data'});
      const user=await verifyGoogleToken(body.idToken);
      const fp=savePath(user.sub);
      fs.writeFileSync(fp,JSON.stringify({uid:user.sub,data:body.data,savedAt:Date.now()}),'utf8');
      return json(res,200,{ok:true,savedAt:Date.now()});
    }catch(e){return json(res,400,{error:e.message})}
  }

  if(p==='/api/load'&&req.method==='POST'){
    try{
      const body=JSON.parse(await readBody(req));
      if(!body.idToken)return json(res,400,{error:'Missing idToken'});
      const user=await verifyGoogleToken(body.idToken);
      const fp=savePath(user.sub);
      if(!fs.existsSync(fp))return json(res,200,{data:null});
      const raw=JSON.parse(fs.readFileSync(fp,'utf8'));
      return json(res,200,{data:raw.data,savedAt:raw.savedAt});
    }catch(e){return json(res,400,{error:e.message})}
  }

  if(p==='/api/delete'&&req.method==='POST'){
    try{
      const body=JSON.parse(await readBody(req));
      if(!body.idToken)return json(res,400,{error:'Missing idToken'});
      const user=await verifyGoogleToken(body.idToken);
      const fp=savePath(user.sub);
      if(fs.existsSync(fp))fs.unlinkSync(fp);
      return json(res,200,{ok:true});
    }catch(e){return json(res,400,{error:e.message})}
  }

  res.writeHead(404);res.end('Not found');
}

http.createServer(async(req,res)=>{
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(u.pathname.startsWith('/api/')){
    try{await handleApi(req,res)}catch(e){json(res,500,{error:'Internal error'})}
  }else{
    handleStatic(req,res);
  }
}).listen(port,()=>console.log(`Game running: http://localhost:${port}${client?'':'\n⚠ GOOGLE_CLIENT_ID not set — auth disabled'}`));
