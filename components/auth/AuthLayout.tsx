import Image from 'next/image';
import Link from 'next/link';

export function AuthLayout({ children, title, description }: { children: React.ReactNode, title: string, description: string }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary/5 to-background animate-fade-in">
      {/* Left: Illustration/Brand */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-background-secondary p-12 border-r border-border">
        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg mb-6">
          <Image src="/NEWS360.png" alt="News360 Logo" width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-md text-center">{description}</p>
      </div>
      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </div>
    </div>
  );
} 