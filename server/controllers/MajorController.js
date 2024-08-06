import Major from "../models/Major.js";
import MajorHistory from "../models/MajorHistory.js";


export const addMajor = async (req, res) => {
  const { name, description, universityId, history } = req.body;

  if (!name) return res.status(400).send({ message: "Tên ngành học không được để trống." });
  if (!description) return res.status(400).send({ message: "Mô tả không được để trống." });
  if (!universityId) return res.status(400).send({ message: "Mã trường đại học không được để trống." });

   // Check for duplicate major name (case-insensitive)
   const existingMajor = await Major.findOne({ name: new RegExp(`^${name}$`, 'i'), universityId });
   if (existingMajor) {
     return res.status(400).send({ message: "Tên ngành học đã tồn tại." });
   }

  // Check for duplicate years within the provided history array
  const years = history.map((entry) => entry.year);
  const duplicateYears = years.filter((year, index) => years.indexOf(year) !== index);
  if (duplicateYears.length > 0) {
    return res.status(400).send({
      message: `Có nhiều mục trong mảng history có cùng năm: ${duplicateYears.join(", ")}`,
    });
  }

  // Check for duplicate teachers within each history entry
  for (const entry of history) {
    const teacherIds = entry.teachers.map((teacher) => teacher.teacherId.toString());
    const duplicateTeachers = teacherIds.filter((id, index) => teacherIds.indexOf(id) !== index);
    if (duplicateTeachers.length > 0) {
      return res.status(400).send({
        message: `Có nhiều giảng viên trùng nhau trong năm ${entry.year}.`,
      });
    }
  }

  try {
    const major = new Major({ name, description, universityId });
    // await major.save();

    for (const entry of history) {
      const {
        year,
        studentsGraduated,
        studentsEnrolled,
        courseEvaluations,
        admissionScore,
        teachers,
      } = entry;

      if (!year) return res.status(400).send({ message: "Năm không được để trống." });
      if (studentsGraduated < 0) return res.status(400).send({ message: "Số sinh viên tốt nghiệp không được âm." });
      if (studentsEnrolled < 0) return res.status(400).send({ message: "Số sinh viên nhập học không được âm." });
      if (admissionScore < 0) return res.status(400).send({ message: "Điểm chuẩn không được âm." });
      if (courseEvaluations < 0 || courseEvaluations > 100) return res.status(400).send({ message: "Điểm đánh giá môn học phải từ 0 đến 100." });

      // Validate teachers
      if (!Array.isArray(teachers)) return res.status(400).send({ message: "Teachers phải là một mảng." });
      for (const teacher of teachers) {
        if (!teacher.teacherId) return res.status(400).send({ message: "Mỗi giảng viên phải có teacherId." });
        if (teacher.yearsExperience < 0) return res.status(400).send({
          message: "Số năm kinh nghiệm của giảng viên không được âm.",
        });
      }

      const majorHistory = new MajorHistory({
        majorId: major._id,
        year,
        studentsGraduated,
        studentsEnrolled,
        courseEvaluations,
        admissionScore,
        teachers,
      });
      await majorHistory.save();

      // Add majorHistory to major's history array
      major.history.push(majorHistory._id);
    }

    await major.save();
    res.status(201).send({ major });
  } catch (error) {
    res.status(400).send({ message: "Lỗi khi thêm ngành học.", error });
  }
};
// Update a major
export const updateMajor = async (req, res) => {
  const { name, description, universityId, history } = req.body;

  if (!name) {
    return res.status(400).send({ message: "Tên ngành học không được để trống." });
  }
  if (!description) {
    return res.status(400).send({ message: "Mô tả không được để trống." });
  }
  if (!universityId) {
    return res.status(400).send({ message: "Mã trường đại học không được để trống." });
  }

  // Check for duplicate major name
  const existingMajor = await Major.findOne({
    name: new RegExp(`^${name}$`, 'i'),
    universityId,
    _id: { $ne: req.params.id },
  });
  if (existingMajor) {
    return res.status(400).send({ message: "Tên ngành học đã tồn tại." });
  }

  // Check for duplicate years within the provided history array
  const years = history.map((entry) => entry.year);
  const duplicateYears = years.filter(
    (year, index) => years.indexOf(year) !== index
  );
  if (duplicateYears.length > 0) {
    return res.status(400).send({
      message: `Có nhiều mục trong mảng history có cùng năm: ${duplicateYears.join(", ")}`,
    });
  }

  // Check for duplicate teachers within each history entry
  for (const entry of history) {
    const teacherIds = entry.teachers.map((teacher) => teacher.teacherId.toString());
    const duplicateTeachers = teacherIds.filter(
      (id, index) => teacherIds.indexOf(id) !== index
    );
    if (duplicateTeachers.length > 0) {
      return res.status(400).send({
        message: `Có nhiều giảng viên trùng nhau trong năm ${entry.year}.`,
      });
    }
  }

  try {
    const major = await Major.findByIdAndUpdate(
      req.params.id,
      { name, description, universityId },
      { new: true, runValidators: true }
    );
    if (!major) {
      return res.status(404).send({ message: "Ngành học không tồn tại." });
    }

    // Delete all existing history for the major
    await MajorHistory.deleteMany({ majorId: req.params.id });

    // Add updated history
    const majorHistoryEntries = [];
    for (const entry of history) {
      const {
        year,
        studentsGraduated,
        studentsEnrolled,
        courseEvaluations,
        admissionScore,
        teachers,
      } = entry;

      if (!year) {
        return res.status(400).send({ message: "Năm không được để trống." });
      }
      if (studentsGraduated === "" || studentsGraduated < 0) {
        return res.status(400).send({ message: studentsGraduated === "" ? "Số sinh viên tốt nghiệp không được để trống." : "Số sinh viên tốt nghiệp không được âm." });
      }
      if (studentsEnrolled === "" || studentsEnrolled < 0) {
        return res.status(400).send({ message: studentsEnrolled === "" ? "Số sinh viên nhập học không được để trống." : "Số sinh viên nhập học không được âm." });
      }
      if (admissionScore === "" || admissionScore < 0) {
        return res.status(400).send({ message: admissionScore === "" ? "Điểm chuẩn không được để trống." : "Điểm chuẩn không được âm." });
      }
      if (courseEvaluations === "" || courseEvaluations < 0 || courseEvaluations > 100) {
        return res.status(400).send({ message: courseEvaluations === "" ? "Điểm đánh giá môn học không được để trống." : "Điểm đánh giá môn học phải từ 0 đến 100." });
      }

      // Validate teachers
      if (!Array.isArray(teachers)) {
        return res.status(400).send({ message: "Teachers phải là một mảng." });
      }
      for (const teacher of teachers) {
        if (!teacher.teacherId) {
          return res.status(400).send({ message: "Mỗi giảng viên phải có teacherId." });
        }
        if (teacher.yearsExperience === "" || teacher.yearsExperience < 0) {
          return res.status(400).send({
            message: teacher.yearsExperience === "" ? "Số năm kinh nghiệm không được để trống." : "Số năm kinh nghiệm của giảng viên không được âm.",
          });
        }
      }

      const majorHistory = new MajorHistory({
        majorId: req.params.id,
        year,
        studentsGraduated,
        studentsEnrolled,
        courseEvaluations,
        admissionScore,
        teachers,
      });
      await majorHistory.save();
      majorHistoryEntries.push(majorHistory._id);
    }

    // Update major with new history
    major.history = majorHistoryEntries;
    await major.save();

    res.status(200).send({ major });
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Lỗi khi cập nhật ngành học.", error });
  }
};


