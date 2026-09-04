import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20 relative">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al inicio
      </Link>
      
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
