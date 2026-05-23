import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { NSpin } from 'naive-ui'
import LoadingState from '../components/LoadingState.vue'

describe('LoadingState', () => {
  it('應正確渲染外層容器', () => {
    const wrapper = shallowMount(LoadingState)
    expect(wrapper.find('.center-state').exists()).toBe(true)
  })

  it('應包含 NSpin 元件', () => {
    const wrapper = shallowMount(LoadingState)
    expect(wrapper.findComponent(NSpin).exists()).toBe(true)
  })
})
