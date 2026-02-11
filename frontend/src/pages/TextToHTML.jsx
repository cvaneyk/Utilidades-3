import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { toast } from "sonner";
import { 
  FileCode, Copy, Code, Eye, 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Heading1, Heading2, Quote, Undo, Redo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL del enlace:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-black/20 rounded-t-lg">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        data-testid="btn-bold"
      >
        <Bold className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        data-testid="btn-italic"
      >
        <Italic className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        data-testid="btn-underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        data-testid="btn-strike"
      >
        <Strikethrough className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-testid="btn-h1"
      >
        <Heading1 className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-testid="btn-h2"
      >
        <Heading2 className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        data-testid="btn-ul"
      >
        <List className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        data-testid="btn-ol"
      >
        <ListOrdered className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        data-testid="btn-quote"
      >
        <Quote className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        data-testid="btn-align-left"
      >
        <AlignLeft className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        data-testid="btn-align-center"
      >
        <AlignCenter className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        data-testid="btn-align-right"
      >
        <AlignRight className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={addLink}
        data-testid="btn-link"
      >
        <LinkIcon className="w-4 h-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        data-testid="btn-undo"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        data-testid="btn-redo"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function TextToHTML() {
  const [viewMode, setViewMode] = useState("code");
  const [htmlOutput, setHtmlOutput] = useState("<p>Escribe aquí tu contenido...</p>");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "<p>Escribe aquí tu contenido...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setHtmlOutput(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      setHtmlOutput(editor.getHTML());
    }
  }, [editor]);

  const getHTML = () => {
    return htmlOutput;
  };

  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(getHTML());
      toast.success("HTML copiado al portapapeles!");
    } catch {
      toast.error("Error al copiar");
    }
  };

  const loadSample = () => {
    const sampleContent = `
      <h1>Título Principal</h1>
      <p>Este es un párrafo con <strong>texto en negrita</strong> y <em>texto en cursiva</em>.</p>
      <h2>Subtítulo</h2>
      <p>También puedes usar <u>subrayado</u> y <s>tachado</s>.</p>
      <ul>
        <li>Elemento de lista 1</li>
        <li>Elemento de lista 2</li>
        <li>Elemento de lista 3</li>
      </ul>
      <ol>
        <li>Lista numerada 1</li>
        <li>Lista numerada 2</li>
      </ol>
      <blockquote>Esta es una cita destacada.</blockquote>
      <p>Y aquí hay un <a href="https://ejemplo.com">enlace</a>.</p>
    `;
    editor?.commands.setContent(sampleContent);
    setHtmlOutput(sampleContent);
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
          <FileCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text to HTML</h1>
          <p className="text-muted-foreground">Editor WYSIWYG con exportación a HTML</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Editor</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadSample} data-testid="load-sample-btn">
                Cargar Ejemplo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-lg overflow-hidden" data-testid="wysiwyg-editor">
              <MenuBar editor={editor} />
              <div className="bg-black/30 min-h-[350px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Salida HTML</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="code" className="h-6 px-2 text-xs" data-testid="view-code">
                      <Code className="w-3 h-3 mr-1" />
                      Código
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="h-6 px-2 text-xs" data-testid="view-preview">
                      <Eye className="w-3 h-3 mr-1" />
                      Vista
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyHTML}
                  data-testid="copy-html-btn"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "code" ? (
              <div 
                className="code-preview min-h-[350px] max-h-[400px] overflow-auto"
                data-testid="html-output"
              >
                <pre className="text-sm whitespace-pre-wrap break-words text-green-400">
                  {getHTML()}
                </pre>
              </div>
            ) : (
              <div 
                className="bg-white text-gray-900 rounded-lg p-6 min-h-[350px] max-h-[400px] overflow-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getHTML() }}
                data-testid="html-preview"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
