<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Tenant } from '~/types/tenant'
import type { Building } from '~/types/building'
import type { ApiResponse } from '~/types'

const { api, buildingApi } = useApi()
const toast = useToast()

const tenants = ref<Tenant[]>([])
const buildings = ref<Building[]>([])
const selectedBuildingId = ref<string>('')
const loading = ref(false)
const loadingBuildings = ref(false)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedTenant = ref<Tenant | null>(null)

const columns: TableColumn<Tenant>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'unitId', header: 'Unit' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: 'Actions' },
]

const buildingOptions = computed(() =>
  buildings.value.map(b => ({ value: b.id, label: b.name }))
)

const selectedBuilding = computed({
  get: () => buildingOptions.value.find(b => b.value === selectedBuildingId.value),
  set: (val: { value: string; label: string } | undefined) => {
    selectedBuildingId.value = val?.value || ''
  }
})

async function fetchBuildings() {
  loadingBuildings.value = true
  try {
    const response = await api<ApiResponse<Building[]>>('/v1/app/buildings')
    buildings.value = response.data.filter(b => b.status === 'active')
    if (buildings.value.length > 0 && !selectedBuildingId.value) {
      selectedBuildingId.value = buildings.value[0]!.id
    }
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch buildings', description: error.message, color: 'error' })
  } finally {
    loadingBuildings.value = false
  }
}

async function fetchTenants() {
  if (!selectedBuildingId.value) return

  loading.value = true
  try {
    const response = await buildingApi<ApiResponse<Tenant[]>>(
      selectedBuildingId.value,
      '/v1/app/tenants'
    )
    tenants.value = response.data
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch tenants', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

function openEditModal(tenant: Tenant) {
  selectedTenant.value = tenant
  isEditModalOpen.value = true
}

async function deleteTenant(id: string) {
  if (!confirm('Are you sure you want to delete this tenant?')) return
  if (!selectedBuildingId.value) return

  try {
    await buildingApi(selectedBuildingId.value, `/v1/app/tenants/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Tenant deleted successfully', color: 'success' })
    fetchTenants()
  } catch (error: any) {
    toast.add({ title: 'Failed to delete tenant', description: error.message, color: 'error' })
  }
}

function handleSuccess() {
  isCreateModalOpen.value = false
  isEditModalOpen.value = false
  selectedTenant.value = null
  fetchTenants()
}

watch(selectedBuildingId, () => {
  if (selectedBuildingId.value) {
    fetchTenants()
  }
})

onMounted(() => {
  fetchBuildings()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tenants</h1>
        <p class="text-gray-600 mt-1">Manage building tenants and leases</p>
      </div>

      <div class="flex items-center gap-3">
        <USelectMenu v-model="selectedBuilding" :items="buildingOptions" placeholder="Select building"
          :loading="loadingBuildings" class="w-64" />
        <UButton color="primary" icon="i-heroicons-plus" @click="isCreateModalOpen = true"
          :disabled="!selectedBuildingId">
          Add Tenant
        </UButton>
      </div>
    </div>

    <UCard>
      <UTable :data="tenants" :columns="columns" :loading="loading">
        <template #phone-cell="{ row }">
          <span v-if="row.original.phone">{{ row.original.phone }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #unitId-cell="{ row }">
          <span v-if="row.original.unit">
            {{ row.original.unit.unitNumber }}
            <span v-if="row.original.unit.floor" class="text-gray-500">
              (Floor {{ row.original.unit.floor }})
            </span>
          </span>
          <span v-else class="text-gray-400">No unit assigned</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'active' ? 'success' : 'neutral'" variant="subtle" class="capitalize">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton size="xs" color="neutral" variant="ghost" @click="openEditModal(row.original)">
              Edit
            </UButton>
            <UButton size="xs" color="error" variant="ghost" @click="deleteTenant(row.original.id)">
              Delete
            </UButton>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-12">
            <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-900 font-medium mb-2">No tenants yet</p>
            <p class="text-gray-500 mb-4">
              {{ selectedBuildingId ? 'Get started by adding your first tenant' : 'Select a building to manage tenants'
              }}
            </p>
            <UButton v-if="selectedBuildingId" color="primary" @click="isCreateModalOpen = true">
              Add Tenant
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isCreateModalOpen" title="Add New Tenant">
      <template #body>
        <TenantForm v-if="selectedBuildingId" mode="create" :building-id="selectedBuildingId" @success="handleSuccess"
          @cancel="isCreateModalOpen = false" />
      </template>
    </UModal>

    <UModal v-model:open="isEditModalOpen" title="Edit Tenant">
      <template #body>
        <TenantForm v-if="selectedTenant && selectedBuildingId" mode="edit" :building-id="selectedBuildingId"
          :tenant="selectedTenant" @success="handleSuccess" @cancel="isEditModalOpen = false" />
      </template>
    </UModal>
  </div>
</template>