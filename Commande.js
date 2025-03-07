const mongoose = require("mongoose");
    const CommandeSchema = mongoose.Schema({
        produits: {
            type: [String],
            required : true,
        },
        email_utilisateur: {
            type : String,
            required : false,
        },
        prix_total: {
            type : Number,
            required : true,
        },
    },
    {
        timestamps : true,

    }
    );
module.exports = Commande = mongoose.model("commande", CommandeSchema);
