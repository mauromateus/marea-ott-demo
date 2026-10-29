"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[458],{528(e,t,n){n.d(t,{A:()=>i});var l=n(9950),a=n(9342);const r={link:{done:"common.copy.link.done",failed:"common.copy.link.failed"},report:{done:"common.copy.report.done",failed:"common.copy.report.failed"}};function i(e,t="link"){const n=(0,l.useRef)(null),[i,o]=(0,l.useState)(""),{done:d,failed:s}=r[t],c=(0,l.useCallback)(async()=>{try{return await navigator.clipboard.writeText(e),void o((0,a.Tl)(d))}catch(t){}if(n.current){(e=>{const t=window.getSelection(),n=document.createRange();n.selectNodeContents(e),t.removeAllRanges(),t.addRange(n)})(n.current);try{if(document.execCommand("copy"))return void o((0,a.Tl)(d))}catch(t){}}o((0,a.Tl)(s))},[e,d,s]);return{ref:n,copy:c,message:i}}},6077(e,t,n){n.r(t),n.d(t,{default:()=>W});var l=n(9950),a=n.n(l),r=n(3402),i=n(4963),o=n(7623),d=n(8773),s=n(7328);const c=r.Ay.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.pill};
  background: ${({theme:e})=>e.colors.surface};
`,m=r.Ay.button`
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: ${({theme:e})=>e.radii.pill};
  background: transparent;
  color: ${({theme:e})=>e.colors.textMuted};
  font-family: ${({theme:e})=>e.fonts.heading};
  font-weight: 600;

  &:hover { color: ${({theme:e})=>e.colors.text}; }
  &[aria-selected='true'] { background: ${({theme:e})=>e.colors.accent}; color: #04211e; }
`,p=r.Ay.div`
  margin-top: 16px;
  padding: 18px 20px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.md};
  background: ${({theme:e})=>e.colors.surface};
`;function u({idPrefix:e,label:t,tabs:n,defaultTab:r}){const[i,o]=(0,l.useState)(()=>n.some(e=>e.id===r)?r:n[0].id),d=(0,l.useRef)({}),s=n.find(e=>e.id===i)||n[0],u=e=>{var t;o(e),null===(t=d.current[e])||void 0===t||t.focus()};return a().createElement("div",null,a().createElement(c,{role:"tablist","aria-label":t},n.map((t,l)=>a().createElement(m,{key:t.id,ref:e=>{d.current[t.id]=e},type:"button",role:"tab",id:`${e}-tab-${t.id}`,"aria-selected":t.id===s.id,"aria-controls":`${e}-panel-${t.id}`,tabIndex:t.id===s.id?0:-1,onClick:()=>u(t.id),onKeyDown:e=>((e,t)=>{const l=n.length-1,a={ArrowRight:t===l?0:t+1,ArrowDown:t===l?0:t+1,ArrowLeft:0===t?l:t-1,ArrowUp:0===t?l:t-1,Home:0,End:l}[e.key];void 0!==a&&(e.preventDefault(),u(n[a].id))})(e,l)},t.label))),a().createElement(p,{role:"tabpanel",id:`${e}-panel-${s.id}`,"aria-labelledby":`${e}-tab-${s.id}`,tabIndex:0},s.content))}const h=r.Ay.div`
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.md};
  background: ${({theme:e})=>e.colors.surface};

  & + & { margin-top: 10px; }
`,f=r.Ay.h3`
  font-size: 1rem;
