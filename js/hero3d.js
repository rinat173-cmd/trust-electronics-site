/* Trust Electronics — scroll-driven TRUE 3D hero journey (self-contained, no libraries).
   Loads only on the home page; safely does nothing if there is no .sstage element. */
(function(){
  var stage=document.querySelector('.sstage'), wrap=document.querySelector('.sstage__vp'), cv=document.getElementById('heroFx');
  if(!stage||!wrap||!cv) return;
  var scenes=[].slice.call(wrap.querySelectorAll('.sscene')), hint=wrap.querySelector('.sstage__hint');
  var ctx=cv.getContext('2d'), W=0,H=0,DPR=1;
  function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=wrap.clientWidth;H=wrap.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
  window.addEventListener('resize',resize);
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Full journey plays on refresh/first-visit; a calm compact hero shows when returning from another page.
  var navType='navigate';
  try{var _ne=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(_ne&&_ne.type){navType=_ne.type;}else if(performance.navigation){navType=['navigate','reload','back_forward','prerender'][performance.navigation.type]||'navigate';}}catch(e){}
  if(navType==='reload'){try{sessionStorage.removeItem('te_hero_seen');}catch(e){}} // refresh -> replay
  var seen=false; try{seen=sessionStorage.getItem('te_hero_seen')==='1';}catch(e){}
  try{sessionStorage.setItem('te_hero_seen','1');}catch(e){}
  if(seen){stage.classList.add('sstage--seen');}
  function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function norm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
  var BW=3000,BH=1900;
  var comps=[
    {x:-800,z:-300,w:520,d:380,h:160,label:'DSP',sub:'MIXED-SIGNAL',spec:'Mixed-signal & DSP design'},
    {x:900,z:350,w:600,d:420,h:180,label:'RF FRONT-END',sub:'2–100 GHz',spec:'GaN & GaAs MMIC'},
    {x:150,z:-650,w:340,d:260,h:120,label:'MCU',sub:'CONTROL',spec:'Embedded control'},
    {x:-150,z:520,w:720,d:340,h:130,label:'Design. Build. Deliver.',sub:'',brand:true,spec:'Trust Electronics'},
    {x:1150,z:-560,w:280,d:200,h:150,label:'POWER',sub:'',spec:'Power regulation'},
    {x:-1200,z:250,w:130,d:130,h:250,cap:true},
    {x:-1200,z:500,w:120,d:120,h:210,cap:true},
    {x:520,z:-150,w:140,d:140,h:230,cap:true}
  ];
  var particles=[];for(var i=0;i<120;i++){particles.push({x:(Math.random()-.5)*BW*1.1,y:60+Math.random()*640,z:(Math.random()-.5)*BH*1.1});}
  var traces=[
    [[-540,-300],[150,-300],[150,-520]],
    [[280,-650],[1150,-650]],
    [[900,140],[900,-300],[280,-300]],
    [[-150,350],[900,350]],
    [[-800,-110],[-800,520],[-510,520]],
    [[150,-520],[1150,-520],[1150,-410]]
  ];
  var vias=[];for(var vi=0;vi<240;vi++){vias.push([(Math.random()-.5)*BW*0.98,(Math.random()-.5)*BH*0.98]);}
  var smd=[];for(var si2=0;si2<48;si2++){smd.push({x:(Math.random()-.5)*BW*0.95,z:(Math.random()-.5)*BH*0.95,r:Math.random()<.5});}
  var etraces=[];(function(){for(var k=0;k<28;k++){var sx=(Math.random()-.5)*BW*0.9,sz=(Math.random()-.5)*BH*0.9,m1=sx+(Math.random()-.5)*900,e2=sz+(Math.random()-.5)*900;etraces.push([[sx,sz],[m1,sz],[m1,e2]]);}})();
  var kf=[
    {p:0.00,fx:0,fz:80,dist:5400,pitch:1.05,yaw:0.16},
    {p:0.11,fx:0,fz:0,dist:2500,pitch:0.60,yaw:-0.22},
    {p:0.25,fx:-800,fz:-300,dist:660,pitch:0.34,yaw:0.55},
    {p:0.40,fx:0,fz:0,dist:2300,pitch:0.58,yaw:0.05},
    {p:0.55,fx:900,fz:350,dist:720,pitch:0.32,yaw:-0.55},
    {p:0.70,fx:0,fz:0,dist:2300,pitch:0.58,yaw:0.10},
    {p:0.85,fx:-150,fz:520,dist:680,pitch:0.30,yaw:0.30},
    {p:1.00,fx:0,fz:-100,dist:2900,pitch:0.66,yaw:-0.15}
  ];
  var sceneAt=[0.02,0.13,0.25,0.55,0.85,0.99];
  function sstep(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
  function kfAt(p){var i=0;for(;i<kf.length-1;i++){if(p<=kf[i+1].p)break;}if(i>=kf.length-1)i=kf.length-2;var a=kf[i],b=kf[i+1],t=sstep((p-a.p)/((b.p-a.p)||1));return{fx:a.fx+(b.fx-a.fx)*t,fz:a.fz+(b.fz-a.fz)*t,dist:a.dist+(b.dist-a.dist)*t,pitch:a.pitch+(b.pitch-a.pitch)*t,yaw:a.yaw+(b.yaw-a.yaw)*t};}
  var cur={fx:0,fz:0,dist:2600,pitch:0.6,yaw:-0.25}, prog=0, tmx=0,tmy=0,mx=0,my=0, time=0;
  wrap.addEventListener('mousemove',function(e){var r=wrap.getBoundingClientRect();tmx=((e.clientX-r.left)/W-.5);tmy=((e.clientY-r.top)/H-.5);});
  wrap.addEventListener('mouseleave',function(){tmx=0;tmy=0;});
  var eye=[0,1000,2600],right=[1,0,0],up2=[0,1,0],fwd=[0,0,-1],f=800;
  function applyCam(d){
    mx+=(tmx-mx)*.06;my+=(tmy-my)*.06;
    cur.fx+=(d.fx-cur.fx)*.10;cur.fz+=(d.fz-cur.fz)*.10;cur.dist+=(d.dist-cur.dist)*.10;cur.pitch+=(d.pitch-cur.pitch)*.10;cur.yaw+=(d.yaw-cur.yaw)*.10;
    var yaw=cur.yaw+mx*0.25, pitch=Math.max(0.12,Math.min(1.4,cur.pitch+my*0.15));
    eye=[cur.fx+cur.dist*Math.cos(pitch)*Math.sin(yaw), cur.dist*Math.sin(pitch), cur.fz+cur.dist*Math.cos(pitch)*Math.cos(yaw)];
    var tgt=[cur.fx,140,cur.fz];
    fwd=norm(sub(tgt,eye));right=norm(cross(fwd,[0,1,0]));up2=cross(right,fwd);f=Math.min(W,H)*1.15;
  }
  var COMPACT_CAM={fx:0,fz:0,dist:2500,pitch:0.58,yaw:-0.15};
  function pr(P){var dx=sub(P,eye),vz=dot(dx,fwd);if(vz<40)return null;return [W/2+f*dot(dx,right)/vz, H/2-f*dot(dx,up2)/vz, vz];}
  function quad(p0,p1,p2,p3,fill,stroke,lw){if(!p0||!p1||!p2||!p3)return;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.lineTo(p3[0],p3[1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lw||1;ctx.strokeStyle=stroke;ctx.stroke();}}
  function fogA(vz){return Math.max(0.16,Math.min(1,1-(vz-500)/3200));}
  // load the Trust logo (with black background knocked out) to place on the brand chip
  var teLogo=null;
  (function(){var src=window.TE_LOGO||"assets/logo-trust.jpg";var im=new Image();im.onload=function(){try{var oc=document.createElement("canvas");oc.width=im.naturalWidth;oc.height=im.naturalHeight;var octx=oc.getContext("2d");octx.drawImage(im,0,0);var d=octx.getImageData(0,0,oc.width,oc.height),p=d.data;for(var i=0;i<p.length;i+=4){if(p[i]<60&&p[i+1]<60&&p[i+2]<60)p[i+3]=0;}octx.putImageData(d,0,0);teLogo=oc;}catch(e){teLogo=im;}};im.src=src;})();
  function drawComp(cp){
    var x0=cp.x-cp.w/2,x1=cp.x+cp.w/2,z0=cp.z-cp.d/2,z1=cp.z+cp.d/2,h=cp.h;
    var ctr=pr([cp.x,h/2,cp.z]), fg=ctr?fogA(ctr[2]):1;
    var B00=pr([x0,0,z0]),B10=pr([x1,0,z0]),B11=pr([x1,0,z1]),B01=pr([x0,0,z1]);
    var T00=pr([x0,h,z0]),T10=pr([x1,h,z0]),T11=pr([x1,h,z1]),T01=pr([x0,h,z1]);
    if(B00&&B10&&B11&&B01){ctx.save();ctx.globalAlpha=.24*fg;quad([B00[0]+10,B00[1]+7],[B10[0]+10,B10[1]+7],[B11[0]+10,B11[1]+7],[B01[0]+10,B01[1]+7],'#020609',null);ctx.restore();}
    if(cp.label){ctx.strokeStyle='rgba(214,206,150,'+(0.85*fg)+')';ctx.lineWidth=1.3;
      var perW=Math.max(3,Math.round(cp.w/70));for(var k=0;k<perW;k++){var fxp=x0+cp.w*(k+.5)/perW;var l1=pr([fxp,0,z0]),l2=pr([fxp,0,z0-40]);if(l1&&l2){ctx.beginPath();ctx.moveTo(l1[0],l1[1]);ctx.lineTo(l2[0],l2[1]);ctx.stroke();}var l3=pr([fxp,0,z1]),l4=pr([fxp,0,z1+40]);if(l3&&l4){ctx.beginPath();ctx.moveTo(l3[0],l3[1]);ctx.lineTo(l4[0],l4[1]);ctx.stroke();}}
      var perD=Math.max(3,Math.round(cp.d/70));for(var k2=0;k2<perD;k2++){var fzp=z0+cp.d*(k2+.5)/perD;var m1=pr([x0,0,fzp]),m2=pr([x0-40,0,fzp]);if(m1&&m2){ctx.beginPath();ctx.moveTo(m1[0],m1[1]);ctx.lineTo(m2[0],m2[1]);ctx.stroke();}var m3=pr([x1,0,fzp]),m4=pr([x1+40,0,fzp]);if(m3&&m4){ctx.beginPath();ctx.moveTo(m3[0],m3[1]);ctx.lineTo(m4[0],m4[1]);ctx.stroke();}}}
    var sides=[[B00,B10,T10,T00],[B10,B11,T11,T10],[B11,B01,T01,T11],[B01,B00,T00,T01]];
    sides.sort(function(a,b){function dep(q){var s=0,n=0;for(var i=0;i<4;i++){if(q[i]){s+=q[i][2];n++;}}return n?s/n:1e9;}return dep(b)-dep(a);});
    for(var si=0;si<4;si++){quad(sides[si][0],sides[si][1],sides[si][2],sides[si][3],'rgba('+(si<2?'7,20,32':'12,32,46')+','+(0.95*fg)+')','rgba(55,145,180,'+(0.5*fg)+')',1);}
    if(T00&&T10&&T11&&T01){var g=ctx.createLinearGradient(T00[0],T00[1],T11[0],T11[1]);
      if(cp.brand){g.addColorStop(0,'rgba(18,52,74,'+fg+')');g.addColorStop(1,'rgba(9,32,48,'+fg+')');}
      else{g.addColorStop(0,'rgba(28,64,90,'+fg+')');g.addColorStop(1,'rgba(12,40,60,'+fg+')');}
      quad(T00,T10,T11,T01,g,null);
      ctx.save();ctx.shadowColor='rgba(60,190,225,'+(0.6*fg)+')';ctx.shadowBlur=10;quad(T00,T10,T11,T01,null,'rgba(90,205,235,'+(0.9*fg)+')',1.5);ctx.restore();
    } else { quad(T00,T10,T11,T01,'rgba(18,49,74,'+fg+')','rgba(90,205,235,'+(0.9*fg)+')',1.4); }
    var mgx=cp.w*0.15,mgz=cp.d*0.15;
    quad(pr([x0+mgx,h,z0+mgz]),pr([x1-mgx,h,z0+mgz]),pr([x1-mgx,h,z1-mgz]),pr([x0+mgx,h,z1-mgz]),'rgba(9,28,44,'+(0.9*fg)+')','rgba(60,150,185,'+(0.5*fg)+')',1);
    var pin1=pr([x0+mgx*1.2,h,z0+mgz*1.2]);if(pin1){ctx.fillStyle='rgba(150,220,250,'+(0.9*fg)+')';ctx.beginPath();ctx.arc(pin1[0],pin1[1],Math.max(1.2,f*16/(pin1[2]||1)),0,6.283);ctx.fill();}
    if(cp.label){var vzc=pr([cp.x,h,cp.z]);if(vzc){var fs=f*(cp.brand?cp.d*0.16:cp.d*0.19)/vzc[2];if(fs>7){ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=cp.brand?'rgba(127,219,255,'+fg+')':'rgba(219,238,250,'+fg+')';ctx.font=(cp.brand?'800 ':'700 ')+fs+'px Segoe UI,system-ui,Arial';ctx.fillText(cp.label,vzc[0],vzc[1]-(cp.sub?fs*0.4:0));if(cp.sub){var fs2=Math.max(6,fs*0.32);ctx.fillStyle='rgba(160,200,225,'+fg+')';ctx.font='600 '+fs2+'px Segoe UI,system-ui,Arial';ctx.fillText(cp.sub,vzc[0],vzc[1]+fs*0.55);}}}}
  }
  function drawCap(cp){
    var baseC=pr([cp.x,0,cp.z]), topC=pr([cp.x,cp.h,cp.z]); if(!baseC||!topC)return;
    var fg=fogA(topC[2]), rs=Math.max(2,f*(cp.w*0.5)/topC[2]);
    ctx.save();ctx.globalAlpha=.20*fg;ctx.fillStyle='#020609';ctx.beginPath();ctx.ellipse(baseC[0]+8,baseC[1]+5,rs*1.05,rs*0.5,0,0,6.283);ctx.fill();ctx.restore();
    var bg=ctx.createLinearGradient(topC[0]-rs,0,topC[0]+rs,0);bg.addColorStop(0,'rgba(20,44,60,'+fg+')');bg.addColorStop(.5,'rgba(48,90,116,'+fg+')');bg.addColorStop(1,'rgba(16,38,54,'+fg+')');
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(topC[0]-rs,topC[1]);ctx.lineTo(topC[0]+rs,topC[1]);ctx.lineTo(baseC[0]+rs,baseC[1]);ctx.lineTo(baseC[0]-rs,baseC[1]);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(62,108,134,'+fg+')';ctx.beginPath();ctx.ellipse(topC[0],topC[1],rs,rs*0.42,0,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(120,200,230,'+(0.7*fg)+')';ctx.lineWidth=1;ctx.stroke();
    ctx.strokeStyle='rgba(8,18,26,'+(0.85*fg)+')';ctx.lineWidth=Math.max(1,rs*0.16);ctx.beginPath();ctx.moveTo(topC[0]-rs*0.5,topC[1]);ctx.lineTo(topC[0]+rs*0.5,topC[1]);ctx.stroke();
  }
  var last=0, introFloor=0; // introFloor: auto fly-in on load so the intro plays without scrolling
  function frame(ts){
    if(W!==wrap.clientWidth||H!==wrap.clientHeight)resize();
    if(W<2||H<2){requestAnimationFrame(frame);return;}
    var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;if(!reduce)time+=dt;
    var compact=stage.classList.contains('sstage--seen')||reduce;
    if(compact){ prog=0; applyCam(COMPACT_CAM); }
    else { var rect=stage.getBoundingClientRect(),denom=(rect.height-2*window.innerHeight)||1; var sp=Math.max(0,Math.min(1,-rect.top/denom)); if(introFloor<0.14){introFloor=Math.min(0.14,introFloor+dt*(0.14/2.6));} prog=Math.max(sp,introFloor); applyCam(kfAt(prog)); }
    ctx.clearRect(0,0,W,H);
    quad(pr([-BW/2,0,-BH/2]),pr([BW/2,0,-BH/2]),pr([BW/2,0,BH/2]),pr([-BW/2,0,BH/2]),'#061520',null);
    ctx.strokeStyle='rgba(70,130,160,.16)';ctx.lineWidth=1;
    for(var gx=-BW/2;gx<=BW/2+1;gx+=150){var A=pr([gx,0,-BH/2]),B=pr([gx,0,BH/2]);if(A&&B){ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();}}
    for(var gz=-BH/2;gz<=BH/2+1;gz+=150){var A2=pr([-BW/2,0,gz]),B2=pr([BW/2,0,gz]);if(A2&&B2){ctx.beginPath();ctx.moveTo(A2[0],A2[1]);ctx.lineTo(B2[0],B2[1]);ctx.stroke();}}
    ctx.lineWidth=2;ctx.strokeStyle='rgba(72,124,152,.22)';ctx.setLineDash([]);
    for(var et=0;et<etraces.length;et++){var pl2=etraces[et],ep=[],eok=true;for(var eq=0;eq<pl2.length;eq++){var epp=pr([pl2[eq][0],2,pl2[eq][1]]);if(!epp){eok=false;break;}ep.push(epp);}if(!eok)continue;ctx.beginPath();for(var ew=0;ew<ep.length;ew++){ew?ctx.lineTo(ep[ew][0],ep[ew][1]):ctx.moveTo(ep[0][0],ep[0][1]);}ctx.stroke();}
    for(var vv=0;vv<vias.length;vv++){var vp=pr([vias[vv][0],1,vias[vv][1]]);if(!vp)continue;var vr=Math.max(.5,1500/vp[2]);ctx.fillStyle='rgba(120,175,205,.5)';ctx.beginPath();ctx.arc(vp[0],vp[1],vr,0,6.283);ctx.fill();}
    for(var sd=0;sd<smd.length;sd++){var sm=smd[sd];var c1=pr([sm.x-(sm.r?0:26),2,sm.z-(sm.r?26:0)]),c2=pr([sm.x+(sm.r?0:26),2,sm.z+(sm.r?26:0)]);if(!c1||!c2)continue;var pw=Math.max(.8,1400/c1[2]);ctx.strokeStyle='rgba(130,180,205,.5)';ctx.lineWidth=Math.max(1,pw*1.1);ctx.beginPath();ctx.moveTo(c1[0],c1[1]);ctx.lineTo(c2[0],c2[1]);ctx.stroke();ctx.fillStyle='rgba(160,205,228,.6)';ctx.beginPath();ctx.arc(c1[0],c1[1],pw,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(c2[0],c2[1],pw,0,6.283);ctx.fill();}
    for(var tr=0;tr<traces.length;tr++){var pl=traces[tr],pts=[],ok=true;for(var q=0;q<pl.length;q++){var pp=pr([pl[q][0],3,pl[q][1]]);if(!pp){ok=false;break;}pts.push(pp);}if(!ok)continue;
      ctx.setLineDash([]);ctx.lineWidth=3;ctx.strokeStyle='rgba(90,150,185,.4)';ctx.beginPath();for(var w2=0;w2<pts.length;w2++){w2?ctx.lineTo(pts[w2][0],pts[w2][1]):ctx.moveTo(pts[0][0],pts[0][1]);}ctx.stroke();
      ctx.lineWidth=3;ctx.strokeStyle='rgba(140,225,255,.9)';ctx.shadowColor='rgba(60,200,240,.9)';ctx.shadowBlur=8;ctx.setLineDash([10,54]);ctx.lineDashOffset=-(time*90+tr*40);ctx.beginPath();for(var w3=0;w3<pts.length;w3++){w3?ctx.lineTo(pts[w3][0],pts[w3][1]):ctx.moveTo(pts[0][0],pts[0][1]);}ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;}
    var order=comps.slice().sort(function(a,b){var pa=pr([a.x,a.h/2,a.z]),pb=pr([b.x,b.h/2,b.z]);return (pb?pb[2]:0)-(pa?pa[2]:0);});
    for(var ci=0;ci<order.length;ci++){order[ci].cap?drawCap(order[ci]):drawComp(order[ci]);}
    (function(){var best=null,bd=1e9;for(var bi=0;bi<comps.length;bi++){var cc=comps[bi];if(!cc.spec)continue;var dd=Math.hypot(cc.x-cur.fx,cc.z-cur.fz);if(dd<bd){bd=dd;best=cc;}}
      if(best&&bd<260&&cur.dist<1150){var tp=pr([best.x,best.h+50,best.z]);if(tp){var op=Math.max(0,Math.min(1,(1150-cur.dist)/520));ctx.save();ctx.globalAlpha=op;var ax=tp[0],ay=tp[1],bx=ax+92,by=ay-72;ctx.strokeStyle='rgba(120,210,240,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(bx+168,by);ctx.stroke();ctx.fillStyle='rgba(150,225,255,.95)';ctx.beginPath();ctx.arc(ax,ay,2.6,0,6.283);ctx.fill();ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#e2f2fb';ctx.font='700 15px Segoe UI,system-ui,Arial';ctx.fillText(best.label==='te'?'TRUST ELECTRONICS':best.label,bx+8,by-6);ctx.fillStyle='rgba(155,198,222,.92)';ctx.font='500 12px Segoe UI,system-ui,Arial';ctx.fillText(best.spec,bx+8,by+14);ctx.restore();}}})();
    for(var pidx=0;pidx<particles.length;pidx++){var ptp=particles[pidx];if(!reduce){ptp.x+=9*dt;if(ptp.x>BW/2*1.1)ptp.x=-BW/2*1.1;}var sp=pr([ptp.x,ptp.y,ptp.z]);if(!sp)continue;var a=Math.max(0,Math.min(.5,1400/sp[2]));ctx.fillStyle='rgba(150,210,235,'+a+')';ctx.beginPath();ctx.arc(sp[0],sp[1],Math.max(.6,1000/sp[2]),0,6.283);ctx.fill();}
    if(compact){for(var sc=0;sc<scenes.length;sc++){scenes[sc].style.opacity=(sc===0?1:0);scenes[sc].style.transform='none';}if(hint)hint.style.opacity=0;}
    else{for(var sc=0;sc<scenes.length;sc++){var ctr2=sceneAt[sc]!=null?sceneAt[sc]:sc/(scenes.length-1);var d2=prog-ctr2,band=0.13,loc=Math.max(0,1-Math.abs(d2)/band);loc=loc*loc*(3-2*loc);scenes[sc].style.opacity=reduce?1:loc;scenes[sc].style.transform=reduce?'none':('translateY('+(-d2*140)+'px)');}if(hint)hint.style.opacity=(prog>0.05?0:'');}
    requestAnimationFrame(frame);
  }
  resize();requestAnimationFrame(frame);
})();
