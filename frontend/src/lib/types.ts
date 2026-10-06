export type Role = 'CITIZEN' | 'ADMIN' | 'DEPARTMENT_MANAGER' | 'FIELD_EMPLOYEE'

export type ComplaintStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED'

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export interface User {
  id: number
  username: string
  email: string
  fullName: string | null
  phoneNumber: string | null
  role: Role
  active: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}

export interface Category {
  id: number
  name: string
  description: string | null
  departmentName: string
  contactEmail: string | null
  estimatedResolutionHours: number
  active: boolean
  openComplaints: number
  createdAt: string
}

export interface CategoryInput {
  name: string
  description?: string
  departmentName: string
  contactEmail?: string
  estimatedResolutionHours?: number
  active?: boolean
}

export interface CommentAuthor {
  id: number
  username: string
  fullName: string | null
  phoneNumber: string | null
  role: Role
}

export interface Comment {
  id: number
  message: string
  previousStatus: ComplaintStatus | null
  newStatus: ComplaintStatus | null
  internal: boolean
  createdAt: string
  author: CommentAuthor
}

export interface Complaint {
  id: number
  referenceCode: string
  title: string
  description: string
  imageUrl: string | null
  latitude: number
  longitude: number
  district: string | null
  address: string | null
  priority: Priority
  status: ComplaintStatus
  closed: boolean
  allowedTransitions: ComplaintStatus[]
  resolutionNote: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  categoryId: number | null
  categoryName: string
  departmentName: string | null
  userId: number
  userName: string
  userFullName: string | null
  assignedToId: number | null
  assignedToName: string | null
  comments: Comment[] | null
}

export interface ComplaintInput {
  title: string
  description: string
  categoryName: string
  latitude: number
  longitude: number
  district?: string
  address?: string
  imageUrl?: string
  priority?: Priority
}

export interface ComplaintMarker {
  id: number
  referenceCode: string
  title: string
  status: ComplaintStatus
  priority: Priority
  latitude: number
  longitude: number
  district: string | null
  categoryName: string
  createdAt: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface Statistics {
  total: number
  open: number
  closed: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  byCategory: Record<string, number>
  byDistrict: Record<string, number>
  averageResolutionHours: number
  generatedAt: string
}

export interface ApiErrorBody {
  timestamp?: string
  status: number
  error?: string
  message: string
  path?: string
  details?: string[]
}

export interface LoginInput {
  username: string
  password: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  fullName?: string
  phoneNumber?: string
}

export interface UserUpdateInput {
  email?: string
  fullName?: string
  phoneNumber?: string
  role?: Role
  active?: boolean
}

export interface UploadResponse {
  url: string
  contentType: string
  size: number
}