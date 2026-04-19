/* ════════════════════════════════════════════════════════════
   1. FORM SUBMISSION & IMAGE UPLOAD LOGIC
   ════════════════════════════════════════════════════════════ */
const form = document.getElementById('quote-form');
const fileInput = document.getElementById('fi');
const dropZone = document.getElementById('dropzone');
const uploadClickArea = document.getElementById('upload-click');
const previewGrid = document.getElementById('preview-grid');

// Prevent default behaviors for drag & drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
  dropZone.addEventListener(name, e => { e.preventDefault(); e.stopPropagation(); });
});

// Highlight drop zone on drag
dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
['dragleave', 'drop'].forEach(name => {
  dropZone.addEventListener(name, () => dropZone.classList.remove('dragover'));
});

// Handle file sources
dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
uploadClickArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
  const fileArr = Array.from(files);
  const currentCount = previewGrid.children.length;
  const filesToAdd = fileArr.slice(0, 5 - currentCount);

  filesToAdd.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button type="button" class="remove-img" onclick="this.parentElement.remove()">✕</button>
      `;
      previewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// THE SUBMISSION LOGIC (Fixes Network Error)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('.fsbmt');
  const originalText = btn.textContent;
  
  // 1. Loading State
  btn.textContent = "Sending...";
  btn.disabled = true;

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      // SUCCESS ALERT
      Swal.fire({
        title: 'Success!',
        text: 'Your quote request has been sent.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });

      form.reset();
      if (typeof previewGrid !== 'undefined') previewGrid.innerHTML = ''; 

    } else {
      const errorData = await response.json();
      
      // SUBMISSION FAILED ALERT
      Swal.fire({
        title: 'Submission Failed',
        text: errorData.message || "Check your Form ID",
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  } catch (error) {
    console.error("Submission Error:", error);
    
    // NETWORK ERROR ALERT
    Swal.fire({
      title: 'Network Error',
      text: 'Please check your connection or your Getform URL.',
      icon: 'warning',
      confirmButtonColor: '#f8bb86'
    });
  } finally {
    // 3. Reset Button
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

/* ════════════════════════════════════════════════════════════
   2. VISUAL EFFECTS (Cursor, Scroll, Particles)
   ════════════════════════════════════════════════════════════ */

/* CURSOR */
const cur=document.getElementById('cur'),ring=document.getElementById('ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function animR(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animR)})();

/* NAV SCROLL */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>50),{passive:true});

/* DRAWER */
const ham=document.getElementById('ham'),mdr=document.getElementById('mdr'),mov=document.getElementById('mov');
function closeD(){ham.classList.remove('open');mdr.classList.remove('open');mov.classList.remove('open');ham.setAttribute('aria-expanded','false');document.body.style.overflow=''}
ham.addEventListener('click',()=>{const o=mdr.classList.toggle('open');ham.classList.toggle('open',o);mov.classList.toggle('open',o);ham.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
mov.addEventListener('click',closeD);

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=document.querySelector(a.getAttribute('href'));
  if(t){
    e.preventDefault();
    window.scrollTo({top:t.getBoundingClientRect().top+scrollY-nav.offsetHeight-10,behavior:'smooth'});
  }
}));

/* SCROLL REVEAL */
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
document.querySelectorAll('.sr,.sr-l,.sr-r').forEach(el=>obs.observe(el));

/* COUNT-UP */
const cobs=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target,target=+el.dataset.target,suffix=el.dataset.suffix||'',dur=1800,start=performance.now();
  (function tick(now){const p=Math.min((now-start)/dur,1),ease=1-Math.pow(1-p,3);el.textContent=Math.round(ease*target)+suffix;if(p<1)requestAnimationFrame(tick)})(start);
  cobs.unobserve(el);
}),{threshold:.5});
document.querySelectorAll('[data-target]').forEach(el=>cobs.observe(el));

/* HERO PARTICLE CANVAS */
(function(){
  const c=document.getElementById('hcanvas'),ctx=c.getContext('2d');
  if(!c) return;
  let W,H,pts=[];
  function resize(){W=c.width=innerWidth;H=c.height=innerHeight}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<72;i++)pts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.32,vy:(Math.random()-.5)*.32,r:Math.random()*1.4+.4,gold:Math.random()>.72});
  (function draw(){
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(26,111,255,${(1-d/130)*.16})`;ctx.lineWidth=.55;ctx.stroke()}
    }
    pts.forEach(p=>{
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.gold?'rgba(240,165,0,.5)':'rgba(26,111,255,.5)';ctx.fill();
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    });
    requestAnimationFrame(draw);
  })();
})();

/* SERVICE CARD STAGGER */
document.querySelectorAll('.sc').forEach((c,i)=>c.style.transitionDelay=`${(i%3)*.06}s`);