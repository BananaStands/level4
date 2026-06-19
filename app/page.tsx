"use client";

import React from "react";
import { FAQS } from "./content";
import { siteConfig } from "./site-config";

/* ─────────────────────────────────────────────────────────────────────────
   Helper: parse a plain CSS string into a React style object. This lets the
   markup below reuse the original design's style declarations verbatim, which
   keeps the port faithful and easy to read/edit.
   ───────────────────────────────────────────────────────────────────────── */
const s = (css: string): React.CSSProperties => {
  const out: Record<string, string> = {};
  css.split(";").forEach((decl) => {
    const i = decl.indexOf(":");
    if (i === -1) return;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) return;
    const key = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
    out[key] = val;
  });
  return out as React.CSSProperties;
};

/* A drag-and-drop image placeholder, ready for you to swap in a real <img>.
   See README → "Adding your real photos". */
function ImageSlot({ label, radius = 16, style }: { label: string; radius?: number; style?: React.CSSProperties }) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: 18,
        boxSizing: "border-box",
        borderRadius: radius,
        background: "repeating-linear-gradient(-45deg, rgba(63,227,142,.07) 0 14px, rgba(244,243,239,.04) 14px 28px)",
        color: "rgba(242,243,240,.7)",
        ...style,
      }}
    >
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: ".06em", lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

const ARCHIVO = "'Archivo', sans-serif";
const MONO = "'Geist Mono', monospace";

interface FormState { name: string; email: string; org: string; type: string; msg: string; }
interface State {
  qi: number; score: number; picked: number | null; gameOver: boolean;
  step: number; tab: number; price: number; players: number; openFaq: number;
  form: FormState; formError: string; formSent: boolean;
}

type El = typeof React.createElement;

export default class LandingPage extends React.Component<Record<string, never>, State> {
  _adv?: ReturnType<typeof setTimeout>;
  _onScroll?: () => void;

  state: State = {
    qi: 0, score: 0, picked: null, gameOver: false,
    step: 0, tab: 0,
    price: 20, players: 500,
    openFaq: 0,
    form: { name: "", email: "", org: "", type: "", msg: "" },
    formError: "", formSent: false,
  };

