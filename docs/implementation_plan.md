# Admin Panel for Ikaisoft Website

Build a complete admin panel system with login in the footer, a dedicated admin dashboard page, and API-driven content management for jobs/internships and courses (live/upcoming), with enrollments, contacts, and password reset.

## User Review Required

> [!IMPORTANT]
> **Authentication approach**: We'll use JWT (JSON Web Tokens) for session management. The admin credentials will be stored in MongoDB with bcrypt-hashed passwords. A `bcryptjs` and `jsonwebtoken` package will be added to the server.

> [!IMPORTANT]
> **Admin seeding**: On first server start, a default admin account will be seeded (email: `admin@ikaisoft.com`, password: `Admin@123`). The admin can then change the password from the dashboard.

> [!WARNING]
> **No separate frontend framework**: Since the site is static HTML/CSS/JS, the admin panel will be a new `admin.html` page with vanilla JS making API calls. All auth state is managed via `localStorage` JWT tokens.

## Open Questions

> [!IMPORTANT]
> **Course images**: When admin posts a course, should they provide an image URL, or should we support image upload to the server? For simplicity, the plan uses image URLs (e.g., from your existing `assets/img/courses-img/` folder). Let me know if you want file upload instead.

> [!IMPORTANT]
> **Career page**: Currently the career page has hardcoded job cards in HTML. After this change, those static cards will be **replaced by dynamically-loaded cards from the database**. Is that acceptable? (Same for `course.html` — live courses will load from DB).

## Proposed Changes

### Backend — New Dependencies

#### [MODIFY] [package.json](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/package.json)
- Add `bcryptjs` for password hashing
- Add `jsonwebtoken` for JWT auth tokens

---

### Backend — Models

#### [NEW] [Admin.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/models/Admin.js)
Admin schema with `email`, `password` (hashed), `name`, `createdAt`.

#### [NEW] [Job.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/models/Job.js)
Job/Internship schema:
- `title`, `type` (Full Time/Part Time/Internship), `team` (Development/Consulting/Design/Operations), `location` (Remote/Lucknow/Hybrid), `summary`, `tags` (array of strings), `isActive` (boolean, default true), `timestamps`

#### [NEW] [Course.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/models/Course.js)
Course schema:
- `title`, `description`, `category` (e.g., "Data Related", "Full Stack", "Other"), `status` (Live/Upcoming), `duration`, `level`, `mode`, `schedule`, `certificate` (boolean), `imageUrl`, `isActive` (boolean), `modules` (array of strings), `highlights` (array of strings), `timestamps`

---

### Backend — Middleware

#### [NEW] [authMiddleware.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/middleware/authMiddleware.js)
JWT verification middleware. Checks `Authorization: Bearer <token>` header, verifies the token, and attaches admin info to `req.admin`.

---

### Backend — Controllers

#### [NEW] [adminController.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/controller/adminController.js)
- `loginAdmin` — Validates email/password, returns JWT token
- `resetPassword` — Authenticated route, takes old + new password, updates hash
- `getContacts` — Returns all contact form submissions from DB
- `getEnrollments` — Returns all enrollment submissions from DB
- `getRegistrations` — Returns all registration submissions from DB
- `getDashboardStats` — Returns counts of contacts, enrollments, jobs, courses

#### [NEW] [jobController.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/controller/jobController.js)
- `createJob` — Create new job posting (authenticated)
- `getAllJobs` — Public: get all active jobs (for career page)
- `getAllJobsAdmin` — Admin: get all jobs including inactive
- `updateJob` — Update job details (authenticated)
- `toggleJobStatus` — Toggle active/inactive (authenticated)
- `deleteJob` — Delete a job (authenticated)

#### [NEW] [courseController.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/controller/courseController.js)
- `createCourse` — Create new course (authenticated)
- `getAllCourses` — Public: get all active courses (for learning/course page)
- `getAllCoursesAdmin` — Admin: get all courses including inactive
- `updateCourse` — Update course details (authenticated)
- `toggleCourseStatus` — Toggle active/inactive (authenticated)
- `deleteCourse` — Delete a course (authenticated)

---

### Backend — Routes

#### [NEW] [adminRoutes.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/routes/adminRoutes.js)
- `POST /api/admin/login`
- `POST /api/admin/reset-password` (protected)
- `GET /api/admin/contacts` (protected)
- `GET /api/admin/enrollments` (protected)
- `GET /api/admin/registrations` (protected)
- `GET /api/admin/stats` (protected)

#### [NEW] [jobRoutes.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/routes/jobRoutes.js)
- `POST /api/jobs` (protected)
- `GET /api/jobs` (public — active only)
- `GET /api/jobs/admin` (protected — all jobs)
- `PUT /api/jobs/:id` (protected)
- `PATCH /api/jobs/:id/toggle` (protected)
- `DELETE /api/jobs/:id` (protected)

