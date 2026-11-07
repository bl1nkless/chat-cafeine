// Authentification de l'admin : mot de passe (scrypt) + cookie de session signé.
const crypto = require('crypto');
const store = require('./store');

const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'chatcafeine';
const SESSION_DAYS = 30;

function hash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function getAuth() {
  let a = store.read('auth', null);
  if (!a) {
    const salt = crypto.randomBytes(16).toString('hex');
    a = { salt, hash: hash(DEFAULT_PASSWORD, salt), secret: crypto.randomBytes(32).toString('hex'), isDefault: true };
    store.write('auth', a);
  }
  return a;
}

function checkPassword(password) {
  const a = getAuth();
  const h = Buffer.from(hash(password, a.salt), 'hex');
  const ref = Buffer.from(a.hash, 'hex');
  return h.length === ref.length && crypto.timingSafeEqual(h, ref);
}

function setPassword(password) {
  const a = getAuth();
  a.salt = crypto.randomBytes(16).toString('hex');
  a.hash = hash(password, a.salt);
  a.secret = crypto.randomBytes(32).toString('hex'); // invalide les anciennes sessions
  a.isDefault = false;
  store.write('auth', a);
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', getAuth().secret).update(body).digest('base64url');
  return body + '.' + mac;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', getAuth().secret).update(body).digest('base64url');
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

function createSession() {
  return sign({ exp: Date.now() + SESSION_DAYS * 864e5 });
}

module.exports = { getAuth, checkPassword, setPassword, createSession, verify, SESSION_DAYS, DEFAULT_PASSWORD };
