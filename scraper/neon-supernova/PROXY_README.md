# SICK Scraper - Anti-Blocking Configuration Guide

## Overview
The SICK scraper now includes comprehensive anti-blocking features to prevent IP bans while scraping.

## Features Implemented

### 1. **Proxy Support**
- Add multiple proxies for rotation
- Automatically rotates proxy every 5 products
- Supports HTTP/HTTPS proxies with authentication

### 2. **User-Agent Rotation**
- Randomizes user-agent for each browser session
- Includes 5 different realistic browser signatures
- Rotates with each proxy change

### 3. **Randomized Delays**
- Random delay between 3-7 seconds between requests
- Mimics human browsing patterns
- Prevents rate-limiting triggers

### 4. **Enhanced Browser Fingerprinting**
- Realistic viewport size (1920x1080)
- Proper timezone and locale settings
- Natural HTTP headers (Accept-Language, Connection, etc.)

## How to Use Proxies

### Option 1: Without Proxies (Default)
```python
scraper = SickScraper('part_numbers.csv')
asyncio.run(scraper.run())
```

### Option 2: With Proxies
```python
proxies = [
    "http://username:password@proxy1.example.com:8080",
    "http://username:password@proxy2.example.com:8080",
    "http://username:password@proxy3.example.com:8080"
]

scraper = SickScraper('part_numbers.csv', proxies=proxies)
asyncio.run(scraper.run())
```

## Recommended Proxy Services

### Premium (Recommended for Production)
1. **Bright Data** - https://brightdata.com
   - Residential proxies
   - High success rate
   - Format: `http://username:password@brd.superproxy.io:22225`

2. **SmartProxy** - https://smartproxy.com
   - Rotating residential proxies
   - Format: `http://username:password@gate.smartproxy.com:7000`

3. **Oxylabs** - https://oxylabs.io
   - Data center & residential
   - Format: `http://username:password@pr.oxylabs.io:7777`

### Free (Testing Only)
- https://free-proxy-list.net/
- https://www.proxy-list.download/
- Note: Free proxies are unreliable and slower

## Testing Your Proxies

Before scraping, test your proxies:

```python
import requests

def test_proxy(proxy_url):
    try:
        proxies = {"http": proxy_url, "https": proxy_url}
        response = requests.get("https://api.ipify.org", proxies=proxies, timeout=10)
        print(f"✓ Proxy works! IP: {response.text}")
        return True
    except Exception as e:
        print(f"✗ Proxy failed: {e}")
        return False

# Test your proxy
test_proxy("http://username:password@proxy.example.com:8080")
```

## Best Practices

1. **Use Multiple Proxies** (at least 3-5)
   - Better distribution of requests
   - Higher reliability
   - Faster scraping

2. **Monitor Proxy Health**
   - Test proxies before large scrapes
   - Replace non-working proxies
   - Keep backup proxies ready

3. **Adjust Delays if Needed**
   - Current: 3-7 seconds (safe)
   - Aggressive: 2-4 seconds (risky)
   - Conservative: 5-10 seconds (very safe)

4. **Residential > Data Center**
   - Residential proxies less likely to be blocked
   - More expensive but worth it for production

## Troubleshooting

### "Proxy connection failed"
- Verify proxy URL format
- Check credentials (username/password)
- Test proxy with test script above

### "403 Forbidden / 429 Too Many Requests"
- Increase delays between requests
- Add more proxies to rotation
- Switch to residential proxies

### Slow scraping
- Use more proxies
- Reduce timeout values
- Check proxy performance

## Configuration Examples

### Light Scraping (<100 products)
```python
# No proxies needed
scraper = SickScraper('part_numbers.csv')
```

### Medium Scraping (100-500 products)
```python
# 2-3 proxies recommended
proxies = ["http://proxy1:port", "http://proxy2:port"]
scraper = SickScraper('part_numbers.csv', proxies=proxies)
```

### Heavy Scraping (>500 products)
```python
# 5+ residential proxies strongly recommended
proxies = [
    "http://user:pass@proxy1:port",
    "http://user:pass@proxy2:port",
    "http://user:pass@proxy3:port",
    "http://user:pass@proxy4:port",
    "http://user:pass@proxy5:port"
]
scraper = SickScraper('part_numbers.csv', proxies=proxies)
```

## Notes
- Scraper rotates proxies automatically every 5 products
- User-agent changes with each proxy rotation
- All features work together for maximum stealth
- See `proxy_config_example.txt` for more details
