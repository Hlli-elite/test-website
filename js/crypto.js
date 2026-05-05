async function deriveKeyIV(salt) {
  const mat = await crypto.subtle.importKey('raw', new TextEncoder().encode('11'), 'PBKDF2', false, ['deriveBits']);
  const d   = new Uint8Array(await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-1', salt, iterations:10 }, mat, 256));
  return { iv: d.slice(0,16), key: d.slice(16,32) };
}

async function decryptSave(buffer) {
  const b       = new Uint8Array(buffer);
  rawHeader     = b.slice(0, 44);
  rawPwdIdx     = b.slice(44, 52);
  rawSalt       = b.slice(52, 76);
  const enc     = b.slice(76);
  const { iv, key } = await deriveKeyIV(rawSalt);
  const aesKey  = await crypto.subtle.importKey('raw', key, { name:'AES-CBC' }, false, ['decrypt']);
  const dec     = new Uint8Array(await crypto.subtle.decrypt({ name:'AES-CBC', iv }, aesKey, enc));
  return JSON.parse(new TextDecoder().decode(pako.inflate(dec)));
}

async function encryptSave(obj) {
  const json       = new TextEncoder().encode(JSON.stringify(obj));
  const compressed = pako.deflate(json, { level: 6 });
  const newSalt    = crypto.getRandomValues(new Uint8Array(24));
  const { iv, key } = await deriveKeyIV(newSalt);
  const aesKey     = await crypto.subtle.importKey('raw', key, { name:'AES-CBC' }, false, ['encrypt']);
  const enc        = await crypto.subtle.encrypt({ name:'AES-CBC', iv }, aesKey, compressed);
  const out        = new Uint8Array(44 + 8 + 24 + enc.byteLength);
  out.set(rawHeader, 0); out.set(rawPwdIdx, 44); out.set(newSalt, 52);
  out.set(new Uint8Array(enc), 76);
  return out;
}
