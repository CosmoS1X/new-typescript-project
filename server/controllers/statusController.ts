import { Request, Response } from 'express';
import { Status } from '../models';

export default () => ({
  getList: async (req: Request, res: Response) => {
    const statuses = await Status.query();

    res.status(200).json(statuses);
  },
  getItem: async (req: Request, res: Response) => {
    const status = await Status.query().findById(req.params.id);

    if (!status) {
      res.status(404).json({
        error: 'StatusNotFound',
        message: 'Status not found',
      });

      return;
    }

    res.status(200).json(status);
  },
  create: async (req: Request, res: Response) => {
    const validData = Status.fromJson(req.body);
    const existingStatus = await Status.query().findOne({ name: validData.name });

    if (existingStatus) {
      res.status(409).json({
        error: 'StatusAlreadyExists',
        message: 'Status with this name already exists',
      });

      return;
    }

    const newStatus = await Status.query().insert(validData);

    res.status(201).json(newStatus);
  },
  update: async (req: Request, res: Response) => {
    const validData = Status.fromJson(req.body);
    const existingStatus = await Status.query().findOne({ name: validData.name });
    const currentStatus = await Status.query().findById(req.params.id);

    if (!currentStatus) {
      res.status(404).json({
        error: 'StatusNotFound',
        message: 'Status not found',
      });

      return;
    }

    if (currentStatus.name === validData.name) {
      res.status(200).json(currentStatus);

      return;
    }

    if (existingStatus) {
      res.status(409).json({
        error: 'StatusAlreadyExists',
        message: 'Status with this name already exists',
      });

      return;
    }

    await currentStatus?.$query().patch(validData);

    res.status(200).json(currentStatus);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentStatus = await Status.query().findById(id);

    if (!currentStatus) {
      res.status(404).json({
        error: 'StatusNotFound',
        message: 'Status not found',
      });

      return;
    }

    await Status.query().deleteById(id);

    res.status(204).end();
  },
});
