import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Key, Copy, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import config from "@/config";

const API = config.API_URL;

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePassword();
  }, []);

  const generatePassword = async () => {
    if (!uppercase && !lowercase && !numbers && !symbols) {
      toast.error("Select at least one character type");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/password/generate`, {
        length,
        uppercase,
        lowercase,
        numbers,
        symbols
      });
      setPassword(response.data.password);
      setStrength(response.data.strength);
      setCopied(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Password copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case "strong":
        return "bg-primary";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-destructive";
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case "strong":
        return "100%";
      case "medium":
        return "66%";
      default:
        return "33%";
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Password Generator</h1>
          <p className="text-muted-foreground">Create secure, random passwords</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Password Display */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div
              className="password-display mb-4 relative group"
              data-testid="password-display"
            >
              {password || "Click generate to create password"}
            </div>

            {/* Strength Meter */}
            {password && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Strength</span>
                  <span className={`font-medium capitalize ${strength === "strong" ? "text-primary" :
                      strength === "medium" ? "text-yellow-500" : "text-destructive"
                    }`}>
                    {strength}
                  </span>
                </div>
                <div className="strength-meter">
                  <div
                    className={`strength-meter-fill ${getStrengthColor()}`}
                    style={{ width: getStrengthWidth() }}
                    data-testid="strength-meter"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={generatePassword}
                disabled={loading}
                className="flex-1 h-12 font-semibold"
                style={{
                  background: "linear-gradient(135deg, hsl(350 80% 55%), hsl(330 80% 55%))",
                  boxShadow: "0 0 20px -5px hsl(350 80% 55% / 0.4)"
                }}
                data-testid="generate-password-btn"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Generating..." : "Generate New"}
              </Button>
              <Button
                onClick={copyPassword}
                disabled={!password}
                variant="outline"
                className="h-12"
                data-testid="copy-password-btn"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Length Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Password Length</Label>
                <span className="text-lg font-bold text-primary">{length}</span>
              </div>
              <Slider
                value={[length]}
                onValueChange={(v) => setLength(v[0])}
                min={4}
                max={64}
                step={1}
                onValueCommit={() => generatePassword()}
                data-testid="length-slider"
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            {/* Character Type Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
                <Switch
                  id="uppercase"
                  checked={uppercase}
                  onCheckedChange={(checked) => {
                    setUppercase(checked);
                    setTimeout(generatePassword, 100);
                  }}
                  data-testid="toggle-uppercase"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
                <Switch
                  id="lowercase"
                  checked={lowercase}
                  onCheckedChange={(checked) => {
                    setLowercase(checked);
                    setTimeout(generatePassword, 100);
                  }}
                  data-testid="toggle-lowercase"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
                <Switch
                  id="numbers"
                  checked={numbers}
                  onCheckedChange={(checked) => {
                    setNumbers(checked);
                    setTimeout(generatePassword, 100);
                  }}
                  data-testid="toggle-numbers"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$)</Label>
                <Switch
                  id="symbols"
                  checked={symbols}
                  onCheckedChange={(checked) => {
                    setSymbols(checked);
                    setTimeout(generatePassword, 100);
                  }}
                  data-testid="toggle-symbols"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
