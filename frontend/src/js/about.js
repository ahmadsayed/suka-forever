1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-about");
    const accountContainer = document.querySelector("#about-container");
    const sukas = [
        {
            brief: "A story from the Middleast",
            name: "Rema",
            image: "https://cloudflare-ipfs.com/ipfs/QmYJ1V7zVHGmZVBk5tRTbAbjLeptqSZ4ettJ8XUwshsoEa/reema_website_900_600.jpg",
            story: "Maqluba or Maqlooba is a traditional Iraqi, Lebanese, Palestinian, Jordanian, and Syrian dish served throughout the Levant. It consists of meat, rice, and fried vegetables placed in a pot which is flipped upside down when served, hence the name maqluba"
        },
        {
            brief: "A story from the India",
            name: "Muka",
            image: "https://cloudflare-ipfs.com/ipfs/QmYJ1V7zVHGmZVBk5tRTbAbjLeptqSZ4ettJ8XUwshsoEa/muka_website_900_600.jpg",
            story: "Diwali, Dewali, Divali, or Deepavali, also known as the Festival of Lights, related to Jain Diwali, Bandi Chhor Divas, Tihar, Swanti, Sohrai, and Bandna, is a Dharmic religious celebration and one of the most important festivals within Hinduism."
 
        },
        {
            brief: "A wild wild West",
            name: "Howdy",
            image: "https://cloudflare-ipfs.com/ipfs/QmYJ1V7zVHGmZVBk5tRTbAbjLeptqSZ4ettJ8XUwshsoEa/howdy_website_900_600.jpg",
            story: "Literature from that period (1563/87) includes the use of How-do, how-do and How as a greeting used by the Scottish when addressing Anglo settlers in greeting. The double form of the idiom is still found in parts of the American Southwest as Howdy, howdy. Without regard to etymological beginnings, the word is used as a greeting such as \"Hello\" and not, normally, as an inquiry."
 
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