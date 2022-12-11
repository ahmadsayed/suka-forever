1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-about");
    const accountContainer = document.querySelector("#about-container");
    const sukas = [
        {
            brief: "A story from the Middleast",
            name: "Rema",
            image: "assets/img/rema.jpg",
            story: "Maqluba or Maqlooba is a traditional Iraqi, Lebanese, Palestinian, Jordanian, and Syrian dish served throughout the Levant. It consists of meat, rice, and fried vegetables placed in a pot which is flipped upside down when served, hence the name maqluba"
        },
        {
            brief: "A story from the India",
            name: "Muka",
            image: "assets/img/muka.jpg",
            story: "Diwali, Dewali, Divali, or Deepavali, also known as the Festival of Lights, related to Jain Diwali, Bandi Chhor Divas, Tihar, Swanti, Sohrai, and Bandna, is a Dharmic religious celebration and one of the most important festivals within Hinduism."
 
        }
    ]
    sukas.forEach(suka => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".product-item-img").src = suka.image;
        clone.querySelector(".section-heading-upper").textContent = suka.brief;
        clone.querySelector(".section-heading-lower").textContent = suka.name;
        clone.querySelector(".story").textContent = suka.story;
    
        accountContainer.appendChild(clone);
    })


})