// Get all majors
export const getMajors = async (req, res) => {
  try {
    const { name, year, universityId, teacherId } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name.trim(), $options: 'i' };
    }

    if (universityId) {
      query.universityId = universityId;
    }

    let majors = await Major.find(query)
      .populate({
        path: "history",
        populate: {
          path: "teachers.teacherId",
          select: "name email universityId yearsExperience certificates rating",
        },
      })
      .populate(
        "universityId",
        "name city address establishedYear admissionCode description website nationalRanking teachingStandards studentQuality facilitiesStandards"
      );

    if (year) {
      majors = majors.map(major => ({
        ...major._doc,
        history: major.history.filter(history => history.year.toString() === year),
      }));
    }

    if (teacherId) {
      majors = majors.filter(major =>
        major.history.some(history =>
          history.teachers.some(teacher => teacher.teacherId._id.toString() === teacherId)
        )
      );
    }

    res.status(200).send(majors);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy danh sách ngành học.", error });
  }
};
// Get major details by ID with populated history
export const getMajorDetails = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id)
      .populate({
        path: "history",
        populate: {
          path: "teachers.teacherId",
          select: "name email universityId yearsExperience certificates rating",
        },
      })
      .populate(
        "universityId",
        "name city address establishedYear admissionCode description website nationalRanking teachingStandards studentQuality facilitiesStandards"
      );

    if (!major) {
      return res.status(404).send({ message: "Ngành học không tồn tại." });
    }

    res.status(200).send(major);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy thông tin ngành học.", error });
  }
};



