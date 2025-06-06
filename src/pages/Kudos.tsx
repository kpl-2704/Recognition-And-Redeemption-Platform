import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KudosCard } from "@/components/kudos/KudosCard";
import { useUIStore } from "@/stores/useUIStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUserStore } from "@/stores/useUserStore";
import { Heart, Search, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Kudos() {
  const { setCurrentPage, openKudosModal } = useUIStore();
  const { kudos, tags } = useKudosStore();
  const { currentUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    setCurrentPage("kudos");
  }, [setCurrentPage]);

  // Filter kudos based on search query, tag, and filter type
  const filteredKudos = kudos.filter((kudos) => {
    const matchesSearch =
      kudos.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kudos.fromUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kudos.toUser.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === "all" || kudos.tags.some((tag) => tag.id === selectedTag);

    const matchesFilter =
      filterType === "all" ||
      (filterType === "received" && kudos.toUserId === currentUser?.id) ||
      (filterType === "sent" && kudos.fromUserId === currentUser?.id) ||
      (filterType === "public" && kudos.isPublic);

    return matchesSearch && matchesTag && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Kudos</h1>
          <p className="text-gray-600 mt-2">
            Browse and celebrate team achievements
          </p>
        </div>
        <Button onClick={openKudosModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Give Kudos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{kudos.length}</p>
            <p className="text-sm text-gray-600">Total Kudos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-blue-500 mx-auto mb-2 fill-current" />
            <p className="text-2xl font-bold text-gray-900">
              {kudos.filter((k) => k.toUserId === currentUser?.id).length}
            </p>
            <p className="text-sm text-gray-600">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {kudos.filter((k) => k.fromUserId === currentUser?.id).length}
            </p>
            <p className="text-sm text-gray-600">Given</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">94%</p>
            <p className="text-sm text-gray-600">Public</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search kudos, people, or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <span>{tag.emoji}</span>
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kudos</SelectItem>
                <SelectItem value="received">Received by Me</SelectItem>
                <SelectItem value="sent">Sent by Me</SelectItem>
                <SelectItem value="public">Public Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedTag !== "all" || filterType !== "all") && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedTag !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Tag: {tags.find((t) => t.id === selectedTag)?.emoji}{" "}
                  {tags.find((t) => t.id === selectedTag)?.name}
                  <button
                    onClick={() => setSelectedTag("all")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Type: {filterType}
                  <button
                    onClick={() => setFilterType("all")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("all");
                  setFilterType("all");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kudos List */}
      <div className="space-y-4">
        {filteredKudos.length > 0 ? (
          filteredKudos.map((kudos) => (
            <KudosCard key={kudos.id} kudos={kudos} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedTag !== "all" || filterType !== "all"
                  ? "No kudos match your filters"
                  : "No kudos yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedTag !== "all" || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to give kudos to a team member!"}
              </p>
              <Button onClick={openKudosModal} className="gap-2">
                <Plus className="w-4 h-4" />
                Give First Kudos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
