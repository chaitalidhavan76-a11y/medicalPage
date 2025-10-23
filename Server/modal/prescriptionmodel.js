import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    prescriptionImage: {
        type: String,
        default: null,
    },
    medicines: [
        {
            name: {
                type: String,
                required: true,
            },
            dosage: {
                type: String,
            },
            frequency: {
                type: String,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Export the model
const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
