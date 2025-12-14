# Security Policy

## Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities privately through one of these methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/digitalsorc/Default-Starter-Template-Repository/security/advisories)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email** (Alternative)
   - Send an email to: [security@example.com](mailto:security@example.com)
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: What an attacker could do with this vulnerability
- **Reproduction Steps**: Step-by-step guide to reproduce the issue
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have ideas for how to fix it
- **Proof of Concept**: Code or screenshots (if applicable)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium: Within 90 days
  - Low: Next regular release

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### For Contributors

When contributing code:

1. **Never Commit Secrets**

   ```bash
   # Check before committing
   git diff

   # Ensure .env is in .gitignore
   grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
   ```

2. **Validate All Input**

   ```typescript
   // Use validation library
   import { validate, schemas } from '@/utils/validation';

   const email = validate(schemas.email, userInput);
   ```

3. **Use Parameterized Queries**

   ```typescript
   // ✅ GOOD: Parameterized query
   db.query('SELECT * FROM users WHERE id = ?', [userId]);

   // ❌ BAD: String concatenation
   db.query(`SELECT * FROM users WHERE id = ${userId}`);
   ```

4. **Sanitize User Input**

   ```typescript
   import { sanitizeString } from '@/utils/validation';

   const clean = sanitizeString(userInput);
   ```

5. **Keep Dependencies Updated**

   ```bash
   # Check for vulnerabilities
   pnpm audit

   # Fix vulnerabilities
   pnpm audit fix
   ```

### Environment Variables

**Sensitive Data Storage:**

```bash
# .env (NEVER commit!)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=secret-key-here
JWT_SECRET=super-secret-jwt-key
```

**.env.example (Safe to commit):**

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/database
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### Authentication & Authorization

**Password Hashing:**

```typescript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**JWT Tokens:**

```typescript
import jwt from 'jsonwebtoken';

// Create token
const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
  expiresIn: '7d',
});

// Verify token
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
} catch (error) {
  throw new UnauthorizedError('Invalid token');
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

### Security Headers

```typescript
import helmet from 'helmet';

// Use helmet for security headers
app.use(helmet());

// Or configure manually
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Security Tools

### Automated Security Scans

This repository includes automated security scanning:

1. **Dependency Audit** (pnpm audit)
   - Runs on every push
   - Checks for known vulnerabilities
   - Fails CI on high/critical issues

2. **CodeQL** (GitHub)
   - Static analysis security testing (SAST)
   - Scans for security vulnerabilities in code
   - Runs on push and PR

3. **Secret Scanning** (TruffleHog)
   - Scans for accidentally committed secrets
   - Checks entire git history
   - Runs on every commit

4. **Dependency Review** (GitHub)
   - Reviews new dependencies in PRs
   - Checks licenses and vulnerabilities
   - Blocks malicious packages

5. **Semgrep** (SAST)
   - Custom security rules
   - Language-specific checks
   - Runs on every push

### Manual Security Checks

Before releasing:

```bash
# 1. Audit dependencies
pnpm audit --audit-level moderate

# 2. Check for secrets
npx trufflehog filesystem . --json

# 3. Security test
pnpm run test:security  # if implemented

# 4. Build and analyze
pnpm run build
pnpm run analyze  # if implemented
```

## Common Vulnerabilities

### SQL Injection

**Vulnerable Code:**

```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);
```

**Safe Code:**

```typescript
// ✅ Use parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### Cross-Site Scripting (XSS)

**Vulnerable Code:**

```typescript
// ❌ Inserting unsanitized user input
element.innerHTML = userInput;
```

**Safe Code:**

```typescript
// ✅ Sanitize before inserting
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Path Traversal

**Vulnerable Code:**

```typescript
// ❌ Direct use of user input in paths
const filePath = `./uploads/${fileName}`;
fs.readFile(filePath);
```

**Safe Code:**

```typescript
// ✅ Validate and normalize paths
import path from 'path';

const uploadsDir = path.resolve('./uploads');
const filePath = path.normalize(path.join(uploadsDir, fileName));

// Ensure file is within uploads directory
if (!filePath.startsWith(uploadsDir)) {
  throw new Error('Invalid file path');
}

fs.readFile(filePath);
```

### Insecure Randomness

**Vulnerable Code:**

```typescript
// ❌ Math.random() is not cryptographically secure
const token = Math.random().toString(36);
```

**Safe Code:**

```typescript
// ✅ Use crypto for secure random values
import crypto from 'crypto';

const token = crypto.randomBytes(32).toString('hex');
```

## Security Checklist

### For Pull Requests

- [ ] No secrets or API keys committed
- [ ] All user input is validated
- [ ] SQL queries are parameterized
- [ ] Dependencies have no known vulnerabilities
- [ ] Authentication/authorization is implemented correctly
- [ ] Rate limiting is in place (if applicable)
- [ ] Security headers are set
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data

### For Releases

- [ ] All security checks pass
- [ ] Dependencies are up to date
- [ ] Security advisories reviewed
- [ ] Changelog includes security fixes
- [ ] Documentation updated
- [ ] Security test suite passes

## Dependency Management

### Keeping Dependencies Secure

```bash
# Check for outdated packages
pnpm outdated

# Update all dependencies
pnpm update --latest --interactive

# Audit for vulnerabilities
pnpm audit

# Fix vulnerabilities automatically
pnpm audit fix
```

### Monitoring Dependencies

We use:

- **Dependabot**: Automated dependency updates
- **npm audit**: Vulnerability scanning
- **Snyk**: Continuous monitoring (optional)

## Incident Response

If a security vulnerability is confirmed:

1. **Assess Impact**: Determine severity and affected versions
2. **Develop Fix**: Create patch quickly and securely
3. **Test Fix**: Thoroughly test the security patch
4. **Release Patch**: Create emergency release if critical
5. **Notify Users**: Security advisory via GitHub
6. **Update Documentation**: Add to CHANGELOG and security docs

## Security Contact

For security-related questions:

- **Email**: security@example.com
- **GitHub**: @digitalsorc

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors who report valid security issues will be:

- Credited in the CHANGELOG (if desired)
- Listed in SECURITY.md acknowledgments
- Eligible for bug bounty (if program exists)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

**Last Updated**: December 2024
**Template Version**: 1.0.0
