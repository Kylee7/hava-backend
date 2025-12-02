# 🎮 Discord OAuth Setup - دليل كامل

## ❌ **المشكلة:**

```
Invalid OAuth2 redirect_uri
```

---

## ✅ **الحل الكامل:**

### **Part 1: Discord Developer Portal Setup**

#### **1. Create/Open Application:**

```
https://discord.com/developers/applications
```

- إذا مفيش Application، اعمل **New Application**
- اسمه: `Perfect CFW`

#### **2. General Information:**

- **Name:** Perfect CFW
- **Description:** Perfect CFW Roleplay Server
- **Save Changes**

#### **3. OAuth2 → General:**

##### **A. Client Information:**

انسخ:
- **Client ID** (مثال: `123456789012345678`)
- **Client Secret** (اضغط Reset Secret → Copy)

##### **B. Redirects:**

اضغط **Add Redirect** وأضف:

```
https://YOUR-RAILWAY-URL.up.railway.app/api/discord-auth/callback
```

**⚠️ استبدل `YOUR-RAILWAY-URL.up.railway.app` برابط Railway الحقيقي!**

**مثال:**
```
https://perfect-backend-production.up.railway.app/api/discord-auth/callback
```

**⚠️ مهم:**
- ✅ `https://` (مش `http://`)
- ✅ `/api/discord-auth/callback` في الآخر
- ✅ بدون trailing slash
- ✅ بدون spaces

اضغط **Save Changes**

#### **4. Bot:**

- اضغط **Bot** في الsidebar
- إذا مفيش Bot، اضغط **Add Bot**
- **Token:** اضغط Reset Token → Copy

**⚠️ في Bot Settings:**
- Enable: **MESSAGE CONTENT INTENT**
- Save Changes

---

### **Part 2: Railway Environment Variables**

#### **في Railway → Your Project → Variables:**

أضف/حدّث:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/perfect-cfw

# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-min-32-chars

# Frontend
FRONTEND_URL=https://perfect-cfw.netlify.app

# Discord OAuth
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI=https://YOUR-RAILWAY-URL.up.railway.app/api/discord-auth/callback

# Discord Bot
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
```

**⚠️ Important:**
- `DISCORD_REDIRECT_URI` لازم يطابق الـ URI في Discord Portal **بالظبط**
- بدون أخطاء إملائية
- بدون spaces
- نفس الـ `https://`

---

### **Part 3: Verification**

#### **1. Check Discord Portal:**

```
Discord Portal → OAuth2 → Redirects
```

يجب تشوف:
```
✅ https://perfect-backend-production.up.railway.app/api/discord-auth/callback
```

#### **2. Check Railway Variables:**

```
Railway → Variables → DISCORD_REDIRECT_URI
```

يجب تشوف نفس الرابط بالظبط!

#### **3. Test Manually:**

افتح في Browser:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://YOUR-RAILWAY-URL.up.railway.app/api/discord-auth/callback&response_type=code&scope=identify%20email
```

**استبدل:**
- `YOUR_CLIENT_ID` → Discord Client ID بتاعك
- `YOUR-RAILWAY-URL.up.railway.app` → Railway URL بتاعك

**لو فتح صفحة Discord OAuth → يبقى الضبط صح!** ✅

---

## 🔧 **Common Issues:**

### **Issue 1: Invalid redirect_uri**

**السبب:** الـ URI في Railway مش مطابق لـ Discord Portal

**الحل:**
1. Discord Portal → انسخ الـ Redirect URI
2. Railway → Variables → `DISCORD_REDIRECT_URI`
3. Paste الـ URI بالظبط
4. Save → Redeploy

### **Issue 2: http vs https**

```env
❌ DISCORD_REDIRECT_URI=http://...
✅ DISCORD_REDIRECT_URI=https://...
```

Railway دائماً `https://`

### **Issue 3: Trailing slash**

