import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

type BackLinkProps = {
  to: string;
  label: string;
};

export default function BackLink({ to, label }: BackLinkProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onPress={() => navigate(to)}
      className="mb-4 -ml-2 px-2"
      aria-label={label}
    >
      ← {label}
    </Button>
  );
}
