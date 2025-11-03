const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const app = express();
// Allow all origins for easier testing across devices (localhost, 127.0.0.1, LAN IP)
app.use(cors());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Access key pool (provided by user)
const ACCESS_KEYS = [
  'A9#D7e!B2q','Z5x@R8c$T1','M2@k#F7!nP','v8!E3$hR0z','L6q%p2@T9b','d7&N4x@K3w','Q1$mE8#t5Y','f0@C7!wV2r','n9$X3p@L5d','j4!H6@tQ1g',
  'T3#b9@W7uL','K8$e1!S4yP','o5@Z2%fR9j','R1#u8@xL4b','E6!t2#vC9q','s3@H7%pM5n','G9!w1@rK6x','y0$B4#nT8m','c7!E2%jS9r','U5@h3#pL1k',
  'N8!d4@tV2x','q9#A7!zR3m','z6@B1$pF5c','D3!x9#sM8n','l7@T4%vH2y','P0!r9#eL6b','w8@N2!kS5f','X1#d7@pC4r','h5!G3$tM9v','V2@c8#rK1n',
  'e9!H5@tL3m','j7$S2#fQ4k','L0@b8!xN9d','F3#t5@vC1y','o6!M2%hR8q','s9@J4#pT7n','Z8!k3@eW1x','D5#q9!cH2v','b7@L0$pF4m','K6!n1@tS9y',
  'T9#f2@hQ5r','c1!V8$wM3x','p4@E7#rL0k','G2!s9@tR6y','m3$H5#xC1n','R8!j2@dV9b','q5@B4#fT7y','J9!c6@rL2x','u0$N1#vS8m','n7@E3!pK5d',
  'H4#r9@tM6x','w2!F7$kQ1y','X5@b8#nL0r','d3!S6@tC9v','V1#p7@rK4y','y8!E2@hM5x','Z0@c9#tR3n','f5!J4@dL8b','T2#q7!vS9m','l9@N1$kF6x',
  'K3!w8@pH2r','g0$B5#tL7y','n4!E6@cQ9v','D9#j2!rS5x','o7@H1$pT3m','U8!f6#bL0r','y5@N4$tC2v','W3#e9!kR1x','c0!J8@pM5y','m6#T7!hL2r',
  'F9@d3!vQ8x','z2$H4#pK5n','P5!r1@tS9b','j8@L0#xV6y','G4!s2@cM9r','k7#E3!fR0x','V1@q9!hT5m','e0$B6#pL8y','D2!w4@tN7x','t9@F1#vC5r',
  'n3!K8@dS2y','X6#j0!pR4m','r5@L2$hT9b','g1!E3@kQ8x','Z7#f9!cM0r','c8@N5!tH2y','L4!r3@dP9x','w0#S8!vT6m','Q9!e1@pK7r','y2@H5#bL4x',
  'J3!t9@cM8y','n1#R2@hT5v','F8!k4@pQ0r','l7$E3#tS9y','G6@d1!rL2x','z9!B0#fM7n','T3@q5!hC8y','v4#N6@pR9b','k8!L2@dS0x','X1#t7!vM4r'
];
let keyIndex = 0;
function allocateKey(){
  const key = ACCESS_KEYS[keyIndex % ACCESS_KEYS.length];
  keyIndex += 1;
  return key;
}

