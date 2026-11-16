import filesService from '../services/files.service.js';

class FilesController {
  async uploadUserDocument(req, res, next) {
    try {
      const user = await filesService.uploadUserDocument(req.params.id, req.file, req.body?.documentType);
      res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  }

  async getUserDocuments(req, res, next) {
    try {
      const documents = await filesService.getUserDocuments(req.params.id);
      res.json({ status: 'success', payload: documents });
    } catch (error) {
      next(error);
    }
  }

  async uploadOrderReceipt(req, res, next) {
    try {
      const order = await filesService.uploadOrderReceipt(req.params.id, req.file);
      res.status(201).json({ status: 'success', payload: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderReceipts(req, res, next) {
    try {
      const receipts = await filesService.getOrderReceipts(req.params.id);
      res.json({ status: 'success', payload: receipts });
    } catch (error) {
      next(error);
    }
  }

  async uploadDeliveryReceipt(req, res, next) {
    try {
      const delivery = await filesService.uploadDeliveryReceipt(req.params.id, req.file);
      res.status(201).json({ status: 'success', payload: delivery });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryReceipts(req, res, next) {
    try {
      const receipts = await filesService.getDeliveryReceipts(req.params.id);
      res.json({ status: 'success', payload: receipts });
    } catch (error) {
      next(error);
    }
  }
}

export default new FilesController();
