<template>
  <lf-dropdown-item
    v-if="hasPermission(LfPermission.organizationEdit) && props.organization.identities.length > 1"
    @click="unmerge = props.organization"
  >
    <lf-icon-old name="link-unlink-m" />
    Unmerge identity
  </lf-dropdown-item>
  <lf-dropdown-item
    v-if="hasPermission(LfPermission.organizationEdit)"
    @click="markTeamOrganization(!props.organization.isTeamOrganization)"
  >
    <lf-icon-old name="team-line" />
    {{ props.organization.isTeamOrganization ? 'Unmark' : 'Mark' }} as team organization
  </lf-dropdown-item>

  <template v-if="hasPermission(LfPermission.organizationDestroy)">
    <lf-dropdown-separator />
    <lf-dropdown-item type="danger" @click="deleteOrganization()">
      <lf-icon-old name="delete-bin-6-line" />
      Delete organization
    </lf-dropdown-item>
  </template>

  <app-organization-unmerge-dialog
    v-if="unmerge"
    v-model="unmerge"
  />
</template>

<script setup lang="ts">
import LfIconOld from '@/ui-kit/icon/IconOld.vue';
import LfDropdownItem from '@/ui-kit/dropdown/DropdownItem.vue';
import LfDropdownSeparator from '@/ui-kit/dropdown/DropdownSeparator.vue';
import usePermissions from '@/shared/modules/permissions/helpers/usePermissions';
import { LfPermission } from '@/shared/modules/permissions/types/Permissions';
import { EventType, FeatureEventKey } from '@/shared/modules/monitoring/types/event';
import useProductTracking from '@/shared/modules/monitoring/useProductTracking';
import { useRoute, useRouter } from 'vue-router';
import { doManualAction } from '@/shared/helpers/manualAction.helpers';
import ConfirmDialog from '@/shared/dialog/confirm-dialog';
import { Organization } from '@/modules/organization/types/Organization';
import { OrganizationService } from '@/modules/organization/organization-service';
import AppOrganizationUnmergeDialog from '@/modules/organization/components/organization-unmerge-dialog.vue';
import { ref } from 'vue';
import { useOrganizationStore } from '@/modules/organization/store/pinia';

const props = defineProps<{
  organization: Organization,
}>();

const emit = defineEmits<{(e: 'reload'): any}>();

const route = useRoute();
const router = useRouter();
const { hasPermission } = usePermissions();
const { trackEvent } = useProductTracking();

const unmerge = ref<Organization | null>(null);

const { fetchOrganization } = useOrganizationStore();

const markTeamOrganization = (teamOrganization: boolean) => {
  trackEvent({
    key: FeatureEventKey.MARK_AS_TEAM_ORGANIZATION,
    type: EventType.FEATURE,
    properties: {
      path: route.path,
      teamOrganization,
    },
  });

  doManualAction({
    loadingMessage: 'Organization is being updated',
    successMessage: 'Organization updated successfully',
    errorMessage: 'Something went wrong',
    actionFn: OrganizationService.update(props.organization.id, {
      isTeamOrganization: teamOrganization,
    }, props.organization.segments),
  }).then(() => {
    fetchOrganization(props.organization.id);
    emit('reload');
  });
};

const deleteOrganization = () => {
  ConfirmDialog({
    type: 'danger',
    title: 'Delete organization',
    message: "Are you sure you want to proceed? You can't undo this action",
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    icon: 'ri-delete-bin-line',
  }).then(() => {
    trackEvent({
      key: FeatureEventKey.DELETE_ORGANIZATION,
      type: EventType.FEATURE,
      properties: {
        path: route.path,
      },
    });

    doManualAction({
      loadingMessage: 'Organization is being deleted',
      successMessage: 'Organization successfully deleted',
      errorMessage: 'Something went wrong',
      actionFn: OrganizationService.destroyAll([props.organization.id]),
    }).then(() => {
      router.push({
        path: '/organizations',
        query: {
          projectGroup: route.query.projectGroup,
        },
      });
    });
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfOrganizationDropdown',
};
</script>
