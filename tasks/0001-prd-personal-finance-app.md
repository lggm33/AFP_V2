# Personal Finance App with AI-Powered Email Transaction Detection

## Introduction/Overview

This personal finance application revolutionizes budget management by automatically detecting and categorizing financial transactions through intelligent email analysis. Unlike traditional finance apps that require manual transaction entry, this solution leverages AI-generated regex templates to parse banking notifications from users' email accounts, providing seamless and accurate financial tracking.

The app combines comprehensive budgeting features with automated transaction detection, supporting multiple email accounts, banks, credit cards, and financial institutions per user. The system is built on a hybrid architecture using Supabase for CRUD operations and authentication, with a dedicated Node.js microservice deployed on Railway handling email processing and AI analysis.

**Problem Solved:** Eliminates the tedious manual entry of financial transactions while providing comprehensive budget management tools, giving users accurate, real-time financial insights without the overhead of constant data input.

## Goals

1. **Automate Transaction Detection:** Achieve >95% accuracy in detecting and categorizing financial transactions from email notifications
2. **Comprehensive Budget Management:** Provide all essential budgeting features including category creation, spending limits, and alerts
3. **Multi-Account Support:** Enable users to connect and manage multiple email accounts and financial institutions
4. **Superior User Experience:** Deliver an intuitive web and PWA interface that saves users significant time compared to manual entry
5. **Data Security:** Ensure bank-level security for sensitive financial and email data
6. **Scalable Architecture:** Build a robust system that can handle growing user bases and transaction volumes

## User Stories

### Core User Stories
- **As a busy professional**, I want my transactions to be automatically detected from my emails so that I don't have to manually enter every purchase
- **As a budget-conscious user**, I want to set spending limits by category so that I can control my expenses and receive alerts when approaching limits
- **As a multi-bank user**, I want to connect multiple email accounts and financial institutions so that all my transactions are tracked in one place
- **As a privacy-conscious user**, I want my email data to be processed securely without storing raw email content so that my privacy is protected
- **As a detail-oriented user**, I want to review and correct any misclassified transactions so that my financial data remains accurate

### Advanced User Stories
- **As a financial planner**, I want to see spending trends and reports so that I can make informed financial decisions
- **As a mobile user**, I want to access my financial data on any device so that I can check my budget on the go
- **As a new user**, I want the AI to learn from my corrections so that transaction detection improves over time

## Functional Requirements

### Authentication & User Management
1. The system must provide secure user registration and login via Supabase Auth
2. The system must support OAuth integration with Gmail for email access
3. The system must securely store and encrypt email API tokens
4. The system must allow users to connect multiple email accounts to their profile

### Email Processing & Transaction Detection
5. The system must connect to Gmail API to access user emails
6. The system must process emails every hour to detect new transactions
7. The system must use AI-generated regex templates to extract transaction data from banking emails
8. The system must detect all transaction types: card purchases, bank transfers, automatic payments, deposits, and ATM withdrawals
9. The system must support notifications from multiple banks and financial institutions
10. The system must process emails without storing raw email content
11. The system must allow users to provide feedback to improve AI detection accuracy

### Budget Management
12. The system must allow users to create custom spending categories
13. The system must enable users to set monthly spending limits per category
14. The system must automatically categorize detected transactions
15. The system must send alerts when users approach or exceed category limits
16. The system must provide spending trend analysis and reports

### Account & Transaction Management
17. The system must allow users to manually add financial accounts
18. The system must support multiple currencies
19. The system must enable users to manually add, edit, or delete transactions
20. The system must allow users to recategorize transactions
21. The system must maintain transaction history with timestamps and sources

### User Interface
22. The system must provide a responsive web application
23. The system must function as a Progressive Web App (PWA)
24. The system must display real-time budget status and spending summaries
25. The system must provide intuitive navigation between accounts, categories, and reports

### Data Management
26. The system must sync data in real-time across all user devices
27. The system must provide data export functionality
28. The system must maintain data integrity across the Supabase database and Go microservice

## Non-Goals (Out of Scope)

- **Direct Bank API Integration:** Initial version will not connect directly to banking APIs
- **Investment Tracking:** Stock, crypto, or investment portfolio management
- **Bill Payment Processing:** The app will detect payments but not process them
- **Credit Score Monitoring:** Credit report or score tracking features
- **Tax Preparation:** Tax document generation or filing assistance
- **Multi-User Accounts:** Shared family or business accounts (single user focus initially)
- **Desktop Applications:** Native desktop apps (web/PWA only)
- **Email Providers Beyond Gmail:** Initial version focuses on Gmail only

## Design Considerations

### User Interface
- **Clean, Modern Design:** Implement a minimalist interface focusing on clarity and ease of use
- **Dashboard-Centric:** Primary view should show budget status, recent transactions, and alerts
- **Mobile-First Approach:** Design for mobile devices with PWA capabilities
- **Color-Coded Categories:** Visual distinction for different spending categories and budget status
- **Progressive Disclosure:** Show summary information first, with drill-down capabilities for details

