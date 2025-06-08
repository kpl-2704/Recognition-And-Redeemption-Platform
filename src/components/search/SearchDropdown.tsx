import { useSearchStore, SearchResult } from "@/stores/useSearchStore";
import { User, Users, MessageCircle, Heart } from "lucide-react";

interface SearchDropdownProps {
  isOpen: boolean;
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

export function SearchDropdown({
  isOpen,
  results,
  onResultClick,
}: SearchDropdownProps) {
  if (!isOpen) return null;

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-blue-500" />;
      case "kudos":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "feedback":
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "user":
        return "Person";
      case "kudos":
        return "Kudos";
      case "feedback":
        return "Feedback";
      default:
        return "Item";
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {results.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No results found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try searching for people, kudos, or feedback
          </p>
        </div>
      ) : (
        <div className="py-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
            {results.length} Result{results.length !== 1 ? "s" : ""}
          </div>
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultClick(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {result.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
