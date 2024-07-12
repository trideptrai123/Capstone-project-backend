import asyncHandler from "../middleware/asyncHandler.js";
import University from "../models/University.js";

// Create a new University
const createUniversity = asyncHandler(async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();
    res.status(201).json(university);
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
const updateUniversity = asyncHandler(async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json(university);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a University by ID
const deleteUniversity = asyncHandler(async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.status(200).json({ message: "University deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};
