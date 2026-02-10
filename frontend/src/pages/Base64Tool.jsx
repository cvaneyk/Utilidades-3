import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Binary, Copy, ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [operation, setOperation] = useState("encode");
  const [loading, setLoading] = useState(false);

  const processBase64 = async () => {
    if (!input.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/base64`, {
        text: input,
        operation
      });
      
      if (response.data.success) {
        setOutput(response.data.result);
        toast.success(`${operation === "encode" ? "Encoded" : "Decoded"} successfully!`);
      } else {
        toast.error(response.data.error || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const swapValues = () => {
    setInput(output);
    setOutput("");
    setOperation(operation === "encode" ? "decode" : "encode");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-400 flex items-center justify-center">
          <Binary className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base64 Encoder/Decoder</h1>
          <p className="text-muted-foreground">Convert text to and from Base64</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Operation Tabs */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-4">
            <Tabs value={operation} onValueChange={setOperation} className="tabs-bio-digital">
              <TabsList className="grid grid-cols-2 bg-muted/50 w-full">
                <TabsTrigger value="encode" data-testid="tab-encode">
                  Encode (Text → Base64)
                </TabsTrigger>
                <TabsTrigger value="decode" data-testid="tab-decode">
                  Decode (Base64 → Text)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {operation === "encode" ? "Plain Text" : "Base64 String"}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                data-testid="clear-all-btn"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={operation === "encode" 
                ? "Enter plain text to encode..." 
                : "Enter Base64 string to decode..."
              }
              className="min-h-[150px] bg-black/20 border-white/10 font-mono"
              data-testid="base64-input"
            />
            <Button
              onClick={processBase64}
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
              style={{ 
                background: "linear-gradient(135deg, hsl(85 70% 50%), hsl(142 76% 55%))",
                boxShadow: "0 0 20px -5px hsl(85 70% 50% / 0.4)"
              }}
              data-testid="process-btn"
            >
              {loading ? "Processing..." : operation === "encode" ? "Encode to Base64" : "Decode from Base64"}
            </Button>
          </CardContent>
        </Card>

        {/* Swap Button */}
        {output && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={swapValues}
              className="rounded-full"
              data-testid="swap-btn"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Swap & {operation === "encode" ? "Decode" : "Encode"}
            </Button>
          </div>
        )}

        {/* Output */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {operation === "encode" ? "Base64 Result" : "Decoded Text"}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyOutput}
                disabled={!output}
                data-testid="copy-output-btn"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <div 
                className="code-preview min-h-[150px] max-h-[300px] overflow-auto"
                data-testid="base64-output"
              >
                <pre className="text-sm whitespace-pre-wrap break-all text-lime-400">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Binary className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Result will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Base64 encoding is commonly used for embedding images in CSS/HTML and transmitting binary data in text format.</p>
        </div>
      </div>
    </div>
  );
}
