# Project Overview

## Summary

`automation-opportunity-scorer` is a small, complete internal analytics product for automation prioritization. It analyzes recurring operational work categories, scores them with a transparent deterministic model, and highlights the best automation investments based on value and implementation fit.

## Product question

The application is built around one decision:

> What should we automate next?

Everything in the product supports that decision:

- seeded recurring work categories
- deterministic scoring
- visible ROI assumptions
- actionable detail pages

## Intended users

- automation engineers identifying high-leverage automation targets
- service operations leaders prioritizing automation backlog investments
- solutions engineers explaining ROI and delivery fit to stakeholders

## V1 scope

The shipped scope is intentionally narrow.

- One dashboard page
- One detail page per opportunity
- A seeded aggregated dataset
- A deterministic scoring engine
- Local and deployed setup with Prisma and PostgreSQL

## Seeded dataset

Each record represents a recurring operational process or issue category rather than an individual ticket.

Example categories:

- Password reset
- MFA reset
- New user onboarding
- Procurement request
- VPN issue
- Printer troubleshooting
- Email access issue
- Stale ticket follow-up
- Quote-to-procurement handoff
- License assignment
- Access revocation offboarding

## What the app communicates

This project is designed to show strategic automation thinking, not just workflow building:

- identifying repeatable operational work
- estimating potential labor recovery
- weighing business urgency against delivery complexity
- turning that analysis into concrete implementation next steps

## Non-goals

These were intentionally excluded from v1:

- ticket ingestion
- CSV import
- authentication
- multi-tenant architecture
- workflow execution
- chatbot interfaces
- configurable scoring from the UI
- background jobs

## Success criteria

The project is successful when it is:

- easy to run locally
- visually credible in screenshots
- analytically transparent
- tight enough to feel complete
- useful to explain in an interview or portfolio review
