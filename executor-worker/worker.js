/** Cloudflare Worker: controlled proxy to a sandboxed Piston installation. */
const json=(value,status=200,origin='')=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});
export default {async fetch(request,env){
 const origin=request.headers.get('Origin')||'';
 const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
 const ok=allowed.includes(origin);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...(ok?{'Access-Control-Allow-Origin':origin}:{ }),'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
 if(!ok)return json({error:'Origem não autorizada'},403);
 const url=new URL(request.url);if(url.pathname!=='/execute'||request.method!=='POST')return json({error:'Rota não encontrada'},404,origin);
 if(Number(request.headers.get('content-length')||0)>15000)return json({error:'Requisição grande demais'},413,origin);
 if(!env.PISTON_URL)return json({error:'Runner não configurado'},503,origin);
 let payload;try{payload=await request.json()}catch{return json({error:'JSON inválido'},400,origin)}
 if(payload?.language!=='c'||typeof payload.code!=='string'||payload.code.length>12000||!payload.code.trim())return json({error:'Envie código C com até 12.000 caracteres'},400,origin);
 const controller=new AbortController();const stop=setTimeout(()=>controller.abort(),9000);
 try{
  const target=env.PISTON_URL.replace(/\/$/,'')+'/api/v2/execute';
  const r=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json',...(env.PISTON_TOKEN?{'Authorization':'Bearer '+env.PISTON_TOKEN}:{})},body:JSON.stringify({language:'c',version:'*',files:[{name:'main.c',content:payload.code}],stdin:'',args:[],compile_timeout:3000,run_timeout:2000,compile_memory_limit:128000000,run_memory_limit:128000000}),signal:controller.signal});
  if(!r.ok)return json({error:'Runner indisponível ('+r.status+')'},502,origin);
  const data=await r.json();return json({compileOutput:String(data.compile?.output||'').slice(0,8000),runOutput:String(data.run?.output||'').slice(0,8000),exitCode:data.run?.code??data.compile?.code??null},200,origin);
 }catch{return json({error:'Execução excedeu o limite ou o serviço está indisponível'},504,origin)}finally{clearTimeout(stop)}
}};
