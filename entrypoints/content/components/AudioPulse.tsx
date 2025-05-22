import classNames from 'classnames';
import useStore from '@/entrypoints/store/store';

export type AnimatedLogoProps = {
  connected: boolean;
  volume?: number;
};

export default function AudioPulse({ connected, volume }: AnimatedLogoProps) {
  const scale = connected ? 1 + Math.min(volume ?? 0, 200) / 2000 : 1;
  const { theme } = useStore();
  const isDark = theme === 'dark';

  return (
    <div
      className={classNames(
        "w-10 h-10 rounded-sm transition-all duration-300 flex items-center justify-center",
        {
          "animate-pulse": connected,
          [isDark ? "bg-[#1E1E1E]" : "bg-[#E5E5E5]"]: !connected,
          "bg-[#2B5DF5]": connected,
        }
      )}
      style={{
        transform: `scale(${scale})`,
        boxShadow: connected ? '0 0 8px rgba(43, 93, 245, 0.5)' : 'none',
      }}
    >
      <div className={classNames(
        "w-6 h-6 rounded-sm",
        isDark ? "bg-[#0A0A0A]" : "bg-[#FFFFFF]"
      )} />
    </div>
  );
}

