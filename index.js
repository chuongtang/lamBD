
    // ======== EDIT THESE BASIC SETTINGS ========
    const HOST_NAME = "Lam Tang"; // Your name
    const EVENT_TITLE = "Lam's 18 sweet birthday";
    const VENUE_NAME = "My sweet Home";
    const VENUE_ADDRESS = "333 Taralake Way NE";
    const EVENT_CITY = "Calgary";
    const EVENT_START_LOCAL = new Date("2025-11-14T17:00:00+05:00");
    const EVENT_END_LOCAL   = new Date("2025-11-14T21:30:00+05:30");
    const GOOGLE_MAPS_QUERY = encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`);
    const WHATSAPP_TO = ""; // put your phone like 403XXXXXXXX to open personal chat. Keep empty to use generic share.
    // ===========================================

    // Set Maps button
    const mapsBtn = document.getElementById('mapsBtn');
    mapsBtn.href = "https://maps.app.goo.gl/TehYThUPrPW9DoMVA";

    // Countdown
    function pad(n){return String(n).padStart(2,'0')}
    function tick(){
      const now = new Date();
      const diff = EVENT_START_LOCAL - now;
      const d = document.getElementById('d');
      const h = document.getElementById('h');
      const m = document.getElementById('m');
      const s = document.getElementById('s');
      if(diff <= 0){ d.textContent=h.textContent=m.textContent=s.textContent = '00'; return; }
      const days = Math.floor(diff/86400000);
      const hours = Math.floor((diff%86400000)/3600000);
      const mins = Math.floor((diff%3600000)/60000);
      const secs = Math.floor((diff%60000)/1000);
      d.textContent = pad(days); h.textContent = pad(hours); m.textContent = pad(mins); s.textContent = pad(secs);
    }
    tick(); setInterval(tick, 1000);

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){document.documentElement.setAttribute('data-theme', savedTheme)}
    themeToggle.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? '' : 'light';
      if(next){document.documentElement.setAttribute('data-theme','light'); localStorage.setItem('theme','light');}
      else {document.documentElement.removeAttribute('data-theme'); localStorage.removeItem('theme');}
    });

    // Share
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.addEventListener('click', async ()=>{
      const text = `You're invited to ${EVENT_TITLE} on 20 Sept, ${VENUE_NAME}, ${EVENT_CITY}.\nTime: 6:00 PM.\nDetails:`;
      if(navigator.share){
        try{ await navigator.share({title:EVENT_TITLE, text, url: location.href}); }catch(e){}
      } else { await navigator.clipboard.writeText(location.href); alert('Link copied!'); }
    });

    // RSVP (top button): open WhatsApp chat/message
    document.getElementById('rsvpBtn').addEventListener('click', ()=>{
      const text = encodeURIComponent(`Hi ${HOST_NAME}! I'll join your birthday on 20 Sept. – Replying from the invite page 🎉`);
      const base = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'whatsapp://send' : 'https://wa.me';
      const url = WHATSAPP_TO ? `${base}?phone=${WHATSAPP_TO}&text=${text}` : `${base}?text=${text}%20${encodeURIComponent(location.href)}`;
      window.open(url, '_blank');
    });

    // RSVP form -> WhatsApp prefill
    document.getElementById('rsvpForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim() || 'Friend';
      const guests = document.getElementById('guests').value;
      const msg = document.getElementById('msg').value.trim();
      const lines = [
        `Hi ${HOST_NAME}!`,
        `${name} here. I am coming ${guests.toLowerCase()}.`,
        msg?`Note: ${msg}`: null,
        `See you at ${VENUE_NAME} on 14 Nov at 5:00 PM!`
      ].filter(Boolean).join('\n');
      const text = encodeURIComponent(lines);
      const base = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'whatsapp://send' : 'https://wa.me';
      const url = WHATSAPP_TO ? `${base}?phone=${WHATSAPP_TO}&text=${text}` : `${base}?text=${text}`;
      window.open(url, '_blank');
    });

    // Copy link
    document.getElementById('copyLink').addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(location.href);
      alert('Invite link copied to clipboard!');
    });

    //Directions & Maps
    document.getElementById('directionsBtn').addEventListener('click', ()=>{
      const url = `https://www.google.com/maps/dir/?api=1&destination=${GOOGLE_MAPS_QUERY}`;
      window.open(url, '_blank');
    });

    // Local notification reminder (permission required)
    document.getElementById('remindBtn').addEventListener('click', async ()=>{
      if(!('Notification' in window)) return alert('Notifications not supported');
      let perm = Notification.permission;
      if(perm !== 'granted') perm = await Notification.requestPermission();
      if(perm === 'granted'){
        const when = new Date(EVENT_START_LOCAL.getTime() - 60*60*1000); // 1 hour before
        const ms = Math.max(0, when - new Date());
        setTimeout(()=> new Notification('⏰ Birthday starts in 1 hour!',{body:`${EVENT_TITLE} at ${VENUE_NAME}`}), ms);
        alert('Reminder set! You will get a browser notification 1 hour before. Keep this tab open.');
      }
    });

    // Add to Calendar (.ics)
    document.getElementById('addCalBtn').addEventListener('click', ()=>{
      function toICSDate(d){
        const pad = n=> String(n).padStart(2,'0');
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
      }
      const dtStart = toICSDate(EVENT_START_LOCAL);
      const dtEnd   = toICSDate(EVENT_END_LOCAL);
      const ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Birthday Invite//EN','BEGIN:VEVENT',
        `UID:${Date.now()}@invite`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${EVENT_TITLE}`,
        `LOCATION:${VENUE_NAME}, ${VENUE_ADDRESS}`,
        'DESCRIPTION:Let\,\'s celebrate together! 🎉',
        'END:VEVENT','END:VCALENDAR' 
      ].join('\r\n');
      const blob = new Blob([ics], {type:'text/calendar'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'birthday-invite.ics'; a.click();
      URL.revokeObjectURL(url);
    });

    // Confetti (lightweight canvas particles)
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    let W, H; function resize(){W=canvas.width=innerWidth; H=canvas.height=innerHeight;} resize(); addEventListener('resize', resize);
    const colors = ['#7c5cff','#ff7ab6','#22c55e','#f59e0b','#60a5fa','#f472b6'];
    let confetti = [];
    function spawn(x=W/2, y=H/3){
      for(let i=0;i<160;i++){
        confetti.push({
          x, y, r: Math.random()*6+2,
          vx: (Math.random()-0.5)*6,
          vy: Math.random()*-6-2,
          g: 0.18 + Math.random()*0.12,
          a: 1,
          color: colors[(Math.random()*colors.length)|0],
          rot: Math.random()*Math.PI,
          vr: (Math.random()-0.5)*0.2
        });
      }
    }
    function loop(){
      ctx.clearRect(0,0,W,H);
      confetti.forEach(p=>{
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.a -= 0.006;
        ctx.save(); ctx.globalAlpha = Math.max(0,p.a); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2); ctx.restore();
      });
      confetti = confetti.filter(p=> p.a>0 && p.y < H+20);
      requestAnimationFrame(loop);
    }
    loop();
    document.getElementById('confettiBtn').addEventListener('click', ()=> spawn());
    // auto pop on load
    setTimeout(()=>spawn(innerWidth*0.75, innerHeight*0.25), 800);
