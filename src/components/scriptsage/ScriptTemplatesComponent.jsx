import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getTemplatesByCategory,
  scriptTemplates,
  searchTemplates,
  templateCategories,
} from "./ScriptTemplates";

export default function ScriptTemplatesComponent({ onTemplateSelect }) {
  const [selectedCategory, setSelectedCategory] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    let templates =
      selectedCategory === "All Templates"
        ? scriptTemplates
        : getTemplatesByCategory(selectedCategory);

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return Object.entries(templates);
  }, [selectedCategory, searchQuery]);

  const handleTemplateSelect = (templateKey, template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {templateCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {filteredTemplates.map(([key, template]) => (
          <Card
            key={key}
            className="hover:shadow-md transition-shadow p-2 lg:p-4"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <Badge variant="outline">{template.difficulty}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="bg-muted rounded-md p-3">
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                  {template.code.substring(0, 200)}
                  {template.code.length > 200 && "..."}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleTemplateSelect(key, template)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(template.code)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
