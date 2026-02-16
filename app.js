
/**
 * Elvis Hot Seat (PWA) – DE/EN, endless seeded questions, lifelines, showmaster TTS.
 * No external libs; ready for GitHub Pages / Netlify.
 */

// ---------- Utilities ----------

// ---------- Storage / Highscores ----------
const STORAGE_KEYS = {
  playerName: "ehs_player_name_v1",
  highscores: "ehs_highscores_v1"
};

function loadPlayerName(){
  try{
    return localStorage.getItem(STORAGE_KEYS.playerName) || "";
  }catch(e){ return ""; }
}
function savePlayerName(name){
  try{
    localStorage.setItem(STORAGE_KEYS.playerName, name);
  }catch(e){}
}
function loadHighscores(){
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.highscores);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}
function saveHighscores(arr){
  try{
    localStorage.setItem(STORAGE_KEYS.highscores, JSON.stringify(arr));
  }catch(e){}
}
function formatMoney(n){
  // display like 12.5K, 1M, etc.
  if (n >= 1_000_000) return (n/1_000_000).toFixed(n%1_000_000===0?0:1) + "M";
  if (n >= 1_000) return (n/1_000).toFixed(n%1_000===0?0:1) + "K";
  return String(n);
}


const $ = (sel) => document.querySelector(sel);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(rng, n) { return Math.floor(rng() * n); }
function choice(rng, arr) { return arr[randInt(rng, arr.length)]; }
function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function clamp(x, lo, hi){ return Math.max(lo, Math.min(hi, x)); }

// ---------- Bilingual text ----------
function t(lang, de, en) {
  if (lang === "de") return de;
  if (lang === "en") return en;
  // bilingual
  return `${de}\n\n${en}`;
}


// ---------- Sample DB (expandable) ----------
const defaultDB = {
  studios: [
    { id:"sun_memphis", name:"Sun Studio", city:"Memphis" },
    { id:"american_sound", name:"American Sound Studio", city:"Memphis" },
    { id:"rca_nashville", name:"RCA Victor (Nashville)", city:"Nashville" },
    { id:"rca_studio_b", name:"RCA Studio B", city:"Nashville" },
    { id:"radio_recorders", name:"Radio Recorders", city:"Hollywood" },
    { id:"western_recorders", name:"Western Recorders", city:"Hollywood" },
    { id:"rca_hollywood", name:"RCA (Hollywood)", city:"Hollywood" },
  ],
  people: [
    { id:"chips_moman", name:"Chips Moman", roles:["producer"] },
    { id:"mark_james", name:"Mark James", roles:["songwriter"] },
    { id:"mac_davis", name:"Mac Davis", roles:["songwriter"] },
    { id:"billy_strange", name:"Billy Strange", roles:["songwriter"] },
    { id:"dennis_linde", name:"Dennis Linde", roles:["songwriter"] },
    { id:"walter_earl_brown", name:"W. Earl Brown", roles:["songwriter"] },
    { id:"lou_handman", name:"Lou Handman", roles:["songwriter"] },
    { id:"roy_turk", name:"Roy Turk", roles:["songwriter"] },
    { id:"mae_boren_axton", name:"Mae Boren Axton", roles:["songwriter"] },
    { id:"tommy_durden", name:"Tommy Durden", roles:["songwriter"] },
    { id:"arthur_crudup", name:"Arthur Crudup", roles:["songwriter"] },
    { id:"leiber_stoller", name:"Jerry Leiber & Mike Stoller", roles:["songwriter"] },
    { id:"eddie_rabbitt", name:"Eddie Rabbitt", roles:["songwriter"] },
    { id:"dick_heard", name:"Dick Heard", roles:["songwriter"] },
  ],
  films: [
    { id:"film_jailhouse_rock", title:"Jailhouse Rock", year:1957 },
    { id:"film_live_a_little", title:"Live a Little, Love a Little", year:1968 },
  ],
  songs: [
    { id:"thats_all_right", title:"That's All Right", recordingDate:"1954-07-05", studioId:"sun_memphis", writers:["arthur_crudup"], singleReleased:"1954-07-19", bSide:"Blue Moon of Kentucky" },
    { id:"heartbreak_hotel", title:"Heartbreak Hotel", recordingDate:"1956-01-10", studioId:"rca_nashville", writers:["mae_boren_axton","tommy_durden"], singleReleased:"1956-01-27", bSide:"I Was the One" },
    { id:"jailhouse_rock", title:"Jailhouse Rock", recordingDate:"1957-04-30", studioId:"radio_recorders", writers:["leiber_stoller"], filmId:"film_jailhouse_rock" },
    { id:"are_you_lonesome_tonight", title:"Are You Lonesome Tonight?", recordingDate:"1960-04-04", studioId:"rca_studio_b", writers:["lou_handman","roy_turk"], singleReleased:"1960-11-01", bSide:"I Gotta Know" },
    { id:"a_little_less_conversation", title:"A Little Less Conversation", recordingDate:"1968-03-07", studioId:"western_recorders", writers:["mac_davis","billy_strange"], singleReleased:"1968-09-03", filmId:"film_live_a_little" },
    { id:"if_i_can_dream", title:"If I Can Dream", recordingDate:"1968-06-23", studioId:"western_recorders", writers:["walter_earl_brown"] },
    { id:"in_the_ghetto", title:"In the Ghetto", recordingDate:"1969-01-20", studioId:"american_sound", writers:["mac_davis"], producerId:"chips_moman", singleReleased:"1969-04-14", bSide:"Any Day Now" },
    { id:"suspicious_minds", title:"Suspicious Minds", recordingDate:"1969-01-22", studioId:"american_sound", writers:["mark_james"], producerId:"chips_moman" },
    { id:"kentucky_rain", title:"Kentucky Rain", recordingDate:"1969-02-19", studioId:"american_sound", writers:["eddie_rabbitt","dick_heard"], producerId:"chips_moman", singleReleased:"1970-01-29", bSide:"My Little Friend" },
    { id:"burning_love", title:"Burning Love", recordingDate:"1972-03-28", studioId:"rca_hollywood", writers:["dennis_linde"], singleReleased:"1972-08-01", bSide:"It's a Matter of Time" },
  ]
};

