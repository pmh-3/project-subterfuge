import { useState } from "react";

const C = {
  bg:          "#F6F2E8",
  cardTint:    "#EEEADC",
  ink:         "#1C1408",
  inkMid:      "#5A4E30",
  inkFade:     "#9A8E70",
  olive:       "#2A3A18",
  oliveLight:  "#3A4F24",
  oliveDim:    "rgba(42,58,24,0.08)",
  maroon:      "#6E1C1C",
  maroonHov:   "#8A2424",
  border:      "rgba(28,20,8,0.14)",
  borderStr:   "rgba(28,20,8,0.26)",
  white:       "#FDFBF6",
};

const F = {
  tw:    "'Special Elite','Courier New',monospace",
  serif: "'Cormorant Garamond',Georgia,serif",
  ui:    "'Outfit',system-ui,sans-serif",
  mono:  "'JetBrains Mono',monospace",
};

const Label = ({ children, style = {} }) => (
  <div style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: C.inkFade, ...style }}>
    {children}
  </div>
);

const Rule = ({ style = {} }) => (
  <div style={{ height: 1, background: C.border, ...style }} />
);

const BtnPrimary = ({ children, full, small, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: F.ui, fontSize: small ? 11 : 12, fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", padding: small ? "9px 16px" : "13px 20px", borderRadius: 2,
        background: hov ? C.inkMid : C.ink, color: C.bg, border: "none", cursor: "pointer",
        width: full ? "100%" : "auto", transition: "background 0.15s" }}>
      {children}
    </button>
  );
};

const BtnGhost = ({ children, full, small, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: F.ui, fontSize: small ? 11 : 12, fontWeight: 500, letterSpacing: "0.08em",
        textTransform: "uppercase", padding: small ? "8px 16px" : "12px 20px", borderRadius: 2,
        background: hov ? C.cardTint : "transparent", color: C.ink,
        border: `1px solid ${hov ? C.borderStr : C.border}`, cursor: "pointer",
        width: full ? "100%" : "auto", transition: "all 0.15s" }}>
      {children}
    </button>
  );
};

const NavBar = ({ active }) => {
  const tabs = ["Contract", "Situation", "Admin", "Briefing"];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, marginTop: "auto" }}>
      {tabs.map(t => (
        <div key={t} style={{ flex: 1, padding: "11px 2px", textAlign: "center",
          borderBottom: `2px solid ${active === t ? C.olive : "transparent"}` }}>
          <span style={{ fontFamily: F.tw, fontSize: 7, letterSpacing: "0.12em",
            textTransform: "uppercase", color: active === t ? C.olive : C.inkFade }}>
            {t}
          </span>
        </div>
      ))}
    </div>
  );
};

// ---- SCREENS ----

const HomeScreen = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 20px 28px" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 36 }}>
      <div style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
        color: C.inkFade, marginBottom: 10 }}>Protocol</div>
      <div style={{ fontFamily: F.serif, fontSize: 46, fontWeight: 600, color: C.ink, lineHeight: 0.95,
        letterSpacing: "-0.01em" }}>
        Midnight<br />Wire
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <BtnPrimary full>Join Operation</BtnPrimary>
      <BtnGhost full>Start Operation</BtnGhost>
    </div>
  </div>
);

