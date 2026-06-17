import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════
   圖片設定區（只改這裡就能換圖）
   • 把 1.png ~ 11.png 放到 /public/images/
   • 1.png  = 序章圖
   • 2~11.png = 第 1~10 題
   ═══════════════════════════════════════════ */
const USE_IMAGES = true
const IMG_BASE   = '/images/'
const IMG_EXT    = '.png'
const imgURL = (n) => `${IMG_BASE}${n}${IMG_EXT}`
const introImg   = imgURL(1)
const questionImg = (qIdx) => imgURL(qIdx + 2)

/* ═══════════════════════════════════════════ 題庫 ═══ */
const LEVEL1 = [
  { idiom:'守株待兔', blanks:[3],   story:'農夫看見兔子撞樹死了，從此天天守在樹旁等兔子。',   meaning:'比喻不努力，只想靠運氣。',           emoji:'🐰', bg:'linear-gradient(160deg,#c8f0d0,#9be0ad)', tag:'動物寓言' },
  { idiom:'亡羊補牢', blanks:[1],   story:'羊跑掉了才趕快修補羊圈，免得再損失。',             meaning:'出了問題後及時補救還來得及。',         emoji:'🛠️', bg:'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag:'生活智慧' },
  { idiom:'水落石出', blanks:[3],   story:'溪水退去後，藏在水裡的石頭就露出來了。',           meaning:'事情的真相終於弄清楚了。',             emoji:'🪨', bg:'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag:'自然景象' },
  { idiom:'愚公移山', blanks:[1],   story:'老爺爺帶著家人，一筐一筐地要把大山搬走。',         meaning:'只要有恆心，再難的事也能做到。',         emoji:'⛰️', bg:'linear-gradient(160deg,#d4e0ff,#aec4f0)', tag:'神話傳說' },
  { idiom:'畫龍點睛', blanks:[2],   story:'畫家替龍點上眼睛，龍竟然飛上天去了。',             meaning:'在關鍵處加一筆，讓整體更出色。',         emoji:'🐉', bg:'linear-gradient(160deg,#e6d4ff,#c9aef0)', tag:'神話傳說' },
  { idiom:'井底之蛙', blanks:[0,3], story:'青蛙住在井裡，以為天空只有井口那麼大。',           meaning:'形容見識很少的人。',                   emoji:'🐸', bg:'linear-gradient(160deg,#c4ecf0,#8fd9e0)', tag:'動物寓言' },
  { idiom:'鐵杵磨針', blanks:[1,3], story:'老婆婆把粗鐵棒一直磨，要磨成一根細針。',           meaning:'功夫下得深，再難的事也能成功。',         emoji:'🪡', bg:'linear-gradient(160deg,#ffe8cc,#ffd199)', tag:'勵志故事' },
  { idiom:'花好月圓', blanks:[1,3], story:'花開得正美，月亮又圓又亮，象徵美滿團圓。',         meaning:'比喻美好圓滿，常用來祝福。',             emoji:'🌕', bg:'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag:'自然景象' },
  { idiom:'對牛彈琴', blanks:[2,3], story:'對著牛彈琴，牛根本聽不懂。',                       meaning:'對不懂的人講道理，白費力氣。',           emoji:'🎵', bg:'linear-gradient(160deg,#d4f0c4,#a8e08f)', tag:'生活智慧' },
  { idiom:'愛屋及烏', blanks:[0,2], story:'因為喜歡一個人，連他屋頂上的烏鴉也一起喜歡。',   meaning:'愛一個人，連帶喜歡和他有關的一切。',     emoji:'🏠', bg:'linear-gradient(160deg,#c8f0e0,#9be0c9)', tag:'生活智慧' },
]

const POS_NAME  = ['第一字','第二字','第三字','第四字']
const DISTRACT  = ['風','雨','雲','木','心','手','火','三','百','千','頭','東','西','上','下','大','小','天']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeTiles(q) {
  const chars = q.idiom.split('')
  const answers = q.blanks.map(i => chars[i])
  let opts = [...answers]
  const pool = shuffle([...DISTRACT])
  const target = q.blanks.length + 3
  for (const d of pool) {
    if (opts.length >= target) break
    if (!opts.includes(d) && !chars.includes(d)) opts.push(d)
  }
  return shuffle(opts).map((ch, k) => ({ ch, tid: `t${k}`, used: false }))
}

/* ═══════════════════════════════════════════
   元件：ImgWithFallback
   ═══════════════════════════════════════════ */
function ImgWithFallback({ src, fallback, alt, className, style }) {
  const [err, setErr] = useState(false)
  if (!USE_IMAGES || err) return <span style={style}>{fallback}</span>
  return <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />
}

/* ═══════════════════════════════════════════
   元件：ProgressBar
   ═══════════════════════════════════════════ */
function ProgressBar({ idx, total }) {
  return (
    <div className="progressbar">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`pb-step${i === idx ? ' active' : i < idx ? ' done' : ''}`}>
          {i < idx ? '✓' : i + 1}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   元件：Scene（場景圖）
   ═══════════════════════════════════════════ */
function Scene({ q, qIdx }) {
  return (
    <div className="scene" style={{ background: q.bg }}>
      <span className="twinkle t1">✨</span>
      <span className="twinkle t2">⭐</span>
      <span className="twinkle t3">✨</span>
      {USE_IMAGES
        ? <ImgWithFallback
            src={questionImg(qIdx)}
            fallback={q.emoji}
            alt={q.idiom}
            className="scene-img"
          />
        : <span className="scene-emoji">{q.emoji}</span>
      }
      <span className="scene-tag">{q.tag}・填{q.blanks.length}字</span>
    </div>
  )
}

/* ═══════════════════════════════════════════
   元件：IdiomRow（成語空格列）
   ═══════════════════════════════════════════ */
function IdiomRow({ q, placed, onClickSlot }) {
  const chars = q.idiom.split('')
  return (
    <div className="idiom-row">
      {chars.map((ch, i) =>
        q.blanks.includes(i)
          ? (
            <div
              key={i}
              data-pos={i}
              className={`slot${placed[i] ? ' filled' : ''}${placed[i]?.correct === true ? ' correct' : ''}${placed[i]?.correct === false ? ' wrong' : ''}`}
              onClick={() => onClickSlot(i)}
            >
              {placed[i]?.ch ?? ''}
              <span className="pos-hint">{POS_NAME[i]}</span>
            </div>
          )
          : <div key={i} className="fixed-char">{ch}</div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   撒花
   ═══════════════════════════════════════════ */
function burst(count = 14) {
  const emo = ['⭐','✨','🎉','🌟','🎊','🌈','🏆']
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti'
    el.textContent = emo[Math.floor(Math.random() * emo.length)]
    el.style.left = Math.random() * 100 + 'vw'
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's'
    el.style.animationDelay = (Math.random() * 0.5) + 's'
    el.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 4000)
  }
}

/* ═══════════════════════════════════════════
   主畫面
   ═══════════════════════════════════════════ */
export default function Home() {
  // 'intro' | 'menu' | 'game'
  const [screen, setScreen] = useState('intro')
  const [qIdx,   setQIdx]   = useState(0)
  const [score,  setScore]  = useState(0)
  const [done,   setDone]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // placed: { [posIndex]: { ch, tid, correct:null|true|false } }
  const [placed,  setPlaced]  = useState({})
  // tiles: [{ ch, tid, used }]
  const [tiles,   setTiles]   = useState([])
  // result: null | 'ok' | 'err'
  const [result,  setResult]  = useState(null)
  // msg
  const [msg,     setMsg]     = useState('')

  // drag
  const dragRef = useRef(null)
  const ghostRef = useRef(null)

  /* 初始化題目 */
  const initQ = useCallback((idx) => {
    setPlaced({})
    setResult(null)
    setMsg('')
    setTiles(makeTiles(LEVEL1[idx]))
  }, [])

  useEffect(() => { initQ(qIdx) }, [qIdx, initQ])

  /* 開始遊戲 */
  function startGame() {
    setQIdx(0); setScore(0); setDone(false); setScreen('game')
  }

  /* 點空格取回 */
  function handleClickSlot(pos) {
    if (!placed[pos]) return
    const { tid } = placed[pos]
    setPlaced(p => { const n = { ...p }; delete n[pos]; return n })
    setTiles(ts => ts.map(t => t.tid === tid ? { ...t, used: false } : t))
    setResult(null); setMsg('')
  }

  /* 放入空格 */
  function dropInto(pos, { ch, tid }) {
    // 若格子已有字，先退回
    setPlaced(prev => {
      const n = { ...prev }
      if (n[pos]) {
        const old = n[pos].tid
        setTiles(ts => ts.map(t => t.tid === old ? { ...t, used: false } : t))
      }
      n[pos] = { ch, tid, correct: null }
      return n
    })
    setTiles(ts => ts.map(t => t.tid === tid ? { ...t, used: true } : t))
    setResult(null); setMsg('')
  }

  /* 提交 */
  function handleCheck() {
    const q = LEVEL1[qIdx]
    const chars = q.idiom.split('')
    let allOk = true
    const next = { ...placed }
    q.blanks.forEach(pos => {
      const ok = next[pos]?.ch === chars[pos]
      next[pos] = { ...next[pos], correct: ok }
      if (!ok) allOk = false
    })
    setPlaced(next)
    if (allOk) {
      const ns = score + 10
      setScore(ns)
      setResult('ok')
      setMsg(`✦ 答對了！「${q.idiom}」`)
      burst(14)
    } else {
      setResult('err')
      setMsg('✗ 紅色的格子放錯了，再想想看！')
      // 900ms 後自動退回錯誤格
      setTimeout(() => {
        setPlaced(prev => {
          const n = { ...prev }
          q.blanks.forEach(pos => {
            if (n[pos]?.correct === false) {
              const tid = n[pos].tid
              setTiles(ts => ts.map(t => t.tid === tid ? { ...t, used: false } : t))
              delete n[pos]
            }
          })
          return n
        })
        setResult(null); setMsg('')
      }, 900)
    }
  }

  /* 下一題 */
  function handleNext() {
    if (qIdx < LEVEL1.length - 1) {
      setQIdx(i => i + 1)
    } else {
      setDone(true)
      burst(50)
    }
  }

  /* 重置本題 */
  function handleReset() {
    initQ(qIdx)
  }

  const q       = LEVEL1[qIdx]
  const filled  = Object.keys(placed).length
  const canCheck = filled === q.blanks.length && result !== 'ok'

  /* ── 拖曳邏輯 ── */
  function onTilePointerDown(e, tile) {
    if (tile.used) return
    e.preventDefault()
    dragRef.current = tile

    const g = document.createElement('div')
    g.className = 'tile-ghost'
    g.textContent = tile.ch
    document.body.appendChild(g)
    ghostRef.current = g
    moveGhost(e.clientX, e.clientY)

    const onMove = (ev) => {
      moveGhost(ev.clientX, ev.clientY)
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('over'))
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      el?.closest('.slot')?.classList.add('over')
    }
    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      ghostRef.current?.remove(); ghostRef.current = null
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('over'))
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      const slot = el?.closest('.slot')
      if (slot && dragRef.current) {
        const pos = parseInt(slot.dataset.pos)
        dropInto(pos, dragRef.current)
      }
      dragRef.current = null
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup',   onUp)
  }

  function moveGhost(x, y) {
    if (ghostRef.current) {
      ghostRef.current.style.left = x + 'px'
      ghostRef.current.style.top  = y + 'px'
    }
  }

  /* ── 分數訊息 ── */
  function finishMsg() {
    if (score >= 90) return '太厲害了！你是成語穿越大師，每個故事都拼得完美。'
    if (score >= 60) return '做得很好！再闖一次，把成語記得更牢吧。'
    return '冒險的開始！多讀幾次故事，下次一定更棒。'
  }

  /* ── render ── */
  return (
    <>
      <Head>
        <title>成語穿越者・童話成語館</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 左邊側邊欄 */}
      <div className="sidebar">
        <div className="sidebar-header">🗺️ 關卡選單</div>
        <button className="sidebar-back" onClick={() => setScreen('intro')}>
          🏠 返回首頁
        </button>
        <div style={{ margin: '16px 12px 12px', fontSize: '.85rem', color: 'var(--gold-dim)', fontWeight: 700, textAlign: 'center' }}>
          第一關
        </div>
        <div 
          className={`sidebar-item${screen === 'menu' || screen === 'game' ? ' active' : ''}`}
          onClick={() => { setScreen('menu'); setSidebarOpen(false); }}
        >
          第一關：成語故事館
        </div>
      </div>

      {/* 雲朵 */}
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />

      <div className="wrap">

        {/* ════ 序章 ════ */}
        <section className={`screen intro-screen${screen === 'intro' ? ' show' : ''}`}>
          <div className="intro">
            <div className="portal">
              <ImgWithFallback src={introImg} fallback="🌀" alt="序章" style={{ width:280, height:280, objectFit:'contain', borderRadius:24 }} />
            </div>
            <h1>成語穿越者</h1>
            <div className="scroll-box">
              <p>
                你現在是一位穿梭在各個成語故事之中的<span className="hl">穿越者</span>。<br />
                每打開一扇門，就會掉進一個<span className="hl2">五花八門</span>的故事裡——<br />
                有撞樹的兔子、井底的青蛙、對著牛彈琴的人……<br /><br />
                請在每個故事中<span className="hl">蒐集智慧</span>，<br />
                把散落的字拼回成語，幫故事找回它的名字！
              </p>
            </div>
            <button className="btn btn-go" onClick={() => setScreen('menu')}>
              🚪　推開第一扇門
            </button>
          </div>
        </section>

        {/* ════ 目錄 ════ */}
        <section className={`screen${screen === 'menu' ? ' show' : ''}`}>
          <div className="menu-head">
            <h2>🗺️ 成語故事地圖</h2>
            <p>選擇關卡，開始你的成語冒險吧！</p>
          </div>
          <div className="level-grid single">
            <div className="level-card open" onClick={startGame}>
              <span className="lv-emoji">🌀</span>
              <div className="lv-no">第 1 關</div>
              <h3>第一關</h3>
              <div className="lv-desc">看圖讀故事，把散落的字拼回成語。</div>
              <span className="lv-tag ready">▶ 開始遊戲</span>
            </div>
          </div>
        </section>

        {/* ════ 遊戲 ════ */}
        <section className={`screen${screen === 'game' ? ' show' : ''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={() => setScreen('menu')}>← 地圖</button>
            <ProgressBar idx={qIdx} total={LEVEL1.length} />
            <div className="score-pill">⭐ {score}</div>
          </div>

          {/* 遊戲卡 */}
          {!done && (
            <div className="card">
              <Scene q={q} qIdx={qIdx} />
              <p className="story">「{q.story}」</p>
              <p className="meaning">意思：{q.meaning}</p>

              <IdiomRow q={q} placed={placed} onClickSlot={handleClickSlot} />

              <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
              <div className="bank">
                {tiles.map(tile => (
                  <div
                    key={tile.tid}
                    className={`tile${tile.used ? ' used' : ''}`}
                    onPointerDown={e => onTilePointerDown(e, tile)}
                  >
                    {tile.ch}
                  </div>
                ))}
              </div>

              <div className="actions">
                <button className="btn btn-ghost" onClick={handleReset}>🔄 重來</button>
                {result === 'ok'
                  ? <button className="btn btn-grass" onClick={handleNext}>
                      {qIdx < LEVEL1.length - 1 ? '下一個故事 →' : '完成冒險 🏆'}
                    </button>
                  : <button className="btn btn-sun" disabled={!canCheck} onClick={handleCheck}>
                      ✅ 拼好了
                    </button>
                }
              </div>

              <div className={`result${result === 'ok' ? ' result-success' : result === 'err' ? ' result-error' : ''}`}>
                {msg}
              </div>
            </div>
          )}

          {/* 完成 */}
          {done && (
            <div className="card finish-inner">
              <div className="big">🏆</div>
              <h2>這個故事世界完成啦！</h2>
              <div className="score-ring">⭐ {score} / 100 分</div>
              <p>{finishMsg()}</p>
              <div className="actions">
                <button className="btn btn-grass" onClick={startGame}>↻ 再玩一次</button>
                <button className="btn btn-go"    onClick={() => setScreen('menu')}>🗺️ 回地圖</button>
              </div>
            </div>
          )}
        </section>

      </div>
    </>
  )
}
