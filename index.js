const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

puppeteer.use(Stealth());

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Google Lens Automation API is running 🚀");
});

app.post("/search", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

  try {
    const tempImage = path.resolve("temp.jpg");
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(tempImage, response.data);

    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto("https://lens.google.com/upload", { waitUntil: "networkidle2" });

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click("input[type='file']")
    ]);
    await fileChooser.accept([tempImage]);
    await page.waitForSelector("a", { timeout: 15000 });

    const products = await page.$$eval("a", els =>
      els.map(a => ({
        href: a.href,
        img: a.querySelector("img")?.src,
        title: a.textContent?.trim().slice(0, 80)
      })).filter(p => /amazon\.|flipkart\.|meesho\.|myntra\./.test(p.href))
    );

    await browser.close();
    fs.unlinkSync(tempImage);
    res.json({ results: products.slice(0, 10) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed search", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
