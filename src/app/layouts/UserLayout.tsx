import logoWhite from '../../assets/imgs/NutriFlow-white3.svg';
import logoBlack from '../../assets/imgs/NutriFlow-black3.svg';
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Leaf, LayoutDashboard, Calendar, Package, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fullName = localStorage.getItem("userFullName") ?? "";

  const navItems = [
    { path: "/user", label: "Dashboard", icon: LayoutDashboard },
    { path: "/user/menu", label: "My Menu", icon: Calendar },
    { path: "/user/deliveries", label: "Deliveries", icon: Package },
    { path: "/user/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/user") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/user" className="flex items-center gap-2">
            <ImageWithFallback src={logoWhite} alt="NutriFlow Logo" className="size-10" />
            <span className="font-semibold">NutriFlow</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t bg-white">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition ${
                    isActive(item.path)
                      ? "bg-primary-light text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-destructive hover:bg-muted transition"
            >
              <LogOut className="size-5" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link to="/user" className="flex items-center gap-2">
              <ImageWithFallback src={logoWhite} alt="NutriFlow Logo" className="size-10" />
              <div>
                <div className="text-xl font-semibold">NutriFlow</div>
                <div className="text-xs text-muted-foreground">User dashboard</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t space-y-3">
            {fullName && (
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="size-4 text-primary" />
                </div>
                <p className="text-sm font-medium truncate">{fullName}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
