// Kept for convenience: loads the SMS course (same as: node scripts/seed-course.cjs sms-course-data).
process.argv.splice(2, 0, "sms-course-data");
require("./seed-course.cjs");
