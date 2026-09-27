/** Original, bounded GLSL studies. No registry code or external textures. */
export const sceneStyles = [
  'Woven light', 'Black hole', 'Velaris', 'Gateway flow', 'Glyph portal',
  'Liquid', 'Liquid metal', 'Anomalous matter', 'Crystalline field', 'Quantum field',
  'Tunnel', 'Glitter', 'Digital aurora', 'Stractium', 'Constellation', 'Synapse', 'Water ripple',
] as const;

export const vertexShader = `attribute vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;

export const fragmentShader = `precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float mode;
uniform float strength;
uniform sampler2D artwork;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float line(float d,float w){return exp(-abs(d)/w);}
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float field(vec3 p){
  for(int i=0;i<4;i++){p=abs(p)/clamp(dot(p,p),.25,1.5)-vec3(.9,.8,.7);p.xy*=rot(.35);}
  return length(p)*.055-.06;
}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;
 vec2 p=(2.*gl_FragCoord.xy-resolution)/min(resolution.x,resolution.y);
 p+=(pointer-.5)*.2;
 float t=time*.3,r=length(p),a=atan(p.y,p.x),v=0.,edge=0.;
 if(mode<.5){
   for(int i=0;i<12;i++){float f=float(i);float y=sin(p.x*1.9+t+f*.13)*.34+sin(p.x*.7-t)*.22;
    v+=line(p.y-y+(f-5.5)*.07,.012)*.15;}
 }else if(mode<1.5){
   vec2 q=p*vec2(1.,2.7);float disk=length(q);
   v=line(disk-.7,.055)*(1.+.3*sin(a*14.+t*5.));
   v+=line(r-.47,.015)*1.5;v+=.035/max(.03,abs(r-.52));v*=smoothstep(.4,.48,r);
 }else if(mode<2.5){
   v=pow(.5+.5*sin(p.x*3.+sin(p.y*4.+t)+sin(r*4.-t)),5.)*.7;
   v+=line(p.y+sin(p.x*2.+t)*.5,.04)*.4;
 }else if(mode<3.5){
   float gate=max(abs(p.x)*.8,abs(p.y));
   v=pow(.5+.5*cos(gate*23.-t*4.),22.)*.65/(1.+r);
 }else if(mode<4.5){
   v=line(r-.7,.012)+line(r-.82,.008)*.5;
   v+=line(r-.55,.015)*step(.3,sin(a*12.+t));
   v+=line(sin(a*6.+t)*.1+r-.68,.012)*.35;
 }else if(mode<6.5){
   float wave=sin(p.x*3.+t+sin(p.y*4.-t))+cos(p.y*3.-t+sin(p.x*2.));
   v=pow(.5+.5*sin(wave*3.+t),mode>5.5?12.:3.);
   if(mode>5.5)v+=pow(.5+.5*cos(wave*3.+.4),18.)*.6;
 }else if(mode<7.5){
   vec2 q=p;for(int i=0;i<5;i++){q=abs(q)/max(.3,dot(q,q))-vec2(.8+.08*sin(t),.7);q*=rot(.4);}
   v=exp(-length(q)*.9)*.8+line(r-.6,.02)*.2;
 }else if(mode<8.5){
   vec2 q=rot(.2+t*.07)*p*3.;float cell=abs(fract(q.x+q.y*.5)-.5)+abs(fract(q.y)-.5);
   v=pow(1.-cell,8.)+.3*line(cell-.5,.025);
 }else if(mode<9.5){
   vec2 q=p*4.;q.y+=sin(q.x+t)*.2;
   v=(line(sin(q.x*3.),.04)+line(sin(q.y*3.),.04))*.35*exp(-r*.3);
   v+=line(r-mod(t,2.),.03)*.3;
 }else if(mode<10.5){
   float tunnel=1./max(.13,r);
   v=pow(.5+.5*sin(tunnel*5.-t*5.),18.)*.5;
   v+=pow(.5+.5*sin(a*12.+t),28.)*.25;v*=smoothstep(.08,.3,r);
 }else if(mode<11.5){
   vec2 q=p*26.;vec2 cell=floor(q);float n=hash(cell);
   v=pow(max(0.,1.-length(fract(q)-.5)*2.),12.)*step(.73,n)*(.5+.5*sin(t*3.+n*30.));
   v+=line(p.y-sin(p.x+t)*.4,.12)*.12;
 }else if(mode<12.5){
   float curtain=p.y+sin(p.x*1.5+t)*.35+sin(p.x*4.-t)*.13;
   v=exp(-abs(curtain)*3.)*(.3+.2*sin(p.x*22.+t));
 }else if(mode<13.5){
   vec3 ro=vec3(0.,0.,-2.5),rd=normalize(vec3(p,1.6));float travel=0.;
   for(int i=0;i<28;i++){vec3 q=ro+rd*travel;q.xy*=rot(t*.13);float d=field(q);travel+=max(.018,abs(d));v+=.008/(.02+abs(d));if(travel>5.)break;}
   v*=.075;
 }else if(mode<15.5){
   for(int i=0;i<16;i++){
     float f=float(i);vec2 n=vec2(sin(f*17.3),cos(f*11.7))*.95;
     n+=vec2(sin(t+f),cos(t*.7+f))*.04;float d=length(p-n);
     v+=.004/max(.008,d);
     vec2 next=vec2(sin((f+1.)*17.3),cos((f+1.)*11.7))*.95;
     vec2 ba=next-n;float h=clamp(dot(p-n,ba)/max(.01,dot(ba,ba)),0.,1.);
     v+=line(length(p-n-ba*h),.004)*(mode>14.5?.2+.3*pow(.5+.5*sin(h*12.-t*4.+f),8.):.15);
   }
 }else{
   vec2 centre=(pointer-.5)*1.5;float d=length(p-centre);
   vec2 q=p+normalize(p-centre+vec2(.001))*sin(d*25.-t*5.)*.035*exp(-d);
   v=line(length(q)-.65,.018)+line(q.y-sin(q.x*3.)*.25,.02)*.6;
   v+=line(abs(q.x)+abs(q.y)-.65,.014)*.4;
 }
 vec3 ink=vec3(.018,.047,.12),blue=vec3(.10,.33,.81),paper=vec3(.75,.87,1.);
 v=clamp(v*strength,0.,1.7);
 vec3 color=mix(ink,blue,clamp(v,0.,1.));color=mix(color,paper,smoothstep(.6,1.6,v));
 color+=vec3(.025,.055,.10)*exp(-r*.8);
 if(mode>15.5){
   vec2 q=uv;float d=distance(q,pointer);
   q+=normalize(q-pointer+vec2(.001))*sin(d*65.-t*5.)*.014*exp(-d*4.);
   vec2 imageUV=(q-.5)*vec2(resolution.x/resolution.y,1.)*1.4+.5;
   if(imageUV.x>0.&&imageUV.x<1.&&imageUV.y>0.&&imageUV.y<1.){
     vec4 sampleColor=texture2D(artwork,imageUV);color=mix(color,sampleColor.rgb,sampleColor.a*.9);
   }
 }
 gl_FragColor=vec4(color,1.);
}`;
