import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '../components/TaskCard.vue'
import { TaskPriority } from '~/types/task'

const baseTask = {
  id: '1',
  title: 'Test Task',
  description: 'A test task',
  completed: false,
  priority: TaskPriority.HIGH, // Use enum, not string
  category: 'Work',
  dueDate: new Date(),
  tags: ['urgent', 'frontend', 'bug'],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('TaskCard', () => {
  it('renders task title and description', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask },
    })
    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('A test task')
  })

  it('emits edit event when card is clicked', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(baseTask)
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask },
      global: {
        stubs: {
          UButton: {
            template: '<button aria-label="Delete Task" @click="$emit(\'click\', { stopPropagation: () => {} })"></button>'
          }
        },
      },
    })
    const btn = wrapper.find('button[aria-label="Delete Task"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]?.[0]).toBe(baseTask.id)
  })

  it('emits toggle-completion when checkbox is changed', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask },
      global: {
        stubs: ['UCheckbox'],
      },
    })
    const checkbox = wrapper.findComponent({ name: 'UCheckbox' })
    expect(checkbox.exists()).toBe(true)
    await checkbox.vm.$emit('change', baseTask.id)
    expect(wrapper.emitted('toggle-completion')).toBeTruthy()
    expect(wrapper.emitted('toggle-completion')?.[0]?.[0]).toBe(baseTask.id)
  })

  it('shows tags and category', () => {
    const wrapper = mount(TaskCard, {
      props: { task: baseTask },
    })
    expect(wrapper.text()).toContain('Work')
    expect(wrapper.text()).toContain('#urgent')
    expect(wrapper.text()).toContain('#frontend')
    expect(wrapper.text()).toContain('#bug')
  })
})
