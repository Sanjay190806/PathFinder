import { Router } from 'express';
import { getCompanies, getCompany, patchPlacementEntity, readiness, upsertPlacementEntity } from '../controllers/placement.controller.js';

const router = Router();

router.get('/placement/companies', getCompanies);
router.get('/placement/companies/:id', getCompany);
router.post('/placement/applications', upsertPlacementEntity);
router.patch('/placement/applications/:id', patchPlacementEntity);
router.post('/placement/interviews', upsertPlacementEntity);
router.patch('/placement/interviews/:id', patchPlacementEntity);
router.post('/placement/oa', upsertPlacementEntity);
router.patch('/placement/oa/:id', patchPlacementEntity);
router.get('/placement/readiness', readiness);

export default router;
