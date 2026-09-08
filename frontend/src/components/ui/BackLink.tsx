import { Button } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';

type BackLinkProps = {
  to: string;
  label: string;
};

export default function BackLink({ to, label }: BackLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch;
  const target = listSearch ? `${to.split('?')[0]}?${listSearch}` : to;

  return (
    <Button
      variant="ghost"
      onPress={() => navigate(target)}
      className="mb-4 -ml-2 px-2"
      aria-label={label}
    >
      ← {label}
    </Button>
  );
}