const AgentSetupScreen = () => {
  const [chosen, setChosen] = useState(0);
  const icons = ["🍸","🔭","📻","🗝","🚬"];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 20px 28px", gap: 20 }}>
      <Label style={{ color: C.inkFade }}>Step 1 of 2</Label>
      <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 500, color: C.ink, lineHeight: 1.2 }}>
        Choose<br />your cover.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {icons.map((ic, i) => (
          <div key={i} onClick={() => setChosen(i)} style={{
            width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 17, cursor: "pointer",
            background: chosen === i ? C.cardTint : "transparent",
            border: `1px solid ${chosen === i ? C.borderStr : C.border}`,
          }}>{ic}</div>
        ))}
      </div>
      <div>
        <Label style={{ marginBottom: 8 }}>Callsign</Label>
        <input placeholder="dum dum" style={{
          background: "transparent", border: "none", borderBottom: `1px solid ${C.borderStr}`,
          outline: "none", width: "100%", fontFamily: F.ui, fontSize: 18, fontWeight: 300,
          color: C.ink, paddingBottom: 8, letterSpacing: "0.02em",
        }} />
      </div>
      <div style={{ marginTop: "auto" }}>
        <BtnPrimary full>Proceed →</BtnPrimary>
        <div style={{ textAlign: "center", marginTop: 14, fontFamily: F.tw, fontSize: 8,
          letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFade, cursor: "pointer" }}>
          ← Back
        </div>
      </div>
    </div>
  );
};

const IdentityVerifiedScreen = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 20px 28px",
    alignItems: "center", justifyContent: "center", gap: 0 }}>
    <Label style={{ color: "#3A6A2A", letterSpacing: "0.2em", marginBottom: 28 }}>Identity Confirmed</Label>
    <div style={{ fontFamily: F.mono, fontSize: 64, fontWeight: 400, color: C.ink,
      letterSpacing: "0.12em", lineHeight: 1, marginBottom: 12 }}>968</div>
    <div style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
      color: C.inkFade, marginBottom: 32 }}>Agent Key</div>
    <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkMid, textAlign: "center",
      lineHeight: 1.7, marginBottom: 40, maxWidth: 200 }}>
      Your recovery key. You'll need it if you get disconnected.
    </div>
    <BtnPrimary full>Proceed to Operation →</BtnPrimary>
  </div>
);

const MissionControlScreen = () => {
  const [theme, setTheme] = useState(0);
  const [mode, setMode] = useState("elim");
  const [diff, setDiff] = useState("mixed");
  const [rolls, setRolls] = useState(5);
  const themes = [["Basic Training","99 tasks"],["Far Away Friends","99 tasks"],["Ice Breaker","108 tasks"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "18px 18px 20px",
      gap: 0, overflowY: "auto" }}>
      <div style={{ marginBottom: 14 }}>
        <Label style={{ marginBottom: 6 }}>Op Code GGUC</Label>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: C.ink }}>Mission Control</div>
      </div>
      <Rule style={{ marginBottom: 16 }} />

      <Label style={{ marginBottom: 8 }}>Theme</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {themes.map(([name, tasks], i) => (
          <div key={i} onClick={() => setTheme(i)} style={{ flex: 1, padding: "10px 6px",
            background: theme === i ? C.cardTint : "transparent",
            border: `1px solid ${theme === i ? C.borderStr : C.border}`,
            borderRadius: 2, cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 500,
              color: theme === i ? C.ink : C.inkMid, marginBottom: 3 }}>{name}</div>
            <div style={{ fontFamily: F.tw, fontSize: 7, color: C.inkFade, letterSpacing: "0.1em" }}>{tasks}</div>
          </div>
        ))}
      </div>

      <Label style={{ marginBottom: 8 }}>Mode</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["elim","Elimination","Last agent wins"],["inf","Infinite ∞","Score attack"]].map(([val, label, sub]) => (
          <div key={val} onClick={() => setMode(val)} style={{ flex: 1, padding: "10px 10px",
            background: mode === val ? C.cardTint : "transparent",
            border: `1px solid ${mode === val ? C.borderStr : C.border}`,
            borderRadius: 2, cursor: "pointer" }}>
            <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600,
              color: mode === val ? C.ink : C.inkMid, marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: F.tw, fontSize: 7, color: C.inkFade, letterSpacing: "0.08em" }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Label style={{ marginBottom: 8 }}>Difficulty</Label>
          <div style={{ display: "flex", gap: 4 }}>
            {["Mixed","Easy","Med","Hard"].map(d => (
              <button key={d} onClick={() => setDiff(d.toLowerCase())} style={{ flex: 1, padding: "7px 2px",
                background: diff === d.toLowerCase() ? C.ink : "transparent",
                color: diff === d.toLowerCase() ? C.bg : C.inkFade,
                border: `1px solid ${diff === d.toLowerCase() ? C.ink : C.border}`,
                borderRadius: 2, fontFamily: F.ui, fontSize: 9, fontWeight: 500,
                letterSpacing: "0.06em", cursor: "pointer", textTransform: "uppercase" }}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <Label style={{ marginBottom: 8 }}>Rerolls</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1,3,5,10].map(r => (
          <button key={r} onClick={() => setRolls(r)} style={{ flex: 1, padding: "8px 4px",
            background: rolls === r ? C.ink : "transparent",
            color: rolls === r ? C.bg : C.inkFade,
            border: `1px solid ${rolls === r ? C.ink : C.border}`,
            borderRadius: 2, fontFamily: F.mono, fontSize: 13, fontWeight: 400, cursor: "pointer" }}>{r}</button>
        ))}
      </div>

      <BtnPrimary full>Launch Operation</BtnPrimary>
    </div>
  );
};

