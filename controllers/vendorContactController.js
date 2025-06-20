import prisma from '../config/prismaClient.js';

export const createVendorContact = async (req, res) => {
  const { vendorId, name, phone, email } = req.body;

  if (!vendorId || !name || !phone || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const contact = await prisma.vendorContact.create({
      data: { vendorId: parseInt(vendorId), name, phone, email },
    });
    res.status(201).json({ message: 'Contact created', contact });
  } catch (error) {
    console.error('Create vendor contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllVendorContacts = async (req, res) => {
  try {
    const contacts = await prisma.vendorContact.findMany({
      include: { vendor: true },
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Get vendor contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateVendorContact = async (req, res) => {
  const id = parseInt(req.params.id);
  const { vendorId, name, phone, email } = req.body;

  if (!vendorId || !name || !phone || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const contact = await prisma.vendorContact.update({
      where: { id },
      data: { vendorId: parseInt(vendorId), name, phone, email },
      include: { vendor: true },
    });
    res.status(200).json({ message: 'Vendor contact updated successfully', contact });
  } catch (error) {
    console.error('Update vendor contact error:', error);
    res.status(500).json({ message: 'Failed to update vendor contact' });
  }
};

export const deleteVendorContact = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.vendorContact.delete({ where: { id } });
    res.status(200).json({ message: 'Vendor contact deleted successfully' });
  } catch (error) {
    console.error('Delete vendor contact error:', error);
    res.status(500).json({ message: 'Failed to delete vendor contact' });
  }
}; 