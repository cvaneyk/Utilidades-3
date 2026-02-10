import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import QRGenerator from "@/pages/QRGenerator";
import Shortlinks from "@/pages/Shortlinks";
import ImageConverter from "@/pages/ImageConverter";
import TextToHTML from "@/pages/TextToHTML";
import PasswordGenerator from "@/pages/PasswordGenerator";
import WordCounter from "@/pages/WordCounter";
import Base64Tool from "@/pages/Base64Tool";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="qr-generator" element={<QRGenerator />} />
            <Route path="shortlinks" element={<Shortlinks />} />
            <Route path="image-converter" element={<ImageConverter />} />
            <Route path="text-to-html" element={<TextToHTML />} />
            <Route path="password-generator" element={<PasswordGenerator />} />
            <Route path="word-counter" element={<WordCounter />} />
            <Route path="base64" element={<Base64Tool />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
