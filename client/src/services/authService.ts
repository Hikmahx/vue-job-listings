// authService.ts
import axios from "axios"

const API_BASE_URL = "http://127.0.0.1:8000/api"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  password2: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
  role: string
  location: string
  experienceYears?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  resume?: File
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: any
  tokens: {
    access: string
    refresh: string
  }
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const formData = new FormData()

      // Add all string fields
      formData.append("firstName", payload.firstName)
      formData.append("lastName", payload.lastName)
      formData.append("email", payload.email)
      formData.append("password", payload.password)
      formData.append("password2", payload.password2)
      formData.append("phoneNumber", payload.phoneNumber)
      formData.append("gender", payload.gender)
      formData.append("dateOfBirth", payload.dateOfBirth)
      formData.append("role", payload.role)
      formData.append("location", payload.location)

      if (payload.experienceYears !== undefined) {
        formData.append("experienceYears", payload.experienceYears.toString())
      }
      if (payload.linkedinUrl) {
        formData.append("linkedinUrl", payload.linkedinUrl)
      }
      if (payload.githubUrl) {
        formData.append("githubUrl", payload.githubUrl)
      }
      if (payload.portfolioUrl) {
        formData.append("portfolioUrl", payload.portfolioUrl)
      }
      if (payload.resume) {
        formData.append("resume", payload.resume)
      }

      const response = await axiosInstance.post<AuthResponse>("/accounts/register/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.tokens) {
        localStorage.setItem("access_token", response.data.tokens.access)
        localStorage.setItem("refresh_token", response.data.tokens.refresh)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      throw error.response?.data || error
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>("/accounts/login/", payload)

      if (response.data.tokens) {
        localStorage.setItem("access_token", response.data.tokens.access)
        localStorage.setItem("refresh_token", response.data.tokens.refresh)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      throw error.response?.data || error
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/accounts/logout/")
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
    }
  },

  async getProfile(): Promise<any> {
    try {
      const response = await axiosInstance.get("/accounts/profile/")
      return response.data
    } catch (error: any) {
      throw error.response?.data || error
    }
  },

  async updateProfile(data: any): Promise<any> {
    try {
      const response = await axiosInstance.put("/accounts/profile/", data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || error
    }
  },

  getStoredUser(): any {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  getAccessToken(): string | null {
    return localStorage.getItem("access_token")
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },
}
