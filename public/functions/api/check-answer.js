
export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const answer = String(body?.answer || '');
    const normalized = normalizeAnswer(answer);
    const digest = await sha256Hex(normalized);

    const BAD = 'b170c39af2ac7cf55b7986b05bb797016e00dc3cb371cc4921fdda0cc14d4857';
    const TRUE = '414478b7ad31533f0addd496ae07ca07b60fd9a69cf0f0bc9074a70f81828c86';

    let result = 'invalid';
    if (digest === BAD) result = 'bad';
    if (digest === TRUE) result = 'true';

    return json({ ok: true, result });
  } catch (err) {
    return json({ ok: false, result: 'error' }, 500);
  }
}

function normalizeAnswer(input) {
  let s = String(input || '').normalize('NFKC').trim().toLowerCase();
  s = katakanaToHiragana(s);
  s = s.replace(/[\s　\-－ー_・.。、,，!！?？]/g, '');
  s = s.replace(/兎/g, 'うさぎ');
  s = s.replace(/亀/g, 'かめ');
  s = s.replace(/カメ/g, 'かめ');
  s = s.replace(/山/g, 'やま');
  return s;
}

function katakanaToHiragana(str) {
  return str.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
