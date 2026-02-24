# 🚀 Deployment Guide - Forgot Password Feature

## TL;DR (Deploy in 15 Minutes)

```bash
# 1. Configure Gmail (5 min)
# Go: https://myaccount.google.com/apppasswords
# Copy: 16-char app password

# 2. Update .env
nano .env  # or vi .env
# Add:
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_16_char_password
# SMTP_FROM=noreply@floorease.com

# 3. Install (automatic - already done)
npm list nodemailer  # Verify installed

# 4. Test
npm run dev
# In another terminal:
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 5. Deploy!
git add .
git commit -m "Add forgot password feature with Email OTP"
git push
```

---

## Step-by-Step Deployment

### **Phase 1: Pre-Deployment (15 minutes)**

#### **Step 1: Gmail SMTP Setup (5 minutes)**

1. **Enable 2-Factor Authentication** (if not already done)
   - Go to: https://myaccount.google.com/security
   - Click: "2-Step Verification"
   - Follow: Google's setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: "Mail" from dropdown
   - Select: "Windows Computer" (or your device)
   - Click: "Generate"
   - Copy: 16-character password (looks like: `abcd efgh ijkl mnop`)

3. **Save App Password Somewhere**
   - Don't lose it! You'll need it next

#### **Step 2: Update Environment File (3 minutes)**

1. **Open `.env` file**
   ```bash
   cp .env.example .env  # If .env doesn't exist
   nano .env             # Edit the file
   ```

2. **Update SMTP Variables**
   ```bash
   SMTP_USER=your_gmail_email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # 16-char app password
   SMTP_FROM=noreply@floorease.com  # Optional, defaults to SMTP_USER
   ```

3. **Save and Exit**
   - Press: `Ctrl+X` then `Y` then `Enter` (in nano)
   - Or: `:wq` then `Enter` (in vi)

4. **Verify File Updated**
   ```bash
   grep SMTP_USER .env  # Should show your email
   ```

#### **Step 3: Verify Dependencies (2 minutes)**

```bash
# Check nodemailer is installed
npm list nodemailer

# Expected output:
# floorease_api@1.0.0
# └── nodemailer@6.10.1

# If not installed:
npm install nodemailer
```

#### **Step 4: Verify Files (5 minutes)**

Check all files are in place:

```bash
# Check code files exist
ls -la utils/mailer.js                    # Should exist ✅
ls -la models/user.model.js               # Should exist ✅
ls -la controllers/auth.controller.js     # Should exist ✅
ls -la routes/auth.routes.js              # Should exist ✅

# Check configuration
ls -la .env                               # Should exist ✅
grep SMTP_USER .env                       # Should have Gmail email ✅

# Check syntax
node -c controllers/auth.controller.js    # Should pass ✅
node -c utils/mailer.js                   # Should pass ✅
```

---

### **Phase 2: Local Testing (10 minutes)**

#### **Step 5: Start Server**

```bash
npm run dev

# Expected output:
# Server running at http://localhost:4000
# 📍 Available Routes:
# ==================
# POST   /api/auth/forgot-password
# POST   /api/auth/verify-reset-otp
# POST   /api/auth/reset-password
# ... (other routes)
# ==================
```

#### **Step 6: Test Forgot Password Endpoint**

**Using cURL:**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@gmail.com"}'

# Expected response (200):
# {"message":"OTP sent to your email"}
```

**Check Email:**
- Open your email account
- Check inbox for email from `SMTP_USER`
- Should contain 6-digit OTP code
- Valid for 10 minutes

#### **Step 7: Test OTP Verification**

```bash
# Use OTP from email (example: 123456)
curl -X POST http://localhost:4000/api/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@gmail.com","otp":"123456"}'

# Expected response (200):
# {"message":"OTP verified successfully"}
```

#### **Step 8: Test Password Reset**

```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@gmail.com",
    "newPassword":"newPassword123",
    "confirmPassword":"newPassword123"
  }'

# Expected response (200):
# {"message":"Password reset successfully..."}
```

#### **Step 9: Verify Password Changed**

```bash
# Try login with old password - should FAIL
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@gmail.com","password":"oldPassword"}'

# Expected: 401 Invalid credentials

