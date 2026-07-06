"use client";

import Link from "next/link";
import Header from "@/components/layout/header";
import { useEffect, useRef, useState } from "react";



function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}



const SLIDES = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&fit=crop",
];

const SKILLS = [
  {
    label: "Confidence",
    emoji: "💪",
    description:
      "At Montessori, children build confidence by choosing their own work and completing it independently. Each success — no matter how small — reinforces a deep belief in their own abilities. Our guides offer encouragement without judgment, creating a safe space where trying new things feels exciting, not scary.",
  },
  {
    label: "Independence",
    emoji: "🌟",
    description:
      "Independence is at the heart of the Montessori method. Children select their activities, manage their time, and solve problems on their own. Our carefully prepared classrooms give every child the tools they need to act autonomously — cultivating a lifelong sense of personal responsibility and self-direction.",
  },
  {
    label: "Creativity",
    emoji: "🎨",
    description:
      "Montessori environments are rich with open-ended materials that invite imagination. From art and storytelling to hands-on science experiments, children are encouraged to explore without a single 'right answer.' This freedom to create builds flexible thinking and innovative problem-solving skills that last a lifetime.",
  },
  {
    label: "Adaptability",
    emoji: "🌱",
    description:
      "Multi-age classrooms expose children to different perspectives and learning styles every day. Younger students learn from older peers; older students reinforce their knowledge by teaching others. This dynamic environment nurtures resilience, empathy, and the ability to thrive in any situation.",
  },
];

const TRAITS = [
  { label: "Curious",    emoji: "🔭" },
  { label: "Observant",  emoji: "👁️" },
  { label: "Active",     emoji: "⚡" },
  { label: "Analytical", emoji: "🧩" },
];

