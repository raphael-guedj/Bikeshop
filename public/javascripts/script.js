var stripe = Stripe(
  "pk_test_51HfMNlJwg74ZmQA5M58zX0txDg14oTnBkDgesju4UqzfVZVeq4w23rrlkQkEj84JKOQcZB3hB2fSgK3obg0Tdw6t00qUeiS75z"
);

var checkoutButton = document.getElementById("checkout-button");

checkoutButton.addEventListener("click", function () {
  fetch("/create-session", {
    method: "POST",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (session) {
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
      // If redirectToCheckout fails due to a browser or network
      // error, you should display the localized error message to your
      // customer using error.message.
      if (result.error) {
        alert(result.error.message);
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
});
