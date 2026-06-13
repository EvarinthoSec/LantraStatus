"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ThemeId, SizeId, HideKey } from "@/components/RenderCard";

const THEMES: { id: ThemeId; label: string }[] = [
  { id: "light",    label: "Light"    },
  { id: "dark",     label: "Dark"     },
  { id: "vivid",    label: "Vivid"    },
  { id: "minimal",  label: "Minimal"  },
  { id: "midnight", label: "Midnight" },
];

const HIDE_OPTIONS: { key: HideKey; label: string }[] = [
  { key: "banner",       label: "Banner"        },
  { key: "activity",     label: "Activity"      },
  { key: "elapsed",      label: "Elapsed time"  },
  { key: "customstatus", label: "Custom status" },
];

export default function Home() {
  const [discordId, setDiscordId]   = useState("");
  const [theme, setTheme]           = useState<ThemeId>("light");
  const [size, setSize]             = useState<SizeId>("normal");
  const [hide, setHide]             = useState<HideKey[]>([]);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const [origin, setOrigin]         = useState("");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => { if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current); };
  }, []);

  const buildUrl = useCallback((id: string, t: ThemeId, s: SizeId, h: HideKey[]) => {
    const params = new URLSearchParams({ id });
    if (t !== "light")   params.set("theme", t);
    if (s !== "normal")  params.set("size", s);
    if (h.length)        params.set("hide", h.join(","));
    return `/users?${params}`;
  }, []);

  const fetchCard = useCallback(async (id: string, t: ThemeId, s: SizeId, h: HideKey[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(id, t, s, h));
      if (!res.ok) throw new Error(
        res.status >= 500
          ? "User not found. Make sure you joined the Discord server first."
          : "Could not load this user. Check the Discord ID and try again."
      );
      setSvgContent(await res.text());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [buildUrl]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = discordId.trim();
    if (!id) return;
    if (!/^\d{17,19}$/.test(id)) { setError("Discord IDs are 17–19 digit numbers."); return; }
    setSvgContent(null);
    await fetchCard(id, theme, size, hide);
  };

  // Re-fetch on option changes if card already loaded
  const prevRef = useRef({ theme, size, hide: hide.join(",") });
  useEffect(() => {
    const cur = { theme, size, hide: hide.join(",") };
    if (JSON.stringify(prevRef.current) === JSON.stringify(cur)) return;
    prevRef.current = cur;
    const id = discordId.trim();
    if (!id || !svgContent) return;
    fetchCard(id, theme, size, hide);
  }, [theme, size, hide, discordId, svgContent, fetchCard]);

  const handleCopy = () => {
    const id = discordId.trim();
    if (!id || !origin) return;
    navigator.clipboard.writeText(origin + buildUrl(id, theme, size, hide));
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const toggleHide = (key: HideKey) =>
    setHide(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const embedUrl = origin
    ? origin + buildUrl(discordId.trim(), theme, size, hide)
    : buildUrl(discordId.trim(), theme, size, hide);

  return (
    <div className="ls-page">
      <header className="ls-header">
        <span className="ls-wordmark">LantraStatus</span>
      </header>

      <main className="ls-main">
        <section className="ls-hero" aria-labelledby="ls-heading">
          <h1 id="ls-heading" className="ls-heading">
            Your Discord status in your GitHub README
          </h1>
          <p className="ls-subheading">
            Paste your Discord ID. Pick a theme. Get an embed URL.
          </p>

          <form className="ls-form" onSubmit={handleGenerate} noValidate>
            <label htmlFor="discord-id" className="sr-only">Discord User ID</label>
            <div className="ls-input-row">
              <input
                id="discord-id" type="text" inputMode="numeric" placeholder="Discord ID"
                value={discordId}
                onChange={e => { setDiscordId(e.target.value); if (error) setError(null); }}
                disabled={isLoading} className="ls-input"
                aria-describedby={error ? "ls-form-error" : undefined}
                autoComplete="off" spellCheck={false}
              />
              <button type="submit" className="ls-btn-primary" disabled={isLoading || !discordId.trim()}>
                {isLoading ? <><span className="ls-spinner" aria-hidden="true"/><span>Loading</span></> : "Generate"}
              </button>
            </div>
            {error && <p id="ls-form-error" className="ls-error" role="alert">{error}</p>}
          </form>

          {/* Theme picker */}
          <div className="ls-option-group">
            <span className="ls-option-label">Theme</span>
            <div className="ls-pill-row" role="group" aria-label="Card theme">
              {THEMES.map(({ id, label }) => (
                <button key={id} type="button"
                  className={`ls-theme-btn ls-theme-btn--${id}${theme===id?" ls-theme-btn--active":""}`}
                  onClick={() => setTheme(id)} aria-pressed={theme===id}>
                  <span className="ls-theme-dot" aria-hidden="true"/>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="ls-option-group">
            <span className="ls-option-label">Size</span>
            <div className="ls-pill-row" role="group" aria-label="Card size">
              {(["normal","compact"] as SizeId[]).map(s => (
                <button key={s} type="button"
                  className={`ls-size-btn${size===s?" ls-size-btn--active":""}`}
                  onClick={() => setSize(s)} aria-pressed={size===s}>
                  {s === "normal" ? "Normal" : "Compact"}
                </button>
              ))}
            </div>
          </div>

          {/* Hide toggles */}
          <div className="ls-option-group">
            <span className="ls-option-label">Hide</span>
            <div className="ls-pill-row" role="group" aria-label="Hide elements">
              {HIDE_OPTIONS.map(({ key, label }) => (
                <button key={key} type="button"
                  className={`ls-hide-btn${hide.includes(key)?" ls-hide-btn--active":""}`}
                  onClick={() => toggleHide(key)} aria-pressed={hide.includes(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="ls-preview" aria-live="polite" aria-label="Card preview">
          {svgContent ? (
            <div key={svgContent} className="ls-card" dangerouslySetInnerHTML={{ __html: svgContent }}/>
          ) : (
            <div className="ls-placeholder" aria-label="Card preview will appear here after generation">
              <span className="ls-placeholder-text">Your card will appear here</span>
            </div>
          )}
        </div>

        {svgContent && discordId && (
          <div className="ls-embed" aria-label="Embed URL">
            <p className="ls-embed-label">Embed URL</p>
            <div className="ls-embed-row">
              <code className="ls-embed-code">{embedUrl}</code>
              <button type="button"
                className={`ls-btn-copy${copied?" ls-btn-copy--done":""}`}
                onClick={handleCopy}
                aria-label={copied ? "URL copied to clipboard" : "Copy embed URL"}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="ls-footer">
        <p>Join <a href="https://discord.gg/evarinthosec" className="ls-link">Discord</a> to enable status sharing</p>
      </footer>
    </div>
  );
}
