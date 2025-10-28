"use client";

import Link from "next/link";
import {
  User,
  LogIn,
  Menu,
  X,
  User as ProfileIcon,
  Wallet,
  Package,
  Settings,
  LogOut,
  ShoppingCart,
  Home,
  Store,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";
import { Theme, Website } from "@/lib/types/website";
import {
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AuthContext } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import Cart from "./components/cart";
import renderIcon from "@/lib/helpers/renderIcon";
import { WEBSITE_ID } from "@/lib/constants/base";

export interface NavbarRef {
  openCart: () => void;
}

const Navbar = forwardRef<
  NavbarRef,
  {
    websiteName: string;
    navbarLinks: Theme["navbar"];
  }
>(({ websiteName, navbarLinks }, ref) => {
  const { isAuthenticated, user, signOut, isLoading } = useContext(AuthContext);
  const { getItemCount, openCart, closeCart, isCartOpen } = useCart();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("Logout button clicked");
      await signOut();
      console.log("SignOut completed successfully");

      // Close menus after successful logout
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);

      // Redirect to home page after logout
      router.push("/home");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, close the menus
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Expose openCart function to parent components
  useImperativeHandle(ref, () => ({
    openCart,
  }));

  // Auto-open cart when items are added
  const prevItemCount = useRef(getItemCount());

  useEffect(() => {
    prevItemCount.current = getItemCount();
  }, [getItemCount]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [router]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Handle mobile menu
      if (
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-menu-trigger")
      ) {
        setIsMobileMenuOpen(false);
      }

      // Handle user menu - only close if clicking outside the user menu panel
      if (
        isUserMenuOpen &&
        !target.closest(".user-menu-panel") &&
        !target.closest(".user-menu-trigger")
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Link href="/home" className="cursor-pointer">
                  <span className="text-2xl font-bold">{websiteName}</span>
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <NavigationMenu>
                  <NavigationMenuList>
                    {navbarLinks.map((link) => (
                      <NavigationMenuItem key={link.index}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={link.url}
                            className={navigationMenuTriggerStyle()}
                          >
                            {link.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            {/* Right side - Buttons */}
            <div className="flex items-center space-x-4">
              {/* Desktop Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <ThemeSwitcher />

                {/* Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 relative"
                  onClick={openCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Sepet</span>
                  {getItemCount() > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>

                {/* Loading State */}
                {isLoading && (
                  <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
                )}

                {/* Unauthenticated State */}
                {!isLoading && !isAuthenticated && (
                  <>
                    <Link href="/auth/sign-in">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Giriş Yap</span>
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm" className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Kayıt Ol</span>
                      </Button>
                    </Link>
                  </>
                )}

                {/* Authenticated State */}
                {!isLoading && isAuthenticated && user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 user-menu-trigger"
                    onClick={() => setIsUserMenuOpen(true)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={`https://mc-heads.net/avatar/${user?.username}/256`}
                      />
                    </Avatar>
                    <span>{user?.username}</span>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mobile-menu-trigger"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Overlay - Soldan sağa doğru açılır */}
      <Cart isOpen={isCartOpen} onClose={closeCart} />

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out mobile-menu overflow-hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-background">
            <h2 className="text-xl font-semibold">Menü</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="h-full overflow-y-auto pb-6">
            {/* Navigation Links */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Navigasyon
              </h3>
              <div className="space-y-2">
                {navbarLinks.map((link) => (
                  <Link
                    key={link.index}
                    href={link.url}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {renderIcon(link.icon, 4, 4)}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Alışveriş
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  openCart();
                  setIsMobileMenuOpen(false);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                Sepet ({getItemCount()})
              </Button>
            </div>

            {/* Theme Switcher */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Tema
              </h3>
              <ThemeSwitcher />
            </div>

            {/* Authentication Section */}
            <div className="p-4">
              {isLoading ? (
                <div className="w-full h-10 bg-muted animate-pulse rounded"></div>
              ) : !isAuthenticated ? (
                <div className="space-y-3">
                  <Link href="/auth/sign-in" className="w-full">
                    <Button variant="outline" className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" className="w-full">
                    <Button className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Kayıt Ol
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={`https://mc-heads.net/avatar/${user?.username}/256`}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-sm text-muted-foreground">Oyuncu</p>
                    </div>
                  </div>

                  {/* User Menu Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-1 p-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/profile");
                      }}
                    >
                      <ProfileIcon className="h-5 w-5" />
                      <span className="text-xs font-medium">Profilim</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-1 p-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/wallet");
                      }}
                    >
                      <Wallet className="h-5 w-5" />
                      <span className="text-xs font-medium">Cüzdanım</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-1 p-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/chest");
                      }}
                    >
                      <Package className="h-5 w-5" />
                      <span className="text-xs font-medium">Sandığım</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-1 p-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/profile/settings");
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-xs font-medium">Ayarlar</span>
                    </Button>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      console.log("Mobile logout button clicked");
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop User Menu Overlay - Only show when authenticated and menu is open */}
      {isAuthenticated && user && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 hidden md:block ${
            isUserMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isUserMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsUserMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out user-menu-panel ${
              isUserMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Hesap Menüsü</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={`https://mc-heads.net/avatar/${user?.username}/256`}
                  />
                </Avatar>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-muted-foreground">Oyuncu</p>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Profilim */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                  onClick={() => {
                    // Navigate to profile
                    setIsUserMenuOpen(false);
                    router.push("/profile");
                  }}
                >
                  <ProfileIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">Profilim</span>
                </Button>

                {/* Cüzdanım */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                  onClick={() => {
                    // Navigate to wallet
                    setIsUserMenuOpen(false);
                    router.push("/wallet");
                  }}
                >
                  <Wallet className="h-6 w-6" />
                  <span className="text-sm font-medium">Cüzdanım</span>
                </Button>

                {/* Sandığım */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                  onClick={() => {
                    // Navigate to chest
                    setIsUserMenuOpen(false);
                    router.push("/chest");
                  }}
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm font-medium">Sandığım</span>
                </Button>

                {/* Ayarlar */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                  onClick={() => {
                    // Navigate to settings
                    setIsUserMenuOpen(false);
                    router.push("/profile/settings");
                  }}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm font-medium">Ayarlar</span>
                </Button>

                {/* Yönetim Paneli */}
                {user?.role?.permissions.length > 0 && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push(
                        `https://app.crafter.net.tr/cms/auth?accessToken=${localStorage.getItem(
                          "accessToken"
                        )}&refreshToken=${localStorage.getItem(
                          "refreshToken"
                        )}&websiteId=${localStorage.getItem(
                          "websiteId"
                        )}`
                      );
                    }}
                  >
                    <Settings className="h-6 w-6" />
                    <span className="text-sm font-medium">Yönetim Paneli</span>
                  </Button>
                )}
              </div>

              {/* Çıkış Yap Button */}
              <div className="mt-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    console.log("Desktop logout button clicked");
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Navbar;
