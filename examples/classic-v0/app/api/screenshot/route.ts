import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'
import { chromium } from 'playwright'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const chatId = searchParams.get('chatId')

    if (!url && !chatId) {
      return NextResponse.json(
        { error: 'Either URL or chatId parameter is required' },
        { status: 400 },
      )
    }

    let actualDemoUrl = url

    // If chatId is provided, get the actual demo URL from v0
    if (chatId) {
      try {
        const chat = await v0.chats.getById({ chatId })
        actualDemoUrl = chat.demo || null
      } catch (error) {
        // Fall back to using the provided URL
      }
    }

    if (!actualDemoUrl) {
      return NextResponse.json(
        { error: 'No demo URL available' },
        { status: 400 },
      )
    }

    // Temporarily disable Playwright to test fallback
    if (
      (actualDemoUrl!.includes('v0.dev') ||
        actualDemoUrl!.includes('vusercontent.net')) &&
      !actualDemoUrl!.includes('placeholder')
    ) {
      // Take real screenshots using Playwright
      try {
        // Launch browser with faster settings
        const browser = await chromium.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ],
        })

        const context = await browser.newContext({
          viewport: { width: 1200, height: 800 }, // Smaller viewport for better performance
          deviceScaleFactor: 1,
          ignoreHTTPSErrors: true,
        })

        const page = await context.newPage()

        // Set timeout
        page.setDefaultTimeout(8000)

        // Navigate to the URL

        const response = await page.goto(actualDemoUrl!, {
          waitUntil: 'networkidle',
          timeout: 10000,
        })

        if (!response || response!.status() >= 400) {
          throw new Error(`Failed to load page: ${response?.status()}`)
        }

        // Wait for React/content to render and animations to complete
        try {
          // Wait for any React root or common content indicators
          await page.waitForSelector('body', { timeout: 3000 })
          await page.waitForTimeout(3000) // Increased wait time for content
        } catch (e) {}

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false,
          // Remove clipping to see if that's causing the white image
        })

        // Clean up
        await context.close()
        await browser.close()

        // If screenshot is too small (likely blank/white), fall back to enhanced mockup
        if (screenshot.length < 1000) {
          throw new Error('Screenshot appears to be blank')
        }

        return new NextResponse(screenshot, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        })
      } catch (error) {
        console.error('Error taking Playwright screenshot:', error)
        // Fall back to enhanced mockup
      }

      // Enhanced fallback for real v0 URLs if Playwright fails
      try {
        // Use different layouts and colors based on chat ID and URL
        let generationLabel = 'Preview'
        let colorIndex = 0
        let layoutType = 0

        if (chatId) {
          // Use chatId to determine visual characteristics
          const chatHash = chatId!
            .split('')
            .reduce((a, b) => a + b.charCodeAt(0), 0)
          colorIndex = chatHash % 6
          layoutType = chatHash % 4

          // Try to determine generation from position in alphabet
          generationLabel = String.fromCharCode(65 + (colorIndex % 3)) // A, B, or C
        }

        // Different color themes for variety
        const themes = [
          { primary: '4f46e5', secondary: 'e0e7ff', bg: 'f8fafc' }, // Indigo
          { primary: '059669', secondary: 'd1fae5', bg: 'f0fdf4' }, // Emerald
          { primary: 'dc2626', secondary: 'fecaca', bg: 'fef2f2' }, // Red
          { primary: 'ea580c', secondary: 'fed7aa', bg: 'fff7ed' }, // Orange
          { primary: '7c2d12', secondary: 'fecaca', bg: 'fef2f2' }, // Brown
          { primary: '1d4ed8', secondary: 'dbeafe', bg: 'eff6ff' }, // Blue
        ]

        const theme = themes[colorIndex]

        // Different layout patterns
        const layouts = [
          // Header + Two columns
          () => `
            <rect x="20" y="20" width="360" height="50" fill="#${theme.primary}" rx="8"/>
            <rect x="30" y="35" width="100" height="20" fill="white" opacity="0.9" rx="4"/>
            
            <rect x="20" y="90" width="170" height="120" fill="white" rx="8"/>
            <rect x="30" y="100" width="150" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="30" y="120" width="100" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            <rect x="30" y="135" width="120" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            
            <rect x="210" y="90" width="170" height="120" fill="white" rx="8"/>
            <rect x="220" y="100" width="150" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="220" y="120" width="80" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            
            <rect x="20" y="230" width="360" height="50" fill="white" rx="8"/>
            <rect x="30" y="245" width="60" height="20" fill="#${theme.primary}" rx="10"/>
          `,
          // Card layout
          () => `
            <rect x="20" y="20" width="360" height="40" fill="#${theme.primary}" rx="8"/>
            <rect x="30" y="32" width="80" height="16" fill="white" opacity="0.9" rx="4"/>
            
            <rect x="50" y="80" width="120" height="80" fill="white" rx="12"/>
            <rect x="60" y="90" width="100" height="6" fill="#${theme.secondary}" rx="3"/>
            <rect x="60" y="105" width="60" height="4" fill="#${theme.secondary}" opacity="0.7" rx="2"/>
            <circle cx="110" cy="135" r="15" fill="#${theme.primary}" opacity="0.3"/>
            
            <rect x="230" y="80" width="120" height="80" fill="white" rx="12"/>
            <rect x="240" y="90" width="100" height="6" fill="#${theme.secondary}" rx="3"/>
            <rect x="240" y="105" width="80" height="4" fill="#${theme.secondary}" opacity="0.7" rx="2"/>
            <circle cx="290" cy="135" r="15" fill="#${theme.primary}" opacity="0.3"/>
            
            <rect x="20" y="180" width="360" height="100" fill="white" rx="12"/>
            <rect x="40" y="200" width="320" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="40" y="220" width="200" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            <rect x="40" y="235" width="280" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
          `,
          // Dashboard layout
          () => `
            <rect x="20" y="20" width="360" height="35" fill="#${theme.primary}" rx="6"/>
            <circle cx="45" cy="37" r="8" fill="white" opacity="0.9"/>
            <rect x="65" y="32" width="60" height="10" fill="white" opacity="0.9" rx="5"/>
            
            <rect x="20" y="70" width="110" height="70" fill="white" rx="8"/>
            <rect x="30" y="85" width="20" height="20" fill="#${theme.primary}" opacity="0.3" rx="4"/>
            <rect x="60" y="80" width="60" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="60" y="95" width="40" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            
            <rect x="145" y="70" width="110" height="70" fill="white" rx="8"/>
            <rect x="155" y="85" width="20" height="20" fill="#${theme.primary}" opacity="0.5" rx="4"/>
            <rect x="185" y="80" width="60" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="185" y="95" width="50" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            
            <rect x="270" y="70" width="110" height="70" fill="white" rx="8"/>
            <rect x="280" y="85" width="20" height="20" fill="#${theme.primary}" opacity="0.7" rx="4"/>
            <rect x="310" y="80" width="60" height="8" fill="#${theme.secondary}" rx="4"/>
            <rect x="310" y="95" width="35" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            
            <rect x="20" y="160" width="360" height="120" fill="white" rx="8"/>
            <rect x="40" y="180" width="100" height="80" fill="#${theme.secondary}" opacity="0.3" rx="6"/>
            <rect x="160" y="180" width="200" height="12" fill="#${theme.secondary}" rx="6"/>
            <rect x="160" y="200" width="150" height="8" fill="#${theme.secondary}" opacity="0.7" rx="4"/>
            <rect x="160" y="220" width="180" height="8" fill="#${theme.secondary}" opacity="0.7" rx="4"/>
            <rect x="160" y="240" width="120" height="8" fill="#${theme.secondary}" opacity="0.7" rx="4"/>
          `,
          // Form layout
          () => `
            <rect x="20" y="20" width="360" height="45" fill="#${theme.primary}" rx="8"/>
            <rect x="170" y="35" width="60" height="15" fill="white" opacity="0.9" rx="8"/>
            
            <rect x="80" y="90" width="240" height="140" fill="white" rx="12"/>
            <rect x="100" y="110" width="200" height="8" fill="#${theme.secondary}" rx="4"/>
            
            <rect x="100" y="135" width="60" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            <rect x="100" y="150" width="180" height="20" fill="#${theme.secondary}" opacity="0.3" rx="4"/>
            
            <rect x="100" y="180" width="60" height="6" fill="#${theme.secondary}" opacity="0.7" rx="3"/>
            <rect x="100" y="195" width="180" height="20" fill="#${theme.secondary}" opacity="0.3" rx="4"/>
            
            <rect x="180" y="240" width="80" height="25" fill="#${theme.primary}" rx="12"/>
            <rect x="200" y="250" width="40" height="5" fill="white" rx="2"/>
          `,
        ]

        const selectedLayout = layouts[layoutType]

        // Create a realistic UI mockup
        const svg = `
          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.1"/>
              </filter>
            </defs>
            
            <!-- Background -->
            <rect width="400" height="300" fill="#${theme.bg}"/>
            
            <!-- UI Elements -->
            ${selectedLayout()}
            
            <!-- Generation Label -->
            <rect x="320" y="20" width="60" height="25" fill="white" opacity="0.95" rx="12" filter="url(#shadow)"/>
            <text x="350" y="35" text-anchor="middle" dominant-baseline="middle" 
                  font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" 
                  fill="#${theme.primary}">${generationLabel}</text>
          </svg>
        `

        return new NextResponse(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
          },
        })
      } catch (error) {
        console.error('Error generating demo mockup:', error)
      }
    }

    // Fallback for placeholder URLs or errors
    const colors = ['e5e7eb', 'ddd6fe', 'fde68a', 'fca5a5', 'a7f3d0']
    const textColors = ['6b7280', '7c3aed', 'f59e0b', 'ef4444', '059669']
    const urlHash = actualDemoUrl.split('/').pop() || 'default'
    const index = urlHash.length % colors.length

    // Determine the generation label
    let generationLabel = 'Preview'
    if (
      actualDemoUrl.includes('placeholder-a') ||
      actualDemoUrl.includes('temp-a')
    ) {
      generationLabel = 'A'
    } else if (
      actualDemoUrl.includes('placeholder-b') ||
      actualDemoUrl.includes('temp-b')
    ) {
      generationLabel = 'B'
    } else if (
      actualDemoUrl.includes('placeholder-c') ||
      actualDemoUrl.includes('temp-c')
    ) {
      generationLabel = 'C'
    }

    // Generate a simple fallback SVG
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#${colors[index]}"/>
                    <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
                  fill="#${textColors[index]}">Generation ${generationLabel}</text>
            <text x="200" y="180" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="12" 
                  fill="#${textColors[index]}">Fallback Preview</text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Screenshot API Error:', error)

    // Return a simple SVG fallback
    const fallbackSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              fill="#9ca3af">Preview</text>
      </svg>
    `

    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
