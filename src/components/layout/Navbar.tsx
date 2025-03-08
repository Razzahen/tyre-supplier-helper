
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Search, Truck, Percent, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link to={to}>
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all relative group",
          isActive 
            ? "text-primary font-medium bg-primary/10" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        {icon}
        <span>{label}</span>
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute inset-0 rounded-lg border border-primary/20"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
      </div>
    </Link>
  );
};

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <Search size={18} />, label: 'Search Tyres' },
    { to: '/suppliers', icon: <Truck size={18} />, label: 'Suppliers' },
    { to: '/margins', icon: <Percent size={18} />, label: 'Margins' },
  ];

  const desktopNav = (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={location.pathname === item.to}
        />
      ))}
    </nav>
  );

  const mobileNav = (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-14 left-0 right-0 bg-background border-b border-border p-4 z-50 md:hidden shadow-lg"
        >
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              TyreManager
            </span>
          </Link>
          {!isMobile && desktopNav}
        </div>

        {isMobile ? mobileNav : null}

        <div className="flex items-center space-x-2">
          {/* Placeholder for future auth functionality */}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
