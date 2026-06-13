"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ThemeId } from "@/components/RenderCard";

const THEMES: { id: ThemeId; label: string }[] = [
  { id: "light",    label: "Light"    },
  { id: "dark",     label: "Dark"     },
  { id: "vivid",    label: "Vivid"    },
  { id: "minimal",  label: "Minimal"  },
  { id: "midnight", label: "Midnight" },
];

export default function Home() {
  const [discordId, setDiscordId]     = useState("");
  const [theme, setTheme]             = useState<ThemeId>("light");
  const [svgContent, setSvgContent]   = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [origin, setOrigin]           = useState("");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => { if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current); };
  }, []);

  const fetchCard = useCallback(async (id: string, t: ThemeId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/users?id=${id}&theme=${t}`);
      if (!res.ok) {
        throw new Error(
          res.status >= 500
            ? "User not found. Make sure you joined the Discord server first."
            : "Could not load this user. Check the Discord ID and try again."
        );
      }
      setSvgContent(await res.text());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = discordId.trim();
    if (!id) return;
    if (!/^\d{17,19}$/.test(id)) {
      setError("Discord IDs are 17–19 digit numbers.");
      return;
    }
    setSvgContent(null);
    await fetchCard(id, theme);
  };

  // Re-fetch when theme changes (only if a card is already loaded)
  const prevThemeRef = useRef<ThemeId>(theme);
  useEffect(() => {
    if (prevThemeRef.current === theme) return;
    prevThemeRef.current = theme;
    const id = discordId.trim();
    if (!id || !svgContent) return;
    fetchCard(id, theme);
  }, [theme, discordId, svgContent, fetchCard]);

  const handleCopy = () => {
    const id = discordId.trim();
    if (!id || !origin) return;
    const themeParam = theme !== "light" ? `&theme=${theme}` : "";
    navigator.clipboard.writeText(`${origin}/users?id=${id}${themeParam}`);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const themeParam = theme !== "light" ? `&theme=${theme}` : "";
  const embedUrl = origin
    ? `${origin}/users?id=${discordId.trim()}${themeParam}`
    : `/users?id=${discordId.trim()}${themeParam}`;

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
                id="discord-id"
                type="text"
                inputMode="numeric"
                placeholder="Discord ID"
                value={discordId}
                onChange={(e) => { setDiscordId(e.target.value); if (error) setError(null); }}
                disabled={isLoading}
                className="ls-input"
                aria-describedby={error ? "ls-form-error" : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="ls-btn-primary"
                disabled={isLoading || !discordId.trim()}
              >
                {isLoading ? (
                  <><span className="ls-spinner" aria-hidden="true" /><span>Loading</span></>
                ) : "Generate"}
              </button>
            </div>
            {error && (
              <p id="ls-form-error" className="ls-error" role="alert">{error}</p>
            )}
          </form>

          {/* Theme picker */}
          <div className="ls-theme-picker" role="group" aria-label="Card theme">
            {THEMES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`ls-theme-btn ls-theme-btn--${id}${theme === id ? " ls-theme-btn--active" : ""}`}
                onClick={() => setTheme(id)}
                aria-pressed={theme === id}
              >
                <span className="ls-theme-dot" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="ls-preview" aria-live="polite" aria-label="Card preview">
          {svgContent ? (
            <div key={svgContent} className="ls-card" dangerouslySetInnerHTML={{ __html: svgContent }} />
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
              <button
                type="button"
                className={`ls-btn-copy${copied ? " ls-btn-copy--done" : ""}`}
                onClick={handleCopy}
                aria-label={copied ? "URL copied to clipboard" : "Copy embed URL"}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="ls-footer">
        <p>
          Join{" "}
          <a href="https://discord.gg/evarinthosec" className="ls-link">Discord</a>{" "}
          to enable status sharing
        </p>
      </footer>
    </div>
  );
}
