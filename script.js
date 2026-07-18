const effects = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'middle', label: 'Mirror' },
  { value: 'three', label: 'Three color' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'solid', label: 'Solid' },
  { value: 'random', label: 'Random' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'pastelRainbow', label: 'Pastel rainbow' },
]

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16))
}

function rgbToHex(rgb) {
  return `#${rgb.map((value) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function mix(a, b, amount) {
  const start = hexToRgb(a)
  const end = hexToRgb(b)
  return rgbToHex(start.map((value, index) => value + (end[index] - value) * amount))
}

function rainbow(amount) {
  const hue = amount * 360
  const section = hue / 60
  const x = 1 - Math.abs((section % 2) - 1)
  const colors = section < 1 ? [1, x, 0] : section < 2 ? [x, 1, 0] : section < 3 ? [0, 1, x] : section < 4 ? [0, x, 1] : section < 5 ? [x, 0, 1] : [1, 0, x]
  return rgbToHex(colors.map((value) => value * 255))
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function generateColors(text, effect, colors, seed) {
  const length = Math.max(text.length - 1, 1)
  return Array.from(text, (_, index) => {
    const amount = index / length
    if (effect === 'solid') return colors[0]
    if (effect === 'rainbow') return rainbow(amount)
    if (effect === 'pastelRainbow') return mix(rainbow(amount), '#FFFFFF', 0.42)
    if (effect === 'random') {
      const value = Math.abs(Math.sin((index + 1) * 999 + seed * 17)) * 16777215
      return `#${Math.floor(value).toString(16).padStart(6, '0')}`.toUpperCase()
    }
    if (effect === 'reverse') return mix(colors[1], colors[0], amount)
    if (effect === 'middle') return amount <= 0.5 ? mix(colors[0], colors[1], amount * 2) : mix(colors[1], colors[0], (amount - 0.5) * 2)
    if (effect === 'three') return amount <= 0.5 ? mix(colors[0], colors[1], amount * 2) : mix(colors[1], colors[2], (amount - 0.5) * 2)
    if (effect === 'pulse') return mix(colors[0], colors[1], (Math.sin(amount * Math.PI * 4 - Math.PI / 2) + 1) / 2)
    if (effect === 'stripes') return Math.floor(index / 2) % 2 === 0 ? colors[0] : colors[1]
    return mix(colors[0], colors[1], amount)
  })
}

