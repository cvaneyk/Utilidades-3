import { useState, useEffect } from "react";
import axios from "axios";
import { Type, Clock, FileText, Hash, AlignLeft, LetterText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WordCounter() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    characters: 0,
    characters_no_spaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    reading_time_minutes: 0
  });

  useEffect(() => {
    const analyze = async () => {
      if (!text) {
        setStats({
          characters: 0,
          characters_no_spaces: 0,
          words: 0,
          sentences: 0,
          paragraphs: 0,
          reading_time_minutes: 0
        });
        return;
      }

      try {
        const response = await axios.post(`${API}/word-counter`, { text });
        setStats(response.data);
      } catch (error) {
        console.error("Analysis failed:", error);
      }
    };

    const debounce = setTimeout(analyze, 300);
    return () => clearTimeout(debounce);
  }, [text]);

  const formatReadingTime = (minutes) => {
    if (minutes < 1) {
      return "< 1 min";
    }
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const statItems = [
    { 
      label: "Words", 
      value: stats.words, 
      icon: FileText,
      color: "text-primary"
    },
    { 
      label: "Characters", 
      value: stats.characters, 
      icon: Hash,
      color: "text-accent"
    },
    { 
      label: "No Spaces", 
      value: stats.characters_no_spaces, 
      icon: LetterText,
      color: "text-secondary"
    },
    { 
      label: "Sentences", 
      value: stats.sentences, 
      icon: AlignLeft,
      color: "text-orange-500"
    },
    { 
      label: "Paragraphs", 
      value: stats.paragraphs, 
      icon: Type,
      color: "text-cyan-500"
    },
    { 
      label: "Reading Time", 
      value: formatReadingTime(stats.reading_time_minutes), 
      icon: Clock,
      color: "text-pink-500"
    }
  ];

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center">
          <Type className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Word Counter</h1>
          <p className="text-muted-foreground">Analyze your text in real-time</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2">
          <Card className="bg-card/40 backdrop-blur-md border-white/5 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="min-h-[450px] bg-black/20 border-white/10 text-base leading-relaxed resize-none"
                data-testid="text-area"
              />
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <div>
          <Card className="bg-card/40 backdrop-blur-md border-white/5 sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {statItems.map((item) => (
                  <div 
                    key={item.label}
                    className="bg-muted/30 rounded-xl p-4 text-center"
                    data-testid={`stat-${item.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                    <div className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="text-sm font-medium text-primary mb-2">Quick Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Average reading speed: 200 words/min</li>
                  <li>• Twitter: 280 characters max</li>
                  <li>• Meta description: 155-160 chars</li>
                  <li>• LinkedIn post: 3000 chars max</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
