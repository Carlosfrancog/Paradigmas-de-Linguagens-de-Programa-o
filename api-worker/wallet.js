const encoder=new TextEncoder();
const toHex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const hash=async text=>toHex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
async function passwordHash(pass,salt){const raw=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveBits']);return toHex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:210000},raw,256))}
function equalHex(a,b){if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
const random=()=>crypto.randomUUID()+crypto.randomUUID();
const getJson=async(req)=>{const text=await req.text();if(text.length>4096)throw Error('Payload muito grande');return JSON.parse(text)};
const problems={
 imperativo:n=>({code:`int x=${n}; x=x+3; printf("%d",x);`,question:'Qual valor será impresso?',options:[String(n),String(n+3),String(n*3)],right:String(n+3),explanation:'A atribuição x=x+3 altera o valor anterior e imprime n+3.'}),
 ponteiros:n=>({code:`int x=${n}; int *p=&x; *p+=2; printf("%d",x);`,question:'Qual valor de x?',options:[String(n+2),String(n),String(n*2)],right:String(n+2),explanation:'O ponteiro referencia x. A atribuição a *p altera a variável original.'}),
 escopo:n=>({code:`int x=${n}; { int x=${n+4}; printf("%d",x); }`,question:'Qual valor é impresso dentro do bloco?',options:[String(n),String(n+4),String(n+1)],right:String(n+4),explanation:'A declaração interna esconde o identificador externo no bloco.'}),
 tipos:n=>({code:`int v[${n}];`,question:'Qual último índice válido do vetor em C?',options:[String(n),String(n-1),'1'],right:String(n-1),explanation:'Os índices de arrays em C começam em zero e terminam em N−1.'}),
 subprogramas:n=>({code:`int dobro(int a){return a*2;} printf("%d",dobro(${n}));`,question:'Qual valor é retornado?',options:[String(n+2),String(n),String(n*2)],right:String(n*2),explanation:'A função retorna o dobro do argumento recebido.'}),
 oo:n=>({code:`class Base { int v(){return ${n};} } class Filho extends Base { int v(){return ${n+2};} } Base x = new Filho();`,question:'Qual é o resultado de x.v() com despacho dinâmico?',options:[String(n),String(n+2),'0'],right:String(n+2),explanation:'A instância real é Filho; a chamada dinâmica usa seu método sobrescrito.'}),
 sintaxe:n=>({code:`int elemento${n} = ${n};`,question:'Que token é elemento'+n+'?',options:['Identificador','Operador','Palavra reservada'],right:'Identificador',explanation:'O texto elemento'+n+' é lexema classificado como identificador.'}),
 paradigmas:n=>({code:`int x=${n}; x++;`,question:'Atribuições e alteração explícita de estado caracterizam qual paradigma?',options:['Lógico','Imperativo','Funcional puro'],right:'Imperativo',explanation:'O estilo imperativo descreve comandos e atualizações de estado.'})
};
function shuffle(a){return a.map(v=>({v,k:Math.random()})).sort((x,y)=>x.k-y.k).map(x=>x.v)}
export async function walletRoute(req,env,path,reply){
 if(!path.startsWith('/api/wallet/'))return null;
 const error=(m,status=400)=>reply({error:m},status);
 if(req.method==='GET'&&path==='/api/wallet/ranking'){
  const r=await env.DB.prepare('SELECT name, coins FROM wallets ORDER BY coins DESC, name ASC LIMIT 100').all();return reply({ranking:r.results},200)
 }
 const authorization=req.headers.get('Authorization')||'';
 let user=null;
 if(!['/api/wallet/login','/api/wallet/register'].includes(path)){
  const token=authorization.match(/^Bearer ([a-f0-9-]{50,100})$/)?.[1];if(!token)return error('Faça login para continuar.',401);
  const hashed=await hash(token);
  user=await env.DB.prepare('SELECT w.id,w.name,w.coins,w.correct FROM wallet_sessions s JOIN wallets w ON w.id=s.wallet_id WHERE s.token_hash=? AND s.expires_at>?').bind(hashed,Date.now()).first();
  if(!user)return error('Sessão inválida ou expirada.',401);
 }
 if(req.method==='GET'&&path==='/api/wallet/me')return reply(user,200);
 if(req.method!=='POST')return error('Método inválido',405);
 let b;try{b=await getJson(req)}catch{return error('JSON inválido')}
 if(path==='/api/wallet/register'||path==='/api/wallet/login'){
  const name=String(b.name||'').trim(),password=String(b.password||'');
  if(!/^[a-zA-Z0-9_-]{3,32}$/.test(name)||password.length<10||password.length>128)return error('Nome: letras, números, - ou _. Senha: 10 a 128 caracteres.');
  const ip=req.headers.get('CF-Connecting-IP')||'unknown',ipHash=await hash(ip+':plp-wallet');
  const recent=await env.DB.prepare('SELECT COUNT(*) AS attempts FROM wallet_login_logs WHERE ip_hash=? AND created_at>?').bind(ipHash,Date.now()-15*60*1000).first();
  if(recent?.attempts>=12)return error('Muitas tentativas. Tente mais tarde.',429);
  await env.DB.prepare('INSERT INTO wallet_login_logs(ip_hash,created_at) VALUES(?,?)').bind(ipHash,Date.now()).run();
  const found=await env.DB.prepare('SELECT * FROM wallets WHERE name_key=?').bind(name.toLowerCase()).first();
  if(path.endsWith('register')){
   if(found)return error('Esse nome já está em uso.',409);
   const salt=random();const passHash=await passwordHash(password,salt);
   try{await env.DB.prepare('INSERT INTO wallets(id,name,name_key,pass_salt,pass_hash,coins,correct,created_at) VALUES(?,?,?,?,?,0,0,?)').bind(crypto.randomUUID(),name,name.toLowerCase(),salt,passHash,Date.now()).run()}catch{return error('Não foi possível criar a wallet.',409)}
  }else{
   // Use same PBKDF2 cost for nonexistent accounts to reduce username probing.
   const verify=await passwordHash(password,found?.pass_salt||'nonexistent-account-salt');
   if(!found||!equalHex(verify,found.pass_hash))return error('Usuário ou senha incorretos.',401);
  }
  const wallet=await env.DB.prepare('SELECT id,name,coins FROM wallets WHERE name_key=?').bind(name.toLowerCase()).first();
  const token=random();await env.DB.prepare('INSERT INTO wallet_sessions(token_hash,wallet_id,expires_at) VALUES(?,?,?)').bind(await hash(token),wallet.id,Date.now()+7*86400000).run();
  return reply({token,name:wallet.name,coins:wallet.coins},200);
 }
 if(path==='/api/wallet/challenge'){
  const module=String(b.module||'imperativo');if(!problems[module])return error('Módulo inválido');
  const completed=await env.DB.prepare('SELECT variant FROM wallet_challenges WHERE wallet_id=? AND module=?').bind(user.id,module).all();
  const used=new Set(completed.results.map(x=>x.variant));const available=Array.from({length:110},(_,i)=>i+3).filter(n=>!used.has(n));
  if(!available.length)return error('Você concluiu todas as 110 questões online deste módulo.',409);
  const n=available[Math.floor(Math.random()*available.length)],problem=problems[module](n),options=shuffle(problem.options),correct=options.indexOf(problem.right),challengeId=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO wallet_challenges(id,wallet_id,module,variant,answer,correct_option,explanation,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(challengeId,user.id,module,n,correct,problem.right,problem.explanation,Date.now()+15*60000,Date.now()).run();
  return reply({challengeId,module,code:problem.code,question:problem.question,options},200)
 }
 if(path==='/api/wallet/answer'){
  const challengeId=String(b.challengeId||''),choice=Number(b.choice);if(!Number.isInteger(choice)||choice<0||choice>2)return error('Alternativa inválida');
  const c=await env.DB.prepare('SELECT * FROM wallet_challenges WHERE id=? AND wallet_id=?').bind(challengeId,user.id).first();if(!c)return error('Questão não encontrada.',404);
  if(c.completed_at)return error('Esta questão já foi respondida.',409);
  if(c.expires_at<Date.now())return error('Questão expirada. Avance para outra.',410);
  const correct=choice===c.answer;
  // Claim atomically exactly once. No client-supplied points accepted.
  const marked=await env.DB.prepare('UPDATE wallet_challenges SET completed_at=? WHERE id=? AND completed_at IS NULL').bind(Date.now(),c.id).run();
  if(!marked.meta?.changes)return error('Questão já respondida.',409);
  if(correct)await env.DB.prepare('UPDATE wallets SET coins=coins+5,correct=correct+1 WHERE id=?').bind(user.id).run();
  return reply({correct,correctOption:c.correct_option,explanation:c.explanation,earned:correct?5:0},200);
 }
 return error('Rota não encontrada.',404)
}
