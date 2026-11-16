import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { DOCUMENT_TYPES, UPLOAD_PARAMETERS } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { createDelivery, createOrder, createUser, expectError } from '../helpers/factories.js';
import { clearUploads, fileExists, listAllUploaded, listUploaded, samplePdf, samplePng } from '../helpers/uploads.js';

const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';
const { FOLDERS, MAX_FILE_SIZE } = UPLOAD_PARAMETERS;

const attachFile = (req, { buffer, filename, contentType }, field = 'file') =>
  req.attach(field, buffer, { filename, contentType });

const uploadDocument = (userId, file = samplePdf(), documentType = DOCUMENT_TYPES.ID_CARD) => {
  const req = request(app).post(`/api/users/${userId}/documents`);
  if (documentType !== null) req.field('documentType', documentType);
  return file ? attachFile(req, file) : req;
};

describe('Archivos (Multer)', () => {
  beforeEach(async () => {
    await clearDatabase();
    await clearUploads();
  });
  after(async () => {
    await clearDatabase();
    await clearUploads();
  });

  describe('POST /api/users/:id/documents', () => {
    it('sube un documento, lo guarda en disco y registra los metadatos', async () => {
      const user = await createUser();

      const res = await uploadDocument(user._id);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload._id).to.equal(user._id);
      expect(res.body.payload).to.not.have.property('password');
      expect(res.body.payload.documents).to.have.lengthOf(1);

      const doc = res.body.payload.documents[0];
      expect(doc).to.include.keys('_id', 'originalName', 'fileName', 'path', 'mimeType', 'size', 'documentType', 'uploadedAt');
      expect(doc.originalName).to.equal('dni-frente.pdf');
      expect(doc.fileName).to.not.equal('dni-frente.pdf');
      expect(doc.mimeType).to.equal('application/pdf');
      expect(doc.documentType).to.equal(DOCUMENT_TYPES.ID_CARD);
      expect(doc.size).to.equal(samplePdf().buffer.length);
      expect(doc.path).to.match(/documents\/.+\.pdf$/);
      expect(await fileExists(doc.path)).to.equal(true);
    });

    it('guarda las licencias en su propia carpeta', async () => {
      const user = await createUser();

      const res = await uploadDocument(user._id, samplePng(), DOCUMENT_TYPES.LICENSE);

      expect(res.status).to.equal(201);
      expect(res.body.payload.documents[0].path).to.match(/licenses\/.+\.png$/);
      expect(await listUploaded(FOLDERS.LICENSES)).to.have.lengthOf(1);
      expect(await listUploaded(FOLDERS.DOCUMENTS)).to.be.empty;
    });

    it('acumula varios documentos sobre el mismo usuario', async () => {
      const user = await createUser();

      await uploadDocument(user._id);
      const res = await uploadDocument(user._id, samplePng(), DOCUMENT_TYPES.INVOICE);

      expect(res.body.payload.documents).to.have.lengthOf(2);
    });

    it('responde 400 si falta el archivo', async () => {
      const user = await createUser();

      const res = await uploadDocument(user._id, null);

      expectError(res, 400, ErrorDictionary.FILE_REQUIRED);
    });

    it('responde 415 si el tipo de archivo no esta permitido', async () => {
      const user = await createUser();
      const exe = { buffer: Buffer.from('MZ'), filename: 'virus.exe', contentType: 'application/x-msdownload' };

      const res = await uploadDocument(user._id, exe);

      expectError(res, 415, ErrorDictionary.INVALID_FILE_TYPE);
      expect(await listAllUploaded()).to.be.empty;
    });

    it('responde 415 si la extension no coincide con el tipo declarado', async () => {
      const user = await createUser();
      const fake = { buffer: Buffer.from('hola'), filename: 'script.js', contentType: 'application/pdf' };

      const res = await uploadDocument(user._id, fake);

      expectError(res, 415, ErrorDictionary.INVALID_FILE_TYPE);
    });

    it('responde 413 si el archivo supera el tamaño maximo', async () => {
      const user = await createUser();
      const big = { buffer: Buffer.alloc(MAX_FILE_SIZE + 1), filename: 'enorme.pdf', contentType: 'application/pdf' };

      const res = await uploadDocument(user._id, big);

      expectError(res, 413, ErrorDictionary.FILE_TOO_LARGE);
      expect(await listAllUploaded()).to.be.empty;
    });

    it('responde 400 si el archivo viene en un campo con otro nombre', async () => {
      const user = await createUser();

      const res = await attachFile(
        request(app).post(`/api/users/${user._id}/documents`).field('documentType', DOCUMENT_TYPES.ID_CARD),
        samplePdf(),
        'documento'
      );

      expectError(res, 400, ErrorDictionary.INVALID_FILE_FIELD);
    });

    it('responde 400 si el tipo de documento no es valido y no deja el archivo en disco', async () => {
      const user = await createUser();

      const res = await uploadDocument(user._id, samplePdf(), 'pasaporte');

      expectError(res, 400, ErrorDictionary.INVALID_DOCUMENT_TYPE);
      expect(await listAllUploaded()).to.be.empty;
    });

    it('responde 400 si no se envia el tipo de documento', async () => {
      const user = await createUser();

      const res = await uploadDocument(user._id, samplePdf(), null);

      expectError(res, 400, ErrorDictionary.INVALID_DOCUMENT_TYPE);
    });

    it('responde 404 si el usuario no existe y no deja el archivo en disco', async () => {
      const res = await uploadDocument(NON_EXISTENT_ID);

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
      expect(await listAllUploaded()).to.be.empty;
    });

    it('responde 400 si el id del usuario no es valido', async () => {
      const res = await uploadDocument('abc');

      expectError(res, 400, ErrorDictionary.INVALID_ID);
      expect(await listAllUploaded()).to.be.empty;
    });
  });

  describe('GET /api/users/:id/documents', () => {
    it('devuelve los documentos asociados al usuario', async () => {
      const user = await createUser();
      await uploadDocument(user._id);

      const res = await request(app).get(`/api/users/${user._id}/documents`);

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0]).to.include({ originalName: 'dni-frente.pdf', documentType: DOCUMENT_TYPES.ID_CARD });
    });

    it('devuelve una lista vacia si no hay documentos', async () => {
      const user = await createUser();

      const res = await request(app).get(`/api/users/${user._id}/documents`);

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').that.is.empty;
    });

    it('responde 404 si el usuario no existe', async () => {
      const res = await request(app).get(`/api/users/${NON_EXISTENT_ID}/documents`);

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
    });

    it('no permite cargar documentos mandandolos por el body del usuario', async () => {
      const user = await createUser();

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ documents: [{ originalName: 'trucho.pdf' }] });

      expect(res.status).to.equal(200);
      expect(res.body.payload.documents).to.be.an('array').that.is.empty;
    });
  });

  [
    {
      resource: 'orders',
      label: 'pedido',
      create: createOrder,
      notFound: ErrorDictionary.ORDER_NOT_FOUND,
    },
    {
      resource: 'deliveries',
      label: 'entrega',
      create: createDelivery,
      notFound: ErrorDictionary.DELIVERY_NOT_FOUND,
    },
  ].forEach(({ resource, label, create, notFound }) => {
    describe(`/api/${resource}/:id/receipts`, () => {
      const uploadReceipt = (id, file = samplePdf()) => {
        const req = request(app).post(`/api/${resource}/${id}/receipts`);
        return file ? attachFile(req, file) : req;
      };

      it(`sube un comprobante y lo asocia al ${label}`, async () => {
        const entity = await create();

        const res = await uploadReceipt(entity._id);

        expect(res.status).to.equal(201);
        expect(res.body.status).to.equal('success');
        expect(res.body.payload._id).to.equal(entity._id);
        expect(res.body.payload.receipts).to.have.lengthOf(1);

        const receipt = res.body.payload.receipts[0];
        expect(receipt).to.include.keys('originalName', 'fileName', 'path', 'mimeType', 'size', 'documentType', 'uploadedAt');
        expect(receipt.documentType).to.equal(DOCUMENT_TYPES.PROOF_OF_DELIVERY);
        expect(receipt.path).to.match(/receipts\/.+\.pdf$/);
        expect(await fileExists(receipt.path)).to.equal(true);
      });

      it('lista los comprobantes del recurso', async () => {
        const entity = await create();
        await uploadReceipt(entity._id);
        await uploadReceipt(entity._id, samplePng());

        const res = await request(app).get(`/api/${resource}/${entity._id}/receipts`);

        expect(res.status).to.equal(200);
        expect(res.body.payload).to.have.lengthOf(2);
      });

      it('responde 400 si falta el archivo', async () => {
        const entity = await create();

        const res = await uploadReceipt(entity._id, null);

        expectError(res, 400, ErrorDictionary.FILE_REQUIRED);
      });

      it('responde 415 si el tipo no esta permitido', async () => {
        const entity = await create();
        const txt = { buffer: Buffer.from('hola'), filename: 'notas.txt', contentType: 'text/plain' };

        const res = await uploadReceipt(entity._id, txt);

        expectError(res, 415, ErrorDictionary.INVALID_FILE_TYPE);
      });

      it('responde 413 si el archivo es demasiado grande', async () => {
        const entity = await create();
        const big = { buffer: Buffer.alloc(MAX_FILE_SIZE + 1), filename: 'enorme.pdf', contentType: 'application/pdf' };

        const res = await uploadReceipt(entity._id, big);

        expectError(res, 413, ErrorDictionary.FILE_TOO_LARGE);
      });

      it(`responde 404 si el ${label} no existe y no deja el archivo en disco`, async () => {
        const res = await uploadReceipt(NON_EXISTENT_ID);

        expectError(res, 404, notFound);
        expect(await listAllUploaded()).to.be.empty;
      });

      it('responde 404 al listar comprobantes de un recurso inexistente', async () => {
        const res = await request(app).get(`/api/${resource}/${NON_EXISTENT_ID}/receipts`);

        expectError(res, 404, notFound);
      });
    });
  });
});