// Delete a major by ID
export const deleteMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndDelete(req.params.id);
    if (!major)
      return res.status(404).send({ message: "Ngành học không tồn tại." });

    await MajorHistory.deleteMany({ majorId: req.params.id });
    res
      .status(200)
      .send({ message: "Ngành học và toàn bộ lịch sử đã được xóa." });
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi xóa ngành học.", error });
  }
};

// Add a major history entry
export const addMajorHistory = async (req, res) => {
  const {
    year,
    studentsGraduated,
    studentsEnrolled,
    courseEvaluations,
    admissionScore,
    teachers,
  } = req.body;
  const { id } = req.params;

  if (!year)
    return res.status(400).send({ message: "Năm không được để trống." });
  if (studentsGraduated < 0)
    return res
      .status(400)
      .send({ message: "Số sinh viên tốt nghiệp không được âm." });
  if (studentsEnrolled < 0)
    return res
      .status(400)
      .send({ message: "Số sinh viên nhập học không được âm." });
  if (admissionScore < 0)
    return res.status(400).send({ message: "Điểm chuẩn không được âm." });
  if (courseEvaluations < 0 || courseEvaluations > 100)
    return res
      .status(400)
      .send({ message: "Điểm đánh giá môn học phải từ 0 đến 100." });

  try {
    const existingHistory = await MajorHistory.findOne({
      majorId: id,
      year: year,
    });
    if (existingHistory)
      return res
        .status(400)
        .send({ message: `Ngành học đã tồn tại trong năm ${year}.` });

    const majorHistory = new MajorHistory({
      majorId: id,
      year,
      studentsGraduated,
      studentsEnrolled,
      courseEvaluations,
      admissionScore,
      teachers,
    });
    await majorHistory.save();

    const major = await Major.findById(id);
    major.history.push(majorHistory._id);
    await major.save();

    res.status(201).send(majorHistory);
  } catch (error) {
    res.status(400).send({ message: "Lỗi khi thêm lịch sử ngành học.", error });
  }
};

// Get history for a specific major
export const getMajorHistories = async (req, res) => {
  try {
    const majorHistories = await MajorHistory.find({ majorId: req.params.id });
    res.status(200).send(majorHistories);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy lịch sử ngành học.", error });
  }
};

// Update a major history entry by ID
export const updateMajorHistory = async (req, res) => {
  const {
    studentsGraduated,
    studentsEnrolled,
    courseEvaluations,
    admissionScore,
    teachers,
  } = req.body;

  if (studentsGraduated < 0)
    return res
      .status(400)
      .send({ message: "Số sinh viên tốt nghiệp không được âm." });
  if (studentsEnrolled < 0)
    return res
      .status(400)
      .send({ message: "Số sinh viên nhập học không được âm." });
  if (admissionScore < 0)
    return res.status(400).send({ message: "Điểm chuẩn không được âm." });
  if (courseEvaluations < 0 || courseEvaluations > 100)
    return res
      .status(400)
      .send({ message: "Điểm đánh giá môn học phải từ 0 đến 100." });

  try {
    const majorHistory = await MajorHistory.findByIdAndUpdate(
      req.params.historyId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!majorHistory)
      return res
        .status(404)
        .send({ message: "Lịch sử ngành học không tồn tại." });
    res.status(200).send(majorHistory);
  } catch (error) {
    res
      .status(400)
      .send({ message: "Lỗi khi cập nhật lịch sử ngành học.", error });
  }
};

// Delete a major history entry by ID
export const deleteMajorHistory = async (req, res) => {
  try {
    const majorHistory = await MajorHistory.findByIdAndDelete(
      req.params.historyId
    );
    if (!majorHistory)
      return res
        .status(404)
        .send({ message: "Lịch sử ngành học không tồn tại." });

    const major = await Major.findById(majorHistory.majorId);
    major.history.pull(majorHistory._id);
    await major.save();

    res.status(200).send({ message: "Lịch sử ngành học đã được xóa." });
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi xóa lịch sử ngành học.", error });
  }
};
export const getUniqueMajorNames = (async (req, res) => {
  try {
    const majors = await Major.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $trim: { input: "$name" }
            }
          },
          name: { $first: "$name" }
        }
      },
      {
        $replaceRoot: {
          newRoot: { name: "$name" }
        }
      },
      { $sort: { name: 1 } } // Sort alphabetically
    ]);

    res.status(200).json(majors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

