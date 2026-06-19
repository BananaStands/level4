import { faqs } from './content';

const stats = ['35 live games', '40k+ daily plays', '$650k+ monthly prizes'];
const audiences = ['Nonprofits', 'Schools', 'Sports teams', 'Creators', 'Fan communities'];

export default function Page() {
  return (
    <main>
      <section style={{ minHeight: '100vh', padding: '28px clamp(18px, 5vw, 72px)', background: 'radial-gradient(circle at 70% 10%, rgba(63,227,142,.22), transparent 34%), #080b09', color: '#f2f3f0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 86 }}>
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: '.04em' }}>LEVEL<span style={{ color: '#3fe38e' }}>4</span><div style={{ fontSize: 10, letterSpacing: '.42em', opacity: .6 }}>ENTERTAINMENT</div></div>
          <div className="l4-hide-mobile" style={{ display: 'flex', gap: 28, color: 'rgba(242,243,240,.72)', fontSize: 14 }}><a href="#how">How it works</a><a href="#who">Who it’s for</a><a href="#math">The math</a><a href="#faq">FAQ</a></div>
          <a href="mailto:john@level4e.com" style={{ background: '#3fe38e', color: '#06100a', padding: '14px 24px', borderRadius: 999, fontWeight: 800 }}>Plan a fundraiser</a>
        </nav>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(300px, .95fr)', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#3fe38e', fontFamily: 'Geist Mono, monospace', letterSpacing: '.35em', fontSize: 12 }}>FUNDRAISING, GAMIFIED</p>
            <h1 style={{ fontSize: 'clamp(58px, 8vw, 112px)', lineHeight: .92, margin: '22px 0', letterSpacing: '-.06em' }}>They play.<br />They win.<br /><span style={{ color: '#3fe38e' }}>You raise money.</span></h1>
            <p style={{ maxWidth: 660, color: 'rgba(242,243,240,.68)', fontSize: 20, lineHeight: 1.65 }}>Level4 builds branded trivia tournaments where your supporters compete for real prizes, and every entry funds your cause. We handle the tech, you bring the crowd.</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 34, flexWrap: 'wrap' }}><a href="mailto:john@level4e.com" style={{ background: '#3fe38e', color: '#06100a', padding: '18px 28px', borderRadius: 999, fontWeight: 900 }}>Plan a fundraiser</a><a href="#how" style={{ border: '1px solid rgba(242,243,240,.18)', padding: '18px 28px', borderRadius: 999, fontWeight: 800 }}>See how it works</a></div>
            <div style={{ display: 'flex', gap: 34, marginTop: 72, flexWrap: 'wrap' }}>{stats.map((s) => <strong key={s} style={{ fontSize: 26 }}>{s}</strong>)}</div>
          </div>
          <div className="l4-phone" style={{ justifySelf: 'center', width: 'min(390px, 90vw)', background: '#f7f7f1', color: '#111', borderRadius: 54, padding: 24, border: '12px solid #1f2420', boxShadow: '0 40px 120px rgba(0,0,0,.55)' }}>
            <div style={{ background: '#13ad69', color: 'white', borderRadius: 999, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>● LIVE Eastside Trivia</span><span>Score 0</span></div>
            <p style={{ marginTop: 34, color: '#a0a098', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>QUESTION 1 OF 5 +100 PTS</p>
            <h3 style={{ fontSize: 22 }}>Which trophy is awarded to the NHL champion?</h3>
            {['The Stanley Cup', 'The Larry O’Brien Trophy', 'The Claret Jug', 'The Vince Lombardi Trophy'].map((a, i) => <div key={a} style={{ background: 'white', margin: '14px 0', padding: 18, borderRadius: 18, boxShadow: '0 8px 22px rgba(0,0,0,.08)', fontWeight: 800 }}><span style={{ color: '#13ad69', marginRight: 14 }}>{String.fromCharCode(65+i)}</span>{a}</div>)}
          </div>
        </div>
      </section>
      <section id="how" style={{ padding: '90px clamp(18px, 5vw, 72px)', background: '#f4f3ed', color: '#141a16' }}><h2 style={{ fontSize: 52, margin: 0 }}>How it works</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginTop: 30 }}>{['Build your branded contest', 'Share a link or QR code', 'Supporters buy entries and play', 'Your cause receives the proceeds'].map((x,i)=><article key={x} style={{ background: 'white', padding: 28, borderRadius: 28 }}><b style={{ color: '#13ad69' }}>0{i+1}</b><h3>{x}</h3></article>)}</div></section>
      <section id="who" style={{ padding: '90px clamp(18px, 5vw, 72px)', background: '#101511' }}><h2 style={{ fontSize: 52 }}>Built for every crowd with a cause</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{audiences.map(a=><span key={a} style={{ border: '1px solid rgba(63,227,142,.35)', borderRadius: 999, padding: '12px 18px', color: '#3fe38e' }}>{a}</span>)}</div></section>
      <section id="math" style={{ padding: '90px clamp(18px, 5vw, 72px)', background: '#f4f3ed', color: '#141a16' }}><h2 style={{ fontSize: 52 }}>Simple fundraising math</h2><p style={{ fontSize: 22, maxWidth: 760, lineHeight: 1.6 }}>Your organization receives total ticket revenue less the Level4 service fee. Prize pools, campaigns, and rules can be tailored around your event or community.</p></section>
      <section id="faq" style={{ padding: '90px clamp(18px, 5vw, 72px)', background: '#080b09' }}><h2 style={{ fontSize: 52 }}>FAQ</h2>{faqs.map(f=><details key={f.question} style={{ borderTop: '1px solid rgba(242,243,240,.14)', padding: '22px 0' }}><summary style={{ cursor: 'pointer', fontSize: 22, fontWeight: 800 }}>{f.question}</summary><p style={{ color: 'rgba(242,243,240,.68)', fontSize: 18, lineHeight: 1.6 }}>{f.answer}</p></details>)}</section>
    </main>
  );
}