/* REACT_APP_REMOVED
export function ColorizerStudio() {
  const [text, setText] = useState('Make every word stand out.')
  const [effect, setEffect] = useState<Effect>('horizontal')
  const [colors, setColors] = useState(['#FF5C5C', '#35C8B4', '#F4C95D'])
  const [font, setFont] = useState('Default')
  const [size, setSize] = useState('32')
  const [bold, setBold] = useState(true)
  const [italic, setItalic] = useState(false)
  const [format, setFormat] = useState<Format>('bbcode')
  const [seed, setSeed] = useState(1)
  const [copied, setCopied] = useState(false)

  const characterColors = useMemo(() => generateColors(text, effect, colors, seed), [text, effect, colors, seed])
  const outputs = useMemo(() => {
    const safeChars = Array.from(text).map(escapeHtml)
    const isWhitespace = (char) => /\s/.test(char)
    const unityBody = safeChars.map((char, index) => isWhitespace(char) ? char : `<color=${characterColors[index]}>${char}</color>`).join('')
    const htmlBody = safeChars.map((char, index) => isWhitespace(char) ? char : `<span style="color:${characterColors[index]}">${char}</span>`).join('')
    const bbBody = safeChars.map((char, index) => isWhitespace(char) ? char : `[color=${characterColors[index]}]${char}[/color]`).join('')
    const unity = `${bold ? '<b>' : ''}${italic ? '<i>' : ''}<size=${size}>${unityBody}</size>${italic ? '</i>' : ''}${bold ? '</b>' : ''}`
    const htmlStyle = `${font !== 'Default' ? `font-family:'${font}';` : ''}font-size:${size}px;white-space:pre-wrap;${bold ? 'font-weight:700;' : ''}${italic ? 'font-style:italic;' : ''}`
    const html = `<span style="${htmlStyle}">${htmlBody}</span>`
    const bbcode = `${bold ? '[b]' : ''}${italic ? '[i]' : ''}[size=${size}]${bbBody}[/size]${italic ? '[/i]' : ''}${bold ? '[/b]' : ''}`
    return { unity, html, bbcode }
  }, [text, characterColors, font, size, bold, italic])

  const visibleColorCount = effect === 'three' ? 3 : effect === 'solid' ? 1 : effect === 'random' || effect === 'rainbow' || effect === 'pastelRainbow' ? 0 : 2
  const output = outputs[format]

  async function copyOutput() {
    let didCopy = false

    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(output)
        didCopy = true
      } catch {
        didCopy = false
      }
    }

    if (!didCopy) {
      const fallback = document.createElement('textarea')
      fallback.value = output
      fallback.setAttribute('readonly', '')
      fallback.style.position = 'fixed'
      fallback.style.left = '-9999px'
      fallback.style.opacity = '0'
      document.body.appendChild(fallback)
      fallback.focus()
      fallback.select()
      fallback.setSelectionRange(0, fallback.value.length)
      didCopy = document.execCommand('copy')
      fallback.remove()
    }

    if (didCopy) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    const interactive = target.closest<HTMLElement>('button, .toggle, .color-field')
    if (!interactive || interactive.hasAttribute('disabled')) return

    if ('vibrate' in navigator) navigator.vibrate(event.pointerType === 'touch' ? 12 : 6)
    interactive.classList.remove('tap-pop')
    void interactive.offsetWidth
    interactive.classList.add('tap-pop')

    if (interactive.tagName !== 'BUTTON') return
    const rect = interactive.getBoundingClientRect()
    const ripple = document.createElement('span')
    const diameter = Math.max(rect.width, rect.height) * 1.45
    ripple.className = 'click-ripple'
    ripple.style.width = `${diameter}px`
    ripple.style.height = `${diameter}px`
    ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`
    ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`
    interactive.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground" onPointerDown={handlePointerDown}>
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground"><Palette size={18} aria-hidden="true" /></div>
            <div className="flex items-baseline gap-2"><h1 className="text-sm font-bold tracking-tight">Text Colorizer</h1><span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">Studio</span></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" /> Live generator</div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
        <section className="fade-up relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-border bg-card px-5 py-10 md:px-10 md:py-14">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative flex flex-col gap-5">
            <span className="section-kicker flex items-center gap-2"><Sparkles size={13} className="text-primary" aria-hidden="true" /> Creative utility / 01</span>
            <h2 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-6xl">Make every character<br className="hidden sm:block" /> <span className="italic text-primary">impossible to ignore.</span></h2>
            <div className="flex max-w-3xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">Craft rich text effects visually, preview every change instantly, and export clean markup for Unity, HTML, or BBCode.</p>
              <div className="flex flex-wrap gap-2">{['10 effects', '3 formats', 'Live preview'].map((item) => <span key={item} className="rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{item}</span>)}</div>
            </div>
          </div>
        </section>

        <nav className="workflow-strip fade-up [animation-delay:60ms]" aria-label="Colorizer workflow">
          {[['01', 'Compose'], ['02', 'Style'], ['03', 'Export']].map(([step, label], index) => (
            <div key={step} className="workflow-step">
              <span className="workflow-number">{step}</span>
              <span>{label}</span>
              {index < 2 && <span className="workflow-line" aria-hidden="true" />}
            </div>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
          <section className="studio-card fade-up [animation-delay:80ms]" aria-labelledby="controls-heading">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="section-kicker mb-1">Controls</p><div className="flex items-center gap-2"><WandSparkles size={17} className="text-primary" aria-hidden="true" /><h3 id="controls-heading" className="font-semibold">Build your effect</h3></div></div><button type="button" onClick={() => { setText('Make every word stand out.'); setEffect('horizontal'); setColors(['#FF5C5C', '#35C8B4', '#F4C95D']) }} className="icon-button" aria-label="Reset settings"><RotateCcw size={15} /></button></div>
            <div className="flex flex-col gap-7 p-5 md:p-6">
              <label className="field-label">Your text<div className="prompt-shell"><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} maxLength={300} placeholder="Type something brilliant..." /><div className="flex items-center justify-between border-t border-border px-2 pt-2"><span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><Sparkles size={12} /> Live input</span><span className="font-mono text-[10px] text-muted-foreground">{text.length} / 300</span></div></div></label>

              <fieldset className="flex flex-col gap-3"><legend className="field-label">Color effect</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{effects.map((item) => <button key={item.value} type="button" onClick={() => setEffect(item.value)} className={`effect-button ${effect === item.value ? 'effect-button-active' : ''}`} aria-pressed={effect === item.value}>{item.label}</button>)}</div></fieldset>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between"><span className="field-label">Color palette</span>{effect === 'random' && <button type="button" onClick={() => setSeed((value) => value + 1)} className="small-button"><Dices size={15} /> Randomize</button>}</div>
                {visibleColorCount > 0 ? <div className="grid gap-3 sm:grid-cols-3">{colors.slice(0, visibleColorCount).map((color, index) => <label key={index} className="color-field"><span>{['Start', visibleColorCount === 2 ? 'End' : 'Middle', 'End'][index]}</span><div className="flex items-center gap-2"><input type="color" value={color} onChange={(event) => setColors((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value.toUpperCase() : item))} aria-label={`${['Start', 'Middle', 'End'][index]} color`} /><code>{color}</code></div></label>)}</div> : <div className="rounded-xl border border-dashed border-border bg-secondary p-4 text-sm text-muted-foreground">{effect === 'rainbow' || effect === 'pastelRainbow' ? 'A full-spectrum palette is generated automatically.' : 'A fresh color is generated for each character.'}</div>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Typeface<select value={font} onChange={(event) => setFont(event.target.value)} className="field">{fonts.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Font size<select value={size} onChange={(event) => setSize(event.target.value)} className="field">{[16, 20, 24, 32, 40, 48, 64].map((item) => <option key={item} value={item}>{item}px</option>)}</select></label></div>
              <div className="flex flex-wrap gap-3"><label className="toggle"><input type="checkbox" checked={bold} onChange={(event) => setBold(event.target.checked)} /><span className="font-bold">B</span> Bold</label><label className="toggle"><input type="checkbox" checked={italic} onChange={(event) => setItalic(event.target.checked)} /><span className="italic">I</span> Italic</label></div>
            </div>
          </section>

          <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <section className="studio-card fade-up [animation-delay:140ms]" aria-labelledby="preview-heading"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="section-kicker mb-1">Canvas</p><h3 id="preview-heading" className="font-semibold">Live preview</h3></div><span className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span className="status-pulse size-1.5 rounded-full bg-primary" /> Rendering</span></div><div className="preview-grid relative flex min-h-64 items-center justify-center overflow-hidden p-6 text-center"><span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground" aria-label={`${text.length} characters at ${size} pixels`}>{text.length} chars · {size}px</span><p className="max-w-full whitespace-pre-wrap break-words leading-tight" style={{ fontFamily: font === 'Default' ? 'inherit' : font, fontSize: `${size}px`, fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal' }}>{Array.from(text || 'Start typing…').map((char, index) => <span className="preview-character" key={`${effect}-${seed}-${index}-${char}`} style={{ color: characterColors[index] || '#A1A1AA', animationDelay: `${Math.min(index * 16, 320)}ms` }}>{char}</span>)}</p></div></section>

            <section className="studio-card fade-up [animation-delay:200ms]" aria-labelledby="code-heading"><div className="flex flex-col gap-4 border-b border-border px-5 py-4"><div><p className="section-kicker mb-1">Delivery</p><div className="flex items-center gap-2"><Code2 size={17} className="text-primary" /><h3 id="code-heading" className="font-semibold">Export code</h3></div></div><div className="max-w-full overflow-x-auto pb-0.5"><div className="tab-list" role="tablist" aria-label="Output format">{(['bbcode', 'html', 'unity'] as Format[]).map((item) => <button key={item} type="button" role="tab" aria-selected={format === item} onClick={() => setFormat(item)} className={`tab-button ${format === item ? 'tab-button-active' : ''}`}>{item === 'unity' ? 'Unity' : item.toUpperCase()}</button>)}</div></div></div><div className="flex flex-col gap-3 p-5"><textarea aria-label={`${format} output`} readOnly value={output} className="code-output" rows={8} /><button type="button" onClick={copyOutput} className="copy-button" aria-live="polite">{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Copied to clipboard' : `Copy ${format === 'unity' ? 'Unity' : format.toUpperCase()} code`}</button></div></section>
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">Originally created by David, modified by Kanati. Reimagined for the modern web.</footer>
    </div>
  )
}
*/

