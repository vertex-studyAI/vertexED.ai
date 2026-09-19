import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { getApexAppearance } from '@/lib/apexAppearance';
import { cn } from '@/lib/utils';

type ApexAvatarProps = {
  className?: string;
  imageClassName?: string;
  label?: string;
};

export default function ApexAvatar({ className, imageClassName, label }: ApexAvatarProps) {
  const { settings } = useAppPreferences();
  const appearance = getApexAppearance(settings.apexAppearance);

  return (
    <span className={cn('apex-avatar', className)}>
      <img
        className={cn('apex-avatar-image', imageClassName)}
        src={appearance.src}
        alt={label ?? ''}
        aria-hidden={label ? undefined : true}
        width="40"
        height="40"
        draggable={false}
      />
    </span>
  );
}
