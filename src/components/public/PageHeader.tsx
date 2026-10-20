'use client';

import { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
};

export default function PageHeader({ title, description, eyebrow, children }: PageHeaderProps) {
  return (
    <header className="pub-page-header pub-rise-load">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        {eyebrow ? <p className="pub-kicker">{eyebrow}</p> : null}
        <h1 className={`pub-page-title ${eyebrow ? 'mt-3' : ''}`}>{title}</h1>
        {description ? <p className="pub-page-lead">{description}</p> : null}
        {children}
      </div>
    </header>
  );
}