function parseDate(text){
  // Return canonical date as DD-MM (month numeric), to allow matching across different formats
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const longToShort = {
    January:'Jan', February:'Feb', March:'Mar', April:'Apr', May:'May', June:'Jun', July:'Jul', August:'Aug', September:'Sep', October:'Oct', November:'Nov', December:'Dec'
  };
  function monthToMM(m){
    const short = (m.length > 3) ? (longToShort[m.charAt(0).toUpperCase()+m.slice(1).toLowerCase()] || m.slice(0,3)) : m;
    const idx = shortMonths.findIndex(s=> s.toLowerCase() === short.toLowerCase());
    return idx>=0 ? String(idx+1).padStart(2,'0') : '';
  }
  // 30 October 2025 or 30 October
  let ml = text.match(/\b(\d{1,2})\s*(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s*\d{4})?\b/i);
  if(ml){ const dd = ml[1].padStart(2,'0'); const mm = monthToMM(ml[2]); if(mm) return `${dd}-${mm}`; }
  // 30 Oct 2025 or 30 Oct (allow trailing dot like Oct.)
  let ms = text.match(/\b(\d{1,2})\s*(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)(?:\s*\d{4})?\b/i);
  if(ms){ const dd = ms[1].padStart(2,'0'); const mm = monthToMM(ms[2].replace(/\./,'')); if(mm) return `${dd}-${mm}`; }
  // 30/10/2025 or 30/10, also 30-10 formats
  let mn = text.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if(mn){ const dd = mn[1].padStart(2,'0'); const mm = mn[2].padStart(2,'0'); return `${dd}-${mm}`; }
  // Fallback: 30 10 (space-separated day month)
  let ms2 = text.match(/\b(\d{1,2})\s+(\d{1,2})\b/);
  if(ms2){ const dd = ms2[1].padStart(2,'0'); const mm = ms2[2].padStart(2,'0'); return `${dd}-${mm}`; }
  return '';
}
function parseTime(text){
  // Accept separators :, ., - and normalize to HH:MM with optional AM/PM
  const m = text.match(/\b(\d{1,2})[:\.-](\d{2})\s*(AM|PM)?\b/i);
  if(!m) return '';
  const hh = m[1].padStart(2,'0');
  const mm = m[2];
  const ap = m[3] ? m[3].toUpperCase() : '';
  return ap ? `${hh}:${mm} ${ap}` : `${hh}:${mm}`;
}
function parseAmount(text){
  // Extract amount near rupee indicators, normalize commas, support "/-" suffix
  const m1 = text.match(/(?:₹|INR|Rs\.?)[\s]*([0-9][0-9,]{2,6}(?:\.[0-9]{1,2})?)(?:\/-)?/i);
  if(m1){ return m1[1].replace(/,/g,''); }
  const m2 = text.match(/\b([0-9][0-9,]{2,6})(?:\/-)?(?:\.[0-9]{1,2})?\b/);
  if(m2){ return m2[1].replace(/,/g,''); }
  // Fallback: explicitly detect 500 when currency marker is missing
  const m3 = text.match(/\b500(?:\.00)?\b/);
  if(m3){ return '500'; }
  return '';
}
// NEW: Extract Game ID (6+ consecutive digits)
function parseGameId(text){
  const m = text.match(/\b\d{6,}\b/);
  return m ? m[0] : '';
}
function detectPaymentApp(text){
  const apps = ['PhonePe','Google Pay','GPay','Paytm','PAYTM','BHIM','UPI'];
  const t = text.toLowerCase();
  if(t.includes('phonepe')) return 'PhonePe';
  if(t.includes('google pay')||t.includes('gpay')) return 'Google Pay';
  if(t.includes('paytm')) return 'Paytm';
  if(t.includes('upi')) return 'UPI';
  return '';
}

function normalizeText(text){
  // Normalize common OCR mistakes and standardize date/time formats
  return text
    // Remove ordinal suffixes like 30th, 1st, 2nd, 3rd
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
    // Fix common OCR digit confusions when adjacent to numbers
    .replace(/(?<=\d)[Oo]/g,'0')
    .replace(/[Oo](?=\d)/g,'0')
    .replace(/(?<=\d)[Ss]/g,'5')
    .replace(/[Ss](?=\d)/g,'5')
    .replace(/(?<=\d)[Il]/g,'1')
    .replace(/[Il](?=\d)/g,'1')
    // Fix common month OCR mistakes (e.g., '0ct' -> 'Oct') and variants
    .replace(/\b0ctober\b/gi, 'October')
    .replace(/\b0ct\b/gi, 'Oct')
    .replace(/\bOcl\b/gi, 'Oct')
    .replace(/\bOet\b/gi, 'Oct')
    // Heuristic: some OCR reads "₹500" as "3500"; correct this safely
    .replace(/\b3\s*500(\.00)?\b/g, '500$1')
    // Standardize AM/PM spacing and casing
    .replace(/\b(\d{1,2}:\d{2})\s*(am|pm)\b/gi, (m, t, ap) => `${t} ${ap.toUpperCase()}`)
    .replace(/\s+pm\b/ig,' PM')
    .replace(/\s+am\b/ig,' AM')
    // Collapse excessive whitespace
    .replace(/\s+/g,' ')
    .trim();
}

async function ocrBuffer(buf){
  // Guide Tesseract to treat the image as a single block and a reasonable DPI to improve accuracy
  const { data } = await Tesseract.recognize(buf, 'eng', { logger: ()=>{}, psm: 6, user_defined_dpi: 300 });
  return data.text || '';
}
// Add optional OCR with specific options (e.g., numeric whitelist)
async function ocrBufferWithOpts(buf, opts){
  const { data } = await Tesseract.recognize(buf, 'eng', { logger: ()=>{}, ...opts });
  return data.text || '';
}

