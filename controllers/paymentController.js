import prisma from '../config/prismaClient.js';
import { generateDocumentNumber } from '../utils/helpers.js';

// function generatePaymentNumber() {
//   return 'PMT-' + Date.now();
// }

export const createPayment = async (req, res) => {
  let {
    invoiceId,
    date,
    number,
    type,
    accountName,
    documentMethod,
    amount,
    availableCredit,
    paymentDetails // array of { clientId, number, date, amount, method, bankCharges, reference }
  } = req.body;

  // Auto-generate number if not provided
  if (!number) {
    // number = generatePaymentNumber(); // Remove old auto-generation
    try {
      const profile = await prisma.profile.findFirst();
      if (!profile || !profile.companyCode) {
        return res.status(400).json({ message: 'Company profile or company code not found. Please set it in profile settings.' });
      }
      const companyCode = profile.companyCode;
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const typeCode = 'PMT';

      const lastPayment = await prisma.payment.findFirst({
        where: {
          number: {
            startsWith: `${companyCode}-${currentYear}-${typeCode}-`,
          },
        },
        orderBy: {
          number: 'desc',
        },
      });

      let sequence = 1;
      if (lastPayment) {
        const lastNumber = lastPayment.number;
        const lastSequence = parseInt(lastNumber.split('-').pop(), 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
      number = generateDocumentNumber(companyCode, currentYear, typeCode, sequence);

    } catch (profileError) {
      console.error('Error fetching company profile for payment number generation:', profileError);
      return res.status(500).json({ message: 'Failed to generate payment number due to profile error.' });
    }
  }

  if (!date || !type || !accountName || !amount) {
    return res.status(400).json({ message: 'Date, type, account name, and amount are required.' });
  }

  try {
    const existingPayment = await prisma.payment.findUnique({ where: { number } });
    if (existingPayment) {
      return res.status(409).json({ message: 'Payment number already exists' });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoiceId ? parseInt(invoiceId) : undefined,
        date: new Date(date),
        number,
        type,
        accountName,
        documentMethod,
        amount: parseFloat(amount),
        availableCredit: parseFloat(availableCredit || 0),
        paymentDetails: paymentDetails ? {
          create: paymentDetails.map((detail) => ({
            clientId: detail.clientId,
            number: detail.number,
            date: new Date(detail.date),
            amount: parseFloat(detail.amount),
            method: detail.method,
            bankCharges: parseFloat(detail.bankCharges || 0),
            reference: detail.reference
          }))
        } : undefined
      },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(invoiceId) },
      });

      if (invoice) {
        const newBalance = invoice.balance - parseFloat(amount);
        let newStatus = invoice.status;

        if (newBalance <= 0) {
          newStatus = 'PAID';
        } else if (newBalance > 0 && newBalance < invoice.amount) {
          newStatus = 'PARTIALLY_PAID';
        } else if (newBalance > 0 && newBalance >= invoice.amount) {
          // This case implies an initial balance greater than 0, meaning it was not fully paid before.
          // If a payment is made but the balance is still equal to or more than original amount, it might mean the initial status was not 'PAID' or 'PARTIALLY_PAID'
          // If current balance is still more than 0, it means it's still overdue or partially paid.
          // For simplicity, let's assume if newBalance > 0 it's PARTIALLY_PAID or OVERDUE, depending on current status
          // For now, let's keep it as is. The status logic will be refined.
          newStatus = 'PARTIALLY_PAID'; // Or could be 'OVERDUE' if due date passed and not fully paid
          if (new Date() > new Date(invoice.dueDate) && newBalance > 0) {
            newStatus = 'OVERDUE';
          }
        }

        await prisma.invoice.update({
          where: { id: parseInt(invoiceId) },
          data: {
            balance: newBalance,
            paymentDate: new Date(date),
            status: newStatus, // Update invoice status
          },
        });
      }
    }

    res.status(201).json({ message: 'Payment created', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { date: 'desc' },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const getPaymentById = async (req, res) => {
  const paymentId = parseInt(req.params.id);

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentDetails: {
          include: {
            client: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

export const updatePayment = async (req, res) => {
  const paymentId = parseInt(req.params.id);
  const {
    date,
    number,
    type,
    accountName,
    documentMethod,
    amount,
    availableCredit,
    invoiceId // Include invoiceId to handle related invoice update
  } = req.body;

  try {
    // Get the old payment to calculate the change in amount
    const oldPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { amount: true, invoiceId: true }
    });

    if (!oldPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update the payment
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        date: new Date(date),
        number,
        type,
        accountName,
        documentMethod,
        amount: parseFloat(amount),
        availableCredit: parseFloat(availableCredit || 0),
      },
      include: {
        paymentDetails: {
          include: {
            client: true
          }
        }
      }
    });

    // Update associated invoice if invoiceId is present
    if (invoiceId || oldPayment.invoiceId) {
      const targetInvoiceId = invoiceId ? parseInt(invoiceId) : oldPayment.invoiceId;
      if (targetInvoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: targetInvoiceId },
        });

        if (invoice) {
          // Calculate the net change in payment amount
          const amountChange = parseFloat(amount) - oldPayment.amount.toNumber();
          const newBalance = invoice.balance - amountChange;

          let newStatus = invoice.status;
          if (newBalance <= 0) {
            newStatus = 'PAID';
          } else if (newBalance > 0 && newBalance < invoice.amount) {
            newStatus = 'PARTIALLY_PAID';
          } else if (new Date() > new Date(invoice.dueDate) && newBalance > 0) {
            newStatus = 'OVERDUE';
          } else {
            newStatus = 'SENT'; // Default to SENT if not fully paid and not overdue
          }

          await prisma.invoice.update({
            where: { id: targetInvoiceId },
            data: {
              balance: newBalance,
              status: newStatus,
            },
          });
        }
      }
    }

    res.status(200).json({ message: 'Payment updated', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

export const deletePayment = async (req, res) => {
  const paymentId = parseInt(req.params.id);

  try {
    // First check if payment exists and get its details
    const paymentToDelete = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { amount: true, invoiceId: true }
    });

    if (!paymentToDelete) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Delete the payment (PaymentDetail records will be deleted automatically due to cascade)
    await prisma.payment.delete({ where: { id: paymentId } });

    // If the deleted payment was linked to an invoice, update the invoice's balance and status
    if (paymentToDelete.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: paymentToDelete.invoiceId },
      });

      if (invoice) {
        const newBalance = invoice.balance + paymentToDelete.amount.toNumber();
        let newStatus = invoice.status;

        // Recalculate status based on the new balance
        if (newBalance >= invoice.amount) {
          // If the balance is now equal to or more than the original amount, it's no longer paid/partially paid.
          // Set to 'SENT' or 'OVERDUE' depending on due date.
          if (new Date() > new Date(invoice.dueDate)) {
            newStatus = 'OVERDUE';
          } else {
            newStatus = 'SENT';
          }
        } else if (newBalance > 0 && newBalance < invoice.amount) {
          newStatus = 'PARTIALLY_PAID';
        } else if (newBalance <= 0) {
          newStatus = 'PAID';
        }

        await prisma.invoice.update({
          where: { id: paymentToDelete.invoiceId },
          data: {
            balance: newBalance,
            status: newStatus,
          },
        });
      }
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
};

export const getPaymentsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'desc' },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Get payments by date range error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const getPaymentsTotal = async (req, res) => {
  try {
    const result = await prisma.payment.aggregate({
      _sum: {
        amount: true,
        availableCredit: true
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      totalAmount: result._sum.amount || 0,
      totalCredit: result._sum.availableCredit || 0,
      totalCount: result._count.id || 0
    });
  } catch (error) {
    console.error('Get payments total error:', error);
    res.status(500).json({ message: 'Failed to fetch payments total' });
  }
};

export const getPaymentsByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const paymentDetails = await prisma.paymentDetail.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
      include: {
        payment: true,
        client: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(paymentDetails);
  } catch (error) {
    console.error('Get payments by client error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
}; 