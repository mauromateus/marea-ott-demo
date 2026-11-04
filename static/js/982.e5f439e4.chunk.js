"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[982],{528(e,l,t){t.d(l,{A:()=>o});var n=t(9950),r=t(9342);const a={link:{done:"common.copy.link.done",failed:"common.copy.link.failed"},report:{done:"common.copy.report.done",failed:"common.copy.report.failed"}};function o(e,l="link"){const t=(0,n.useRef)(null),[o,i]=(0,n.useState)(""),{done:s,failed:d}=a[l],u=(0,n.useCallback)(async()=>{try{return await navigator.clipboard.writeText(e),void i((0,r.Tl)(s))}catch(l){}if(t.current){(e=>{const l=window.getSelection(),t=document.createRange();t.selectNodeContents(e),l.removeAllRanges(),l.addRange(t)})(t.current);try{if(document.execCommand("copy"))return void i((0,r.Tl)(s))}catch(l){}}i((0,r.Tl)(d))},[e,s,d]);return{ref:t,copy:u,message:o}}},7982(e,l,t){t.r(l),t.d(l,{default:()=>J});var n=t(9950),r=t.n(n),a=t(3402),o=t(4963),i=t(7623),s=t(8185),d=t(9342),u=t(5672),c=t(6517),m=t(1919),p=t(4510);function g({config:e,platformDetails:l,online:t=navigator.onLine}){var n;return{platform:l.platform,platformSource:l.source,analyticsAppName:(0,m.A)(e,l.platform),appVersion:null===e||void 0===e||null===(n=e.app)||void 0===n?void 0:n.version,displayMode:(0,p.Up)(),referrer:document.referrer,userAgent:window.navigator.userAgent,serviceWorkerControlling:"undefined"!==typeof navigator&&"serviceWorker"in navigator?navigator.serviceWorker.controller?"yes":"no":"not supported",online:t,launchQuery:window.location.search,sessionPlatform:c.A.getItem(p.Lf)||"",url:window.location.href,viewport:`${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio||1}x`,generatedAt:(new Date).toISOString()}}var b=t(528);var f=t(5462),v=t(7981),w=t(5495),y=t(205),h=t(5960),T=t(4318);const $={available:"debug.install.card.available","closed-session":"debug.install.card.closedSession",snoozed:"debug.install.card.snoozed","hidden-installed":"debug.install.card.hiddenInstalled","hidden-platform":"debug.install.card.hiddenPlatform","hidden-route":"debug.install.card.hiddenRoute","no-offer":"debug.install.card.noOffer"},k={[y.er.EVERY_LOAD]:"debug.install.reappear.everyLoad",[y.er.SESSION]:"debug.install.reappear.session",[y.er.PROGRESSIVE]:"debug.install.reappear.progressive"},E=e=>(0,d.Tl)(e?"debug.install.yes":"debug.install.no"),x=({code:e,params:l})=>(0,d.Tl)($[e],"snoozed"===e?{until:new Date(l.until).toLocaleString("es")}:void 0),A=({mode:e,days:l})=>e===y.er.DAYS?1===l?(0,d.Tl)("debug.install.reappear.day"):(0,d.Tl)("debug.install.reappear.days",{days:l}):(0,d.Tl)(k[e]);function S(){var e,l;const{platform:t,config:r}=(0,s.U)(),a=null===r||void 0===r||null===(e=r.install)||void 0===e||null===(l=e.sheet)||void 0===l?void 0:l.reappear,o=(0,n.useMemo)(()=>(0,y.yk)(a),[a]),{pathname:i}=(0,f.zy)(),{canInstall:u}=(0,v.A)(),[m]=(0,n.useState)(()=>(0,T.ji)().isIos),g=c.A.getItem(p.Lf)||"",{dismissedAt:b,dismissCount:$,sessionDismissed:k}=(0,w.v2)(),S=!0===h.A.getItem(w.nL),M=function({canInstall:e,platform:l,storedPlatform:t,dismissedAt:n,dismissCount:r,sessionDismissed:a=!1,policy:o=(0,y.yk)(),installedMark:i,now:s=Date.now(),isIos:d=!1,quietRoute:u=!1}){if("web"!==l)return{code:"hidden-platform",params:{platform:l,storedPlatform:t}};if(i&&!e)return{code:"hidden-installed",params:{}};const c=(0,y.i4)({policy:o,dismissedAt:n,dismissCount:r,sessionDismissed:a,now:s});return c.hidden?"session"===c.scope?{code:"closed-session",params:{}}:{code:"snoozed",params:{until:c.until}}:e||d?u?{code:"hidden-route",params:{}}:{code:"available",params:{}}:{code:"no-offer",params:{}}}({canInstall:u,platform:t,storedPlatform:g,dismissedAt:b,dismissCount:$,sessionDismissed:k,policy:o,installedMark:S,isIos:m,quietRoute:(0,w.uq)(i)});return function({platform:e,canInstall:l,storedPlatform:t,installedMark:n,summary:r,policy:a}){return[{id:"offered",label:(0,d.Tl)("debug.install.label.offered"),value:E(l)},{id:"platform",label:(0,d.Tl)("debug.label.platform"),value:e},{id:"storedPlatform",label:(0,d.Tl)("debug.install.label.storedPlatform"),value:t?String(t):(0,d.Tl)("debug.install.storedPlatformNone")},{id:"card",label:(0,d.Tl)("debug.install.label.card"),value:x(r)},{id:"reappear",label:(0,d.Tl)("debug.install.label.reappear"),value:A(a)},{id:"installedMark",label:(0,d.Tl)("debug.install.label.installedMark"),value:E(n)}]}({platform:t,canInstall:u,storedPlatform:g,installedMark:S,summary:M,policy:o})}const M={status:"none",version:null,waiting:!1};async function R({container:e=("undefined"!==typeof navigator?navigator.serviceWorker:void 0),Channel:l=("undefined"!==typeof MessageChannel?MessageChannel:null),timers:t={setTimeout:(e,l)=>setTimeout(e,l),clearTimeout:e=>clearTimeout(e)},timeoutMs:n=2e3}={}){const r=await(async e=>{try{return e?await e.getRegistration():void 0}catch(l){return}})(e);if(!r)return M;const a=!!r.waiting,o=await((e,{Channel:l,timers:t,timeoutMs:n})=>new Promise(r=>{if(!e||!l)return void r(null);let a;const o=e=>{t.clearTimeout(a),r(e)};try{const r=new l;r.port1.onmessage=e=>{var l;return o("VERSION"===(null===(l=e.data)||void 0===l?void 0:l.type)&&e.data.main||null)},a=t.setTimeout(()=>o(null),n),e.postMessage({type:"GET_VERSION"},[r.port2])}catch(i){o(null)}}))(r.active,{Channel:l,timers:t,timeoutMs:n});return o?{status:"answered",version:o,waiting:a}:{status:"unanswered",version:null,waiting:a}}var I=t(5553);const C=e=>(0,d.Tl)(e?"debug.yes":"debug.no"),P=e=>"yes"===e?(0,d.Tl)("debug.yes"):"no"===e?(0,d.Tl)("debug.no"):(0,d.Tl)("debug.unsupported"),L=e=>e||(0,d.Tl)("debug.none"),D=e=>e||(0,d.Tl)("debug.empty"),W=e=>e?"answered"===e.status?e.version:(0,d.Tl)("none"===e.status?"debug.worker.none":"debug.worker.noResponse"):(0,d.Tl)("debug.worker.checking"),N=e=>e?(0,d.Tl)(e.waiting?"debug.worker.waitingYes":"debug.worker.waitingNo"):(0,d.Tl)("debug.worker.checking");const V=()=>"undefined"!==typeof navigator?navigator.serviceWorker:void 0;function O(){const[e]=(0,n.useState)(()=>(0,I.P)()),[l,t]=(0,n.useState)(()=>V()?null:M);return(0,n.useEffect)(()=>{const e=V();if(!e)return;let l=!0;const n=()=>R().then(e=>{l&&t(e)});return n(),e.addEventListener("controllerchange",n),()=>{l=!1,e.removeEventListener("controllerchange",n)}},[]),function({running:e,worker:l}){return[{id:"runningVersion",label:(0,d.Tl)("debug.label.runningVersion"),value:L(e)},{id:"workerVersion",label:(0,d.Tl)("debug.label.workerVersion"),value:W(l)},{id:"workerWaiting",label:(0,d.Tl)("debug.label.workerWaiting"),value:N(l)}]}({running:e,worker:l})}const z=a.Ay.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.md};
  overflow: hidden;

  @media (min-width: ${({theme:e})=>e.breakpoints.sm}) {
    grid-template-columns: 240px minmax(0, 1fr);
  }
