import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import episodesData from "../data/episodes.json";
import type { Episode, EpisodeProgress, ProgressMap } from "./types";
import { exportProgress, importProgress, loadProgress, saveProgress } from "./storage";

const episodes = episodesData as Episode[];
type Filter = "all" | "unlistened" | "listened";

export default function App() {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState("number-asc");
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const listenedCount = episodes.filter((episode) => progress[String(episode.number)]?.listened).length;
  const percentage = episodes.length ? Math.round((listenedCount / episodes.length) * 100) : 0;

  const visibleEpisodes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de");
    const filtered = episodes.filter((episode) => {
      const state = progress[String(episode.number)]?.listened === true;
      const matchesQuery = !normalized
        || episode.title.toLocaleLowerCase("de").includes(normalized)
        || String(episode.number).includes(normalized);
      const matchesFilter = filter === "all" || (filter === "listened" ? state : !state);
      return matchesQuery && matchesFilter;
    });
    return filtered.sort((a, b) => {
      if (sort === "title-asc") return a.title.localeCompare(b.title, "de");
      if (sort === "number-desc") return b.number - a.number;
      return a.number - b.number;
    });
  }, [query, filter, sort, progress]);

  const selectedEpisode = selected === null ? null : episodes.find((episode) => episode.number === selected) ?? null;

  function updateEpisode(number: number, patch: Partial<EpisodeProgress>) {
    setProgress((current) => {
      const key = String(number);
      const existing = current[key] ?? { listened: false };
      const next = { ...current, [key]: { ...existing, ...patch } };
      saveProgress(next);
      return next;
    });
    setMessage("");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProgress(file);
      const merged = { ...progress, ...imported };
      saveProgress(merged);
      setProgress(merged);
      setMessage("Listening progress imported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import this file.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="eyebrow">DEIN HÖRSPIEL ARCHIV</div>
        <h1>TKKG<span>Tracker</span></h1>
        <p>Alle Fälle im Blick. Jeder gehörte Fall abgehakt.</p>
        <div className="progress-panel">
          <div>
            <span className="metric-label">GEHÖRT</span>
            <strong>{listenedCount}<small> / {episodes.length}</small></strong>
          </div>
          <div className="progress-track" aria-label={`${percentage}% gehört`}>
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span className="progress-percent">{percentage}%</span>
        </div>
      </header>

      <section className="toolbar" aria-label="Catalogue controls">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Folge oder Titel suchen …" aria-label="Search episodes" />
        </label>
        <div className="control-row">
          <label>
            <span className="sr-only">Filter episodes</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
              <option value="all">Alle Folgen</option>
              <option value="unlistened">Noch nicht gehört</option>
              <option value="listened">Gehört</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort episodes</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="number-asc">Nummer aufsteigend</option>
              <option value="number-desc">Nummer absteigend</option>
              <option value="title-asc">Titel A bis Z</option>
            </select>
          </label>
        </div>
      </section>

      {message && <p className="notice" role="status">{message}</p>}

      {episodes.length === 0 ? (
        <section className="empty-state">
          <div className="empty-mark">TKKG</div>
          <h2>Das Archiv wird vorbereitet</h2>
          <p>Die Episodenliste erscheint, sobald der Python-Katalogimport erfolgreich gelaufen ist. Es werden keine Episodentitel erfunden.</p>
        </section>
      ) : (
        <section className="episode-list" aria-label="Episodes">
          <div className="list-heading"><span>FOLGE</span><span aria-hidden="true"></span><span>TITEL</span><span>STATUS</span></div>
          {visibleEpisodes.map((episode) => {
            const state = progress[String(episode.number)]?.listened === true;
            return (
              <article className={`episode-row ${state ? "is-listened" : ""}`} key={episode.number}>
                <span className="episode-number">{String(episode.number).padStart(3, "0")}</span>
                {episode.cover_url ? <img className="cover-thumb" src={episode.cover_url} alt="" loading="lazy" /> : <span className="cover-placeholder" aria-hidden="true">TKKG</span>}
                <button className="episode-title" onClick={() => setSelected(episode.number)}>
                  <strong>{episode.title}</strong>
                  <span>{episode.release_year ?? "Hauptserie"}{episode.synopsis ? " · Details verfügbar" : ""}</span>
                </button>
                <button className={`listen-toggle ${state ? "checked" : ""}`} onClick={() => updateEpisode(episode.number, { listened: !state })} aria-label={state ? `Mark episode ${episode.number} unlistened` : `Mark episode ${episode.number} listened`} aria-pressed={state}>
                  {state ? "✓" : ""}
                </button>
              </article>
            );
          })}
          {visibleEpisodes.length === 0 && <p className="no-results">Keine Folgen für diese Suche gefunden.</p>}
        </section>
      )}

      <footer className="footer-actions">
        <button className="secondary-button" onClick={() => exportProgress(progress)}>Fortschritt exportieren</button>
        <button className="secondary-button" onClick={() => fileInput.current?.click()}>Fortschritt importieren</button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
      </footer>

      {selectedEpisode && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section className="episode-modal" role="dialog" aria-modal="true" aria-labelledby="episode-modal-title">
            <button className="close-button" onClick={() => setSelected(null)} aria-label="Close episode details">×</button>
            <div className="modal-topline">FOLGE {String(selectedEpisode.number).padStart(3, "0")}</div>
            <h2 id="episode-modal-title">{selectedEpisode.title}</h2>
            {selectedEpisode.cover_url && <img className="modal-cover" src={selectedEpisode.cover_url} alt={`Cover: ${selectedEpisode.title}`} />}
            <p>{selectedEpisode.synopsis || "Für diese Folge liegt noch keine Inhaltsangabe vor."}</p>
            {selectedEpisode.release_date && <p><strong>Veröffentlichung:</strong> {selectedEpisode.release_date}</p>}
            {selectedEpisode.physical_releases.length > 0 && <section><h3>Ausgaben</h3>{selectedEpisode.physical_releases.map((release, index) => <p key={index}>{[release.medium, release.label, release.ean].filter(Boolean).join(" · ")}</p>)}</section>}
            {selectedEpisode.tracks.length > 0 && <section><h3>Tracks</h3><ol>{selectedEpisode.tracks.map((track, index) => <li key={index}>{track.title}</li>)}</ol></section>}
            {selectedEpisode.cast.length > 0 && <section><h3>Sprecher</h3><ul>{selectedEpisode.cast.map((person, index) => <li key={index}>{person.character ? `${person.character} · ${person.name}` : person.name}</li>)}</ul></section>}
            {selectedEpisode.credits.length > 0 && <section><h3>Produktion</h3><ul>{selectedEpisode.credits.map((credit, index) => <li key={index}>{credit.role}: {credit.name}</li>)}</ul></section>}
            {selectedEpisode.ratings.length > 0 && <section><h3>Bewertungen</h3><ul>{selectedEpisode.ratings.map((rating, index) => <li key={index}>{rating.category}: {rating.value} ({rating.source})</li>)}</ul></section>}
            <section className="personal-notes">
              <h3>Deine Notizen</h3>
              <label>Persönliche Bewertung
                <select value={progress[String(selectedEpisode.number)]?.personalRating ?? ""} onChange={(event) => updateEpisode(selectedEpisode.number, { personalRating: event.target.value ? Number(event.target.value) : undefined })}>
                  <option value="">Keine Bewertung</option>
                  <option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3">3 / 5</option><option value="4">4 / 5</option><option value="5">5 / 5</option>
                </select>
              </label>
              <label>Notizen
                <textarea value={progress[String(selectedEpisode.number)]?.notes ?? ""} onChange={(event) => updateEpisode(selectedEpisode.number, { notes: event.target.value })} rows={3} placeholder="Was ist dir zu dieser Folge in Erinnerung geblieben?" />
              </label>
            </section>
            {selectedEpisode.sources.map((source) => <p key={source.url} className="source-link"><a href={source.url} target="_blank" rel="noreferrer">Quelle: {source.name}</a></p>)}
            <button className="primary-button" onClick={() => updateEpisode(selectedEpisode.number, { listened: !progress[String(selectedEpisode.number)]?.listened })}>
              {progress[String(selectedEpisode.number)]?.listened ? "Als nicht gehört markieren" : "Als gehört markieren"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
