import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QrCode, Download, Plus, Trash2, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QRGenerator() {
  const [items, setItems] = useState([{ content: "", content_type: "url" }]);
  const [fgColor, setFgColor] = useState("#22c55e");
  const [bgColor, setBgColor] = useState("#0a0a0c");
  const [size, setSize] = useState(256);
  const [useIsgd, setUseIsgd] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // WiFi fields (for WiFi type)
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");

  const addItem = () => {
    if (items.length >= 10) {
      toast.error("Máximo 10 QR codes a la vez");
      return;
    }
    setItems([...items, { content: "", content_type: "url" }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const generateQRCodes = async () => {
    // Filter out empty items
    const validItems = items.filter(item => {
      if (item.content_type === "wifi") {
        return wifiSSID.trim() !== "";
      }
      return item.content.trim() !== "";
    });

    if (validItems.length === 0) {
      toast.error("Por favor ingresa al menos un contenido");
      return;
    }

    setLoading(true);
    try {
      // Prepare items - handle WiFi specially
      const preparedItems = validItems.map(item => {
        if (item.content_type === "wifi") {
          return {
            content: `${wifiSSID},${wifiPassword},${wifiEncryption}`,
            content_type: "wifi"
          };
        }
        return item;
      });

      const response = await axios.post(`${API}/qr/generate`, {
        items: preparedItems,
        fg_color: fgColor,
        bg_color: bgColor,
        size: size,
        use_isgd: useIsgd
      });
      
      setResults(response.data.results);
      const successCount = response.data.results.filter(r => r.success).length;
      toast.success(`${successCount} QR code(s) generado(s)!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al generar QR codes");
    } finally {
      setLoading(false);
    }
  };

  const downloadSingle = (result, index) => {
    const link = document.createElement("a");
    link.download = `qr-code-${index + 1}.png`;
    link.href = `data:image/png;base64,${result.image_base64}`;
    link.click();
  };

  const downloadAll = async () => {
    const successful = results.filter(r => r.success);
    if (successful.length === 0) return;

    if (successful.length === 1) {
      downloadSingle(successful[0], 0);
      return;
    }

    const zip = new JSZip();
    successful.forEach((result, index) => {
      const data = atob(result.image_base64);
      const bytes = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        bytes[i] = data.charCodeAt(i);
      }
      zip.file(`qr-code-${index + 1}.png`, bytes);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "qr-codes.zip");
    toast.success("QR codes descargados como ZIP!");
  };

  const renderContentInput = (item, index) => {
    if (item.content_type === "wifi") {
      return (
        <div className="space-y-3">
          <div>
            <Label>Red WiFi (SSID)</Label>
            <Input
              data-testid={`wifi-ssid-input-${index}`}
              value={wifiSSID}
              onChange={(e) => setWifiSSID(e.target.value)}
              placeholder="NombreDeRed"
              className="mt-1 h-11 bg-black/20 border-white/10"
            />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input
              data-testid={`wifi-password-input-${index}`}
              type="password"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="Contraseña"
              className="mt-1 h-11 bg-black/20 border-white/10"
            />
          </div>
          <div>
            <Label>Encriptación</Label>
            <div className="flex gap-2 mt-1">
              {["WPA", "WEP", "nopass"].map((enc) => (
                <Button
                  key={enc}
                  variant={wifiEncryption === enc ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWifiEncryption(enc)}
                >
                  {enc === "nopass" ? "Ninguna" : enc}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Input
        data-testid={`qr-content-input-${index}`}
        value={item.content}
        onChange={(e) => updateItem(index, "content", e.target.value)}
        placeholder={
          item.content_type === "url" ? "https://ejemplo.com" :
          item.content_type === "email" ? "correo@ejemplo.com" :
          item.content_type === "phone" ? "+34612345678" :
          "Escribe tu texto..."
        }
        className="h-11 bg-black/20 border-white/10"
      />
    );
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generador QR</h1>
          <p className="text-muted-foreground">Genera múltiples QR codes con is.gd</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contenidos ({items.length}/10)</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem} data-testid="add-qr-item">
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-xl space-y-3" data-testid={`qr-item-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">QR #{index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <Tabs 
                  value={item.content_type} 
                  onValueChange={(v) => updateItem(index, "content_type", v)}
                >
                  <TabsList className="grid grid-cols-5 bg-muted/50 h-9">
                    <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                    <TabsTrigger value="text" className="text-xs">Texto</TabsTrigger>
                    <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                    <TabsTrigger value="phone" className="text-xs">Tel</TabsTrigger>
                    <TabsTrigger value="wifi" className="text-xs">WiFi</TabsTrigger>
                  </TabsList>
                </Tabs>

                {renderContentInput(item, index)}
              </div>
            ))}

            {/* Options */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              {/* is.gd Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <Label className="cursor-pointer">Usar is.gd para URLs</Label>
                  <p className="text-xs text-muted-foreground">Acorta URLs automáticamente</p>
                </div>
                <Switch
                  checked={useIsgd}
                  onCheckedChange={setUseIsgd}
                  data-testid="toggle-isgd"
                />
              </div>

              {/* Color Customization */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="w-4 h-4 text-primary" />
                  <span>Personalización de colores</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primer plano</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        data-testid="fg-color-input"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                      />
                      <Input
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 h-10 bg-black/20 border-white/10 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Fondo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        data-testid="bg-color-input"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tamaño</Label>
                  <span className="text-sm text-muted-foreground">{size}px</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={(v) => setSize(v[0])}
                  min={128}
                  max={512}
                  step={8}
                  data-testid="size-slider"
                />
              </div>
            </div>

            <Button 
              onClick={generateQRCodes} 
              disabled={loading}
              className="w-full h-12 text-lg font-semibold glow-primary"
              data-testid="generate-qr-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                `Generar ${items.length} QR Code${items.length > 1 ? "s" : ""}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resultados</CardTitle>
              {results.filter(r => r.success).length > 1 && (
                <Button onClick={downloadAll} size="sm" data-testid="download-all-qr">
                  <Download className="w-4 h-4 mr-1" />
                  Descargar Todo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl text-center ${result.success ? "bg-muted/30" : "bg-destructive/10"}`}
                    data-testid={`qr-result-${index}`}
                  >
                    {result.success ? (
                      <>
                        <div 
                          className="inline-block p-2 rounded-lg mb-2"
                          style={{ backgroundColor: bgColor }}
                        >
                          <img 
                            src={`data:image/png;base64,${result.image_base64}`}
                            alt={`QR Code ${index + 1}`}
                            className="w-full max-w-[150px]"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2" title={result.final_content}>
                          {result.final_content.substring(0, 30)}...
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadSingle(result, index)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </Button>
                      </>
                    ) : (
                      <div className="text-destructive text-sm">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Los QR codes aparecerán aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
