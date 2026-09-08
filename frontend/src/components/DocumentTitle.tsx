import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HOME_TITLE = 'MarketNode';

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/ims')) {
    return 'MarketNode | Inventory Management System';
  }
  if (pathname.startsWith('/oms')) {
    return 'MarketNode | Order Management System';
  }
  return HOME_TITLE;
}

/** Keeps document.title in sync with the active system. */
export default function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  return null;
}
