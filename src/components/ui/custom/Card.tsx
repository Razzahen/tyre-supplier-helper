
import React from 'react';
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'glass';
  hoverEffect?: boolean;
}

export const Card = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg p-6 shadow-sm animate-scale-in",
        variant === 'default' && "bg-card text-card-foreground",
        variant === 'outline' && "border border-border bg-transparent",
        variant === 'glass' && "glass-card",
        hoverEffect && "card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  );
};

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={cn("font-semibold leading-tight tracking-tight text-xl", className)} {...props} />
  );
};

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
};

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("pt-0", className)} {...props} />;
};

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex items-center pt-4", className)} {...props} />;
};
