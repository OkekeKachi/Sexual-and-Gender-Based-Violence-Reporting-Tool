import { useRef, useState } from "react";
import { searchLocation } from "../utils/searchLocation";

function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const timeoutRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value);

    // clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length < 3) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      const data = await searchLocation(value);
      setResults(data);
    }, 400);
  };

  return (
    <div className="relative">
      <input
        className="w-full p-3 border rounded"
        placeholder="Search location..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

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