import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const payload = {
  id: 1,
  name: 'Development User',
  role: 'admin',
  email: 'dev@example.com'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '100d' });

console.log('Development JWT Token:');
console.log(token);
console.log('\nUse this token in your frontend AuthContext'); 