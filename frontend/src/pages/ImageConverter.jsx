import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Image, Upload, Download, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ImageConverter() {
  const [files, setFiles] = useState([]);
  const [convertedImages, setConvertedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("image/")
    );
    
    if (droppedFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [files.length]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertImages = async () => {
    if (files.length === 0) {
      toast.error("Please add some images");
      return;
    }

    setLoading(true);
    setConvertedImages([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });

      const response = await axios.post(`${API}/images/convert-to-webp`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setConvertedImages(response.data.images);
      
      const successCount = response.data.images.filter(img => img.success).length;
      if (successCount === files.length) {
        toast.success(`All ${successCount} images converted!`);
      } else {
        toast.warning(`${successCount} of ${files.length} images converted`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadSingle = (image) => {
    const link = document.createElement("a");
    link.download = image.new_name;
    link.href = `data:image/webp;base64,${image.webp_base64}`;
    link.click();
  };

  const downloadAll = async () => {
    const successful = convertedImages.filter(img => img.success);
    if (successful.length === 0) {
      toast.error("No images to download");
      return;
    }

    if (successful.length === 1) {
      downloadSingle(successful[0]);
      return;
    }

    const zip = new JSZip();
    successful.forEach(img => {
      const data = atob(img.webp_base64);
      const bytes = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        bytes[i] = data.charCodeAt(i);
      }
      zip.file(img.new_name, bytes);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "converted-images.zip");
    toast.success("Downloaded as ZIP!");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-purple-400 flex items-center justify-center">
          <Image className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image to WebP</h1>
          <p className="text-muted-foreground">Convert images in batches (max 10, 5MB each)</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Drop Zone */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div
              className={`drop-zone cursor-pointer ${dragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              data-testid="drop-zone"
            >
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-input"
              />
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, JPEG, GIF, BMP supported
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Selected Files ({files.length}/10)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  data-testid="clear-files-btn"
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className="file-item"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    data-testid={`remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                onClick={convertImages}
                disabled={loading}
                className="w-full mt-4 h-12 text-lg font-semibold glow-secondary"
                style={{ "--tw-shadow-color": "hsl(262 80% 65% / 0.3)" }}
                data-testid="convert-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  `Convert ${files.length} Image${files.length > 1 ? "s" : ""}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {convertedImages.length > 0 && (
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Converted Images</span>
                <Button onClick={downloadAll} data-testid="download-all-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {convertedImages.map((img, index) => (
                <div 
                  key={index}
                  className={`file-item ${img.success ? "success" : "error"}`}
                  data-testid={`result-item-${index}`}
                >
                  <div className="flex items-center gap-3">
                    {img.success ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {img.success ? img.new_name : img.original_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {img.success ? formatSize(img.size_bytes) : img.error}
                      </p>
                    </div>
                  </div>
                  {img.success && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadSingle(img)}
                      data-testid={`download-single-${index}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
