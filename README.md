# ShopKart

ShopKart is a full-stack e-commerce web application built with React and Django REST Framework. It includes product browsing, authentication, cart management, orders, payments, reviews, wishlist, coupons, and admin management.

## Features

### User

* Register and log in
* JWT authentication
* Browse products
* Search products
* Filter products by category
* Sort products
* View product details
* View product ratings and reviews
* Add products to cart
* Update cart quantity
* Remove products from cart
* Checkout and create orders
* View order history
* View order details
* Cancel eligible orders
* Add products to wishlist
* Remove products from wishlist
* Apply coupons
* View payment information
* Add product reviews after purchase

### Admin

* Admin authentication
* Admin dashboard
* Add, update and delete products
* Manage product stock
* Activate or deactivate products
* Manage product images
* View customer orders
* Update order status
* View order summary
* Manage coupons
* Manage payment status

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* React Router
* Axios
* HTML
* CSS

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* Django ORM

### Database

* MySQL

### Tools

* Git
* GitHub
* VS Code
* Postman
* PowerShell

## Project Structure

```text
ShopKart/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── accounts/
│   ├── categories/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   ├── reviews/
│   ├── wishlist/
│   └── coupons/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Application Flow

```text
React Frontend
      │
      │ Axios
      ▼
Django REST API
      │
      ├── Accounts
      ├── Categories
      ├── Products
      ├── Cart
      ├── Orders
      ├── Payments
      ├── Reviews
      ├── Wishlist
      └── Coupons
      │
      ▼
MySQL Database
```

## Authentication

The application uses JWT authentication for protected API requests.

Customer and admin operations are separated through authentication and authorization checks.

Examples:

* Users must be authenticated to access protected customer operations.
* Users can access their own orders.
* Users can access their own payment information.
* Admin operations are restricted to authorized users.
* Customers cannot manage coupons.
* Customers cannot change payment status.
* Product reviews require a valid purchase.
* Duplicate reviews are prevented for the same purchase.

## API

The backend API runs locally through Django REST Framework.

Base URL:

```text
http://127.0.0.1:8000/api/
```

### Accounts

```text
POST /api/accounts/register/
POST /api/accounts/login/
```

### Categories

```text
GET /api/categories/
```

### Products

```text
GET    /api/products/
POST   /api/products/
GET    /api/products/<id>/
PUT    /api/products/<id>/
PATCH  /api/products/<id>/
DELETE /api/products/<id>/
```

### Cart

```text
GET    /api/cart/
POST   /api/cart/add/
PATCH  /api/cart/items/<id>/update/
DELETE /api/cart/items/<id>/
```

### Orders

```text
POST  /api/orders/
GET   /api/orders/list/
GET   /api/orders/<id>/
PATCH /api/orders/<id>/cancel/
```

Admin order endpoints:

```text
GET   /api/orders/admin/
GET   /api/orders/admin/summary/
GET   /api/orders/admin/<id>/
PATCH /api/orders/<id>/status/
```

### Payments

```text
POST  /api/payments/
GET   /api/payments/list/
GET   /api/payments/<id>/
PATCH /api/payments/<id>/status/
```

### Reviews

```text
POST /api/reviews/
GET  /api/reviews/product/<product_id>/
GET  /api/reviews/<id>/
```

### Wishlist

```text
GET    /api/wishlist/
POST   /api/wishlist/add/
DELETE /api/wishlist/remove/<product_id>/
```

### Coupons

```text
GET    /api/coupons/
POST   /api/coupons/
GET    /api/coupons/<id>/
PUT    /api/coupons/<id>/
PATCH  /api/coupons/<id>/
DELETE /api/coupons/<id>/
POST   /api/coupons/validate/
```

## Requirements

Before running the project, install:

* Python
* Node.js
* npm
* MySQL
* Git

Check the installed versions:

```powershell
python --version
node --version
npm --version
mysql --version
git --version
```

## Backend Setup

Open PowerShell and go to the backend directory:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r requirements.txt
```

Create the MySQL database:

```sql
CREATE DATABASE shopkart;
```

Configure the database connection using the project's environment/configuration settings.

Run migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

Create an admin account:

```powershell
python manage.py createsuperuser
```

Start the Django server:

```powershell
python manage.py runserver
```

The backend will normally run at:

```text
http://127.0.0.1:8000/
```

## Frontend Setup

Open another terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

Vite will display the frontend URL in the terminal. It will normally be:

```text
http://localhost:5173/
```

The frontend communicates with the Django API using Axios.

## Environment Variables

Create the required environment files according to the project configuration.

For the frontend, an example configuration can be kept in:

```text
frontend/.env.example
```

Example:

```env
VITE_API_URL=http://localhost:8000/api
```

Do not commit passwords, database credentials, secret keys, tokens, or other sensitive information to GitHub.

## Running the Project

Start MySQL first.

Then start the backend:

```powershell
cd backend
.venv\Scripts\Activate.ps1
python manage.py runserver
```

Open another terminal and start the frontend:

```powershell
cd frontend
npm run dev
```

Open the frontend URL shown by Vite.

## Testing

Run Django checks:

```powershell
cd backend
python manage.py check
```

Build the frontend:

```powershell
cd frontend
npm run build
```

Postman can be used to test the REST API endpoints.

## Database

ShopKart uses MySQL for storing application data.

The main entities are:

```text
User
Category
Product
Cart
CartItem
Order
OrderItem
Payment
Review
WishlistItem
Coupon
```

The relationships between these entities are handled using Django models and the Django ORM.

Future Improvements

Possible improvements for the project include:

* Production deployment
* Payment gateway integration
* Product pagination
* Advanced filtering
* Email notifications
* Order tracking
* Admin analytics
* Swagger/OpenAPI documentation
* Automated testing
* CI/CD

## Repository

GitHub repository:

https://github.com/Ravi-99-alt/ShopKart

## Author

**Ravikumar Locharla**

MCA Graduate | Python | Django | React | SQL | Machine Learning

GitHub: https://github.com/Ravi-99-alt

LinkedIn: https://www.linkedin.com/in/ravikumar-locharla-058741363/