# Try login with new password - should SUCCEED
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@gmail.com","password":"newPassword123"}'

# Expected: 200 with token
```

#### **Alternative: Interactive Testing**

```bash
# Run interactive test script
bash test_password_reset.sh

# Prompts you step by step
# Paste OTP from email when asked
# Test complete reset flow
```

---

### **Phase 3: Code Review (5 minutes)**

Before deploying to production, verify the code:

```bash
# Check all files were updated correctly
git diff models/user.model.js              # Should show 5 new fields
git diff controllers/auth.controller.js    # Should show 3 new functions
git diff routes/auth.routes.js             # Should show 3 new routes
git diff package.json                      # Should show nodemailer

# Check new files were created
git status | grep -E "utils/mailer|env.example"
```

---

### **Phase 4: Production Deployment**

#### **Option A: Manual Deployment**

```bash
# 1. Add files to git
git add -A

# 2. Commit changes
git commit -m "Add forgot password feature with Email OTP

Features:
- 3 new API endpoints for password reset
- Email OTP verification (10 min expiry)
- Rate limiting (60 sec between requests)
- Attempt limiting (max 5 attempts)
- Bcrypt hashing for OTP and password
- Professional HTML email template"

# 3. Push to remote
git push origin main  # or your branch name

# 4. SSH into production server
ssh user@your-server.com

# 5. Pull latest code
cd /path/to/floorease_api
git pull origin main

# 6. Install dependencies (if any new ones)
npm install

# 7. Update environment variables on server
nano .env
# Verify SMTP_USER, SMTP_PASS are set correctly on production

# 8. Restart server
pm2 restart all   # or your process manager
# or: systemctl restart floorease_api

# 9. Verify it's running
curl http://localhost:4000/api/auth/forgot-password \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### **Option B: CI/CD Pipeline (Recommended)**

If using GitHub Actions, GitLab CI, etc:

```yaml
# Your CI/CD will:
# 1. Pull latest code ✅
# 2. Run tests ✅
# 3. Build if needed ✅
# 4. Deploy to production ✅
# 5. Restart services ✅

# Just push and let automation handle it!
git push origin main
```

#### **Option C: Docker Deployment**

If using Docker:

```dockerfile
# Dockerfile already includes:
# - Node.js runtime
# - npm install step
# - npm start command

# Just rebuild and redeploy:
docker build -t floorease:latest .
docker run -e SMTP_USER=... -e SMTP_PASS=... floorease:latest
```

---

## Verification Checklist

### **After Local Testing**
- [ ] Server starts without errors
- [ ] Routes list includes new endpoints
- [ ] OTP email sends successfully
- [ ] OTP verification works
- [ ] Password reset works
- [ ] New password required for login
- [ ] Old password no longer works
- [ ] No errors in console

### **After Production Deployment**
- [ ] Code is on production server
- [ ] `.env` has correct SMTP credentials on production
- [ ] Server starts without errors on production
- [ ] Test forgot password endpoint on production
- [ ] Verify email sends from production server
- [ ] Existing features still work (register, login, profile)
- [ ] No breaking changes
- [ ] Monitor logs for errors

---

## Rollback Plan (If Needed)

If something goes wrong, quickly rollback:

```bash
# 1. Revert commits
git revert HEAD           # Reverts last commit
# or
git reset --hard HEAD~1   # Discards last commit

# 2. Restart server
pm2 restart all
# or
systemctl restart floorease_api

# 3. Verify old version is running
curl http://localhost:4000/
```

---

## Post-Deployment Monitoring

### **Check Logs**
```bash
# View recent logs
pm2 logs floorease_api  # if using PM2
tail -f /var/log/floorease_api.log  # if using custom logging
docker logs floorease  # if using Docker
```

### **Monitor SMTP Errors**
- Look for "EMAIL SENDING ERROR" in logs
- Check Gmail account isn't blocking apps
- Verify app password hasn't changed

### **Monitor API Usage**
- Watch for unusual OTP requests (rate limit working?)
- Check attempt limits are being enforced
- Monitor server response times

### **Test in Production**
```bash
# Daily quick test
curl -X POST https://your-domain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should respond: 200 with "OTP sent to your email"
```

---

## Troubleshooting During Deployment

