# Vue Job Listings - Full Stack Application (WIP)

This is a full-stack job listings application built with Vue.js and Django REST Framework. The application allows users to browse, search, and filter job listings with advanced filtering capabilities including salary ranges, work types, company sizes, markets, and many more.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- View all available job listings
- Search for jobs by company name, position, role, level, skills, or location
- Filter jobs by multiple criteria:
  - Role types (e.g., Frontend, Backend, Fullstack)
  - Experience level (Junior, Midweight, Senior)
  - Contract type (Full Time, Part Time, Contract, Internship)
  - Work type (Remote, Hybrid, Onsite)
  - Location (by country)
  - Salary range with currency selection
  - Skills (multiple selection)
  - Market (SaaS, FinTech, HealthTech, etc.)
  - Company size (1-10, 11-50, 51-200, 201-500, 500+)
- See job details including:
  - Company logo and name
  - Position title
  - Posted date (relative time format: "2d ago", "3w ago", etc.)
  - "New" badge for jobs posted within the last 2 days
  - Featured job indicator
  - Salary information with currency and timeframe
- View the optimal layout for the site depending on their device's screen size
- See hover states for all interactive elements on the page
- Sort jobs by posting date (newest first) or by company name

### Screenshot

![homepage](/client/public/images/readme/job-list.png)


Currently in the process of implementing the landing page design

### Links

- Solution URL: [Job Listing](https://github.com/hikmahx/vue-job-listings/)
<!-- - Live Site URL: [Add your live site URL here] -->

## My process

### Built with

**Frontend:**

- [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Pinia](https://pinia.vuejs.org/) - State management for Vue
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vee-Validate](https://vee-validate.logaretm.com/) - Form validation library
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [shadcn-vue](https://www.shadcn-vue.com/) - Vue component library (built on Reka UI)
- [Lucide Vue Next](https://lucide.dev/) - Icon library
- [Axios](https://axios-http.com/) - HTTP client
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

**Backend:**

- [Django](https://www.djangoproject.com/) - High-level Python web framework
- [Django REST Framework](https://www.django-rest-framework.org/) - Powerful toolkit for building Web APIs
- [django-filters](https://django-filter.readthedocs.io/) - Advanced filtering for Django REST Framework
- [SQLite](https://www.sqlite.org/) - Lightweight database
- [ShortUUID](https://github.com/stochastic-technologies/shortuuid) - Short UUID field for Django models
- [PyCountry](https://pypi.org/project/pycountry/) - ISO country, subdivision, language, currency and script definitions

### What I learned

In this project, I wanted to expand my knowledge of Django and take the opportunity to learn Vue for the first time. In doing so, I learnt the following as well:

- **State Management with Pinia**: Refactored the code from simple reactive state and provide/inject to a centralized state management for jobs and filters, making the application more maintainable and scalable.

- **Advanced Filtering**: Built a sophisticated filtering system that supports multiple filter types including:

  - Range filters (salary)
  - Multi-select filters (skills, markets, company sizes)
  - Search across multiple fields
  - Custom filter methods for JSON fields

- **Form Validation**: I used Vee-Validate in shadcn-vue with Zod schemas, following the documentation closely for form validation in the filter modal, ensuring data integrity and a better user experience.

- **API Design**: Designed a RESTful API with Django REST Framework that supports:

  - Complex filtering with django-filters
  - Search functionality across multiple fields
  - Custom serializers with computed fields (`postedAt`, new badge)
  - Proper field naming conventions (camelCase for frontend compatibility)
  - I made sure the filters were an exact match with the frontend's query parameters, using camelCase field names in (like `minSalary`, `maxSalary`, `companySizes`, `workType`) to ensure perfect integration between the frontend filter state and backend API endpoints

### Continued development

Future improvements and features to consider:

- [ ] Deploy to production environment
- [ ] Add pagination to handle job listings better
- [ ] Implement user authentication and authorization
- [ ] Add job application functionality
- [ ] Create user profiles and saved jobs feature
- [ ] Add email notifications for new job postings matching user preferences and when after a user successfully applies too
- [ ] Implement job posting functionality for employers
  <!-- - [ ] Enhance search with full-text search capabilities -->
  <!-- - [ ] Add job comparison feature -->
- [ ] Implement dark mode theme
- [ ] Add unit and integration tests
- [ ] Add analytics and job view tracking

### Useful resources

- [Vue.js Documentation](https://vuejs.org/) - Comprehensive guide to Vue.js framework
- [Django REST Framework](https://www.django-rest-framework.org/) - Official documentation for building REST APIs
- [Pinia Documentation](https://pinia.vuejs.org/) - State management library for Vue
- [Shubham Sarda's IMDB Clone DRF](https://github.com/ShubhamSarda/IMDB-Clone-DRF) - A great repo to learn drf better
- [shadcn-vue](https://www.shadcn-vue.com/) - Shadcn Vue component library

## Author

- Github - [Hikmahx](https://github.com/Hikmahx)
- Email - [hikmayousuph@gmail.com](hikmayousuph@gmail.com)
- LinkedIn - [Hikmah Yousuph](linkedin.com/in/hikmah-yousuph)
- Frontend Mentor - [@Hikmahx](https://www.frontendmentor.io/profile/Hikmahx)