export default function HomeClient({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const objetivos  = useReveal();
  const tarjetas   = useReveal();
  const valoresRef = useReveal();
  const sep        = useReveal();
  const traitsRef  = useReveal();
  const infoRef    = useReveal();
  const btnsRef    = useReveal();
  const accessRef  = useReveal();

  /* ── Skill auto-cycle + click ── */
  const [activeSkill, setActiveSkill] = useState(0);
  const [manualPick,  setManualPick]  = useState(false);
  const [descVisible, setDescVisible] = useState(true);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pickSkill(i: number) {
    if (i === activeSkill) return;
    setDescVisible(false);
    setTimeout(() => { setActiveSkill(i); setDescVisible(true); }, 220);
    setManualPick(true);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => setManualPick(false), 8000);
  }

  const schoolRef = useReveal();
  const contactRef = useReveal();

  const SCHOOL_IMAGES = [
    {
      src: "/school1.jpeg",
      title: "Outdoor Learning",
      text: "Nature is our second classroom — children grow, observe, and connect with the world outside.",
    },
    {
      src: "/school2.jpeg",
      title: "Prepared Environment",
      text: "Classrooms designed for independence, curiosity, and meaningful hands-on learning.",
    },
    {
      src: "/school3.jpeg",
      title: "Montessori Moments",
      text: "Every day is an opportunity to explore, create, and discover with joy.",
    },
  ];

  const [activeSchoolImage, setActiveSchoolImage] = useState(0);

  function nextSchoolImage() {
    setActiveSchoolImage((prev) => (prev + 1) % SCHOOL_IMAGES.length);
  }

  function prevSchoolImage() {
    setActiveSchoolImage((prev) =>
      prev === 0 ? SCHOOL_IMAGES.length - 1 : prev - 1
    );
  }

  useEffect(() => {
    if (manualPick) return;
    const id = setInterval(() => {
      setDescVisible(false);
      setTimeout(() => {
        setActiveSkill(prev => (prev + 1) % SKILLS.length);
        setDescVisible(true);
      }, 220);
    }, 2500);
    return () => clearInterval(id);
  }, [manualPick]);

  /* ── Traits auto-cycle (visual only) ── */
  const [activeTrait, setActiveTrait] = useState(2);
  useEffect(() => {
    const id = setInterval(() =>
      setActiveTrait(prev => (prev + 1) % TRAITS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Serif+Display:ital@0;1&family=Nunito:wght@400;600;700;800&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'Nunito',sans-serif;}

        /* Reveals */
        .reveal{opacity:0;transform:translateY(38px);transition:opacity .7s ease,transform .7s ease;}
        .reveal.visible{opacity:1;transform:translateY(0);}
        .reveal-left{opacity:0;transform:translateX(-48px);transition:opacity .7s ease,transform .7s ease;}
        .reveal-right{opacity:0;transform:translateX(48px);transition:opacity .7s ease,transform .7s ease;}
        .reveal-left.visible,.reveal-right.visible{opacity:1;transform:translateX(0);}
        .reveal-scale{opacity:0;transform:scale(.88);transition:opacity .6s ease,transform .6s ease;}
        .reveal-scale.visible{opacity:1;transform:scale(1);}
        .d1{transition-delay:0s}.d2{transition-delay:.12s}.d3{transition-delay:.24s}.d4{transition-delay:.36s}

        /* Hero */
        .hero{position:relative;width:100%;height:100vh;min-height:500px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:60px;}
        .slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;animation:fadeSlide 20s infinite;will-change:opacity;}
        .slide:nth-child(1){animation-delay:0s}
        .slide:nth-child(2){animation-delay:5s}
        .slide:nth-child(3){animation-delay:10s}
        .slide:nth-child(4){animation-delay:15s}
        @keyframes fadeSlide{0%{opacity:0}5%{opacity:1}22%{opacity:1}27%{opacity:0}100%{opacity:0}}
        .hero-grad-top{position:absolute;top:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,rgba(0,0,0,.45),transparent);z-index:1;}
        .hero-grad-bot{position:absolute;bottom:0;left:0;right:0;height:65%;background:linear-gradient(to bottom,rgba(32,80,180,0),rgba(32,80,180,.95));z-index:1;}
        .hero-text{position:relative;z-index:2;text-align:center;padding:0 20px;}
        @keyframes heroIn{0%{opacity:0;filter:blur(18px);transform:scale(1.1)}100%{opacity:1;filter:blur(0);transform:scale(1);text-shadow:0 4px 20px rgba(0,0,0,.4)}}
        .hero-sub{font-family:'Nunito',sans-serif;font-size:clamp(17px,2.4vw,24px);font-weight:700;color:#FFE82C;text-shadow:0 3px 12px rgba(0,0,0,.4);animation:heroIn 2s .3s ease-out both;margin-bottom:6px;}
        .hero-title{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(28px,5vw,58px);color:#fff;line-height:1.1;animation:heroIn 2s .7s ease-out both;}
        .arrow-wrap{position:relative;z-index:2;margin-top:28px;}
        .arrow-icon{display:block;width:40px;height:40px;margin:0 auto;color:#FFE82C;animation:bounce 2.2s ease-in-out infinite;}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}

        /* Sections */
        .sec-blue{background-color:#2050B4;width:100%;padding:60px 24px;display:flex;flex-direction:column;align-items:center;}
        .objetivos-tag{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#FFE82C;letter-spacing:.06em;margin-bottom:40px;text-align:center;}
        .cards-row{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;max-width:900px;}
        .obj-card{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);border-radius:20px;padding:28px 24px;max-width:380px;flex:1 1 280px;display:flex;align-items:flex-start;gap:14px;transition:transform .25s,box-shadow .25s;}
        .obj-card:hover{transform:translateY(-5px);box-shadow:0 12px 30px rgba(0,0,0,.25);}
        .card-emoji{font-size:36px;flex-shrink:0;line-height:1;margin-top:2px;}
        .card-text{font-family:'Nunito',sans-serif;font-size:16px;line-height:1.65;color:rgba(255,255,255,.90);}

        /* Valores */
        .valores-sec{width:100%;padding:60px 24px;display:flex;flex-direction:column;align-items:center;background:linear-gradient(180deg,#2050B4 0%,#0D2E5A 50%,#2050B4 100%);}
        .sec-intro{font-family:'Nunito',sans-serif;font-size:17px;color:rgba(255,255,255,.60);margin-bottom:6px;font-style:italic;}
        .sec-question{font-family:'DM Serif Display',serif;font-size:clamp(20px,3vw,30px);color:#39FFBF;text-align:center;margin-bottom:32px;text-shadow:0 3px 10px rgba(0,0,0,.3);}

        /* Skill chips */
        .skills-row{display:flex;flex-wrap:wrap;gap:12px 16px;justify-content:center;margin-bottom:28px;}
        .skill-chip{font-family:'Nunito',sans-serif;font-size:17px;font-weight:700;font-style:italic;color:rgba(255,255,255,.40);padding:9px 20px;border-radius:50px;border:1.5px solid rgba(255,255,255,.14);cursor:pointer;user-select:none;transition:color .3s,border-color .3s,background .3s,box-shadow .3s,transform .2s;}
        .skill-chip:hover{transform:translateY(-2px);color:rgba(255,255,255,.65);}
        .skill-chip.active{color:#FFE82C !important;border-color:#FFE82C;background:rgba(255,232,44,.10);box-shadow:0 0 18px rgba(255,232,44,.28);transform:scale(1.06);}

        /* Description panel */
        .skill-desc-wrap{width:100%;max-width:700px;margin-bottom:36px;min-height:130px;}
        .skill-desc-panel{background:rgba(255,255,255,.08);border:1px solid rgba(57,255,191,.25);border-radius:20px;padding:24px 28px;display:flex;gap:16px;align-items:flex-start;transition:opacity .22s ease,transform .22s ease;}
        .skill-desc-panel.hidden{opacity:0;transform:translateY(8px);}
        .skill-desc-panel.shown{opacity:1;transform:translateY(0);}
        .desc-emoji{font-size:32px;flex-shrink:0;line-height:1;margin-top:2px;}
        .desc-body{display:flex;flex-direction:column;gap:4px;}
        .desc-title{font-family:'DM Serif Display',serif;font-size:20px;color:#FFE82C;margin-bottom:6px;}
        .desc-text{font-family:'Nunito',sans-serif;font-size:15.5px;color:rgba(255,255,255,.82);line-height:1.7;}

        /* Highlight + separator */
        .highlight-box{background:white;border-radius:0 16px 16px 40px;padding:14px 24px;font-family:'DM Serif Display',serif;font-size:18px;color:#E83248;text-align:center;margin:10px 0 36px;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:560px;}
        .separator{background:linear-gradient(90deg,transparent,#39FFBF,transparent);height:3px;width:45%;border-radius:4px;margin:36px 0;}

        /* Traits */
        .traits-row{display:flex;flex-wrap:wrap;gap:12px 16px;justify-content:center;}
        .trait-chip{font-family:'Nunito',sans-serif;font-size:17px;font-weight:700;font-style:italic;color:rgba(255,255,255,.40);padding:9px 20px;border-radius:50px;border:1.5px solid rgba(255,255,255,.14);transition:color .35s,border-color .35s,background .35s,box-shadow .35s,transform .25s;}
        .trait-chip.active{color:#FFE82C;border-color:#FFE82C;background:rgba(255,232,44,.10);box-shadow:0 0 18px rgba(255,232,44,.28);transform:scale(1.06);}

        /* Info */
        .info-card{display:flex;align-items:flex-start;gap:12px;max-width:640px;margin-bottom:36px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:24px 28px;}
        .info-card-text{font-family:'Nunito',sans-serif;font-size:17px;color:rgba(255,255,255,.88);line-height:1.65;}
        .action-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;}
        .btn-action{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.05em;background:white;color:#1A2E60;border:none;border-radius:50px;padding:14px 26px;cursor:pointer;text-decoration:none;display:inline-block;transition:background .2s,transform .2s,box-shadow .2s;}
        .btn-action:hover{background:#39FFBF;color:#0D2E5A;transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.25);}

        /* Access */
        .access-sec{width:100%;padding:80px 24px;display:flex;flex-direction:column;align-items:center;background:linear-gradient(135deg,#0D2E5A 0%,#163580 50%,#0A4A38 100%);position:relative;overflow:hidden;}
        .access-sec::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,232,44,.14) 0%,transparent 70%);top:-100px;left:-80px;pointer-events:none;}
        .access-sec::after{content:'';position:absolute;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(57,255,191,.12) 0%,transparent 70%);bottom:-80px;right:-60px;pointer-events:none;}
        .access-eyebrow{font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#39FFBF;margin-bottom:14px;position:relative;z-index:1;}
        .access-title{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(30px,4.5vw,52px);color:#fff;text-align:center;line-height:1.1;margin-bottom:16px;position:relative;z-index:1;}
        .access-title span{color:#FFE82C;font-style:normal;}
        .access-desc{font-family:'Nunito',sans-serif;font-size:17px;color:rgba(200,230,255,.72);text-align:center;max-width:480px;line-height:1.7;margin-bottom:48px;position:relative;z-index:1;}
        .access-cards{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;}
        .access-card{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.15);backdrop-filter:blur(12px);border-radius:24px;padding:36px 32px;width:280px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;transition:transform .25s,box-shadow .25s,border-color .25s;}
        .access-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.30);border-color:rgba(255,255,255,.30);}
        .access-card-icon{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;}
        .icon-yellow{background:rgba(255,232,44,.18);border:1px solid rgba(255,232,44,.35);}
        .icon-teal{background:rgba(57,255,191,.15);border:1px solid rgba(57,255,191,.30);}
        .access-card-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#fff;}
        .access-card-desc{font-family:'Nunito',sans-serif;font-size:14px;color:rgba(200,230,255,.65);line-height:1.6;}
        .btn-register{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.04em;background:linear-gradient(135deg,#FFE82C,#FFC800);color:#0D2E5A;border-radius:50px;padding:13px 28px;text-decoration:none;margin-top:8px;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 16px rgba(255,232,44,.35);}
        .btn-register:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,232,44,.45);opacity:.92;}
        .btn-login{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.04em;background:transparent;color:#fff;border:2px solid rgba(57,255,191,.6);border-radius:50px;padding:12px 28px;text-decoration:none;margin-top:8px;transition:transform .2s,box-shadow .2s,background .2s,border-color .2s;}
        .btn-login:hover{background:rgba(57,255,191,.12);border-color:#39FFBF;transform:translateY(-3px);}

        .school-sec{
          width:100%;
          padding:90px 24px;
          background:linear-gradient(180deg,#2050B4 0%,#11396f 100%);
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
        }

        .school-eyebrow,
        .contact-eyebrow{
          font-family:'Nunito',sans-serif;
          font-size:12px;
          font-weight:800;
          letter-spacing:.18em;
          text-transform:uppercase;
          color:#39FFBF;
          margin-bottom:18px;
        }

        .school-title,
        .contact-title{
          font-family:'DM Serif Display',serif;
          font-size:clamp(34px,4.8vw,56px);
          color:white;
          line-height:1.1;
          margin-bottom:18px;
        }

        .school-title span,
        .contact-title span{
          color:#FFE82C;
          font-style:italic;
        }

        .school-desc,
        .contact-desc{
          max-width:620px;
          color:rgba(220,240,255,.75);
          line-height:1.7;
          margin-bottom:42px;
        }

        .school-carousel{
          width:min(900px,100%);
          position:relative;
          border-radius:24px;
          overflow:hidden;
          box-shadow:0 20px 50px rgba(0,0,0,.35);
        }

        .school-image{
          height:430px;
          background-size:cover;
          background-position:center;
          position:relative;
          animation:schoolZoom .8s ease both;
        }

        @keyframes schoolZoom{
          from{transform:scale(1.04);opacity:.6}
          to{transform:scale(1);opacity:1}
        }

        .school-image::after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(to top,rgba(0,0,0,.70),transparent 60%);
        }

        .school-caption{
          position:absolute;
          left:28px;
          bottom:26px;
          z-index:2;
          text-align:left;
          color:white;
        }

        .school-caption h3{
          font-family:'DM Serif Display',serif;
          font-size:28px;
          margin-bottom:6px;
        }

        .school-caption p{
          color:rgba(255,255,255,.80);
          max-width:520px;
          line-height:1.5;
        }

        .school-arrow{
          position:absolute;
          top:50%;
          transform:translateY(-50%);
          z-index:3;
          width:44px;
          height:44px;
          border:none;
          border-radius:50%;
          background:rgba(255,255,255,.22);
          color:white;
          cursor:pointer;
          font-size:24px;
          backdrop-filter:blur(8px);
        }

        .school-arrow.left{left:18px}
        .school-arrow.right{right:18px}

        .school-dots{
          display:flex;
          justify-content:center;
          gap:8px;
          margin-top:18px;
        }

        .school-dot{
          width:9px;
          height:9px;
          border-radius:50%;
          border:none;
          background:rgba(255,255,255,.35);
          cursor:pointer;
        }

        .school-dot.active{
          background:#FFE82C;
        }

        .program-sec{
          width:100%;
          min-height:520px;
          padding:100px 24px;
          background:
            linear-gradient(rgba(5,20,45,.76),rgba(5,20,45,.76)),
            url('/school3.jpeg') center/cover;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
        }

        .program-content{
          max-width:720px;
        }

        .program-tags{
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          justify-content:center;
          margin-top:36px;
        }

        .program-tag{
          padding:10px 18px;
          border-radius:999px;
          border:1px solid rgba(255,232,44,.4);
          background:rgba(255,255,255,.10);
          color:white;
          font-weight:800;
          font-size:13px;
        }

        .contact-sec{
          width:100%;
          padding:90px 24px;
          background:linear-gradient(135deg,#163580 0%,#0A4A38 100%);
          display:flex;
          justify-content:center;
        }

        .contact-wrap{
          width:min(650px,100%);
          text-align:center;
        }

        .contact-form{
          margin-top:38px;
          display:grid;
          gap:16px;
        }

        .contact-row{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
        }

        .contact-field{
          text-align:left;
        }

        .contact-field label{
          display:block;
          color:#cfe7ff;
          font-size:12px;
          font-weight:800;
          letter-spacing:.10em;
          text-transform:uppercase;
          margin-bottom:8px;
        }

        .contact-input,
        .contact-textarea{
          width:100%;
          border:1px solid rgba(255,255,255,.20);
          border-radius:14px;
          background:rgba(255,255,255,.12);
          color:white;
          padding:14px;
          font-family:'Nunito',sans-serif;
          outline:none;
        }

        .contact-input::placeholder,
        .contact-textarea::placeholder{
          color:rgba(255,255,255,.45);
        }

        .contact-input:focus,
        .contact-textarea:focus{
          border-color:#39FFBF;
          box-shadow:0 0 0 3px rgba(57,255,191,.14);
        }

        .contact-textarea{
          min-height:130px;
          resize:vertical;
        }

        .contact-btn{
          justify-self:start;
          border:none;
          border-radius:999px;
          background:linear-gradient(135deg,#FFE82C,#FFC800);
          color:#0D2E5A;
          padding:14px 30px;
          font-weight:900;
          cursor:pointer;
          box-shadow:0 10px 26px rgba(255,232,44,.25);
        }

        /* Footer */
        .site-footer{background:#070E1F;padding:28px 24px;text-align:center;font-family:'Nunito',sans-serif;font-size:13px;color:rgba(255,255,255,.28);}

        @media(max-width:600px){
          .cards-row,.access-cards{flex-direction:column;align-items:center;}
          .skill-desc-panel{flex-direction:column;}
          .contact-row{
            grid-template-columns:1fr;
          }

          .school-image{
            height:320px;
          }
        }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="hero">
        {SLIDES.map((url, i) => (
          <div key={i} className="slide" style={{ backgroundImage: `url('${url}')` }} />
        ))}
        <div className="hero-grad-top" />
        <div className="hero-grad-bot" />
        <div className="hero-text">
          <p className="hero-sub">"Welcome to our school, where</p>
          <h1 className="hero-title">every step leads to BIG DREAMS"</h1>
        </div>
        <div className="arrow-wrap">
          <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ── OBJETIVOS ── */}
      <section className="sec-blue">
        <div ref={objetivos.ref} className={`reveal ${objetivos.visible ? "visible" : ""}`}>
          <p className="objetivos-tag">🧒 Your child's development is our priority</p>
        </div>
        <div className="cards-row">
          <div ref={tarjetas.ref} className={`obj-card reveal-left d1 ${tarjetas.visible ? "visible" : ""}`}>
            <span className="card-emoji">👦</span>
            <p className="card-text">At <strong>Montessori</strong>, we recognize that every child learns at their own pace, in their own unique way.</p>
          </div>
          <div className={`obj-card reveal-right d2 ${tarjetas.visible ? "visible" : ""}`}>
            <span className="card-emoji">📚</span>
            <p className="card-text">Our approach nurtures independence, confidence, and a lifelong love of learning — supporting each student's academic and personal growth.</p>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="valores-sec">
        <div ref={valoresRef.ref} className={`reveal ${valoresRef.visible ? "visible" : ""}`}>
          <p className="sec-intro">We'd love to learn more about you...</p>
          <h2 className="sec-question">👀 Which skills would you most like to encourage in your child?</h2>
        </div>

        {/* Auto-cycling + clickable chips */}
        <div className="skills-row">
          {SKILLS.map((s, i) => (
            <div
              key={s.label}
              className={`skill-chip${activeSkill === i ? " active" : ""}`}
              onClick={() => pickSkill(i)}
            >
              {activeSkill === i ? `✔ ${s.label}` : s.label}
            </div>
          ))}
        </div>

        {/* Dynamic description */}
        <div className="skill-desc-wrap">
          <div className={`skill-desc-panel ${descVisible ? "shown" : "hidden"}`}>
            <span className="desc-emoji">{SKILLS[activeSkill].emoji}</span>
            <div className="desc-body">
              <div className="desc-title">{SKILLS[activeSkill].label} at Montessori</div>
              <p className="desc-text">{SKILLS[activeSkill].description}</p>
            </div>
          </div>
        </div>

        <div ref={sep.ref} className={`highlight-box reveal ${sep.visible ? "visible" : ""}`}>
          🧠 Every child interacts with the world in their own unique way.
        </div>
        <div className={`separator reveal ${sep.visible ? "visible" : ""}`} />
        <h2 className={`sec-question reveal ${sep.visible ? "visible" : ""}`}>
          🧸 Does your child relate to any of these traits?
        </h2>

        {/* Traits — auto-cycle display */}
        <div ref={traitsRef.ref} className="traits-row">
          {TRAITS.map((t, i) => (
            <div
              key={t.label}
              className={`trait-chip reveal-scale d${i + 1} ${traitsRef.visible ? "visible" : ""}${activeTrait === i ? " active" : ""}`}
            >
              {activeTrait === i ? `✔ ${t.label}` : t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── INFORMACIÓN ── */}
      <section className="sec-blue">
        <div ref={infoRef.ref} className={`info-card reveal-scale ${infoRef.visible ? "visible" : ""}`}>
          <span className="card-emoji">✨</span>
          <p className="info-card-text">Montessori may be an excellent environment for your child's growth — a place where their natural curiosity becomes their greatest strength.</p>
        </div>
        <div ref={btnsRef.ref} className={`action-btns reveal ${btnsRef.visible ? "visible" : ""}`}>
          <a href="#nosotros" className="btn-action">👁️ KNOW MORE</a>
          <a href="#contacto" className="btn-action">🏫 SCHEDULE A VISIT</a>
        </div>
      </section>

      {/* ── OUR SCHOOL ── */}
<section id="our-school" className="school-sec">
  <div
    ref={schoolRef.ref}
    className={`reveal ${schoolRef.visible ? "visible" : ""}`}
  >
    <p className="school-eyebrow">Our Campus</p>

    <h2 className="school-title">
      Inside <span>Our School</span>
    </h2>

    <p className="school-desc">
      Step into a world designed for wonder. Our classrooms, outdoor spaces,
      and learning corners are crafted to spark curiosity in every child.
    </p>
  </div>

  <div className={`school-carousel reveal-scale ${schoolRef.visible ? "visible" : ""}`}>
    <div
      className="school-image"
      style={{
        backgroundImage: `url('${SCHOOL_IMAGES[activeSchoolImage].src}')`,
      }}
    >
      <div className="school-caption">
        <h3>{SCHOOL_IMAGES[activeSchoolImage].title}</h3>
        <p>{SCHOOL_IMAGES[activeSchoolImage].text}</p>
      </div>
    </div>

    <button type="button" className="school-arrow left" onClick={prevSchoolImage}>
      ‹
    </button>

    <button type="button" className="school-arrow right" onClick={nextSchoolImage}>
      ›
    </button>
  </div>

  <div className="school-dots">
    {SCHOOL_IMAGES.map((_, index) => (
      <button
        key={index}
        type="button"
        className={`school-dot ${activeSchoolImage === index ? "active" : ""}`}
        onClick={() => setActiveSchoolImage(index)}
      />
    ))}
  </div>
</section>

{/* ── PROGRAM ── */}
<section id="program" className="program-sec">
  <div className="program-content">
    <p className="school-eyebrow">Academic Program</p>

    <h2 className="school-title">
      A curriculum built for <span>curious minds</span>
    </h2>

    <p className="school-desc">
      Our Montessori program guides children through hands-on learning,
      multi-sensory materials, independence, and joyful discovery.
    </p>

    <div className="program-tags">
      <span className="program-tag">📐 Math & Reasoning</span>
      <span className="program-tag">📖 Language Arts</span>
      <span className="program-tag">🌎 Cultural Studies</span>
      <span className="program-tag">🔬 Science & Nature</span>
      <span className="program-tag">🎨 Arts & Music</span>
      <span className="program-tag">🧘 Social-Emotional Learning</span>
    </div>
  </div>
</section>

{/* ── CONTACT ── */}
<section id="contacto" className="contact-sec">
  <div
    ref={contactRef.ref}
    className={`contact-wrap reveal ${contactRef.visible ? "visible" : ""}`}
  >
    <p className="contact-eyebrow">Get in touch</p>

    <h2 className="contact-title">
      We'd love to <span>hear</span> from you
    </h2>

    <p className="contact-desc">
      Have questions about enrollment, schedules, or our program? Send us a
      message and our team will get back to you shortly.
    </p>

    <form
      className={`contact-form reveal d2 ${
        contactRef.visible ? "visible" : ""
      }`}
      id="contactForm"
      action="https://formspree.io/f/xrejnynw"
      method="POST"
    >
      <div className="contact-row">
        <div className="contact-field">
          <label>First Name</label>
          <input name="firstName" className="contact-input" required />
        </div>

        <div className="contact-field">
          <label>Last Name</label>
          <input name="lastName" className="contact-input" required />
        </div>
      </div>

      <div className="contact-field">
        <label>Email Address</label>
        <input
          name="email"
          type="email"
          className="contact-input"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="contact-field">
        <label>Phone Optional</label>
        <input
          name="phone"
          className="contact-input"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="contact-field">
        <label>Message</label>
        <textarea
          name="message"
          className="contact-textarea"
          placeholder="Tell us about your child's age, interests, or any questions you have..."
          required
        />
      </div>

      <button type="submit" className="contact-btn">
        Send Message →
      </button>
    </form>
  </div>
</section>

      {/* ── ACCESS ── */}
        <section id="acceso" className="access-sec">

        <div
            ref={accessRef.ref}
            style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            }}
        >

            <p
            className={`access-eyebrow reveal ${
                accessRef.visible ? "visible" : ""
            }`}
            >
            Family Portal
            </p>

            <h2
            className={`access-title reveal d1 ${
                accessRef.visible ? "visible" : ""
            }`}
            >
            Your <span>Montessori Journey</span>
            <br />
            begins here
            </h2>

            <p
            className={`access-desc reveal d2 ${
                accessRef.visible ? "visible" : ""
            }`}
            >
            A single place where families, teachers and administrators stay connected,
            share progress, communicate and follow every step of each child's Montessori experience.
            </p>

            <div className="access-cards">

            {isAuthenticated ? (

                <div
                className={`access-card reveal-scale d2 ${
                    accessRef.visible ? "visible" : ""
                }`}
                >

                <div className="access-card-icon icon-teal">
                    🚪
                </div>

                <div className="access-card-title">
                    Welcome Back!
                </div>

                <p className="access-card-desc">

                    Your session is currently active.

                    <br />
                    <br />

                    Access your personalized portal to:

                    <br />
                    • Review your student's progress, read classroom observations, upload tuition payment receipts, view attendance and classroom activities, stay connected with your Montessori community.

                </p>

                <Link
                    href="/dashboard"
                    className="btn-login"
                >
                    Enter Family Portal
                </Link>

                </div>

            ) : (

                <>

                <div
                    className={`access-card reveal-left d2 ${
                    accessRef.visible ? "visible" : ""
                    }`}
                >

                    <div className="access-card-icon icon-yellow">
                    🌟
                    </div>

                    <div className="access-card-title">
                    New Family?
                    </div>

                    <p className="access-card-desc">

                    Create your account and become part of the
                    City Place Montessori community.

                    <br />
                    <br />

                    Once registered you'll be able to enroll students,
                    follow their development and communicate with teachers.

                    </p>

                    <Link
                    href="/signup"
                    className="btn-register"
                    >
                    Create Account
                    </Link>

                </div>

                <div
                    className={`access-card reveal-right d3 ${
                    accessRef.visible ? "visible" : ""
                    }`}
                >

                    <div className="access-card-icon icon-teal">
                    🔑
                    </div>

                    <div className="access-card-title">
                    Already a Member?
                    </div>

                    <p className="access-card-desc">

                    Sign in to access your personalized dashboard.

                    <br />
                    <br />

                    View observations, academic progress,
                    tuition payments, school information
                    and everything related to your child's
                    Montessori journey.

                    </p>

                    <Link
                    href="/login"
                    className="btn-login"
                    >
                    Sign In
                    </Link>

                </div>

                </>

            )}

            </div>

        </div>

        </section>

    </>
  );
}