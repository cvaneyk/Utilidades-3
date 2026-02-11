import { useState } from "react";
import { toast } from "sonner";
import { Text, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
  "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
  "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident"
];

export default function LoremGenerator() {
  const [type, setType] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  const generateWord = () => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const generateSentence = (minWords = 8, maxWords = 15) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(generateWord());
    }
    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };

  const generateParagraph = (minSentences = 4, maxSentences = 8) => {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generate = () => {
    let result = "";

    switch (type) {
      case "words":
        const words = [];
        for (let i = 0; i < count; i++) {
          words.push(generateWord());
        }
        result = words.join(" ");
        break;

      case "sentences":
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(" ");
        break;

      case "paragraphs":
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join("\n\n");
        break;
    }

    // Start with "Lorem ipsum..." if enabled
    if (startWithLorem && result.length > 0) {
      const loremStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
      if (type === "words") {
        const loremWords = loremStart.trim().replace(/[.,]/g, "").toLowerCase().split(" ");
        const remainingCount = Math.max(0, count - loremWords.length);
        const remaining = [];
        for (let i = 0; i < remainingCount; i++) {
          remaining.push(generateWord());
        }
        result = [...loremWords.slice(0, count), ...remaining].slice(0, count).join(" ");
      } else {
        result = loremStart + result.slice(result.indexOf(" ") + 1);
      }
    }

    setOutput(result);
    toast.success("Lorem ipsum generado!");
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copiado al portapapeles!");
    } catch {
      toast.error("Error al copiar");
    }
  };

  const getMaxCount = () => {
    switch (type) {
      case "words": return 500;
      case "sentences": return 50;
      case "paragraphs": return 20;
      default: return 10;
    }
  };

  const getCountLabel = () => {
    switch (type) {
      case "words": return "palabras";
      case "sentences": return "oraciones";
      case "paragraphs": return "párrafos";
      default: return "";
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
          <Text className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
          <p className="text-muted-foreground">Genera texto de relleno para tus diseños</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Options */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Opciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div>
              <Label className="mb-3 block">Tipo de generación</Label>
              <Tabs value={type} onValueChange={setType}>
                <TabsList className="grid grid-cols-3 bg-muted/50">
                  <TabsTrigger value="paragraphs" data-testid="type-paragraphs">Párrafos</TabsTrigger>
                  <TabsTrigger value="sentences" data-testid="type-sentences">Oraciones</TabsTrigger>
                  <TabsTrigger value="words" data-testid="type-words">Palabras</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Count Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Cantidad</Label>
                <span className="text-lg font-bold text-primary">
                  {count} {getCountLabel()}
                </span>
              </div>
              <Slider
                value={[count]}
                onValueChange={(v) => setCount(v[0])}
                min={1}
                max={getMaxCount()}
                step={1}
                data-testid="count-slider"
                className="py-2"
              />
            </div>

            {/* Start with Lorem */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label className="cursor-pointer">Empezar con "Lorem ipsum..."</Label>
                <p className="text-xs text-muted-foreground">Texto clásico al inicio</p>
              </div>
              <Switch
                checked={startWithLorem}
                onCheckedChange={setStartWithLorem}
                data-testid="toggle-lorem-start"
              />
            </div>

            <Button
              onClick={generate}
              className="w-full h-12 text-lg font-semibold"
              style={{ 
                background: "linear-gradient(135deg, hsl(160 70% 45%), hsl(180 70% 45%))",
                boxShadow: "0 0 20px -5px hsl(160 70% 45% / 0.4)"
              }}
              data-testid="generate-btn"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Generar Lorem Ipsum
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resultado</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyOutput}
                disabled={!output}
                data-testid="copy-lorem-btn"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <div 
                className="p-4 bg-black/30 rounded-lg min-h-[200px] max-h-[400px] overflow-auto whitespace-pre-wrap leading-relaxed"
                data-testid="lorem-output"
              >
                {output}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Text className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>El texto generado aparecerá aquí</p>
              </div>
            )}

            {output && (
              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <span>{output.split(/\s+/).length} palabras</span>
                <span>{output.length} caracteres</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
