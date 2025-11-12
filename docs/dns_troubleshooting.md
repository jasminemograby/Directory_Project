# פתרון בעיית DNS - Supabase Connection

## הבעיה:
`getaddrinfo ENOTFOUND db.glnwnrlotpmhjkkkonky.supabase.co`

זה אומר שהמחשב שלך לא יכול לפתור את שם המארח של Supabase.

## פתרונות אפשריים:

### פתרון 1: שינוי DNS Servers

1. **פתח Network Settings:**
   - לחץ ימני על ה-WiFi/Ethernet icon
   - בחר **Open Network & Internet settings**
   - לחץ על **Change adapter options**
   - לחץ ימני על ה-Connection שלך → **Properties**
   - בחר **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**

2. **שנה DNS Servers:**
   - בחר **Use the following DNS server addresses**
   - Preferred DNS: `8.8.8.8` (Google)
   - Alternate DNS: `8.8.4.4` (Google)
   - או:
   - Preferred DNS: `1.1.1.1` (Cloudflare)
   - Alternate DNS: `1.0.0.1` (Cloudflare)

3. **שמור והפעל מחדש את ה-Connection**

### פתרון 2: בדוק Firewall/VPN

1. **כבה VPN זמנית** (אם יש)
2. **בדוק Firewall:**
   - Windows Security → Firewall & network protection
   - ודא ש-Node.js מורשה

### פתרון 3: נסה דרך Supabase Dashboard

1. לך ל-Supabase Dashboard
2. Settings → **Database**
3. חפש **Connection string** או **Connection info**
4. נסה את ה-Connection Pooler URL עם region אחר

### פתרון 4: השתמש ב-Supabase REST API (זמני)

אם חיבור ישיר לא עובד, אפשר להשתמש ב-Supabase REST API במקום:

1. השתמש ב-`SUPABASE_URL` ו-`SUPABASE_SERVICE_ROLE_KEY`
2. בצע API calls במקום SQL queries
3. זה דורש שינוי קוד אבל יכול לעבוד

### פתרון 5: בדוק Network Connectivity

```powershell
# בדוק אם אתה יכול להגיע ל-Supabase
Test-NetConnection -ComputerName supabase.com -Port 443

# בדוק DNS resolution
Resolve-DnsName db.glnwnrlotpmhjkkkonky.supabase.co
```

---

## מה לעשות עכשיו:

1. **נסה פתרון 1** (שינוי DNS) - זה הכי סביר לפתור את הבעיה
2. **אם לא עובד**, נסה פתרון 2 (כבה VPN/בדוק Firewall)
3. **אם עדיין לא עובד**, נסה לקבל Connection Pooler URL עם region אחר מ-Supabase Dashboard

לאחר שתנסה, הפעל מחדש את השרת ובדוק שוב.

