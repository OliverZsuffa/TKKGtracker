import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import episodesData from "../data/episodes.json";
import type { Episode, EpisodeProgress, ProgressMap } from "./types";
import { exportProgress, importProgress, loadProgress, saveProgress } from "./storage";
import { activeSearchLabels, filterEpisodes, getSearchOptions, initialSearchState, missingFieldLabels } from "./search";
import type { MissingField, SearchState, SortMode } from "./search";
import { createGapReport, downloadText, formatGapReportMarkdown } from "./gapReport";
import { getListeningOptions } from "./listeningLinks";

const episodes = episodesData as Episode[];
type Filter = "all" | "unlistened" | "listened";

function StarRating({ value, onChange }: { value?: number; onChange: (value: number | undefined) => void }) {
  return <div className="rating-control">
    <div className="star-buttons" role="group" aria-label="Personal rating out of five">
      {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} className={star <= (value ?? 0) ? "star-button active" : "star-button"} onClick={() => onChange(value === star ? undefined : star)} aria-label={star + " out of 5 stars"} aria-pressed={value === star} title={star + " out of 5"}>{star <= (value ?? 0) ? "★" : "☆"}</button>)}
    </div>
    <span className="rating-value" aria-live="polite">{value ? value + " / 5" : "Not rated"}</span>
    {value != null && <button className="text-button clear-rating" type="button" onClick={() => onChange(undefined)}>Clear rating</button>}
  </div>;
}

