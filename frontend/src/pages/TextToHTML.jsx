import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FileCode, Copy, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TextToHTML() {
  const [text, setText] = useState("");
  const [formatType, setFormatType] = useState("basic");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("code"); // code or preview

  const convertToHTML = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/text-to-html`, {
        text,
        format_type: formatType
      });
      setHtml(response.data.html);
      toast.success("Converted to HTML!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const sampleMarkdown = `# Welcome to Text to HTML

This is a **bold** and *italic* text example.

## Features
- Easy conversion
- Live preview
- Copy with one click

\`inline code\` looks like this.

\`\`\`
code blocks work too
\`\`\`

[Links](https://example.com) are supported!`;

  const sampleBasic = `Welcome to Text to HTML

This is a simple text converter.
It preserves your line breaks.

And creates paragraphs for empty lines.

Try it out!`;

  const loadSample = () => {
    setText(formatType === "markdown" ? sampleMarkdown : sampleBasic);
    setHtml("");
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
          <FileCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text to HTML</h1>
          <p className="text-muted-foreground">Convert plain text or markdown to HTML</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Input</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadSample} data-testid="load-sample-btn">
                Load Sample
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={formatType} onValueChange={setFormatType} className="tabs-bio-digital">
              <TabsList className="grid grid-cols-2 bg-muted/50">
                <TabsTrigger value="basic" data-testid="format-basic">Basic Text</TabsTrigger>
                <TabsTrigger value="markdown" data-testid="format-markdown">Markdown</TabsTrigger>
              </TabsList>
            </Tabs>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={formatType === "markdown" 
                ? "# Heading\n\n**Bold** and *italic*\n\n- List item"
                : "Enter your plain text here...\n\nParagraphs are separated by empty lines."
              }
              className="code-textarea min-h-[350px]"
              data-testid="text-input"
            />

            <Button
              onClick={convertToHTML}
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
              style={{ 
                background: "linear-gradient(135deg, hsl(25 95% 55%), hsl(45 95% 55%))",
                boxShadow: "0 0 20px -5px hsl(25 95% 55% / 0.4)"
              }}
              data-testid="convert-html-btn"
            >
              {loading ? "Converting..." : "Convert to HTML"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Output</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="code" className="h-6 px-2 text-xs" data-testid="view-code">
                      <Code className="w-3 h-3 mr-1" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="h-6 px-2 text-xs" data-testid="view-preview">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyHTML}
                  disabled={!html}
                  data-testid="copy-html-btn"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {html ? (
              viewMode === "code" ? (
                <div 
                  className="code-preview min-h-[350px] max-h-[400px] overflow-auto"
                  data-testid="html-output"
                >
                  <pre className="text-sm whitespace-pre-wrap break-words text-green-400">
                    {html}
                  </pre>
                </div>
              ) : (
                <div 
                  className="bg-white text-gray-900 rounded-lg p-6 min-h-[350px] max-h-[400px] overflow-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: html }}
                  data-testid="html-preview"
                />
              )
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <FileCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>HTML output will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