const SituationRoomScreen = () => {
  const agents = [
    { name: "dum dum", key: "968", score: 2, you: true, host: true },
    { name: "shadow fox", key: "441", score: 5 },
    { name: "cipher", key: "772", score: 0 },
    { name: "static", key: "203", score: 3 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <Label style={{ marginBottom: 6 }}>Op Code GGUC</Label>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: C.ink, marginBottom: 14 }}>
          Situation Room
        </div>
        <Rule style={{ marginBottom: 14 }} />
        <Label style={{ marginBottom: 10 }}>Active Agents ({agents.length})</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {agents.map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: a.you ? C.cardTint : "transparent",
              border: `1px solid ${a.you ? C.borderStr : C.border}`,
              borderLeft: `3px solid ${a.you ? C.olive : "transparent"}`, borderRadius: "0 2px 2px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: F.serif, fontSize: 14, fontWeight: 600, color: C.inkMid }}>
                {a.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.ink }}>
                  {a.name}
                  {a.host && <span style={{ fontFamily: F.tw, fontSize: 7, color: C.inkFade,
                    letterSpacing: "0.12em", marginLeft: 8 }}>HOST</span>}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.inkFade }}>KEY {a.key}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: F.mono, fontSize: 18, color: C.ink }}>{a.score}</div>
                <div style={{ fontFamily: F.tw, fontSize: 7, color: C.inkFade, letterSpacing: "0.1em",
                  textTransform: "uppercase" }}>conf.</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BtnPrimary full>Begin Operation</BtnPrimary>
          <BtnGhost full>Invite Agents</BtnGhost>
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <NavBar active="Situation" />
      </div>
    </div>
  );
};

const AdminScreen = () => {
  const [elim, setElim] = useState(null);
  const agents = [
    { name: "dum dum", key: "968" },
    { name: "shadow fox", key: "441" },
    { name: "cipher", key: "772" },
    { name: "static", key: "203" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 18px 0", flex: 1 }}>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: C.ink, marginBottom: 6 }}>
          Host Override
        </div>
        <Label style={{ marginBottom: 14 }}>Administrative Control</Label>
        <Rule style={{ marginBottom: 14 }} />
        <Label style={{ marginBottom: 10 }}>Active Agents ({agents.length})</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {agents.map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              border: `1px solid ${C.border}`, borderRadius: 2 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.ink }}>{a.name}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.inkFade }}>KEY {a.key}</div>
              </div>
              <button onClick={() => setElim(a.name)}
                style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: elim === a.name ? C.white : C.maroon,
                  background: elim === a.name ? C.maroon : "transparent",
                  border: `1px solid ${C.maroon}`, padding: "5px 10px", borderRadius: 2, cursor: "pointer" }}>
                {elim === a.name ? "Confirmed" : "Eliminate"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 18px" }}>
        <div style={{ padding: "14px 0" }}>
          <div style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.14em",
            textTransform: "uppercase", color: C.inkFade, cursor: "pointer" }}>← Exit Operation</div>
        </div>
      </div>
      <NavBar active="Admin" />
    </div>
  );
};

