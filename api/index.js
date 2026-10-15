const {OAuth2Client}=require('google-auth-library');
const fs=require('fs'),path=require('path');

const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID||'';
const SAVES_DIR=path.join(__dirname,'..','saves');
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

module.exports=async function handler(req,res){
  const p=req.url;

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
