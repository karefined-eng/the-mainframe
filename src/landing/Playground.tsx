/**
 * Interactive Client-Side Ingestion Playground
 *
 * Impeccable "Persuade" Mode:
 * Allows landing page visitors to test The Mainframe's 3-second plaintext capture
 * live in the browser without installing anything or creating an account.
 *
 * Adheres strictly to:
 *   - Impeccable Craft Floor (no card soup, single-source depth, no emojis)
 *   - The Mainframe Neuro-UX (capped at 5 items, zero shame mechanics)
 *   - Design System Tokens (#0E0E10, #1A1A1D, #141518, #4A9EFF, #F2F2F0, #B1B3B7)
 */

import { useState, useTransition } from "react";
import { ArrowRight, Check, HardDrive, Lock, RefreshCw, Sparkles, Terminal } from "lucide-react";
import { playgroundPresets } from "./content";

export default function Playground() {
  const [selectedPresetId, setSelectedPresetId] = useState(playgroundPresets[0].id);
  const [rawText, setRawText] = useState(playgroundPresets[0].rawText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(true);
  const [, startTransition] = useTransition();

  const currentPreset = playgroundPresets.find((p) => p.id === selectedPresetId) ?? playgroundPresets[0];

  const handleSelectPreset = (presetId: string) => {
    const preset = playgroundPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setRawText(preset.rawText);
    setIsProcessing(true);
    setTimeout(() => {
      startTransition(() => {
        setIsProcessing(false);
        setHasProcessed(true);
      });
    }, 200);
  };

  const handleParse = () => {
    setIsProcessing(true);
    setTimeout(() => {
      startTransition(() => {
        setIsProcessing(false);
        setHasProcessed(true);
      });
    }, 220);
  };

  const handleReset = () => {
    setRawText(currentPreset.rawText);
    setHasProcessed(true);
  };

  return (
    <div className="lp-play" data-od-id="hero-playground">
      {/* Chrome header */}
      <div className="lp-play-bar">
        <div className="lp-play-dots" aria-hidden="true">
          <span className="lp-play-dot" />
          <span className="lp-play-dot" />
          <span className="lp-play-dot lp-play-dot--accent" />
        </div>
        <span className="lp-play-title">
          <Terminal size={13} className="lp-play-icon" aria-hidden="true" />
          interactive ingestion simulator
        </span>
        <span className="lp-play-live">
          <Lock size={12} aria-hidden="true" />
          offline client-side
        </span>
      </div>

      {/* Preset switcher pills */}
      <div className="lp-play-presets" role="tablist" aria-label="Ingestion sample presets">
        {playgroundPresets.map((preset) => {
          const isActive = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              role="tab"
              aria-selected={isActive}
              className={`lp-play-tab ${isActive ? "lp-play-tab--active" : ""}`}
              onClick={() => handleSelectPreset(preset.id)}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      <div className="lp-play-grid">
        {/* Left Column: Raw plain text input */}
        <div className="lp-play-input-pane">
          <div className="lp-play-pane-header">
            <span className="lp-play-pane-label">
              <span className="lp-mono lp-play-num">01</span>
              Messy Plaintext Input
            </span>
            <button
              type="button"
              className="lp-play-action-btn"
              onClick={handleReset}
              title="Reset to preset text"
            >
              <RefreshCw size={12} aria-hidden="true" />
              Reset
            </button>
          </div>
          <div className="lp-play-editor-wrap">
            <textarea
              className="lp-play-textarea lp-mono"
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasProcessed(false);
              }}
              rows={6}
              spellCheck={false}
              aria-label="Raw text ingestion input"
              placeholder="Paste any unformatted notes or lines here..."
            />
          </div>
          <div className="lp-play-cta-bar">
            <button
              type="button"
              className="lp-btn lp-btn--primary lp-play-parse-btn"
              onClick={handleParse}
              disabled={isProcessing || !rawText.trim()}
            >
              <Sparkles size={14} aria-hidden="true" />
              {isProcessing ? "Structuring..." : "Structure in 0.2s"}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
            <span className="lp-play-parse-hint">Preserves original raw input verbatim</span>
          </div>
        </div>

        {/* Right Column: Structured Domain Cards Output */}
        <div className="lp-play-output-pane">
          <div className="lp-play-pane-header">
            <span className="lp-play-pane-label">
              <span className="lp-mono lp-play-num">02</span>
              Instant Domain Separation (Zero Schema Setup)
            </span>
            <span className="lp-play-latency lp-mono">0.2s parse</span>
          </div>

          <div className="lp-play-cards">
            {hasProcessed && !isProcessing ? (
              currentPreset.items.map((item, idx) => (
                <div className="lp-play-card" key={`${item.title}-${idx}`}>
                  <div className="lp-play-card-top">
                    <span className="lp-play-domain">
                      <HardDrive size={11} className="lp-play-card-icon" aria-hidden="true" />
                      {item.domain}
                    </span>
                    <span className={`lp-play-status lp-play-status--${item.tone}`}>
                      {item.tag}
                    </span>
                  </div>
                  <div className="lp-play-card-title">{item.title}</div>
                  <div className="lp-play-card-note">{item.note}</div>
                </div>
              ))
            ) : (
              <div className="lp-play-pending">
                <span className="lp-play-pulse" />
                <span>Parsing unstructured plain text into 5 pre-modeled domains...</span>
              </div>
            )}
          </div>

          <div className="lp-play-footer">
            <div className="lp-play-guarantee">
              <Check size={13} className="lp-play-check" aria-hidden="true" />
              <span>Strict 3–5 working memory cap · Zero overdue red badges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
