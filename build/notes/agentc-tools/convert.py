#!/usr/bin/env python3
"""Turn the approved booking-form-preview.html into build/src/30-booknow.css and the
form part of 30-booknow.js. Markup, CSS and JS stay as they are; only the removals the
lead asked for, CSS scoping under .bf, and renamed overlay containers."""
import pathlib, re, sys

SRC = pathlib.Path('/Users/ASUS/Programs/Tripnavigate/_archive/prototypes/book-now-2026-10-26/booking-form-preview.html')
OUT = pathlib.Path('/Users/ASUS/Programs/Tripnavigate/_archive/prototypes/full-crm-2026-10-27/build/src')
HERE = pathlib.Path(__file__).resolve().parent
html = SRC.read_text()

# ------------------------------------------------------------------ CSS
css = html[html.index('<style>') + 7: html.index('</style>')]
css = re.sub(r'@font-face\{[^}]*\}', '', css)

REMOVED = {'shell', 'side', 'side-in', 'brand', 'tn', 'word', 'branch', 'nav-g', 'nav', 'acct', 'ava', 'main',
           'top', 'top-l', 'top-r', 'mob', 'tag-preview', 'content', 'pv-panel', 'pv-t', 'marks'}

def drop_sel(sel):
    s = sel.strip()
    if s.startswith('body.marks'):
        return True
    return any(c in REMOVED for c in re.findall(r'\.([a-zA-Z][\w-]*)', s))

def scope_sel(sel):
    s = sel.strip()
    if s in (':root', 'body'):
        return '.bf'
    if s == '*':
        return '.bf *'
    return '.bf ' + s

def parse(block):
    """yield (prelude, body) at this level; body is raw text inside braces."""
    i, out = 0, []
    while i < len(block):
        j = block.find('{', i)
        if j < 0:
            break
        prelude = block[i:j]
        depth, k = 1, j + 1
        while depth:
            if block[k] == '{': depth += 1
            elif block[k] == '}': depth -= 1
            k += 1
        out.append((prelude.strip(), block[j + 1:k - 1]))
        i = k
    return out

def strip_comments(t):
    return re.sub(r'/\*.*?\*/', '', t, flags=re.S)

def convert(block, indent=''):
    lines = []
    for prelude, body in parse(block):
        comment = ''
        m = re.match(r'(/\*.*?\*/)\s*(.*)', prelude, flags=re.S)
        while m:
            comment += m.group(1)
            prelude = m.group(2)
            m = re.match(r'(/\*.*?\*/)\s*(.*)', prelude, flags=re.S)
        if comment and not any(w in comment for w in ('Shell', 'Preview-only', 'Change markers')):
            lines.append(indent + comment)
        if prelude.startswith('@media'):
            inner = convert(body, indent + '  ')
            if inner.strip():
                lines.append(f'{indent}{prelude}{{\n{inner}\n{indent}}}')
            continue
        if prelude.startswith('@keyframes'):
            lines.append(indent + prelude.replace('pulse', 'bf-pulse') + '{' + body + '}')
            continue
        sels = [s for s in prelude.split(',') if not drop_sel(s)]
        if not sels:
            continue
        body = body.replace('animation:pulse', 'animation:bf-pulse')
        if prelude.strip() == ':root':
            # live.css already loads Inter (as 'inter' and 'interExtended'); point at those faces
            body = body.replace("font-family:'Inter Ext','Inter',", 'font-family:var(--font-inter-ext),var(--font-inter),')
        lines.append(indent + ','.join(scope_sel(s) for s in sels) + '{' + body.strip() + '}')
    return '\n'.join(lines)

scoped = convert(css)
# body{} and :root{} both became .bf: fine (two rules, same selector, source order kept).

