import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link2, Copy, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shortlinks() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortlinks, setShortlinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShortlinks();
  }, []);

  const fetchShortlinks = async () => {
    try {
      const response = await axios.get(`${API}/shortlinks`);
      setShortlinks(response.data);
    } catch (error) {
      console.error("Failed to fetch shortlinks:", error);
    }
  };

  const createShortlink = async () => {
    if (!originalUrl) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/shortlinks/create`, {
        original_url: originalUrl,
        custom_slug: customSlug || null
      });
      
      setShortlinks([response.data, ...shortlinks]);
      setOriginalUrl("");
      setCustomSlug("");
      toast.success("Shortlink created!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create shortlink");
    } finally {
      setLoading(false);
    }
  };

  const deleteShortlink = async (id) => {
    try {
      await axios.delete(`${API}/shortlinks/${id}`);
      setShortlinks(shortlinks.filter(sl => sl.id !== id));
      toast.success("Shortlink deleted");
    } catch (error) {
      toast.error("Failed to delete shortlink");
    }
  };

  const copyShortlink = async (shortCode) => {
    const fullUrl = `${process.env.REACT_APP_BACKEND_URL}/api/shortlinks/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">URL Shortener</h1>
          <p className="text-muted-foreground">Create and track shortened links</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Create Form */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Create Shortlink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="original-url">Original URL</Label>
              <Input
                id="original-url"
                data-testid="original-url-input"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                className="mt-1.5 h-12 bg-black/20 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="custom-slug">Custom Slug (optional)</Label>
              <Input
                id="custom-slug"
                data-testid="custom-slug-input"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-link"
                className="mt-1.5 h-12 bg-black/20 border-white/10"
              />
            </div>
            <Button 
              onClick={createShortlink} 
              disabled={loading}
              className="w-full h-12 text-lg font-semibold glow-accent"
              style={{ "--tw-shadow-color": "hsl(190 90% 60% / 0.3)" }}
              data-testid="create-shortlink-btn"
            >
              {loading ? "Creating..." : "Shorten URL"}
            </Button>
          </CardContent>
        </Card>

        {/* Shortlinks History */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Your Shortlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shortlinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No shortlinks yet. Create your first one above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shortlinks.map((link) => (
                  <div 
                    key={link.id}
                    className="p-4 bg-muted/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    data-testid={`shortlink-item-${link.short_code}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="shortlink-url truncate" data-testid={`short-code-${link.short_code}`}>
                            /{link.short_code}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {link.clicks} clicks
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.original_url}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Created {formatDate(link.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyShortlink(link.short_code)}
                          data-testid={`copy-btn-${link.short_code}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a 
                            href={link.original_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            data-testid={`visit-btn-${link.short_code}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteShortlink(link.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-testid={`delete-btn-${link.short_code}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
