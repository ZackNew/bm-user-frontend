<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ApiResponse } from '~/types'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { api } = useApi()
const toast = useToast()

const state = reactive({
  title: '',
  description: '',
  priority: 'medium',
})

const loading = ref(false)

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const selectedPriority = computed({
  get: () => priorityOptions.find(p => p.value === state.priority),
  set: (val: { value: string; label: string } | undefined) => {
    state.priority = val?.value || 'medium'
  }
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  loading.value = true
  try {
    await api<ApiResponse<any>>('/v1/tenant/maintenance-requests', {
      method: 'POST',
      body: event.data,
    })
    toast.add({ title: 'Maintenance request submitted successfully', color: 'success' })
    emit('success')
  } catch (error: any) {
    toast.add({
      title: 'Failed to submit request',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :state="state" @submit="onSubmit" class="space-y-4">
    <UFormField label="Title" name="title" required>
      <UInput v-model="state.title" placeholder="Brief description of the issue" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="Description" name="description" required>
      <UTextarea v-model="state.description" placeholder="Provide detailed information about the issue" :rows="4"
        :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="Priority" name="priority">
      <USelectMenu v-model="selectedPriority" :items="priorityOptions" class="w-full" />
    </UFormField>

    <div class="flex gap-2 justify-end pt-4">
      <UButton type="button" color="neutral" variant="ghost" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" :loading="loading">
        Submit Request
      </UButton>
    </div>
  </UForm>
</template>