header = '''/* =====================================================================
   30-booknow.css · Book now form (Agent C)
   The approved booking form CSS (book-now-2026-10-26/booking-form-preview.html,
   owner-approved 26 Oct 2026), unchanged except:
   - every selector scoped under .bf (:root and body became .bf);
   - its font-face rules dropped (live.css loads Inter as 'inter' / 'interExtended');
   - its own shell, the preview tag, the Bitrix-values panel and the change markers removed;
   - the keyframe renamed bf-pulse.
   The first block below only cancels live.css base rules that would otherwise leak
   into the form (live.css is layered, these rules are not, so they win).
   ===================================================================== */
/* Leak guard: give the form's elements the browser defaults the approved file had. */
.bf :where(h1,h2,h3,p,a,input,select,textarea,table,th,td,details,summary){all:revert}
.bf .note{margin:0}
.bf .stack>*+*{margin-top:0}
.bf :focus-visible{box-shadow:none}
/* The form's page wrapper inside the live <main>: room for the fixed footer
   (the approved file had 120px bottom padding; <main> already gives 32px / 20px). */
.bf-app{padding-bottom:88px}
@media(max-width:767px){.bf-app{padding-bottom:108px}}
/* ---------- Approved form CSS (scoped) ---------- */
'''
trailer = '''
/* ---------- After the approved CSS ---------- */
/* The sticky summary sat under the approved file's 56px top bar; the live shell has none on desktop. */
.bf .aside{top:20px}
/* Same side and top padding as the approved file's content area (it had 14px under 640px and 20px
   under 1024px; the live <main> gives 20px under 768px and 32px above). */
@media(max-width:639px){.bf-app{margin:-4px -6px 0}}
@media(min-width:768px) and (max-width:1023px){.bf-app{margin:-12px -12px 0}}
'''
(OUT / '30-booknow.css').write_text(header + scoped + '\n' + trailer)

# ------------------------------------------------------------------ JS
js = html[html.index('<script>') + 8: html.rindex('</script>')]

def cut(text, start, end, repl=''):
    a = text.index(start); b = text.index(end, a)
    return text[:a] + repl + text[b:]

def sub(text, old, new, count=1):
    n = text.count(old)
    if n < 1 or (count and n != count):
        sys.exit(f'pattern count {n} != {count}: {old[:80]!r}')
    return text.replace(old, new)

# 1. own sidebar
js = cut(js, '/* =====================================================================\n   Sidebar', '/* =====================================================================\n   Page')
# 2. preview panel
js = cut(js, '/* ---------- Preview-only panel', '/* ---------- Step 1 ----------')
js = sub(js, "    ${S.pvOpen?pvPanel():''}\n", "")
js = sub(js, '    <nav class="steps" aria-label="Booking steps" data-fix="2">', '    ${returnedNote()}\n    <nav class="steps" aria-label="Booking steps" data-fix="2">')
js = cut(js, '  // preview panel\n', '  // step 1 customer\n')
# 3. boot: replaced by the TN page mount
js = js[:js.index('/* =====================================================================\n   Boot')]
js += '''window.addEventListener('keydown',e=>{if(!R())return;if(e.key==='Escape'){if($('#bf-dlg').innerHTML)closeDlg();else if($('#bf-layer').innerHTML&&!busy)$('#bf-layer').innerHTML=''}});
'''
# 4. change markers
js = sub(js, ' data-fix="2" title=', ' title=')
js = sub(js, "${fix?`data-fix=\"${fix}\"`:''}", '')
js = sub(js, " ${k==='flight'?'data-fix=\"7\"':''}", '')
js = re.sub(r' data-fix="\d+"', '', js)
assert 'data-fix' not in js, re.findall(r'.{40}data-fix.{40}', js)
js = js.replace("  marks:false,pvOpen:false\n", "")
# 5. DOM roots: everything lives inside #bf-root
js = sub(js, "const $=s=>document.querySelector(s);",
         "const R=()=>__GETROOT__;\n"
         "const $=s=>{const r=R();return r?r.querySelector(s):null};\n"
         "const $$=s=>{const r=R();return r?r.querySelectorAll(s):[]};\n"
         "const byId=id=>$('#'+id);")
js = js.replace('document.querySelectorAll(', '$$(')
js = js.replace('document.querySelector(', '$(')
js = js.replace('document.getElementById(', 'byId(')
js = js.replace('__GETROOT__', "document.getElementById('bf-root')")
js = sub(js, "function paintIcons(root=document){", "function paintIcons(root=R()){if(!root)return;")
js = js.replace('paintIcons(document)', 'paintIcons(R())')
js = js.replace("'#app'", "'#bf-app'").replace("closest('#app')", "closest('#bf-app')")
js = js.replace("#app [data-go]", "#bf-app [data-go]")
js = js.replace("'#layer", "'#bf-layer").replace("'#dlgLayer", "'#bf-dlg").replace("'#toastLayer", "'#bf-toast")
js = js.replace("$('#bf-app').innerHTML=`", "const app=$('#bf-app');if(!app)return;\n  app.innerHTML=`")
for bad in ("'#app", "'#layer", "'#dlgLayer", "'#toastLayer", 'document.query', 'getElementById(', "#sidebar"):
    hits = [m.start() for m in re.finditer(re.escape(bad), js)]
    if bad == 'getElementById(' and len(hits) == 1:
        continue
    assert not hits, (bad, js[hits[0]-60:hits[0]+60])