`,g=r.Ay.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 0 18px;
  border: 0;
  border-radius: ${({theme:e})=>e.radii.md};
  background: transparent;
  font-family: ${({theme:e})=>e.fonts.heading};
  font-size: 1.05rem;
  font-weight: 600;
  text-align: left;

  svg { flex: none; color: ${({theme:e})=>e.colors.accent}; transition: transform 0.2s ease; }
  &[aria-expanded='true'] svg { transform: rotate(180deg); }

  @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
`,b=r.Ay.div`
  padding: 0 18px 18px;
`,x=()=>a().createElement("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false"},a().createElement("path",{d:"m6 9 6 6 6-6"}));function y({idPrefix:e,items:t,defaultOpen:n=[]}){const[r,i]=(0,l.useState)(()=>new Set([].concat(n)));return a().createElement("div",null,t.map(t=>{const n=r.has(t.id);return a().createElement(h,{key:t.id},a().createElement(f,null,a().createElement(g,{type:"button",id:`${e}-button-${t.id}`,"aria-expanded":n,"aria-controls":`${e}-region-${t.id}`,onClick:()=>{return e=t.id,i(t=>{const n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n});var e}},t.title,a().createElement(x,null))),a().createElement(b,{role:"region",id:`${e}-region-${t.id}`,"aria-labelledby":`${e}-button-${t.id}`,hidden:!n},t.content))}))}var w=n(528),E=n(6489),$=n(8185),v=n(9342),k=n(4318),A=n(1625);var T=n(8021);function z(e){let t="";for(let n=0;n<e.size;n++)for(let l=0;l<e.size;l++)e.get(n,l)&&(t+=`M${l} ${n}h1v1h-1z`);return t}const M=r.Ay.div`
  width: min(100%, 240px);
  padding: 12px;
  border-radius: ${({theme:e})=>e.radii.md};
  background: #fff;
  line-height: 0;

  svg { width: 100%; height: auto; }
`;function S({value:e,label:t}){const n=(0,l.useMemo)(()=>{try{const{modules:t}=T.create(e,{errorCorrectionLevel:"M"});return{size:t.size,path:z(t)}}catch(t){return null}},[e]);if(!n)return null;const r=n.size+8;return a().createElement(M,null,a().createElement("svg",{role:"img","aria-label":t,viewBox:`-4 -4 ${r} ${r}`,shapeRendering:"crispEdges",xmlns:"http://www.w3.org/2000/svg"},a().createElement("rect",{x:-4,y:-4,width:r,height:r,fill:"#fff"}),a().createElement("path",{d:n.path,fill:"#000"})))}const C=["(max-width: 767px)","(pointer: coarse)"],L=()=>C.some(e=>{try{return!(!window.matchMedia||!window.matchMedia(e).matches)}catch(t){return!1}});const R=r.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  max-width: 880px;
  margin: 0 auto;
  width: 100%;

  > * { max-width: 100%; }
`,q=r.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  h1 { font-size: clamp(2rem, 7vw, 2.8rem); }
`,I=r.Ay.p`
  color: ${({theme:e})=>e.colors.textMuted};
  font-size: 1.1rem;
`,j=r.Ay.p`
  margin-top: 6px;
  padding: 6px 14px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.pill};
  background: ${({theme:e})=>e.colors.surface};
  font-size: 0.95rem;
  font-weight: 500;

  &[data-installed='true'] { border-color: ${({theme:e})=>e.colors.accent}; color: ${({theme:e})=>e.colors.accent}; }
`,P=r.Ay.div`
  width: 100%;
`,D=r.Ay.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 20px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.md};
  background: ${({theme:e})=>e.colors.surface};
`,U=r.Ay.div`
  flex: 1 1 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  h2 { font-size: 1.15rem; }
`,B=r.Ay.code`
  display: block;
  max-width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({theme:e})=>e.colors.border};
  border-radius: ${({theme:e})=>e.radii.sm};
  background: ${({theme:e})=>e.colors.background};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  user-select: all;
  -webkit-user-select: all;
`,O=r.Ay.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 14px;
`,_=r.Ay.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  counter-reset: step;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    counter-increment: step;
  }

  li::before {
    content: counter(step);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${({theme:e})=>e.colors.accent};
    color: #04211e;
    font-size: 0.9rem;
    font-weight: 700;
  }
`,F=r.Ay.p`
  color: ${({theme:e})=>e.colors.textMuted};
  font-size: 0.9rem;