const state={text:'Make every word stand out.',effect:'horizontal',colors:['#FF5C5C','#35C8B4','#F4C95D'],font:'Default',size:32,bold:true,italic:false,format:'bbcode',seed:1};
const $=id=>document.getElementById(id),input=$('text-input'),preview=$('preview'),output=$('output');
function visibleColors(){return state.effect==='three'?3:state.effect==='solid'?1:['random','rainbow','pastelRainbow'].includes(state.effect)?0:2}
function getOutputs(colors){const chars=Array.from(state.text).map(escapeHtml),ws=c=>/\s/.test(c),body=(open,close)=>chars.map((c,i)=>ws(c)?c:`${open(colors[i])}${c}${close}`).join('');const unityBody=body(c=>`<color=${c}>`,'</color>'),htmlBody=body(c=>`<span style="color:${c}">`,'</span>'),bbBody=body(c=>`[color=${c}]`,'[/color]');return{unity:`${state.bold?'<b>':''}${state.italic?'<i>':''}<size=${state.size}>${unityBody}</size>${state.italic?'</i>':''}${state.bold?'</b>':''}`,html:`<span style="${state.font!=='Default'?`font-family:'${state.font}';`:''}font-size:${state.size}px;white-space:pre-wrap;${state.bold?'font-weight:700;':''}${state.italic?'font-style:italic;':''}">${htmlBody}</span>`,bbcode:`${state.bold?'[b]':''}${state.italic?'[i]':''}[size=${state.size}]${bbBody}[/size]${state.italic?'[/i]':''}${state.bold?'[/b]':''}`}}
function render(refreshControls=true){const cs=generateColors(state.text,state.effect,state.colors,state.seed),text=state.text||'Start typing…';$('count').textContent=`${state.text.length} / 300`;$('preview-meta').textContent=`${state.text.length} chars · ${state.size}px`;Object.assign(preview.style,{fontFamily:state.font==='Default'?'inherit':state.font,fontSize:`${state.size}px`,fontWeight:state.bold?'700':'400',fontStyle:state.italic?'italic':'normal'});preview.innerHTML=Array.from(text).map((c,i)=>c==='\n'?'<br>':`<span class="preview-char" style="color:${cs[i]||'#A1A1AA'};animation-delay:${Math.min(i*16,320)}ms">${c===' '?'&nbsp;':escapeHtml(c)}</span>`).join('');output.value=getOutputs(cs)[state.format];output.setAttribute('aria-label',`${state.format} output`);$('copy').querySelector('span').textContent=`Copy ${state.format==='bbcode'?'BBCode':state.format==='unity'?'Unity':'HTML'} code`;if(!refreshControls)return;$('effects').innerHTML=effects.map(e=>`<button class="effect-btn ${state.effect===e.value?'active':''}" data-effect="${e.value}" aria-pressed="${state.effect===e.value}">${e.label}</button>`).join('');const n=visibleColors(),names=n===3?['Start','Middle','End']:n===2?['Start','End']:['Color'];$('randomize').hidden=state.effect!=='random';$('color-fields').innerHTML=n?state.colors.slice(0,n).map((c,i)=>`<label class="color-field"><span>${names[i]}</span><div><input type="color" value="${c}" data-color="${i}" aria-label="${names[i]} color"><code>${c}</code></div></label>`).join(''):'';$('palette-note').hidden=!!n;$('palette-note').textContent=['rainbow','pastelRainbow'].includes(state.effect)?'A full-spectrum palette is generated automatically.':'A fresh color is generated for each character.'}
$('effects').onclick=e=>{const b=e.target.closest('[data-effect]');if(b){state.effect=b.dataset.effect;render()}};$('color-fields').oninput=e=>{if(e.target.dataset.color!==undefined){state.colors[+e.target.dataset.color]=e.target.value.toUpperCase();e.target.closest('.color-field').querySelector('code').textContent=state.colors[+e.target.dataset.color];render(false)}};input.oninput=()=>{state.text=input.value;render()};$('font').onchange=e=>{state.font=e.target.value;render()};$('size').oninput=e=>{state.size=+e.target.value;$('size-output').value=`${state.size}px`;render()};['bold','italic'].forEach(k=>$(k).onclick=()=>{state[k]=!state[k];$(k).classList.toggle('on',state[k]);$(k).setAttribute('aria-checked',state[k]);render()});$('randomize').onclick=()=>{state.seed++;render()};$('reset').onclick=()=>{Object.assign(state,{text:'Make every word stand out.',effect:'horizontal',colors:['#FF5C5C','#35C8B4','#F4C95D'],font:'Default',size:32,bold:true,italic:false,format:'bbcode',seed:1});input.value=state.text;$('font').value='Default';$('size').value=32;$('size-output').value='32px';$('bold').classList.add('on');$('italic').classList.remove('on');render()};$('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-format]');if(b){state.format=b.dataset.format;document.querySelectorAll('[data-format]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));render()}},true);
$('copy').onclick=async()=>{let ok=false;try{if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(output.value);ok=true}}catch{}if(!ok){output.focus();output.select();ok=document.execCommand('copy')}if(ok){$('copy').querySelector('span').textContent='Copied to clipboard';$('announcement').textContent='Code copied to clipboard';setTimeout(render,1600)}};document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.toggle,.color-field');if(!el)return;if(navigator.vibrate)navigator.vibrate(e.pointerType==='touch'?12:6);el.classList.remove('tap-pop');void el.offsetWidth;el.classList.add('tap-pop');if(el.tagName==='BUTTON'){const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height)*1.45,x=document.createElement('i');x.className='click-ripple';Object.assign(x.style,{width:`${s}px`,height:`${s}px`,left:`${e.clientX-r.left-s/2}px`,top:`${e.clientY-r.top-s/2}px`});el.append(x);x.onanimationend=()=>x.remove()}});render();