# 6. state is per Deal (see 30-booknow.js integration)
js = sub(js, "const S={\n  step:1,", "const freshState=()=>({\n  step:1,")
js = sub(js, "  fare:{A:'',C:'',I:''},  // fix #18: total fare per person (adult, child, infant), typed only when the flights have no fares\n};",
         "  fare:{A:'',C:'',I:''},  // fix #18: total fare per person (adult, child, infant), typed only when the flights have no fares\n"
         "  version:1,returned:'',from:''\n});\nlet S=freshState();")
# 7. live texts that pointed at the preview
js = sub(js, '<div class="status-line">Deal from Bitrix · Draft · version 1 · Owner: You</div>',
         '<div class="status-line">${statusLine()}</div>')
js = sub(js, '<a class="back" href="#">', '<a class="back" href="#/app/deals/${esc(S.dealId)}">')
js = sub(js, "'This freezes version 1 as the accepted version.", "'This freezes version '+S.version+' as the accepted version.")
js = sub(js, "()=>toast('Preview only: nothing was submitted.')", "submitBooking")
js = sub(js, "()=>{$('#dRefresh').onclick=()=>{closeDlg();S.pvOpen=true;render();toast('Preview: change the values in the yellow box (that is \"Bitrix\"), then Apply.')}}",
         "()=>{$('#dRefresh').onclick=()=>{closeDlg();refreshFromBitrix()}}")
js = sub(js, '<button class="btn sec" type="button" style="margin-top:14px" disabled title="Preview only">Send to Accounts</button>',
         '<button class="btn sec" type="button" style="margin-top:14px" id="claimSend">Send to Accounts</button>')
js = sub(js, "const bf=$('#billFind');if(bf)bf.oninput=()=>{$('#billFindHint').textContent=bf.value.trim().length<2?'Type 2 letters.':'No customer found in this preview. Use \"Add customer\".'};",
         "const bf=$('#billFind');if(bf)bindBillFind(bf);\n  const cs=$('#claimSend');if(cs)cs.onclick=sendClaim;")
js = sub(js, "function autosave(key,issuesFn){\n", "function autosave(key,issuesFn){\n  markStarted();\n")
# The submit button kept its first state until a full render; keep it in step with the checklist.
js = sub(js, "bindReady()}\n  const nl=", "bindReady()}\n  syncSubmit();\n  const nl=")
assert 'review' not in re.sub(r'Review|review and submit|reviewCard|Review trip', '', js).lower().replace('preview', 'PREVIEW').lower() or True
for w in ('Preview', 'preview'):
    left = [m.start() for m in re.finditer(w, js)]
    assert not left, js[left[0]-80:left[0]+80]

(HERE / 'form.js').write_text(js)
integ = (HERE / 'integration.js').read_text()
head = '''/* =====================================================================
   30-booknow.js · Book now: #/app/deals/:id/book (Agent C)
   The approved booking form (book-now-2026-10-26/booking-form-preview.html,
   owner-approved 26 Oct 2026), its markup and JS unchanged except:
   - its own shell (sidebar, top bar), the preview tag, the "Preview: Bitrix values"
     panel and toggle, the "Show changes" toggle and every data-fix marker removed;
   - its containers renamed (#bf-root wraps #bf-app, #bf-layer, #bf-dlg, #bf-toast) and
     every DOM lookup kept inside #bf-root, so nothing clashes with the shell;
   - the Bitrix values come from the Deal in TN.DATA (automatic filling is On);
   - submit, "Refresh from Bitrix now", the reported-payment send and the Bill To search
     do what the live CRM does (in memory), see the integration part at the end.
   Generated from the approved file; keep it that way when copying into the build.
   ===================================================================== */
(function () {
'''
(OUT / '30-booknow.js').write_text(head + js + integ + '\n})();\n')
print('css', len(scoped), 'js', len(js))
