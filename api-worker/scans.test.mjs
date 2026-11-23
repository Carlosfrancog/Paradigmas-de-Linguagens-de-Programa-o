import test from 'node:test';
import assert from 'node:assert/strict';
import {scanRoute} from './scans.js';

function database() {
  const records = new Map();
  const batches = [];
  return {
    records, batches,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            sql, args,
            async all() {
              let data = [...records.values()].sort((a,b)=>b.received_at.localeCompare(a.received_at) || b.id.localeCompare(a.id));
              if (sql.includes('type=?')) data = data.filter(r=>r.type===args[0]);
              if (sql.includes('value LIKE ?')) {
                const filter = args[sql.includes('type=?')?1:0].slice(1,-1);
                data = data.filter(r=>r.value.includes(filter));
              }
              return {results:data.slice(-0 || 0).slice(args.at(-1),args.at(-1)+args.at(-2))};
            },
            async first() {
              let data=[...records.values()];
              if (sql.includes('type=?')) data=data.filter(r=>r.type===args[0]);
              if (sql.includes('value LIKE ?')) data=data.filter(r=>r.value.includes(args[sql.includes('type=?')?1:0].slice(1,-1)));
              return {total:data.length};
            }
          };
        }
      };
    },
    async batch(statements) {
      batches.push(statements.length);
      return statements.map(s => {
        const [id,device,value,type,source,scanned_at,sent_at,received_at] = s.args;
        const changes=records.has(id)?0:1;
        if (changes) records.set(id,{id,device,value,type,source,scanned_at,sent_at,received_at});
        return {meta:{changes}};
      });
    }
  };
}
const sentAt = '2026-11-23T18:59:58.000Z';
const scan = i => ({
  id:'00000000-0000-4000-8000-'+String(i).padStart(12,'0'),
  value:'789123456'+String(i),
  type:i%2?'QR_CODE':'BARCODE',
  source:'BLUEBIRD_INTENT',
  timestamp:sentAt
});
const body = count => ({device:'EF401',sent_at:sentAt,count,items:Array.from({length:count},(_,i)=>scan(i))});
const env = () => ({DB:database(), SCAN_INGEST_TOKEN:'token-write', SCAN_READ_TOKEN:'token-read'});
async function call(environment,{method='POST',json=null,query='',headers={}}={}) {
  const url='https://unit-test.example/api/scans'+query;
  const request = new Request(url,{method,headers:{...headers,...(json?{'Content-Type':'application/json'}:{})},...(json?{body:JSON.stringify(json)}:{})});
  const response=await scanRoute(request,environment,'/api/scans',(result,status)=>new Response(JSON.stringify(result),{status}));
  return {status:response.status,data:await response.json()};
}
test('POST exige token e valida contagem antes de gravar', async ()=>{
  const e=env();
  assert.equal((await call(e,{json:body(1)})).status,401);
  assert.equal((await call(e,{json:{...body(1),count:2},query:'?key=token-write'})).status,400);
  assert.equal(e.DB.records.size,0);
});
test('POST aceita UUID, lote e reenvio idempotente',async ()=>{
  const e=env();
  const first=await call(e,{json:body(1),query:'?key=token-write'});
  assert.equal(first.status,201);assert.equal(first.data.inserted,1);
  const again=await call(e,{json:body(1),query:'?key=token-write'});
  assert.equal(again.status,201);assert.equal(again.data.duplicates,1);
  assert.equal(e.DB.records.size,1);
});
test('POST de 205 itens usa blocos D1 de 100',async ()=>{
  const e=env();
  const res=await call(e,{json:body(205),headers:{'X-Scan-Token':'token-write'}});
  assert.equal(res.status,201);
  assert.equal(res.data.received,205);
  assert.deepEqual(e.DB.batches,[100,100,5]);
  assert.equal(e.DB.records.size,205);
});
test('GET exige token separado e aplica filtro e paginação',async ()=>{
  const e=env();
  await call(e,{json:body(4),query:'?key=token-write'});
  assert.equal((await call(e,{method:'GET'})).status,401);
  const r=await call(e,{method:'GET',headers:{Authorization:'Bearer token-read'},query:'?type=QR_CODE&limit=1&offset=0'});
  assert.equal(r.status,200);
  assert.equal(r.data.total,2);
  assert.equal(r.data.items.length,1);
  assert.equal(r.data.items[0].type,'QR_CODE');
});
