import express from "express";
import {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription,
} from "../controller/prescriptionController.js";

const router = express.Router();

router.post("/addprescription", createPrescription);
router.get("/allprescription", getAllPrescriptions);
router.get("/single/:id", getPrescriptionById);
router.put("/update/:medicine_id", updatePrescription);
router.delete("/delete/:id", deletePrescription);

export default router;
