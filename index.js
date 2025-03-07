const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Commande = require("./Commande");
const jwt = require('jsonwebtoken');
const isAuthenticated = require('./isAuthenticated');
const axios = require('axios');
app.use(express.json());




//connexion 
mongoose.connect('mongodb://localhost:27017/Store')
        .then(()=>{
          app.listen(4000, () => {
            console.log("port")
          })
          console.log('connexion reussi')
        }).catch(error=>{
          console.log(error)
        })

//calculer le prix 
function prixTotal(produits) {
     let total = 0;
        for (let t = 0; t < produits.length; ++t) {
            total += produits[t].prix;
        }
         console.log("prix total :" + total);
        return total;
    }


async function httpRequest(ids) {
      try {
          const URL = "http://127.0.0.1:3000/produit/acheter"
          const response = await axios.post(URL, { ids: ids }, {
          headers: {
            'Content-Type': 'application/json'
          }
          });
        
          return prixTotal(response.data);
    }catch (error) {
            console.error(error);
          }
}


   


    app.post('/commande/ajouter', isAuthenticated ,async (req, res) => {

      const { ids, email_utilisateur } = req.body;
      try {
          const total = await httpRequest(ids);
        
          //return res.status(200).json(total);
          const commande = await Commande.create({ produits: ids, email_utilisateur, prix_total: total });
  
          res.status(200).json(commande);
      } catch (error) {
          console.log(error.message);
          res.status(500).json({ message: error.message });
      }
  });
  

  // Route pour mettre à jour une commande
app.put('/commande/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { produits, email_utilisateur } = req.body;
  try {
      // Vérifier si la commande existe
      const commande = await Commande.findById(id);
      if (!commande) {
          return res.status(404).json({ message: 'Commande non trouvée' });
      }
      // Mettre à jour les détails de la commande
      commande.produits = produits;
      commande.email_utilisateur = email_utilisateur;
    
      await commande.save();
      res.status(200).json(commande);
  } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande :', error.message);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande' });
  }
});

// Route pour annuler une commande
app.delete('/commande/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
      // Vérifier si la commande existe
      const commande = await Commande.findById(id);
      if (!commande) {
          return res.status(404).json({ message: 'Commande non trouvée' });
      }
      // Supprimer la commande de la base de données
      await commande.remove();
      res.status(200).json({ message: 'Commande annulée avec succès' });
  } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande :', error.message);
      res.status(500).json({ message: 'Erreur lors de l\'annulation de la commande' });
  }
});

// Route pour récupérer toutes les commandes d'un utilisateur
app.get('/commandes/:email_utilisateur', isAuthenticated, async (req, res) => {
  const { email_utilisateur } = req.params;
  try {
      // Récupérer toutes les commandes de l'utilisateur
      const commandes = await Commande.find({ email_utilisateur });
      res.status(200).json(commandes);
  } catch (error) {
      console.error('Erreur lors de la récupération des commandes de l\'utilisateur :', error.message);
      res.status(500).json({ message: 'Erreur lors de la récupération des commandes de l\'utilisateur' });
  }
});