#### [NEW] [courseRoutes.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/routes/courseRoutes.js)
- `POST /api/courses` (protected)
- `GET /api/courses` (public — active only)
- `GET /api/courses/admin` (protected — all courses)
- `PUT /api/courses/:id` (protected)
- `PATCH /api/courses/:id/toggle` (protected)
- `DELETE /api/courses/:id` (protected)

---

### Backend — Admin Seeder

#### [NEW] [seedAdmin.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/config/seedAdmin.js)
- Seeds a default admin (`admin@ikaisoft.com` / `Admin@123`) if no admin exists in DB
- Called automatically from `index.js` after DB connection

---

### Backend — Server Entry

#### [MODIFY] [index.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/index.js)
- Import and register new routes (adminRoutes, jobRoutes, courseRoutes)
- Add `GET` to allowed CORS methods (for fetching jobs/courses/contacts)
- Add `PUT`, `PATCH`, `DELETE` methods for admin operations
- Call `seedAdmin()` after DB connection
- Add JWT_SECRET to `.env`

#### [MODIFY] [.env](file:///e:/Ikaisoft_web/ikaisoft-website-og/server/.env)
- Add `JWT_SECRET` environment variable

---

### Frontend — Admin Panel

#### [NEW] [admin.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/admin.html)
A full-featured admin dashboard page with:
- **Sidebar navigation**: Dashboard, Jobs, Courses, Contacts, Enrollments, Registrations, Settings
- **Dashboard tab**: Stats cards (total jobs, courses, contacts, enrollments) 
- **Jobs tab**: Table of all jobs with active/inactive toggle, edit, delete buttons + "Add Job" form modal
- **Courses tab**: Table of all courses with active/inactive toggle, edit, delete + "Add Course" form modal
- **Contacts tab**: Table of all contact submissions (name, email, phone, service, message, date)
- **Enrollments tab**: Table of enrollment submissions
- **Registrations tab**: Table of registration submissions
- **Settings tab**: Password reset form (old password, new password, confirm)
- Premium dark-themed design with glassmorphism sidebar, smooth animations
- JWT-based auth — redirects to index.html if no valid token

---

### Frontend — Footer Admin Login

#### [MODIFY] All HTML pages (footer section)
Add a small "Admin" link in the footer-bottom (copyright) area across all pages. When clicked, it opens a login modal overlay with email/password fields. On successful login, redirect to `admin.html`.

Pages to modify:
- [index.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/index.html)
- [about.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/about.html)
- [career.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/career.html)
- [contact.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/contact.html)
- [consultancy.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/consultancy.html)
- [course.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/course.html)
- [It-Solutions.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/It-Solutions.html)
- [learning.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/learning.html)
- [research.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/research.html)
- [registration-form.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/registration-form.html)

---

### Frontend — Dynamic Career Page

#### [MODIFY] [career.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/career.html)
- Remove hardcoded job cards from the `#open-roles` section
- Add JavaScript at the bottom to fetch active jobs from `GET /api/jobs` and dynamically render them using the same card structure/styles
- Filters (search, team, location) will work on the dynamically loaded data

---

### Frontend — Dynamic Course Page

#### [MODIFY] [course.html](file:///e:/Ikaisoft_web/ikaisoft-website-og/course.html)
- Remove hardcoded course cards
- Add JavaScript to fetch active courses from `GET /api/courses` and dynamically render them with the existing card-blog design
- Course status badge shows "Live" or "Upcoming"
- "Register Now" / "Enroll Now" button triggers enrollment

---

### Frontend — API Helper

#### [NEW] [api/adminApi.js](file:///e:/Ikaisoft_web/ikaisoft-website-og/api/adminApi.js)
Centralized API helper for all admin operations (login, CRUD for jobs/courses, fetching contacts etc.) with JWT token management.

---

## Verification Plan

### Manual Verification
1. **Admin Login**: Click "Admin" in footer → login modal opens → login with `admin@ikaisoft.com` / `Admin@123` → redirected to admin dashboard
2. **Password Reset**: In admin settings → change password → logout → login with new password
3. **Post a Job**: Go to Jobs tab → Add new job → verify it appears on career.html
4. **Toggle Job**: Set job to inactive → verify it disappears from career.html
5. **Post a Course**: Go to Courses tab → Add new course → verify it appears on course.html with correct Live/Upcoming badge
6. **Enrollment Flow**: Click "Enroll Now" on a course → fill form → verify enrollment appears in admin dashboard + confirmation email sent
7. **View Contacts**: Submit a contact form → verify it shows in admin Contacts tab
8. **Career Filters**: Test search, team, and location filters on career page with dynamic data

### Automated Tests
```bash
# Verify server starts without errors
cd server && npm start
```
