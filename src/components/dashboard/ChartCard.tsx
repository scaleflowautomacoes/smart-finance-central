import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  headerRight,
  className,
  contentClassName,
}) => {
  return (
    <Card variant="soft" className={cn('overflow-hidden shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]', className)}>
      <CardHeader className="pb-2.5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground lg:text-base">
            {title}
          </CardTitle>
          {headerRight}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
