

  // Define models
const Student = mongoose.model('Student', StudentSchema);
const Course = mongoose.model('Course', CourseSchema);

// Perform the "join"
Student.aggregate([
  {
    $lookup: {
      from: 'courses', // The name of the collection to join with
      localField: 'courses', // The field in the local collection
      foreignField: 'CourseID', // The field in the foreign collection
      as: 'courseDetails' // The field where the joined data will be stored
    }
  }
]).exec((err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(result);
});








// Perform the "join" to look up data from the Student collection based on CourseID
Course.aggregate([
    {
      $lookup: {
        from: 'students', // The name of the collection to join with
        localField: 'CourseID', // The field in the local collection (courses)
        foreignField: 'courses', // The field in the foreign collection (students)
        as: 'studentsData' // The field where the joined data will be stored
      }
    }
  ]).exec((err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(result);
  });




  

  const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
