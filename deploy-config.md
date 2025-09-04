# VPS Deployment Configuration

## Pre-deployment Checklist

### 1. Build Optimization
```bash
npm run build
```

### 2. Environment Variables
Ensure `.env` file contains:
```
REACT_APP_RPC_ENDPOINT=https://holy-neat-season.solana-mainnet.quiknode.pro/86d7ca3d0d4f68cdf73254d9e9d167895864f480/
```

### 3. Mobile Responsiveness Features Added
- ✅ Responsive design for all screen sizes (320px to 1200px+)
- ✅ Touch-friendly buttons (44px minimum height)
- ✅ Proper viewport meta tag
- ✅ iOS zoom prevention (font-size: 16px on inputs)
- ✅ Landscape orientation support
- ✅ High DPI display support
- ✅ Accessibility improvements

### 4. Metadata URL Validation
- ✅ Real-time URL validation
- ✅ HTTPS requirement enforcement
- ✅ IPFS URL detection and recommendations
- ✅ Preview link for metadata URLs
- ✅ Error handling for invalid URLs

### 5. VPS Server Configuration

#### Nginx Configuration (`/etc/nginx/sites-available/tokenmint`)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/tokenmint/build;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com
```

### 6. Performance Optimizations
- ✅ Lazy loading of Solana libraries
- ✅ Optimized bundle size
- ✅ Efficient re-renders
- ✅ Proper error boundaries

### 7. Mobile & Wallet Browser Testing Checklist
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on iPad
- [ ] Test landscape/portrait modes
- [ ] Test touch interactions
- [ ] Test form inputs (no zoom)
- [ ] **Test in Phantom wallet browser**
- [ ] **Test in Solflare wallet browser**
- [ ] Test wallet connections in mobile browsers
- [ ] Test transaction flows in wallet browsers
- [ ] Test metadata URL validation
- [ ] Test error handling and user feedback
- [ ] Verify button sizes are touch-friendly (40px+ height)
- [ ] Test clipboard functionality for metadata URLs

### 8. Production Deployment Steps
```bash
# 1. Build the app
npm run build

# 2. Upload to VPS
scp -r build/* user@your-vps:/var/www/tokenmint/

# 3. Set proper permissions
sudo chown -R www-data:www-data /var/www/tokenmint/
sudo chmod -R 755 /var/www/tokenmint/

# 4. Restart Nginx
sudo systemctl restart nginx

# 5. Test SSL
curl -I https://your-domain.com
```

### 9. Monitoring & Maintenance
- Set up SSL certificate auto-renewal
- Monitor server resources
- Regular security updates
- Backup configuration files

### 10. Troubleshooting Common Issues
- **Wallet not connecting**: Check HTTPS and domain whitelist
- **RPC errors**: Verify QuickNode endpoint is active
- **Mobile layout issues**: Test with browser dev tools mobile view
- **Transaction failures**: Check Solana network status
- **Phantom browser issues**: Ensure -webkit-appearance: none on inputs
- **Solflare browser issues**: Check touch-action: manipulation on buttons
- **Font too small on mobile**: Minimum 16px on inputs to prevent zoom
- **Buttons too small**: Minimum 40px height for touch targets
- **Text selection issues**: Add user-select: none to buttons