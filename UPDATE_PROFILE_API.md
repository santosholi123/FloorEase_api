# ✅ Update Profile API - Implementation Complete

## Endpoint

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

## Request Body

All fields are **optional**. Only include the fields you want to update:

```json
{
  "fullName": "John Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890",
  "password": "newpassword123"
}
```

## Response (200 OK)

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "newemail@example.com",
    "phone": "+1234567890",
    "profileImage": "http://localhost:4000/uploads/img-123.jpg",
    "role": "user"
  }
}
```

## Features

### ✅ 1. Selective Updates
- Only updates fields that are provided in the request
- Empty or undefined fields are ignored
- No need to send all fields

### ✅ 2. Email Uniqueness Check
- If email is being changed, checks if another user already has that email
- Returns `409 Conflict` if email is taken
- Allows keeping the same email (no error)

### ✅ 3. Password Hashing
- If password is provided, it's automatically hashed with bcrypt (salt rounds: 10)
- Password is never returned in responses

### ✅ 4. Proper Error Handling
- `400` - No valid fields to update
- `404` - User not found
- `409` - Email already in use by another user
- `500` - Server error

### ✅ 5. JWT Authentication
- Route is protected with `verifyToken` middleware
- Only the logged-in user can update their own profile

## Usage Examples

### Update Name Only
```bash
curl -X PUT http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fullName": "Jane Smith"}'
```

### Update Multiple Fields
```bash
curl -X PUT http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+9876543210"
  }'
```

### Update Password
```bash
curl -X PUT http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"password": "mynewpassword123"}'
```

### Update Email (with uniqueness check)
```bash
curl -X PUT http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email": "newemail@example.com"}'
```

## Error Responses

### 400 - No Valid Fields
```json
{
  "message": "No valid fields to update"
}
```

### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

### 409 - Email Already In Use
```json
{
  "message": "Email already in use"
}
```

### 500 - Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Implementation Details

### Controller Function: `updateProfile`

Located in: `controllers/auth.controller.js`

**Logic Flow:**
1. Extract user ID from JWT token (`req.user.id`)
2. Fetch current user from database
3. Build updates object with only provided fields
4. Trim all string fields to remove whitespace
5. If email is changing:
   - Convert to lowercase
   - Check if another user has this email
   - Return 409 if email is taken
6. If password is provided:
   - Hash it with bcrypt (10 salt rounds)
7. Update user in database using `findByIdAndUpdate`
8. Return updated user (excluding password)

### Route Configuration

Located in: `routes/auth.routes.js`

```javascript
router.put("/profile", verifyToken, updateProfile);
```

- **Method:** PUT
- **Path:** `/profile`
- **Middleware:** `verifyToken` (JWT authentication)
- **Handler:** `updateProfile` controller function

## Testing

### Automated Test Script
```bash
./test_update_profile.sh
```

The script will:
1. Login/create test user
2. Get initial profile
3. Update name only
4. Update multiple fields
5. Verify final profile

### Manual Testing with Postman

1. **Login** to get token:
   ```
   POST http://localhost:4000/api/auth/login
   Body: { "email": "test@test.com", "password": "password123" }
   ```

2. **Copy token** from response

3. **Update profile**:
   ```
   PUT http://localhost:4000/api/auth/profile
   Headers:
     Authorization: Bearer YOUR_TOKEN
     Content-Type: application/json
   Body: { "fullName": "New Name", "phone": "+1234567890" }
   ```

4. **Verify** with GET profile:
   ```
   GET http://localhost:4000/api/auth/profile
   Headers:
     Authorization: Bearer YOUR_TOKEN
   ```

## Integration with Flutter

### Dart/Flutter Implementation

```dart
// Data Source
class ProfileRemoteDataSource {
  final ApiClient apiClient;

  Future<ProfileModel> updateProfile({
    String? fullName,
    String? email,
    String? phone,
    String? password,
  }) async {
    final body = <String, dynamic>{};
    
    if (fullName != null) body['fullName'] = fullName;
    if (email != null) body['email'] = email;
    if (phone != null) body['phone'] = phone;
    if (password != null) body['password'] = password;

    final response = await apiClient.put('/auth/profile', body);
    
    if (response['user'] != null) {
      return ProfileModel.fromJson(response['user']);
    }
    return ProfileModel.fromJson(response);
  }
}

// Usage in Provider
class ProfileProvider extends ChangeNotifier {
  Future<void> updateProfile({
    String? fullName,
    String? email,
    String? phone,
    String? password,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final updatedProfile = await remoteDataSource.updateProfile(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      );
      
      _profile = updatedProfile;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
}

// Usage in UI
onPressed: () async {
  await context.read<ProfileProvider>().updateProfile(
    fullName: nameController.text,
    phone: phoneController.text,
  );
}
```

## Security Considerations

✅ **JWT Authentication** - Only authenticated users can update profiles
✅ **User Isolation** - Users can only update their own profile
✅ **Password Hashing** - Passwords are hashed before storage
✅ **Email Validation** - Checks for duplicate emails
✅ **Input Trimming** - Removes leading/trailing whitespace
✅ **Password Exclusion** - Passwords never returned in responses

## Files Modified

1. **controllers/auth.controller.js**
   - Added `exports.updateProfile` function
   - Implements all business logic
   - ~80 lines of code

2. **routes/auth.routes.js**
   - Added `updateProfile` import
   - Added `router.put("/profile", verifyToken, updateProfile)`

## Summary

| Feature | Status |
|---------|--------|
| Selective field updates | ✅ |
| Email uniqueness check | ✅ |
| Password hashing | ✅ |
| Error handling | ✅ |
| JWT authentication | ✅ |
| Input validation | ✅ |
| Response formatting | ✅ |
| Documentation | ✅ |
| Test script | ✅ |

**Status:** Production Ready ✅

---

**Created:** February 11, 2026  
**Endpoint:** `PUT /api/auth/profile`  
**Authentication:** Required (JWT)