```env
❌ DISCORD_REDIRECT_URI=https://.../callback/
✅ DISCORD_REDIRECT_URI=https://.../callback
```

بدون slash في الآخر!

### **Issue 4: localhost**

```env
❌ DISCORD_REDIRECT_URI=http://localhost:5000/...
✅ DISCORD_REDIRECT_URI=https://your-railway-url.up.railway.app/...
```

استخدم Railway URL، مش localhost!

---

## 📋 **Complete Checklist:**

### **Discord Portal:**
- [ ] Application created
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Redirect URI added: `https://railway-url.up.railway.app/api/discord-auth/callback`
- [ ] Changes saved
- [ ] Bot created
- [ ] Bot Token copied
- [ ] MESSAGE CONTENT INTENT enabled

### **Railway:**
- [ ] `DISCORD_CLIENT_ID` added
- [ ] `DISCORD_CLIENT_SECRET` added
- [ ] `DISCORD_REDIRECT_URI` added (matches Discord Portal exactly)
- [ ] `DISCORD_BOT_TOKEN` added
- [ ] `FRONTEND_URL` added (no trailing slash)
- [ ] All variables saved
- [ ] Redeployed
- [ ] Logs: `✅ Server running`

### **Testing:**
- [ ] Frontend opens: `https://perfect-cfw.netlify.app`
- [ ] Click "تسجيل دخول"
- [ ] Discord OAuth opens (not error page)
- [ ] Authorize works
- [ ] Returns to Frontend
- [ ] User logged in

---

## 🎯 **Example Configuration:**

### **Discord Portal:**

```
Application: Perfect CFW
Client ID: 123456789012345678
Client Secret: abcd1234efgh5678ijkl9012mnop3456

OAuth2 Redirects:
✅ https://perfect-backend-production.up.railway.app/api/discord-auth/callback

Bot Token: MTA...xyz (Discord Bot Token)
MESSAGE CONTENT INTENT: ✅ Enabled
```

### **Railway Variables:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/perfect-cfw
PORT=5000
NODE_ENV=production
JWT_SECRET=super-secret-key-min-32-characters-long
FRONTEND_URL=https://perfect-cfw.netlify.app
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=abcd1234efgh5678ijkl9012mnop3456
DISCORD_REDIRECT_URI=https://perfect-backend-production.up.railway.app/api/discord-auth/callback
DISCORD_BOT_TOKEN=MTA...xyz
```

---

## 🚀 **Success Indicators:**

```
✅ Discord OAuth page opens (not error)
✅ Shows "Perfect CFW wants to access your account"
✅ Authorize button works
✅ Redirects back to your site
✅ User is logged in
✅ Username appears in navbar
```

---

## 💡 **Pro Tips:**

1. **Always use HTTPS** على Railway (automatic)
2. **Copy-paste URLs** - مش اكتبهم manually
3. **Check for typos** - خصوصاً في Variables
4. **No trailing slashes** في URLs
5. **Save and redeploy** بعد كل تعديل
6. **Test manually** باستخدام OAuth URL
7. **Check Railway logs** للـ debugging

---

## 🎉 **Final Test:**

```bash
# 1. Open Frontend
https://perfect-cfw.netlify.app

# 2. Click "تسجيل دخول"
# Should redirect to Discord

# 3. Click "Authorize"
# Should redirect back to your site

# 4. Check navbar
# Should show Discord username + avatar

# 5. Success! ✅
```

---

# 📞 **Need Help?**

**Common fixes:**
1. Match URIs exactly (Discord ↔️ Railway)
2. Use HTTPS (not HTTP)
3. Remove trailing slashes
4. Save changes in both places
5. Redeploy Railway
6. Clear browser cache
7. Try incognito mode

**If still not working:**
- Check Railway logs for errors
- Test OAuth URL manually
- Verify all Environment Variables
- Check Discord Portal settings

---

**Setup time: 5 minutes**
**Success rate: 100% if followed exactly**