`,Q=a.Ay.dt`
  padding: 12px 16px 0;
  color: ${({theme:e})=>e.colors.textMuted};
  font-size: 0.85rem;
  background: ${({theme:e})=>e.colors.surface};

  @media (min-width: ${({theme:e})=>e.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({theme:e})=>e.colors.border};
    &:first-of-type { border-top: 0; }
  }
`,F=a.Ay.dd`
  margin: 0;
  padding: 2px 16px 12px;
  background: ${({theme:e})=>e.colors.surface};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  overflow-wrap: anywhere;

  strong { color: ${({theme:e})=>e.colors.accent}; }

  @media (min-width: ${({theme:e})=>e.breakpoints.sm}) {
    padding: 12px 16px;
    border-top: 1px solid ${({theme:e})=>e.colors.border};
    &:nth-of-type(1) { border-top: 0; }
  }
`,U=a.Ay.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
`,_=a.Ay.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`,q=a.Ay.p`
  color: ${({theme:e})=>e.colors.textMuted};
  max-width: 68ch;
`;function Y({rows:e}){return r().createElement(_,{"aria-labelledby":"debug-install-title"},r().createElement("h2",{id:"debug-install-title"},(0,d.Tl)("debug.install.title")),r().createElement(q,null,(0,d.Tl)("debug.install.lead")),r().createElement(z,null,e.map(({id:e,label:l,value:t})=>r().createElement(r().Fragment,{key:e},r().createElement(Q,null,l),r().createElement(F,null,t)))))}const j=a.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`,G=a.Ay.p`
  color: ${({theme:e})=>e.colors.textMuted};
  max-width: 68ch;
`,H=a.Ay.pre`
  margin: 0;
  padding: 16px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.md};
  background: ${({theme:e})=>e.colors.surface};
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  user-select: text;
  -webkit-user-select: text;
`;function J(){const{config:e}=(0,s.U)(),{diagnostics:l,events:t}=function(){const{config:e,platform:l,platformSource:t}=(0,s.U)(),[r,a]=(0,n.useState)(navigator.onLine),[o,i]=(0,n.useState)(()=>u.A.getRecentEvents()),[d,c]=(0,n.useState)(()=>g({config:e,platformDetails:{platform:l,source:t},online:r}));return(0,n.useEffect)(()=>{const e=()=>a(!0),l=()=>a(!1);return window.addEventListener("online",e),window.addEventListener("offline",l),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",l)}},[]),(0,n.useEffect)(()=>u.A.subscribe(()=>i(u.A.getRecentEvents())),[]),(0,n.useEffect)(()=>{const n=()=>c(g({config:e,platformDetails:{platform:l,source:t},online:r}));n();const a=navigator.serviceWorker;return null===a||void 0===a||a.addEventListener("controllerchange",n),()=>null===a||void 0===a?void 0:a.removeEventListener("controllerchange",n)},[e,l,t,r]),{diagnostics:d,events:o}}(),a=S(),c=O(),m=function(e,l,t="Marea",n=[],r=[]){const a=[(0,d.Tl)("debug.report.title",{name:t,date:e.generatedAt}),"",`${(0,d.Tl)("debug.label.platform")}: ${e.platform} (${e.platformSource})`,`${(0,d.Tl)("debug.label.appName")}: ${L(e.analyticsAppName)}`,`${(0,d.Tl)("debug.label.appVersion")}: ${L(e.appVersion)}`,`${(0,d.Tl)("debug.label.displayMode")}: ${e.displayMode}`,`${(0,d.Tl)("debug.label.referrer")}: ${D(e.referrer)}`,`${(0,d.Tl)("debug.label.launchQuery")}: ${L(e.launchQuery)}`,`${(0,d.Tl)("debug.label.sessionPlatform")}: ${L(e.sessionPlatform)}`,`${(0,d.Tl)("debug.label.serviceWorker")}: ${P(e.serviceWorkerControlling)}`,...r.map(({label:e,value:l})=>`${e}: ${l}`),`${(0,d.Tl)("debug.label.online")}: ${C(e.online)}`,`${(0,d.Tl)("debug.label.url")}: ${e.url}`,`${(0,d.Tl)("debug.label.viewport")}: ${e.viewport}`,`${(0,d.Tl)("debug.label.userAgent")}: ${e.userAgent}`,"",...(o=n,o.length?[(0,d.Tl)("debug.install.title"),...o.map(({label:e,value:l})=>`${e}: ${l}`),""]:[]),(0,d.Tl)("debug.report.events",{count:l.length})];var o;return l.slice().reverse().forEach(({at:e,payload:l})=>{a.push(`${new Date(e).toISOString()} ${JSON.stringify(l)}`)}),a.join("\n")}(l,t,e.brand.name,a,c),{reportRef:p,copy:f,message:v}=function(e){const{ref:l,copy:t,message:n}=(0,b.A)(e,"report");return{reportRef:l,copy:t,message:n}}(m),w=[[(0,d.Tl)("debug.label.platform"),r().createElement(r().Fragment,null,r().createElement("strong",null,l.platform)," (",l.platformSource,")")],[(0,d.Tl)("debug.label.appName"),r().createElement("strong",null,L(l.analyticsAppName))],[(0,d.Tl)("debug.label.displayMode"),l.displayMode],[(0,d.Tl)("debug.label.referrer"),D(l.referrer)],[(0,d.Tl)("debug.label.launchQuery"),L(l.launchQuery)],[(0,d.Tl)("debug.label.sessionPlatform"),L(l.sessionPlatform)],[(0,d.Tl)("debug.label.serviceWorker"),P(l.serviceWorkerControlling)],...c.map(({label:e,value:l})=>[e,l]),[(0,d.Tl)("debug.label.online"),C(l.online)],[(0,d.Tl)("debug.label.userAgent"),l.userAgent]];return r().createElement(j,null,r().createElement(o.mg,null,r().createElement("title",null,(0,d.Tl)("debug.pageTitle"))),r().createElement("h1",null,(0,d.Tl)("debug.title")),r().createElement(G,null,(0,d.Tl)("debug.lead")),r().createElement(z,null,w.map(([e,l])=>r().createElement(r().Fragment,{key:e},r().createElement(Q,null,e),r().createElement(F,null,l)))),r().createElement(Y,{rows:a}),r().createElement(U,null,r().createElement(i.$n,{type:"button",onClick:f},(0,d.Tl)("debug.copy")),r().createElement("span",{role:"status"},v)),r().createElement(H,{ref:p,tabIndex:0,"aria-label":(0,d.Tl)("debug.reportLabel")},m))}}}]);