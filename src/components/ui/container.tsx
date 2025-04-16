import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variantes adaptées pour les cas d'usage courants (page, section, etc.)
// Padding de bordure d'écran supprimé
const containerVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        page: "max-w-7xl mx-auto",
        section: "w-full mx-auto",
        narrow: "max-w-2xl mx-auto",
        fluid: "w-full",
      },
    },
    defaultVariants: {
      variant: "page",
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

/**
 * Container shadcn/ui
 * Utilisation :
 * <Container variant="page|section|narrow|fluid">...</Container>
 */
export const Container: React.FC<ContainerProps> = ({
  asChild,
  className,
  variant,
  ...props
}) => {
  const Comp = asChild ? (React.Fragment as any) : "div";
  const classes = cn(containerVariants({ variant }), className);

  // Si asChild, on attend un composant avec className en slot
  if (asChild) {
    return props.children;
  }
  return (
    <div className={classes} {...props} />
  );
};

export { containerVariants };