  componentDidMount() {
    const root = document.getElementById("l4root");
    const canAnimate = document.visibilityState === "visible" && typeof IntersectionObserver === "function";
    if (root && canAnimate) root.setAttribute("data-anim", "");
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not([data-reveal="in"])').forEach((el) => {
        if ((el as HTMLElement).getBoundingClientRect().top < window.innerHeight) el.setAttribute("data-reveal", "in");
      });
    }, 2500);

    this._onScroll = () => {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      d.style.setProperty("--l4sp", max > 0 ? String(Math.min(1, d.scrollTop / max)) : "0");
    };
    window.addEventListener("scroll", this._onScroll, { passive: true });
    this._onScroll();

    requestAnimationFrame(() => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.setAttribute("data-reveal", "in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

      const cio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          const el = e.target as HTMLElement;
          const target = parseFloat(el.getAttribute("data-target") || "0");
          const start = performance.now(); const dur = 1700;
          const stepFn = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
            if (p < 1) requestAnimationFrame(stepFn);
          };
          requestAnimationFrame(stepFn);
        });
      }, { threshold: 0.5 });
      document.querySelectorAll("[data-countup]").forEach((el) => cio.observe(el));
    });
  }

  componentWillUnmount() {
    if (this._onScroll) window.removeEventListener("scroll", this._onScroll);
    if (this._adv) clearTimeout(this._adv);
  }

  // ---------- DEMO GAME ----------
  buildDemoGame(el: El) {
    const QS = [
      { q: "Which trophy is awarded to the NHL champion?", opts: ["The Stanley Cup", "The Larry O'Brien Trophy", "The Claret Jug", "The Vince Lombardi Trophy"], c: 0 },
      { q: "How many points is a touchdown, before the extra point?", opts: ["3", "6", "7", "9"], c: 1 },
      { q: "What is a perfect score in ten-pin bowling?", opts: ["200", "250", "300", "360"], c: 2 },
      { q: "How many players does each team field in soccer?", opts: ["9", "10", "11", "12"], c: 2 },
      { q: "A marathon is just over how many miles?", opts: ["13", "20", "26", "31"], c: 2 },
    ];
    const RANKS = [18, 11, 7, 4, 2, 1];
    const { qi, score, picked, gameOver } = this.state;
    const q = QS[qi];
    const corrects = Math.round(score / 100);
    const rank = RANKS[Math.min(corrects, RANKS.length - 1)];
    const mono = MONO;

    const pick = (i: number) => {
      if (this.state.picked !== null || this.state.gameOver) return;
      const correct = i === q.c;
      this.setState({ picked: i, score: this.state.score + (correct ? 100 : 0) });
      this._adv = setTimeout(() => {
        if (this.state.qi >= QS.length - 1) this.setState({ gameOver: true, picked: null });
        else this.setState({ qi: this.state.qi + 1, picked: null });
      }, 1100);
    };
    const reset = () => this.setState({ qi: 0, score: 0, picked: null, gameOver: false });

    const LETTERS = ["A", "B", "C", "D"];
    const BADGE = [
      { bg: "rgba(32,169,95,.15)", bd: "rgba(32,169,95,.42)", fg: "#15915E" },
      { bg: "rgba(91,91,214,.13)", bd: "rgba(91,91,214,.4)", fg: "#5B5BD6" },
      { bg: "rgba(224,151,58,.16)", bd: "rgba(224,151,58,.46)", fg: "#C47D1E" },
      { bg: "rgba(14,154,167,.15)", bd: "rgba(14,154,167,.44)", fg: "#0E8E9A" },
    ];

    const signalBars = el("div", { style: { display: "flex", alignItems: "flex-end", gap: 2.5, height: 12 } },
      ...[5, 7.5, 10, 12].map((h, i) => el("div", { key: "sb" + i, style: { width: 3.5, height: h, borderRadius: 1, background: "#141A16" } })));
    const wifiIcon = el("div", { style: { width: 17, height: 13, position: "relative" } },
      ...[{ ss: 17, t: 0 }, { ss: 11, t: 4 }, { ss: 5, t: 8 }].map((a, i) => el("div", { key: "wf" + i, style: { position: "absolute", left: "50%", top: a.t, transform: "translateX(-50%)", width: a.ss, height: a.ss, borderRadius: "50%", border: "2px solid #141A16", borderBottomColor: "transparent", borderLeftColor: "transparent", rotate: "-45deg" } })),
      el("div", { style: { position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "#141A16" } }));
    const battery = el("div", { style: { display: "flex", alignItems: "center", gap: 2 } },
      el("div", { style: { width: 24, height: 12, borderRadius: 3.5, border: "1.5px solid rgba(20,26,22,.4)", padding: 1.5, boxSizing: "border-box" } },
        el("div", { style: { width: "78%", height: "100%", borderRadius: 1.5, background: "#117A4A" } })),
      el("div", { style: { width: 1.5, height: 4, borderRadius: 1, background: "rgba(20,26,22,.4)" } }));
    const statusBar = el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 30px 6px", flexShrink: 0 } },
      el("span", { style: { fontFamily: ARCHIVO, fontSize: 15, fontWeight: 700, color: "#141A16", letterSpacing: ".01em" } }, "9:41"),
      el("div", { style: { display: "flex", alignItems: "center", gap: 7 } }, signalBars, wifiIcon, battery));

    const shell = (children: React.ReactNode[]) => el("div", { style: { position: "relative", zIndex: 2, width: "min(346px, 86vw)", margin: "0 auto" } },
      el("div", { style: { position: "absolute", inset: -64, background: "radial-gradient(closest-side, rgba(63,227,142,.34), transparent 70%)", animation: "l4breathe 5s ease-in-out infinite", pointerEvents: "none" } }),
      el("div", { style: { position: "relative", borderRadius: 58, padding: 11, background: "linear-gradient(150deg, #51564f 0%, #20251f 38%, #3a423a 70%, #181c18 100%)", boxShadow: "0 60px 120px rgba(0,0,0,.7), 0 10px 30px rgba(0,0,0,.5), inset 0 0 0 1.5px rgba(255,255,255,.14), inset 0 2px 4px rgba(255,255,255,.22), inset 0 -3px 6px rgba(0,0,0,.4)" } },
        el("div", { style: { position: "relative", borderRadius: 47, overflow: "hidden", backgroundColor: "#F4F6F1", backgroundImage: "radial-gradient(120% 60% at 50% -8%, rgba(32,169,95,.16), transparent 60%), radial-gradient(90% 50% at 100% 108%, rgba(14,154,167,.12), transparent 62%), linear-gradient(180deg, #F6F8F3 0%, #E9EDE6 100%)", display: "flex", flexDirection: "column", minHeight: 624, fontFamily: ARCHIVO } },
          statusBar,
          el("div", { style: { position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 108, height: 31, borderRadius: 999, background: "#0A0C0B", zIndex: 5, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" } },
            el("div", { style: { position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", width: 9, height: 9, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #1f3b4d, #07090a)" } })),
          el("div", { style: { flex: 1, display: "flex", flexDirection: "column", padding: "14px 18px 8px" } }, ...children),
          el("div", { style: { display: "flex", justifyContent: "center", padding: "8px 0 9px", flexShrink: 0 } },
            el("div", { style: { width: 126, height: 5, borderRadius: 99, background: "rgba(20,26,22,.32)" } })))
      )
    );

    const header = el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 13px", borderRadius: 20, background: "linear-gradient(125deg, #0E7C86 0%, #15915E 55%, #20A95F 100%)", boxShadow: "0 14px 28px rgba(14,124,134,.34), inset 0 1px 0 rgba(255,255,255,.28)" } },
      el("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.22)", borderRadius: 999, padding: "6px 11px", fontFamily: mono, fontSize: 9, letterSpacing: ".16em", color: "#FFFFFF", whiteSpace: "nowrap" } },
        el("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 9px rgba(255,255,255,.95)", animation: "l4pulse 1.6s ease-in-out infinite" } }), "LIVE"),
      el("span", { style: { fontFamily: ARCHIVO, fontVariationSettings: "'wdth' 112", fontWeight: 750, fontSize: 14, color: "#FFFFFF", letterSpacing: ".005em", flex: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, "Eastside Trivia"),
      el("span", { key: "sc-" + score, style: { display: "inline-flex", alignItems: "baseline", gap: 5, background: "rgba(8,10,9,.26)", borderRadius: 999, padding: "6px 11px", fontFamily: mono, fontSize: 9, letterSpacing: ".1em", color: "rgba(255,255,255,.85)", whiteSpace: "nowrap", animation: "l4pop .35s ease" } }, "SCORE", el("span", { style: { fontSize: 14.5, fontWeight: 700, letterSpacing: 0, color: "#FFFFFF" } }, String(score)))
    );

    if (gameOver) {
      return shell([
        header,
        el("div", { key: "go", style: { textAlign: "center", padding: "20px 6px 8px" } },
          el("p", { style: { margin: 0, fontFamily: mono, fontSize: 11, letterSpacing: ".24em", color: "rgba(20,26,22,.45)" } }, "FINAL RESULT"),
          el("p", { style: { margin: "10px 0 12px", fontVariationSettings: "'wdth' 118", fontWeight: 800, fontSize: 72, lineHeight: 1, letterSpacing: "-.03em", color: "#141A16", animation: "l4pop .5s ease" } }, String(score)),
          el("span", { style: { display: "inline-flex", background: "#141A16", borderRadius: 999, padding: "9px 18px", fontFamily: mono, fontSize: 11, letterSpacing: ".14em", color: "#3FE38E", marginBottom: 20, whiteSpace: "nowrap" } }, "YOU FINISH #" + rank + " OF 248"),
          el("p", { style: { margin: "0 auto 24px", maxWidth: 320, fontSize: 15.5, lineHeight: 1.6, color: "rgba(20,26,22,.65)" } },
            "That rush? That\u2019s what your supporters feel. And every entry funds your cause."),
          el("div", { style: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" } },
            el("button", { onClick: reset, style: { all: "unset", cursor: "pointer", background: "#141A16", color: "#3FE38E", fontWeight: 700, fontSize: 15, padding: "14px 28px", borderRadius: 999, fontFamily: ARCHIVO, whiteSpace: "nowrap", boxShadow: "0 10px 26px rgba(20,26,22,.3)" } }, "Play again"),
            el("a", { href: "#cta", style: { textDecoration: "none", color: "#141A16", fontWeight: 650, fontSize: 15, padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(20,26,22,.3)", whiteSpace: "nowrap" } }, "Plan a fundraiser"))
        ),
      ]);
    }

    const segs = el("div", { key: "segs", style: { display: "flex", gap: 6, marginBottom: 20 } },
      ...QS.map((_, i) => el("div", { key: "seg-" + i, style: { flex: 1, height: 5, borderRadius: 99, background: "rgba(20,26,22,.1)", overflow: "hidden" } },
        i < qi
          ? el("div", { style: { height: "100%", width: "100%", background: "linear-gradient(90deg, #0E7C86, #15915E)", borderRadius: 99 } })
          : (i === qi
            ? el("div", { key: "tm-" + qi, style: { height: "100%", background: "linear-gradient(90deg, #0E7C86, #20A95F)", borderRadius: 99, animation: "l4timerbar 10s linear forwards" } })
            : null))));

    const options = q.opts.map((opt, i) => {
      const isPicked = picked === i;
      const isCorrect = i === q.c;
      const revealed = picked !== null;
      let btn = { background: "linear-gradient(180deg, #FFFFFF, #FBFCFA)", border: "1px solid rgba(20,26,22,.1)", color: "#141A16", boxShadow: "0 3px 8px rgba(20,26,22,.06)", opacity: 1 };
      let badge = { background: BADGE[i].bg, border: "1px solid " + BADGE[i].bd, color: BADGE[i].fg };
      if (revealed && isCorrect) {
        btn = { background: "linear-gradient(135deg, #117A4A, #18995F)", border: "1px solid #117A4A", color: "#FFFFFF", boxShadow: "0 12px 30px rgba(17,122,74,.35)", opacity: 1 };
        badge = { background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#FFFFFF" };
      } else if (revealed && isPicked) {
        btn = { background: "#C84A35", border: "1px solid #C84A35", color: "#FFFFFF", boxShadow: "0 10px 24px rgba(200,74,53,.3)", opacity: 1 };
        badge = { background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#FFFFFF" };
      } else if (revealed) {
        btn.opacity = .4;
      }
      return el("button", {
        key: qi + "-" + i, onClick: () => pick(i), className: "l4opt", "data-done": revealed ? "" : undefined,
        style: { all: "unset", boxSizing: "border-box", cursor: revealed ? "default" : "pointer", width: "100%", padding: "11px 13px", borderRadius: 16, fontFamily: ARCHIVO, display: "flex", alignItems: "center", gap: 14, transition: "all .22s ease", background: btn.background, border: btn.border, color: btn.color, boxShadow: btn.boxShadow, opacity: btn.opacity, animation: revealed && isPicked && !isCorrect ? "l4shake .35s ease" : (revealed && isCorrect ? "l4pop .35s ease" : "none") }
      },
        el("span", { style: { width: 30, height: 30, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 12, flexShrink: 0, background: badge.background, border: badge.border, color: badge.color } }, LETTERS[i]),
        el("span", { style: { fontSize: 15.5, fontWeight: 650, flex: 1, lineHeight: 1.3 } }, opt),
        revealed && isCorrect ? el("span", { style: { fontSize: 15, fontWeight: 700 } }, "\u2713") : null);
    });

    return shell([
      header,
      segs,
      el("div", { key: "qmeta", style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, margin: "0 2px 8px" } },
        el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".2em", color: "rgba(20,26,22,.45)", whiteSpace: "nowrap" } }, "QUESTION " + (qi + 1) + " OF 5"),
        el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".1em", color: "#117A4A", whiteSpace: "nowrap" } }, "+100 PTS")),
      el("p", { key: "qtext", style: { margin: "0 2px 14px", fontSize: 18.5, fontWeight: 700, lineHeight: 1.32, color: "#141A16", letterSpacing: "-.015em" } }, q.q),
      el("div", { key: "opts", style: { display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 } }, ...options),
      el("div", { key: "foot", style: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px dashed rgba(20,26,22,.15)" } },
        el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".12em", color: "rgba(20,26,22,.5)" } }, "PRIZE POOL $5,000"),
        el("span", { key: "rk-" + rank, style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#141A16", borderRadius: 999, padding: "7px 14px", fontFamily: mono, fontSize: 10.5, letterSpacing: ".1em", color: "#3FE38E", animation: "l4pop .35s ease", whiteSpace: "nowrap" } }, "YOU\u2019RE #" + rank + " \u25B2")),
    ]);
  }

  // ---------- STEPPER ----------
  buildStepper(el: El) {
    const STEPS = [
      { t: "Choose the campaign", d: "Pick a fundraising goal, a theme, a prize, and the audience you want to activate.", tags: ["Goal", "Theme", "Prize", "Audience"] },
      { t: "Level4 builds your game site", d: "A branded trivia experience with your logo, colors, messaging, prize details, and custom question categories when needed.", tags: ["Your logo", "Your colors", "Custom questions"] },
      { t: "You invite your crowd", d: "Promote one link or QR code through your website, email, social, events, newsletters, and partners.", tags: ["Link", "QR code", "Social", "Email"] },
      { t: "Players enter and compete", d: "They buy entries, answer questions, climb the leaderboard, and play again to beat their rank.", tags: ["Paid entries", "Leaderboard", "Repeat play"] },
      { t: "You raise money", d: "Ticket revenue supports your organization after the 20% Level4 service fee. Your supporters get a story worth sharing.", tags: ["80% to your cause", "Winners notified", "Prizes handled"] },
    ];
    const mono = MONO;
    const cur = this.state.step;
    const go = (i: number) => this.setState({ step: (i + STEPS.length) % STEPS.length });

    const list = el("div", { style: { display: "flex", flexDirection: "column" } },
      ...STEPS.map((st, i) => el("button", {
        key: i, onClick: () => go(i),
        style: { all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: 20, padding: "20px 18px", borderRadius: 16, fontFamily: ARCHIVO, background: i === cur ? "rgba(63,227,142,.08)" : "transparent", border: i === cur ? "1px solid rgba(63,227,142,.35)" : "1px solid transparent", transition: "all .25s ease", marginBottom: 6 }
      },
        el("span", { style: { fontFamily: mono, fontSize: 12, color: i === cur ? "#3FE38E" : "rgba(242,243,240,.4)", minWidth: 26 } }, "0" + (i + 1)),
        el("span", { style: { fontSize: 18, fontWeight: 650, color: i === cur ? "#F8F8F5" : "rgba(242,243,240,.55)", letterSpacing: "-.01em" } }, st.t)
      ))
    );

    const panel = el("div", { key: "panel-" + cur, style: { background: "rgba(244,243,239,.03)", border: "1px solid rgba(244,243,239,.1)", borderRadius: 26, padding: "clamp(28px, 3vw, 48px)", display: "flex", flexDirection: "column", minHeight: 360, animation: "l4pop .4s ease" } },
      el("span", { style: { fontVariationSettings: "'wdth' 120", fontWeight: 800, fontSize: "clamp(72px, 8vw, 130px)", lineHeight: 1, letterSpacing: "-.03em", color: "rgba(63,227,142,.18)" } }, "0" + (cur + 1)),
      el("h3", { style: { margin: "18px 0 14px", fontVariationSettings: "'wdth' 114", fontWeight: 750, fontSize: "clamp(26px, 2.4vw, 38px)", letterSpacing: "-.02em", color: "#F8F8F5" } }, STEPS[cur].t),
      el("p", { style: { margin: "0 0 28px", fontSize: 17.5, lineHeight: 1.65, color: "rgba(242,243,240,.65)", maxWidth: 520 } }, STEPS[cur].d),
      el("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 } },
        ...STEPS[cur].tags.map((tg, i) => el("span", { key: i, style: { fontFamily: mono, fontSize: 11.5, letterSpacing: ".1em", color: "#3FE38E", border: "1px solid rgba(63,227,142,.3)", borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap" } }, tg.toUpperCase()))),
      el("div", { style: { marginTop: "auto", display: "flex", gap: 10, alignItems: "center" } },
        el("button", { onClick: () => go(cur - 1), style: { all: "unset", cursor: "pointer", width: 46, height: 46, borderRadius: "50%", border: "1px solid rgba(244,243,239,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#F2F3F0" } }, "\u2190"),
        el("button", { onClick: () => go(cur + 1), style: { all: "unset", cursor: "pointer", width: 46, height: 46, borderRadius: "50%", background: "#3FE38E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#0A0C0B", fontWeight: 700 } }, "\u2192"),
        el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".16em", color: "rgba(242,243,240,.4)", marginLeft: 10 } }, "0" + (cur + 1) + " / 05"))
    );

    return el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 28, alignItems: "start" } }, list, panel);
  }

  // ---------- AUDIENCE TABS ----------
  buildTabs(el: El) {
    const TABS = [
      { label: "Schools", ph: "Drop: students / school spirit photo", h: "Give your whole community a reason to join.", d: "Students, parents, alumni, and local businesses all play the same tournament: spirit week, championship season, or a year-round school challenge.", pts: ["Spirit-week tournaments", "Booster-friendly prize pools", "Works for one event or all year"] },
      { label: "Charities + foundations", ph: "Drop: mission / community photo", h: "Turn supporters into active participants.", d: "Create recurring fundraising moments tied to your mission, events, honorees, and donor community. Not another appeal email.", pts: ["Recurring giving moments", "Campaigns around galas + honorees", "A story donors share"] },
      { label: "Sports + boosters", ph: "Drop: team / game day photo", h: "Built for game day energy.", d: "Team trivia, signed gear, VIP access, and fan prizes. Campaigns built around the moments your fans already care about.", pts: ["Team + league trivia", "Signed gear + VIP prizes", "Game day QR activations"] },
      { label: "Alumni groups", ph: "Drop: campus / reunion photo", h: "Nostalgia is a fundraising engine.", d: "A trivia tournament around school history, sports moments, and campus life that makes alumni feel like students again.", pts: ["Class vs. class competition", "Reunion weekend tournaments", "Pride that pays forward"] },
      { label: "Corporate giving", ph: "Drop: team / office photo", h: "Giving that feels like a team challenge.", d: "Replace the internal donation email with department leaderboards, bragging rights, and a cause your people pick together.", pts: ["Department leaderboards", "Matched-giving friendly", "Five-minute onboarding"] },
      { label: "Fan communities", ph: "Drop: fans / crowd photo", h: "Turn fandom into friendly competition.", d: "Music, podcast, and sports fan bases compete on the trivia they already argue about, for causes they care about.", pts: ["Fandom-deep question sets", "Creator + partner campaigns", "Built to go viral"] },
    ];
    const mono = MONO;
    const t = this.state.tab;
    const tab = TABS[t];
    // Only some audiences have a photo uploaded yet. Add a file to
    // public/photos and a line here to fill the rest.
    const TAB_IMG: Record<string, string> = { Schools: "img-aud-schools" };
    const TAB_ALT: Record<string, string> = { Schools: "Students and staff celebrating money raised at a Level4 school trivia night fundraiser" };
    const tabImg = TAB_IMG[tab.label];

    const bar = el("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 } },
      ...TABS.map((tb, i) => el("button", {
        key: i, onClick: () => this.setState({ tab: i }),
        style: { all: "unset", boxSizing: "border-box", cursor: "pointer", padding: "12px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 650, fontFamily: ARCHIVO, whiteSpace: "nowrap", background: i === t ? "#141A16" : "#FFFFFF", color: i === t ? "#3FE38E" : "#141A16", border: i === t ? "1px solid #141A16" : "1px solid rgba(20,26,22,.12)", transition: "all .25s ease" }
      }, tb.label))
    );

    const panel = el("div", { key: "tab-" + t, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 28, alignItems: "stretch", animation: "l4pop .4s ease" } },
      el("div", { style: { background: "#FFFFFF", border: "1px solid rgba(20,26,22,.08)", borderRadius: 26, padding: "clamp(28px, 3vw, 44px)", display: "flex", flexDirection: "column" } },
        el("p", { style: { margin: "0 0 16px", fontFamily: mono, fontSize: 11, letterSpacing: ".22em", color: "#117A4A" } }, tab.label.toUpperCase()),
        el("h3", { style: { margin: "0 0 14px", fontVariationSettings: "'wdth' 114", fontWeight: 750, fontSize: "clamp(26px, 2.4vw, 36px)", lineHeight: 1.1, letterSpacing: "-.02em", color: "#141A16" } }, tab.h),
        el("p", { style: { margin: "0 0 24px", fontSize: 17, lineHeight: 1.65, color: "#59605B" } }, tab.d),
        el("div", { style: { display: "flex", flexDirection: "column", gap: 0, marginTop: "auto" } },
          ...tab.pts.map((p, i) => el("div", { key: i, style: { display: "flex", alignItems: "center", gap: 14, padding: "14px 2px", borderTop: "1px solid rgba(20,26,22,.08)" } },
            el("span", { style: { color: "#117A4A", fontSize: 15 } }, "\u2192"),
            el("span", { style: { fontSize: 15.5, fontWeight: 600, color: "#141A16" } }, p))))
      ),
      tabImg
        ? el("img", { src: "/photos/" + tabImg + ".webp", alt: TAB_ALT[tab.label] || tab.h, style: { display: "block", width: "100%", minHeight: 380, height: "100%", objectFit: "cover", borderRadius: 26 } })
        : el(ImageSlot, { radius: 26, label: tab.ph, style: { width: "100%", minHeight: 380, height: "100%", color: "#6b716c", background: "rgba(20,26,22,.05)" } })
    );

    return el("div", null, bar, panel);
  }

  // ---------- CALCULATOR ----------
  buildCalculator(el: El) {
    const mono = MONO;
    const { price, players } = this.state;
    const gross = price * players;
    const fee = Math.round(gross * 0.2);
    const net = gross - fee;
    const fmt = (n: number) => "$" + n.toLocaleString("en-US");

    const slider = (label: string, value: number, display: string, min: number, max: number, step: number, key: "price" | "players") => el("div", { style: { marginBottom: 34 } },
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 } },
        el("span", { style: { fontFamily: mono, fontSize: 11.5, letterSpacing: ".18em", color: "#59605B" } }, label),
        el("span", { style: { fontVariationSettings: "'wdth' 116", fontWeight: 760, fontSize: 30, color: "#141A16", letterSpacing: "-.02em" } }, display)),
      el("input", {
        type: "range", min, max, step, value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ [key]: Number(e.target.value) } as unknown as Pick<State, "price" | "players">),
        style: { width: "100%", display: "block" }, "aria-label": label,
      }));

    return el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))", gap: 24, alignItems: "stretch" } },
      el("div", { style: { background: "#FFFFFF", border: "1px solid rgba(20,26,22,.08)", borderRadius: 28, padding: "clamp(30px, 3vw, 48px)" } },
        slider("ENTRY PRICE", price, "$" + price, 5, 100, 5, "price"),
        slider("PLAYERS", players, players.toLocaleString("en-US"), 50, 5000, 50, "players"),
        el("div", { style: { borderTop: "1px solid rgba(20,26,22,.1)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" } },
          el("span", { style: { fontFamily: mono, fontSize: 11.5, letterSpacing: ".18em", color: "#59605B" } }, "TOTAL ENTRY REVENUE"),
          el("span", { style: { fontVariationSettings: "'wdth' 116", fontWeight: 740, fontSize: 26, color: "#141A16" } }, fmt(gross)))),
      el("div", { style: { background: "#141A16", color: "#F2F3F0", borderRadius: 28, padding: "clamp(30px, 3vw, 48px)", display: "flex", flexDirection: "column" } },
        el("p", { style: { margin: "0 0 8px", fontFamily: mono, fontSize: 11.5, letterSpacing: ".22em", color: "#3FE38E" } }, "YOUR ORGANIZATION KEEPS"),
        el("p", { key: "net-" + net, style: { margin: "0 0 26px", fontVariationSettings: "'wdth' 118", fontWeight: 790, fontSize: "clamp(54px, 5vw, 86px)", lineHeight: 1, letterSpacing: "-.03em", color: "#F8F8F5" } }, fmt(net)),
        el("div", { style: { display: "flex", height: 16, borderRadius: 99, overflow: "hidden", marginBottom: 14 } },
          el("div", { style: { width: "80%", background: "#3FE38E", transition: "width .3s ease" } }),
          el("div", { style: { width: "20%", background: "rgba(244,243,239,.18)" } })),
        el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 30 } },
          el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".1em", color: "#3FE38E" } }, "80% YOUR CAUSE \u00b7 " + fmt(net)),
          el("span", { style: { fontFamily: mono, fontSize: 11, letterSpacing: ".1em", color: "rgba(242,243,240,.5)" } }, "20% LEVEL4 \u00b7 " + fmt(fee))),
        el("p", { style: { margin: "auto 0 0", fontSize: 15, lineHeight: 1.6, color: "rgba(242,243,240,.6)" } },
          "One tournament, recurring tournaments, or always-on fundraising. The structure is up to you.")));
  }

  // ---------- LEAD FORM ----------
  buildLeadForm(el: El) {
    const mono = MONO;
    const { form, formError, formSent } = this.state;
    const TYPES = ["School", "Charity / Nonprofit", "Foundation", "Sports team / Booster", "Alumni group", "Influencer / Creator", "Company", "Other"];
    const setF = (k: keyof FormState, v: string) => this.setState({ form: Object.assign({}, this.state.form, { [k]: v }), formError: "" });

    const inputStyle: React.CSSProperties = {
      all: "unset", boxSizing: "border-box", width: "100%", fontFamily: ARCHIVO,
      fontSize: 16, color: "#141A16", background: "#FFFFFF",
      border: "1px solid rgba(20,26,22,.15)", borderRadius: 14, padding: "15px 18px",
      transition: "border-color .2s ease", cursor: "text", boxShadow: "0 1px 0 rgba(20,26,22,.04)",
    };
    const labelStyle: React.CSSProperties = { display: "block", fontFamily: mono, fontSize: 10.5, letterSpacing: ".2em", color: "#59605B", margin: "0 0 8px" };

    const card = (children: React.ReactNode[]) => el("div", {
      style: { background: "linear-gradient(172deg, #FAFAF7, #F0F1EB)", border: "1px solid rgba(255,255,255,.5)", borderRadius: 28, padding: "clamp(28px, 3vw, 44px)", textAlign: "left", boxShadow: "0 50px 110px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.9)" }
    }, ...children);

    if (formSent) {
      return card([
        el("div", { key: "sent", style: { textAlign: "center", padding: "60px 10px" } },
          el("div", { style: { width: 74, height: 74, borderRadius: "50%", background: "rgba(17,122,74,.1)", border: "1.5px solid #117A4A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 30, color: "#117A4A", animation: "l4pop .5s ease" } }, "\u2713"),
          el("h3", { style: { margin: "0 0 12px", fontVariationSettings: "'wdth' 114", fontWeight: 750, fontSize: 30, color: "#141A16", letterSpacing: "-.02em" } }, "You\u2019re on the list."),
          el("p", { style: { margin: "0 auto 28px", maxWidth: 380, fontSize: 16, lineHeight: 1.65, color: "rgba(20,26,22,.65)" } },
            "Thanks, " + (form.name.split(" ")[0] || "friend") + ". The Level4 team will reach out shortly to start shaping your campaign."),
          el("button", { onClick: () => this.setState({ formSent: false, form: { name: "", email: "", org: "", type: "", msg: "" } }), style: { all: "unset", cursor: "pointer", fontFamily: mono, fontSize: 12, letterSpacing: ".16em", color: "#117A4A", borderBottom: "1px solid rgba(17,122,74,.4)", paddingBottom: 2 } }, "SUBMIT ANOTHER REQUEST"))
      ]);
    }

    const submit = () => {
      const f = this.state.form;
      if (!f.name.trim() || !f.email.trim() || !f.type) {
        this.setState({ formError: "Please add your name, email, and pick what kind of organization you are." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
        this.setState({ formError: "That email doesn\u2019t look right. Mind double-checking it?" });
        return;
      }
      const to = siteConfig.contacts.john;
      const subject = encodeURIComponent("Level4 campaign request: " + (f.org || f.name));
      const body = encodeURIComponent(
        "Name: " + f.name + "\nEmail: " + f.email + "\nOrganization: " + (f.org || "n/a") +
        "\nType: " + f.type + "\n\nWhat we want to run:\n" + (f.msg || "n/a"));
      this.setState({ formSent: true });
      try { window.open("mailto:" + to + "?subject=" + subject + "&body=" + body, "_self"); } catch (e) { /* noop */ }
    };

    return card([
      el("p", { key: "k1", style: { margin: "0 0 6px", fontFamily: mono, fontSize: 11, letterSpacing: ".22em", color: "#117A4A" } }, "GET MORE INFO / START A CAMPAIGN"),
      el("h3", { key: "k2", style: { margin: "0 0 26px", fontVariationSettings: "'wdth' 114", fontWeight: 750, fontSize: "clamp(24px, 2.2vw, 32px)", color: "#141A16", letterSpacing: "-.02em" } }, "It takes two minutes."),
      el("div", { key: "k3", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 18 } },
        el("div", null, el("span", { style: labelStyle }, "YOUR NAME *"),
          el("input", { value: form.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF("name", e.target.value), placeholder: "Jordan Smith", style: inputStyle })),
        el("div", null, el("span", { style: labelStyle }, "EMAIL *"),
          el("input", { value: form.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF("email", e.target.value), placeholder: "you@organization.org", type: "email", style: inputStyle }))),
      el("div", { key: "k4", style: { marginBottom: 18 } },
        el("span", { style: labelStyle }, "ORGANIZATION / COMMUNITY"),
        el("input", { value: form.org, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF("org", e.target.value), placeholder: "Eastside High Boosters, Hope Foundation, @yourchannel\u2026", style: inputStyle })),
      el("div", { key: "k5", style: { marginBottom: 18 } },
        el("span", { style: labelStyle }, "I\u2019M A\u2026 *"),
        el("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
          ...TYPES.map((tp) => el("button", {
            key: tp, onClick: () => setF("type", tp),
            style: { all: "unset", boxSizing: "border-box", cursor: "pointer", padding: "10px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, fontFamily: ARCHIVO, whiteSpace: "nowrap", transition: "all .2s ease", background: form.type === tp ? "#141A16" : "#FFFFFF", color: form.type === tp ? "#3FE38E" : "#141A16", border: form.type === tp ? "1px solid #141A16" : "1px solid rgba(20,26,22,.15)" }
          }, tp)))),
      el("div", { key: "k6", style: { marginBottom: 24 } },
        el("span", { style: labelStyle }, "WHAT WOULD YOU WANT TO RUN?"),
        el("textarea", { value: form.msg, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setF("msg", e.target.value), rows: 3, placeholder: "A trivia night for our team\u2019s travel fund, a contest for my followers, an alumni weekend tournament\u2026", style: Object.assign({}, inputStyle, { resize: "vertical", minHeight: 84, lineHeight: 1.55 }) })),
      formError ? el("p", { key: "err", style: { margin: "0 0 18px", fontSize: 14, lineHeight: 1.5, color: "#C84A35", fontWeight: 600 } }, formError) : null,
      el("button", { key: "sub", onClick: submit, className: "l4opt", style: { all: "unset", boxSizing: "border-box", cursor: "pointer", display: "block", width: "100%", textAlign: "center", background: "#141A16", color: "#3FE38E", fontWeight: 700, fontSize: 16.5, padding: "17px 0", borderRadius: 999, fontFamily: ARCHIVO, border: "1px solid #141A16", boxShadow: "0 14px 34px rgba(20,26,22,.35)", transition: "transform .25s ease, box-shadow .25s ease" } }, "Start my contest \u2192"),
      el("p", { key: "fine", style: { margin: "14px 0 0", fontFamily: mono, fontSize: 10.5, letterSpacing: ".08em", textAlign: "center", color: "rgba(20,26,22,.45)" } }, "NO COMMITMENT. WE\u2019LL HELP YOU SCOPE IT FIRST."),
    ]);
  }

  render() {
    const el = React.createElement;
    const open = this.state.openFaq;
    const faqs = FAQS.map((f, i) => ({
      q: f.q,
      icon: open === i ? "\u2212" : "+",
      qColor: open === i ? "#117A4A" : "#141A16",
      toggle: () => this.setState({ openFaq: this.state.openFaq === i ? -1 : i }),
      body: el("div", { style: { display: "grid", gridTemplateRows: open === i ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.2,.6,.2,1)" } },
        el("div", { style: { overflow: "hidden" } },
          el("p", { style: { margin: 0, padding: "0 40px 26px 4px", fontSize: 16, lineHeight: 1.65, color: "#59605B" } }, f.a))),
    }));
    const emailJohn = siteConfig.contacts.john;
    const emailBradley = siteConfig.contacts.bradley;

    return (
      <div id="l4root" style={s("font-family: 'Archivo', sans-serif; background: #0A0C0B; color: #F2F3F0; overflow-x: clip;")}>

        {/* scroll progress */}
        <div style={s("position: fixed; top: 0; left: 0; height: 3px; width: calc(var(--l4sp, 0) * 100%); background: #3FE38E; z-index: 200;")}></div>

        {/* NAV */}
        <nav style={s("position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px 5vw; background: rgba(10,12,11,.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(244,243,239,.07);")}>
          <a href="#top" style={s("text-decoration: none; color: #F2F3F0; display: flex; flex-direction: column; gap: 1px; line-height: 1;")}>
            <span style={s("font-variation-settings: 'wdth' 120; font-weight: 800; font-size: 21px; letter-spacing: .04em;")}>LEVEL<span style={s("color: #3FE38E;")}>4</span></span>
            <span style={s("font-family: 'Geist Mono', monospace; font-size: 8.5px; letter-spacing: .42em; color: rgba(242,243,240,.55);")}>ENTERTAINMENT</span>
          </a>
          <div data-nav-links="" style={s("display: flex; align-items: center; gap: 26px;")}>
            <a href="#how" className="l4-navlink" style={s("text-decoration: none; color: rgba(242,243,240,.7); font-size: 14px; font-weight: 500;")}>How it works</a>
            <a href="#who" className="l4-navlink" style={s("text-decoration: none; color: rgba(242,243,240,.7); font-size: 14px; font-weight: 500;")}>Who it&rsquo;s for</a>
            <a href="#math" className="l4-navlink" style={s("text-decoration: none; color: rgba(242,243,240,.7); font-size: 14px; font-weight: 500;")}>The math</a>
            <a href="#faq" className="l4-navlink" style={s("text-decoration: none; color: rgba(242,243,240,.7); font-size: 14px; font-weight: 500;")}>FAQ</a>
          </div>
          <a href="#cta" className="l4-btn-mint" style={s("text-decoration: none; background: #3FE38E; color: #0A0C0B; font-weight: 700; font-size: 14px; padding: 11px 22px; border-radius: 999px; white-space: nowrap; transition: transform .25s ease, box-shadow .25s ease;")}>Plan a fundraiser</a>
        </nav>

        {/* HERO */}
        <header id="top" data-screen-label="Hero" style={s("position: relative; padding: clamp(112px, 14vw, 160px) 5vw clamp(40px, 6vw, 56px); background-image: radial-gradient(900px 600px at 75% -10%, rgba(63,227,142,.16), transparent 62%), radial-gradient(600px 420px at 5% 105%, rgba(63,227,142,.06), transparent 60%), radial-gradient(rgba(244,243,239,.06) 1px, transparent 1.5px); background-size: auto, auto, 36px 36px;")}>
          <div style={s("max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(460px, 100%), 1fr)); gap: clamp(28px, 5vw, 64px); align-items: center;")}>
            <div style={s("min-width: 0;")}>
              <p style={s("margin: 0 0 26px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #3FE38E; display: flex; align-items: center; gap: 12px;")}><span style={s("width: 8px; height: 8px; border-radius: 50%; background: #3FE38E; animation: l4pulse 1.8s ease-in-out infinite;")}></span>Fundraising, gamified</p>
              <h1 style={s("margin: 0 0 26px; font-variation-settings: 'wdth' 116; font-weight: 780; font-size: clamp(54px, 5.8vw, 100px); line-height: .96; letter-spacing: -0.028em; text-wrap: balance; color: #F8F8F5;")}>They play.<br />They win.<br /><em style={s("font-style: normal; color: #3FE38E;")}>You raise money.</em></h1>
              <p style={s("margin: 0 0 38px; max-width: 520px; font-size: 19px; line-height: 1.6; color: rgba(242,243,240,.65); text-wrap: pretty;")}>Level4 builds branded skill-based trivia tournaments where your supporters compete for real prizes, and every entry funds your cause. We handle the tech, you bring the crowd.</p>
              <div style={s("display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 56px;")}>
                <a href="#cta" className="l4-btn-mint-lg" style={s("text-decoration: none; background: #3FE38E; color: #0A0C0B; font-weight: 700; font-size: 16px; padding: 17px 34px; border-radius: 999px; white-space: nowrap; transition: transform .25s ease, box-shadow .25s ease;")}>Plan a fundraiser</a>
                <a href="#how" className="l4-btn-ghost" style={s("text-decoration: none; color: #F2F3F0; font-weight: 600; font-size: 16px; padding: 17px 34px; border-radius: 999px; white-space: nowrap; border: 1px solid rgba(244,243,239,.22); transition: border-color .25s ease, background .25s ease;")}>See how it works</a>
              </div>
              <div style={s("display: flex; flex-wrap: wrap; gap: 28px; border-top: 1px solid rgba(244,243,239,.1); padding-top: 24px;")}>
                <div><p style={s("margin: 0; font-variation-settings: 'wdth' 116; font-weight: 740; font-size: 24px; color: #F8F8F5;")}>35</p><p style={s("margin: 3px 0 0; font-family: 'Geist Mono', monospace; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: rgba(242,243,240,.5);")}>Live games</p></div>
                <div><p style={s("margin: 0; font-variation-settings: 'wdth' 116; font-weight: 740; font-size: 24px; color: #F8F8F5;")}>40k+</p><p style={s("margin: 3px 0 0; font-family: 'Geist Mono', monospace; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: rgba(242,243,240,.5);")}>Daily plays</p></div>
                <div><p style={s("margin: 0; font-variation-settings: 'wdth' 116; font-weight: 740; font-size: 24px; color: #F8F8F5;")}>$650k+</p><p style={s("margin: 3px 0 0; font-family: 'Geist Mono', monospace; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: rgba(242,243,240,.5);")}>Monthly prizes</p></div>
              </div>
            </div>
            <div style={s("min-width: 0; min-height: clamp(560px, 70vw, 600px); display: flex; align-items: center; justify-content: center; position: relative;")}>
              <div style={s("position: absolute; inset: 8%; background: radial-gradient(closest-side, rgba(63,227,142,.16), transparent 70%);")}></div>
              {this.buildDemoGame(el)}
            </div>
          </div>
        </header>

        {/* TICKER */}
        <div data-screen-label="Ticker" style={s("border-top: 1px solid rgba(244,243,239,.08); border-bottom: 1px solid rgba(244,243,239,.08); padding: 18px 0; overflow: hidden; background: rgba(63,227,142,.03);")}>
          <div style={s("display: flex; width: max-content; animation: l4marquee 30s linear infinite;")}>
            {[0, 1].map((k) => (
              <div key={k} style={s("display: flex; gap: 48px; padding-right: 48px; font-family: 'Geist Mono', monospace; font-size: 12.5px; letter-spacing: .2em; color: rgba(242,243,240,.6); white-space: nowrap;")}>
                <span>PLAY FOR A CAUSE</span><span style={s("color: #3FE38E;")}>&#10022;</span><span>WIN REAL PRIZES</span><span style={s("color: #3FE38E;")}>&#10022;</span><span>LIVE LEADERBOARDS</span><span style={s("color: #3FE38E;")}>&#10022;</span><span>BUILT-IN COMPLIANCE</span><span style={s("color: #3FE38E;")}>&#10022;</span><span>LAUNCH IN WEEKS</span><span style={s("color: #3FE38E;")}>&#10022;</span>
              </div>
            ))}
          </div>
        </div>

        {/* HERO IMAGE BAND */}
        <section data-screen-label="Hero image band" style={s("padding: 48px 5vw 0; background: #0A0C0B;")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <img src="/photos/img-hero-band.webp" alt="A family playing a Level4 skill-based trivia game together at home" style={s("display: block; width: 100%; height: clamp(280px, 38vw, 480px); object-fit: cover; border-radius: 28px;")} />
          </div>
        </section>

        {/* THE IDEA */}
        <section data-screen-label="The idea" style={s("background: #0A0C0B; color: #F2F3F0; padding: clamp(52px, 8vw, 72px) 5vw clamp(40px, 6vw, 60px);")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <div data-reveal="" style={s("margin-bottom: clamp(36px, 6vw, 72px);")}>
              <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #3FE38E;")}>01 / The idea</p>
              <h2 style={s("margin: 0; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em; color: #F8F8F5; text-wrap: balance;")}>It&rsquo;s this simple.</h2>
            </div>
            <div style={s("display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 20px;")}>
              {[
                { img: "img-beat-play", alt: "Someone playing a Level4 trivia question on their phone", rev: "BEAT 01", h: "They play", p: "Your supporters enter a trivia tournament built around your brand: your logo, your colors, your questions." },
                { img: "img-beat-win", alt: "A fan celebrating a prize won in a Level4 tournament", rev: "BEAT 02", h: "They compete", p: "Live leaderboards and real prizes like signed gear, VIP seats, and experiences keep them coming back for more entries." },
                { img: "img-beat-fund", alt: "A community supported by a Level4 fundraiser", rev: "BEAT 03", h: "You raise money", p: "Every paid entry is revenue for your cause. No begging, no bake sale. A game people actually want to share." },
              ].map((b, i) => (
                <div key={i} data-reveal="" className="l4-card" style={s("background: rgba(244,243,239,.03); border: 1px solid rgba(244,243,239,.09); border-radius: 26px; padding: 18px 18px 34px; transition: border-color .3s ease, transform .3s ease;")}>
                  <img src={"/photos/" + b.img + ".webp"} alt={b.alt} style={s("display: block; width: 100%; height: 200px; object-fit: cover; border-radius: 16px; margin-bottom: 22px;")} />
                  <p style={s("margin: 0 16px 10px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .2em; color: #3FE38E;")}>{b.rev}</p>
                  <h3 style={s("margin: 0 16px 10px; font-variation-settings: 'wdth' 116; font-weight: 760; font-size: clamp(34px, 3vw, 46px); letter-spacing: -.02em; color: #F8F8F5;")}>{b.h}</h3>
                  <p style={s("margin: 0 16px; font-size: 16.5px; line-height: 1.6; color: rgba(242,243,240,.62);")}>{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" data-screen-label="How it works" style={s("background: #0A0C0B; color: #F2F3F0; padding: clamp(60px, 9vw, 130px) 5vw; scroll-margin-top: 80px;")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <div data-reveal="" style={s("display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: clamp(36px, 6vw, 64px);")}>
              <div>
                <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #3FE38E;")}>02 / The process</p>
                <h2 style={s("margin: 0; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em; color: #F8F8F5;")}>Live in five steps</h2>
              </div>
              <p style={s("margin: 0; max-width: 380px; font-size: 16.5px; line-height: 1.6; color: rgba(242,243,240,.55);")}>Click through. Level4 does the heavy lifting. You bring the cause and the crowd.</p>
            </div>
            <div data-reveal="" style={s("min-height: 420px;")}>{this.buildStepper(el)}</div>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section id="who" data-screen-label="Who it's for" style={s("background: #F4F3EF; color: #141A16; padding: clamp(60px, 9vw, 130px) 5vw; scroll-margin-top: 80px; border-radius: 48px 48px 0 0;")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <div data-reveal="" style={s("margin-bottom: clamp(32px, 5vw, 56px);")}>
              <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #117A4A;")}>03 / Who it&rsquo;s for</p>
              <h2 style={s("margin: 0 0 18px; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em;")}>Built for your crowd</h2>
              <p style={s("margin: 0; max-width: 540px; font-size: 17.5px; line-height: 1.6; color: #59605B;")}>One platform, shaped around whoever you need to activate.</p>
            </div>
            <div data-reveal="" style={s("min-height: 480px;")}>{this.buildTabs(el)}</div>
          </div>
        </section>

        {/* THE MATH */}
        <section id="math" data-screen-label="The math" style={s("background: #F4F3EF; color: #141A16; padding: 40px 5vw clamp(60px, 9vw, 130px); scroll-margin-top: 80px;")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <div data-reveal="" style={s("border-top: 1px solid rgba(20,26,22,.12); padding-top: clamp(44px, 7vw, 64px); margin-bottom: clamp(32px, 5vw, 56px); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 24px;")}>
              <div>
                <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #117A4A;")}>04 / The math</p>
                <h2 style={s("margin: 0; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em;")}>See what you&rsquo;d raise</h2>
              </div>
              <p style={s("margin: 0; max-width: 400px; font-size: 16.5px; line-height: 1.6; color: #59605B;")}>Drag the sliders. Entry revenue supports your organization, minus the 20% Level4 service fee.</p>
            </div>
            <div data-reveal="" style={s("min-height: 380px;")}>{this.buildCalculator(el)}</div>
            <p data-reveal="" style={s("margin: 28px 4px 0; font-size: 12.5px; line-height: 1.6; color: rgba(20,26,22,.45);")}>Illustration only. Final campaign structure, eligibility, rules, prize terms, and availability may vary by region and campaign type.</p>
          </div>
        </section>

        {/* WHAT LEVEL4 HANDLES */}
        <section data-screen-label="What Level4 handles" style={s("background: #F4F3EF; color: #141A16; padding: 0 5vw clamp(60px, 9vw, 130px);")}>
          <div style={s("max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr)); gap: clamp(28px, 5vw, 56px); align-items: start; border-top: 1px solid rgba(20,26,22,.12); padding-top: clamp(44px, 7vw, 64px);")}>
            <div data-reveal="">
              <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #117A4A;")}>05 / The platform</p>
              <h2 style={s("margin: 0 0 22px; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(36px, 3.8vw, 60px); line-height: 1.02; letter-spacing: -0.022em;")}>You focus on the cause. We run everything else.</h2>
              <p style={s("margin: 0; font-size: 17px; line-height: 1.65; color: #59605B; max-width: 480px;")}>Level4 is the operating platform behind the campaign: design, development, hosting, payments, support, and compliance, from setup through launch.</p>
            </div>
            <div data-reveal="" style={s("display: flex; flex-wrap: wrap; gap: 10px; align-content: start;")}>
              {["Branded game site", "Tournament setup", "Skill-based games", "Custom questions", "Prize structure", "Entry payments", "Leaderboards", "Promo links + QR codes", "Hosting + security", "Player support"].map((c) => (
                <span key={c} style={s("background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 12px 22px; font-size: 15px; font-weight: 600; white-space: nowrap;")}>{c}</span>
              ))}
              <span style={s("background: #141A16; color: #F4F3EF; border-radius: 999px; padding: 12px 22px; font-size: 15px; font-weight: 600; white-space: nowrap;")}>KYC &middot; AML &middot; Geofencing</span>
              <span style={s("background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 12px 22px; font-size: 15px; font-weight: 600; white-space: nowrap;")}>Launch collaboration</span>
            </div>
          </div>
        </section>

        {/* PRIZES */}
        <section data-screen-label="Prizes" style={s("background: #F4F3EF; color: #141A16; padding: 0 0 clamp(60px, 9vw, 130px); overflow: hidden;")}>
          <div style={s("max-width: 1440px; margin: 0 auto; padding: clamp(48px, 7vw, 64px) 5vw clamp(32px, 5vw, 56px); border-top: 1px solid rgba(20,26,22,.12);")}>
            <div data-reveal="" style={s("display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 24px;")}>
              <div>
                <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #117A4A;")}>06 / Prizes</p>
                <h2 style={s("margin: 0; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em;")}>Prizes make it real</h2>
              </div>
              <p style={s("margin: 0; max-width: 420px; font-size: 16.5px; line-height: 1.6; color: #59605B;")}>You provide the prize pool. We build the campaign around it. One grand prize or multiple tiers.</p>
            </div>
          </div>
          <div data-reveal="" style={s("display: flex; width: max-content; animation: l4marquee 40s linear infinite; margin-bottom: 48px;")}>
            {[0, 1].map((k) => (
              <div key={k} style={s("display: flex; gap: 14px; padding-right: 14px;")}>
                <span style={s("white-space: nowrap; background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Signed merchandise</span>
                <span style={s("white-space: nowrap; background: #141A16; color: #F4F3EF; border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>VIP experiences</span>
                <span style={s("white-space: nowrap; background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Event tickets</span>
                <span style={s("white-space: nowrap; background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Meet and greets</span>
                <span style={s("white-space: nowrap; background: #117A4A; color: #F4F3EF; border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Sports memorabilia</span>
                <span style={s("white-space: nowrap; background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Travel packages</span>
                <span style={s("white-space: nowrap; background: #FFFFFF; border: 1px solid rgba(20,26,22,.1); border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Local business prizes</span>
                <span style={s("white-space: nowrap; background: #141A16; color: #F4F3EF; border-radius: 999px; padding: 15px 28px; font-size: 16px; font-weight: 600;")}>Exclusive access</span>
              </div>
            ))}
          </div>
          <div style={s("max-width: 1440px; margin: 0 auto; padding: 0 5vw;")}>
            <div data-reveal="" style={s("display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 16px;")}>
              <img src="/photos/img-prize-1.webp" alt="Grand prize for a Level4 fundraising tournament" style={s("display: block; width: 100%; height: 280px; object-fit: cover; border-radius: 20px;")} />
              <img src="/photos/img-prize-2.webp" alt="A VIP experience prize from a Level4 campaign" style={s("display: block; width: 100%; height: 280px; object-fit: cover; border-radius: 20px;")} />
              <img src="/photos/img-prize-3.webp" alt="Winners celebrating at a Level4 fundraiser" style={s("display: block; width: 100%; height: 280px; object-fit: cover; border-radius: 20px;")} />
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section data-screen-label="Proof" style={s("background: #0A0C0B; color: #F2F3F0; padding: clamp(72px, 11vw, 140px) 5vw; border-radius: 48px 48px 0 0; margin-top: -48px; background-image: radial-gradient(900px 540px at 18% 115%, rgba(63,227,142,.09), transparent 65%);")}>
          <div style={s("max-width: 1440px; margin: 0 auto;")}>
            <div data-reveal="" style={s("max-width: 740px; margin-bottom: clamp(40px, 7vw, 80px);")}>
              <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #3FE38E;")}>07 / Proof</p>
              <h2 style={s("margin: 0 0 22px; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.6vw, 76px); line-height: 1; letter-spacing: -0.025em; color: #F8F8F5;")}>Powered by a real gaming platform</h2>
              <p style={s("margin: 0; font-size: 18px; line-height: 1.65; color: rgba(242,243,240,.6); text-wrap: pretty;")}>This isn&rsquo;t a trivia plugin. Level4 runs a live skill-based gaming operation: branded launches, payments, support, and compliance, every day.</p>
            </div>
            <div style={s("display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 0; margin-bottom: clamp(40px, 6vw, 72px);")}>
              <div data-reveal="" style={s("border-top: 2px solid #3FE38E; padding: 30px 32px 0 0;")}>
                <p style={s("margin: 0; font-variation-settings: 'wdth' 118; font-weight: 790; font-size: clamp(60px, 6vw, 104px); line-height: 1; letter-spacing: -.03em; color: #F8F8F5;")}><span data-countup="" data-target="35">35</span></p>
                <p style={s("margin: 14px 0 0; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: rgba(242,243,240,.55);")}>Live games</p>
              </div>
              <div data-reveal="" style={s("border-top: 2px solid rgba(244,243,239,.14); padding: 30px 32px 0 0;")}>
                <p style={s("margin: 0; font-variation-settings: 'wdth' 118; font-weight: 790; font-size: clamp(60px, 6vw, 104px); line-height: 1; letter-spacing: -.03em; color: #F8F8F5;")}><span data-countup="" data-target="5">5</span></p>
                <p style={s("margin: 14px 0 0; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: rgba(242,243,240,.55);")}>In development</p>
              </div>
              <div data-reveal="" style={s("border-top: 2px solid rgba(244,243,239,.14); padding: 30px 32px 0 0;")}>
                <p style={s("margin: 0; font-variation-settings: 'wdth' 118; font-weight: 790; font-size: clamp(60px, 6vw, 104px); line-height: 1; letter-spacing: -.03em; color: #F8F8F5;")}><span data-countup="" data-target="40">40</span>k<span style={s("color: #3FE38E;")}>+</span></p>
                <p style={s("margin: 14px 0 0; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: rgba(242,243,240,.55);")}>Games played daily</p>
              </div>
              <div data-reveal="" style={s("border-top: 2px solid rgba(244,243,239,.14); padding: 30px 0 0 0;")}>
                <p style={s("margin: 0; font-variation-settings: 'wdth' 118; font-weight: 790; font-size: clamp(60px, 6vw, 104px); line-height: 1; letter-spacing: -.03em; color: #F8F8F5;")}>$<span data-countup="" data-target="650">650</span>k<span style={s("color: #3FE38E;")}>+</span></p>
                <p style={s("margin: 14px 0 0; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: rgba(242,243,240,.55);")}>Monthly prize money</p>
              </div>
            </div>
            <div data-reveal="" style={s("display: flex; flex-wrap: wrap; gap: 10px;")}>
              {["SECURE PLATFORM", "KYC · AML · GEOFENCING", "PLAYER SUPPORT", "HOSTING + OPERATIONS"].map((c) => (
                <span key={c} style={s("font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .14em; color: rgba(242,243,240,.65); border: 1px solid rgba(244,243,239,.14); border-radius: 999px; padding: 10px 20px; white-space: nowrap;")}>{c}</span>
              ))}
              <span style={s("font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .14em; color: #3FE38E; border: 1px solid rgba(63,227,142,.4); border-radius: 999px; padding: 10px 20px; white-space: nowrap;")}>SETUP &rarr; LAUNCH &rarr; SUPPORT</span>
            </div>
          </div>
        </section>

        {/* STATEMENT */}
        <section data-screen-label="Statement" style={s("background: #0A0C0B; color: #F2F3F0; padding: clamp(72px, 11vw, 150px) 5vw; text-align: center; background-image: radial-gradient(800px 480px at 50% 50%, rgba(63,227,142,.08), transparent 70%);")}>
          <div style={s("max-width: 1080px; margin: 0 auto;")}>
            <h2 data-reveal="" style={s("margin: 0 0 36px; font-variation-settings: 'wdth' 114; font-weight: 770; font-size: clamp(40px, 5.2vw, 84px); line-height: 1.04; letter-spacing: -0.028em; text-wrap: balance; color: #F8F8F5;")}>A donation page waits.<br /><span style={s("color: #3FE38E;")}>A Level4 campaign gives people a reason to join.</span></h2>
            <p data-reveal="" style={s("margin: 0 auto; max-width: 640px; font-size: 19px; line-height: 1.7; color: rgba(242,243,240,.6); text-wrap: pretty;")}>Urgency, competition, prizes, repeat play, and a story your audience shares. That&rsquo;s why it works for schools, foundations, sports groups, clubs, companies, and communities.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" data-screen-label="FAQ" style={s("background: #F4F3EF; color: #141A16; padding: clamp(60px, 9vw, 130px) 5vw; scroll-margin-top: 80px; border-radius: 48px 48px 0 0;")}>
          <div style={s("max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr)); gap: clamp(28px, 5vw, 64px); align-items: start;")}>
            <div data-reveal="" style={s("position: sticky; top: 110px;")}>
              <p style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #117A4A;")}>08 / Questions</p>
              <h2 style={s("margin: 0 0 22px; font-variation-settings: 'wdth' 114; font-weight: 760; font-size: clamp(40px, 4.2vw, 68px); line-height: 1.02; letter-spacing: -0.02em;")}>Answers, before you ask</h2>
              <p style={s("margin: 0; font-size: 17px; line-height: 1.6; color: #59605B; max-width: 420px;")}>Everything executive directors, athletic directors, and campaign leads usually want to know first.</p>
            </div>
            <div data-reveal="" style={s("display: flex; flex-direction: column;")}>
              {faqs.map((f, i) => (
                <div key={i} style={s("border-bottom: 1px solid rgba(20,26,22,.12);")}>
                  <button onClick={f.toggle} style={{ ...s("box-sizing: border-box; cursor: pointer; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 24px 4px; font-family: 'Archivo', sans-serif; background: none; border: none; text-align: left;") }}>
                    <span style={{ ...s("font-size: 18.5px; font-weight: 650; line-height: 1.35;"), color: f.qColor }}>{f.q}</span>
                    <span style={s("font-family: 'Geist Mono', monospace; font-size: 20px; color: #117A4A; flex-shrink: 0;")}>{f.icon}</span>
                  </button>
                  {f.body}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + FOOTER */}
        <section id="cta" data-screen-label="Final CTA" style={s("background: #0A0C0B; color: #F2F3F0; padding: clamp(72px, 11vw, 160px) 5vw clamp(56px, 8vw, 90px); scroll-margin-top: 80px; background-image: radial-gradient(1100px 700px at 50% -20%, rgba(63,227,142,.14), transparent 65%), radial-gradient(rgba(244,243,239,.05) 1px, transparent 1.5px); background-size: auto, 36px 36px;")}>
          <div style={s("max-width: 1080px; margin: 0 auto clamp(32px, 5vw, 52px); text-align: center;")}>
            <p data-reveal="" style={s("margin: 0 0 20px; font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: #3FE38E;")}>Ready when you are</p>
            <h2 data-reveal="" style={s("margin: 0; font-variation-settings: 'wdth' 114; font-weight: 770; font-size: clamp(44px, 5.4vw, 88px); line-height: 1; letter-spacing: -0.028em; text-wrap: balance; color: #F8F8F5;")}>Run a contest for <em style={s("font-style: normal; color: #3FE38E;")}>your community.</em></h2>
          </div>
          <div data-reveal="" style={s("max-width: 1240px; margin: 0 auto; background: linear-gradient(160deg, rgba(63,227,142,.2), rgba(63,227,142,.05) 45%, rgba(244,243,239,.06)); border: 1px solid rgba(63,227,142,.45); border-radius: 40px; padding: clamp(16px, 2.6vw, 38px); box-shadow: 0 50px 120px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.12);")}>
            <div style={s("display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr)); gap: 22px; align-items: start;")}>
              <div data-reveal="" style={s("min-height: 0;")}>{this.buildLeadForm(el)}</div>
              <div data-reveal="" style={s("display: flex; flex-direction: column; gap: 14px;")}>
                <div style={s("background: rgba(10,12,11,.6); border: 1px solid rgba(63,227,142,.3); border-radius: 22px; padding: 28px 30px; text-align: left;")}>
                  <p style={s("margin: 0 0 10px; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: .22em; color: #3FE38E;")}>WHAT HAPPENS NEXT</p>
                  <p style={s("margin: 0; font-size: 16px; line-height: 1.65; color: rgba(242,243,240,.78);")}>Tell us who you are and who you want to activate. The Level4 team will reach out to shape the right campaign, game experience, and prize structure with you, from setup through launch.</p>
                </div>
                <a href={"mailto:" + emailJohn} className="l4-contact" style={s("text-decoration: none; color: #F2F3F0; background: rgba(10,12,11,.6); border: 1px solid rgba(244,243,239,.14); border-radius: 18px; padding: 24px 28px; text-align: left; transition: border-color .3s ease;")}>
                  <p style={s("margin: 0 0 4px; font-size: 16.5px; font-weight: 650;")}>John Sutyak</p>
                  <p style={s("margin: 0; font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #3FE38E;")}>{emailJohn}</p>
                </a>
                <a href={"mailto:" + emailBradley} className="l4-contact" style={s("text-decoration: none; color: #F2F3F0; background: rgba(10,12,11,.6); border: 1px solid rgba(244,243,239,.14); border-radius: 18px; padding: 24px 28px; text-align: left; transition: border-color .3s ease;")}>
                  <p style={s("margin: 0 0 4px; font-size: 16.5px; font-weight: 650;")}>Bradley Eisenstein</p>
                  <p style={s("margin: 0; font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #3FE38E;")}>{emailBradley}</p>
                </a>
              </div>
            </div>
          </div>
          <footer style={s("max-width: 1440px; margin: 100px auto 0; border-top: 1px solid rgba(244,243,239,.1); padding-top: 36px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;")}>
            <div style={s("display: flex; flex-direction: column; gap: 1px; line-height: 1;")}>
              <span style={s("font-variation-settings: 'wdth' 120; font-weight: 800; font-size: 19px; letter-spacing: .04em; color: #F2F3F0;")}>LEVEL<span style={s("color: #3FE38E;")}>4</span></span>
              <span style={s("font-family: 'Geist Mono', monospace; font-size: 8px; letter-spacing: .42em; color: rgba(242,243,240,.5);")}>ENTERTAINMENT</span>
            </div>
            <p style={s("margin: 0; font-family: 'Geist Mono', monospace; font-size: 11.5px; color: rgba(242,243,240,.45);")}>&copy; 2026 Level4 Entertainment. Campaign availability, rules, and structures may vary by region.</p>
          </footer>
        </section>

      </div>
    );
  }
}
