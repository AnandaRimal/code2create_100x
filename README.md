# 🛍️ Pasale - Smart Shopping Rewards Platform

<div align="center">

![Pasale Logo](https://img.shields.io/badge/Pasale-Shopping_Rewards-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A revolutionary shopping platform that rewards customers with points and gamifies the shopping experience**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Analytics & AI](#-analytics--ai)
- [Mobile App](#-mobile-app-flutter)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Pasale** is a comprehensive e-commerce platform that combines traditional online shopping with a modern rewards system. Customers earn points for purchases, track their shopping analytics, and business owners get powerful insights through AI-driven analytics.

### Key Highlights

- 🎯 **Smart Rewards System** - Earn points on every purchase
- 📊 **AI-Powered Analytics** - Real-time business insights
- 🏪 **Multi-Vendor Support** - Multiple business owners on one platform
- 📱 **Mobile App** - Flutter-based cross-platform mobile application
- 🔐 **Secure Authentication** - JWT-based auth with role management
- ⚡ **Real-time Updates** - Automated ETL pipeline for data processing

---

## ✨ Features

### For Customers
- 🛒 **Product Browsing** - Browse products by category with detailed information
- 🎁 **Reward Points** - Earn points on every purchase (₹1 = 1 point)
- 🏆 **Weekly Rewards** - Automatic bonus points for top shoppers
- 📈 **Purchase Analytics** - Track spending patterns and history
- 🔍 **Smart Search** - Find products quickly and efficiently
- 💳 **Secure Checkout** - Multiple payment options

### For Business Owners
- 📊 **Real-time Dashboard** - Monitor sales, revenue, and customer activity
- 🤖 **AI Analytics** - Predictive insights and trend analysis
- 📦 **Inventory Management** - Track products and stock levels
- 👥 **Customer Management** - View customer profiles and purchase history
- 💰 **Revenue Tracking** - Detailed financial reports and analytics
- 🎯 **Marketing Insights** - Customer behavior and preferences

### System Features
- 🔄 **Automated ETL Pipeline** - Scheduled data processing every 4 hours
- 🧠 **AI Model Training** - Continuous learning from sales patterns
- 📧 **Email Notifications** - Automated alerts and updates
- 🔐 **Role-based Access Control** - Separate customer and business owner portals
- 📱 **Responsive Design** - Works on all devices
- 🚀 **High Performance** - Optimized for speed and scalability

---

## 📁 Project Structure

```
code2create_100x/
├── 📱 frontend/pasale/          # Flutter Mobile App
│   ├── lib/
│   │   └── main.dart           # App entry point
│   ├── android/                # Android-specific files
│   ├── ios/                    # iOS-specific files
│   ├── web/                    # Web build files
│   └── pubspec.yaml           # Flutter dependencies
│
├── 🌐 website/
│   ├── 🎨 frontend/            # Next.js Web Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js 13+ App Router
│   │   │   │   ├── (auth)/    # Authentication pages
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── dashboard/ # Customer Dashboard
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── rewards/
│   │   │   │   │   └── shop/
│   │   │   │   ├── business/  # Business Owner Portal
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── customers/
│   │   │   │   └── page.tsx   # Landing page
│   │   │   ├── components/    # Reusable React components
│   │   │   │   ├── ui/       # shadcn/ui components
│   │   │   │   ├── dashboard/
│   │   │   │   └── charts/
│   │   │   └── lib/          # Utilities and helpers
│   │   ├── public/           # Static assets
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── ⚙️ backend/             # FastAPI Backend Server
│       ├── main.py            # API entry point
│       ├── run.py             # Server runner
│       ├── database.py        # Database connection
│       ├── models.py          # SQLAlchemy models
│       ├── schemas.py         # Pydantic schemas
│       ├── crud.py            # Database operations
│       ├── auth.py            # Authentication logic
│       ├── business_owner_routes.py  # Business API
│       ├── etl_pipeline_simple.py    # Data processing
│       ├── scheduler.py       # Background tasks
│       ├── analytics_ai.py    # AI analytics engine
│       ├── reward_system.py   # Points calculation
│       ├── requirements.txt   # Python dependencies
│       └── data/             # Sample data files
│
├── .gitignore                 # Git ignore rules
├── .gitattributes            # Git LFS configuration
└── README.md                 # This file
```

---

## 🛠 Tech Stack

### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **State Management**: React Context

### Frontend (Mobile)
- **Framework**: Flutter 3.x
- **Language**: Dart
- **Platform**: iOS, Android, Web

### Backend
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.11+
- **Database**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt
- **Validation**: Pydantic v2
- **Task Scheduler**: APScheduler
- **Database Migrations**: Alembic

### AI & Analytics
- **Libraries**: NumPy, Pandas
- **ML Models**: Custom prediction algorithms
- **Data Processing**: ETL pipeline with scheduled jobs

### DevOps & Tools
- **Version Control**: Git, GitHub
- **Large File Storage**: Git LFS
- **API Testing**: Swagger UI (FastAPI auto-docs)
- **Environment**: Python venv, Node.js

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **MySQL** 8.0+
- **Flutter** 3.0+ (for mobile app)
- **Git** with Git LFS

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnandaRimal/code2create_100x.git
   cd code2create_100x
   ```

2. **Set up MySQL Database**
   ```sql
   CREATE DATABASE pasale_db;
   CREATE USER 'pasale_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON pasale_db.* TO 'pasale_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure Backend Environment**
   ```bash
   cd website/backend
   python -m venv env
   
   # Windows
   env\Scripts\activate
   
   # Linux/Mac
   source env/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```env
   DATABASE_URL=mysql+pymysql://pasale_user:your_password@localhost/pasale_db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Initialize Database**
   ```bash
   python init_db.py
   ```

6. **Run Backend Server**
   ```bash
   # Using uvicorn directly
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Or using the run script
   python run.py
   ```

   Backend will be available at: `http://localhost:8000`
   API Docs: `http://localhost:8000/docs`

### Frontend (Web) Setup

1. **Navigate to frontend directory**
   ```bash
   cd website/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Frontend will be available at: `http://localhost:3000`

### Mobile App Setup (Flutter)

1. **Navigate to Flutter app directory**
   ```bash
   cd frontend/pasale
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   # For Android
   flutter run
   
   # For iOS (Mac only)
   flutter run -d ios
   
   # For Web
   flutter run -d chrome
   ```

---

## ⚙️ Configuration

### Database Configuration

Edit `website/backend/.env`:
```env
# Database
DATABASE_URL=mysql+pymysql://username:password@host:port/database

# JWT Configuration
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (Optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Scheduler Configuration

The system runs automated tasks:
- **ETL Pipeline**: Every 4 hours (processes new sales data)
- **Reward System**: After ETL completion (updates customer points)
- **AI Model Training**: When new data is available

Configure in `website/backend/scheduler.py`:
```python
scheduler.add_job(
    run_etl_job, 
    'interval', 
    hours=4,  # Adjust frequency
    id='etl_job'
)
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### Register Customer
```http
POST /signup
Content-Type: application/json

{
  "username": "customer1",
  "email": "customer@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "9876543210"
}
```

#### Login
```http
POST /token
Content-Type: application/x-www-form-urlencoded

username=customer1&password=securepassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "customer"
}
```

### Customer Endpoints

#### Get Products
```http
GET /products?skip=0&limit=100
Authorization: Bearer {token}
```

#### Get Customer Analytics
```http
GET /analytics/customer/{customer_id}
Authorization: Bearer {token}
```

#### Get Reward Points
```http
GET /rewards/{customer_id}
Authorization: Bearer {token}
```

### Business Owner Endpoints

#### Dashboard Analytics
```http
GET /business/dashboard/analytics
Authorization: Bearer {token}
```

#### Get All Customers
```http
GET /business/customers
Authorization: Bearer {token}
```

#### Customer Details
```http
GET /business/customers/{customer_id}
Authorization: Bearer {token}
```

### Interactive API Documentation

FastAPI provides interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🗄️ Database Schema

### Core Tables

#### `customers`
```sql
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- full_name
- phone
- reward_points
- total_spent
- created_at
```

#### `business_owners`
```sql
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- business_name
- created_at
```

#### `products`
```sql
- id (PK)
- name
- category
- price
- stock
- description
- image_url
- created_at
```

#### `sales`
```sql
- id (PK)
- customer_id (FK)
- product_id (FK)
- quantity
- total_amount
- sale_date
- payment_method
- status
```

#### `customer_analytics`
```sql
- id (PK)
- customer_id (FK)
- total_purchases
- average_order_value
- last_purchase_date
- favorite_category
- loyalty_score
- updated_at
```

#### `ai_predictions`
```sql
- id (PK)
- prediction_type
- customer_id (FK)
- predicted_value
- confidence_score
- created_at
```

---

## 🤖 Analytics & AI

### ETL Pipeline

The system automatically processes sales data every 4 hours:

1. **Extract**: Fetch new sales from database
2. **Transform**: Calculate metrics, aggregate data
3. **Load**: Update analytics tables and AI predictions

### AI Features

- **Purchase Prediction**: Predict next purchase timing
- **Category Affinity**: Identify customer preferences
- **Churn Risk**: Detect customers at risk of leaving
- **Revenue Forecasting**: Project future revenue trends

### Analytics Metrics

**Customer Metrics:**
- Total purchases and spending
- Average order value
- Purchase frequency
- Category preferences
- Loyalty score

**Business Metrics:**
- Daily/Weekly/Monthly revenue
- Top-selling products
- Customer acquisition trends
- Inventory turnover
- Profit margins

---

## 📱 Mobile App (Flutter)

### Features

- User authentication
- Product browsing and search
- Shopping cart
- Order placement
- Rewards tracking
- Purchase history
- Push notifications

### Supported Platforms

- ✅ Android (API 21+)
- ✅ iOS (13.0+)
- ✅ Web

---

## 🎯 Reward System

### Point Calculation

- **Base Points**: ₹1 spent = 1 point
- **Weekly Bonus**: Top 10 customers get bonus points
  - 1st place: 500 points
  - 2nd place: 300 points
  - 3rd place: 200 points
  - 4th-10th: 100 points each

### Weekly Rewards Schedule

Rewards are calculated and distributed automatically:
- **Frequency**: Weekly (Sunday 11:59 PM)
- **Criteria**: Total spending in the past 7 days
- **Automation**: Handled by scheduler

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt
- **Role-based Access**: Customer and Business Owner roles
- **CORS Protection**: Configured allowed origins
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Environment Variables**: Sensitive data in .env
- **HTTPS Ready**: Production-ready security

---

## 🧪 Testing

### Backend Tests
```bash
cd website/backend
pytest
```

### Frontend Tests
```bash
cd website/frontend
npm test
```

---

## 📝 Development Workflow

### Git Workflow

1. **Main Branch**: Production-ready code
2. **Dev Branch**: Development and testing
3. **Feature Branches**: New features
4. **Pull Requests**: Code review before merge

### Commit Conventions

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- **Python**: PEP 8
- **TypeScript**: ESLint + Prettier
- **Dart**: Flutter style guide

---

## 📊 Project Stats

- **Total Lines of Code**: 50,000+
- **API Endpoints**: 30+
- **Database Tables**: 10+
- **Frontend Pages**: 15+
- **AI Models**: 4+

---

## 🐛 Known Issues

- [ ] MySQL connection timeout on slow networks
- [ ] Mobile app image caching optimization needed
- [ ] Dashboard chart loading delay with large datasets

See [Issues](https://github.com/AnandaRimal/code2create_100x/issues) for more.

---

## 🗺️ Roadmap

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Email notification system
- [ ] Advanced AI recommendations
- [ ] Social media login (Google, Facebook)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Docker containerization

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Development Team**: code2create_100x
- **Project Lead**: [Ananda Rimal](https://github.com/AnandaRimal)

---

## 📞 Support

For support and queries:
- **GitHub Issues**: [Report a bug](https://github.com/AnandaRimal/code2create_100x/issues)
- **Email**: support@pasale.com
- **Documentation**: [Wiki](https://github.com/AnandaRimal/code2create_100x/wiki)

---

## 🙏 Acknowledgments

- FastAPI for the amazing Python framework
- Next.js for the powerful React framework
- Flutter for cross-platform mobile development
- shadcn/ui for beautiful UI components
- All open-source contributors

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the code2create_100x team

[⬆ Back to Top](#️-pasale---smart-shopping-rewards-platform)

</div># 🛍️ Pasale - Smart Shopping Rewards Platform

<div align="center">

![Pasale Logo](https://img.shields.io/badge/Pasale-Shopping_Rewards-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A revolutionary shopping platform that rewards customers with points and gamifies the shopping experience**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Analytics & AI](#-analytics--ai)
- [Mobile App](#-mobile-app-flutter)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Pasale** is a comprehensive e-commerce platform that combines traditional online shopping with a modern rewards system. Customers earn points for purchases, track their shopping analytics, and business owners get powerful insights through AI-driven analytics.

### Key Highlights

- 🎯 **Smart Rewards System** - Earn points on every purchase
- 📊 **AI-Powered Analytics** - Real-time business insights
- 🏪 **Multi-Vendor Support** - Multiple business owners on one platform
- 📱 **Mobile App** - Flutter-based cross-platform mobile application
- 🔐 **Secure Authentication** - JWT-based auth with role management
- ⚡ **Real-time Updates** - Automated ETL pipeline for data processing

---

## ✨ Features

### For Customers
- 🛒 **Product Browsing** - Browse products by category with detailed information
- 🎁 **Reward Points** - Earn points on every purchase (₹1 = 1 point)
- 🏆 **Weekly Rewards** - Automatic bonus points for top shoppers
- 📈 **Purchase Analytics** - Track spending patterns and history
- 🔍 **Smart Search** - Find products quickly and efficiently
- 💳 **Secure Checkout** - Multiple payment options

### For Business Owners
- 📊 **Real-time Dashboard** - Monitor sales, revenue, and customer activity
- 🤖 **AI Analytics** - Predictive insights and trend analysis
- 📦 **Inventory Management** - Track products and stock levels
- 👥 **Customer Management** - View customer profiles and purchase history
- 💰 **Revenue Tracking** - Detailed financial reports and analytics
- 🎯 **Marketing Insights** - Customer behavior and preferences

### System Features
- 🔄 **Automated ETL Pipeline** - Scheduled data processing every 4 hours
- 🧠 **AI Model Training** - Continuous learning from sales patterns
- 📧 **Email Notifications** - Automated alerts and updates
- 🔐 **Role-based Access Control** - Separate customer and business owner portals
- 📱 **Responsive Design** - Works on all devices
- 🚀 **High Performance** - Optimized for speed and scalability

---

## 📁 Project Structure

```
code2create_100x/
├── 📱 frontend/pasale/          # Flutter Mobile App
│   ├── lib/
│   │   └── main.dart           # App entry point
│   ├── android/                # Android-specific files
│   ├── ios/                    # iOS-specific files
│   ├── web/                    # Web build files
│   └── pubspec.yaml           # Flutter dependencies
│
├── 🌐 website/
│   ├── 🎨 frontend/            # Next.js Web Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js 13+ App Router
│   │   │   │   ├── (auth)/    # Authentication pages
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── dashboard/ # Customer Dashboard
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── rewards/
│   │   │   │   │   └── shop/
│   │   │   │   ├── business/  # Business Owner Portal
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── customers/
│   │   │   │   └── page.tsx   # Landing page
│   │   │   ├── components/    # Reusable React components
│   │   │   │   ├── ui/       # shadcn/ui components
│   │   │   │   ├── dashboard/
│   │   │   │   └── charts/
│   │   │   └── lib/          # Utilities and helpers
│   │   ├── public/           # Static assets
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── ⚙️ backend/             # FastAPI Backend Server
│       ├── main.py            # API entry point
│       ├── run.py             # Server runner
│       ├── database.py        # Database connection
│       ├── models.py          # SQLAlchemy models
│       ├── schemas.py         # Pydantic schemas
│       ├── crud.py            # Database operations
│       ├── auth.py            # Authentication logic
│       ├── business_owner_routes.py  # Business API
│       ├── etl_pipeline_simple.py    # Data processing
│       ├── scheduler.py       # Background tasks
│       ├── analytics_ai.py    # AI analytics engine
│       ├── reward_system.py   # Points calculation
│       ├── requirements.txt   # Python dependencies
│       └── data/             # Sample data files
│
├── .gitignore                 # Git ignore rules
├── .gitattributes            # Git LFS configuration
└── README.md                 # This file
```

---

## 🛠 Tech Stack

### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **State Management**: React Context

### Frontend (Mobile)
- **Framework**: Flutter 3.x
- **Language**: Dart
- **Platform**: iOS, Android, Web

### Backend
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.11+
- **Database**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt
- **Validation**: Pydantic v2
- **Task Scheduler**: APScheduler
- **Database Migrations**: Alembic

### AI & Analytics
- **Libraries**: NumPy, Pandas
- **ML Models**: Custom prediction algorithms
- **Data Processing**: ETL pipeline with scheduled jobs

### DevOps & Tools
- **Version Control**: Git, GitHub
- **Large File Storage**: Git LFS
- **API Testing**: Swagger UI (FastAPI auto-docs)
- **Environment**: Python venv, Node.js

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **MySQL** 8.0+
- **Flutter** 3.0+ (for mobile app)
- **Git** with Git LFS

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnandaRimal/code2create_100x.git
   cd code2create_100x
   ```

2. **Set up MySQL Database**
   ```sql
   CREATE DATABASE pasale_db;
   CREATE USER 'pasale_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON pasale_db.* TO 'pasale_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure Backend Environment**
   ```bash
   cd website/backend
   python -m venv env
   
   # Windows
   env\Scripts\activate
   
   # Linux/Mac
   source env/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```env
   DATABASE_URL=mysql+pymysql://pasale_user:your_password@localhost/pasale_db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Initialize Database**
   ```bash
   python init_db.py
   ```

6. **Run Backend Server**
   ```bash
   # Using uvicorn directly
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Or using the run script
   python run.py
   ```

   Backend will be available at: `http://localhost:8000`
   API Docs: `http://localhost:8000/docs`

### Frontend (Web) Setup

1. **Navigate to frontend directory**
   ```bash
   cd website/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Frontend will be available at: `http://localhost:3000`

### Mobile App Setup (Flutter)

1. **Navigate to Flutter app directory**
   ```bash
   cd frontend/pasale
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   # For Android
   flutter run
   
   # For iOS (Mac only)
   flutter run -d ios
   
   # For Web
   flutter run -d chrome
   ```

---

## ⚙️ Configuration

### Database Configuration

Edit `website/backend/.env`:
```env
# Database
DATABASE_URL=mysql+pymysql://username:password@host:port/database

# JWT Configuration
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (Optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Scheduler Configuration

The system runs automated tasks:
- **ETL Pipeline**: Every 4 hours (processes new sales data)
- **Reward System**: After ETL completion (updates customer points)
- **AI Model Training**: When new data is available

Configure in `website/backend/scheduler.py`:
```python
scheduler.add_job(
    run_etl_job, 
    'interval', 
    hours=4,  # Adjust frequency
    id='etl_job'
)
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### Register Customer
```http
POST /signup
Content-Type: application/json

{
  "username": "customer1",
  "email": "customer@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "9876543210"
}
```

#### Login
```http
POST /token
Content-Type: application/x-www-form-urlencoded

username=customer1&password=securepassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "customer"
}
```

### Customer Endpoints

#### Get Products
```http
GET /products?skip=0&limit=100
Authorization: Bearer {token}
```

#### Get Customer Analytics
```http
GET /analytics/customer/{customer_id}
Authorization: Bearer {token}
```

#### Get Reward Points
```http
GET /rewards/{customer_id}
Authorization: Bearer {token}
```

### Business Owner Endpoints

#### Dashboard Analytics
```http
GET /business/dashboard/analytics
Authorization: Bearer {token}
```

#### Get All Customers
```http
GET /business/customers
Authorization: Bearer {token}
```

#### Customer Details
```http
GET /business/customers/{customer_id}
Authorization: Bearer {token}
```

### Interactive API Documentation

FastAPI provides interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🗄️ Database Schema

### Core Tables

#### `customers`
```sql
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- full_name
- phone
- reward_points
- total_spent
- created_at
```

#### `business_owners`
```sql
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- business_name
- created_at
```

#### `products`
```sql
- id (PK)
- name
- category
- price
- stock
- description
- image_url
- created_at
```

#### `sales`
```sql
- id (PK)
- customer_id (FK)
- product_id (FK)
- quantity
- total_amount
- sale_date
- payment_method
- status
```

#### `customer_analytics`
```sql
- id (PK)
- customer_id (FK)
- total_purchases
- average_order_value
- last_purchase_date
- favorite_category
- loyalty_score
- updated_at
```

#### `ai_predictions`
```sql
- id (PK)
- prediction_type
- customer_id (FK)
- predicted_value
- confidence_score
- created_at
```

---

## 🤖 Analytics & AI

### ETL Pipeline

The system automatically processes sales data every 4 hours:

1. **Extract**: Fetch new sales from database
2. **Transform**: Calculate metrics, aggregate data
3. **Load**: Update analytics tables and AI predictions

### AI Features

- **Purchase Prediction**: Predict next purchase timing
- **Category Affinity**: Identify customer preferences
- **Churn Risk**: Detect customers at risk of leaving
- **Revenue Forecasting**: Project future revenue trends

### Analytics Metrics

**Customer Metrics:**
- Total purchases and spending
- Average order value
- Purchase frequency
- Category preferences
- Loyalty score

**Business Metrics:**
- Daily/Weekly/Monthly revenue
- Top-selling products
- Customer acquisition trends
- Inventory turnover
- Profit margins

---

## 📱 Mobile App (Flutter)

### Features

- User authentication
- Product browsing and search
- Shopping cart
- Order placement
- Rewards tracking
- Purchase history
- Push notifications

### Supported Platforms

- ✅ Android (API 21+)
- ✅ iOS (13.0+)
- ✅ Web

---

## 🎯 Reward System

### Point Calculation

- **Base Points**: ₹1 spent = 1 point
- **Weekly Bonus**: Top 10 customers get bonus points
  - 1st place: 500 points
  - 2nd place: 300 points
  - 3rd place: 200 points
  - 4th-10th: 100 points each

### Weekly Rewards Schedule

Rewards are calculated and distributed automatically:
- **Frequency**: Weekly (Sunday 11:59 PM)
- **Criteria**: Total spending in the past 7 days
- **Automation**: Handled by scheduler

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt
- **Role-based Access**: Customer and Business Owner roles
- **CORS Protection**: Configured allowed origins
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Environment Variables**: Sensitive data in .env
- **HTTPS Ready**: Production-ready security

---

## 🧪 Testing

### Backend Tests
```bash
cd website/backend
pytest
```

### Frontend Tests
```bash
cd website/frontend
npm test
```

---

## 📝 Development Workflow

### Git Workflow

1. **Main Branch**: Production-ready code
2. **Dev Branch**: Development and testing
3. **Feature Branches**: New features
4. **Pull Requests**: Code review before merge

### Commit Conventions

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- **Python**: PEP 8
- **TypeScript**: ESLint + Prettier
- **Dart**: Flutter style guide

---

## 📊 Project Stats

- **Total Lines of Code**: 50,000+
- **API Endpoints**: 30+
- **Database Tables**: 10+
- **Frontend Pages**: 15+
- **AI Models**: 4+

---

## 🐛 Known Issues

- [ ] MySQL connection timeout on slow networks
- [ ] Mobile app image caching optimization needed
- [ ] Dashboard chart loading delay with large datasets

See [Issues](https://github.com/AnandaRimal/code2create_100x/issues) for more.

---

## 🗺️ Roadmap

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Email notification system
- [ ] Advanced AI recommendations
- [ ] Social media login (Google, Facebook)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Docker containerization

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Development Team**: code2create_100x
- **Project Lead**: [Ananda Rimal](https://github.com/AnandaRimal)

---

## 📞 Support

For support and queries:
- **GitHub Issues**: [Report a bug](https://github.com/AnandaRimal/code2create_100x/issues)
- **Email**: support@pasale.com
- **Documentation**: [Wiki](https://github.com/AnandaRimal/code2create_100x/wiki)

---

## 🙏 Acknowledgments

- FastAPI for the amazing Python framework
- Next.js for the powerful React framework
- Flutter for cross-platform mobile development
- shadcn/ui for beautiful UI components
- All open-source contributors

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the code2create_100x team

[⬆ Back to Top](#️-pasale---smart-shopping-rewards-platform)

</div>