`,G={android:["install.steps.android.1","install.steps.android.2","install.steps.android.3"],iphone:["install.steps.iphone.1","install.steps.iphone.2","install.steps.iphone.3"],desktop:["install.steps.desktop.1","install.steps.desktop.2","install.steps.desktop.3"]},H={android:"install.tabs.android",iphone:"install.tabs.iphone",desktop:"install.tabs.desktop"},K=["android","iphone","desktop"],N=({platform:e,name:t})=>a().createElement(_,null,G[e].map(e=>a().createElement("li",{key:e},(0,v.Tl)(e,{name:t}))));function W(){const{config:e,platform:t}=(0,$.U)(),n=e.brand.name,r=(0,l.useMemo)(()=>function({origin:e=window.location.origin,basename:t=(0,A.A)()}={}){return`${e}${t}/`}(),[]),c=function(e){var t;const n=null===e||void 0===e||null===(t=e.install)||void 0===t?void 0:t.apkUrl,l="string"===typeof n?n.trim():"";return/^https?:\/\//i.test(l)?l:""}(e),[m]=(0,l.useState)(k.ji),p=function(){const[e,t]=(0,l.useState)(L);return(0,l.useEffect)(()=>{if(!window.matchMedia)return;const e=C.map(e=>window.matchMedia(e)),n=()=>t(L());return e.forEach(e=>e.addEventListener?e.addEventListener("change",n):e.addListener(n)),n(),()=>e.forEach(e=>e.removeEventListener?e.removeEventListener("change",n):e.removeListener(n))},[]),e}(),{canShow:h}=(0,s.A)(),{ref:f,copy:g,message:b}=(0,w.A)(r,"link"),x="android"===t||"pwa-web"===t||m.isStandalone,T=function(e){return null!==e&&void 0!==e&&e.isIos?"iphone":null!==e&&void 0!==e&&e.isAndroid?"android":"desktop"}(m),z=p&&!h&&!x,M=!p;return a().createElement(R,null,a().createElement(i.mg,null,a().createElement("title",null,(0,v.Tl)("install.pageTitle"))),a().createElement(q,null,a().createElement("h1",null,(0,v.Tl)("install.title",{name:n})),a().createElement(I,null,(0,v.Tl)("install.lead")),a().createElement(j,{role:"status","aria-label":(0,v.Tl)("install.status.label"),"data-installed":x},(0,v.Tl)(x?"install.status.installed":"install.status.notInstalled"))),a().createElement(d.A,{large:!0}),z&&a().createElement(P,null,a().createElement(y,{idPrefix:"install-steps",defaultOpen:T,items:[{id:T,title:(0,v.Tl)(H[T]),content:a().createElement(N,{platform:T,name:n})}]})),M&&a().createElement(D,{"aria-labelledby":"install-qr-heading"},a().createElement(S,{value:r,label:(0,v.Tl)("install.qr.label",{name:n})}),a().createElement(U,null,a().createElement("h2",{id:"install-qr-heading"},(0,v.Tl)("install.qr.heading")),a().createElement("p",null,(0,v.Tl)("install.qr.hint")),a().createElement(B,{ref:f,tabIndex:0},r),a().createElement(O,null,a().createElement(o.$n,{type:"button",$variant:"secondary",onClick:g},(0,v.Tl)("install.qr.copy")),a().createElement("span",{role:"status"},b)))),M&&a().createElement(P,null,a().createElement(u,{idPrefix:"install-tabs",label:(0,v.Tl)("install.tabs.label"),defaultTab:T,tabs:K.map(e=>({id:e,label:(0,v.Tl)(H[e]),content:a().createElement(N,{platform:e,name:n})}))})),c&&a().createElement(D,{"aria-labelledby":"install-apk-heading"},a().createElement(U,null,a().createElement("h2",{id:"install-apk-heading"},(0,v.Tl)("install.apk.heading")),a().createElement("p",null,(0,v.Tl)("install.apk.hint")),a().createElement(F,null,(0,v.Tl)("install.apk.note")),a().createElement(O,null,a().createElement(o.eI,{href:c,download:!0,rel:"noopener"},a().createElement(E.dG,null),(0,v.Tl)("install.apk.download"))))))}}}]);