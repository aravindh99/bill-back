import prisma from '../config/prismaClient.js';

export const createVendor = async (req, res) => {
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
    shippingAddress,
    city,
    isClient
  } = req.body;

  if (!companyName || !contactName || !email || !phone) {
    return res.status(400).json({ message: 'Company name, contact name, email, and phone are required.' });
  }

  try {
    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      return res.status(409).json({ message: 'Vendor with this email already exists.' });
    }

    const vendor = await prisma.vendor.create({
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
        shippingAddress,
        city,
        isClient: Boolean(isClient),
      },
    });

    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { companyName: 'asc' },
      include: {
        purchaseOrders: {
          select: {
            id: true,
            poNo: true,
            orderDate: true,
            total: true
          }
        }
      }
    });
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVendorById = async (req, res) => {
  const vendorId = parseInt(req.params.id);

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        purchaseOrders: {
          orderBy: { orderDate: 'desc' }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch vendor' });
  }
};

export const updateVendor = async (req, res) => {
  const vendorId = parseInt(req.params.id);
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
    shippingAddress,
    city,
    isClient
  } = req.body;

  try {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
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
        shippingAddress,
        city,
        isClient: Boolean(isClient)
      }
    });

    res.status(200).json({ message: 'Vendor updated', vendor });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Failed to update vendor' });
  }
};

export const deleteVendor = async (req, res) => {
  const vendorId = parseInt(req.params.id);

  try {
    await prisma.vendor.delete({ where: { id: vendorId } });
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Failed to delete vendor' });
  }
}; 