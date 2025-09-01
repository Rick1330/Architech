# 🔒 Security Setup Guide

## ⚠️ CRITICAL: Environment Variables Setup

**NEVER run this project with default passwords!**

### Quick Setup (Recommended)

**For Linux/Mac:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**For Windows:**
```cmd
setup-env.bat
```

### Manual Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets:**
   ```bash
   # Generate database password (24 characters)
   openssl rand -base64 24 | tr -d "=+/"
   
   # Generate JWT secret (64 characters)
   openssl rand -base64 64
   ```

3. **Update .env file with generated values:**
   - Replace `CHANGE_ME_$(date +%s)` with your generated database password
   - Replace `CHANGE_ME_GENERATE_SECURE_JWT_SECRET` with your generated JWT secret
   - Optionally change `POSTGRES_USER` from default `architech`

### Frontend Environment

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API URLs if different from defaults
```

## 🛡️ Security Checklist

### Development Environment
- [ ] `.env` file created with unique secrets
- [ ] Default passwords changed
- [ ] `.env` file added to `.gitignore`
- [ ] Secrets are not committed to version control

### Production Environment
- [ ] Use external secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Enable SSL/TLS for all services
- [ ] Use strong, unique passwords (min 32 characters)
- [ ] Enable database encryption at rest
- [ ] Implement proper network segmentation
- [ ] Enable audit logging
- [ ] Regular secret rotation schedule
- [ ] Backup and disaster recovery plan

## 🚨 Security Warnings

### What NOT to do:
- ❌ Use default passwords (`architech_password`, `your-jwt-secret-key`)
- ❌ Commit `.env` files to git
- ❌ Share secrets in chat/email
- ❌ Use simple passwords (`password123`, `admin`, etc.)
- ❌ Reuse secrets across environments

### What TO do:
- ✅ Generate random, strong secrets (min 24 chars)
- ✅ Use different secrets for each environment
- ✅ Store secrets securely (secret vaults)
- ✅ Rotate secrets regularly
- ✅ Use principle of least privilege

## 🔧 Environment Variables Reference

### Required Variables (Must be set)
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database username  
- `POSTGRES_PASSWORD`: Database password (**MUST BE SECURE**)
- `JWT_SECRET`: JWT signing secret (**MUST BE SECURE**)

### Optional Variables (Have defaults)
- `REDIS_URL`: Redis connection URL
- `KAFKA_BROKERS`: Kafka broker addresses
- Service ports and URLs

## 🧪 Testing Security Setup

After setup, verify your configuration:

```bash
# 1. Check that secrets are not hardcoded
grep -r "architech_password" . --exclude-dir=node_modules || echo "✅ No hardcoded passwords found"
grep -r "your-jwt-secret-key" . --exclude-dir=node_modules || echo "✅ No hardcoded JWT secrets found"

# 2. Verify environment file exists
test -f .env && echo "✅ .env file exists" || echo "❌ .env file missing"

# 3. Check that .env is not tracked by git
git check-ignore .env && echo "✅ .env properly ignored" || echo "⚠️ .env might be tracked"

# 4. Test services startup
docker-compose config
```

## 🆘 If You Accidentally Committed Secrets

If you accidentally committed secrets to git:

1. **Immediately revoke/change the secrets**
2. **Remove from git history:**
   ```bash
   # For recent commits
   git reset --hard HEAD~1
   
   # For older commits, use git filter-branch or BFG Repo-Cleaner
   # See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```
3. **Force push to update remote repository**
4. **Notify team members to re-clone the repository**

## 📚 Additional Resources

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)
- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Environment Variables Best Practices](https://blog.doppler.com/environment-variables-best-practices)