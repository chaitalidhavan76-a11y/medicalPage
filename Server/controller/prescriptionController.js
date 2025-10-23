import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { fileURLToPath } from "url";
import prescriptionModel from "../modal/prescriptionmodel.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/prescription");
await fs.mkdir(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const uniqueName = `${nameWithoutExt}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage }).single("prescriptionImage");

// Create a new prescription
export const createPrescription = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(400).json({ message: err.message });

        try {
            const { userId, medicines } = req.body;
            const prescriptionImage = req.file ? req.file.filename : null;

            const newPrescription = new prescriptionModel({
                userId,
                medicines,
                prescriptionImage
            });

            await newPrescription.save();

            return res.status(201).json({
                data: newPrescription,
                message: "Prescription added successfully",
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    });
};

// Get all prescriptions with user details
export const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find().populate("userId", "username email");
        return res.status(200).json({
            data: prescriptions,
            message: "Prescriptions retrieved successfully",
            path: "http://localhost:4000/uploads/prescription",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await prescriptionModel.findById(req.params.id).populate("userId", "username email");
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }
        res.status(200).json(prescription);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a prescription
export const updatePrescription = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(400).json({ message: err.message });

        try {
            const { userId, medicines } = req.body;
            const id = req.params.medicine_id;

            const existingPrescription = await prescriptionModel.findById(id);
            if (!existingPrescription) {
                return res.status(404).json({ message: "Prescription not found" });
            }

            let prescriptionImage = existingPrescription.prescriptionImage;

            // If new image is uploaded, delete the old one
            if (req.file) {
                prescriptionImage = req.file.filename;
                const oldImagePath = path.join(uploadDir, existingPrescription.prescriptionImage);
                try {
                    await fs.access(oldImagePath);
                    await fs.unlink(oldImagePath);
                } catch (error) {
                    console.log("Old image not found, skipping deletion");
                }
            }

            const updatedPrescription = await prescriptionModel.findByIdAndUpdate(
                id,
                { userId, medicines, prescriptionImage },
                { new: true }
            );

            return res.status(200).json({
                data: updatedPrescription,
                message: "Prescription updated successfully",
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
};

// Delete a prescription
export const deletePrescription = async (req, res) => {
    try {
        const prescription = await prescriptionModel.findByIdAndDelete(req.params.id);
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        // Delete associated image
        if (prescription.prescriptionImage) {
            const imagePath = path.join(uploadDir, prescription.prescriptionImage);
            try {
                await fs.access(imagePath);
                await fs.unlink(imagePath);
            } catch (error) {
                console.log("Image not found, skipping deletion");
            }
        }

        res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