const BriefingScreen = () => {
  const rules = [
    "You get a target and a mission.",
    "Get your target to complete the mission without them knowing.",
    "Confirm the elimination.",
    "Inherit their contract.",
    "Last agent standing wins.",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 18px 0", flex: 1 }}>
        <Label style={{ marginBottom: 6 }}>Classified</Label>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, color: C.ink, marginBottom: 4 }}>
          Mission Briefing
        </div>
        <Label style={{ marginBottom: 16 }}>Protocol: Midnight Wire</Label>
        <Rule style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rules.map((rule, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.olive, fontWeight: 500,
                minWidth: 16, paddingTop: 1 }}>{i + 1}.</div>
              <div style={{ fontFamily: F.ui, fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{rule}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 18px 0" }}>
        <BtnGhost full>Acknowledge</BtnGhost>
      </div>
      <NavBar active="Briefing" />
    </div>
  );
};

const ContractScreen = () => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const startHold = () => {
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setDone(true); setTimeout(() => { setDone(false); setProgress(0); }, 2500); return 100; }
        return p + 5;
      });
    }, 50);
    setIntervalId(id);
  };

  const endHold = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    if (!done) setProgress(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 18px 0" }}>
        {/* Identity header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          paddingBottom: 12, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div>
            <Label style={{ marginBottom: 4 }}>Identity</Label>
            <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 500, color: C.ink }}>dum dum</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label style={{ marginBottom: 4 }}>Op Code</Label>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.olive, letterSpacing: "0.18em" }}>GGUC</div>
          </div>
        </div>

        {/* Folder tab + card */}
        <div style={{ position: "relative", marginTop: 20 }}>
          <div style={{ position: "absolute", top: -18, left: 0, background: C.cardTint,
            border: `1px solid ${C.border}`, borderBottom: "none", padding: "4px 14px",
            borderRadius: "3px 3px 0 0" }}>
            <Label style={{ fontSize: 7 }}>Active Contract</Label>
          </div>
          <div style={{ background: C.cardTint, border: `1px solid ${C.borderStr}`,
            borderRadius: "0 3px 3px 3px", padding: "18px 16px 16px" }}>

            {/* Target */}
            <div style={{ marginBottom: 14 }}>
              <Label style={{ marginBottom: 6 }}>Target</Label>
              <div style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 600, color: C.ink,
                lineHeight: 1, letterSpacing: "0.01em" }}>my guy</div>
            </div>
            <Rule style={{ marginBottom: 14 }} />

            {/* Directive */}
            <div style={{ marginBottom: 14 }}>
              <Label style={{ marginBottom: 6 }}>Directive</Label>
              <div style={{ fontFamily: F.ui, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                Get the target to recommend a mobile app.
              </div>
            </div>
            <Rule style={{ marginBottom: 12 }} />

            {/* Meta */}
            <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
              {[["Difficulty","Medium"],["Players","4 active"],["Score","2 confirmed"]].map(([l, v], i, arr) => (
                <div key={l} style={{ flex: 1, paddingRight: i < arr.length - 1 ? 12 : 0,
                  borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                  paddingLeft: i > 0 ? 12 : 0 }}>
                  <Label style={{ marginBottom: 4 }}>{l}</Label>
                  <div style={{ fontFamily: F.tw, fontSize: 11, color: C.inkMid, letterSpacing: "0.04em" }}>{v}</div>
                </div>
              ))}
            </div>
            <Rule style={{ marginBottom: 12 }} />

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 12px", border: `1px dashed ${C.border}`, borderRadius: 2, cursor: "pointer" }}>
                <span style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.inkMid }}>Change Directive</span>
                <span style={{ fontFamily: F.mono, fontSize: 9, color: C.inkFade }}>5 left</span>
              </div>

              {done ? (
                <div style={{ padding: "13px", textAlign: "center", background: "rgba(40,90,30,0.1)",
                  border: `1px solid rgba(40,90,30,0.3)`, borderRadius: 2 }}>
                  <span style={{ fontFamily: F.tw, fontSize: 10, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "#2A5A1A" }}>✓ Target Neutralized</span>
                </div>
              ) : (
                <div>
                  <div onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                    onTouchStart={startHold} onTouchEnd={endHold}
                    style={{ position: "relative", overflow: "hidden", padding: "13px", textAlign: "center",
                      background: C.maroon, borderRadius: 2, cursor: "pointer", userSelect: "none" }}>
                    {progress > 0 && (
                      <div style={{ position: "absolute", inset: 0, background: C.maroonHov,
                        width: `${progress}%`, transition: "width 0.05s linear" }} />
                    )}
                    <span style={{ position: "relative", fontFamily: F.tw, fontSize: 10, zIndex: 1,
                      letterSpacing: "0.2em", textTransform: "uppercase", color: "#F4EEE0" }}>
                      {progress > 0 ? `Confirming ${progress}%` : "Neutralize Target"}
                    </span>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 5, fontFamily: F.tw, fontSize: 7,
                    letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFade }}>
                    Hold to confirm
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <NavBar active="Contract" />
      </div>
    </div>
  );
};