### **"Email sending failed"**
```
Cause: SMTP credentials incorrect
Fix: Verify .env has correct SMTP_USER and SMTP_PASS
     Check app password format (16 characters with spaces)
```

### **"Routes not found (404)"**
```
Cause: Server not restarted after code changes
Fix: Restart server: npm run dev or pm2 restart all
     Verify routes appear in startup console output
```

### **"OTP not received"**
```
Cause: Email filters, wrong email, SMTP config
Fix: Check spam/junk folder
     Verify email address is correct
     Check SMTP_USER is valid Gmail address
     Check Gmail allows less secure apps (if not using app password)
```

### **"Cannot read property 'resetOtpHash'"**
```
Cause: Database doesn't have new fields
Fix: Restart MongoDB if needed
     Existing users don't have fields - they'll be created on first use
     New users automatically get all fields
```

---

## Performance Considerations

### **Email Sending**
- Nodemailer is non-blocking (async)
- Email sending doesn't block API response
- No performance impact on other endpoints

### **Database**
- New fields only stored for users who reset password
- Queries still fast (indexes on email not affected)
- Migration not needed (fields optional)

### **Rate Limiting**
- Checked in code (no external service needed)
- Simple timestamp comparison
- Minimal performance impact

---

## Security Verification

After deployment, verify security:

```bash
# 1. Verify OTP not in logs
grep -i "otp" /var/log/floorease_api.log
# Should only see: "OTP GENERATED" in dev logs, never the actual OTP

# 2. Verify no plain passwords
grep -i "password" /var/log/floorease_api.log
# Should only see: "Password reset successfully", never plain passwords

# 3. Test rate limiting
for i in {1..3}; do
  curl -X POST http://localhost:4000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "Request $i complete"
  sleep 5
done
# 3rd request should get: 429 "Please wait X seconds"

# 4. Test attempt limiting
# Try wrong OTP 5+ times
# 6th attempt should get: 429 "Too many attempts"
```

---

## Success Indicators

Deployment is successful when:

- ✅ Code deployed to production
- ✅ Server starts without errors
- ✅ New endpoints are accessible
- ✅ Email sends successfully
- ✅ OTP verification works
- ✅ Password reset works
- ✅ Old features still work
- ✅ No errors in logs
- ✅ Rate limiting works
- ✅ Security checks pass

---

## Support & Documentation

If you need help:

1. **Quick Setup** → [PASSWORD_RESET_QUICKSTART.md](PASSWORD_RESET_QUICKSTART.md)
2. **Full Details** → [FORGOT_PASSWORD_IMPLEMENTATION.md](FORGOT_PASSWORD_IMPLEMENTATION.md)
3. **Code** → [CODE_REFERENCE.md](CODE_REFERENCE.md)
4. **Verification** → [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)
5. **Navigation** → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Gmail SMTP Setup | 5 min |
| 2 | Update .env | 3 min |
| 3 | Verify Files | 2 min |
| 4 | Local Testing | 5 min |
| 5 | Code Review | 5 min |
| 6 | Push to Git | 2 min |
| 7 | Deploy | 5-30 min* |
| **TOTAL** | | **15-45 min** |

*Depends on your deployment method

---

## Final Checklist

Before marking as complete:

- [ ] Gmail SMTP configured
- [ ] .env updated with credentials
- [ ] Dependencies installed
- [ ] Server starts successfully
- [ ] All 3 endpoints tested locally
- [ ] Email sending works
- [ ] Password reset works
- [ ] Existing features still work
- [ ] Code reviewed
- [ ] Committed to git
- [ ] Deployed to production
- [ ] Production tests pass
- [ ] Logs monitored
- [ ] No errors found

---

## 🎉 Deployment Complete!

Your forgot password feature is now live!

**What users can do:**
- Request password reset via email
- Receive OTP via email
- Verify OTP
- Set new password securely
- Login with new password

**What's protected:**
- OTP hashed before storage
- Password hashed before storage
- Rate limiting prevents spam
- Attempt limiting prevents brute force
- Privacy protection for email existence

---

**Deployed**: [Today's Date]
**Status**: ✅ Live & Operational
**Support**: See DOCUMENTATION_INDEX.md
