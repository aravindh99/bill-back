import prisma from '../config/prismaClient.js';
import { protect } from '../middleware/authMiddleware.js';

export const createClient = async (req, res) => {
  const {
    companyName,
    contactName,
    phone,
    email,
    gstTreatment,
    gstin,
    pan,
    tin,
    vat,
    website,
    billingAddress,
    city,
    openingBalance,
    isVendor
  } = req.body;

  console.log('Creating client with data:', { companyName, contactName, email, isVendor });

  if (!companyName || !email || !phone) {
    return res.status(400).json({ message: 'Company name, phone, and email are required.' });
  }

  try {
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(409).json({ message: 'Client with this email already exists.' });
    }

    // Use transaction to create both client and vendor if needed
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Starting transaction, isVendor:', isVendor);
      
      // Create the client
    const client = await prisma.client.create({
      data: {
        companyName,
          contactName,
        phone,
        email,
        gstTreatment,
        gstin,
        pan,
        tin,
        vat,
        website,
        billingAddress,
        city,
        openingBalance: parseFloat(openingBalance || 0),
        isVendor: Boolean(isVendor),
      },
    });

      console.log('Client created with ID:', client.id);

      // If isVendor is true, also create a vendor record
      if (isVendor) {
        console.log('isVendor is true, creating vendor record...');
        
        // Check if vendor with same email already exists
        const existingVendor = await prisma.vendor.findUnique({ where: { email } });
        console.log('Existing vendor check:', existingVendor);
        
        if (!existingVendor) {
          console.log('Creating new vendor record...');
          const vendor = await prisma.vendor.create({
            data: {
              companyName,
              contactName: contactName || companyName, // Use contactName if provided, otherwise companyName
              phone,
              email,
              gstTreatment,
              gstin,
              pan,
              tin,
              vat,
              website,
              billingAddress,
              shippingAddress: billingAddress, // Use billing address as shipping address
              city,
              isClient: true, // Mark vendor as also being a client
            },
          });
          console.log('Vendor created with ID:', vendor.id);
        } else {
          console.log('Vendor already exists, skipping creation');
        }
      } else {
        console.log('isVendor is false, skipping vendor creation');
      }

      return client;
    });

    const message = isVendor ? 'Client and vendor created successfully' : 'Client created successfully';
    console.log('Final response message:', message);
    
    res.status(201).json({ 
      message: message, 
      client: result 
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { companyName: 'asc' },
    });
    res.status(200).json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClient = async (req, res) => {
  const clientId = parseInt(req.params.id);
  const {
    companyName,
    contactName,
    phone,
    email,
    gstTreatment,
    gstin,
    pan,
    tin,
    vat,
    website,
    billingAddress,
    city,
    openingBalance,
    isVendor
  } = req.body;
  
  try {
    // Use transaction to update client and handle vendor creation/update
    const result = await prisma.$transaction(async (prisma) => {
      // Update the client
    const client = await prisma.client.update({
      where: { id: clientId },
        data: {
          companyName,
          contactName,
          phone,
          email,
          gstTreatment,
          gstin,
          pan,
          tin,
          vat,
          website,
          billingAddress,
          city,
          openingBalance: parseFloat(openingBalance || 0),
          isVendor: Boolean(isVendor),
        }
      });

      // Check if vendor record exists for this client
      const existingVendor = await prisma.vendor.findUnique({ where: { email } });

      if (isVendor && !existingVendor) {
        // Create vendor record if isVendor is true but vendor doesn't exist
        await prisma.vendor.create({
          data: {
            companyName,
            contactName: contactName || companyName,
            phone,
            email,
            gstTreatment,
            gstin,
            pan,
            tin,
            vat,
            website,
            billingAddress,
            shippingAddress: billingAddress,
            city,
            isClient: true,
          },
        });
      } else if (isVendor && existingVendor) {
        // Update existing vendor record
        await prisma.vendor.update({
          where: { email },
          data: {
            companyName,
            contactName: contactName || companyName,
            phone,
            gstTreatment,
            gstin,
            pan,
            tin,
            vat,
            website,
            billingAddress,
            shippingAddress: billingAddress,
            city,
            isClient: true,
          },
        });
      }

      return client;
    });
    
    res.json({ 
      message: isVendor ? 'Client and vendor updated successfully' : 'Client updated successfully', 
      client: result 
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
};

export const deleteClient = async (req, res) => {
  const clientId = parseInt(req.params.id);

  try {
    // First check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        invoices: true,
        quotations: true,
        proformaInvoices: true,
        deliveryChalans: true,
        creditNotes: true,
        debitNotes: true,
        paymentDetails: true,
        contacts: true
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check for related records
    const hasRelatedRecords = 
      client.invoices.length > 0 ||
      client.quotations.length > 0 ||
      client.proformaInvoices.length > 0 ||
      client.deliveryChalans.length > 0 ||
      client.creditNotes.length > 0 ||
      client.debitNotes.length > 0 ||
      client.paymentDetails.length > 0 ||
      client.contacts.length > 0;

    if (hasRelatedRecords) {
      const relatedCounts = {
        invoices: client.invoices.length,
        quotations: client.quotations.length,
        proformaInvoices: client.proformaInvoices.length,
        deliveryChalans: client.deliveryChalans.length,
        creditNotes: client.creditNotes.length,
        debitNotes: client.debitNotes.length,
        paymentDetails: client.paymentDetails.length,
        contacts: client.contacts.length
      };

      return res.status(400).json({ 
        message: 'Cannot delete client with related records. Please delete related records first.',
        relatedRecords: relatedCounts
      });
    }

    // Use transaction to delete both client and vendor if they exist
    await prisma.$transaction(async (prisma) => {
      // Delete vendor record if it exists (same email)
      const existingVendor = await prisma.vendor.findUnique({ 
        where: { email: client.email },
        include: {
          purchaseOrders: true
        }
      });

      if (existingVendor) {
        // Check if vendor has purchase orders
        if (existingVendor.purchaseOrders.length > 0) {
          throw new Error('Cannot delete client. Associated vendor has purchase orders that must be deleted first.');
        }
        await prisma.vendor.delete({ where: { email: client.email } });
      }

      // Delete the client
    await prisma.client.delete({ where: { id: clientId } });
    });

    res.status(200).json({ 
      message: client.isVendor ? 'Client and vendor deleted successfully' : 'Client deleted successfully' 
    });
  } catch (error) {
    console.error('Delete client error:', error);
    
    if (error.message.includes('purchase orders')) {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Cannot delete client. This client has related records that must be deleted first.' 
      });
    }
    
    res.status(500).json({ message: 'Failed to delete client' });
  }
};
