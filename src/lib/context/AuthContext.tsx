"use client";

import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  SignUpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthService,
  serverAuthService,
  authService,
} from "@/lib/api/services/authService";
import { User } from "@/lib/types/user";
import Loading from "@/components/ui/loading";
import { UserService } from "../api/services/userService";
import { useApi } from "../api/useApi";
import { BACKEND_URL_WITH_WEBSITE_IDV2 } from "../constants/base";

export const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signIn: (
    username: string,
    password: string,
    turnstileToken?: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
}>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  setUser: () => {},
  reloadUser: () => Promise.resolve(),
});

export const AuthProvider = ({
  children,
  logo,
}: {
  children: React.ReactNode;
  logo: string;
}) => {
  // Create a single AuthService instance that will be reused
  const authServiceInstance = authService();

  const apiClient = useApi({ version: "v2" });
  // Create user service with the same API client instance
  const userService = new UserService();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Email validation function with infinite loop prevention
  const checkEmailUpdate = (email: string | null | undefined): boolean => {
    // Prevent infinite redirect loop - skip if already on settings page
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/profile/settings"
    ) {
      return false;
    }

    // Check for invalid email patterns
    if (!email || email.trim() === "" || email.endsWith("@temp.com")) {
      toast.warning("E-posta Güncelleme Gerekli", {
        description:
          "Devam etmek için lütfen e-posta adresinizi güncelleyiniz.",
        duration: 5000,
      });

      if (typeof window !== "undefined") {
        // Delay redirect to allow toast to be visible
        setTimeout(() => {
          window.location.href = "/profile/settings";
        }, 1000);
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchUser = async (skipEmailCheck: boolean = false) => {
      try {
        // Check if we have tokens in localStorage and sync with ApiClient
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          apiClient.setAccessToken(accessToken);
          apiClient.setRefreshToken(refreshToken);

          try {
            const user = await userService.getMe();
            setUser(user);
            setIsAuthenticated(true);

            // Check email validity unless explicitly skipped
            if (!skipEmailCheck) {
              checkEmailUpdate(user.email);
            }
          } catch (error) {
            // If getMe fails, clear invalid tokens
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            apiClient.removeTokens();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const signIn = async (
    username: string,
    password: string,
    turnstileToken?: string,
    rememberMe?: boolean
  ) => {
    try {
      const response = await authServiceInstance.signIn({
        username,
        password,
        turnstileToken,
      });

      // Store tokens in localStorage and update ApiClient
      if (rememberMe) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
      } else {
        sessionStorage.setItem("accessToken", response.accessToken);
        // Also store in localStorage for ApiClient compatibility
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      // Update ApiClient's token storage
      apiClient.setAccessToken(response.accessToken);
      apiClient.setRefreshToken(response.refreshToken);

      const user = await userService.getMe();

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      const response = await authServiceInstance.signUp(data);

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Update ApiClient's token storage
      apiClient.setAccessToken(response.accessToken);
      apiClient.setRefreshToken(response.refreshToken);

      const user = await userService.getMe();

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      await authServiceInstance.forgotPassword(data);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      await authServiceInstance.resetPassword(data);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear tokens from both localStorage and ApiClient
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      apiClient.removeTokens();

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const reloadUser = async () => {
    setIsLoading(true);
    try {
      const user = await userService.getMe();
      setUser(user);
      setIsAuthenticated(true);
      // Skip email check on manual refresh to prevent loops
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading logo={logo} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        forgotPassword,
        resetPassword,
        signOut,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
