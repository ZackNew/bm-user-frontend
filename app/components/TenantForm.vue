<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { createTenantSchema, updateTenantSchema, type CreateTenantSchema, type UpdateTenantSchema } from '~/schemas/tenant'
import type { Tenant } from '~/types/tenant'
import { TenantStatus } from '~/types/tenant'
import type { Unit } from '~/types/unit'
import type { ApiResponse } from '~/types'

const props = defineProps<{
  mode: 'create' | 'edit'
  buildingId: string
  tenant?: Tenant
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { buildingApi } = useApi()
const toast = useToast()

const state = reactive<{
  name: string
  email: string
  phone?: string
  unitId?: string
  status: TenantStatus,
  password?: string
}>({
  name: props.tenant?.name || '',
  email: props.tenant?.email || '',
  phone: props.tenant?.phone,
  unitId: props.tenant?.unitId,
  status: props.tenant?.status || TenantStatus.ACTIVE,
  password: '',
})

const loading = ref(false)
const loadingUnits = ref(false)
const units = ref<Unit[]>([])

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const unitOptions = computed(() => [
  { value: undefined, label: 'No Unit Assigned' },
  ...units.value.map(u => ({
    value: u.id,
    label: `${u.unitNumber}${u.floor ? ` - Floor ${u.floor}` : ''} ${u.status === 'occupied' ? '(Occupied)' : ''}`,
    disabled: u.status === 'occupied' && u.id !== props.tenant?.unitId
  }))
])

const selectedStatus = computed({
  get: () => statusOptions.find(s => s.value === state.status),
  set: (val: { value: string; label: string } | undefined) => {
    state.status = (val?.value as TenantStatus) || 'active'
  }
})

const selectedUnit = computed({
  get: () => unitOptions.value.find(u => u.value === state.unitId),
  set: (val: { value: string | undefined; label: string } | undefined) => {
    state.unitId = val?.value
  }
})

async function fetchUnits() {
  loadingUnits.value = true
  try {
    const response = await buildingApi<ApiResponse<Unit[]>>(
      props.buildingId,
      '/v1/app/units'
    )
    units.value = response.data
    console.log('Fetched units:', response.data)
  } catch (error: any) {
    toast.add({ title: 'Failed to fetch units', description: error.message, color: 'error' })
  } finally {
    loadingUnits.value = false
  }
}

async function onSubmit(event: FormSubmitEvent<CreateTenantSchema | UpdateTenantSchema>) {
  loading.value = true
  try {
    if (props.mode === 'create') {
      await buildingApi<ApiResponse<Tenant>>(
        props.buildingId,
        '/v1/app/tenants',
        {
          method: 'POST',
          body: event.data,
        }
      )
      toast.add({ title: 'Tenant created successfully', color: 'success' })
    } else {
      await buildingApi<ApiResponse<Tenant>>(
        props.buildingId,
        `/v1/app/tenants/${props.tenant!.id}`,
        {
          method: 'PATCH',
          body: event.data,
        }
      )
      toast.add({ title: 'Tenant updated successfully', color: 'success' })
    }
    emit('success')
  } catch (error: any) {
    toast.add({
      title: props.mode === 'create' ? 'Failed to create tenant' : 'Failed to update tenant',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUnits()
})
</script>

<template>
  <UForm :schema="mode === 'create' ? createTenantSchema : updateTenantSchema" :state="state" @submit="onSubmit"
    class="space-y-4">
    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" placeholder="John Doe" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" type="email" placeholder="john@example.com" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="Phone" name="phone">
      <UInput v-model="state.phone" type="tel" placeholder="+1 234 567 8900" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="Unit Assignment" name="unitId">
      <USelectMenu v-model="selectedUnit" :items="unitOptions" :loading="loadingUnits" placeholder="Select a unit"
        class="w-full" />
    </UFormField>

    <UFormField label="Status" name="status">
      <USelectMenu v-model="selectedStatus" :items="statusOptions" class="w-full" />
    </UFormField>

    <UFormField v-if="mode === 'create'" label="Password (Optional)" name="password">
      <UInput v-model="state.password" type="password" placeholder="Leave empty for no password"
        :ui="{ root: 'w-full' }" />
    </UFormField>

    <div class="flex gap-2 justify-end pt-4">
      <UButton type="button" color="neutral" variant="ghost" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" :loading="loading">
        {{ mode === 'create' ? 'Create Tenant' : 'Update Tenant' }}
      </UButton>
    </div>
  </UForm>
</template>