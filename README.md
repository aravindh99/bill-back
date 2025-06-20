# Billing System API

A comprehensive billing and invoicing system built with Node.js, Express, Prisma, and MySQL.

## Features

- ✅ User Authentication & Authorization
- ✅ Client Management
- ✅ Item/Product Catalog
- ✅ Invoice Management
- ✅ Quotation Management
- ✅ Vendor Management
- ✅ Purchase Orders
- ✅ Proforma Invoices
- ✅ Delivery Chalans
- ✅ Credit & Debit Notes
- ✅ Payment Tracking
- ✅ Company Profile Management


   

## API Endpoints

### Authentication
- `POST /api/users` - Register user
- `POST /api/users/login` - Login user

### Core Modules
- `/api/clients` - Client management
- `/api/items` - Item catalog
- `/api/invoices` - Invoice operations
- `/api/quotations` - Quotation management
- `/api/vendors` - Vendor management
- `/api/purchase-orders` - Purchase orders
- `/api/proformas` - Proforma invoices
- `/api/delivery-chalans` - Delivery tracking
- `/api/credit-notes` - Credit notes
- `/api/debit-notes` - Debit notes
- `/api/payments` - Payment tracking
- `/api/profiles` - Company settings

## Testing

Import JSON collections from `api-tests/postman/` into Postman for complete API testing.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Custom middleware
- **API Documentation**: Postman collections

## License

ISC 