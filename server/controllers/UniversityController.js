import asyncHandler from "../middleware/asyncHandler.js";
import University from "../models/University.js";
import User from "../models/User.js";
import Major from "../models/Major.js";
import MajorHistory from "../models/MajorHistory.js";
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";

export const createUniversity = asyncHandler(async (req, res) => {
  const {
    name,
    city,
    address,
    establishedYear,
    admissionCode,
    description,
    website,
    nationalRanking,
    facilitiesStandards,
    logo,
  } = req.body;

  // Trim and validate input
  const trimmedName = name.trim();
  const lowerCaseName = trimmedName.toLowerCase();
  const trimmedCity = city.trim();
  const trimmedAddress = address.trim();
  const trimmedAdmissionCode = admissionCode.trim();
  const trimmedDescription = description.trim();
  const trimmedWebsite = website ? website.trim() : "";
  const trimmedNationalRanking = nationalRanking.trim();
  const trimmedFacilitiesStandards = facilitiesStandards.trim();
  const trimmedLogo = logo ? logo.trim() : "";

  if (!trimmedName)
    return res.status(400).json({ message: "Tên trường không được để trống." });
  if (!trimmedCity)
    return res.status(400).json({ message: "Thành phố không được để trống." });
  if (!trimmedAddress)
    return res.status(400).json({ message: "Địa chỉ không được để trống." });
  if (!establishedYear)
    return res
      .status(400)
      .json({ message: "Năm thành lập không được để trống." });
  if (establishedYear <= 0 || establishedYear > new Date().getFullYear()) {
    return res.status(400).json({
      message:
        "Năm thành lập phải là số nguyên dương và không được là năm tương lai.",
    });
  }
  if (!trimmedAdmissionCode)
    return res
      .status(400)
      .json({ message: "Mã tuyển sinh không được để trống." });
  if (!trimmedDescription)
    return res.status(400).json({ message: "Mô tả không được để trống." });
  if (!trimmedNationalRanking)
    return res
      .status(400)
      .json({ message: "Xếp hạng quốc gia không được để trống." });
  if (
    trimmedFacilitiesStandards === "" ||
    trimmedFacilitiesStandards < 0 ||
    trimmedFacilitiesStandards > 100
  ) {
    return res
      .status(400)
      .json({ message: "Điểm cơ sở vật chất phải từ 0 đến 100." });
  }

  // Check if university with the same name already exists
  const existingUniversity = await University.findOne({
    name: new RegExp("^" + lowerCaseName + "$", "i"),
  });
  if (existingUniversity) {
    return res.status(400).json({ message: "Tên trường đã tồn tại." });
  }

  try {
    const university = new University({
      name: trimmedName,
      city: trimmedCity,
      address: trimmedAddress,
      establishedYear,
      admissionCode: trimmedAdmissionCode,
      description: trimmedDescription,
      website: trimmedWebsite,
      nationalRanking: trimmedNationalRanking,
      facilitiesStandards: trimmedFacilitiesStandards,
      logo: trimmedLogo,
    });

    await university.save();
    res.status(201).json(university);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const updateUniversity = asyncHandler(async (req, res) => {
  const {
    name,
    city,
    address,
    establishedYear,
    admissionCode,
    description,
    website,
    nationalRanking,
    facilitiesStandards,
    logo,
  } = req.body;

  const { id } = req.params;

  // Trim and validate input
  const trimmedName = name.trim();
  const lowerCaseName = trimmedName.toLowerCase();
  const trimmedCity = city.trim();
  const trimmedAddress = address.trim();
  const trimmedAdmissionCode = admissionCode.trim();
  const trimmedDescription = description.trim();
  const trimmedWebsite = website ? website.trim() : "";
  const trimmedNationalRanking = nationalRanking;
  const trimmedFacilitiesStandards = facilitiesStandards;
  const trimmedLogo = logo ? logo.trim() : "";

  if (!trimmedName)
    return res.status(400).json({ message: "Tên trường không được để trống." });
  if (!trimmedCity)
    return res.status(400).json({ message: "Thành phố không được để trống." });
  if (!trimmedAddress)
    return res.status(400).json({ message: "Địa chỉ không được để trống." });
  if (!establishedYear)
    return res
      .status(400)
      .json({ message: "Năm thành lập không được để trống." });
  if (establishedYear <= 0 || establishedYear > new Date().getFullYear()) {
    return res.status(400).json({
      message:
        "Năm thành lập phải là số nguyên dương và không được là năm tương lai.",
    });
  }
  if (!trimmedAdmissionCode)
    return res
      .status(400)
      .json({ message: "Mã tuyển sinh không được để trống." });
  if (!trimmedDescription)
    return res.status(400).json({ message: "Mô tả không được để trống." });
  if (!trimmedNationalRanking)
    return res
      .status(400)
      .json({ message: "Xếp hạng quốc gia không được để trống." });
  if (
    trimmedFacilitiesStandards === "" ||
    trimmedFacilitiesStandards < 0 ||
    trimmedFacilitiesStandards > 100
  ) {
    return res
      .status(400)
      .json({ message: "Điểm cơ sở vật chất phải từ 0 đến 100." });
  }

  // Check if university with the same name already exists (excluding current university)
  const existingUniversity = await University.findOne({
    name: new RegExp("^" + lowerCaseName + "$", "i"),
    _id: { $ne: id },
  });
  if (existingUniversity) {
    return res.status(400).json({ message: "Tên trường đã tồn tại." });
  }

  try {
    const updatedUniversity = await University.findByIdAndUpdate(
      id,
      {
        name: trimmedName,
        city: trimmedCity,
        address: trimmedAddress,
        establishedYear,
        admissionCode: trimmedAdmissionCode,
        description: trimmedDescription,
        website: trimmedWebsite,
        nationalRanking: trimmedNationalRanking,
        facilitiesStandards: trimmedFacilitiesStandards,
        logo: trimmedLogo,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUniversity) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy trường đại học." });
    }

    res.status(200).json(updatedUniversity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all Universities
const getUniversities = asyncHandler(async (req, res) => {
  try {
    const name = req.query.name?.trim();
    const city = req.query.city?.trim();
    const sort = req.query.sort;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (city) {
      filter.city = city;
    }

    // Sort
    let sortOrder = {};
    if (sort) {
      sortOrder.nationalRanking = sort === "asc" ? 1 : -1;
    }
    // Fetch universities based on the filter and sort conditions
    const universities = await University.find(filter).sort(sortOrder);
    res.status(200).json(universities);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single University by ID
const getUniversityById = asyncHandler(async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json(university);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a University by ID
// const updateUniversity = asyncHandler(async (req, res) => {
//   try {
//     const university = await University.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     if (!university) {
//       return res.status(404).json({ message: "University not found" });
//     }
//     res.status(200).json(university);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Delete a University by ID
const deleteUniversity = asyncHandler(async (req, res) => {
  try {
    // Check if there are users associated with the university
    const users = await User.find({ universityId: req.params.id });
    if (users.length > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa vì có người dùng đang liên kết với trường đại học này.",
      });
    }

    // Check if there are majors associated with the university
    const majors = await Major.find({ universityId: req.params.id });
    if (majors.length > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa vì có ngành học đang liên kết với trường đại học này.",
      });
    }

    // Delete the university if no associations are found
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "Không tìm thấy trường đại học" });
    }

    res.status(200).json({ message: "Xóa trường đại học thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
export const getRanking = async (req, res) => {
  try {
    const { name, year, majorName, sort, city, facultyQuality ,userId } = req.query;
    let sortField = "",
      sortOrder = "";

    // Xử lý tham số sort
    if (sort) {
      [sortField, sortOrder] = sort.split(" ");
    }

    // Tạo query để tìm các trường đại học
    const query = {};
    if (name) {
      query.name = { $regex: new RegExp(name, "i") }; // Tìm kiếm tên trường không phân biệt hoa thường
    }
    if (city) {
      query.city = { $regex: new RegExp(city, "i") }; // Tìm kiếm theo thành phố
    }

    const yearFilter = year ? { year: parseInt(year) } : {};

    // Lấy danh sách các trường đại học thỏa mãn điều kiện
    const universities = await University.find(query).lean();
    const universityIds = universities.map((univ) => univ._id);

    // Tạo filter cho major
    // const majorFilter = { universityId: { $in: universityIds } };
    // if (majorName) {
    //   majorFilter.name = { $regex: new RegExp(majorName, 'i') };
    // }

    // const majorIds = await Major.find(majorFilter).distinct('_id');

    // Tính toán điểm trung bình
    const results = await Promise.all(
      universities.map(async (univ) => {
        const majorFilter = { universityId: univ._id };
        if (majorName) {
          majorFilter.name = { $regex: new RegExp(majorName, "i") };
        }

        const majorIds = await Major.find(majorFilter).distinct("_id");
        const majorHistories = await MajorHistory.find({
          majorId: { $in: majorIds },
          ...yearFilter,
        }).populate("majorId");

        // console.log(yearFilter)
        // console.log(majorHistories)

        let totalMajorScore = 0;
        let totalTeacherScore = 0;
        let majorCount = 0;
        let teacherCount = 0;
        let totalTeacherRating = 0;

        for (const history of majorHistories) {
          if (history.majorId.universityId.toString() === univ._id.toString()) {
            if (
              !majorName ||
              history.majorId.name.toLowerCase() ===
                majorName.trim().toLowerCase()
            ) {
              majorCount++;
              totalMajorScore += history.courseEvaluations;

              for (const teacher of history.teachers) {
                teacherCount++;
                totalTeacherScore += teacher.yearsExperience;

                const teacherInfo = await User.findById(
                  teacher.teacherId
                ).select("rating");
                if (teacherInfo) {
                  totalTeacherRating += teacherInfo.rating;
                }
              }
            }
          }
        }

         // Kiểm tra nếu có userId và trường có trong danh sách yêu thích của user
         let isLike = false;
         if (userId) {
           const user = await User.findById(userId).select('likedUniversities');
           if (user && user.likedUniversities.includes(univ._id)) {
             isLike = true;
           }
         }
        return {
          ...univ,
          averageMajorScore: majorCount ? totalMajorScore / majorCount : 0,
          averageTeacherScore: teacherCount
            ? totalTeacherScore / teacherCount
            : 0,
          averageTeacherRating: teacherCount
            ? totalTeacherRating / teacherCount
            : 0,
          have: (majorName && majorHistories.length === 0) ? false : true,
          isLike
        };
      })
    );

    // Lọc các trường không thỏa mãn điều kiện
    const filteredResults = results.filter((univ) => {
      if ( !univ.have) {
        return false;
      }
      if (facultyQuality) {
        const isMapRating =
          (facultyQuality === "1" &&
            univ.averageTeacherRating >= 1 &&
            univ.averageTeacherRating <= 3) ||
          (facultyQuality === "3" &&
            univ.averageTeacherRating >= 4 &&
            univ.averageTeacherRating <= 5);
        return isMapRating;
      }
      return true;
    });

    // Sắp xếp kết quả
    if (sortField) {
      filteredResults.sort((a, b) => {
        if (sortField === "rank") {
          return sortOrder === "desc"
            ? a.nationalRanking - b.nationalRanking
            : b.nationalRanking - a.nationalRanking;
        } else if (sortField === "teacher") {
          return sortOrder === "asc"
            ? a.averageTeacherScore - b.averageTeacherScore
            : b.averageTeacherScore - a.averageTeacherScore;
        } else if (sortField === "major") {
          return sortOrder === "asc"
            ? a.averageMajorScore - b.averageMajorScore
            : b.averageMajorScore - a.averageMajorScore;
        } else if (sortField === "teacherRating") {
          return sortOrder === "asc"
            ? a.averageTeacherRating - b.averageTeacherRating
            : b.averageTeacherRating - a.averageTeacherRating;
        }
      });
    }

    res.json(filteredResults);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Lỗi khi lấy dữ liệu xếp hạng." });
  }
};


export const getStats = async (req, res) => {
  const { universityId, startYear, endYear, majorId } = req.query;

  try {
    const years = [];
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      years.push(year);
    }

    const majorDataPromises = years.map(async (year) => {
      const query = {
        year: parseInt(year),
      };

      if (majorId) {
        query.majorId = new mongoose.Types.ObjectId(majorId);
      } else {
        // Get all major IDs for the given university
        const majors = await Major.find({ universityId: new mongoose.Types.ObjectId(universityId) }).select('_id');
        const majorIds = majors.map(major => major._id);
        query.majorId = { $in: majorIds };
      }

      const majorHistories = await MajorHistory.find(query).populate('majorId');

      let totalMajorScore = 0;
      let totalTeacherScore = 0;
      let totalTeacherRating = 0;
      let totalStudentsGraduated = 0;
      let totalStudentsEnrolled = 0;
      let majorCount = 0;
      let teacherCount = 0;

      for (const history of majorHistories) {
        majorCount++;
        totalMajorScore += history.courseEvaluations;
        totalStudentsGraduated += history.studentsGraduated;
        totalStudentsEnrolled += history.studentsEnrolled;

        for (const teacher of history.teachers) {
          teacherCount++;
          totalTeacherScore += teacher.yearsExperience;

          const teacherInfo = await User.findById(teacher.teacherId).select('rating');
          if (teacherInfo) {
            totalTeacherRating += teacherInfo.rating;
          }
        }
      }

      return {
        year,
        averageMajorScore: majorCount ? parseFloat((totalMajorScore / majorCount).toFixed(1)) : 0,
        averageTeacherScore: teacherCount ? parseFloat((totalTeacherScore / teacherCount).toFixed(1)) : 0,
        averageTeacherRating: teacherCount ? parseFloat((totalTeacherRating / teacherCount).toFixed(1)) : 0,
        totalStudentsGraduated: totalStudentsGraduated ? Math.round(totalStudentsGraduated) : 0,
        totalStudentsEnrolled: totalStudentsEnrolled ? Math.round(totalStudentsEnrolled) : 0,
      };
    });

    const majorData = await Promise.all(majorDataPromises);

    res.json(majorData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching university stats' });
  }
};

// TOtal
export const getTotalStaff = async (req, res) => {
  const { universityId } = req.query;

  if (!universityId) {
    return res.status(400).json({ message: 'University ID is required' });
  }

  try {
    const majors = await Major.find({ universityId: new mongoose.Types.ObjectId(universityId) }).lean();
  const totalMajors = majors.length;

  // Get all major IDs for the university
  const majorIds = majors.map(major => major._id);

  // Find all major histories for these majors
  const majorHistories = await MajorHistory.find({ majorId: { $in: majorIds } }).lean();

  // Calculate total teachers and average teacher rating
  let totalTeachers = 0;
  let totalTeacherRating = 0;
  let teacherCount = 0;

  for (const history of majorHistories) {
    totalTeachers += history.teachers.length;

    for (const teacher of history.teachers) {
      const teacherInfo = await User.findById(teacher.teacherId).select('rating').lean();
      if (teacherInfo && teacherInfo.rating) {
        totalTeacherRating += teacherInfo.rating;
        teacherCount++;
      }
    }
  }

  const averageTeacherRating = teacherCount ? (totalTeacherRating / teacherCount).toFixed(1) : 0;

  return res.status(200).json({
    totalMajors,
    totalTeachers,
    averageTeacherRating: parseFloat(averageTeacherRating),
  });
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching university stats' });
  }

}

export const getTotalAdmin = async (req, res) => {
  try {
    // Count the total number of users
    const totalUsers = await User.countDocuments({});
    
    // Count the total number of universities
    const totalUniversities = await University.countDocuments({});
    
    // Count the total number of blog posts
    const totalBlogPosts = await BlogPost.countDocuments({});

    return res.json({
      totalUsers,
      totalUniversities,
      totalBlogPosts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching statistics' });
  }
};

export const getTopUniversities = async (req, res) => {
  try {
    // Fetch top 10 universities based on national ranking
    const topUniversities = await University.find()
      .sort({ nationalRanking: 1 })
      .limit(10)
      .lean();

    return res.json(topUniversities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching top universities' });
  }
};

export default deleteUniversity;

export { getUniversities, getUniversityById, deleteUniversity };
