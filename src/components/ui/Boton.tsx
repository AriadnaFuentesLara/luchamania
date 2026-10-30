import Link from 'next/link';
import { cn } from '@/lib/cn';

const variantes = {
  primario: 'bg-marca text-tinta hover:bg-marca-oscuro',
  secundario: 'border border-borde bg-superficie hover:bg-fondo',
  oscuro: 'bg-tinta text-white hover:bg-black',
};

type Props = {
  href: string;
  variante?: keyof typeof variantes;
  children: React.ReactNode;
};

export function BotonEnlace({ href, variante = 'primario', children }: Props) {
  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors', variantes[variante])}
    >
      {children}
    </Link>
  );
}4