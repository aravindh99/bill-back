import prisma from '../config/prismaClient.js';

export const createClientContact = async (req, res) => {
  const { clientId, name, phone, email } = req.body;

  if (!clientId || !name || !phone || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const contact = await prisma.clientContact.create({
      data: { clientId: parseInt(clientId), name, phone, email },
    });
    res.status(201).json({ message: 'Contact created', contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllClientContacts = async (req, res) => {
  try {
    const contacts = await prisma.clientContact.findMany({
      include: { client: true },
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClientContact = async (req, res) => {
  const id = parseInt(req.params.id);
  const { clientId, name, phone, email } = req.body;

  if (!clientId || !name || !phone || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const contact = await prisma.clientContact.update({
      where: { id },
      data: { clientId: parseInt(clientId), name, phone, email },
      include: { client: true },
    });
    res.status(200).json({ message: 'Client contact updated successfully', contact });
  } catch (error) {
    console.error('Update client contact error:', error);
    res.status(500).json({ message: 'Failed to update client contact' });
  }
};

export const deleteClientContact = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.clientContact.delete({ where: { id } });
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Failed to delete contact' });
  }
};
