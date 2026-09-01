Absolutely — your current README has a few broken Markdown artifacts (`[cite: ...]`, malformed links, escaped Markdown, duplicated code fences). Here’s a **clean, professional GitHub-ready version**.

Copy **everything inside this code block** directly into `README.md`:

````markdown
# ⚡ PARIDHI — Multi-Agent Market Intelligence Desk

> **Submission for HACKVERSE: INTO THE WEB — Round 1**  
> Organized by the **IEEE Robotics and Automation Society (IEEE-RAS) Student Chapter** as part of **TECHNOVIT at VIT Chennai**.

<p align="center">
  <strong>AI-Powered • Multi-Agent • Real-Time • Risk-Aware</strong>
</p>

---

## 📌 Overview

**Paridhi** is a high-throughput, multi-agent market intelligence and equity research platform designed to reduce information asymmetry for retail investors.

Instead of relying on a single LLM prompt, Paridhi uses a **parallel pipeline of specialized AI agents** to independently analyze a stock across:

- 📈 Technical indicators
- 📰 Market news & sentiment
- 📚 Fundamental information
- 🎯 Investor risk profile
- 💰 Portfolio concentration

The system combines these independent signals through a **Synthesis Engine** to generate a personalized market view such as:

`BUY` • `HOLD` • `REDUCE` • `AVOID`

> ⚠️ **Disclaimer:** Paridhi is an educational hackathon prototype. Its outputs are not financial advice.

---

## 🧠 System Architecture

```text
                              ┌───────────────────────────┐
                              │      User Request         │
                              │   AAPL / RELIANCE / etc.  │
                              └─────────────┬─────────────┘
                                            │
                  ┌─────────────────────────┼─────────────────────────┐
                  │                         │                         │
                  ▼                         ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
        │  Technical Agent │      │ Sentiment Agent  │      │ Fundamentals     │
        │                  │      │                  │      │ Agent            │
        │ Yahoo Finance    │      │ Finnhub / RSS    │      │ RAG Corpus       │
        │ RSI / SMA / BB    │      │ News Analysis   │      │ Filings / Calls  │
        └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
                 │                         │                         │
                 └─────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │    Synthesis Engine     │
                              │                         │
                              │ Risk Profile Calibration│
                              └────────────┬────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │ Personalized Insight    │
                              │                         │
                              │ Signal + Confidence     │
                              │ Allocation + Risk       │
                              └─────────────────────────┘
````

---

# ✨ Key Features

### 🔀 1. Parallel Multi-Agent Architecture

Paridhi separates market research into independent specialized agents.

The agents execute concurrently using asynchronous server-side orchestration, reducing overall response latency.

```text
                    Stock Request
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Technical      Sentiment     Fundamentals
        Agent          Agent           Agent
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                   Synthesis Agent
                         │
                         ▼
                   Final Decision
```

---

### 📈 2. Live Market Data

The platform dynamically retrieves market information including:

* Current stock price
* Daily price movement
* Historical OHLCV data
* Trading volume
* Exchange information
* Market news

Supported markets include **US equities and Indian NSE/BSE stocks**, subject to available API coverage.

---

### 🧮 3. Server-Side Technical Analysis

Technical indicators are calculated on the server before being passed into the AI reasoning pipeline.

Currently implemented:

| Indicator           | Purpose                                   |
| ------------------- | ----------------------------------------- |
| **RSI-14**          | Momentum / overbought / oversold analysis |
| **SMA-5**           | Short-term trend                          |
| **SMA-20**          | Medium-term trend                         |
| **Bollinger Bands** | Volatility & price positioning            |
| **Volume Z-Score**  | Unusual volume detection                  |

This ensures that the LLM receives **computed financial statistics rather than raw numerical data alone**.

---

### 📰 4. News Sentiment Agent

The Sentiment Agent analyzes recent company-related news.

Data sources include:

* Finnhub
* Google News RSS fallback

The agent evaluates signals such as:

* Positive sentiment
* Negative sentiment
* Market-moving events
* Earnings-related news
* Corporate developments

If the primary news API becomes unavailable, the system can fall back to RSS-based ingestion.

---

### 📚 5. Grounded Fundamental RAG

The Fundamentals Agent uses a structured corpus containing:

* Company filings
* Earnings information
* Financial excerpts
* Relevant corporate information

Instead of allowing the model to freely invent fundamental information, the agent is instructed to return **document references / IDs** supporting its conclusions.

```text
User Query
    │
    ▼
Fundamental Agent
    │
    ▼
Retrieve Relevant Documents
    │
    ▼
Analyze Evidence
    │
    ▼