export default function App() {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [search, setSearch] = useState<SearchState>(initialSearchState);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportField, setReportField] = useState<MissingField | "speaker" | "character" | "other">("other");
  const [reportDescription, setReportDescription] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const reportButton = useRef<HTMLButtonElement>(null);

  const listenedCount = episodes.filter((episode) => progress[String(episode.number)]?.listened).length;
  const percentage = episodes.length ? Math.round((listenedCount / episodes.length) * 100) : 0;
  const options = useMemo(() => getSearchOptions(episodes), []);
  const visibleEpisodes = useMemo(() => filterEpisodes(episodes, { ...search, listening: filter }, progress), [search, filter, progress]);
  const selectedEpisode = selected === null ? null : episodes.find((episode) => episode.number === selected) ?? null;
  const activeLabels = activeSearchLabels({ ...search, listening: filter });
  const reportTarget = selectedEpisode ?? (visibleEpisodes.length === 1 ? visibleEpisodes[0] : null);

  function setSearchField<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    setSearch((current) => ({ ...current, [key]: value }));
  }
  function updateEpisode(number: number, patch: Partial<EpisodeProgress>) {
    setProgress((current) => {
      const key = String(number);
      const existing = current[key] ?? { listened: false };
      const next = { ...current, [key]: { ...existing, ...patch } };
      try {
        saveProgress(next);
        setMessage("Saved on this device.");
      } catch {
        setMessage("Could not save to this browser. Export your progress to keep a backup.");
      }
      return next;
    });
  }
  function resetSearch() {
    setSearch(initialSearchState);
    setFilter("all");
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
  function openReport() {
    setReportField(search.missingField || (search.speaker ? "speaker" : search.character ? "character" : "other"));
    setReportDescription("");
    setReportOpen(true);
  }
  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const report = createGapReport({ state: { ...search, listening: filter }, episode: reportTarget, field: reportField, description: reportDescription });
    downloadText("tkkgtracker-gap-report.md", formatGapReportMarkdown(report), "text/markdown;charset=utf-8");
    downloadText("tkkgtracker-gap-report.json", JSON.stringify(report, null, 2), "application/json;charset=utf-8");
    setReportOpen(false);
    setMessage("Report downloaded as Markdown and JSON. Nothing was uploaded.");
    window.setTimeout(() => reportButton.current?.focus(), 0);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL AUDIO ARCHIVE</div>
          <h1>TKKG<span>Tracker</span></h1>
          <p>Every case in one place. Keep your listening history, ratings and discoveries together.</p>
        </div>
        <div className="progress-panel">
          <div><span className="metric-label">LISTENING PROGRESS</span><strong>{listenedCount}<small> / {episodes.length}</small></strong></div>
          <div className="progress-track" role="progressbar" aria-label="Episodes listened to" aria-valuemin={0} aria-valuemax={episodes.length} aria-valuenow={listenedCount}><div className="progress-fill" style={{ width: percentage + "%" }} /></div>
          <span className="progress-percent">{percentage}%</span>
        </div>
        <div className="privacy-note"><span aria-hidden="true">◈</span> Your ratings and notes stay in this browser.</div>
      </header>

      <section className="catalogue-section" aria-label="Episode catalogue">
        <div className="section-heading"><div><span className="section-kicker">THE COLLECTION</span><h2>Explore episodes</h2></div><span className="catalogue-total">{episodes.length} episodes</span></div>
        <div className="toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={search.query} onChange={(event) => setSearchField("query", event.target.value)} placeholder="Search by episode number or title…" aria-label="Search episode number or title" /><kbd>⌕</kbd></label>
          <div className="toolbar-controls">
            <label><span className="sr-only">Listening status</span><select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="all">All episodes</option><option value="unlistened">Not listened</option><option value="listened">Listened</option></select></label>
            <label><span className="sr-only">Sort episodes</span><select value={search.sort} onChange={(event) => setSearchField("sort", event.target.value as SortMode)}><option value="number-asc">Episode ↑</option><option value="number-desc">Episode ↓</option><option value="title-asc">Title A–Z</option><option value="year-asc">Year ↑</option><option value="year-desc">Year ↓</option><option value="rating-desc">Top rated</option></select></label>
          </div>
        </div>

        <div className="advanced-toggle-row">
          <button className="advanced-toggle" type="button" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen} aria-controls="advanced-search"><span className="filter-icon">☷</span>{advancedOpen ? "Hide advanced search" : "Advanced search"}<span className="toggle-hint">Years, cast, metadata gaps and more</span><span className="chevron" aria-hidden="true">{advancedOpen ? "−" : "+"}</span></button>
          {activeLabels.length > 0 && <button className="text-button reset-button" onClick={resetSearch}>Clear all</button>}
        </div>
        {advancedOpen && <section id="advanced-search" className="advanced-panel" aria-label="Advanced search filters">
          <div className="advanced-panel-heading"><div><h3>Refine the catalogue</h3><p>Filters combine together. Empty fields are not treated as matches unless you choose a missing-data filter.</p></div><button type="button" className="text-button" onClick={resetSearch}>Reset filters</button></div>
          <div className="filter-grid">
            <label className="field-label">Release year<select value={search.year} onChange={(event) => setSearchField("year", event.target.value)}><option value="all">Any year</option><option value="missing">Year missing</option>{options.years.map((year) => <option key={year} value={String(year)}>{year}</option>)}</select></label>
            <label className="field-label">Speaker / actor<input list="speaker-options" value={search.speaker} onChange={(event) => setSearchField("speaker", event.target.value)} placeholder="Type any performer name…" /><datalist id="speaker-options">{options.speakers.map((name) => <option key={name} value={name} />)}</datalist></label>
            <label className="field-label">Character / role<input list="character-options" value={search.character} onChange={(event) => setSearchField("character", event.target.value)} placeholder="Type any character name…" /><datalist id="character-options">{options.characters.map((name) => <option key={name} value={name} />)}</datalist></label>
            <label className="field-label">Find missing information<select value={search.missingField} onChange={(event) => setSearchField("missingField", event.target.value as MissingField | "")}><option value="">No missing-field filter</option>{Object.entries(missingFieldLabels).map(([key, label]) => <option key={key} value={key}>{label} missing</option>)}</select></label>
            <label className="field-label">Words in synopsis<input value={search.synopsisQuery} onChange={(event) => setSearchField("synopsisQuery", event.target.value)} placeholder="e.g. museum, school…" /></label>
            <label className="field-label">Track title contains<input value={search.trackQuery} onChange={(event) => setSearchField("trackQuery", event.target.value)} placeholder="Search track names…" /></label>
            <label className="field-label field-wide">Production credit contains<input value={search.creditQuery} onChange={(event) => setSearchField("creditQuery", event.target.value)} placeholder="Speaker, director, author or role…" /></label>
          </div>
          <p className="filter-help">Speaker means the performer; character means the role they play. “Missing” checks the catalogue only and does not prove the information is unavailable elsewhere.</p>
        </section>}

        <div className="results-bar"><div><strong>{visibleEpisodes.length}</strong> {visibleEpisodes.length === 1 ? "episode" : "episodes"} found {activeLabels.length > 0 && <span>with active filters</span>}</div><span className="results-range">{visibleEpisodes.length === episodes.length ? "Showing the full collection" : "Filtered from " + episodes.length + " episodes"}</span></div>
        {activeLabels.length > 0 && <div className="active-filters" aria-label="Active filters">{activeLabels.map((label, index) => <span className="filter-chip" key={label + index}>{label}<button type="button" aria-label={"Remove filter " + label} onClick={() => {
          if (label.startsWith("Search:")) setSearchField("query", "");
          else if (label === "Year missing" || label.startsWith("Year:")) setSearchField("year", "all");
          else if (label.startsWith("Speaker:")) setSearchField("speaker", "");
          else if (label.startsWith("Character:")) setSearchField("character", "");
          else if (label.startsWith("Missing:")) setSearchField("missingField", "");
          else if (label.startsWith("Synopsis:")) setSearchField("synopsisQuery", "");
          else if (label.startsWith("Track:")) setSearchField("trackQuery", "");
          else if (label.startsWith("Credits:")) setSearchField("creditQuery", "");
          else if (label === "Listened" || label === "Not listened") setFilter("all");
        }}>×</button></span>)}</div>}

        {episodes.length === 0 ? <section className="empty-state"><div className="empty-mark">TKKG</div><h2>Your archive is getting ready</h2><p>The episode list appears once the catalogue import has completed. No episode information is invented.</p></section> : visibleEpisodes.length === 0 ? <section className="empty-state no-results-state"><div className="empty-symbol">⌕</div><h3>No episodes match these filters</h3><p>That means there is no match in the current catalogue — not necessarily that the episode or person does not exist.</p><div className="empty-actions"><button className="primary-button" onClick={resetSearch}>Clear search and filters</button><button ref={reportButton} className="secondary-button" onClick={openReport}>Report missing information</button></div></section> : (
          <div className="episode-list" aria-label="Episodes">
            <div className="list-heading"><span>NO.</span><span className="cover-heading">COVER</span><span>EPISODE</span><span>RATING</span><span>STATUS</span></div>
            {visibleEpisodes.map((episode) => {
              const state = progress[String(episode.number)]?.listened === true;
              const rating = progress[String(episode.number)]?.personalRating;
              return <article className={"episode-row " + (state ? "is-listened" : "")} key={episode.number}>
                <span className="episode-number">{String(episode.number).padStart(3, "0")}</span>
                {episode.cover_url ? <img className="cover-thumb" src={episode.cover_url} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="cover-placeholder" aria-hidden="true">TKKG</span>}
                <button className="episode-title" onClick={() => setSelected(episode.number)}><strong>{episode.title}</strong><span>{episode.release_year ?? "Year unknown"}<span className="meta-dot"> · </span>{episode.synopsis ? "Synopsis available" : "Synopsis missing"}</span></button>
                <button className="row-rating" onClick={() => setSelected(episode.number)} aria-label={"Rate " + episode.title + (rating ? ", currently " + rating + " out of 5" : ", not rated")} title="Open episode rating">{rating ? <><span className="mini-stars">{"★".repeat(rating)}<span>{"☆".repeat(5-rating)}</span></span><small>{rating}/5</small></> : <span className="unrated">Rate</span>}</button>
                <button className={"listen-toggle " + (state ? "checked" : "")} onClick={() => updateEpisode(episode.number, { listened: !state })} aria-label={state ? "Mark episode " + episode.number + " unlistened" : "Mark episode " + episode.number + " listened"} aria-pressed={state}>{state ? "✓" : ""}</button>
              </article>;
            })}
          </div>
        )}
      </section>

      {message && <p className="notice" role="status">{message}</p>}
      <footer className="footer-actions"><div className="footer-note">Your progress is stored locally, not synced to a server.</div><div className="footer-buttons"><button className="secondary-button" onClick={() => exportProgress(progress)}>Export progress</button><button className="secondary-button" onClick={() => fileInput.current?.click()}>Import progress</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} /></div></footer>

      {selectedEpisode && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={(event) => { if (event.key === "Escape") setSelected(null); }}>
        <section className="episode-modal" role="dialog" aria-modal="true" aria-labelledby="episode-modal-title">
          <button className="close-button" onClick={() => setSelected(null)} aria-label="Close episode details">×</button>
          <div className="modal-topline">CASE FILE / {String(selectedEpisode.number).padStart(3, "0")}</div>
          <div className="detail-heading">{selectedEpisode.cover_url && <img className="modal-cover" src={selectedEpisode.cover_url} alt={"Cover: " + selectedEpisode.title} onError={(event) => { event.currentTarget.style.display = "none"; }} />}<h2 id="episode-modal-title">{selectedEpisode.title}</h2><p className="detail-meta">{selectedEpisode.release_year ?? "Release year unknown"}{selectedEpisode.release_date ? " · " + selectedEpisode.release_date : ""}</p></div>
          <section className="detail-section"><h3>Synopsis</h3><p>{selectedEpisode.synopsis || <span className="missing-value">No synopsis in the current catalogue.</span>}</p></section>
          {(() => {
            const listening = getListeningOptions(selectedEpisode);
            return <section className="detail-section listening-section" aria-labelledby="listening-title">
              <div className="listening-heading"><div><h3 id="listening-title">Listen on</h3><p>Open the official episode page or search a service. Search links do not confirm availability.</p></div><span className="listening-icon" aria-hidden="true">♫</span></div>
              {listening.official.length > 0 && <div className="listening-official-list">{listening.official.map((option) => <a className="listening-official-link" key={option.id} href={option.url} target="_blank" rel="noopener noreferrer" aria-label={option.description + ": " + selectedEpisode.title}><span className="listening-link-symbol" aria-hidden="true">↗</span><span><strong>{option.label}</strong><small>Official episode-specific page · streaming services</small></span><span className="listening-arrow" aria-hidden="true">↗</span></a>)}</div>}
              <details className="listening-searches">
                <summary>Search this episode on other services <span>Spotify, Apple Music, Amazon Music and more</span></summary>
                <div className="listening-service-grid">{listening.searches.map((option) => <a className="listening-service-link" key={option.id} href={option.url} target="_blank" rel="noopener noreferrer" aria-label={option.description}><span>{option.label}</span><small>Search ↗</small></a>)}</div>
                <p className="listening-disclaimer">These links search the service for this episode title. Results and availability can vary by region and subscription; TKKGTracker does not verify individual search results.</p>
              </details>
            </section>;
          })()}
          <section className="detail-section"><h3>Personal rating</h3><StarRating value={progress[String(selectedEpisode.number)]?.personalRating} onChange={(value) => updateEpisode(selectedEpisode.number, { personalRating: value })} /></section>
          <section className="detail-section personal-notes"><div className="section-label-row"><h3>Your notes</h3><span className="private-pill">Private · this device</span></div><label className="field-label">Personal comments<textarea value={progress[String(selectedEpisode.number)]?.notes ?? ""} onChange={(event) => updateEpisode(selectedEpisode.number, { notes: event.target.value })} rows={4} placeholder="What stood out? Favourite scenes, theories, memories…" /></label></section>
          {selectedEpisode.physical_releases.length > 0 && <section className="detail-section"><h3>Physical releases</h3><div className="detail-card-list">{selectedEpisode.physical_releases.map((release, index) => <div className="detail-card" key={index}><strong>{release.medium || "Edition"}</strong><span>{[release.label, release.ean, release.release_date].filter(Boolean).join(" · ") || "Edition details not available"}</span>{release.source_url && <a href={release.source_url} target="_blank" rel="noreferrer">View source ↗</a>}</div>)}</div></section>}
          {selectedEpisode.tracks.length > 0 && <section className="detail-section"><h3>Tracks <span className="section-count">{selectedEpisode.tracks.length}</span></h3><ol className="track-list">{selectedEpisode.tracks.map((track, index) => <li key={index}><span>{String(index+1).padStart(2,"0")}</span><strong>{track.title}</strong>{track.duration && <small>{track.duration}</small>}</li>)}</ol></section>}
          {selectedEpisode.cast.length > 0 && <section className="detail-section"><h3>Cast & speakers <span className="section-count">{selectedEpisode.cast.length}</span></h3><ul className="people-list">{selectedEpisode.cast.map((person, index) => <li key={index}><span>{person.name}</span><small>{person.character || "Character not specified"}</small></li>)}</ul></section>}
          {selectedEpisode.credits.length > 0 && <section className="detail-section"><h3>Production credits</h3><ul className="credits-list">{selectedEpisode.credits.map((credit, index) => <li key={index}><span>{credit.role}</span><strong>{credit.name}</strong></li>)}</ul></section>}
          {selectedEpisode.ratings.length > 0 && <section className="detail-section"><h3>Published ratings</h3><ul className="published-ratings">{selectedEpisode.ratings.map((rating, index) => <li key={index}><span>{rating.category} · {rating.source}</span><strong>{rating.value}</strong></li>)}</ul></section>}
          {selectedEpisode.sources.length > 0 && <section className="detail-section"><h3>Sources</h3>{selectedEpisode.sources.map((source) => <p key={source.url} className="source-link"><a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a></p>)}</section>}
          <div className="detail-footer"><button ref={reportButton} className="secondary-button" onClick={openReport}>Report a data issue</button><button className="primary-button" onClick={() => updateEpisode(selectedEpisode.number, { listened: !progress[String(selectedEpisode.number)]?.listened })}>{progress[String(selectedEpisode.number)]?.listened ? "✓ Listened — undo" : "Mark as listened"}</button></div>
        </section>
      </div>}

      {reportOpen && <div className="modal-backdrop report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setReportOpen(false); reportButton.current?.focus(); } }} onKeyDown={(event) => { if (event.key === "Escape") { setReportOpen(false); reportButton.current?.focus(); } }}>
        <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="close-button" onClick={() => { setReportOpen(false); reportButton.current?.focus(); }} aria-label="Close report form">×</button><div className="modal-topline">HELP IMPROVE THE CATALOGUE</div><h2 id="report-title">Report suspected missing information</h2><p className="report-intro">This creates a report file on your device. It is not submitted automatically, and your observation remains unverified until checked against a source.</p><form onSubmit={submitReport}><label className="field-label">What seems missing?<select value={reportField} onChange={(event) => setReportField(event.target.value as typeof reportField)}>{Object.entries(missingFieldLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}<option value="speaker">Speaker / actor</option><option value="character">Character / role</option><option value="other">Other / search returned no match</option></select></label><label className="field-label">Additional details<textarea value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} rows={4} placeholder="What did you expect to find? Add a source or context if you have one." /></label><div className="report-context"><strong>Included automatically</strong><span>Current query, active filters, and {reportTarget ? "episode " + String(reportTarget.number).padStart(3,"0") : "no specific episode"}.</span></div><div className="detail-footer"><button type="button" className="secondary-button" onClick={() => { setReportOpen(false); reportButton.current?.focus(); }}>Cancel</button><button type="submit" className="primary-button">Download report files</button></div></form></section>
      </div>}
    </main>
  );
}