let DB = defaultDB;
const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
let STUDIO = byId(DB.studios);
let PERSON = byId(DB.people);
let FILM = byId(DB.films);

function setDB(db){
  DB = db;
  STUDIO = byId(DB.studios);
  PERSON = byId(DB.people);
  FILM = byId(DB.films);
}

async function loadDB(){
  // Load external JSON if present (recommended for easy editing)
  try{
    const res = await fetch("./elvis-db.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const db = await res.json();
    if (!db || !db.songs || !db.studios) throw new Error("Invalid DB");
    setDB(db);
    console.log("Loaded elvis-db.json");
  }catch(e){
    // fallback to embedded defaultDB
    setDB(defaultDB);
    console.log("Using embedded defaultDB", e);
  }
}

// ---------- Phrase banks ----------
const Phrase = {
  intro: [
    {de:"Okay, Hardcore-Runde.", en:"Alright, hardcore round."},
    {de:"Kein Warm-up. Direkt rein.", en:"No warm-up. Straight in."},
    {de:"Nur echte Fans kommen hier weiter.", en:"Only real fans survive this."},
    {de:"Ich bin gnadenlos heute.", en:"I'm ruthless today."},
  ],
  correct: [
    {de:"Sauber. Das sitzt.", en:"Clean. That's correct."},
    {de:"Richtig — du kennst deine Sessions.", en:"Correct — you know your sessions."},
    {de:"Respekt. Das war tief im Kanon.", en:"Respect. That's deep canon."},
  ],
  wrong: [
    {de:"Nein. Das war eine Falle.", en:"Nope. That was a trap."},
    {de:"Knapp daneben — aber nein.", en:"Close, but no."},
    {de:"Autsch. Das tut weh.", en:"Ouch. That hurts."},
  ],
  next: [
    {de:"Nächste Frage. Noch härter.", en:"Next question. Even harder."},
    {de:"Weiter. Keine Gnade.", en:"Continue. No mercy."},
  ],
};

// ---------- TTS (Web Speech API) ----------
let ttsUnlocked = false;
function speak(text, lang){
  // iOS: requires user gesture at least once
  try{
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const want = (lang === "en") ? "en" : "de";
    const voices = speechSynthesis.getVoices?.() || [];
    const v = voices.find(v => v.lang?.toLowerCase().startsWith(want)) || voices[0];
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 0.92;

    $("#avatarState").textContent = "speaking…";
    $("#avatarIcon").textContent = "🎙️";

    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    u.onend = () => {
      $("#avatarState").textContent = "ready";
      $("#avatarIcon").textContent = "🎤";
    };
  }catch(e){}
}

// ---------- Endless Question Generator ----------
const Recipes = {
  studioForSong(state, rng){
    const song = choice(rng, DB.songs);
    const studio = STUDIO[song.studioId];
    const correct = `${studio.name} — ${studio.city}`;
    const wrongs = shuffle(rng, DB.studios.filter(s => s.id !== song.studioId).map(s => `${s.name} — ${s.city}`)).slice(0,3);
    const prompt = t(state.lang,
      `Bei welchem Studio wurde „${song.title}“ aufgenommen?`,
      `Which studio was used to record “${song.title}”?`
    );
    const explanation = t(state.lang,
      `Im Datensatz ist „${song.title}“ mit ${correct} verknüpft.`,
      `In this dataset, “${song.title}” is linked to ${correct}.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["studio","session"]);
  },
  recordingDate(state, rng){
    const song = choice(rng, DB.songs.filter(s => s.recordingDate));
    const correct = song.recordingDate;
    const wrongs = plausibleWrongDates(correct, rng);
    const prompt = t(state.lang,
      `An welchem Datum wurde „${song.title}“ aufgenommen? (YYYY-MM-DD)`,
      `On what date was “${song.title}” recorded? (YYYY-MM-DD)`
    );
    const explanation = t(state.lang,
      `Im Datensatz steht ${correct} als Aufnahmedatum.`,
      `The dataset stores ${correct} as the recording date.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["date","session"]);
  },
  songwriter(state, rng){
    const song = choice(rng, DB.songs.filter(s => (s.writers||[]).length));
    const writers = song.writers.map(id => (PERSON[id]?.name || id)).join(" / ");
    const correct = writers;
    const songwriterPool = DB.people.filter(p => p.roles.includes("songwriter")).map(p => p.name);
    function randomCombo(){
      const count = (rng() < 0.55) ? 1 : 2;
      return shuffle(rng, songwriterPool).slice(0,count).join(" / ");
    }
    const wrongSet = new Set();
    while (wrongSet.size < 3){
      const c = randomCombo();
      if (c !== correct) wrongSet.add(c);
    }
    const prompt = t(state.lang,
      `Wer wird als Songwriter für „${song.title}“ geführt?`,
      `Who is credited as songwriter for “${song.title}”?`
    );
    const explanation = t(state.lang,
      `Writer-Credits im Datensatz: ${correct}.`,
      `Dataset writer credits: ${correct}.`
    );
    return assemble(prompt, correct, [...wrongSet], explanation, state, ["songwriter"]);
  },
  filmAssociation(state, rng){
    // pick song with film association; otherwise fallback to studio-city
    const candidates = DB.songs.filter(s => s.filmId && FILM[s.filmId]);
    if (!candidates.length) return Recipes.studioCityMatch(state, rng);
    const song = choice(rng, candidates);
    const film = FILM[song.filmId];
    const correct = `${film.title} (${film.year})`;
    const filmWrongs = shuffle(rng, DB.films.filter(f => f.id !== film.id).map(f => `${f.title} (${f.year})`)).slice(0,3);
    const filler = ["King Creole (1958)","Viva Las Vegas (1964)","Blue Hawaii (1961)","Girl Happy (1965)"];
    const wrongs = padToThree(filmWrongs, filler, correct, rng);
    const prompt = t(state.lang,
      `In welchem Film taucht „${song.title}“ (Original-Kontext) auf?`,
      `In which film did “${song.title}” appear in its original context?`
    );
    const explanation = t(state.lang,
      `Dieser Track ist im Datensatz mit „${film.title}“ verknüpft.`,
      `This track is linked in the dataset to “${film.title}”.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["film","soundtrack"]);
  },
  bSide(state, rng){
    const candidates = DB.songs.filter(s => s.bSide);
    if (!candidates.length) return Recipes.songwriter(state, rng);
    const song = choice(rng, candidates);
    const correct = song.bSide;
    const pool = DB.songs.map(s => s.bSide).filter(Boolean).concat(DB.songs.map(s => s.title)).filter(x => x && x !== correct);
    const wrongs = shuffle(rng, pool).slice(0,3);
    const prompt = t(state.lang,
      `Welche B-Seite gehörte (Original-Single) zu „${song.title}“?`,
      `Which B-side was paired on the original single for “${song.title}”?`
    );
    const explanation = t(state.lang,
      `Als B‑Seite ist hier „${correct}“ hinterlegt.`,
      `The dataset stores “${correct}” as the B‑side.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["single","b-side"]);
  },
  producer(state, rng){
    const candidates = DB.songs.filter(s => s.producerId && PERSON[s.producerId]);
    if (!candidates.length) return Recipes.studioForSong(state, rng);
    const song = choice(rng, candidates);
    const correct = PERSON[song.producerId].name;
    const pool = DB.people.filter(p => p.roles.includes("producer")).map(p => p.name);
    const filler = ["Felton Jarvis","Steve Sholes","Chet Atkins","Sam Phillips"];
    const wrongs = padToThree(shuffle(rng, pool.filter(x => x !== correct)).slice(0,3), filler, correct, rng);
    const prompt = t(state.lang,
      `Mit welchem Producer ist „${song.title}“ besonders verbunden?`,
      `Which producer is most associated with “${song.title}”?`
    );
    const explanation = t(state.lang,
      `Im Datensatz ist ${correct} als Producer verknüpft.`,
      `In this dataset, ${correct} is linked as the producer.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["producer"]);
  },
  studioCityMatch(state, rng){
    const studio = choice(rng, DB.studios);
    const correct = studio.name;
    const wrongs = shuffle(rng, DB.studios.filter(s => s.city !== studio.city).map(s => s.name)).slice(0,3);
    const prompt = t(state.lang,
      `Welches Studio liegt in ${studio.city}?`,
      `Which studio is located in ${studio.city}?`
    );
    const explanation = t(state.lang,
      `${studio.name} ist in ${studio.city} verortet.`,
      `${studio.name} is located in ${studio.city}.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["geography","studio"]);
  },
  yearFromDate(state, rng){
    const song = choice(rng, DB.songs.filter(s => s.recordingDate));
    const year = song.recordingDate.slice(0,4);
    const correct = year;
    const cand = ["1954","1956","1957","1960","1968","1969","1972","1973"].filter(y => y !== correct);
    const wrongs = shuffle(rng, cand).slice(0,3);
    const prompt = t(state.lang,
      `Zu welchem Jahr gehört die Aufnahme-Session von „${song.title}“?`,
      `Which year does the recording session of “${song.title}” belong to?`
    );
    const explanation = t(state.lang,
      `Das Aufnahmedatum ist ${song.recordingDate}.`,
      `The recording date is ${song.recordingDate}.`
    );
    return assemble(prompt, correct, wrongs, explanation, state, ["year","session"]);
  }
};

function padToThree(arr, filler, avoid, rng){
  let out = arr.slice();
  for (const f of filler){
    if (out.length >= 3) break;
    if (f !== avoid && !out.includes(f)) out.push(f);
  }
  return shuffle(rng, out).slice(0,3);
}

function plausibleWrongDates(correct, rng){
  const [y,m,d] = correct.split("-").map(x => parseInt(x,10));
  const set = new Set();
  while(set.size < 3){
    const dm = randInt(rng, 5) - 2;
    const dd = randInt(rng, 7) - 3;
    const mm = clamp(m + dm, 1, 12);
    const dd2 = clamp(d + dd, 1, 28);
    const s = `${String(y).padStart(4,"0")}-${String(mm).padStart(2,"0")}-${String(dd2).padStart(2,"0")}`;
    if (s !== correct) set.add(s);
  }
  return [...set];
}

function assemble(prompt, correct, wrongs, explanation, state, tags){
  const answers = shuffle(state.rng, wrongs.concat([correct]));
  const correctIndex = answers.indexOf(correct);
  // difficulty starts hard and ramps
  const difficulty = Math.min(10, 7 + Math.floor(state.level / 3));
  return { prompt, answers, correctIndex, explanation, difficulty, tags };
}

function pickRecipe(state){
  // weighted to stay hard; “endless” via rng permutations
  const diff = Math.min(10, 7 + Math.floor(state.level / 3));
  let bag = [];
  const add = (name, n) => { for(let i=0;i<n;i++) bag.push(name); };

  add("studioForSong", 6);
  add("songwriter", 5);
  add("recordingDate", diff >= 8 ? 6 : 3);
  add("bSide", diff >= 8 ? 5 : 2);
  add("producer", 4);
  add("filmAssociation", 3);
  add("studioCityMatch", 2);
  add("yearFromDate", 2);

  return choice(state.rng, bag);
}

// ---------- Game state ----------
const PrizeSteps =

// Prize ladder values (not copying TV branding; simple custom ladder)
const PRIZE_VALUES = [50,100,200,400,800,1600,3200,6400,12500,25000,50000,100000,250000,500000,1000000];

function getWonValue(){
  if (state.mode !== "classic") {
    // Endless: simple scaling (adjust as you like)
    // Won value based on completed levels (level-1 correct answers)
    const completed = Math.max(0, state.level - 1);
    return completed * 100; // 100 points per level
  }
  const completed = Math.max(0, state.level - 1);
  if (completed <= 0) return 0;
  const idx = Math.min(PRIZE_VALUES.length, completed) - 1;
  return PRIZE_VALUES[idx];
}

function updateWonUI(){
  const won = getWonValue();
  const name = state.playerName || (state.lang === "de" ? "Spieler" : "Player");
  const wonLabel = formatMoney(won);
  const meta = t(state.lang, `Spieler: ${name} · Gewonnen: ${wonLabel}`, `Player: ${name} · Won: ${wonLabel}`);
  const metaEl = document.querySelector("#playerMeta");
  if (metaEl) metaEl.textContent = meta;

  const amtEl = document.querySelector("#winningsAmount");
  if (amtEl) amtEl.textContent = wonLabel;

  const noteEl = document.querySelector("#winningsNote");
  if (noteEl){
    noteEl.textContent = (state.mode === "classic")
      ? t(state.lang, "Classic 15: sichere Stufe nach jeder richtigen Antwort.", "Classic 15: safe step after each correct answer.")
      : t(state.lang, "Endless: Punkte pro Level.", "Endless: points per level.");
  }
}

 ["50","100","200","400","800","1.6K","3.2K","6.4K","12.5K","25K","50K","100K","250K","500K","1M"];

const state = {
  playerName: "",
  lang: "bilingual", // de | en | bilingual
  mode: "classic",   // classic | endless
  seed: Date.now() >>> 0,
  level: 1,
  rng: mulberry32(1),
  q: null,
  locked: false,
  selected: null,
  eliminated: new Set(),
  used: { ll5050:false, llAudience:false, llPhone:false },
  poll: null,
  phone: null,
};

// ---------- UI rendering ----------
function renderLadder(){
  const el = $("#ladder");
  if (state.mode !== "classic") {
    el.style.display = "none";
    return;
  }
  el.style.display = "flex";
  el.innerHTML = "";
  for (let i=15; i>=1; i--){
    const row = document.createElement("div");
    row.className = "ladder__row" + (i === state.level ? " current" : "");
    row.innerHTML = `
      <div class="ladder__idx">${i}.</div>
      <div>${state.mode === "classic" ? "Step" : "Level"}</div>
      <div class="ladder__amt">${PrizeSteps[i-1]}</div>
    `;
    el.appendChild(row);
  }
}

function renderQuestion(){
  $("#langLabel").textContent = (state.lang === "bilingual") ? "DE/EN" : state.lang.toUpperCase();
  $("#modeLabel").textContent = (state.mode === "classic") ? "Classic 15" : "Endless";

  $("#levelPill").textContent = `Level ${state.level}`;
  $("#diffPill").textContent = `Difficulty ${state.q.difficulty}/10`;
  $("#prompt").textContent = state.q.prompt;

  $("#explainWrap").hidden = !(state.locked);
  $("#explain").textContent = state.q.explanation;

  renderAnswers();
  renderLadder();
  renderHelper();
  updateWonUI();

  // lifeline buttons
  $("#ll5050").disabled = state.used.ll5050;
  $("#llAudience").disabled = state.used.llAudience;
  $("#llPhone").disabled = state.used.llPhone;

  $("#nextBtn").textContent = (state.mode === "classic" && state.level >= 15) ? "Finish" : "Next";
}

function renderAnswers(){
  const wrap = $("#answers");
  wrap.innerHTML = "";
  const letters = ["A","B","C","D"];

  state.q.answers.forEach((ans, idx) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.disabled = state.locked || state.eliminated.has(idx);
    if (state.locked){
      if (idx === state.q.correctIndex) btn.classList.add("correct");
      if (idx === state.selected && idx !== state.q.correctIndex) btn.classList.add("wrong");
    }
    const poll = state.poll ? `${state.poll[idx] || 0}%` : "";
    btn.innerHTML = `
      <div class="answer__letter">${letters[idx]}:</div>
      <div class="answer__text">${ans}</div>
      <div class="answer__poll">${poll}</div>
    `;
    btn.addEventListener("click", () => onAnswer(idx));
    wrap.appendChild(btn);
  });
}