Structured JSON Response
    │
    ├── Fundamental Signal
    ├── Reasoning
    └── Source Document IDs
```

This improves transparency and reduces unsupported claims.

---

### 🎯 6. Risk-Conditioned Recommendations

Paridhi does not treat every investor the same.

The Synthesis Engine considers the user's selected risk profile when generating the final recommendation.

| Profile          | Maximum Suggested Allocation |
| ---------------- | ---------------------------- |
| 🛡️ Conservative | **5%**                       |
| 🚀 Aggressive    | **20%**                      |

The system dynamically adjusts:

* Recommendation thresholds
* Confidence requirements
* Suggested allocation
* Risk interpretation

---

### 🛡️ 7. Graceful Degradation

Real-world financial systems cannot assume that every external service will always work.

Paridhi includes simulated outage scenarios for:

* 📉 Market data feed
* 📰 News feed
* 📚 Fundamentals corpus

When a source becomes unavailable:

```text
External Source Failure
          │
          ▼
   Source = Unavailable
          │
          ▼
  No Fabricated Values
          │
          ▼
Reduced Confidence
          │
          ▼
Transparent Final Result
```

The system **does not fabricate missing market information**.

---

### 📊 8. Portfolio Concentration Analysis

Paridhi uses the **Herfindahl-Hirschman Index (HHI)** to estimate portfolio concentration.

A higher HHI indicates that the portfolio is concentrated in fewer positions, while a lower HHI indicates greater diversification.

This allows the system to identify potential concentration risk beyond individual stock analysis.

---

# 🛠️ Technology Stack

## Backend

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| **Node.js**           | Backend runtime                 |
| **Express.js**        | REST API server                 |
| **Google Gemini API** | AI agent reasoning & synthesis  |
| **Yahoo Finance**     | Market data                     |
| **Finnhub**           | News data                       |
| **Google News RSS**   | News fallback                   |
| **Axios**             | HTTP requests                   |
| **dotenv**            | Environment variable management |
| **CORS**              | Client-server communication     |

---

## AI Layer

### Google Gemini

Paridhi uses **Gemini 2.5 Flash** as the primary LLM engine.

The model is used for:

* Technical signal interpretation
* News sentiment classification
* Fundamental reasoning
* Multi-agent synthesis
* Structured JSON responses
* Risk-aware recommendation generation

The backend maintains the API key server-side through environment variables.

---

## Frontend

The frontend intentionally avoids heavy frameworks.

Built using:

* HTML5
* CSS3
* Vanilla JavaScript
* SVG
* Responsive layouts

The dashboard includes:

* 🌑 Dark-mode interface
* 📊 Market metrics
* 📈 Custom sparklines
* ⏳ Skeleton loading states
* 📱 Responsive layout
* 🎯 Recommendation cards
* 📋 Agent reasoning panels

---

# 📁 Project Structure

```text
paridhi/
│
├── server/
│   ├── index.js
│   │
│   ├── routes/
│   │   ├── stock.js
│   │   ├── news.js
│   │   ├── filings.js
│   │   └── claude.js
│   │
│   └── lib/
│       ├── yahoo.js
│       ├── indicators.js
│       └── corpus.js
│
├── public/
│   └── index.html
│
├── .env.example
├── check.js
├── ARCHITECTURE.md
├── package.json
└── README.md
```

---

# 🔄 Data Flow

```text
                    ┌─────────────────┐
                    │   Stock Ticker  │
                    │  AAPL / RELIANCE│
                    └────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Data Ingestion   │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Market Data       News         Fundamentals
              │              │              │
              ▼              ▼              ▼
        Indicators      Sentiment        RAG Search
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                   ┌──────────────────┐
                   │ Multi-Agent      │
                   │ Synthesis        │
                   └────────┬─────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Risk Calibration   │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Final Recommendation│
                  │                    │
                  │ Signal             │
                  │ Confidence         │
                  │ Allocation         │
                  │ Risk Assessment    │
                  └────────────────────┘
```

---

# 🚀 Installation & Setup

## 1. Prerequisites

Make sure you have:

* **Node.js v18+**
* **npm v9+**
* Internet connection
* Gemini API key

---

## 2. Clone the Repository

```bash
git clone https://github.com/your-username/paridhi.git
cd paridhi
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

```bash
cp .env.example .env
```

