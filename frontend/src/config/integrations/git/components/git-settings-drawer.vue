<template>
  <app-drawer
    v-model="isVisible"
    custom-class="integration-git-drawer"
    title="Git"
    pre-title="Integration"
    has-border
    @close="cancel"
  >
    <template #beforeTitle>
      <img class="w-6 h-6 mr-2" :src="logoUrl" alt="Git logo" />
    </template>
    <template #content>
      <div class="text-gray-900 text-sm font-medium">
        Remote URL(s)
      </div>
      <div class="text-2xs text-gray-500">
        Connect remotes for each Git repository.
      </div>

      <el-form class="mt-2" @submit.prevent>
        <app-array-input
          v-for="(_, ii) of form.remotes"
          :key="ii"
          v-model="form.remotes[ii]"
          placeholder="https://github.com/CrowdDotDev/crowd.dev.git"
        >
          <template #after>
            <el-button
              class="btn btn-link btn-link--md btn-link--primary w-10 h-10"
              @click="removeRemote(ii)"
            >
              <i class="ri-delete-bin-line text-lg" />
            </el-button>
          </template>
        </app-array-input>
      </el-form>

      <el-button class="btn btn-link btn-link--primary" @click="addRemote()">
        + Add remote URL
      </el-button>
    </template>

    <template #footer>
      <div>
        <el-button
          class="btn btn--md btn--secondary mr-4"
          :disabled="loading"
          @click="cancel"
        >
          Cancel
        </el-button>
        <el-button
          id="gitConnect"
          :disabled="$v.$invalid || !hasFormChanged || loading"
          class="btn btn--md btn--primary"
          :loading="loading"
          @click="connect"
        >
          {{ integration?.settings?.remotes?.length ? 'Update' : 'Connect' }}
        </el-button>
      </div>
    </template>
  </app-drawer>
</template>

<script setup>
import useVuelidate from '@vuelidate/core';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { CrowdIntegrations } from '@/integrations/integrations-config';
import AppArrayInput from '@/shared/form/array-input.vue';
import formChangeDetector from '@/shared/form/form-change';
import { mapActions } from '@/shared/vuex/vuex.helpers';
import { Platform } from '@/shared/modules/platform/types/Platform';
import { EventType, FeatureEventKey } from '@/shared/modules/monitoring/types/event';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  integration: {
    type: Object,
    default: null,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  segmentId: {
    type: String,
    default: null,
  },
  grandparentId: {
    type: String,
    default: null,
  },
});

const loading = ref(false);
const form = reactive({
  remotes: [''],
});

const { hasFormChanged, formSnapshot } = formChangeDetector(form);
const $v = useVuelidate({}, form, { $stopPropagation: true });

const { doGitConnect } = mapActions('integration');
const isVisible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
const logoUrl = computed(() => CrowdIntegrations.getConfig('git').image);

onMounted(() => {
  if (props.integration?.settings?.remotes?.length) {
    form.remotes = props.integration.settings.remotes;
  }
  formSnapshot();
});

const addRemote = () => {
  form.remotes.push('');
};

const removeRemote = (index) => {
  form.remotes.splice(index, 1);
};

const cancel = () => {
  isVisible.value = false;
};

const connect = async () => {
  loading.value = true;

  const isUpdate = !!props.integration?.settings?.remotes?.length;

  doGitConnect({
    remotes: form.remotes,
    isUpdate,
    segmentId: props.segmentId,
    grandparentId: props.grandparentId,
  })
    .then(() => {
      trackEvent({
        key: isUpdate ? FeatureEventKey.EDIT_INTEGRATION_SETTINGS : FeatureEventKey.CONNECT_INTEGRATION,
        type: EventType.FEATURE,
        properties: {
          platform: Platform.GIT,
        },
      });

      isVisible.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<script>
export default {
  name: 'LfGitSettingsDrawer',
};
</script>
