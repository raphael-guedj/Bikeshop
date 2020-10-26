var express = require("express");
var router = express.Router();

const stripe = require("stripe")(
  "sk_test_51HfMNlJwg74ZmQA5wk1toLTGCSNTXeG5plRYf5lf3yBK6o7PwGlrWORQK0dPplUU5q2zx9am5jiPlxH3ySsIzIUz00TWM6PLJy"
);

/* GET home page. */

var dataBike = [
  {
    nomVelo: "BIKO45",
    urlImage: "/images/bike-1.jpg",
    prix: 679,
    mea: true,
  },
  {
    nomVelo: "ZOOK7",
    urlImage: "/images/bike-2.jpg",
    prix: 799,
    mea: true,
  },
  {
    nomVelo: "LIK089",
    urlImage: "/images/bike-3.jpg",
    prix: 839,
    mea: true,
  },
  {
    nomVelo: "GEW08",
    urlImage: "/images/bike-4.jpg",
    prix: 1249,
    mea: false,
  },
  {
    nomVelo: "KIWIT",
    urlImage: "/images/bike-5.jpg",
    prix: 899,
    mea: false,
  },
  {
    nomVelo: "NASAY",
    urlImage: "/images/bike-6.jpg",
    prix: 1399,
    mea: false,
  },
];

//Route Index
router.get("/", function (req, res, next) {
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = [];
    req.session.prixTotal = 0;
  }
  res.render("index", { dataBike: dataBike });
});

//Route panier
//creation route panier et ajout fonctionnalité buy
router.get("/shop", function (req, res, next) {
  req.query.quantite = 1;
  req.query.fraisdePort = 30;
  var exist = false;

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.dataCardBike[i].nomVelo === req.query.nomVelo) {
      exist = true;
      req.session.dataCardBike[i].quantite =
        Number(req.session.dataCardBike[i].quantite) + 1;
    }
  }

  if (exist === false) {
    console.log(req.query);
    req.session.dataCardBike.push(req.query);
  }

  //ajout du prix du velo à la variable prixTotal
  req.session.prixTotal += Number(req.query.prix);

  //Boucle pour recalculer les frais de port

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.prixTotal < 2000) {
      req.session.dataCardBike[i].fraisdePort = 30;
    } else if (req.session.prixTotal < 4000) {
      req.session.dataCardBike[i].fraisdePort = 30 / 2;
    } else {
      req.session.dataCardBike[i].fraisdePort = 0;
    }
  }

  res.render("shop", {
    dataCardBike: req.session.dataCardBike,
    prixTotal: req.session.prixTotal,
  });
});

//Route deleteShop
router.get("/delete", function (req, res, next) {
  console.log(req.query);
  console.log(req.session.dataCardBike);

  //mise à jour du prix total si on supprime une ligne entière (prix * quantité)
  req.session.prixTotal -=
    Number(req.session.dataCardBike[req.query.id].prix) *
    Number(req.session.dataCardBike[req.query.id].quantite);
  req.session.dataCardBike.splice(req.query.id, 1);

  //Boucle pour recalculer les frais de port

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.prixTotal < 2000) {
      req.session.dataCardBike[i].fraisdePort = 30;
    } else if (req.session.prixTotal < 4000) {
      req.session.dataCardBike[i].fraisdePort = 30 / 2;
    } else {
      req.session.dataCardBike[i].fraisdePort = 0;
    }
  }

  res.render("shop", {
    dataCardBike: req.session.dataCardBike,
    prixTotal: req.session.prixTotal,
  });
});

//route update
router.post("/update", function (req, res) {
  //mise à jour du prix si on update la quantité:  (prix * quantité - quantité originale)
  console.log(req.session.dataCardBike);
  req.session.prixTotal +=
    Number(req.session.dataCardBike[req.body.position].prix) *
    (Number(req.body.quantite) -
      Number(req.session.dataCardBike[req.body.position].quantite));

  //mise à jour des frais de port si on update la quantité:  (frais de port * quantité - quantité originale)
  req.session.fraisdePort +=
    req.session.fraisdePort *
    (Number(req.body.quantite) -
      Number(req.session.dataCardBike[req.body.position].quantite));

  req.session.dataCardBike[req.body.position].quantite = req.body.quantite;

  //Boucle pour recalculer les frais de port
  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.prixTotal < 2000) {
      req.session.dataCardBike[i].fraisdePort = 30;
    } else if (req.session.prixTotal < 4000) {
      req.session.dataCardBike[i].fraisdePort = 30 / 2;
    } else {
      req.session.dataCardBike[i].fraisdePort = 0;
    }
  }

  res.render("shop", {
    dataCardBike: req.session.dataCardBike,
    prixTotal: req.session.prixTotal,
  });
});

//route create session API

router.post("/create-session", async (req, res) => {
  var dataStripe = [];
  var fraisPort = [{ name: "test" }];
  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    dataStripe.push(
      {
        currency: "eur",
        name: req.session.dataCardBike[i].nomVelo,
        images: [
          "https://peaceful-shelf-10433.herokuapp.com/" +
            req.session.dataCardBike[i].urlImage,
        ],
        amount: req.session.dataCardBike[i].prix * 100,
        quantity: req.session.dataCardBike[i].quantite,
      },
      {
        currency: "eur",
        name: "Frais de Port",
        amount: req.session.dataCardBike[i].fraisdePort * 100,
        quantity: 1,
      }
    );
    console.log(dataStripe);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: dataStripe,
    mode: "payment",
    success_url: `http://127.0.0.1:3000/success`,
    cancel_url: `http://127.0.0.1:3000/cancel`,
  });
  res.json({ id: session.id });
});

router.get("/success", function (req, res, next) {
  res.render("success");
});

router.get("/cancel", function (req, res, next) {
  res.render("cancel");
});

module.exports = router;
