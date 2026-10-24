import React from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string | any;
  children: React.ReactNode;
}

export default function Link({ href, children, className, onClick, ...props }: LinkProps) {
  const hrefStr = typeof href === 'string' ? href : (href?.pathname || String(href || ''));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // Ignore external links, mailto, tel, or fragment links
    if (
      hrefStr.startsWith('http://') ||
      hrefStr.startsWith('https://') ||
      hrefStr.startsWith('mailto:') ||
      hrefStr.startsWith('tel:') ||
      hrefStr.startsWith('#')
    ) {
      return;
    }

    e.preventDefault();
    window.history.pushState({}, '', hrefStr);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={hrefStr} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
