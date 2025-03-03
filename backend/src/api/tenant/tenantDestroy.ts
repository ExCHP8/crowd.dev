import { Error403 } from '@crowd/common'

import TenantService from '../../services/tenantService'

export default async (req, res) => {
  if (!req.currentUser || !req.currentUser.id) {
    throw new Error403(req.language)
  }

  // In the case of the Tenant, specific permissions like tenantDestroy and tenantEdit are
  // checked inside the service
  await new TenantService(req).destroyAll(req.query.ids)

  const payload = true

  await req.responseHandler.success(req, res, payload)
}
