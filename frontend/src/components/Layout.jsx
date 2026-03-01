import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  QrCode,
  Link2,
  Image,
  FileCode,
  Key,
  Type,
  Binary,
  Home,
  Zap,
  Menu,
  X,
  Braces,
  Regex,
  Text,
  Code
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/qr-generator", icon: QrCode, label: "QR Generator" },
  { path: "/shortlinks", icon: Link2, label: "Shortlinks" },
  { path: "/image-converter", icon: Image, label: "Image to WebP" },
  { path: "/text-to-html", icon: FileCode, label: "Text to HTML" },
  { path: "/password-generator", icon: Key, label: "Password Gen" },
  { path: "/word-counter", icon: Type, label: "Word Counter" },
  { path: "/base64", icon: Binary, label: "Base64" },
  { path: "/json-formatter", icon: Braces, label: "JSON Formatter" },
  { path: "/regex-tester", icon: Regex, label: "Regex Tester" },
  { path: "/lorem-generator", icon: Text, label: "Lorem Ipsum" },
  { path: "/code-minifier", icon: Code, label: "Code Minifier" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl fixed left-0 top-0 z-40 flex-col">
        <div className="p-6 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CV Utilities</h1>
              <p className="text-xs text-muted-foreground">Suite</p>
            </div>
          </NavLink>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-white/5">
          <div className="text-xs text-muted-foreground text-center">
            11 herramientas disponibles
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">CV Utilities</span>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="mobile-menu-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-card border-r border-white/10 z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CV Utilities</h1>
              <p className="text-xs text-muted-foreground">Suite</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-88px)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="main-content pt-[60px] lg:pt-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
