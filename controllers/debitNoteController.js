import prisma from '../config/prismaClient.js';

export const createDebitNote = async (req, res) => {
  const {
    invoiceId,
    clientId,
    issueDate,
    docNo,
    amount,
    description
  } = req.body;

  if (!clientId || !issueDate || !docNo || !amount) {
    return res.status(400).json({ message: 'Client ID, issue date, document number, and amount are required.' });
  }

  try {
    const existingDebitNote = await prisma.debitNote.findUnique({ where: { docNo } });
    if (existingDebitNote) {
      return res.status(409).json({ message: 'Debit Note document number already exists' });
    }

    const debitNote = await prisma.debitNote.create({
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

    res.status(201).json({ message: 'Debit Note created', debitNote });
  } catch (error) {
    console.error('Create debit note error:', error);
    res.status(500).json({ message: 'Failed to create debit note' });
  }
};

export const getAllDebitNotes = async (req, res) => {
  try {
    const debitNotes = await prisma.debitNote.findMany({
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
    res.status(200).json(debitNotes);
  } catch (error) {
    console.error('Get debit notes error:', error);
    res.status(500).json({ message: 'Failed to fetch debit notes' });
  }
};

export const getDebitNoteById = async (req, res) => {
  const debitNoteId = parseInt(req.params.id);

  try {
    const debitNote = await prisma.debitNote.findUnique({
      where: { id: debitNoteId },
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

    if (!debitNote) {
      return res.status(404).json({ message: 'Debit Note not found' });
    }

    res.status(200).json(debitNote);
  } catch (error) {
    console.error('Get debit note by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch debit note' });
  }
};

export const updateDebitNote = async (req, res) => {
  const debitNoteId = parseInt(req.params.id);
  const {
    invoiceId,
    issueDate,
    docNo,
    amount,
    description
  } = req.body;

  try {
    const debitNote = await prisma.debitNote.update({
      where: { id: debitNoteId },
      data: {
        invoiceId: invoiceId || null,
        issueDate: new Date(issueDate),
        docNo,
        amount: parseFloat(amount),
        description
      },
      include: {
        client: true,
        invoice: true
      }
    });

    res.status(200).json({ message: 'Debit Note updated', debitNote });
  } catch (error) {
    console.error('Update debit note error:', error);
    res.status(500).json({ message: 'Failed to update debit note' });
  }
};

export const deleteDebitNote = async (req, res) => {
  const debitNoteId = parseInt(req.params.id);

  try {
    await prisma.debitNote.delete({ where: { id: debitNoteId } });
    res.status(200).json({ message: 'Debit Note deleted successfully' });
  } catch (error) {
    console.error('Delete debit note error:', error);
    res.status(500).json({ message: 'Failed to delete debit note' });
  }
};

export const getDebitNotesByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const debitNotes = await prisma.debitNote.findMany({
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

    res.status(200).json(debitNotes);
  } catch (error) {
    console.error('Get debit notes by client error:', error);
    res.status(500).json({ message: 'Failed to fetch debit notes' });
  }
};

export const getDebitNotesByInvoice = async (req, res) => {
  const invoiceId = parseInt(req.params.invoiceId);

  try {
    const debitNotes = await prisma.debitNote.findMany({
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

    res.status(200).json(debitNotes);
  } catch (error) {
    console.error('Get debit notes by invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch debit notes' });
  }
};

export const getDebitNotesTotal = async (req, res) => {
  try {
    const result = await prisma.debitNote.aggregate({
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
    console.error('Get debit notes total error:', error);
    res.status(500).json({ message: 'Failed to fetch debit notes total' });
  }
}; 