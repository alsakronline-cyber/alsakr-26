import os
import pandas as pd
import asyncio
from playwright.async_api import async_playwright
import requests
import json
import logging
import random
import sys

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SickScraper:
    def __init__(self, input_csv, output_folder='scraped_data', proxies=None):
        self.input_csv = input_csv
        self.output_folder = output_folder
        self.images_folder = os.path.join(output_folder, 'images')
        self.pdfs_folder = os.path.join(output_folder, 'pdfs')
        self.results_file = os.path.join(output_folder, 'products.csv')
        self.json_results_file = os.path.join(output_folder, 'products.json')
        self.data = []
        
        # Proxy configuration (list of proxy URLs)
        # Format: ["http://user:pass@host:port", "http://host:port"]
        self.proxies = proxies or []
        self.proxy_index = 0
        
        # User-agent rotation to appear more natural
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]

        # Ensure directories exist
        os.makedirs(self.images_folder, exist_ok=True)
        os.makedirs(self.pdfs_folder, exist_ok=True)
    
    def get_next_proxy(self):
        """Rotate through proxies if available"""
        if not self.proxies:
            return None
        proxy = self.proxies[self.proxy_index]
        self.proxy_index = (self.proxy_index + 1) % len(self.proxies)
        return proxy
    
    def get_random_user_agent(self):
        """Get a random user agent"""
        return random.choice(self.user_agents)

    def load_part_numbers(self):
        try:
            df = pd.read_csv(self.input_csv)
            # Assuming the column name is 'part_number' or it's the first column
            if 'part_number' in df.columns:
                return df['part_number'].dropna().tolist()
            else:
                return df.iloc[:, 0].dropna().tolist()
        except Exception as e:
            logger.error(f"Error loading CSV: {e}")
            return []

    async def scrape_product(self, page, part_number):
        logger.info(f"Scraping part number: {part_number}")
        try:
            # Direct search URL navigation with retry logic
            search_url = f"https://www.sick.com/sk/en/search?text={part_number}"
            
            # Retry navigation up to 3 times if it fails
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    await page.goto(search_url, timeout=60000)  # 60 second timeout
                    break
                except Exception as nav_error:
                    if attempt < max_retries - 1:
                        logger.warning(f"Navigation attempt {attempt + 1} failed for {part_number}, retrying...")
                        await asyncio.sleep(2)
                    else:
                        logger.error(f"Failed to navigate to {part_number} after {max_retries} attempts")
                        return None
            
            # Close cookie banner if it exists
            try:
                cookie_selectors = [
                    "#onetrust-accept-btn-handler",
                    "button:has-text('Accept all cookies')",
                    "button:has-text('Accept All')"
                ]
                for selector in cookie_selectors:
                    btn = page.locator(selector).first
                    if await btn.is_visible(timeout=3000):
                        await btn.click()
                        await page.wait_for_timeout(1000)
                        break
            except:
                pass

            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(2000)

            # Check if we are on a product page or results page
            if "/p/" not in page.url:
                logger.info(f"Not on product page for {part_number}, searching results.")
                
                # Check for product links in results
                result_link = page.locator("a.name").first
                if await result_link.count() == 0:
                    result_link = page.locator("a[href*='/p/']").first
                
                if await result_link.count() > 0:
                    href = await result_link.get_attribute("href")
                    if href:
                        full_url = href if href.startswith('http') else f"https://www.sick.com{href}"
                        await page.goto(full_url)
                else:
                    # Check Archive tab
                    archive_tab = page.locator("div.tabs-header:has-text('Archive'), a:has-text('Archive')").first
                    if await archive_tab.count() > 0:
                        logger.info(f"Checking Archive tab for {part_number}")
                        await archive_tab.click()
                        await page.wait_for_timeout(2000)
                        result_link = page.locator("a.name, a[href*='/p/']").first
                        if await result_link.count() > 0:
                            href = await result_link.get_attribute("href")
                            if href:
                                full_url = href if href.startswith('http') else f"https://www.sick.com{href}"
                                await page.goto(full_url)
                        else:
                            logger.error(f"No results found for {part_number} even in Archive.")
                            return None
                    else:
                        logger.error(f"No results found for {part_number}")
                        return None
                
                await page.wait_for_load_state("networkidle")

            # Extract Category from Breadcrumbs
            category = "N/A"
            try:
                # Look for breadcrumb items
                breadcrumbs = page.locator("syn-breadcrumb-item, .breadcrumb-item")
                bc_count = await breadcrumbs.count()
                if bc_count > 0:
                    bc_texts = []
                    for i in range(bc_count):
                        # Get inner text of breadcrumb items
                        text = (await breadcrumbs.nth(i).inner_text()).strip()
                        # Filter out "Home" and "Products" as they are generic
                        if text and text not in ["Home", "Products"]:
                             bc_texts.append(text)
                    if bc_texts:
                        category = " > ".join(bc_texts)
                
                # Fallback to old method if breadcrumbs fail or are empty
                if category == "N/A":
                     category = await page.locator("span.category").first.inner_text() if await page.locator("span.category").count() > 0 else "N/A"
            except Exception as e:
                logger.warning(f"Error extracting category: {e}")

            # Extract basic data
            product_data = {
                'part_number': part_number,
                'url': page.url,
                'name': await page.locator("h1.headline").first.inner_text() if await page.locator("h1.headline").count() > 0 else "N/A",
                'description': await page.locator("span.category").first.inner_text() if await page.locator("span.category").count() > 0 else "N/A",
                'category': category,
                'actual_part_no': (await page.locator("ui-product-part-number, .part-no").first.inner_text()).strip() if await page.locator("ui-product-part-number, .part-no").count() > 0 else "N/A"
            }

            # Price Teaser
            price_teaser = "N/A"
            try:
                teaser_el = page.locator("td:has-text('Log in to get your price')").first
                if await teaser_el.count() == 0:
                    teaser_el = page.locator(":text('Log in to get your price')").first
                if await teaser_el.count() > 0:
                    price_teaser = (await teaser_el.inner_text()).strip()
            except:
                pass
            product_data['price_teaser'] = price_teaser

            # Phased Out / Successor Product Detection
            phased_out = "No"
            successor_product = "N/A"
            try:
                # Look for alert messages that may contain phased out information
                alerts = page.locator("syn-alert[variant='primary'], syn-alert[variant='warning'], div.alert, div[role='alert']")
                alert_count = await alerts.count()
                
                for i in range(alert_count):
                    alert = alerts.nth(i)
                    alert_text = (await alert.inner_text()).strip() if await alert.count() > 0 else ""
                    
                    # Check for phased out keywords
                    if any(keyword in alert_text.lower() for keyword in ['phased out', 'discontinued', 'no longer available', 'replaced by', 'successor']):
                        phased_out = "Yes"
                        logger.info(f"Product {part_number} is phased out: {alert_text[:100]}")
                        
                        # Try to extract successor product information
                        # Look for links within the alert
                        successor_link = alert.locator("a[href*='/p/']").first
                        if await successor_link.count() > 0:
                            successor_name = await successor_link.inner_text()
                            successor_href = await successor_link.get_attribute("href")
                            
                            # Also try to find part number near the link
                            successor_part = "N/A"
                            part_el = alert.locator("ui-product-part-number, .part-no, span:has-text('Part')").first
                            if await part_el.count() > 0:
                                successor_part = (await part_el.inner_text()).strip()
                            
                            successor_url = successor_href if successor_href.startswith('http') else f"https://www.sick.com{successor_href}"
                            successor_product = f"{successor_name} (Part: {successor_part}) | URL: {successor_url}"
                            logger.info(f"Found successor: {successor_product}")
                        break
            except Exception as e:
                logger.warning(f"Error detecting phased out status for {part_number}: {e}")
            
            product_data['phased_out'] = phased_out
            product_data['successor_product'] = successor_product

            # Certificates (Extract from alt/title of images in the certificates area)
            certificates = []
            try:
                cert_images = page.locator("img[alt], img[title]")
                cert_count = await cert_images.count()
                for i in range(cert_count):
                    img = cert_images.nth(i)
                    alt = await img.get_attribute("alt") or ""
                    title = await img.get_attribute("title") or ""
                    # Filter for known certificates or icons
                    for cert_name in ['CE', 'ECOLAB', 'IO-Link', 'cULus', 'RCM', 'UKCA', 'RoHS']:
                        if cert_name.lower() in alt.lower() or cert_name.lower() in title.lower():
                            if cert_name not in certificates:
                                certificates.append(cert_name)
            except:
                pass
            product_data['certificates'] = "|".join(certificates)

            # Extract Suitable Accessories from slider/carousel (on main page)
            suitable_accessories = []
            try:
                # Wait for accessories slider to load
                await page.wait_for_timeout(1000)
                
                # Look for accessories in swiper slides
                accessory_slides = page.locator("div.swiper-slide ui-product-teaser-tile")
                slide_count = await accessory_slides.count()
                
                for i in range(slide_count):
                    slide = accessory_slides.nth(i)
                    
                    # Extract product name from h4
                    name_el = slide.locator("h4.format-xs").first
                    # Extract part number from span.text-semibold
                    part_no_el = slide.locator("span.text-semibold").first
                    
                    name = (await name_el.inner_text()).strip() if await name_el.count() > 0 else ""
                    part_no = (await part_no_el.inner_text()).strip() if await part_no_el.count() > 0 else ""
                    
                    if name and part_no:
                        suitable_accessories.append(f"{name} ({part_no})")
                        
            except Exception as e:
                logger.warning(f"Error extracting accessories for {part_number}: {e}")

            # Technical details (Hierarchical and Tab-based)
            all_specs = {}
            try:
                # Identify all tabs
                tabs = page.locator("li[role='tab']")
                tab_count = await tabs.count()
                
                if tab_count > 0:
                    for i in range(tab_count):
                        tab = tabs.nth(i)
                        tab_name = (await tab.inner_text()).strip()
                        
                        if tab_name in ["Accessories", "Downloads", "Applications", "Service"]:
                            continue
                        
                        logger.info(f"Extracting tab: {tab_name}")
                        await tab.click()
                        await page.wait_for_timeout(1500)

                        # Optimized extraction using page.evaluate to get all rows at once
                        tab_specs = {}
                        try:
                            extracted_rows = await page.evaluate("""
                                () => {
                                    const rows = Array.from(document.querySelectorAll('.grid-row, tr.attribute-row, tr'));
                                    return rows.map(row => {
                                        const isHeader = row.classList.contains('group-header') || row.tagName === 'TH';
                                        const cells = Array.from(row.querySelectorAll('td, .grid-cell')).map(c => c.innerText.trim());
                                        return { isHeader, text: row.innerText.trim(), cells };
                                    });
                                }
                            """)
                            
                            current_group = "General"
                            for item in extracted_rows:
                                if item['isHeader']:
                                    current_group = item['text']
                                    continue
                                
                                if len(item['cells']) >= 2:
                                    key = item['cells'][0]
                                    val = item['cells'][1]
                                    if key and key != "Part no.:":
                                        full_key = f"{tab_name} > {current_group} > {key}" if current_group != "General" else f"{tab_name} > {key}"
                                        tab_specs[full_key] = val
                        except Exception as eval_err:
                            logger.warning(f"Failed optimized extraction for {tab_name}: {eval_err}")
                            # Fallback if evaluate fails
                            rows = page.locator(".grid-row, tr.attribute-row, tr")
                            row_count = await rows.count()
                            current_group = "General"
                            
                            for j in range(row_count):
                                row = rows.nth(j)
                                if await row.evaluate("el => el.classList.contains('group-header') || el.tagName === 'TH'"):
                                    current_group = (await row.inner_text(timeout=5000)).strip()
                                    continue
                                
                                cells = row.locator("td, .grid-cell")
                                if await cells.count() >= 2:
                                    key = (await cells.nth(0).inner_text(timeout=5000)).strip()
                                    val = (await cells.nth(1).inner_text(timeout=5000)).strip()
                                    if key and key != "Part no.:":
                                        full_key = f"{tab_name} > {current_group} > {key}" if current_group != "General" else f"{tab_name} > {key}"
                                        tab_specs[full_key] = val
                        
                        all_specs.update(tab_specs)
                else:
                    # Fallback
                    rows = page.locator("tr")
                    row_count = await rows.count()
                    for j in range(row_count):
                        cells = rows.nth(j).locator("td, th")
                        if await cells.count() >= 2:
                            key = (await cells.nth(0).inner_text()).strip()
                            val = (await cells.nth(1).inner_text()).strip()
                            if key and "Part no" not in key:
                                all_specs[key] = val
            except Exception as e:
                logger.warning(f"Error extracting specs/accessories for {part_number}: {e}")
            
            product_data['specifications'] = json.dumps(all_specs)
            product_data['suitable_accessories'] = "|".join(suitable_accessories)

            # --- Image and Technical Drawing Extraction ---
            img_urls = []
            local_paths = []
            tech_drawing_urls = []
            local_tech_drawing_paths = []
            
            image_counter = 0

            # 1. Product Gallery Images
            gallery_locators = "ui-product-image-gallery img, syn-product-image-gallery img, .product-image-gallery img, .product-image img, div.gallery img, div.main-product-image img, div.product-detail-image img"
            img_elements = page.locator(gallery_locators)
            
            async def process_images(elements, target_url_list, target_path_list, start_idx):
                count = await elements.count()
                current_idx = start_idx
                for i in range(count):
                    img = elements.nth(i)
                    src = await img.get_attribute("src")
                    if not src:
                        src = await img.get_attribute("data-src")
                    
                    if src:
                        if src.startswith('//'):
                            full_src = f"https:{src}"
                        elif not src.startswith('http'):
                            full_src = f"https://www.sick.com{src}"
                        else:
                            full_src = src
                            
                        if full_src not in img_urls and full_src not in tech_drawing_urls:
                            target_url_list.append(full_src)
                            # Download image with unified naming: partnumber_N.ext
                            file_ext = full_src.split('.')[-1].split('?')[0] if '.' in full_src else 'png'
                            if len(file_ext) > 4: file_ext = 'png'
                            filename = f"{part_number}_{current_idx}.{file_ext}"
                            if self.download_file(full_src, self.images_folder, filename):
                                target_path_list.append(os.path.join(self.images_folder, filename))
                            current_idx += 1
                return current_idx

            # Process Gallery Images
            image_counter = await process_images(img_elements, img_urls, local_paths, image_counter)

            # 2. Technical Drawings
            try:
                # Check if technical drawings accordion exists and try to ensure it's loaded
                tech_accordion = page.locator("#technical-drawings, ui-accordion:has-text('Technical drawings')").first
                if await tech_accordion.count() > 0:
                    # If it's not open, try clicking it (though usually the images are in DOM)
                    is_open = await tech_accordion.get_attribute("class")
                    if is_open and "is-open" not in is_open:
                        await tech_accordion.click()
                        await page.wait_for_timeout(1000)
                    
                    tech_img_elements = tech_accordion.locator("ui-technical-drawings img, .technical-drawings img")
                    image_counter = await process_images(tech_img_elements, tech_drawing_urls, local_tech_drawing_paths, image_counter)
            except Exception as e:
                logger.warning(f"Error extracting technical drawings for {part_number}: {e}")

            product_data['image_urls'] = "|".join(img_urls)
            product_data['local_image_paths'] = "|".join(local_paths)
            product_data['technical_drawing_urls'] = "|".join(tech_drawing_urls)
            product_data['local_technical_drawing_paths'] = "|".join(local_tech_drawing_paths)

            # PDF Datasheet
            pdf_url = "N/A"
            try:
                pdf_btn = page.locator("button.action-button:has-text('English'), a.action-button:has-text('English')").first
                if await pdf_btn.count() > 0:
                    async with page.expect_download(timeout=10000) as download_info:
                        await pdf_btn.click()
                    download = await download_info.value
                    pdf_path = os.path.join(self.pdfs_folder, f"{part_number}.pdf")
                    await download.save_as(pdf_path)
                    pdf_url = download.url
                    logger.info(f"Downloaded PDF for {part_number}")
                else:
                    pdf_link = page.locator("a[href*='.pdf']").first
                    if await pdf_link.count() > 0:
                        pdf_url = await pdf_link.get_attribute("href")
                        full_pdf_url = pdf_url if pdf_url.startswith('http') else f"https://www.sick.com{pdf_url}"
                        self.download_file(full_pdf_url, self.pdfs_folder, f"{part_number}.pdf")
                        pdf_url = full_pdf_url
            except:
                pass

            product_data['pdf_url'] = pdf_url
            return product_data

        except Exception as e:
            logger.error(f"Error scraping {part_number}: {e}")
            return None

    def download_file(self, url, folder, filename):
        headers = {
            'User-Agent': self.get_random_user_agent()
        }
        try:
            response = requests.get(url, headers=headers, stream=True, timeout=10)
            if response.status_code == 200:
                with open(os.path.join(folder, filename), 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                return True
            else:
                logger.warning(f"Failed to download {url}: Status {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Download error for {url}: {e}")
            return False

    async def run(self):
        part_numbers = self.load_part_numbers()
        if not part_numbers:
            logger.error("No part numbers found in CSV.")
            return

        async with async_playwright() as p:
            # Configure proxy if available
            proxy = self.get_next_proxy()
            proxy_config = {"server": proxy} if proxy else None
            
            if proxy:
                logger.info(f"Using proxy: {proxy}")
            
            # Launch browser with proxy configuration
            browser = await p.chromium.launch(
                headless=True,
                proxy=proxy_config
            )
            
            # Create context with random user agent
            user_agent = self.get_random_user_agent()
            context = await browser.new_context(
                user_agent=user_agent,
                viewport={'width': 1920, 'height': 1080},
                locale='en-US',
                timezone_id='America/New_York'
            )
            
            # Set extra headers to appear more natural
            await context.set_extra_http_headers({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            })
            
            page = await context.new_page()
            logger.info(f"Browser started with User-Agent: {user_agent[:50]}...")

            for idx, pn in enumerate(part_numbers):
                try:
                    # Restart browser every 20 products to prevent memory issues and timeouts
                    if idx > 0 and idx % 20 == 0:
                        logger.info(f"Restarting browser after {idx} products to prevent memory issues...")
                        try:
                            await browser.close()
                        except:
                            pass
                        
                        # Relaunch browser
                        proxy = self.get_next_proxy() if self.proxies else None
                        proxy_config = {"server": proxy} if proxy else None
                        
                        browser = await p.chromium.launch(
                            headless=True,
                            proxy=proxy_config
                        )
                        
                        user_agent = self.get_random_user_agent()
                        context = await browser.new_context(
                            user_agent=user_agent,
                            viewport={'width': 1920, 'height': 1080},
                            locale='en-US',
                            timezone_id='America/New_York'
                        )
                        
                        await context.set_extra_http_headers({
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1'
                        })
                        
                        page = await context.new_page()
                        logger.info(f"Browser restarted successfully")
                    
                    result = await self.scrape_product(page, pn)
                    if result:
                        self.data.append(result)
                        
                        # Save/update CSV and JSON after each successful scrape
                        df_results = pd.DataFrame(self.data)
                        
                        # Data Cleaning: Drop Unnamed columns that might appear if data list is inconsistent
                        unnamed_cols = [col for col in df_results.columns if col.startswith('Unnamed')]
                        if unnamed_cols:
                            df_results = df_results.drop(columns=unnamed_cols)
                        
                        df_results.to_csv(self.results_file, index=False)
                        
                        # JSON Optimization: Convert nested JSON strings back to objects for the JSON file
                        records = df_results.to_dict(orient='records')
                        for record in records:
                            for key, value in record.items():
                                if isinstance(value, str) and value.startswith('{') and value.endswith('}'):
                                    try:
                                        record[key] = json.loads(value)
                                    except:
                                        pass
                                if pd.isna(value):
                                    record[key] = None
                        
                        with open(self.json_results_file, 'w', encoding='utf-8') as f:
                            json.dump(records, f, indent=2, ensure_ascii=False)
                        
                        logger.info(f"✓ Saved {pn} to CSV & JSON. Total: {len(self.data)}/{len(part_numbers)} products")
                    else:
                        logger.warning(f"Failed to scrape {pn}, skipping...")
                    
                    # Randomized delay between 3-7 seconds to appear more human
                    delay = random.uniform(3, 7)
                    logger.info(f"Waiting {delay:.1f}s before next request...")
                    await asyncio.sleep(delay)
                    
                    # Rotate proxy every 5 products if proxies are available (and not already restarted)
                    if self.proxies and (idx + 1) % 5 == 0 and (idx + 1) % 20 != 0:
                        logger.info("Rotating proxy...")
                        try:
                            await browser.close()
                        except:
                            pass
                        
                        proxy = self.get_next_proxy()
                        proxy_config = {"server": proxy} if proxy else None
                        logger.info(f"New proxy: {proxy}")
                        
                        browser = await p.chromium.launch(
                            headless=True,
                            proxy=proxy_config
                        )
                        
                        user_agent = self.get_random_user_agent()
                        context = await browser.new_context(
                            user_agent=user_agent,
                            viewport={'width': 1920, 'height': 1080},
                            locale='en-US',
                            timezone_id='America/New_York'
                        )
                        
                        await context.set_extra_http_headers({
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1'
                        })
                        
                        page = await context.new_page()
                        logger.info(f"Browser restarted with new User-Agent: {user_agent[:50]}...")
                        
                except asyncio.CancelledError:
                    logger.warning("Scraping task was cancelled. Saving progress and exiting...")
                    break
                except KeyboardInterrupt:
                    logger.warning("Scraping interrupted by user. Saving progress...")
                    break
                except BaseException as e:
                    logger.error(f"Critical error processing {pn}: {e}")
                    logger.error(f"Error type: {e.__class__.__name__}")
                    # Try to recover by creating a new page
                    try:
                        if not browser.is_connected():
                            logger.info("Browser disconnected, attempting to relaunch...")
                            # Relaunch logic could go here, but for now we rely on the next iteration's browser check
                            break 
                        page = await context.new_page()
                        logger.info("Created new page after error")
                    except:
                        logger.error("Failed to recover page/context, will try browser restart on next iteration")
                    continue

            try:
                if browser.is_connected():
                    await browser.close()
            except:
                pass

        # Final summary
        if self.data:
            logger.info(f"✓ Scraping complete! Successfully scraped {len(self.data)} products.")
            logger.info(f"  CSV: {self.results_file}")
            logger.info(f"  JSON: {self.json_results_file}")
        else:
            logger.warning("No data scraped.")

if __name__ == "__main__":
    test_csv = 'part_numbers.csv'
    # Initialize scraper
    input_file = sys.argv[1] if len(sys.argv) > 1 else test_csv
    scraper = SickScraper(input_file)
    asyncio.run(scraper.run())
