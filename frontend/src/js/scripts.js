/*!
* Start Bootstrap - Business Casual v7.0.8 (https://startbootstrap.com/theme/business-casual)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-business-casual/blob/master/LICENSE)
*/

function toggle() {
  var element = document.querySelector("#navbarSupportedContent");
  if (element.classList.contains("collapse")) {
    document.querySelector("#navbarSupportedContent").classList.remove("collapse");

  } else {
    document.querySelector("#navbarSupportedContent").classList.add("collapse");

  }
}
window.addEventListener('DOMContentLoaded', event => {
  document.querySelector(".navbar-toggler").setAttribute("onclick", `toggle()`);
})

//style="display: block; margin-top:2.4rem
function toggleHistory() {
  var element = document.querySelector("#history-group");
  if (element.classList.contains("open")) {
    document.querySelector("#drop-ipfs").style.display = "none";
    

  } else {
    document.querySelector("#drop-ipfs").style.display = "block";
    document.querySelector("#drop-ipfs").style.marginTop = "2.4rem";
  }
}


//style="display: block; margin-top:2.4rem
function toggleNetworks() {
  var element = document.querySelector("#network-group");
  if (element.classList.contains("open")) {
    document.querySelector("#drop-network").style.display = "none";
    

  } else {
    document.querySelector("#drop-network").style.display = "block";
    document.querySelector("#drop-network").style.marginTop = "2.4rem";
    document.querySelector("#drop-network").style.marginLeft = "-7.1rem";

  }
}