import { useState } from "react";
import { toast } from "sonner";
import { Braces, Copy, Check, AlertCircle, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const formatJSON = (minify = false) => {
    if (!input.trim()) {
      toast.error("Por favor ingresa JSON");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = minify 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      
      setOutput(formatted);
      setIsValid(true);
      setError("");
      
      // Calculate stats
      const keys = countKeys(parsed);
      setStats({
        keys,
        depth: getDepth(parsed),
        size: new Blob([formatted]).size,
        originalSize: new Blob([input]).size
      });
      
      toast.success(minify ? "JSON minificado!" : "JSON formateado!");
    } catch (e) {
      setIsValid(false);
      setError(e.message);
      setOutput("");
      setStats(null);
      toast.error("JSON inválido");
    }
  };

  const countKeys = (obj, count = 0) => {
    if (typeof obj !== "object" || obj === null) return count;
    if (Array.isArray(obj)) {
      return obj.reduce((acc, item) => countKeys(item, acc), count);
    }
    return Object.keys(obj).reduce((acc, key) => countKeys(obj[key], acc + 1), count);
  };

  const getDepth = (obj, depth = 0) => {
    if (typeof obj !== "object" || obj === null) return depth;
    if (Array.isArray(obj)) {
      return Math.max(...obj.map(item => getDepth(item, depth + 1)), depth + 1);
    }
    const values = Object.values(obj);
    if (values.length === 0) return depth + 1;
    return Math.max(...values.map(val => getDepth(val, depth + 1)));
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copiado al portapapeles!");
    } catch {
      toast.error("Error al copiar");
    }
  };

  const loadSample = () => {
    setInput(JSON.stringify({
      "nombre": "E1 Utility Suite",
      "version": "1.0.0",
      "utilidades": [
        { "id": 1, "nombre": "QR Generator", "activo": true },
        { "id": 2, "nombre": "URL Shortener", "activo": true },
        { "id": 3, "nombre": "JSON Formatter", "activo": true }
      ],
      "configuracion": {
        "tema": "oscuro",
        "idioma": "es",
        "opciones": {
          "autoguardado": true,
          "notificaciones": false
        }
      }
    }));
    setOutput("");
    setIsValid(null);
    setStats(null);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-400 flex items-center justify-center">
          <Braces className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
          <p className="text-muted-foreground">Formatea, valida y minifica JSON</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Entrada
                {isValid !== null && (
                  <Badge variant={isValid ? "default" : "destructive"}>
                    {isValid ? (
                      <><Check className="w-3 h-3 mr-1" /> Válido</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Inválido</>
                    )}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={loadSample} data-testid="load-sample-btn">
                Cargar Ejemplo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsValid(null);
              }}
              placeholder='{"clave": "valor"}'
              className="min-h-[300px] bg-black/20 border-white/10 font-mono text-sm"
              data-testid="json-input"
            />
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => formatJSON(false)}
                className="flex-1 h-11"
                style={{ 
                  background: "linear-gradient(135deg, hsl(45 95% 55%), hsl(25 95% 55%))",
                  boxShadow: "0 0 20px -5px hsl(45 95% 55% / 0.4)"
                }}
                data-testid="format-btn"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Formatear
              </Button>
              <Button
                onClick={() => formatJSON(true)}
                variant="outline"
                className="flex-1 h-11"
                data-testid="minify-btn"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Minificar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Salida</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyOutput}
                disabled={!output}
                data-testid="copy-json-btn"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <>
                <div 
                  className="code-preview min-h-[300px] max-h-[350px] overflow-auto mb-4"
                  data-testid="json-output"
                >
                  <pre className="text-sm whitespace-pre-wrap break-words text-yellow-400">
                    {output}
                  </pre>
                </div>
                
                {stats && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-primary">{stats.keys}</div>
                      <div className="text-xs text-muted-foreground">Claves</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-accent">{stats.depth}</div>
                      <div className="text-xs text-muted-foreground">Profundidad</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-secondary">{formatBytes(stats.originalSize)}</div>
                      <div className="text-xs text-muted-foreground">Original</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-orange-500">{formatBytes(stats.size)}</div>
                      <div className="text-xs text-muted-foreground">Resultado</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Braces className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>El JSON formateado aparecerá aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