### User Experience
- **Onboarding Flow:** Guided setup for email connection and initial budget configuration
- **Feedback Mechanisms:** Easy-to-use interfaces for correcting transaction categorization
- **Real-Time Updates:** Immediate reflection of changes across all views
- **Offline Capability:** PWA should function with limited connectivity

## Technical Considerations

### Architecture
- **Frontend:** Vite + React with PWA capabilities, deployed on Railway
- **Backend:** Supabase for authentication, database, and real-time subscriptions
- **Microservice:** Node.js service deployed on Railway for email processing and AI analysis
- **Database:** PostgreSQL via Supabase with shared access between web app and Node.js service
- **Deployment:** Railway platform for both frontend and microservice with integrated CI/CD

### Security & Privacy
- **Token Encryption:** All email API tokens must be encrypted at rest
- **Data Minimization:** Process emails without storing raw content
- **Secure Communication:** HTTPS/TLS for all data transmission
- **Access Control:** Row-level security in Supabase for user data isolation

### Performance
- **Batch Processing:** Efficient email processing to handle multiple accounts
- **Caching Strategy:** Cache frequently accessed data for improved response times
- **Rate Limiting:** Respect Gmail API rate limits and implement appropriate backoff strategies

### Integration
- **Gmail API:** Primary integration for email access and processing via Node.js googleapis library
- **Supabase SDK:** For authentication, database operations, and real-time features
- **AI/ML Services:** Integration with OpenAI API for regex template generation and improvement
- **Railway Platform:** Integrated deployment and CI/CD for both frontend and microservice
- **BullMQ + Redis:** Background job processing for email analysis and scheduled tasks

### Technology Stack Specifications

#### Frontend (Vite + React PWA)
- **Build Tool:** Vite 4+ for fast development and optimized production builds
- **Framework:** React 18+ with TypeScript for type safety
- **PWA:** Vite-plugin-pwa for service worker generation and manifest
- **State Management:** Zustand for lightweight state management
- **UI Library:** Tailwind CSS for rapid styling and responsive design
- **Charts:** Recharts for financial data visualization
- **Routing:** React Router 6+ for client-side navigation

#### Backend Microservice (Node.js)
- **Runtime:** Node.js 18+ with TypeScript
- **Web Framework:** Fastify for high-performance HTTP server
- **Job Queue:** BullMQ with Redis for background email processing
- **Email Processing:** googleapis library for Gmail API integration
- **AI Integration:** OpenAI SDK for regex template generation
- **Database Client:** Supabase JavaScript client with service role key
- **Validation:** Zod for runtime type validation
- **Logging:** Winston for structured logging

#### Deployment & Infrastructure
- **Platform:** Railway for both frontend and backend deployment
- **Database:** Supabase PostgreSQL with Row Level Security
- **Cache/Queue:** Railway Redis addon for BullMQ job processing
- **CI/CD:** Railway's integrated GitHub deployment pipeline
- **Monitoring:** Railway's built-in metrics and logging
- **SSL/Domains:** Railway's automatic HTTPS and custom domain support

## Success Metrics

### Accuracy Metrics
- **Transaction Detection Accuracy:** >95% of banking emails correctly identified and parsed
- **Categorization Accuracy:** >90% of transactions correctly categorized initially
- **False Positive Rate:** <5% of non-financial emails incorrectly processed

### User Experience Metrics
- **Time Savings:** Users spend <5 minutes per week on transaction management (vs 30+ minutes with manual entry)
- **User Engagement:** >80% of users actively use the app weekly
- **User Retention:** >70% of users remain active after 3 months

### Technical Metrics
- **Processing Speed:** Email analysis completed within 2 minutes of receipt
- **System Uptime:** >99.5% availability
- **API Response Time:** <500ms for standard operations

### Business Metrics
- **User Satisfaction:** >4.5/5 average rating
- **Feature Adoption:** >60% of users connect multiple email accounts
- **Support Efficiency:** <10% of users require support for transaction corrections

## Open Questions

1. **AI Model Training:** What specific machine learning approach will be used for regex template generation and improvement?

2. **Email Volume Handling:** How will the system handle users with very high email volumes (>1000 emails/day)?

3. **International Banking:** What considerations are needed for international banking formats and languages?

4. **Data Retention:** How long should processed transaction data be retained, and what are the deletion policies?

5. **Compliance Requirements:** Are there specific financial regulations (PCI DSS, PSD2, etc.) that need to be considered?

6. **Scalability Planning:** At what user volume will the current architecture need to be reconsidered?

7. **Error Recovery:** How should the system handle temporary Gmail API outages or authentication failures?

8. **Multi-Language Support:** Will the system need to support banking emails in languages other than English?

9. **Backup Strategy:** What backup and disaster recovery procedures are needed for user financial data?

10. **Performance Monitoring:** What specific monitoring and alerting systems should be implemented for the Node.js microservice on Railway?

11. **PWA Optimization:** What specific PWA features (offline sync, push notifications, background sync) should be prioritized for the initial release?

12. **Railway Scaling:** At what point should we consider Railway's auto-scaling features or migrate to multiple Railway services?
