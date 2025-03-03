<template>
  <el-popover v-model:visible="open" :placement="$attrs.placement || 'bottom-end'" size="large" width="20rem" popper-class="!p-0" trigger="click">
    <template #reference>
      <lf-button type="secondary">
        <lf-icon name="bars-filter" />
        Filters
      </lf-button>
    </template>

    <div v-if="options.length > 5" class="border-b border-gray-100 p-2">
      <el-input
        ref="queryInput"
        v-model="search"
        placeholder="Search..."
        class="filter-dropdown-search"
        data-qa="filter-list-search"
      >
        <template #prefix>
          <lf-icon name="search" :size="16" />
        </template>
      </el-input>
    </div>
    <div class="max-h-80 overflow-auto px-2 py-3">
      <article
        v-for="{ key, label, iconClass } in filteredOptions"
        :key="key"
        class="mb-1 p-3 rounded flex justify-between items-center transition whitespace-nowrap h-10 hover:bg-gray-50 text-xs"
        :class="isSelected(key) ? 'bg-gray-50 text-gray-400' : 'text-gray-900 cursor-pointer'"
        data-qa="filter-list-item"
        @click="add(key)"
      >
        <span class="flex items-center"><lf-icon :name="iconClass" :size="16" class="text-gray-400 mr-3" />{{ label }}</span>
        <i :class="isSelected(key) ? 'opacity-100' : 'opacity-0'" class="ri-check-line !text-gray-400 !mr-0 ml-1" />
      </article>

      <!-- CUSTOM ATTRIBUTES -->
      <template v-if="props.customConfig && Object.keys(props.customConfig).length > 0 && filteredCustomOptions.length > 0">
        <div
          class="el-dropdown-title !my-3"
        >
          Custom Attributes
        </div>
        <article
          v-for="{ key, label } in filteredCustomOptions"
          :key="key"
          class="mb-1 p-3 rounded flex justify-between items-center transition whitespace-nowrap h-10 hover:bg-gray-50 text-xs"
          :class="isSelected(key) ? 'bg-gray-50 text-gray-400' : 'text-gray-900 cursor-pointer'"
          data-qa="filter-list-item-custom"
          @click="add(key)"
        >
          <span class="first-letter:uppercase lowercase">{{ label }}</span>
          <i :class="isSelected(key) ? 'opacity-100' : 'opacity-0'" class="ri-check-line !text-gray-400 !mr-0 ml-1" />
        </article>
      </template>
      <div
        v-if="filteredOptions.length === 0 && filteredCustomOptions.length === 0"
        class="el-dropdown-title !mt-2"
      >
        No results
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps, ref,
} from 'vue';
import { FilterConfig } from '@/shared/modules/filters/types/FilterConfig';
import { FeatureFlag } from '@/utils/featureFlag';
import LfButton from '@/ui-kit/button/Button.vue';
import LfIcon from '@/ui-kit/icon/Icon.vue';

const props = defineProps<{
  config: Record<string, FilterConfig>,
  customConfig: Record<string, FilterConfig>,
  modelValue: string[]
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string[]), (e: 'open', value: string)}>();

const open = ref<boolean>(false);
const search = ref<string>('');

const matchesSearch = (label: string, query: string): boolean => label.toLowerCase().includes(query.toLowerCase());
const isSelected = (key: string): boolean => props.modelValue.includes(key);

const options = computed(() => Object.entries(props.config)
  .map(([key, configuration]: [string, FilterConfig]) => ({
    ...configuration,
    key,
  }))
  .filter((config) => (config.featureFlag ? FeatureFlag.isFlagEnabled(
    config.featureFlag,
  ) : true)));

const customOptions = computed(() => Object.entries(props.customConfig).map(([key, configuration]: [string, FilterConfig]) => ({
  ...configuration,
  key,
})));

const filteredOptions = computed(() => options.value.filter((filter) => matchesSearch(filter.label, search.value)));

const filteredCustomOptions = computed(() => customOptions.value.filter((filter) => matchesSearch(filter.label, search.value)));

const add = (key: string) => {
  if (isSelected(key)) {
    return;
  }
  search.value = '';
  open.value = false;
  emit('open', key);
  emit('update:modelValue', [...props.modelValue, key]);
};

</script>

<script lang="ts">
export default {
  name: 'LfFilterDropdown',
};
</script>
