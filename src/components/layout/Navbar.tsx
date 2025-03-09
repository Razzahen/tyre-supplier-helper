
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Settings, Gauge, BriefcaseBusiness } from "lucide-react";
import UserMenu from "./UserMenu";

type NavLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

type NavLinks = {
  to: string;
  icon: React.ReactNode;
  label: string;
}[];

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navLinks: NavLinks = [
    {
      to: "/",
      icon: <Search className="h-5 w-5" />,
      label: "Tyre Search",
    },
    {
      to: "/suppliers",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      label: "Suppliers",
    },
    {
      to: "/margins",
      icon: <Settings className="h-5 w-5" />,
      label: "Margins",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:block">TyreAI</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
          {navLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              icon={icon}
              label={label}
              isActive={pathname === to}
            />
          ))}
        </nav>
        <div className="flex-1 flex items-center justify-center md:justify-end">
          <div className="flex items-center gap-4">
            <nav className="flex items-center md:hidden">
              {navLinks.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === to
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                  title={label}
                >
                  {icon}
                </Link>
              ))}
            </nav>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className="relative flex items-center text-sm font-medium transition-colors hover:text-foreground/80"
  >
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
    {isActive && (
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
        layoutId="navbar-indicator"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </Link>
);

export default Navbar;
