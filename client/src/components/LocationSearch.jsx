import { useRef, useState } from "react";
import { searchLocation } from "../utils/searchLocation";

function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchLocation(value);
        setResults(data);
      } catch (error) {
        console.error("Location search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          className="w-full p-3 pr-10 border rounded"
          placeholder="Search location..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {loading && (
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F0FDFA] px-4 py-3 text-sm text-[#0F766E]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#99F6E4] border-t-[#0F766E]" />
            <span className="font-medium">Searching locations...</span>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute bg-white border w-full mt-1 rounded shadow z-10">
          {results.map((item, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                onSelect(item);
                setQuery(item.display);
                setResults([]);
              }}
            >
              {item.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationSearch;