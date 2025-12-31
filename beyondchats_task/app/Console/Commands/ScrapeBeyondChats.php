<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Facebook\WebDriver\Chrome\ChromeOptions;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Laravel\Dusk\Chrome\ChromeProcess;
use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;

class ScrapeBeyondChats extends Command
{
    protected $signature = 'scrape:beyondchats';
    protected $description = 'Scrapes the 5 oldest articles from BeyondChats';

    public function handle()
    {
        $this->info("Connecting to Chrome Driver...");
        
        $options = (new ChromeOptions)->addArguments([
            '--disable-gpu', '--headless', '--window-size=1920,1080', '--no-sandbox'
        ]);

        try {
            $driver = RemoteWebDriver::create(
                'http://localhost:9515', 
                DesiredCapabilities::chrome()->setCapability(ChromeOptions::CAPABILITY, $options)
            );
        } catch (\Exception $e) {
            $this->error("Could not connect to Chrome Driver on port 9515.");
            return;
        }

        try {
            $baseUrl = 'https://beyondchats.com/blogs/';
            $this->info("Navigating to $baseUrl");
            $driver->get($baseUrl);

            // 1. Find Last Page Number
            $pages = $driver->findElements(WebDriverBy::cssSelector('.page-numbers'));
            $lastPageNum = 1;
            foreach ($pages as $page) {
                $text = $page->getText();
                if (is_numeric($text)) $lastPageNum = max($lastPageNum, (int)$text);
            }
            $this->info("Last page detected: $lastPageNum");

            $collectedLinks = [];
            $currentPage = $lastPageNum;

            // 2. Loop backwards until we have 5 articles
            while (count($collectedLinks) < 5 && $currentPage >= 1) {
                $this->info("Scraping Page $currentPage...");
                $driver->get($baseUrl . "page/" . $currentPage . "/");
                
                // Slight wait for elements
                $driver->wait(2)->until(
                    WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::tagName('article'))
                );

                // Find all article links on this page
                $elements = $driver->findElements(WebDriverBy::cssSelector('article h2 a, article h3 a, .post-card-content-link'));
                
                foreach ($elements as $element) {
                    $url = $element->getAttribute('href');
                    
                    // Filter out tags/categories
                    if (strpos($url, '/tag/') !== false || strpos($url, '/category/') !== false) {
                        continue;
                    }

                    // Add unique link
                    if (!in_array($url, $collectedLinks)) {
                        $collectedLinks[] = $url;
                    }
                }
                
                // Go to previous page for next loop
                $currentPage--;
            }

            // Limit to exactly 5
            $finalLinks = array_slice($collectedLinks, 0, 5);
            $this->info("Found " . count($finalLinks) . " total valid articles.");

            // 3. Visit and Save Content
            foreach ($finalLinks as $url) {
                $this->scrapeArticle($driver, $url);
            }

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        } finally {
            $driver->quit();
            $this->info("Scraping Complete.");
        }
    }  

    private function scrapeArticle($driver, $url)
    {
        // 1. Skip if already exists
        if (Article::where('url', $url)->exists()) return;

        try {
            $driver->get($url);
            // Wait 3 seconds for the page to fully render
            usleep(3000000); 

            // 2. Get Title
            $title = $driver->findElement(WebDriverBy::tagName('h1'))->getText();

            // 3. BRUTE FORCE: Execute JavaScript to get all visible text
            // This bypasses complex HTML structures
            $content = $driver->executeScript("return document.body.innerText;");

            // Clean up the text (limit length to avoid database errors)
            $content = substr(trim($content), 0, 5000);

            // 4. Validate
            if (strlen($content) < 100) {
                $content = "Error: Page loaded but content was empty. Possible bot protection.";
            } else {
                // Convert newlines to HTML breaks for display
                $content = nl2br(e($content));
            }

            Article::create([
                'title' => $title,
                'url' => $url,
                'original_content' => $content
            ]);
            
            $this->info("Saved: $title");

        } catch (\Exception $e) {
            $this->warn("Skipped: $url - " . $e->getMessage());
        }
    }
}