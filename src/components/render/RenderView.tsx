import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Image,
  Sparkles,
  Download,
  Share2,
  Loader2,
  Camera,
  Sun,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RenderSettings {
  quality: "preview" | "standard" | "high";
  lighting: "daylight" | "evening" | "night";
  style: "realistic" | "artistic" | "minimal";
}

export function RenderView() {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<RenderSettings>({
    quality: "standard",
    lighting: "daylight",
    style: "realistic",
  });
  const [aiPrompt, setAiPrompt] = useState("");

  const qualityOptions = [
    { id: "preview", label: "Preview", time: "~30s" },
    { id: "standard", label: "Standard", time: "~2min" },
    { id: "high", label: "Alta Qualidade", time: "~5min" },
  ];

  const lightingOptions = [
    { id: "daylight", label: "Luz do Dia", icon: "☀️" },
    { id: "evening", label: "Entardecer", icon: "🌅" },
    { id: "night", label: "Noturno", icon: "🌙" },
  ];

  const styleOptions = [
    { id: "realistic", label: "Realista" },
    { id: "artistic", label: "Artístico" },
    { id: "minimal", label: "Minimalista" },
  ];

  const handleRender = () => {
    setIsRendering(true);
    setRenderProgress(0);

    // Simulate render progress
    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setRenderedImage("/placeholder.svg");
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Render Settings */}
      <Card className="p-6 col-span-1">
        <h3 className="font-semibold flex items-center gap-2 mb-6">
          <Camera className="w-5 h-5 text-primary" />
          Configurações de Renderização
        </h3>

        <div className="space-y-6">
          {/* Quality */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Qualidade</Label>
            <div className="grid grid-cols-3 gap-2">
              {qualityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      quality: opt.id as RenderSettings["quality"],
                    }))
                  }
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    settings.quality === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div>
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Iluminação
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {lightingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      lighting: opt.id as RenderSettings["lighting"],
                    }))
                  }
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    settings.lighting === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-xl block mb-1">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Estilo Visual
            </Label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={settings.style === opt.id ? "default" : "outline"}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      style: opt.id as RenderSettings["style"],
                    }))
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Enhancement */}
          <div>
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Aprimoramento com IA
            </Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Descreva ajustes adicionais: 'adicionar plantas decorativas', 'mudar cor do armário para branco'..."
              rows={3}
            />
          </div>

          {/* Render Button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleRender}
            disabled={isRendering}
          >
            {isRendering ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Renderizando...
              </>
            ) : (
              <>
                <Image className="w-5 h-5 mr-2" />
                Gerar Imagem 3D
              </>
            )}
          </Button>

          {isRendering && (
            <div className="space-y-2">
              <Progress value={renderProgress} />
              <p className="text-xs text-muted-foreground text-center">
                {renderProgress}% - Processando iluminação...
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Area */}
      <Card className="p-6 col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Visualização
          </h3>
          {renderedImage && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>

        <div className="aspect-video rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
          {renderedImage ? (
            <div className="relative w-full h-full">
              <img
                src={renderedImage}
                alt="Render 3D"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground">Qualidade: </span>
                <span className="font-medium capitalize">{settings.quality}</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Image className="w-10 h-10 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Nenhuma renderização</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Configure as opções ao lado e clique em "Gerar Imagem 3D" para criar
                uma visualização fotorrealista do projeto.
              </p>
            </div>
          )}
        </div>

        {/* Previous renders */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Renderizações anteriores</h4>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-lg bg-muted border border-border hover:border-primary cursor-pointer transition-all"
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
