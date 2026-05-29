"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { DestinationForm } from "@/components/destination-form"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ToggleLeft,
  ToggleRight,
  MapPin,
  RefreshCw,
} from "lucide-react"

interface Destination {
  id: string
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate_spring: string
  climate_summer: string
  climate_autumn: string
  climate_winter: string
  climate_best_season: string
  cost_min: number
  cost_max: number
  cost_currency: string
  budget_level: number
  image_query: string
  tips: string
  tags_climate: string
  tags_safety: string
  tags_language: string
  tags_seasons: string
  tags_nightlife: string
  tags_nature: string
  tags_culture: string
  tags_adventure: string
  tags_connectivity: string
  tags_transport: string
  is_active: number
  created_at: string
  updated_at: string
}

function AdminContent() {
  const { token } = useAuth()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Destination | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDestinations = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/destinations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar destinos")
      }

      setDestinations(data.destinations || [])
      setFilteredDestinations(data.destinations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query)
    )
    setFilteredDestinations(filtered)
  }, [searchQuery, destinations])

  const handleCreate = () => {
    setEditingDestination(null)
    setShowForm(true)
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirm || !token) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/destinations/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar")
      }

      await fetchDestinations()
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (destination: Destination) => {
    if (!token) return

    try {
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar estado")
      }

      await fetchDestinations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  const handleFormSubmit = async (formData: Omit<Destination, "created_at" | "updated_at">) => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      const url = editingDestination
        ? `/api/admin/destinations/${editingDestination.id}`
        : "/api/admin/destinations"

      const response = await fetch(url, {
        method: editingDestination ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar")
      }

      await fetchDestinations()
      setShowForm(false)
      setEditingDestination(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Panel de Administración
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los destinos turísticos del sistema
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Destino
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Destinos</p>
                <p className="text-2xl font-bold text-foreground">
                  {destinations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <ToggleRight className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-foreground">
                  {destinations.filter((d) => d.is_active === 1).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <ToggleLeft className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-foreground">
                  {destinations.filter((d) => d.is_active === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o país..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchDestinations}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No hay destinos
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "No se encontraron destinos con ese criterio de búsqueda"
                  : "Comienza creando tu primer destino turístico"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Destino
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destino</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDestinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">
                      {destination.name}
                    </TableCell>
                    <TableCell>{destination.country}</TableCell>
                    <TableCell>
                      ${destination.cost_min} - ${destination.cost_max}{" "}
                      {destination.cost_currency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={destination.is_active === 1 ? "default" : "secondary"}
                      >
                        {destination.is_active === 1 ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(destination)}
                          title={
                            destination.is_active === 1 ? "Desactivar" : "Activar"
                          }
                        >
                          {destination.is_active === 1 ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(destination)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(destination)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <DestinationForm
          destination={editingDestination}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingDestination(null)
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Destino</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar <strong>{deleteConfirm?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            WanderIA - Panel de Administración
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <AdminContent />
    </AdminProtectedRoute>
  )
}
