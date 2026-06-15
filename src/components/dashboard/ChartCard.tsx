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
    <Card variant="soft" className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground lg:text-lg">
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
