import prisma from '../config/prismaClient.js';
import { getFinancialYearCode, generateDocumentNumber } from '../utils/helpers.js';

export const createCreditNote = async (req, res) => {
  const {
    invoiceId,
    clientId,
    issueDate,
    amount,
    description
  } = req.body;

  if (!clientId || !issueDate || !amount) {
    return res.status(400).json({ message: 'Client ID, issue date, and amount are required.' });
  }

  try {
    const profile = await prisma.profile.findFirst();
    if (!profile || !profile.companyCode) {
      return res.status(400).json({ message: 'Company code not set in profile. Please set it in company profile settings.' });
    }
    const companyCode = profile.companyCode;
    const yearCode = getFinancialYearCode(new Date(issueDate));
    const typeCode = 'CN';
    
    const count = await prisma.creditNote.count({
      where: {
        docNo: {
          startsWith: `${companyCode}-${yearCode}-${typeCode}-`
        }
      }
    });
    const sequence = count + 1;
    const docNo = generateDocumentNumber(companyCode, yearCode, typeCode, sequence);

    const existingCreditNote = await prisma.creditNote.findUnique({ where: { docNo } });
    if (existingCreditNote) {
      return res.status(409).json({ message: 'Generated Credit Note document number already exists, please try again.' });
    }

    const creditNote = await prisma.creditNote.create({
      data: {
        invoiceId: invoiceId || null,
        clientId,
        issueDate: new Date(issueDate),
        docNo,
        amount: parseFloat(amount),
        description
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            amount: true,
            invoiceDate: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Credit Note created', creditNote });
  } catch (error) {
    console.error('Create credit note error:', error);
    res.status(500).json({ message: 'Failed to create credit note' });
  }
};

export const getAllCreditNotes = async (req, res) => {
  try {
    const creditNotes = await prisma.creditNote.findMany({
      orderBy: { issueDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            amount: true,
            invoiceDate: true
          }
        }
      }
    });
    res.status(200).json(creditNotes);
  } catch (error) {
    console.error('Get credit notes error:', error);
    res.status(500).json({ message: 'Failed to fetch credit notes' });
  }
};

export const getCreditNoteById = async (req, res) => {
  const creditNoteId = parseInt(req.params.id);

  try {
    const creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      include: {
        client: true,
        invoice: {
          include: {
            invoiceItems: {
              include: {
                item: true
              }
            }
          }
        }
      }
    });

    if (!creditNote) {
      return res.status(404).json({ message: 'Credit Note not found' });
    }

    res.status(200).json(creditNote);
  } catch (error) {
    console.error('Get credit note by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch credit note' });
  }
};

export const updateCreditNote = async (req, res) => {
  const creditNoteId = parseInt(req.params.id);
  const {
    invoiceId,
    issueDate,
    amount,
    description
  } = req.body;

  try {
    const creditNote = await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        invoiceId: invoiceId || null,
        issueDate: new Date(issueDate),
        amount: parseFloat(amount),
        description
      },
      include: {
        client: true,
        invoice: true
      }
    });

    res.status(200).json({ message: 'Credit Note updated', creditNote });
  } catch (error) {
    console.error('Update credit note error:', error);
    res.status(500).json({ message: 'Failed to update credit note' });
  }
};

export const deleteCreditNote = async (req, res) => {
  const creditNoteId = parseInt(req.params.id);

  try {
    await prisma.creditNote.delete({ where: { id: creditNoteId } });
    res.status(200).json({ message: 'Credit Note deleted successfully' });
  } catch (error) {
    console.error('Delete credit note error:', error);
    res.status(500).json({ message: 'Failed to delete credit note' });
  }
};

export const getCreditNotesByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const creditNotes = await prisma.creditNote.findMany({
      where: { clientId },
      orderBy: { issueDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        },
        invoice: {
          select: {
            invoiceNo: true,
            amount: true
          }
        }
      }
    });

    res.status(200).json(creditNotes);
  } catch (error) {
    console.error('Get credit notes by client error:', error);
    res.status(500).json({ message: 'Failed to fetch credit notes' });
  }
};

export const getCreditNotesByInvoice = async (req, res) => {
  const invoiceId = parseInt(req.params.invoiceId);

  try {
    const creditNotes = await prisma.creditNote.findMany({
      where: { invoiceId },
      orderBy: { issueDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(creditNotes);
  } catch (error) {
    console.error('Get credit notes by invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch credit notes' });
  }
};

export const getCreditNotesTotal = async (req, res) => {
  try {
    const result = await prisma.creditNote.aggregate({
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      totalAmount: result._sum.amount || 0,
      totalCount: result._count.id || 0
    });
  } catch (error) {
    console.error('Get credit notes total error:', error);
    res.status(500).json({ message: 'Failed to fetch credit notes total' });
  }
}; 