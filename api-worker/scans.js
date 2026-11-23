// Bluebird ScanBridge: coleta persistente no D1 e consulta autenticada.
// GET /api/scans: token de leitura no header Authorization: Bearer ...
// POST /api/scans: X-Scan-Token ou ?key=... (compatível com app Kotlin sem header customizado).
const MAX_BODY_BYTES = 131072;
const MAX_BATCH = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES = new Set(['BARCODE', 'QR_CODE', 'UNKNOWN']);
const VALID_SOURCES = new Set(['BLUEBIRD_INTENT', 'KEYBOARD', 'CAMERA']);
const goodDate = value => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
const text = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
function tokenEquals(given, expected) {
  if (typeof given !== 'string' || typeof expected !== 'string' || !given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
async function readBody(req) {
  const reported = Number(req.headers.get('Content-Length') || 0);
  if (reported > MAX_BODY_BYTES) return {error:'Payload excede 128 KiB', status:413};
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return {error:'Payload excede 128 KiB', status:413};
  try { return {value:JSON.parse(raw)}; } catch { return {error:'JSON inválido', status:400}; }
}
function validPayload(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b) || !text(b.device, 100) || !goodDate(b.sent_at) ||
    !Number.isInteger(b.count) || !Array.isArray(b.items) || b.items.length < 1 || b.items.length > MAX_BATCH || b.count !== b.items.length) return false;
  const ids = new Set();
  for (const item of b.items) {
    if (!item || typeof item !== 'object' || !UUID.test(item.id) || ids.has(item.id) ||
      !text(item.value, 2048) || !VALID_TYPES.has(item.type) || !VALID_SOURCES.has(item.source) || !goodDate(item.timestamp)) return false;
    ids.add(item.id);
  }
  return true;
}
export async function scanRoute(req, env, path, reply) {
  if (path !== '/api/scans') return null;
  const fail = (error, status) => reply({success:false, error}, status);
  if (!env.DB) return fail('Banco D1 não configurado', 503);
  const url = new URL(req.url);
  if (req.method === 'POST') {
    if (!env.SCAN_INGEST_TOKEN) return fail('Token de ingestão não configurado no Worker', 503);
    const incoming = req.headers.get('X-Scan-Token') || url.searchParams.get('key') || '';
    if (!tokenEquals(incoming, env.SCAN_INGEST_TOKEN)) return fail('Token de ingestão inválido', 401);
    const parsed = await readBody(req);
    if (parsed.error) return fail(parsed.error, parsed.status);
    const b = parsed.value;
    if (!validPayload(b)) return fail('Payload inválido: confira device, sent_at, count e items (máximo 200)', 400);
    const received = new Date().toISOString();
    try {
      const commands = b.items.map(item => env.DB.prepare(
        'INSERT OR IGNORE INTO scan_records (id,device,value,type,source,scanned_at,sent_at,received_at) VALUES (?,?,?,?,?,?,?,?)'
      ).bind(item.id, b.device, item.value, item.type, item.source, item.timestamp, b.sent_at, received));
      const results = await env.DB.batch(commands);
      const inserted = results.reduce((total, result) => total + (result.meta?.changes || 0), 0);
      return reply({success:true, received:b.items.length, inserted, duplicates:b.items.length-inserted}, 201);
    } catch {
      return fail('Falha ao persistir lote no banco', 500);
    }
  }
  if (req.method === 'GET') {
    if (!env.SCAN_READ_TOKEN) return fail('Token de leitura não configurado no Worker', 503);
    const auth = req.headers.get('Authorization') || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!tokenEquals(bearer, env.SCAN_READ_TOKEN)) return fail('Token de consulta inválido', 401);
    const limitRaw = Number(url.searchParams.get('limit') || 100);
    const offsetRaw = Number(url.searchParams.get('offset') || 0);
    if (!Number.isInteger(limitRaw) || limitRaw < 1 || limitRaw > 200 || !Number.isInteger(offsetRaw) || offsetRaw < 0 || offsetRaw > 1000000) {
      return fail('Paginação inválida (limit: 1–200; offset >= 0)', 400);
    }
    const type = url.searchParams.get('type') || '';
    const q = (url.searchParams.get('q') || '').trim();
    if ((type && !VALID_TYPES.has(type)) || q.length > 80) return fail('Filtro inválido', 400);
    let where = ' WHERE 1=1';
    const args = [];
    if (type) { where += ' AND type=?'; args.push(type); }
    if (q) { where += ' AND value LIKE ?'; args.push('%'+q+'%'); }
    try {
      const rows = await env.DB.prepare('SELECT id,device,value,type,source,scanned_at,sent_at,received_at FROM scan_records'+where+' ORDER BY received_at DESC, id DESC LIMIT ? OFFSET ?')
        .bind(...args, limitRaw, offsetRaw).all();
      const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM scan_records'+where).bind(...args).first();
      return reply({success:true, total:count?.total || 0, limit:limitRaw, offset:offsetRaw, items:rows.results || []}, 200);
    } catch {
      return fail('Falha ao consultar leituras', 500);
    }
  }
  return fail('Método não permitido', 405);
}
