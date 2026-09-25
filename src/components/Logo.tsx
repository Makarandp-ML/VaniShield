import { Shield } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-base', container: 'gap-1.5' },
    md: { icon: 28, text: 'text-lg', container: 'gap-2' },
    lg: { icon: 40, text: 'text-2xl', container: 'gap-2.5' },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center ${s.container}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-teal-500/30 rounded-lg blur-md" />
        <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg p-1.5 flex items-center justify-center">
          <Shield size={s.icon} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-bold ${s.text} bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent`}>
          VaaniShield
        </span>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          AI
        </span>
      </div>
    </div>
  );
}
