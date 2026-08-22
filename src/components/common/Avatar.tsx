interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  src?: string;
  verified?: boolean;
}

const SIZES = {
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export default function Avatar({ name, size = 'md', color = '#3E7A8C', src, verified }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`rounded-full object-cover ${SIZES[size]}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full font-semibold text-white ${SIZES[size]}`}
          style={{ background: color }}
          title={name}
        >
          {getInitials(name)}
        </div>
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ds-success text-white text-[9px]">
          ✓
        </span>
      )}
    </div>
  );
}
