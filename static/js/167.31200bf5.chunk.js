"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[167],{8141(e,t,a){a.d(t,{A:()=>$});var l=a(9950),n=a.n(l),i=a(3402),r=a(3047),o=a(8537),d=a(7623),s=a(6489),c=a(3571),m=a(8695),p=a(9342);const u=i.i7`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`,g=i.Ay.section`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  min-height: ${({$large:e})=>e?"320px":"260px"};
  padding: clamp(20px, 3vw, 32px);
  border-radius: ${({theme:e})=>e.radii.lg};
  background: ${({$kind:e})=>"audio"===e?"linear-gradient(145deg, #3A1C71 0%, #7B2D5F 55%, #FF6B4A 130%)":"linear-gradient(145deg, #0F4C5C 0%, #134E5E 45%, #2EC4B6 140%)"};
  box-shadow: ${({theme:e})=>e.shadows.card};
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: ${({theme:e,$kind:t})=>"audio"===t?e.shadows.liveGlow:e.shadows.glow};
  }
`,h=i.Ay.svg`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 200%;
  height: 55%;
  color: rgba(255, 255, 255, 0.12);
  pointer-events: none;
  animation: ${u} 24s linear infinite;
`,E=i.Ay.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`,y=i.Ay.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,x=i.Ay.h2`
  font-size: ${({$large:e})=>e?"clamp(1.9rem, 4vw, 2.8rem)":"clamp(1.5rem, 3vw, 1.9rem)"};
  font-weight: 700;

  a { border-radius: ${({theme:e})=>e.radii.sm}; }
`,v=i.Ay.p`
  color: rgba(255, 255, 255, 0.85);
  max-width: 46ch;
`,w=i.Ay.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`,f=()=>n().createElement(h,{viewBox:"0 0 800 120",preserveAspectRatio:"none","aria-hidden":"true"},n().createElement("path",{fill:"currentColor",d:"M0 60 C 100 20, 200 100, 300 60 S 500 20, 600 60 S 700 100, 800 60 L800 120 L0 120 Z"}),n().createElement("path",{fill:"currentColor",opacity:"0.7",d:"M0 80 C 100 50, 200 110, 300 80 S 500 50, 600 80 S 700 110, 800 80 L800 120 L0 120 Z"})),b=e=>`live-card-${e}-title`;function $({kind:e,title:t,description:a,to:l,large:i=!1}){const{status:u,isPlaying:h,toggle:$}=(0,m.RN)(),A="audio"===e,T=A&&"loading"===u;return n().createElement(g,{$kind:e,$large:i,"aria-labelledby":b(e)},n().createElement(f,null),n().createElement(E,null,n().createElement(o.A,null),A&&n().createElement(c.A,{active:h})),n().createElement(y,null,n().createElement(x,{id:b(e),$large:i},n().createElement(r.N_,{to:l},t)),a&&n().createElement(v,null,a),n().createElement(w,null,A?n().createElement(d.$n,{type:"button",onClick:$,disabled:T,"aria-label":h?(0,p.Tl)("player.pauseNamed",{title:t}):(0,p.Tl)("home.card.listenNamed",{title:t})},T?n().createElement(s.Nl,null):h?n().createElement(s.E$,null):n().createElement(s.ud,null),T?(0,p.Tl)("player.connecting"):h?(0,p.Tl)("player.pause"):(0,p.Tl)("home.card.listen")):n().createElement(d.vx,{to:l},n().createElement(s.ud,null)," ",(0,p.Tl)("home.card.watch")),A&&n().createElement(d.vx,{to:l,$variant:"secondary"},(0,p.Tl)("home.card.openRadio")))))}a.d(t,["K",0,f])},4167(e,t,a){a.r(t),a.d(t,{default:()=>x});var l=a(9950),n=a.n(l),i=a(3402),r=a(4963),o=a(8185),d=a(8695),s=a(8537),c=a(7623),m=a(6489),p=a(3571),u=a(8141),g=a(9342);const h=i.Ay.section`
  position: relative;
  overflow: hidden;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: clamp(28px, 6vw, 56px) clamp(20px, 5vw, 48px);
  text-align: center;
  border-radius: ${({theme:e})=>e.radii.lg};
  background: linear-gradient(145deg, #3A1C71 0%, #7B2D5F 55%, #FF6B4A 130%);
  box-shadow: ${({theme:e})=>e.shadows.card};

  > *:not(svg) { position: relative; }
  h1 { font-size: clamp(1.9rem, 5vw, 3rem); }
  p { color: rgba(255, 255, 255, 0.85); }
`,E=(0,i.Ay)(c.$n)`
  min-width: 190px;
  min-height: 56px;
  font-size: 1.1rem;
`,y={idle:"radio.status.idle",loading:"radio.status.loading",playing:"radio.status.playing",paused:"radio.status.paused",error:"radio.status.error"};function x(){const{config:e}=(0,o.U)(),{status:t,isPlaying:a,toggle:l}=(0,d.RN)(),{title:i,description:c}=e.players.audio,x="loading"===t;return n().createElement(h,{"aria-labelledby":"radio-title"},n().createElement(r.mg,null,n().createElement("title",null,i)),n().createElement(u.K,null),n().createElement(s.A,null),n().createElement(p.A,{active:a,size:44}),n().createElement("h1",{id:"radio-title"},i),n().createElement("p",null,c),n().createElement(E,{type:"button",onClick:l,disabled:x,"aria-label":a?(0,g.Tl)("player.pauseNamed",{title:i}):(0,g.Tl)("player.playNamed",{title:i})},x?n().createElement(m.Nl,null):a?n().createElement(m.E$,null):n().createElement(m.ud,null),x?(0,g.Tl)("player.connecting"):a?(0,g.Tl)("player.pause"):(0,g.Tl)("player.play")),n().createElement("p",{role:"status"},(0,g.Tl)(y[t])))}}}]);