Then configure:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FINNHUB_API_KEY=your_optional_finnhub_api_key_here
PORT=3000
```

> 🔐 **Never commit your `.env` file to GitHub.**

You can obtain a Gemini API key from **Google AI Studio**.

---

## 5. Verify the Installation

Run the automated system check:

```bash
node check.js
```

This verifies the required modules and routing structure.

---

## 6. Start the Server

### Production

```bash
npm start
```

### Development

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🧪 Fault-Tolerance Testing

Paridhi includes simulated outage scenarios to demonstrate how the system behaves when external data sources fail.

Example scenarios:

```text
1. Market Feed Down
2. News Feed Down
3. Fundamentals Corpus Down
```

Expected behavior:

```text
Source Failure
      │
      ▼
Unavailable
      │
      ▼
No Synthetic Data
      │
      ▼
Confidence Penalty
      │
      ▼
Transparent Recommendation
```

This demonstrates that the system prioritizes **data integrity over generating an answer at any cost**.

---

# 🧩 Agent Responsibilities

| Agent                     | Responsibility                      | Primary Data  |
| ------------------------- | ----------------------------------- | ------------- |
| 📈 **Technical Agent**    | Price & momentum analysis           | Yahoo Finance |
| 📰 **Sentiment Agent**    | News interpretation                 | Finnhub / RSS |
| 📚 **Fundamentals Agent** | Evidence-based fundamental analysis | RAG Corpus    |
| 🧠 **Synthesis Engine**   | Combine signals                     | All agents    |
| 🎯 **Risk Calibration**   | Personalize allocation              | User profile  |

---

# 📡 API Architecture

The Express backend exposes dedicated routes for different data and reasoning operations.

```text
Client
  │
  ▼
Express Server
  │
  ├── /stock
  │     └── Market Data + Technical Indicators
  │
  ├── /news
  │     └── News + Sentiment Inputs
  │
  ├── /filings
  │     └── RAG Corpus Retrieval
  │
  └── /claude
        └── AI Agent Orchestration
```

> **Note:** The route name `claude.js` is retained from the original project structure even though the current AI provider is Gemini.

---

# 🔐 Security Considerations

Paridhi follows several basic security practices:

* API keys are stored in `.env`
* Secrets are never exposed to the frontend
* External APIs are accessed through the backend
* CORS middleware controls client-server communication
* `.env` should be excluded from version control

Recommended `.gitignore`:

```text
node_modules/
.env
.DS_Store
```

---

# 🏆 Hackathon Context

**Paridhi** was developed for:

### HACKVERSE: INTO THE WEB — Round 1

Organized by the:

**IEEE Robotics and Automation Society (IEEE-RAS) Student Chapter**

as part of:

**TECHNOVIT — VIT Chennai**

### Track

> Web Development / AI & Financial Intelligence

### Core Challenge

Retail investors often face information overload, fragmented financial data, and limited access to structured research.

Paridhi addresses this by combining:

```text
Real-Time Data
      +
Specialized AI Agents
      +
Grounded Research
      +
Risk Profiling
      +
Portfolio Analytics
      =
Personalized Market Intelligence
```

---

# 💡 Why Paridhi?

Traditional retail investment research often requires switching between multiple platforms:

```text
Stock Charts
     +
News Websites
     +
Financial Statements
     +
Market Research
     +
Portfolio Analysis
```

Paridhi brings these perspectives together through a single intelligent pipeline.

### Instead of:

> "Ask an AI about this stock."

### Paridhi does:

> **"Let multiple specialized agents independently investigate the stock, ground their reasoning in data, and then synthesize the evidence according to the investor's risk profile."**

---

# 🔮 Future Roadmap

Potential future improvements include:

* [ ] Real-time intraday market feeds
* [ ] More advanced portfolio optimization
* [ ] Sector-level risk analysis
* [ ] Historical backtesting
* [ ] Earnings-call transcript ingestion
* [ ] SEC / NSE / BSE filing integrations
* [ ] Explainable recommendation scoring
* [ ] User portfolio synchronization
* [ ] Watchlist alerts
* [ ] Multi-stock comparative analysis
* [ ] Advanced agent debate / verification layer

---

# ⚠️ Disclaimer

**Paridhi is an educational software prototype developed for hackathon and demonstration purposes.**

The information and AI-generated outputs provided by this application **do not constitute financial, investment, legal, or professional advice**.

Market data may be delayed, incomplete, or unavailable depending on third-party providers.

Users should independently verify information and consult a qualified financial professional before making investment decisions.

---

# 📜 License

This project is released under the **MIT License**.

---

<p align="center">

### ⚡ PARIDHI

**Multi-Agent Market Intelligence Desk**

Built for **HACKVERSE: INTO THE WEB — Round 1**

**TECHNOVIT • VIT Chennai**

</p>
```

This version is **actual Markdown**, so you won't get the ugly `\[cite: 1\]`, malformed hyperlinks, or nested/duplicate code fences when GitHub renders it.
