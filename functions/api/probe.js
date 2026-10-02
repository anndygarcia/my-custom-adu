export async function onRequestGet() {
  return new Response(JSON.stringify({
    ok: true,
    has_resend: !!(typeof globalThis !== 'undefined'),
    note: 'just a marker'
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}