// ---- FRAME ----
const Phone = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
    <div style={{ width: 230, height: 480, background: C.bg, borderRadius: 30,
      border: "2px solid rgba(28,20,8,0.2)", overflow: "hidden",
      boxShadow: "0 20px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12)" }}>
      <div style={{ height: 26, background: C.cardTint, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
        <span style={{ fontFamily: F.mono, fontSize: 8, color: C.inkFade }}>10:35</span>
        <span style={{ fontFamily: F.mono, fontSize: 8, color: C.inkFade }}>▲▲ ⬡</span>
      </div>
      <div style={{ height: "calc(100% - 26px)", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
    <div style={{ fontFamily: F.tw, fontSize: 8, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "rgba(28,20,8,0.3)" }}>{label}</div>
  </div>
);

// ---- EXPORT ----
export default function AllScreens() {
  const screens = [
    ["01  Home",          <HomeScreen />],
    ["02  Agent Setup",   <AgentSetupScreen />],
    ["03  Verified",      <IdentityVerifiedScreen />],
    ["04  Mission Ctrl",  <MissionControlScreen />],
    ["05  Situation",     <SituationRoomScreen />],
    ["06  Admin",         <AdminScreen />],
    ["07  Briefing",      <BriefingScreen />],
    ["08  Contract",      <ContractScreen />],
  ];

  return (
    <div style={{ background: "#2A2418", minHeight: "100vh", padding: "40px 40px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Special+Elite&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        input::placeholder { color: rgba(28,20,8,0.3); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: "0.28em",
          textTransform: "uppercase", color: "rgba(200,180,120,0.5)", marginBottom: 8 }}>
          Design Exploration
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 34,
          fontWeight: 600, color: "#E8E0C8", letterSpacing: "-0.01em", lineHeight: 1 }}>
          Midnight Wire
        </div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: "rgba(200,180,120,0.5)",
          marginTop: 6 }}>
          All screens — light field paper, ink, field olive. Hold Neutralize on screen 08.
        </div>
      </div>

      {/* Scrollable screen grid */}
      <div style={{ display: "flex", gap: 28, overflowX: "auto", paddingBottom: 20,
        alignItems: "flex-start" }}>
        {screens.map(([label, screen]) => (
          <Phone key={label} label={label}>{screen}</Phone>
        ))}
      </div>
    </div>
  );
}
