"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// naukri-schema-compatible-scraper.ts
const express_1 = __importDefault(require("express"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Common tech skills to look for
const commonSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Ruby",
    "PHP",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Django",
    "Spring",
    ".NET",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Git",
    "CI/CD",
    "Agile",
    "Scrum",
    "REST API",
    "GraphQL",
    "HTML",
    "CSS",
    "SASS",
    "LESS",
    "Bootstrap",
    "Tailwind",
    "Linux",
    "Windows",
    "Server",
    "Networking",
    "Support",
    "Infrastructure",
    "Troubleshooting",
    "Helpdesk",
    "Desktop",
    "Hardware",
    "Virtualization",
];
// Function to extract skills from text
function extractSkills(text) {
    const skills = [];
    commonSkills.forEach((skill) => {
        try {
            // Case insensitive search for whole words
            const regex = new RegExp(`\\b${skill.replace(/\+/g, "\\+")}\\b`, "i");
            if (regex.test(text) && !skills.includes(skill)) {
                skills.push(skill);
            }
        }
        catch (e) {
            console.error(`Error with regex for skill "${skill}":`, e);
        }
    });
    return skills;
}
// Helper function for delay
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Create debug directory if it doesn't exist
const debugDir = path_1.default.join(__dirname, "debug");
if (!fs_1.default.existsSync(debugDir)) {
    fs_1.default.mkdirSync(debugDir, { recursive: true });
}
// Function to scrape a Naukri job listing in format compatible with your schema
function scrapeNaukriJob(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Launch a browser instance with full interaction capabilities
        const browser = yield puppeteer_1.default.launch({
            headless: false, // Show browser for debugging and to bypass anti-bot measures
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080",
            ],
            defaultViewport: null,
        });
        try {
            console.log(`Starting to scrape Naukri job from URL: ${url}`);
            // Create a new page
            const page = yield browser.newPage();
            // Set a realistic user agent
            yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            // Navigate to the job listing with a timeout
            console.log("Navigating to URL...");
            yield page.goto(url, {
                waitUntil: "networkidle2",
                timeout: 60000,
            });
            // Wait longer for the page to stabilize
            console.log("Waiting for page to load...");
            yield delay(5000);
            // Scroll down to ensure all content is loaded
            console.log("Scrolling to reveal all content...");
            yield page.evaluate(() => {
                window.scrollTo(0, 500);
            });
            yield delay(1000);
            yield page.evaluate(() => {
                window.scrollTo(0, 1000);
            });
            yield delay(1000);
            yield page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            yield delay(2000);
            // Take screenshot
            const timestamp = Date.now();
            yield page.screenshot({
                path: path_1.default.join(debugDir, `naukri_job_${timestamp}.png`),
                fullPage: true,
            });
            // Save HTML content
            const htmlContent = yield page.content();
            fs_1.default.writeFileSync(path_1.default.join(debugDir, `naukri_job_${timestamp}.html`), htmlContent);
            // Extract all job details needed for the schema
            const jobData = yield page.evaluate(() => {
                var _a, _b, _c, _d, _e;
                // Function to try multiple selectors and return the first match
                const getTextFromSelectors = (selectors) => {
                    var _a;
                    for (const selector of selectors) {
                        try {
                            const elements = document.querySelectorAll(selector);
                            for (const el of Array.from(elements)) {
                                const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                                if (text)
                                    return text;
                            }
                        }
                        catch (e) {
                            // Ignore errors and try next selector
                        }
                    }
                    return "";
                };
                // 1. Extract job title
                const titleSelectors = [
                    "h1",
                    ".jd-header-title",
                    ".title",
                    '[class*="title" i]',
                    '[class*="job-title" i]',
                    '[class*="header" i] h1',
                    "header h1",
                    ".head h1",
                ];
                const title = getTextFromSelectors(titleSelectors) ||
                    document.title.replace("| Naukri.com", "").trim();
                // 2. Extract company name
                const companySelectors = [
                    ".company-name",
                    ".company",
                    ".companyInfo",
                    '[class*="company" i]',
                    ".jd-header-comp-name",
                    ".job-company",
                ];
                const company = getTextFromSelectors(companySelectors);
                // 3. Extract location
                const locationSelectors = [
                    ".location",
                    ".loc",
                    '[class*="location" i]',
                    '[class*="loc-" i]',
                    ".job-location",
                    ".location-name",
                ];
                const location = getTextFromSelectors(locationSelectors);
                // 4. Extract job description
                const descriptionSelectors = [
                    ".jd-desc",
                    ".job-desc",
                    "#job-description",
                    ".description",
                    '[class*="description" i]',
                    "#jobdescription",
                    ".jdTxt",
                ];
                let description = getTextFromSelectors(descriptionSelectors);
                // If description not found with selectors, try common headings
                if (!description || description.length < 100) {
                    const descriptionHeadings = [
                        "Job Description",
                        "Description",
                        "About the job",
                        "Role",
                        "Responsibilities",
                        "About The Job",
                    ];
                    for (const heading of descriptionHeadings) {
                        const elements = Array.from(document.querySelectorAll("h2, h3, h4, strong, b"));
                        for (const el of elements) {
                            if ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.includes(heading)) {
                                // Found a heading - check parent or next sibling for content
                                let descElement = el.nextElementSibling;
                                let combinedText = "";
                                // Try to get text from the next few siblings
                                let count = 0;
                                while (descElement && count < 5) {
                                    const text = ((_b = descElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                                    if (text.length > 50) {
                                        combinedText += text + " ";
                                    }
                                    descElement = descElement.nextElementSibling;
                                    count++;
                                }
                                if (combinedText.length > 100) {
                                    description = combinedText;
                                    break;
                                }
                                // Try parent's content if siblings didn't work
                                const parentText = ((_d = (_c = el.parentElement) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || "";
                                if (parentText.length > heading.length + 100) {
                                    description = parentText;
                                    break;
                                }
                            }
                        }
                        if (description && description.length > 100)
                            break;
                    }
                }
                // If still no description, find largest text block
                if (!description || description.length < 100) {
                    let largestText = "";
                    document.querySelectorAll("div, section, article, p").forEach((el) => {
                        var _a;
                        const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        if (text.length > largestText.length &&
                            !text.includes("Copyright") &&
                            !text.includes("Terms")) {
                            largestText = text;
                        }
                    });
                    description = largestText;
                }
                // 5. Extract skills directly from page
                const skillsSelectors = [
                    ".key-skill a, .key-skill span",
                    ".skills-section span",
                    ".chip-wrapper span",
                    ".job-skills li",
                    '[class*="skill" i] span',
                    '[class*="skill" i] li',
                ];
                let extractedSkills = [];
                for (const selector of skillsSelectors) {
                    try {
                        const elements = document.querySelectorAll(selector);
                        if (elements && elements.length > 0) {
                            elements.forEach((el) => {
                                var _a;
                                const skill = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                                if (skill &&
                                    skill.length < 50 &&
                                    !extractedSkills.includes(skill)) {
                                    extractedSkills.push(skill);
                                }
                            });
                            if (extractedSkills.length > 0)
                                break;
                        }
                    }
                    catch (e) {
                        // Ignore errors and try next selector
                    }
                }
                // 6. Extract experience
                const expSelectors = [
                    ".exp",
                    ".experience",
                    '[class*="experience" i]',
                    '[class*="exp-" i]',
                    '[title*="experience" i]',
                    ".salary-tenure-info span",
                ];
                let expText = "";
                for (const selector of expSelectors) {
                    try {
                        const elements = document.querySelectorAll(selector);
                        for (const el of Array.from(elements)) {
                            const text = ((_e = el.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || "";
                            if ((text.includes("yr") || text.includes("year")) &&
                                /\d/.test(text)) {
                                expText = text;
                                break;
                            }
                        }
                        if (expText)
                            break;
                    }
                    catch (e) {
                        // Ignore errors and try next selector
                    }
                }
                // 7. Extract job type
                const jobTypeSelectors = [
                    ".job-type",
                    ".employment-type",
                    '[class*="job-type" i]',
                    '[class*="employment" i]',
                ];
                const jobType = getTextFromSelectors(jobTypeSelectors);
                // 8. Extract salary
                const salarySelectors = [
                    ".salary",
                    ".ctc",
                    '[class*="salary" i]',
                    '[class*="ctc" i]',
                    ".package",
                ];
                const salary = getTextFromSelectors(salarySelectors);
                return {
                    title,
                    company,
                    location,
                    description,
                    directSkills: extractedSkills,
                    expText,
                    jobType,
                    salary,
                };
            });
            // Process experience text
            let experienceRequired = 0;
            // Try to get experience from URL first
            const urlExpMatch = url.match(/(\d+)-to-(\d+)-years/);
            if (urlExpMatch) {
                experienceRequired = parseInt(urlExpMatch[1], 10); // Using min experience
                console.log(`Experience extracted from URL: ${experienceRequired} years`);
            }
            // If not in URL, try from the page
            else if (jobData.expText) {
                // Parse experience from text
                const rangeMatch = jobData.expText.match(/(\d+)[\s-]+(\d+)\s*(?:years?|yrs)/i);
                if (rangeMatch) {
                    experienceRequired = parseInt(rangeMatch[1], 10); // Using min experience
                    console.log(`Experience from page: ${experienceRequired} years`);
                }
                else {
                    const singleMatch = jobData.expText.match(/(\d+)\s*(?:years?|yrs)/i);
                    if (singleMatch) {
                        experienceRequired = parseInt(singleMatch[1], 10);
                        console.log(`Single experience value from page: ${experienceRequired} years`);
                    }
                }
            }
            // Last resort: try to find experience in description
            else if (jobData.description) {
                const descRangeMatch = jobData.description.match(/(\d+)[\s-]+(\d+)\s*(?:years?|yrs)/i);
                if (descRangeMatch) {
                    experienceRequired = parseInt(descRangeMatch[1], 10); // Using min experience
                    console.log(`Experience from description: ${experienceRequired} years`);
                }
                else {
                    const descSingleMatch = jobData.description.match(/(\d+)\s*(?:years?|yrs)/i);
                    if (descSingleMatch) {
                        experienceRequired = parseInt(descSingleMatch[1], 10);
                        console.log(`Single experience value from description: ${experienceRequired} years`);
                    }
                }
            }
            // Skills processing
            let skillsRequired = [];
            // If direct skills were found on the page, use them
            if (jobData.directSkills && jobData.directSkills.length > 0) {
                skillsRequired = jobData.directSkills;
                console.log(`Using ${skillsRequired.length} directly extracted skills`);
            }
            else {
                // Otherwise extract skills from title and description
                skillsRequired = extractSkills(jobData.title + " " + jobData.description);
                console.log(`Extracted ${skillsRequired.length} skills from text content`);
            }
            // Construct the final job listing object matching your schema
            const jobListing = {
                url: url,
                title: jobData.title || "Unknown Job Title",
                company: jobData.company || "Unknown Company",
                location: jobData.location || null,
                description: jobData.description || "No description found",
                skillsRequired: skillsRequired,
                experienceRequired: experienceRequired,
                jobType: jobData.jobType || null,
                salary: jobData.salary || null,
            };
            return jobListing;
        }
        catch (error) {
            console.error("Error during Naukri job scraping:", error);
            throw error;
        }
        finally {
            // Always close the browser
            yield browser.close();
            console.log("Browser closed");
        }
    });
}
// API endpoint for scraping a Naukri job
app.post("/api/v1/scrape-job", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        console.log(`Received request to scrape job from URL: ${url}`);
        const jobListing = yield scrapeNaukriJob(url);
        return res.status(200).json(jobListing);
    }
    catch (error) {
        console.error("Error processing scrape request:", error);
        return res.status(500).json({
            error: "Failed to scrape job data",
            message: error.message,
            url: req.body.url,
        });
    }
}));
// Start server
app.listen(PORT, () => {
    console.log(`Naukri Schema-Compatible Scraper API running on port ${PORT}`);
    console.log(`Send POST request to /api/v1/scrape-job with {"url": "job-listing-url"}`);
});
