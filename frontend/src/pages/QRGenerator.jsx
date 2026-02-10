import { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { QrCode, Download, Copy, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QRGenerator() {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("url");
  const [fgColor, setFgColor] = useState("#22c55e");
  const [bgColor, setBgColor] = useState("#0a0a0c");
  const [size, setSize] = useState(256);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  // WiFi fields
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");

  const getFormattedContent = () => {
    switch (contentType) {
      case "email":
        return `mailto:${content}`;
      case "phone":
        return `tel:${content}`;
      case "wifi":
        return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
      default:
        return content;
    }
  };

  const generateQR = async () => {
    if (!content && contentType !== "wifi") {
      toast.error("Please enter content");
      return;
    }
    if (contentType === "wifi" && !wifiSSID) {
      toast.error("Please enter WiFi SSID");
      return;
    }

    setLoading(true);
    try {
      const requestContent = contentType === "wifi" 
        ? `${wifiSSID},${wifiPassword},${wifiEncryption}`
        : content;

      const response = await axios.post(`${API}/qr/generate`, {
        content: requestContent,
        content_type: contentType,
        fg_color: fgColor,
        bg_color: bgColor,
        size: size
      });
      
      setQrData(response.data);
      toast.success("QR code generated!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;
    
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = `data:image/png;base64,${qrData.image_base64}`;
    link.click();
    toast.success("QR code downloaded!");
  };

  const copyToClipboard = async () => {
    if (!qrData) return;
    
    try {
      const response = await fetch(`data:image/png;base64,${qrData.image_base64}`);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const renderContentInput = () => {
    switch (contentType) {
      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                data-testid="wifi-ssid-input"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="MyWiFiNetwork"
                className="mt-1.5 h-12 bg-black/20 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                data-testid="wifi-password-input"
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Password"
                className="mt-1.5 h-12 bg-black/20 border-white/10"
              />
            </div>
            <div>
              <Label>Encryption</Label>
              <div className="flex gap-2 mt-1.5">
                {["WPA", "WEP", "nopass"].map((enc) => (
                  <Button
                    key={enc}
                    variant={wifiEncryption === enc ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWifiEncryption(enc)}
                    data-testid={`wifi-enc-${enc}`}
                  >
                    {enc === "nopass" ? "None" : enc}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <Label htmlFor="content">
              {contentType === "url" && "URL"}
              {contentType === "text" && "Text"}
              {contentType === "email" && "Email Address"}
              {contentType === "phone" && "Phone Number"}
            </Label>
            <Input
              id="content"
              data-testid="qr-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === "url" ? "https://example.com" :
                contentType === "email" ? "email@example.com" :
                contentType === "phone" ? "+1234567890" :
                "Enter your text..."
              }
              className="mt-1.5 h-12 bg-black/20 border-white/10"
            />
          </div>
        );
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Generator</h1>
          <p className="text-muted-foreground">Create customizable QR codes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={contentType} onValueChange={setContentType} className="tabs-bio-digital">
              <TabsList className="grid grid-cols-5 bg-muted/50">
                <TabsTrigger value="url" data-testid="tab-url">URL</TabsTrigger>
                <TabsTrigger value="text" data-testid="tab-text">Text</TabsTrigger>
                <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
                <TabsTrigger value="phone" data-testid="tab-phone">Phone</TabsTrigger>
                <TabsTrigger value="wifi" data-testid="tab-wifi">WiFi</TabsTrigger>
              </TabsList>
            </Tabs>

            {renderContentInput()}

            {/* Color Customization */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Palette className="w-4 h-4 text-primary" />
                <span>Color Customization</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fg-color">Foreground</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="color"
                      id="fg-color"
                      data-testid="fg-color-input"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 h-10 bg-black/20 border-white/10 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bg-color">Background</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="color"
                      id="bg-color"
                      data-testid="bg-color-input"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 h-10 bg-black/20 border-white/10 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Size Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Size</Label>
                <span className="text-sm text-muted-foreground">{size}px</span>
              </div>
              <Slider
                value={[size]}
                onValueChange={(v) => setSize(v[0])}
                min={128}
                max={512}
                step={8}
                data-testid="size-slider"
                className="py-2"
              />
            </div>

            <Button 
              onClick={generateQR} 
              disabled={loading}
              className="w-full h-12 text-lg font-semibold glow-primary"
              data-testid="generate-qr-btn"
            >
              {loading ? "Generating..." : "Generate QR Code"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            {qrData ? (
              <div className="space-y-6 text-center">
                <div 
                  className="inline-block p-4 rounded-xl"
                  style={{ backgroundColor: bgColor }}
                  data-testid="qr-preview"
                >
                  <img 
                    src={`data:image/png;base64,${qrData.image_base64}`}
                    alt="QR Code"
                    style={{ width: size, height: size }}
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={downloadQR} data-testid="download-qr-btn">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard} data-testid="copy-qr-btn">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Your QR code will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
