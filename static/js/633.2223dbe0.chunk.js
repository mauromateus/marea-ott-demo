"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[633],{7126(e,t,n){n.d(t,{A:()=>x});var r=n(9950),a=n.n(r),l=n(3402),o=n(7623),i=n(9342),c=n(155),d=n(8185),u=n(1457),s=n(1131),m=n(7197),p=n(6065),y=n(1903),v=n(1625);const f="marea-video-player";const g=l.Ay.div`
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
`;function x({media:e}){const{status:t,retry:n,isLive:l,containerId:x}=function({media:e}={}){const{config:t,npaw:n}=(0,d.U)(),{trackPlayerReady:a,trackPlayerTime:l}=(0,u.W)(),o=(0,c.Xr)(m.DK),i=(0,c.md)(m.DK),[g,h]=(0,c.fp)(m.Fb),[E,x]=(0,r.useState)("loading"),[w,k]=(0,r.useState)(0),b=(0,r.useRef)(null),T=e||t.players.video,A="live"===(T.type||"live"),P=t.app.ottName,R=(0,r.useRef)({});R.current={trackPlayerReady:a,trackPlayerTime:l,media:T,ottName:P,npaw:n},(0,r.useEffect)(()=>{let e=!1;x("loading");const t=()=>(0,s.A)({media:R.current.media,kind:"video",ottName:R.current.ottName,page:(0,v.p)(window.location.pathname)}),n={onPlayerReady:()=>R.current.trackPlayerReady({content:t()}),onTimeUpdate:e=>R.current.trackPlayerTime({currentTime:e,content:t()}),onPlay:()=>{o("video"),h(!0)},onVideoStop:()=>h(!1),onVideoEnd:()=>h(!1)};return(0,p.A)(f,(0,y.A)({media:R.current.media,npaw:R.current.npaw,events:n}),{onEvicted:()=>{e||(b.current=null,h(!1),x("evicted"))}}).then(t=>{e?t.strategy.destroy():(b.current=t,x("ready"))}).catch(()=>{e||x("error")}),()=>{e=!0,h(!1);const t=b.current;b.current=null,t&&t.strategy.destroy()}},[w,T.id,o,h]),(0,r.useEffect)(()=>{var e,t,n;"audio"===i&&g&&(null===(e=b.current)||void 0===e||null===(t=(n=e.player).pause)||void 0===t||t.call(n))},[i,g]);const $=(0,r.useCallback)(()=>k(e=>e+1),[]);return(0,r.useMemo)(()=>({status:E,retry:$,isLive:A,containerId:f}),[E,$,A])}({media:e});return a().createElement(g,null,a().createElement(h,{id:x}),"loading"===t&&a().createElement(E,{role:"status"},(0,i.Tl)(l?"player.loadingLive":"player.loadingVod")),"evicted"===t&&a().createElement(E,{role:"status"},a().createElement("span",null,(0,i.Tl)("player.evicted")),a().createElement(o.$n,{type:"button",onClick:n},(0,i.Tl)(l?"player.resumeTv":"player.resumeVod"))),"error"===t&&a().createElement(E,{role:"alert"},a().createElement("span",null,(0,i.Tl)("errors.playerLoad")),a().createElement(o.$n,{type:"button",onClick:n},(0,i.Tl)("errors.retry"))))}},3633(e,t,n){n.r(t),n.d(t,{default:()=>m});var r=n(9950),a=n.n(r),l=n(3402),o=n(4963),i=n(8185),c=n(7126),d=n(8537);const u=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1040px;
  margin: 0 auto;
`,s=l.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); }
  p { color: ${({theme:e})=>e.colors.textMuted}; }
`;function m(){const{config:e}=(0,i.U)(),{title:t,description:n}=e.players.video;return a().createElement(u,null,a().createElement(o.mg,null,a().createElement("title",null,t)),a().createElement(c.A,null),a().createElement(s,null,a().createElement(d.A,null),a().createElement("h1",null,t),a().createElement("p",null,n)))}}}]);