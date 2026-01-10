<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ApiResponse } from '~/types'
import type { MaintenanceRequest } from '~/types/maintenance-request'

definePageMeta({
  layout: 'tenant',
})

const { api } = useApi()
const toast = useToast()

const requests = ref<MaintenanceRequest[]>([])
const loading = ref(false)
const isCreateModalOpen = ref(false)

const columns: TableColumn<MaintenanceRequest>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'priority', header: 'Priority' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Submitted' },
  { id: 'actions', header: 'Actions' },
]

async function fetchRequests() {
  loading.value = true
  try {
    const response = await api<ApiResponse<MaintenanceRequest[]>>('/v1/tenant/maintenance-requests')
    requests.value = response.data
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch requests', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

function handleSuccess() {
  isCreateModalOpen.value = false
  fetchRequests()
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <p class="text-gray-600 mt-1">Submit and track your maintenance requests</p>
      </div>

      <UButton color="primary" icon="i-heroicons-plus" @click="isCreateModalOpen = true">
        New Request
      </UButton>
    </div>

    <UCard>
      <UTable :data="requests" :columns="columns" :loading="loading">
        <template #priority-cell="{ row }">
          <UBadge
            :color="row.original.priority === 'urgent' ? 'error' : row.original.priority === 'high' ? 'warning' : row.original.priority === 'medium' ? 'primary' : 'neutral'"
            variant="subtle" class="capitalize">
            {{ row.original.priority }}
          </UBadge>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'completed' ? 'success' : row.original.status === 'in_progress' ? 'primary' : 'neutral'"
            variant="subtle" class="capitalize">
            {{ row.original.status.replace('_', ' ') }}
          </UBadge>
        </template>

        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleDateString() }}
        </template>

        <template #actions-cell="{ row }">
          <UButton size="xs" color="neutral" variant="ghost" :to="`/tenant/maintenance/${row.original.id}`">
            View
          </UButton>
        </template>

        <template #empty>
          <div class="text-center py-12">
            <UIcon name="i-heroicons-wrench-screwdriver" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-900 font-medium mb-2">No maintenance requests yet</p>
            <p class="text-gray-500 mb-4">Submit your first maintenance request</p>
            <UButton color="primary" @click="isCreateModalOpen = true">
              New Request
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isCreateModalOpen" title="New Maintenance Request">
      <template #body>
        <TenantMaintenanceForm @success="handleSuccess" @cancel="isCreateModalOpen = false" />
      </template>
    </UModal>
  </div>
</template>