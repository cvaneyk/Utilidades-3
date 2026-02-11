import { useState } from "react";
import { toast } from "sonner";
import { Code, Copy, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CodeMinifier() {
  const [codeType, setCodeType] = useState("css");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState(null);

  const minifyCSS = (css) => {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Remove whitespace around special characters
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      // Remove unnecessary semicolons
      .replace(/;}/g, "}")
      // Remove newlines and multiple spaces
      .replace(/\s+/g, " ")
      // Remove leading/trailing whitespace
      .trim();
  };

  const minifyJS = (js) => {
    // Basic JS minification (not as aggressive as terser, but functional)
    return js
      // Remove single-line comments (but not URLs)
      .replace(/(?<!:)\/\/.*$/gm, "")
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Remove whitespace around operators
      .replace(/\s*([=+\-*/<>!&|?:;,{}()[\]])\s*/g, "$1")
      // Remove multiple spaces
      .replace(/\s+/g, " ")
      // Remove newlines
      .replace(/\n/g, "")
      // Fix spacing after keywords
      .replace(/(if|else|for|while|return|function|var|let|const|new)(\S)/g, "$1 $2")
      .trim();
  };

  const minifyHTML = (html) => {
    return html
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove whitespace between tags
      .replace(/>\s+</g, "><")
      // Remove multiple spaces
      .replace(/\s+/g, " ")
      // Remove spaces around = in attributes
      .replace(/\s*=\s*/g, "=")
      .trim();
  };

  const minify = () => {
    if (!input.trim()) {
      toast.error("Por favor ingresa código");
      return;
    }

    try {
      let minified;
      switch (codeType) {
        case "css":
          minified = minifyCSS(input);
          break;
        case "js":
          minified = minifyJS(input);
          break;
        case "html":
          minified = minifyHTML(input);
          break;
        default:
          minified = input;
      }

      setOutput(minified);
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = originalSize - minifiedSize;
      const percentage = ((savings / originalSize) * 100).toFixed(1);

      setStats({
        originalSize,
        minifiedSize,
        savings,
        percentage
      });

      toast.success(`Código minificado! Ahorro: ${percentage}%`);
    } catch (e) {
      toast.error("Error al minificar: " + e.message);
    }
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
    const samples = {
      css: `/* Main styles */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.button:hover {
    background-color: #2980b9;
}`,
      js: `// Utility functions
function calculateTotal(items) {
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    
    return total;
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};`,
      html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/about">Acerca</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <h1>Bienvenido</h1>
        <p>Este es un ejemplo de HTML.</p>
    </main>
</body>
</html>`
    };

    setInput(samples[codeType]);
    setOutput("");
    setStats(null);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center">
          <Code className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minificador de Código</h1>
          <p className="text-muted-foreground">Minifica CSS, JavaScript y HTML</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Código Original</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadSample} data-testid="load-sample-btn">
                Cargar Ejemplo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={codeType} onValueChange={(v) => { setCodeType(v); setOutput(""); setStats(null); }}>
              <TabsList className="grid grid-cols-3 bg-muted/50">
                <TabsTrigger value="css" data-testid="type-css">CSS</TabsTrigger>
                <TabsTrigger value="js" data-testid="type-js">JavaScript</TabsTrigger>
                <TabsTrigger value="html" data-testid="type-html">HTML</TabsTrigger>
              </TabsList>
            </Tabs>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pega tu código ${codeType.toUpperCase()} aquí...`}
              className="min-h-[300px] bg-black/20 border-white/10 font-mono text-sm"
              data-testid="code-input"
            />

            <Button
              onClick={minify}
              className="w-full h-12 text-lg font-semibold"
              style={{ 
                background: "linear-gradient(135deg, hsl(220 70% 55%), hsl(250 70% 55%))",
                boxShadow: "0 0 20px -5px hsl(220 70% 55% / 0.4)"
              }}
              data-testid="minify-btn"
            >
              <Minimize2 className="w-5 h-5 mr-2" />
              Minificar {codeType.toUpperCase()}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Código Minificado</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyOutput}
                disabled={!output}
                data-testid="copy-code-btn"
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
                  data-testid="code-output"
                >
                  <pre className="text-sm whitespace-pre-wrap break-all text-blue-400">
                    {output}
                  </pre>
                </div>
                
                {stats && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-muted-foreground">{formatBytes(stats.originalSize)}</div>
                      <div className="text-xs text-muted-foreground">Original</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-primary">{formatBytes(stats.minifiedSize)}</div>
                      <div className="text-xs text-muted-foreground">Minificado</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-accent">{formatBytes(stats.savings)}</div>
                      <div className="text-xs text-muted-foreground">Ahorro</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-secondary">{stats.percentage}%</div>
                      <div className="text-xs text-muted-foreground">Reducción</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>El código minificado aparecerá aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
