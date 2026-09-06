import { Request, Response } from 'express';
import { DEFAULT_PLACEMENT_COMPANIES, getPlacementReadiness } from '../services/placement.service.js';

export function getCompanies(_req: Request, res: Response) {
  res.json(DEFAULT_PLACEMENT_COMPANIES);
}

export function getCompany(req: Request, res: Response) {
  const company = DEFAULT_PLACEMENT_COMPANIES.find((item) => item.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
}

export function upsertPlacementEntity(req: Request, res: Response) {
  res.status(201).json({ saved: true, payload: req.body });
}

export function patchPlacementEntity(req: Request, res: Response) {
  res.json({ updated: true, id: req.params.id, payload: req.body });
}

export function readiness(_req: Request, res: Response) {
  res.json(getPlacementReadiness());
}
