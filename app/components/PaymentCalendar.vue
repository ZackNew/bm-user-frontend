<script setup lang="ts">
import type { PaymentCalendar, PaymentPeriodStatus } from '~/types/payment'
import type { ApiResponse } from '~/types'

const props = defineProps<{
  buildingId: string
  tenantId: string
}>()

const { buildingApi } = useApi()
const toast = useToast()

const calendar = ref<PaymentCalendar[]>([])
const loading = ref(false)

const statusColors: Record<PaymentPeriodStatus, string> = {
  paid: 'bg-green-100 text-green-800 border-green-300',
  unpaid: 'bg-gray-100 text-gray-800 border-gray-300',
  overdue: 'bg-red-100 text-red-800 border-red-300',
}

async function fetchCalendar() {
  loading.value = true
  try {
    const response = await buildingApi<ApiResponse<PaymentCalendar[]>>(
      props.buildingId,
      `/v1/app/payments/calendar/${props.tenantId}`
    )
    calendar.value = response.data
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch payment calendar', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

function formatMonth(monthStr: string) {
  return new Date(monthStr + '-01').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  fetchCalendar()
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-400 mx-auto" />
    </div>

    <div v-else-if="calendar.length === 0" class="text-center py-8 text-gray-500">
      No active lease found
    </div>

    <div v-else v-for="lease in calendar" :key="lease.leaseId" class="space-y-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Lease Period: {{ new Date(lease.startDate).toLocaleDateString() }} - {{ new
          Date(lease.endDate).toLocaleDateString() }}</span>
        <span class="font-medium">${{ lease.rentAmount.toLocaleString() }}/month</span>
      </div>

      <div class="grid grid-cols-6 gap-2">
        <div v-for="period in lease.periods" :key="period.id" :class="[
          'p-3 rounded-lg border text-center text-xs font-medium',
          statusColors[period.status]
        ]">
          <div>{{ formatMonth(period.month) }}</div>
          <div v-if="period.paidAt" class="text-[10px] mt-1 opacity-75">
            {{ new Date(period.paidAt).toLocaleDateString() }}
          </div>
        </div>
      </div>

      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
          <span>Paid</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
          <span>Unpaid</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
          <span>Overdue</span>
        </div>
      </div>
    </div>
  </div>
</template>