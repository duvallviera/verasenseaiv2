# VeriSense AI Backend

A Node.js backend API for the VeriSense AI application, designed to be deployed on Railway.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Railway will automatically detect this as a Node.js project
3. Add environment variables in Railway dashboard
4. Deploy!

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/me` - Get current user info

## 🔧 Environment Variables

Set these in your Railway dashboard:

- `PORT` - Server port (Railway sets this automatically)
- `DATABASE_URL` - PostgreSQL connection string (Railway provides this)
- `FRONTEND_URL` - Your frontend domain
- `JWT_SECRET` - Secret key for JWT tokens

## 🗄️ Database

Railway provides a PostgreSQL database automatically. The connection string is available as `DATABASE_URL` environment variable.

## 🛡️ Security Features

- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- Error handling

## 📝 Notes

This is a basic backend setup. For production, consider adding:
- Real database models
- JWT token verification
- Password hashing
- Input sanitization
- Logging
- Monitoring
