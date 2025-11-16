'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import '@/styles/modern-patterns.css'

// Schema untuk form user
const userFormSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap harus diisi'),
  email: z.string().email('Format email tidak valid'),
  role: z.enum(['admin', 'perawat', 'pasien'], {
    required_error: 'Role harus dipilih',
  }),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserData {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'perawat' | 'pasien'
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  is_active: boolean
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function UserManagementContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, userRole } = useAuthStore()

  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  // Form states
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'pasien',
    },
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply search filter
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active')
      }

      const { data, error, count } = await query.range(
        (pagination.currentPage - 1) * pagination.itemsPerPage,
        pagination.currentPage * pagination.itemsPerPage - 1
      )

      if (error) throw error

      setUsers(data || [])
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.itemsPerPage),
      }))
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data pengguna',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter, statusFilter, pagination.currentPage, pagination.itemsPerPage, toast, setUsers, setPagination, setLoading])

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/login')
      return
    }

    fetchUsers()
  }, [user, userRole, router])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchUsers()
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }))
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, roleFilter, statusFilter, pagination.currentPage, fetchUsers])

  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage])

  
  const handleAddUser = async (data: UserFormData) => {
    try {
      const supabase = createClient()

      // Create auth user
      const { error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: 'changeme123', // Default password, user should change it
        user_metadata: {
          full_name: data.full_name,
          role: data.role,
        },
      })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          // Try to create profile for existing user
          const { data: existingUser } = await supabase.auth.admin.listUsers()
          const user = existingUser.users.find(u => u.email === data.email)

          if (user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: data.full_name,
                email: data.email,
                role: data.role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

            if (profileError) {
              throw profileError
            }

            toast({
              title: 'Berhasil',
              description: 'Profile pengguna berhasil diperbarui',
            })
          }
        } else {
          throw authError
        }
      } else {
        toast({
          title: 'Berhasil',
          description: 'Pengguna baru berhasil ditambahkan',
        })
      }

      setIsAddDialogOpen(false)
      form.reset()
      fetchUsers()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Gagal menambahkan pengguna',
        variant: 'destructive',
      })
    }
  }

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Berhasil',
        description: 'Data pengguna berhasil diperbarui',
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      form.reset()
      fetchUsers()
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data pengguna',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const supabase = createClient()

      // Delete profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        // Auth user deletion failed
      }

      toast({
        title: 'Berhasil',
        description: 'Pengguna berhasil dihapus',
      })

      fetchUsers()
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal menghapus pengguna',
        variant: 'destructive',
      })
    }
  }

  const handleToggleUserStatus = async (_userId: string, _isActive: boolean) => {
    // Note: This would require adding an is_active field to the profiles table
    toast({
      title: 'Info',
      description: 'Fitur toggle status akan segera tersedia',
    })
  }

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user)
    form.reset({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'perawat':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pasien':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'perawat': return 'Perawat'
      case 'pasien': return 'Pasien'
      default: return role
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belum pernah'
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-sky-900 mb-2">
              Manajemen Pengguna
            </h1>
            <p className="text-sky-600">
              Kelola semua pengguna yang terdaftar dalam sistem
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan pengguna baru ke dalam sistem. Password default akan &apos;changeme123&apos;.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleAddUser)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="full_name" className="text-sm font-medium">
                      Nama Lengkap
                    </label>
                    <Input
                      id="full_name"
                      {...form.register('full_name')}
                      placeholder="Masukkan nama lengkap"
                    />
                    {form.formState.errors.full_name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="Masukkan email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <Select onValueChange={(value) => form.setValue('role', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="perawat">Perawat</SelectItem>
                        <SelectItem value="pasien">Pasien</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Tambah Pengguna</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Total Pengguna</p>
                  <p className="text-2xl font-bold text-sky-900">{pagination.totalItems}</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Admin</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Perawat</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {users.filter(u => u.role === 'perawat').length}
                  </p>
                </div>
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-sky-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-600">Pasien</p>
                  <p className="text-2xl font-bold text-sky-900">
                    {users.filter(u => u.role === 'pasien').length}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="perawat">Perawat</SelectItem>
                  <SelectItem value="pasien">Pasien</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Non-aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white/80 backdrop-blur-md border-sky-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sky-600">
                        {loading ? 'Memuat data...' : 'Tidak ada data pengguna yang ditemukan'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-sky-50/50">
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                              disabled={user.id === user?.id} // Can't disable yourself
                            />
                            <span className="text-sm">
                              {user.is_active ? 'Aktif' : 'Non-aktif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(user.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatDate(user.last_sign_in_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(user)}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus pengguna &ldquo;{user.full_name}&rdquo;?
                                      Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Menampilkan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} hingga{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari{' '}
                  {pagination.totalItems} data
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
              <DialogDescription>
                Perbarui informasi pengguna yang ada.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleEditUser)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit_full_name" className="text-sm font-medium">
                    Nama Lengkap
                  </label>
                  <Input
                    id="edit_full_name"
                    {...form.register('full_name')}
                    placeholder="Masukkan nama lengkap"
                  />
                  {form.formState.errors.full_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit_email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="edit_email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Masukkan email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit_role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={form.watch('role')}
                    onValueChange={(value) => form.setValue('role', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="perawat">Perawat</SelectItem>
                      <SelectItem value="pasien">Pasien</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.role.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}