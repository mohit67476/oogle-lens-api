const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Google Lens Automation API is running 🚀");
});

app.post("/search", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://lens.google.com/upload");

    // Simulate file upload via image URL (you can replace this with your flow)
    await page.evaluate((url) => {
      document.querySelector("input[type='file']").style.display = "block";
      document.querySelector("input[type='file']").setAttribute("data-dummy-url", url); // for debugging
    }, imageUrl);

    // Wait or simulate steps to complete search
    await new Promise((r) => setTimeout(r, 5000));

    // Dummy response — replace this with actual scraping logic
    await browser.close();

    res.json({
      status: "success",
      results: [
        {
          title: "Sample Product 1",
          link: "https://www.amazon.in/dp/example1",
        },
        {
          title: "Sample Product 2",
          link: "https://www.flipkart.com/product/example2",
        },
      ],
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