function minutesDiff(t1, t2){
  // Expect HH:MM (optional AM/PM). If AM/PM absent, compare as 24h
  function toMinutes(s){
    if(!s) return NaN;
    const m = s.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if(!m) return NaN;
    let h = parseInt(m[1],10); const min = parseInt(m[2],10);
    const ap = m[3] ? m[3].toUpperCase() : null;
    if(ap){
      if(ap==='PM' && h!==12) h += 12;
      if(ap==='AM' && h===12) h = 0;
    }
    return h*60 + min;
  }
  const a = toMinutes(t1), b = toMinutes(t2);
  if(Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.abs(a-b);
}

// --- New: extraction-only endpoint for confirmation UI ---
app.post('/api/extract', upload.fields([{name:'payment',maxCount:1},{name:'history',maxCount:1}]), async (req,res)=>{
  try{
    const payFile = req.files?.payment?.[0];
    const histFile = req.files?.history?.[0];
    if(!payFile || !histFile){
      return res.status(400).json({ ok:false, reason:'Missing images' });
    }
    const [payRaw, histRaw] = await Promise.all([ocrBuffer(payFile.buffer), ocrBuffer(histFile.buffer)]);
    const payText = normalizeText(payRaw);
    const histText = normalizeText(histRaw);

    const pay = {
      amount: parseAmount(payText),
      date: parseDate(payText),
      time: parseTime(payText),
      app: detectPaymentApp(payText)
    };
    const hist = {
      amount: parseAmount(histText),
      date: parseDate(histText),
      time: parseTime(histText),
      app: detectPaymentApp(histText)
    };

    // Second-pass OCR for missing amount/date
    const specialOpts = { psm: 7, user_defined_dpi: 300, tessedit_char_whitelist: '0123456789/-' };
    if(!pay.amount || !pay.date){
      const payRaw2 = await ocrBufferWithOpts(payFile.buffer, specialOpts);
      const payText2 = normalizeText(payRaw2);
      const amt2 = parseAmount(payText2);
      const date2 = parseDate(payText2);
      if(!pay.amount && amt2) pay.amount = amt2;
      if(!pay.date && date2) pay.date = date2;
    }
    if(!hist.amount || !hist.date){
      const histRaw2 = await ocrBufferWithOpts(histFile.buffer, specialOpts);
      const histText2 = normalizeText(histRaw2);
      const amt2 = parseAmount(histText2);
      const date2 = parseDate(histText2);
      if(!hist.amount && amt2) hist.amount = amt2;
      if(!hist.date && date2) hist.date = date2;
    }

    const histGameId = (histText.match(/\b\d{6,}\b/) || [null])[0] || '';

    return res.json({ ok:true, payment: pay, history: hist, histGameId });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, reason:'Server error during extraction' });
  }
});

