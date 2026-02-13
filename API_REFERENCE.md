# API Endpoints - Quick Reference

## Base URL
```
http://localhost:4000/api
```

## Authentication Endpoints

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}

Response (201):
{
  "message": "Register success",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 3. Get User Profile
```http
GET /auth/profile
Authorization: Bearer YOUR_TOKEN_HERE

Response (200):
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "profileImage": "http://localhost:4000/uploads/img-1234567890.jpg"
}
```

## Profile Image Endpoints

### 4. Upload Image
```http
POST /upload
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

FormData:
  image: [file binary]

Response (201):
{
  "message": "Uploaded",
  "imageUrl": "http://localhost:4000/uploads/img-1234567890.jpg"
}
```

### 5. Update Profile Image
```http
PUT /auth/profile/image
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "profileImage": "http://localhost:4000/uploads/img-1234567890.jpg"
}

Response (200):
{
  "message": "Profile image updated",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profileImage": "http://localhost:4000/uploads/img-1234567890.jpg"
  }
}
```

### 6. Delete Profile Image
```http
DELETE /auth/profile/image
Authorization: Bearer YOUR_TOKEN_HERE

Response (200):
{
  "message": "Profile image deleted",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profileImage": null
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## cURL Examples

### Login and Save Token
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### Complete Image Change Flow
```bash
# 1. Upload image
IMAGE_URL=$(curl -s -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg" \
  | jq -r '.imageUrl')

echo "Uploaded: $IMAGE_URL"

# 2. Update profile with image
curl -X PUT http://localhost:4000/api/auth/profile/image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"profileImage\":\"$IMAGE_URL\"}"

# 3. Verify profile
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Image
```bash
curl -X DELETE http://localhost:4000/api/auth/profile/image \
  -H "Authorization: Bearer $TOKEN"
```

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "FloorEase API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"+1234567890\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/profile",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "profile"]
            }
          }
        }
      ]
    },
    {
      "name": "Profile Image",
      "item": [
        {
          "name": "Upload Image",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "image",
                  "type": "file",
                  "src": "/path/to/image.jpg"
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/upload",
              "host": ["{{baseUrl}}"],
              "path": ["upload"]
            }
          }
        },
        {
          "name": "Update Profile Image",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"profileImage\": \"http://localhost:4000/uploads/img-1234567890.jpg\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/profile/image",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "profile", "image"]
            }
          }
        },
        {
          "name": "Delete Profile Image",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/profile/image",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "profile", "image"]
            }
          }
        }
      ]
    }
  ]
}
```

## Notes

- All protected endpoints require `Authorization: Bearer <token>` header
- Token is received after successful login
- Token expires in 7 days
- Image uploads accept JPEG, PNG formats
- Maximum file size depends on multer configuration (default ~10MB)
- Images are stored in `/uploads` directory
- Image URLs are full URLs: `http://localhost:4000/uploads/filename.jpg`
- Deleting profile image also removes the physical file from server
