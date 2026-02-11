import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Regex, Copy, Check, X, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [matches, setMatches] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [highlightedText, setHighlightedText] = useState("");

  useEffect(() => {
    testRegex();
  }, [pattern, testText, flags]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setHighlightedText(testText);
      setIsValid(true);
      setError("");
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join("");
      
      const regex = new RegExp(pattern, flagString);
      setIsValid(true);
      setError("");

      if (!testText) {
        setMatches([]);
        setHighlightedText("");
        return;
      }

      // Find matches
      const allMatches = [];
      let match;
      
      if (flags.g) {
        while ((match = regex.exec(testText)) !== null) {
          allMatches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          allMatches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(allMatches);

      // Create highlighted text
      if (allMatches.length > 0) {
        let result = "";
        let lastIndex = 0;
        
        allMatches.forEach((m, i) => {
          result += escapeHtml(testText.slice(lastIndex, m.index));
          result += `<mark class="bg-primary/40 text-primary-foreground px-0.5 rounded">${escapeHtml(m.value)}</mark>`;
          lastIndex = m.index + m.value.length;
        });
        result += escapeHtml(testText.slice(lastIndex));
        setHighlightedText(result);
      } else {
        setHighlightedText(escapeHtml(testText));
      }

    } catch (e) {
      setIsValid(false);
      setError(e.message);
      setMatches([]);
      setHighlightedText(escapeHtml(testText));
    }
  };

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");
  };

  const copyPattern = async () => {
    try {
      await navigator.clipboard.writeText(pattern);
      toast.success("Patrón copiado!");
    } catch {
      toast.error("Error al copiar");
    }
  };

  const loadExample = (name) => {
    const examples = {
      email: {
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        text: "Contactos: juan@ejemplo.com, maria@test.org y info@empresa.es"
      },
      phone: {
        pattern: "\\+?[0-9]{1,3}[-.\\s]?\\(?[0-9]{2,3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}",
        text: "Llámanos: +34 612 345 678 o al (91) 234-5678"
      },
      url: {
        pattern: "https?://[\\w.-]+(?:/[\\w./-]*)?",
        text: "Visita https://ejemplo.com/pagina o http://test.org"
      },
      date: {
        pattern: "\\d{2}[/-]\\d{2}[/-]\\d{4}",
        text: "Fechas: 15/01/2024, 28-02-2025, 31/12/2023"
      }
    };

    if (examples[name]) {
      setPattern(examples[name].pattern);
      setTestText(examples[name].text);
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
          <Regex className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regex Tester</h1>
          <p className="text-muted-foreground">Prueba expresiones regulares en tiempo real</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  Expresión Regular
                  {pattern && (
                    <Badge variant={isValid ? "default" : "destructive"}>
                      {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </Badge>
                  )}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyPattern}
                  disabled={!pattern}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="[a-z]+"
                  className="flex-1 h-12 bg-black/20 border-white/10 font-mono"
                  data-testid="regex-pattern"
                />
                <span className="text-muted-foreground text-lg">/</span>
                <span className="text-primary font-mono">
                  {Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join("")}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Flags */}
              <div className="flex items-center gap-4">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-g"
                    checked={flags.g}
                    onCheckedChange={(v) => setFlags({ ...flags, g: v })}
                  />
                  <Label htmlFor="flag-g" className="text-sm cursor-pointer">
                    <code>g</code> Global
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-i"
                    checked={flags.i}
                    onCheckedChange={(v) => setFlags({ ...flags, i: v })}
                  />
                  <Label htmlFor="flag-i" className="text-sm cursor-pointer">
                    <code>i</code> Insensible
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-m"
                    checked={flags.m}
                    onCheckedChange={(v) => setFlags({ ...flags, m: v })}
                  />
                  <Label htmlFor="flag-m" className="text-sm cursor-pointer">
                    <code>m</code> Multilínea
                  </Label>
                </div>
              </div>

              {/* Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Ejemplos:</span>
                {["email", "phone", "url", "date"].map((ex) => (
                  <Button
                    key={ex}
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(ex)}
                    className="capitalize"
                  >
                    {ex}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Texto de Prueba</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Escribe o pega el texto a probar..."
                className="min-h-[200px] bg-black/20 border-white/10"
                data-testid="regex-test-text"
              />
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Coincidencias
                <Badge variant="outline">{matches.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {matches.map((match, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-muted/30 rounded-lg"
                      data-testid={`match-${index}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Match #{index + 1} (índice: {match.index})
                        </span>
                      </div>
                      <code className="text-primary font-mono">{match.value}</code>
                      {match.groups.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Grupos: {match.groups.map((g, i) => (
                            <span key={i} className="ml-2 text-secondary">
                              ${i + 1}: {g || "(vacío)"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {pattern ? "Sin coincidencias" : "Ingresa un patrón para comenzar"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Texto Resaltado</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="p-4 bg-black/30 rounded-lg min-h-[200px] max-h-[300px] overflow-auto font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedText || '<span class="text-muted-foreground">El texto con coincidencias resaltadas aparecerá aquí</span>' }}
                data-testid="highlighted-text"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
