const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Accidental,
  Formatter,
  Dot
} = Vex.Flow;


const div = document.getElementById("sheet");
const output = document.getElementById("output");
const nextBtn = document.getElementById("nextBtn");

let answer = false;

const clefs = [
    {
        name: "treble",
        low: "C/4", high: "A/5"
    }, 
    {
        name: "bass",
        low: "E/2", high: "C/4"
    }, 
    {
        name: "alto",
        low: "D/3", high: "B/4"
    }, 
    {
        name: "tenor",
        low: "B/2", high: "G/4"
    }, 
    {
        name: "soprano",
        low: "A/3", high: "F/5"
    }
];

const accidentals = ["","b","bb","#","##"];


function createNote() {
    div.innerHTML = "";
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    renderer.resize(200, 200);

    const context = renderer.getContext();
    const e = clefs[Math.floor(Math.random()*clefs.length)];
    const a = accidentals[Math.floor(Math.random()*clefs.length)];
    const clef = e.name;
    const key = addAccidental(randomNaturalNote(e.low, e.high), a);
    answer = toGermanNoteName(key);

    // 毎回新しく作る
    const stave = new Stave(15, 50, 170);

    stave.addClef(clef);

    stave.setContext(context).draw();

    const notes = [
        new StaveNote({
            clef,
            keys: [key],
            duration: "w"
        })
    ];
    if (a != "") notes[0].addModifier(new Accidental(a, 0));

    const voice = new Voice({
        num_beats: 1,
        beat_value: 1
    });

    voice.addTickables(notes);

    new Formatter()
        .joinVoices([voice])
        .format([voice], 100);

    voice.draw(context, stave);
}
function noteToNumber(note) {
    const [pitch, octave] = note.split("/");
    
    // 幹音を数値化
    const table = {
        C: 0,
        D: 1,
        E: 2,
        F: 3,
        G: 4,
        A: 5,
        B: 6
    };

    return Number(octave) * 7 + table[pitch];
}

function numberToNote(num) {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];

    const octave = Math.floor(num / 7);
    const pitch = notes[num % 7];

    return `${pitch}/${octave}`;
}

function randomNaturalNote(low, high) {
    const a = noteToNumber(low);
    const b = noteToNumber(high);

    const min = Math.min(a, b);
    const max = Math.max(a, b);

    const rand = Math.floor(Math.random() * (max - min + 1)) + min;

    return numberToNote(rand);
}

function toGermanNoteName(note) {
    const pitch = note.split("/")[0];

    // 音名部分と変化記号部分を分離
    const match = pitch.match(/^([A-G])([#b]*)$/);

    if (!match) return null;

    const [, base, accidental] = match;

    // 基本音
    const baseTable = {
        C: "C",
        D: "D",
        E: "E",
        F: "F",
        G: "G",
        A: "A",
        B: "H"
    };

    // 特殊処理
    const specialTable = {
        "Bb": "B",
        "Bbb": "BB, Bes, Heses",
        "Cb": "Ces",
        "Cbb": "Ceses",
        "Eb": "Es",
        "Ebb": "Eses",
        "Fb": "Fes",
        "Fbb": "Feses",
        "Ab": "As",
        "Abb": "Asas"
    };

    if (specialTable[pitch]) {
        return specialTable[pitch];
    }

    let result = baseTable[base];

    // シャープ系
    if (accidental.includes("#")) {
        result += "is".repeat(accidental.length);
    }

    // フラット系
    if (accidental.includes("b")) {
        result += "es".repeat(accidental.length);
    }

    return result;
}
function addAccidental(note, accidental) {
    const [pitch, octave] = note.split("/");

    // すでに臨時記号が付いている場合にも対応
    const match = pitch.match(/^([A-Ga-g])([#bx]*)$/);

    if (!match) {
        throw new Error("無効な音名です");
    }

    const [, base, currentAcc] = match;

    return `${base}${currentAcc}${accidental}/${octave}`;
}

createNote();

nextBtn.addEventListener('click', () => { 
    if (answer !== false) {
        //解答を表示
        output.textContent = answer;
        nextBtn.textContent = "次へ";
        answer = false;
    } else {
        output.textContent = "";
        nextBtn.textContent = "解答を表示";
        createNote();
    }
});