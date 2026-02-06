import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Bot, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  "Como otimizar o espaço de uma cozinha pequena?",
  "Qual a melhor disposição para um guarda-roupa?",
  "Sugira cores para um escritório moderno",
  "Monte um orçamento para cozinha planejada",
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o assistente IA da SD Móveis. Posso ajudar com design de móveis, sugestões de layout, orçamentos e muito mais. Como posso ajudar?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const responses: Record<string, string> = {
      cozinha:
        "Para otimizar uma cozinha pequena, recomendo:\n\n1. **Armários até o teto** - Aproveite todo espaço vertical\n2. **Gavetas profundas** - Mais práticas que prateleiras\n3. **Ilha multifuncional** - Serve como bancada e mesa\n4. **Cores claras** - Ampliam visualmente o ambiente\n\nPosso criar um projeto personalizado para você!",
      guarda:
        "Para um guarda-roupa funcional, sugiro:\n\n• **Cabideiros duplos** para camisas e blusas\n• **Prateleiras ajustáveis** para maior flexibilidade\n• **Gavetas internas** para roupas íntimas\n• **Espelho integrado** na porta\n• **Iluminação LED** automática\n\nQual o tamanho disponível?",
      cores:
        "Para um escritório moderno, indico:\n\n🎨 **Paleta sugerida:**\n- Cinza grafite (paredes)\n- Madeira clara (móveis)\n- Verde musgo ou azul petróleo (detalhes)\n- Branco (elementos de apoio)\n\nEssa combinação transmite profissionalismo e criatividade!",
      orçamento:
        "Para uma cozinha planejada completa:\n\n📊 **Estimativa base:**\n- Armários inferiores: R$ 4.500 - R$ 8.000\n- Armários superiores: R$ 3.000 - R$ 5.500\n- Bancada (granito): R$ 2.000 - R$ 4.000\n- Ferragens e acessórios: R$ 1.500 - R$ 3.000\n\n**Total estimado: R$ 11.000 - R$ 20.500**\n\nPosso detalhar mais?",
    };

    const key = Object.keys(responses).find((k) =>
      question.toLowerCase().includes(k)
    );
    return (
      responses[key || ""] ||
      "Entendi sua pergunta! Para fornecer a melhor sugestão, preciso de mais detalhes:\n\n• Quais são as medidas do ambiente?\n• Qual o estilo desejado (moderno, rústico, clássico)?\n• Qual a faixa de investimento?\n\nCom essas informações, posso criar uma proposta personalizada!"
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Assistente IA</h3>
          <p className="text-xs text-muted-foreground">
            Powered by Lovable AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`rounded-xl p-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-xl p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs">Sugestões</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
