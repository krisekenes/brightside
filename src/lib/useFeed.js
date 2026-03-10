import { useState, useEffect } from "react";
import { STORIES } from "./data";

export function useFeed(category = "all") {
  const [stories, setStories] = useState(STORIES);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/feed?category=${encodeURIComponent(category)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Feed API ${r.status}`);
        return r.json();
      })
      .then(d => {
        setStories(d.stories);
        setError(null);
      })
      .catch(e => {
        setError(e);
        // Keep stale stories visible on error
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { stories, loading, error };
}
