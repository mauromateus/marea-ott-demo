"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[810],{7126(e,t,r){r.d(t,{A:()=>x});var a=r(9950),n=r.n(a),l=r(3402),i=r(7623),o=r(9342),c=r(155),d=r(8185),u=r(1457),s=r(1131),m=r(7197),p=r(6065),y=r(1903),v=r(1625);const f="marea-video-player";const g=l.Ay.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: ${({theme:e})=>e.radii.lg};
  background: #05080f;
  box-shadow: ${({theme:e})=>e.shadows.card};
`,h=l.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`,E=l.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 16px;
  text-align: center;
  color: ${({theme:e})=>e.colors.textMuted};
  pointer-events: none;

  button { pointer-events: auto; }
`;function x({media:e}){const{status:t,retry:r,isLive:l,containerId:x}=function({media:e}={}){const{config:t,npaw:r}=(0,d.U)(),{trackPlayerReady:n,trackPlayerTime:l}=(0,u.W)(),i=(0,c.Xr)(m.DK),o=(0,c.md)(m.DK),[g,h]=(0,c.fp)(m.Fb),[E,x]=(0,a.useState)("loading"),[w,k]=(0,a.useState)(0),b=(0,a.useRef)(null),T=e||t.players.video,A="live"===(T.type||"live"),P=t.app.ottName,$=(0,a.useRef)({});$.current={trackPlayerReady:n,trackPlayerTime:l,media:T,ottName:P,npaw:r},(0,a.useEffect)(()=>{let e=!1;x("loading");const t=()=>(0,s.A)({media:$.current.media,kind:"video",ottName:$.current.ottName,page:(0,v.p)(window.location.pathname)}),r={onPlayerReady:()=>$.current.trackPlayerReady({content:t()}),onTimeUpdate:e=>$.current.trackPlayerTime({currentTime:e,content:t()}),onPlay:()=>{i("video"),h(!0)},onVideoStop:()=>h(!1),onVideoEnd:()=>h(!1)};return(0,p.A)(f,(0,y.A)({media:$.current.media,npaw:$.current.npaw,events:r}),{onEvicted:()=>{e||(b.current=null,h(!1),x("evicted"))}}).then(t=>{e?t.strategy.destroy():(b.current=t,x("ready"))}).catch(()=>{e||x("error")}),()=>{e=!0,h(!1);const t=b.current;b.current=null,t&&t.strategy.destroy()}},[w,T.id,i,h]),(0,a.useEffect)(()=>{var e,t,r;"audio"===o&&g&&(null===(e=b.current)||void 0===e||null===(t=(r=e.player).pause)||void 0===t||t.call(r))},[o,g]);const R=(0,a.useCallback)(()=>k(e=>e+1),[]);return(0,a.useMemo)(()=>({status:E,retry:R,isLive:A,containerId:f}),[E,R,A])}({media:e});return n().createElement(g,null,n().createElement(h,{id:x}),"loading"===t&&n().createElement(E,{role:"status"},(0,o.Tl)(l?"player.loadingLive":"player.loadingVod")),"evicted"===t&&n().createElement(E,{role:"status"},n().createElement("span",null,(0,o.Tl)("player.evicted")),n().createElement(i.$n,{type:"button",onClick:r},(0,o.Tl)(l?"player.resumeTv":"player.resumeVod"))),"error"===t&&n().createElement(E,{role:"alert"},n().createElement("span",null,(0,o.Tl)("errors.playerLoad")),n().createElement(i.$n,{type:"button",onClick:r},(0,o.Tl)("errors.retry"))))}},7810(e,t,r){r.r(t),r.d(t,{default:()=>y});var a=r(9950),n=r.n(a),l=r(3402),i=r(4963),o=r(5462),c=r(8185),d=r(7126),u=r(7623),s=r(9342);const m=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1040px;
  margin: 0 auto;
`,p=l.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  h1 { font-size: clamp(1.4rem, 3.4vw, 2.1rem); }
  p { color: ${({theme:e})=>e.colors.textMuted}; }
`;function y(){const{id:e}=(0,o.g)(),{config:t}=(0,c.U)(),r=t.rails.flatMap(e=>e.items).find(t=>t.id===e),l=(0,a.useMemo)(()=>r&&{id:r.id,type:"media",title:r.title},[r]);return r?n().createElement(m,null,n().createElement(i.mg,null,n().createElement("title",null,r.title)),n().createElement(d.A,{media:l}),n().createElement(p,null,n().createElement("h1",null,r.title),r.meta&&n().createElement("p",null,r.meta),n().createElement(u.vx,{to:"/",$variant:"secondary"},(0,s.Tl)("vod.back")))):n().createElement(o.rd,{to:"/"})}}}]);