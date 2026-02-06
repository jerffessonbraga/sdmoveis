import { MainLayout } from "@/components/layout/MainLayout";
import { Editor3D } from "@/components/editor/Editor3D";

export default function EditorPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Editor de Projetos</h1>
          <p className="text-muted-foreground">
            Crie e edite projetos de móveis planejados
          </p>
        </div>
        <Editor3D />
      </div>
    </MainLayout>
  );
}
