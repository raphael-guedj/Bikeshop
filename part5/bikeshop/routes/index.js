var express = require("express");
var router = express.Router();

/* GET home page. */

var dataBike = [
  {
    nomVelo: "BIKO45",
    urlImage: "/images/bike-1.jpg",
    prix: 679,
  },
  {
    nomVelo: "ZOOK7",
    urlImage: "/images/bike-2.jpg",
    prix: 799,
  },
  {
    nomVelo: "LIK089",
    urlImage: "/images/bike-3.jpg",
    prix: 839,
  },
  {
    nomVelo: "GEW08",
    urlImage: "/images/bike-4.jpg",
    prix: 1249,
  },
  {
    nomVelo: "KIWIT",
    urlImage: "/images/bike-5.jpg",
    prix: 899,
  },
  {
    nomVelo: "NASAY",
    urlImage: "/images/bike-6.jpg",
    prix: 1399,
  },
];

//Route Index
router.get("/", function (req, res, next) {
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = [];
  }
  res.render("index", { dataBike: dataBike });
});

//Route panier
//creation route panier et ajout fonctionnalité buy
router.get("/shop", function (req, res, next) {
  req.query.quantite = 1;
  var exist = false;

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.dataCardBike[i].nomVelo === req.query.nomVelo) {
      exist = true;
      req.session.dataCardBike[i].quantite += 1;
    }
  }

  if (exist === false) {
    req.session.dataCardBike.push(req.query);
  }

  console.log(req.query);

  res.render("shop", { dataCardBike: req.session.dataCardBike });
});

//Route deleteShop
router.get("/delete", function (req, res, next) {
  console.log(req.query);
  req.session.dataCardBike.splice(req.query.id, 1);
  res.render("shop", { dataCardBike: req.session.dataCardBike });
});

//route update
router.post("/update", function (req, res) {
  req.session.dataCardBike[req.body.position].quantite = req.body.quantite;
  console.log(req.session.dataCardBike);
  res.render("shop", { dataCardBike: req.session.dataCardBike });
});

module.exports = router;
