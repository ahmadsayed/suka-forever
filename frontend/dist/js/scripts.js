/*!
* Start Bootstrap - Business Casual v7.0.8 (https://startbootstrap.com/theme/business-casual)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-business-casual/blob/master/LICENSE)
*/
/*!
* Start Bootstrap - Business Casual v7.0.8 (https://startbootstrap.com/theme/business-casual)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-business-casual/blob/master/LICENSE)
*/

function toggle() {
  var element = document.querySelector("#navbarSupportedContent");
  if (element.classList.contains("collapse")){
    document.querySelector("#navbarSupportedContent").classList.remove("collapse");

  } else {
    document.querySelector("#navbarSupportedContent").classList.add("collapse");

  }
}
window.addEventListener('DOMContentLoaded', event => {
  document.querySelector(".navbar-toggler").setAttribute("onclick", `toggle()`);
})

