<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ApiResponse } from '~/types'
import type { Payment } from '~/types/payment'

definePageMeta({
  layout: 'tenant',
})

const { api } = useApi()
const toast = useToast()

const payments = ref<Payment[]>([])
const loading = ref(false)

const columns: TableColumn<Payment>[] = [
  { accessorKey: 'paymentDate', header: 'Date' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'notes', header: 'Notes' },
]

async function fetchPayments() {
  loading.value = true
  try {
    const response = await api<ApiResponse<Payment[]>>('/v1/tenant/payment-history')
    payments.value = response.data
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch payments', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Payment History</h1>
      <p class="text-gray-600 mt-1">View your payment records and transaction history</p>
    </div>

    <UCard>
      <UTable :data="payments" :columns="columns" :loading="loading">
        <template #paymentDate-cell="{ row }">
          {{ new Date(row.original.paymentDate).toLocaleDateString() }}
        </template>

        <template #type-cell="{ row }">
          <span class="capitalize">{{ row.original.type }}</span>
        </template>

        <template #amount-cell="{ row }">
          <span class="font-medium">${{ row.original.amount.toLocaleString() }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'completed' ? 'success' : row.original.status === 'pending' ? 'warning' : row.original.status === 'failed' ? 'error' : 'neutral'"
            variant="subtle" class="capitalize">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #notes-cell="{ row }">
          <span class="text-gray-500">{{ row.original.notes || '-' }}</span>
        </template>

        <template #empty>
          <div class="text-center py-12">
            <UIcon name="i-heroicons-banknotes" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-900 font-medium mb-2">No payment history</p>
            <p class="text-gray-500">Your payment records will appear here</p>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>