# Career Application Flow Implementation Plan

## Goal
Add a job-application flow to the public careers page and expose applicant counts in the admin jobs section.

## What will be implemented
1. Public careers page
   - Show job cards/listings on the careers page.
   - Add an Apply button for each job.
   - Open a modal form when Apply is clicked.
   - Submit applicant details to the backend.

2. Backend integration
   - Extend the existing Node.js/Express + MongoDB job flow.
   - Store job applications against the relevant job.
   - Return success/error responses to the frontend.

3. Admin panel updates
   - Add an applicant count column/button per job in the admin Jobs tab.
   - Allow admins to view applicant details for a selected job.

## Existing repository fit
- Frontend: career page already exists and the admin dashboard already manages jobs.
- Backend: server routes/controllers/models for jobs already exist.
- Database: the project appears to use MongoDB via Mongoose.

## Open questions
Please confirm these before implementation:
1. Which fields should the application form collect?
   - Suggested default: full name, email, phone, experience (if have other freshers),resume,educational details (like class XII percentage+ graducation CGPSe) message
2. Should applicants be able to upload a resume?
   - Yes 
3. In the admin panel, i you want:
   - a detailed list of applicants with their contact info
4. Should the jobs list be populated from the existing admin-created job posts, or should the careers page also support adding new jobs directly from the frontend-both(i recommended leave it as it)

## Recommended approach
- Reuse the existing admin-created jobs as the source of truth.
- Add a new application submission endpoint.
- Add a new applicants model linked to each job.
- Show applicant counts in the admin jobs table and allow viewing details in a modal.
Okay do it