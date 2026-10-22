"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[232],{8232(e,t,n){n.r(t),n.d(t,{default:()=>A});var r=n(9950),a=n.n(r),l=n(3402),o=n(4963),i=n(8185),c=n(7623),d=n(2371),u=n(155),s=n(1457),m=n(1131),p=n(7197),y=n(6065),v=n(1903),f=n(1625);const g="marea-video-player";const h=l.Ay.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: ${({theme:e})=>e.radii.lg};
  background: #05080f;
  box-shadow: ${({theme:e})=>e.shadows.card};
`,E=l.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`,x=l.Ay.div`
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
`;function w(){const{status:e,retry:t,containerId:n}=function(){const{config:e,npaw:t}=(0,i.U)(),{trackPlayerReady:n,trackPlayerTime:a}=(0,s.W)(),l=(0,u.Xr)(p.DK),o=(0,u.md)(p.DK),[c,d]=(0,u.fp)(p.Fb),[h,E]=(0,r.useState)("loading"),[x,w]=(0,r.useState)(0),k=(0,r.useRef)(null),b=e.players.video,T=e.app.ottName,A=(0,r.useRef)({});A.current={trackPlayerReady:n,trackPlayerTime:a,media:b,ottName:T,npaw:t},(0,r.useEffect)(()=>{let e=!1;E("loading");const t=()=>(0,m.A)({media:A.current.media,kind:"video",ottName:A.current.ottName,page:(0,f.p)(window.location.pathname)}),n={onPlayerReady:()=>A.current.trackPlayerReady({content:t()}),onTimeUpdate:e=>A.current.trackPlayerTime({currentTime:e,content:t()}),onPlay:()=>{l("video"),d(!0)},onVideoStop:()=>d(!1),onVideoEnd:()=>d(!1)};return(0,y.A)(g,(0,v.A)({media:A.current.media,npaw:A.current.npaw,events:n}),{onEvicted:()=>{e||(k.current=null,d(!1),E("evicted"))}}).then(t=>{e?t.strategy.destroy():(k.current=t,E("ready"))}).catch(()=>{e||E("error")}),()=>{e=!0,d(!1);const t=k.current;k.current=null,t&&t.strategy.destroy()}},[x,l,d]),(0,r.useEffect)(()=>{var e,t,n;"audio"===o&&c&&(null===(e=k.current)||void 0===e||null===(t=(n=e.player).pause)||void 0===t||t.call(n))},[o,c]);const P=(0,r.useCallback)(()=>w(e=>e+1),[]);return(0,r.useMemo)(()=>({status:h,retry:P,containerId:g}),[h,P])}();return a().createElement(h,null,a().createElement(E,{id:n}),"loading"===e&&a().createElement(x,{role:"status"},(0,d.Tl)("player.loadingLive")),"evicted"===e&&a().createElement(x,{role:"status"},a().createElement("span",null,(0,d.Tl)("player.evicted")),a().createElement(c.$n,{type:"button",onClick:t},(0,d.Tl)("player.resumeTv"))),"error"===e&&a().createElement(x,{role:"alert"},a().createElement("span",null,(0,d.Tl)("errors.playerLoad")),a().createElement(c.$n,{type:"button",onClick:t},(0,d.Tl)("errors.retry"))))}var k=n(8537);const b=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1040px;
  margin: 0 auto;
`,T=l.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); }
  p { color: ${({theme:e})=>e.colors.textMuted}; }
`;function A(){const{config:e}=(0,i.U)(),{title:t,description:n}=e.players.video;return a().createElement(b,null,a().createElement(o.mg,null,a().createElement("title",null,t)),a().createElement(w,null),a().createElement(T,null,a().createElement(k.A,null),a().createElement("h1",null,t),a().createElement("p",null,n)))}}}]);