function renderHelper(){
  const el = $("#helper");
  const lines = [];
  if (state.phone) lines.push(state.phone);
  if (state.locked){
    lines.push(state.selected === state.q.correctIndex ? "✅ Correct" : "❌ Wrong");
  }
  if (lines.length){
    el.hidden = false;
    el.textContent = lines.join("\n\n");
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

// ---------- Game flow ----------
function loadQuestion(){
  state.locked = false;
  state.selected = null;
  state.eliminated = new Set();
  state.poll = null;
  state.phone = null;

  const recipeName = pickRecipe(state);
  state.q = Recipes[recipeName](state, state.rng);

  $("#avatarState").textContent = "ready";
  $("#avatarIcon").textContent = "🎤";

  renderQuestion();
}

function startRun(customSeed){
  state.seed = (customSeed ?? (Date.now() >>> 0)) >>> 0;
  state.level = 1;
  state.rng = mulberry32((state.seed ^ 0x9E3779B9) >>> 0);

  if (!state.playerName){
    state.playerName = loadPlayerName() || \"\";
  }

  state.used = { ll5050:false, llAudience:false, llPhone:false };
  loadQuestion();

  // show welcome + read question
  const intro = choice(state.rng, Phrase.intro);
  speak(t(state.lang, intro.de, intro.en), state.lang === "en" ? "en" : "de");
  speak(readPromptForSpeech(state.q.prompt), state.lang === "en" ? "en" : "de");
}


function restartRun(reason){
  // restart from level 1 (same seed) and reset lifelines
  state.level = 1;
  state.used = { ll5050:false, llAudience:false, llPhone:false };
  state.eliminated = new Set();
  state.poll = null;
  state.phone = null;
  loadQuestion();
  renderQuestion();

  if (reason){
    speak(reason, state.lang === "en" ? "en" : "de");
  }
  // read next question
  speak(readPromptForSpeech(state.q.prompt), state.lang === "en" ? "en" : "de");
}


function readPromptForSpeech(prompt){
  if (state.lang !== "bilingual") return prompt;
  // In bilingual mode: speak first chunk (DE)
  return prompt.split("\n\n")[0] || prompt;
}

function onAnswer(idx){
  unlockTTS();
  if (state.locked || state.eliminated.has(idx)) return;

  state.selected = idx;
  state.locked = true;
  renderQuestion();

  const ok = idx === state.q.correctIndex;
  const line = ok ? choice(state.rng, Phrase.correct) : choice(state.rng, Phrase.wrong);
  speak(t(state.lang, line.de, line.en), state.lang === "en" ? "en" : "de");

  if (!ok){
    const msg = t(state.lang,
      "Falsch. Du startest wieder bei Level 1.",
      "Wrong. Back to level 1."
    );
    // Give a moment for the user to see the result/explanation, then restart.
    addHighscore('wrong');
    setTimeout(() => restartRun(msg), 1300);
  }
}

function next(){
  unlockTTS();
  if (!state.locked){
    speak(t(state.lang,"Erst antworten.","Answer first."), state.lang === "en" ? "en" : "de");
    return;
  }
  if (state.mode === "classic" && state.level >= 15){
    addHighscore('finish');
    speak(t(state.lang,"Ende. Respekt.","Finished. Respect."), state.lang === "en" ? "en" : "de");
    return;
  }
  state.level += 1;
  loadQuestion();
  const line = choice(state.rng, Phrase.next);
  speak(t(state.lang, line.de, line.en), state.lang === "en" ? "en" : "de");
  speak(readPromptForSpeech(state.q.prompt), state.lang === "en" ? "en" : "de");
}

// ---------- Lifelines ----------
function lifeline5050(){
  unlockTTS();
  if (state.used.ll5050) return;
  state.used.ll5050 = true;

  const wrongs = [0,1,2,3].filter(i => i !== state.q.correctIndex);
  const toRemove = shuffle(state.rng, wrongs).slice(0,2);
  toRemove.forEach(i => state.eliminated.add(i));

  renderQuestion();
  speak(t(state.lang,"Fünfzig-fünfzig. Zwei Antworten sind raus.","Fifty-fifty. Two answers are gone."), state.lang === "en" ? "en" : "de");
}

function lifelineAudience(){
  unlockTTS();
  if (state.used.llAudience) return;
  state.used.llAudience = true;

  // Hard mode: audience is not perfect. Correct share depends on difficulty.
  const baseCorrect = 62 - (state.q.difficulty - 7) * 6; // 62,56,50,44
  const correct = clamp(baseCorrect, 38, 62);
  let remaining = 100 - correct;

  const poll = {};
  poll[state.q.correctIndex] = correct;
  const wrongs = [0,1,2,3].filter(i => i !== state.q.correctIndex);
  wrongs.forEach((idx, k) => {
    if (k === wrongs.length - 1) poll[idx] = remaining;
    else {
      const v = clamp(10 + randInt(state.rng, remaining + 1), 0, remaining);
      poll[idx] = v;
      remaining -= v;
    }
  });
  // ensure no zeros
  wrongs.forEach(idx => {
    if (poll[idx] === 0) { poll[idx] = 1; poll[state.q.correctIndex] = Math.max(1, poll[state.q.correctIndex]-1); }
  });

  state.poll = poll;
  renderQuestion();
  speak(t(state.lang,"Publikum stimmt ab. Prozentzahlen sind eingeblendet.","Audience votes. Percentages are shown."), state.lang === "en" ? "en" : "de");
}

function lifelinePhone(){
  unlockTTS();
  if (state.used.llPhone) return;
  state.used.llPhone = true;

  const pCorrect = Math.max(0.45, 0.75 - (state.q.difficulty * 0.03)); // ~0.45–0.54
  const suggestsCorrect = (state.rng() < pCorrect);
  const pick = suggestsCorrect ? state.q.correctIndex : choice(state.rng, [0,1,2,3].filter(i => i !== state.q.correctIndex));
  const letter = ["A","B","C","D"][pick];

  state.phone = t(state.lang,
    `Telefonjoker: Ich tippe auf ${letter}… aber ich bin nicht 100% sicher.`,
    `Phone-a-friend: I think it's ${letter}… but I'm not 100% sure.`
  );
  renderHelper();
  updateWonUI();
  speak(state.phone.split("\n\n")[0], state.lang === "en" ? "en" : "de");
}


function renderHighscores(){
  const list = loadHighscores();
  const el = document.querySelector("#scoresList");
  const hint = document.querySelector("#scoresHint");
  if (!el) return;

  if (hint){
    hint.textContent = t(state.lang, "Top 10 auf diesem Gerät (lokal gespeichert).", "Top 10 on this device (stored locally).");
  }

  if (!list.length){
    el.innerHTML = `<div class="scores__hint">${t(state.lang,"Noch keine Scores.","No scores yet.")}</div>`;
    return;
  }

  el.innerHTML = "";
  list.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "scoreRow";
    row.innerHTML = `
      <div class="scoreRow__rank">${i+1}.</div>
      <div class="scoreRow__name">${escapeHtml(s.name || "")}
        <div class="scoreRow__meta">${escapeHtml((s.mode||"") + " · L" + (s.completedLevels||0))}</div>
      </div>
      <div class="scoreRow__value">${formatMoney(s.score || 0)}</div>
    `;
    el.appendChild(row);
  });
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

// ---------- Settings / install hints ----------
function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function showInstallHint(){
  const el = $("#installHint");
  if (isStandalone()){
    el.textContent = t(state.lang, "App läuft im Homescreen-Modus.", "Running in home screen mode.");
    return;
  }
  if (isIOS()){
    el.textContent = t(state.lang,
      "iPhone: In Safari → Teilen → „Zum Home-Bildschirm“ (PWA-Installation).",
      "iPhone: In Safari → Share → “Add to Home Screen” (PWA install)."
    );
  } else {
    el.textContent = t(state.lang,
      "Android/Chrome: Menü → „Installieren“ oder „Zum Startbildschirm hinzufügen“.",
      "Android/Chrome: menu → “Install” / “Add to Home screen”."
    );
  }
}

function unlockTTS(){
  if (ttsUnlocked) return;
  ttsUnlocked = true;
  // Nudge voices list (Safari loads lazily)
  try { speechSynthesis.getVoices(); } catch(e){}
}


function addHighscore(reason){
  const score = getWonValue();
  const completed = Math.max(0, state.level - 1);
  const name = (state.playerName || "").trim() || (state.lang === "de" ? "Spieler" : "Player");
  // Record even if score is 0 (so first-round losses still appear)

  const entry = {
    name,
    score,
    mode: state.mode,
    completedLevels: completed,
    when: new Date().toISOString()
  };
  const list = loadHighscores();
  list.push(entry);
  // Sort high to low
  list.sort((a,b) => (b.score - a.score) || (b.completedLevels - a.completedLevels));
  const top10 = list.slice(0,10);
  saveHighscores(top10);
}


function on(sel, evt, handler){
  const el = document.querySelector(sel);
  if (!el) return;
  el.addEventListener(evt, handler);
}

// ---------- Events ----------
on("#nextBtn","click", next);
on("#ll5050","click", lifeline5050);
on("#llAudience","click", lifelineAudience);
on("#llPhone","click", lifelinePhone);

on("#scoresBtn","click", () => {
  renderHighscores();
  const d=$("#scoresModal"); if (d && d.showModal) d.showModal();
});

on("#resetScoresBtn","click", () => {
  saveHighscores([]);
  renderHighscores();
});

on("#settingsBtn","click", () => {
  const si=$("#seedInput"); if (si) si.value = "";
  const ni=$("#nameInput"); if (ni) ni.value = state.playerName || loadPlayerName() || "";
  const ls=$("#langSelect"); if (ls) ls.value = state.lang;
  const ms=$("#modeSelect"); if (ms) ms.value = state.mode;
  if (si) si.placeholder = String(state.seed);
  const d=$("#settingsModal"); if (d && d.showModal) d.showModal();
});

on("#applyBtn","click", (ev) => {
  ev.preventDefault();
  const lang = (document.querySelector("#langSelect")?.value) || state.lang;
  const nameStr = ((document.querySelector("#nameInput")?.value) || "").trim();
  const mode = (document.querySelector("#modeSelect")?.value) || state.mode;
  const seedStr = ((document.querySelector("#seedInput")?.value) || "").trim();

  state.lang = lang;

  state.playerName = nameStr;
  savePlayerName(nameStr);
  state.mode = mode;

  const seed = seedStr ? (parseInt(seedStr, 10) >>> 0) : undefined;
  startRun(seed);
  showInstallHint();
  const d=$("#settingsModal"); if (d && d.close) d.close();
});

// Initial boot
(async function init(){
  showInstallHint();
  renderLadder();
  await loadDB();
  startRun();
})();