app.post('/api/verify', upload.fields([{name:'payment',maxCount:1},{name:'history',maxCount:1}]), async (req,res)=>{
  try{
    const payFile = req.files?.payment?.[0];
    const histFile = req.files?.history?.[0];
    if(!payFile || !histFile){
      return res.status(400).json({ ok:false, reason:'Missing images' });
    }
    const [payRaw, histRaw] = await Promise.all([ocrBuffer(payFile.buffer), ocrBuffer(histFile.buffer)]);
    const payText = normalizeText(payRaw);
    const histText = normalizeText(histRaw);

    const pay = {
      raw: payText,
      amount: parseAmount(payText),
      date: parseDate(payText),
      time: parseTime(payText),
      app: detectPaymentApp(payText),
      success: /success/i.test(payText)
    };
    const hist = {
      raw: histText,
      amount: parseAmount(histText),
      date: parseDate(histText),
      time: parseTime(histText),
      app: detectPaymentApp(histText),
      success: /success/i.test(histText)
    };

    // Second-pass OCR for uncertain extraction (numeric whitelist for amounts/dates/IDs)
    const specialOpts = { psm: 7, user_defined_dpi: 300, tessedit_char_whitelist: '0123456789/-' };
    // Payment: if amount not 500 or date missing, try second pass
    const payAmtNum = parseFloat(pay.amount || 'NaN');
    const payAmtIs500 = !Number.isNaN(payAmtNum) && Math.abs(payAmtNum - 500) < 0.01;
    if(!payAmtIs500 || !pay.date){
      const payRaw2 = await ocrBufferWithOpts(payFile.buffer, specialOpts);
      const payText2 = normalizeText(payRaw2);
      const amt2 = parseAmount(payText2);
      const date2 = parseDate(payText2);
      if(!pay.amount && amt2) pay.amount = amt2;
      if(!pay.date && date2) pay.date = date2;
      // Merge raw for debugging visibility
      pay.raw = `${pay.raw}\n[2nd pass]\n${payText2}`.trim();
    }
    // History: if amount missing or date missing, try second pass
    const histAmtNum = parseFloat(hist.amount || 'NaN');
    const histAmtIs500 = !Number.isNaN(histAmtNum) && Math.abs(histAmtNum - 500) < 0.01;
    if(!hist.amount || !hist.date){
      const histRaw2 = await ocrBufferWithOpts(histFile.buffer, specialOpts);
      const histText2 = normalizeText(histRaw2);
      const amt2 = parseAmount(histText2);
      const date2 = parseDate(histText2);
      if(!hist.amount && amt2) hist.amount = amt2;
      if(!hist.date && date2) hist.date = date2;
      hist.raw = `${hist.raw}\n[2nd pass]\n${histText2}`.trim();
    }

    // Validation rules continue below...
    const reasons = [];
    const clientGameId = String(req.body?.gameId || '').trim();
    // Allow user overrides from confirmation UI
    const overridePayAmount = String(req.body?.overridePayAmount || '').trim();
    const overridePayDate = String(req.body?.overridePayDate || '').trim();
    const overrideHistAmount = String(req.body?.overrideHistAmount || '').trim();
    const overrideHistDate = String(req.body?.overrideHistDate || '').trim();
    const overrideHistGameId = String(req.body?.overrideHistGameId || '').trim();

    if(overridePayAmount) pay.amount = overridePayAmount;
    if(overridePayDate) pay.date = overridePayDate;
    if(overrideHistAmount) hist.amount = overrideHistAmount;
    if(overrideHistDate) hist.date = overrideHistDate;

    const histGameId = overrideHistGameId || parseGameId(histText);

    if(!clientGameId) reasons.push('Please enter your Game ID.');
    if(!histGameId) reasons.push('Game ID could not be detected in the recharge history screenshot.');
    if(clientGameId && histGameId){
      const gameIdMatch = histGameId.includes(clientGameId) || clientGameId.includes(histGameId);
      if(!gameIdMatch) reasons.push('Game ID does not match between entered value and recharge history screenshot.');
    }

    if(!(pay.app || /phonepe|paytm|google\s*pay|gpay/i.test(payText))) reasons.push('Payment screenshot is not from a supported app (PhonePe/Google Pay/Paytm).');
    if(!(hist.app || /recharge|history|record/i.test(histText))) reasons.push('Recharge history screenshot not detected.');

    // Amount validation: require payment 500; for history, only fail if detected and not 500
    const paymentIs500 = !Number.isNaN(parseFloat(pay.amount)) && Math.abs(parseFloat(pay.amount) - 500) < 0.01;
    const historyIs500 = !!hist.amount && !Number.isNaN(parseFloat(hist.amount)) && Math.abs(parseFloat(hist.amount) - 500) < 0.01;
    if(!paymentIs500) {
      reasons.push('Payment amount must be ₹500.');
    }
    if(hist.amount && !historyIs500) {
      reasons.push('Recharge history amount must be ₹500.');
    }

    // Date validation: only enforce mismatch when both dates are detected
    const haveBothDates = !!pay.date && !!hist.date;
    if(haveBothDates && pay.date !== hist.date) {
      reasons.push('Date does not match between payment and recharge history.');
    }

    // NOTE: Time comparison disabled per requirement
    // const timeDiff = minutesDiff(pay.time, hist.time);
    // if(Number.isNaN(timeDiff) || timeDiff > 2) reasons.push('Time difference is greater than 2 minutes or could not be detected.');

    if(reasons.length){
      console.log('DEBUG OCR verification failure:', { payment: pay, history: hist, clientGameId, histGameId });
      return res.json({ ok:false, reason:reasons.join(' ') , details:{ payment: pay, history: hist, clientGameId, histGameId } });
    }

    // All good
    const key = allocateKey();
    return res.json({ ok:true, key, details:{ payment: pay, history: hist } });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, reason:'Server error during verification' });
  }
});

// Simple validation endpoint for Prediction Tool access
app.get('/api/validateKey', (req, res) => {
  try {
    const key = String(req.query.key || '').trim();
    const ok = !!key && ACCESS_KEYS.includes(key);
    console.log('validateKey request', { key, ok });
    return res.json({ ok });
  } catch (err) {
    console.error('Key validation error:', err);
    return res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', ()=>{
  console.log(`Verification server running on http://localhost:${PORT}`);
});