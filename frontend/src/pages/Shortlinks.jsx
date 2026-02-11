import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link2, Copy, Trash2, ExternalLink, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shortlinks() {
  const [urlsText, setUrlsText] = useState("");
  const [useIsgd, setUseIsgd] = useState(true);
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
      console.error("Error al cargar shortlinks:", error);
    }
  };

  const createShortlinks = async () => {
    // Parse URLs from textarea (one per line)
    const urls = urlsText
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast.error("Por favor ingresa al menos una URL");
      return;
    }

    if (urls.length > 20) {
      toast.error("Máximo 20 URLs a la vez");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/shortlinks/create`, {
        urls,
        use_isgd: useIsgd
      });
      
      // Add new shortlinks to the top of the list
      setShortlinks([...response.data.results, ...shortlinks]);
      setUrlsText("");
      
      if (response.data.error_count > 0) {
        toast.warning(`${response.data.success_count} creados, ${response.data.error_count} errores`);
      } else {
        toast.success(`${response.data.success_count} shortlink(s) creados!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al crear shortlinks");
    } finally {
      setLoading(false);
    }
  };

  const deleteShortlink = async (id) => {
    try {
      await axios.delete(`${API}/shortlinks/${id}`);
      setShortlinks(shortlinks.filter(sl => sl.id !== id));
      toast.success("Shortlink eliminado");
    } catch (error) {
      toast.error("Error al eliminar shortlink");
    }
  };

  const copyShortlink = async (link) => {
    const urlToCopy = link.short_url || `${process.env.REACT_APP_BACKEND_URL}/api/shortlinks/${link.short_code}`;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success("Copiado al portapapeles!");
    } catch {
      toast.error("Error al copiar");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getDisplayUrl = (link) => {
    if (link.short_url) {
      return link.short_url;
    }
    return `/${link.short_code}`;
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acortador de URLs</h1>
          <p className="text-muted-foreground">Acorta múltiples URLs con is.gd</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Create Form */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Crear Shortlinks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="urls-input">URLs (una por línea)</Label>
              <Textarea
                id="urls-input"
                data-testid="urls-input"
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                placeholder={`https://ejemplo.com/pagina-muy-larga-1
https://ejemplo.com/pagina-muy-larga-2
https://ejemplo.com/pagina-muy-larga-3`}
                className="mt-1.5 min-h-[150px] bg-black/20 border-white/10 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 20 URLs a la vez
              </p>
            </div>

            {/* is.gd Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label className="cursor-pointer">Usar is.gd</Label>
                <p className="text-xs text-muted-foreground">URLs más cortas con is.gd</p>
              </div>
              <Switch
                checked={useIsgd}
                onCheckedChange={setUseIsgd}
                data-testid="toggle-isgd"
              />
            </div>

            <Button 
              onClick={createShortlinks} 
              disabled={loading}
              className="w-full h-12 text-lg font-semibold glow-accent"
              style={{ "--tw-shadow-color": "hsl(190 90% 60% / 0.3)" }}
              data-testid="create-shortlinks-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Acortar URLs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Shortlinks History */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Tus Shortlinks
              <Badge variant="outline">{shortlinks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shortlinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No hay shortlinks aún. Crea el primero arriba!</p>
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span 
                            className="shortlink-url truncate cursor-pointer hover:text-primary transition-colors" 
                            onClick={() => copyShortlink(link)}
                            title="Click para copiar"
                          >
                            {getDisplayUrl(link)}
                          </span>
                          <Badge 
                            variant={link.provider === "isgd" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {link.provider === "isgd" ? "is.gd" : "local"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {link.clicks} clicks
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.original_url}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Creado {formatDate(link.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyShortlink(link)}
                          data-testid={`copy-btn-${link.short_code}`}
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Visitar original"
                        >
                          <a 
                            href={link.original_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
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
                          title="Eliminar"
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
