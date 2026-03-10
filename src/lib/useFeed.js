import { useState, useEffect } from "react";
import { STORIES } from "./data";

const CATEGORIES = ["nature", "discover", "community", "wellness", "world", "politics", "local", "ideas"];

export function useFeed(category = "all", refreshKey = 0) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);

    // When category is "all", fetch all 8 categories in parallel so the
    // frontend can filter by prefs.categories correctly.
    const fetches = category === "all"
      ? CATEGORIES.map(cat =>
          fetch(`/api/feed?category=${cat}`)
            .then(r => { if (!r.ok) throw new Error(`Feed API ${r.status}`); return r.json(); })
            .then(d => d.stories || [])
            .catch(() => [])
        )
      : [
          fetch(`/api/feed?category=${encodeURIComponent(category)}`)
            .then(r => { if (!r.ok) throw new Error(`Feed API ${r.status}`); return r.json(); })
            .then(d => d.stories || [])
        ];

    Promise.all(fetches)
      .then(results => {
        const merged = results.flat();
        if (merged.length > 0) {
          setStories(merged);
          setError(null);
        }
      })
      .catch(e => { setError(e); setStories(STORIES); })
      .finally(() => setLoading(false));
  }, [category, refreshKey]);

  return { stories, loading, error };
}
