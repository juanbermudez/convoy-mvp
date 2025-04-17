import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchForm() {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search documentation..."
        className="h-9 pl-8 rounded-md"
      />
    </div>
  )
}
