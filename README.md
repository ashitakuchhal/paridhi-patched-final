###⚡ PARIDHI — Multi-Agent Market Intelligence Desk

> **Submission for HACKVERSE: INTO THE WEB — Round 1**  
> Organized by the **IEEE Robotics and Automation Society (IEEE-RAS) Student Chapter** as part of **TECHNOVIT at VIT Chennai**.

<p align="center">
  <strong>AI-Powered • Multi-Agent • Real-Time • Risk-Aware</strong>
</p>

---

##📌 Overview

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
