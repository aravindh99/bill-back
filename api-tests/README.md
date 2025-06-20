# API Testing Guide

## Setup
1. Start the server: `node server.js`
2. Import any JSON file into Postman
3. Update the `token` variable after login

## Test Order
1. **users.json** - Register & Login first
2. **clients.json** - Create clients
3. **items.json** - Create products/services  
4. **vendors.json** - Create suppliers
5. **invoices.json** - Create invoices
6. **quotations.json** - Create quotations
7. **purchase-orders.json** - Create purchase orders
8. **proformas.json** - Create proforma invoices
9. **delivery-chalans.json** - Create delivery receipts
10. **credit-notes.json** - Create credit notes
11. **debit-notes.json** - Create debit notes
12. **payments.json** - Record payments
13. **profiles.json** - Setup company profile

## Base URL
Default: `http://localhost:5000`

## Authentication
All endpoints (except register/login) require:
`Authorization: Bearer YOUR_JWT_TOKEN` 