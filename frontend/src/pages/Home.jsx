import { Link } from "react-router-dom";
import { 
  QrCode, 
  Link2, 
  Image, 
  FileCode, 
  Key, 
  Type, 
  Binary,
  ArrowRight,
  Sparkles
} from "lucide-react";

const utilities = [
  {
    path: "/qr-generator",
    icon: QrCode,
    title: "QR Generator",
    description: "Create customizable QR codes for URLs, text, emails, phones, and WiFi",
    color: "from-primary to-emerald-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(142_76%_55%/0.4)]"
  },
  {
    path: "/shortlinks",
    icon: Link2,
    title: "URL Shortener",
    description: "Shorten long URLs and track click statistics",
    color: "from-accent to-blue-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(190_90%_60%/0.4)]"
  },
  {
    path: "/image-converter",
    icon: Image,
    title: "Image to WebP",
    description: "Convert images to WebP format in batches for better compression",
    color: "from-secondary to-purple-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(262_80%_65%/0.4)]"
  },
  {
    path: "/text-to-html",
    icon: FileCode,
    title: "Text to HTML",
    description: "Convert plain text or markdown to clean HTML code",
    color: "from-orange-500 to-amber-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(25_95%_55%/0.4)]"
  },
  {
    path: "/password-generator",
    icon: Key,
    title: "Password Generator",
    description: "Generate secure passwords with customizable options",
    color: "from-rose-500 to-pink-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(350_80%_55%/0.4)]"
  },
  {
    path: "/word-counter",
    icon: Type,
    title: "Word Counter",
    description: "Count words, characters, sentences, and estimate reading time",
    color: "from-cyan-500 to-teal-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(180_70%_50%/0.4)]"
  },
  {
    path: "/base64",
    icon: Binary,
    title: "Base64 Encoder",
    description: "Encode and decode text to/from Base64 format",
    color: "from-lime-500 to-green-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(85_70%_50%/0.4)]"
  }
];

export default function Home() {
  return (
    <div className="animate-in space-y-12">
      {/* Hero Section */}
      <section className="hero-gradient rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(142_76%_55%/0.05)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>7 Powerful Tools in One Place</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            E1 Utility Suite
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one toolkit for everyday tasks. Fast, beautiful, and built with precision.
          </p>
        </div>
      </section>

      {/* Utilities Grid */}
      <section data-testid="utilities-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {utilities.map((utility, index) => (
            <Link
              key={utility.path}
              to={utility.path}
              data-testid={`utility-card-${utility.path.replace("/", "")}`}
              className={`utility-card group ${utility.bgGlow}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${utility.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <utility.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{utility.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{utility.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-primary">7</div>
          <div className="text-sm text-muted-foreground">Tools Available</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-accent">100%</div>
          <div className="text-sm text-muted-foreground">Free to Use</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-secondary">0</div>
          <div className="text-sm text-muted-foreground">Ads or Tracking</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-orange-500">Fast</div>
          <div className="text-sm text-muted-foreground">Processing</div>
        </div>
      </section>
    </div>
  );
}
