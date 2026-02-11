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
  Sparkles,
  Braces,
  Regex,
  Text,
  Code
} from "lucide-react";

const utilities = [
  {
    path: "/qr-generator",
    icon: QrCode,
    title: "QR Generator",
    description: "Genera múltiples QR codes con is.gd para URLs, texto, emails y WiFi",
    color: "from-primary to-emerald-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(142_76%_55%/0.4)]"
  },
  {
    path: "/shortlinks",
    icon: Link2,
    title: "URL Shortener",
    description: "Acorta múltiples URLs con is.gd y rastrea estadísticas",
    color: "from-accent to-blue-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(190_90%_60%/0.4)]"
  },
  {
    path: "/image-converter",
    icon: Image,
    title: "Image to WebP",
    description: "Convierte imágenes a WebP en lotes con 75% de calidad",
    color: "from-secondary to-purple-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(262_80%_65%/0.4)]"
  },
  {
    path: "/text-to-html",
    icon: FileCode,
    title: "Text to HTML",
    description: "Editor WYSIWYG con negrita, listas, enlaces y exportación HTML",
    color: "from-orange-500 to-amber-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(25_95%_55%/0.4)]"
  },
  {
    path: "/json-formatter",
    icon: Braces,
    title: "JSON Formatter",
    description: "Formatea, valida y minifica JSON con estadísticas",
    color: "from-yellow-500 to-orange-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(45_95%_55%/0.4)]"
  },
  {
    path: "/regex-tester",
    icon: Regex,
    title: "Regex Tester",
    description: "Prueba expresiones regulares con resaltado en tiempo real",
    color: "from-violet-500 to-purple-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(270_70%_55%/0.4)]"
  },
  {
    path: "/password-generator",
    icon: Key,
    title: "Password Generator",
    description: "Genera contraseñas seguras con opciones personalizables",
    color: "from-rose-500 to-pink-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(350_80%_55%/0.4)]"
  },
  {
    path: "/word-counter",
    icon: Type,
    title: "Word Counter",
    description: "Cuenta palabras, caracteres, oraciones y tiempo de lectura",
    color: "from-cyan-500 to-teal-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(180_70%_50%/0.4)]"
  },
  {
    path: "/lorem-generator",
    icon: Text,
    title: "Lorem Ipsum",
    description: "Genera texto de relleno para tus diseños y maquetas",
    color: "from-emerald-500 to-teal-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(160_70%_45%/0.4)]"
  },
  {
    path: "/code-minifier",
    icon: Code,
    title: "Code Minifier",
    description: "Minifica CSS, JavaScript y HTML para optimizar tamaño",
    color: "from-blue-500 to-indigo-400",
    bgGlow: "group-hover:shadow-[0_0_40px_-10px_hsl(220_70%_55%/0.4)]"
  },
  {
    path: "/base64",
    icon: Binary,
    title: "Base64 Encoder",
    description: "Codifica y decodifica texto a/desde formato Base64",
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
            <span>11 Herramientas Potentes en Un Solo Lugar</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            E1 Utility Suite
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu kit de herramientas todo-en-uno para tareas cotidianas. Rápido, bonito y construido con precisión.
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
                <span>Abrir</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-primary">11</div>
          <div className="text-sm text-muted-foreground">Herramientas</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-accent">100%</div>
          <div className="text-sm text-muted-foreground">Gratis</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-secondary">0</div>
          <div className="text-sm text-muted-foreground">Anuncios</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-orange-500">is.gd</div>
          <div className="text-sm text-muted-foreground">Integrado</div>
        </div>
      </section>
    </div>
  );
}
