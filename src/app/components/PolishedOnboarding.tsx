import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, Sparkles } from "lucide-react";
import logoSvg from "../../imports/SVG_1__1_.svg";
import "./polished-onboarding.css";

const CATEGORIES = [
  "Technology", "Design", "Science", "Culture", "Business",
  "Health", "Politics", "Environment", "Sports", "Art",
];

export function PolishedOnboarding({
  onComplete,
}: {
  onComplete: (interests: string[], name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (category: string) => {
    setSelected(previous => {
      const next = new Set(previous);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const remaining = Math.max(0, 3 - selected.size);
  const finish = () => selected.size >= 3 && onComplete(Array.from(selected), name.trim());

  return (
    <main className={`onboarding-shell onboarding-step-${step + 1}`}>
      <header className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-logo"><img src={logoSvg} alt="" /></span>
          <span>Made Space</span>
        </div>
        <div className="onboarding-progress" aria-label={`Step ${step + 1} of 2`}>
          <span className={step >= 0 ? "progress-pebble active" : "progress-pebble"}>1</span>
          <span className="progress-path" />
          <span className={step >= 1 ? "progress-pebble active" : "progress-pebble"}>2</span>
          <span className="progress-caption">small steps, good feed</span>
        </div>
      </header>

      <section className="onboarding-stage" aria-live="polite">
        <div className="onboarding-layout">
          <div className="onboarding-panel">
            {step === 0 ? (
              <div key="welcome" className="onboarding-step">
                <div className="onboarding-kicker"><Sparkles /> hello, curious human!</div>
                <h1>Small stories.<br /><span>Big curiosity.</span></h1>
                <p className="onboarding-lede">
                  Made Space finds good things to read, then keeps them in one thoughtful place.
                </p>

                <label className="name-field">
                  <span>What should Made Space call you?</span>
                  <span className="name-input-wrap">
                    <input
                      type="text"
                      placeholder="Your name goes here..."
                      value={name}
                      onChange={event => setName(event.target.value)}
                      onKeyDown={event => event.key === "Enter" && name.trim() && setStep(1)}
                      autoFocus
                      autoComplete="name"
                    />
                    <span className="field-doodle" aria-hidden="true">✎</span>
                  </span>
                </label>

                <button className="onboarding-primary" onClick={() => name.trim() && setStep(1)} disabled={!name.trim()}>
                  Let’s wander <ArrowRight />
                </button>
                <p className="onboarding-whisper">no homework. promise.</p>
              </div>
            ) : (
              <div key="interests" className="onboarding-step">
                <div className="onboarding-kicker"><Sparkles /> nice to meet you, {name.trim()}!</div>
                <h1>What makes your<br /><span>brain sparkle?</span></h1>
                <div className="interest-intro">
                  <p>Pick at least three. There are no wrong answers.</p>
                  <span className={selected.size >= 3 ? "selection-count ready" : "selection-count"}>
                    {selected.size}/3 picked
                  </span>
                </div>

                <div className="interest-grid" role="group" aria-label="Choose your interests">
                  {CATEGORIES.map((category, index) => {
                    const isSelected = selected.has(category);
                    return (
                      <button
                        key={category}
                        className={`interest-chip${isSelected ? " selected" : ""}`}
                        onClick={() => toggle(category)}
                        aria-pressed={isSelected}
                      >
                        <span className="interest-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        <span>{category}</span>
                        <span className="interest-check">{isSelected && <Check />}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="onboarding-actions">
                  <button className="onboarding-back" onClick={() => setStep(0)}><ChevronLeft /> Back</button>
                  <button className="onboarding-primary" onClick={finish} disabled={selected.size < 3}>
                    {remaining > 0 ? `Pick ${remaining} more` : "Show me good stuff"} <ArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="onboarding-visual" aria-hidden="true">
            <div className="visual-meta">
              <span>MADE SPACE / ONBOARDING</span>
              <span>0{step + 1}</span>
            </div>
            <div className="visual-words" key={`visual-${step}`}>
              {(step === 0 ? ["READ", "KEEP", "RETURN"] : ["PICK", "MIX", "DISCOVER"]).map((word, index) => (
                <span key={word} className={index === 1 ? "outline" : ""}>{word}</span>
              ))}
            </div>
            <div className="visual-disc"><Sparkles /></div>
            <div className="visual-footer">
              <span>{step === 0 ? "Good stories, without the noise." : "Three sparks make a beginning."}</span>
              <ArrowRight />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
