/** Cloudflare Worker + D1; public, no secret in client. Scores and public feedback only. */
const headers=(origin,allowed)=>({'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
const json=(value,status,origin,allowed)=>new Response(JSON.stringify(value),{status,headers:headers(origin,allowed)});
const limited=(s,max)=>String(s??'').trim().slice(0,max).replace(/[\u0000-\u001f\u007f]/g,'');
export default {async fetch(req,env){
 const origin=req.headers.get('Origin')||'';
 const allowedOrigins=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
 const cors=allowedOrigins.includes(origin)?origin:allowedOrigins[0]||'null';
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin,cors)});
 if(origin&&!allowedOrigins.includes(origin))return json({error:'Origem não permitida'},403,origin,cors);
 const path=new URL(req.url).pathname;
 if(path==='/api/health'&&req.method==='GET')return json({ok:true},200,origin,cors);
 if(path==='/api/data'&&req.method==='GET'){
  const [scores,feedback,stats]=await Promise.all([
   env.DB.prepare('SELECT name, score, date FROM attempts ORDER BY created_at DESC LIMIT 30').all(),
   env.DB.prepare('SELECT name, rating, comment, date FROM feedback WHERE visible=1 ORDER BY created_at DESC LIMIT 20').all(),
   env.DB.prepare('SELECT (SELECT count(*) FROM attempts) AS totalAttempts, (SELECT count(*) FROM feedback WHERE visible=1) AS totalFeedback').first()]);
  return json({attempts:scores.results,feedback:feedback.results,stats},200,origin,cors);
 }
 if(req.method!=='POST'||!['/api/attempts','/api/feedback'].includes(path))return json({error:'Não encontrado'},404,origin,cors);
 if(Number(req.headers.get('Content-Length')||0)>4096)return json({error:'Payload grande demais'},413,origin,cors);
 let body;try{body=await req.json()}catch{return json({error:'JSON inválido'},400,origin,cors)}
 const name=limited(body.name||'Anônimo',40)||'Anônimo';
 if(path==='/api/attempts'){
  const id=limited(body.id,100),score=Number(body.score),date=limited(body.date,40);
  if(!/^[a-zA-Z0-9-]{10,100}$/.test(id)||!Number.isInteger(score)||score<0||score>10||!Number.isFinite(Date.parse(date)))return json({error:'Tentativa inválida'},400,origin,cors);
  await env.DB.prepare('INSERT OR IGNORE INTO attempts (id, name, score, date, created_at) VALUES (?,?,?,?,?)').bind(id,name,score,date,new Date().toISOString()).run();
  return json({ok:true},201,origin,cors);
 }
 const rating=Number(body.rating),comment=limited(body.comment,500);
 if(!Number.isInteger(rating)||rating<1||rating>5)return json({error:'Nota inválida'},400,origin,cors);
 await env.DB.prepare('INSERT INTO feedback (name, rating, comment, date, created_at, visible) VALUES (?,?,?,?,?,0)').bind(name,rating,comment,new Date().toISOString(),new Date().toISOString()).run();
 return json({ok:true,moderation:'pending'},201,origin,cors);
}};
