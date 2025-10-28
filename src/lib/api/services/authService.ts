import {useApi, useServerApi} from "../useApi";

export interface SignInRequest {
    username: string;
    password: string;
    turnstileToken?: string;
}

export interface SignInResponse {
    accessToken: string;
    refreshToken: string;
}

export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    turnstileToken?: string;
}

export interface SignUpResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
    turnstileToken?: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    new_password: string;
    confirm_password: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

// Server-side website service using ApiClient
export class AuthService {
    private api: ReturnType<typeof useApi>;

    constructor(websiteId?: string) {
        if (websiteId) {
            // Server-side usage with websiteId
            this.api = useServerApi(websiteId, {version: 'v2'});
        } else {
            // Client-side usage
            this.api = useApi({version: 'v2'});
        }
    }

    async signIn(data: SignInRequest): Promise<SignInResponse> {
        try {
            const response = await this.api.post<SignInResponse>(
                "/auth/signin",
                data
            );

            return response.data;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
        }
    }

    async signUp(data: SignUpRequest): Promise<SignUpResponse> {
        try {
            const response = await this.api.post<SignUpResponse>(
                "/auth/signup",
                data
            );

            return response.data;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    }

    async forgotPassword(
        data: ForgotPasswordRequest
    ): Promise<ForgotPasswordResponse> {
        try {
            const response = await this.api.post<ForgotPasswordResponse>(
                "/auth/forgot-password",
                data
            );

            return response.data;
        } catch (error) {
            console.error("Error forgot password:", error);
            throw error;
        }
    }

    async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        try {
            const response = await this.api.post<ResetPasswordResponse>(
                "/auth/reset-password",
                data
            );

            return response.data;
        } catch (error) {
            console.error("Error resetting password:", error);
            throw error;
        }
    }
}

// Client-side instance
export const authService = () => new AuthService();

// For server-side usage - now accepts websiteId
export const serverAuthService = (websiteId: string) => new AuthService(websiteId);
