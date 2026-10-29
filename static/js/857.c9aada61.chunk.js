"use strict";(globalThis.webpackChunkmarea_ott_demo||=[]).push([[857],{8141(e,t,l){l.d(t,{A:()=>b});var r=l(9950),a=l.n(r),i=l(3402),n=l(3047),o=l(8537),s=l(7623),c=l(6489),d=l(3571),m=l(8695),p=l(9342);const h=i.i7`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`,u=i.Ay.section`
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
`,g=i.Ay.svg`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 200%;
  height: 55%;
  color: rgba(255, 255, 255, 0.12);
  pointer-events: none;
  animation: ${h} 24s linear infinite;
`,y=i.Ay.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`,f=i.Ay.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,x=i.Ay.h2`
  font-size: ${({$large:e})=>e?"clamp(1.9rem, 4vw, 2.8rem)":"clamp(1.5rem, 3vw, 1.9rem)"};
  font-weight: 700;

  a { border-radius: ${({theme:e})=>e.radii.sm}; }
`,E=i.Ay.p`
  color: rgba(255, 255, 255, 0.85);
  max-width: 46ch;
`,w=i.Ay.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`,$=()=>a().createElement(g,{viewBox:"0 0 800 120",preserveAspectRatio:"none","aria-hidden":"true"},a().createElement("path",{fill:"currentColor",d:"M0 60 C 100 20, 200 100, 300 60 S 500 20, 600 60 S 700 100, 800 60 L800 120 L0 120 Z"}),a().createElement("path",{fill:"currentColor",opacity:"0.7",d:"M0 80 C 100 50, 200 110, 300 80 S 500 50, 600 80 S 700 110, 800 80 L800 120 L0 120 Z"})),v=e=>`live-card-${e}-title`;function b({kind:e,title:t,description:l,to:r,large:i=!1}){const{status:h,isPlaying:g,toggle:b}=(0,m.RN)(),k="audio"===e,A=k&&"loading"===h;return a().createElement(u,{$kind:e,$large:i,"aria-labelledby":v(e)},a().createElement($,null),a().createElement(y,null,a().createElement(o.A,null),k&&a().createElement(d.A,{active:g})),a().createElement(f,null,a().createElement(x,{id:v(e),$large:i},a().createElement(n.N_,{to:r},t)),l&&a().createElement(E,null,l),a().createElement(w,null,k?a().createElement(s.$n,{type:"button",onClick:b,disabled:A,"aria-label":g?(0,p.Tl)("player.pauseNamed",{title:t}):(0,p.Tl)("home.card.listenNamed",{title:t})},A?a().createElement(c.Nl,null):g?a().createElement(c.E$,null):a().createElement(c.ud,null),A?(0,p.Tl)("player.connecting"):g?(0,p.Tl)("player.pause"):(0,p.Tl)("home.card.listen")):a().createElement(s.vx,{to:r},a().createElement(c.ud,null)," ",(0,p.Tl)("home.card.watch")),k&&a().createElement(s.vx,{to:r,$variant:"secondary"},(0,p.Tl)("home.card.openRadio")))))}l.d(t,["K",0,$])},5091(e,t,l){l.r(t),l.d(t,{default:()=>_});var r=l(9950),a=l.n(r),i=l(3402),n=l(4963),o=l(8185),s=l(8141),c=l(3047),d=l(4546),m=l(4663),p=l(4473),h=l(5864),u=l(3803);l(9011);const g=i.Ay.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: ${({$ratio:e})=>100*e}%; /* height / width; aspect-ratio is missing on older TV browsers */
  overflow: hidden;
  background: linear-gradient(${({$angle:e})=>e}deg, ${({$from:e})=>e}, ${({$to:e})=>e});

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.34);
  }
`,y={waves:a().createElement("g",{fill:"none",stroke:"currentColor",strokeWidth:"3"},[170,195,220,245].map((e,t)=>a().createElement("path",{key:e,d:`M-10 ${e} C 30 ${e-28-3*t}, 70 ${e+28}, 105 ${e} S 175 ${e-28}, 215 ${e}`}))),rings:a().createElement("g",{fill:"none",stroke:"currentColor",strokeWidth:"2.5"},[28,52,78,106].map(e=>a().createElement("circle",{key:e,cx:"140",cy:"110",r:e}))),peaks:a().createElement("path",{fill:"currentColor",opacity:"0.8",d:"M0 300 L0 200 L55 130 L95 190 L140 100 L200 210 L200 300 Z"}),dots:a().createElement("g",{fill:"currentColor"},Array.from({length:30},(e,t)=>a().createElement("circle",{key:t,cx:22+t%5*38,cy:34+38*Math.floor(t/5),r:t%3===0?5:3}))),lines:a().createElement("g",{stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"},Array.from({length:9},(e,t)=>a().createElement("line",{key:t,x1:28*t-20,y1:"300",x2:60+28*t,y2:"0"}))),sun:a().createElement("g",{fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"},a().createElement("circle",{cx:"100",cy:"120",r:"34",fill:"currentColor",opacity:"0.7",stroke:"none"}),Array.from({length:12},(e,t)=>{const l=t*Math.PI/6;return a().createElement("line",{key:t,x1:100+50*Math.cos(l),y1:120+50*Math.sin(l),x2:100+70*Math.cos(l),y2:120+70*Math.sin(l)})})),grid:a().createElement("g",{stroke:"currentColor",strokeWidth:"1.8"},Array.from({length:7},(e,t)=>a().createElement("line",{key:`v${t}`,x1:34*t,y1:"0",x2:34*t,y2:"300"})),Array.from({length:10},(e,t)=>a().createElement("line",{key:`h${t}`,x1:"0",y1:34*t,x2:"200",y2:34*t}))),arcs:a().createElement("g",{fill:"none",stroke:"currentColor",strokeWidth:"3"},[40,70,100,130].map(e=>a().createElement("path",{key:e,d:`M${100-e} 300 A ${e} ${e} 0 0 1 ${100+e} 300`})))};function f({from:e,to:t,angle:l=135,glyph:r="waves",ratio:i=1.5}){return a().createElement(g,{$from:e,$to:t,$angle:l,$ratio:i,"aria-hidden":"true"},a().createElement("svg",{viewBox:"0 0 200 300",preserveAspectRatio:"xMidYMid slice"},y[r]||y.waves))}var x=l(9342);d.A.use([m.A,p.A]);const E=()=>({enabled:!0,prevSlideMessage:(0,x.Tl)("home.rail.a11y.prev"),nextSlideMessage:(0,x.Tl)("home.rail.a11y.next"),firstSlideMessage:(0,x.Tl)("home.rail.a11y.first"),lastSlideMessage:(0,x.Tl)("home.rail.a11y.last"),slideLabelMessage:(0,x.Tl)("home.rail.a11y.slide")}),w=i.Ay.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`,$=i.Ay.h2`
  font-size: clamp(1.15rem, 2.4vw, 1.4rem);
  font-weight: 600;
`,v=i.Ay.p`
  min-height: 1.4em;
  color: ${({theme:e})=>e.colors.textMuted};
  font-size: 0.85rem;
`,b=i.Ay.div`
  .swiper-slide {
    width: ${({$wide:e})=>e?"clamp(210px, 32vw, 280px)":"clamp(130px, 22vw, 180px)"};
    padding: 6px 2px 10px;
  }
`,k=i.AH`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;

  &:hover > div:first-child,
  &:focus-visible > div:first-child {
    box-shadow: ${({theme:e})=>e.shadows.glow};
    transform: translateY(-3px);
  }
`,A=i.Ay.button`${k}`,M=(0,i.Ay)(c.N_)`
  ${k}
  color: inherit;
  text-decoration: none;
`,C=i.Ay.div`
  border-radius: ${({theme:e})=>e.radii.md};
  overflow: hidden;
  box-shadow: ${({theme:e})=>e.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`,T=i.Ay.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: ${({$ratio:e})=>100*e}%; /* height / width; aspect-ratio is missing on older TV browsers */
  background: ${({theme:e})=>e.colors.surfaceAlt};

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`,L=i.Ay.div`
  padding: 10px 2px 0;

  strong { display: block; font-weight: 600; font-size: 0.95rem; line-height: 1.3; }
  span { display: block; color: ${({theme:e})=>e.colors.textMuted}; font-size: 0.8rem; margin-top: 2px; }
`;function S({rail:e}){const[t,l]=(0,r.useState)(null),[i,n]=(0,r.useState)(""),o=(0,r.useMemo)(E,[]),s=e.items.some(e=>e.thumbnail),c=e=>{t&&(t.el.scrollLeft=0,t.slideTo(e))};return a().createElement(w,{"aria-labelledby":`rail-${e.id}`},a().createElement($,{id:`rail-${e.id}`},e.title),a().createElement(v,{role:"status"},i),a().createElement(b,{$wide:s},a().createElement(h.R,{onSwiper:l,slidesPerView:"auto",spaceBetween:14,freeMode:!0,keyboard:{enabled:!0},a11y:o},e.items.map((e,t)=>{const l=a().createElement(a().Fragment,null,a().createElement(C,null,e.thumbnail?a().createElement(T,{$ratio:e.thumbnail.height/e.thumbnail.width},a().createElement("img",{src:e.thumbnail.url,alt:"",loading:"lazy"})):a().createElement(f,{from:e.artwork.from,to:e.artwork.to,angle:e.artwork.angle,glyph:e.artwork.glyph})),a().createElement(L,null,a().createElement("strong",null,e.title),a().createElement("span",null,e.meta)));return a().createElement(u.q,{key:e.id},e.thumbnail?a().createElement(M,{to:`/ver/${e.id}`,onFocus:()=>c(t)},l):a().createElement(A,{type:"button",onFocus:()=>c(t),onClick:()=>n((0,x.Tl)("home.rail.exampleNotice",{title:e.title}))},l))}))))}const N=i.Ay.p`
  color: ${({theme:e})=>e.colors.textMuted};
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({theme:e})=>e.colors.textMuted};
    flex: none;
  }
`;function z(){return a().createElement(N,null,(0,x.Tl)("common.exampleNote"))}const F=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`,B=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h1 { font-size: clamp(1.8rem, 4.5vw, 2.8rem); }
  p { color: ${({theme:e})=>e.colors.textMuted}; }
`,W=i.Ay.div`
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({theme:e})=>e.breakpoints.md}) {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  }
`,R=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;function _(){const{config:e}=(0,o.U)(),{brand:t,players:l,rails:r}=e,i=r.some(e=>e.sample);return a().createElement(F,null,a().createElement(n.mg,null,a().createElement("title",null,(0,x.Tl)("home.pageTitle"))),a().createElement(B,null,a().createElement("h1",null,t.name),a().createElement("p",null,t.tagline)),a().createElement(W,{role:"region","aria-label":(0,x.Tl)("home.liveNow")},a().createElement(s.A,{kind:"video",large:!0,title:l.video.title,description:l.video.description,to:"/tv"}),a().createElement(s.A,{kind:"audio",large:!0,title:l.audio.title,description:l.audio.description,to:"/radio"})),a().createElement(R,null,i&&a().createElement(z,null),r.map(e=>a().createElement(S,{key:e.id,rail:e}))))}}}]);